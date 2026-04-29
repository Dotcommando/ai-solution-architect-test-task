import { Injectable } from '@nestjs/common';
import { RunComponentInterfacesStepUseCase } from '../../component-interfaces/use-cases/run-component-interfaces-step.use-case';
import {
  IComponentInterfacesStepInput,
  IComponentInterfacesStepOutput,
} from '../../component-interfaces/types';
import { RunGapAnalysisStepUseCase } from '../../gap-analysis/use-cases/run-gap-analysis-step.use-case';
import { IGapAnalysisStepOutput } from '../../gap-analysis/types';
import { RunResolvingGapsStepUseCase } from '../../resolving-gaps/use-cases/run-resolving-gaps-step.use-case';
import { IResolvingGapsStepOutput } from '../../resolving-gaps/types';
import { RUN_FINAL_COMPONENT_TYPE, RUN_STATUS, RUN_STEP_CODE, RUN_STEP_STATUS } from '../../run/constants';
import { RunRepository } from '../../run/repositories/run.repository';
import {
  IRunArtifacts,
  IRunDerivedData,
  IRunStepReport,
  IRunStepTokenUsage,
  IRunTokenUsageTotals,
} from '../../run/types';
import {
  COMPONENT_STATE_POLICY,
  IParsedComponent,
  UI_COMPONENT_TYPE,
} from '../../types';
import { RunUserFlowsStepUseCase } from '../../user-flows/use-cases/run-user-flows-step.use-case';
import { IUserFlowsStepOutput } from '../../user-flows/types';
import { RunParsingStepUseCase } from '../../parsing/use-cases/run-parsing-step.use-case';
import type { IRunOrchestratorRequest, IRunOrchestratorResponse } from '../types';

@Injectable()
export class RunOrchestratorUseCase {
  constructor(
    private readonly runRepository: RunRepository,
    private readonly runGapAnalysisStepUseCase: RunGapAnalysisStepUseCase,
    private readonly runParsingStepUseCase: RunParsingStepUseCase,
    private readonly runResolvingGapsStepUseCase: RunResolvingGapsStepUseCase,
    private readonly runUserFlowsStepUseCase: RunUserFlowsStepUseCase,
    private readonly runComponentInterfacesStepUseCase: RunComponentInterfacesStepUseCase,
  ) {}

  async run(
    request: IRunOrchestratorRequest,
  ): Promise<IRunOrchestratorResponse> {
    const runId = await this.createRun(request);

    try {
      await this.markRunAsStarted(runId);

      const parsingResult = await this.runParsingStage(request);
      const parsingArtifacts = this.buildArtifactsFromParsing(parsingResult.output);
      const parsingDerivedData = this.buildDerivedDataFromParsing(
        parsingResult.output,
      );
      const parsingStepReport = this.buildParsingStepReport(
        request,
        parsingResult.attempts,
        parsingResult.output,
        parsingResult.rawOutput,
      );

      await this.saveParsingStageResult(
        runId,
        parsingArtifacts,
        parsingDerivedData,
        [parsingStepReport],
      );

      const gapAnalysisResult = await this.runGapAnalysisStage(
        request,
        parsingResult.output,
      );
      const artifactsWithGapAnalysis = this.buildArtifactsWithGapAnalysis(
        parsingArtifacts,
        gapAnalysisResult.output,
      );
      const stepsWithGapAnalysis = this.appendStepReport(
        [parsingStepReport],
        this.buildGapAnalysisStepReport(
          request,
          gapAnalysisResult.attempts,
          gapAnalysisResult.output,
          gapAnalysisResult.rawOutput,
        ),
      );

      await this.saveGapAnalysisStageResult(
        runId,
        artifactsWithGapAnalysis,
        parsingDerivedData,
        stepsWithGapAnalysis,
      );

      const resolvingGapsResult = await this.runResolvingGapsStage(
        request,
        parsingResult.output,
        gapAnalysisResult.output,
      );
      const artifactsWithResolvingGaps = this.buildArtifactsWithResolvingGaps(
        artifactsWithGapAnalysis,
        resolvingGapsResult.output,
      );
      const stepsWithResolvingGaps = this.appendStepReport(
        stepsWithGapAnalysis,
        this.buildResolvingGapsStepReport(
          request,
          resolvingGapsResult.attempts,
          resolvingGapsResult.output,
          resolvingGapsResult.rawOutput,
        ),
      );

      await this.saveResolvingGapsStageResult(
        runId,
        artifactsWithResolvingGaps,
        parsingDerivedData,
        stepsWithResolvingGaps,
      );

      const userFlowsResult = await this.runUserFlowsStage(
        request,
        parsingResult.output,
        gapAnalysisResult.output,
        resolvingGapsResult.output,
      );
      const artifactsWithUserFlows = this.buildArtifactsWithUserFlows(
        artifactsWithResolvingGaps,
        userFlowsResult.output,
      );
      const stepsWithUserFlows = this.appendStepReport(
        stepsWithResolvingGaps,
        this.buildUserFlowsStepReport(
          request,
          userFlowsResult.attempts,
          userFlowsResult.output,
          userFlowsResult.rawOutput,
        ),
      );

      await this.saveUserFlowsStageResult(
        runId,
        artifactsWithUserFlows,
        parsingDerivedData,
        stepsWithUserFlows,
      );

      const orderedComponents = this.orderComponentsForInterfaces(
        parsingResult.output.components,
      );
      let artifactsWithComponentInterfaces = artifactsWithUserFlows;
      let stepsWithComponentInterfaces = stepsWithUserFlows;

      for (const targetComponent of orderedComponents) {
        const componentInterfacesInput = this.buildComponentInterfacesStageInput(
          request,
          parsingResult.output,
          gapAnalysisResult.output,
          resolvingGapsResult.output,
          targetComponent,
          userFlowsResult.output,
        );
        const componentInterfacesResult = await this.runComponentInterfacesStage(
          componentInterfacesInput,
        );

        artifactsWithComponentInterfaces = this.buildArtifactsWithComponentInterface(
          artifactsWithComponentInterfaces,
          componentInterfacesResult.output,
        );
        stepsWithComponentInterfaces = this.appendStepReport(
          stepsWithComponentInterfaces,
          this.buildComponentInterfacesStepReport(
            componentInterfacesInput,
            componentInterfacesResult.attempts,
            componentInterfacesResult.output,
            componentInterfacesResult.rawOutput,
            stepsWithComponentInterfaces.length + 1,
          ),
        );

        await this.saveComponentInterfacesStageResult(
          runId,
          artifactsWithComponentInterfaces,
          parsingDerivedData,
          stepsWithComponentInterfaces,
        );
      }

      // await this.runUnitTestsStage(runId);
      // await this.runE2eTestsStage(runId);
      // await this.runComponentGenerationStage(runId);
      // await this.runValidationStage(runId);

      await this.markRunAsCompleted(runId);

      return {
        attempts: parsingResult.attempts,
        input: {
          componentDescription: request.componentDescription,
          figmaUrl: request.figmaUrl,
          screenshotUrl: request.screenshotUrl,
        },
        parsing: parsingResult.output,
        rawOutput: parsingResult.rawOutput,
        runId,
      };
    } catch (error) {
      await this.markRunAsFailed(runId, error);
      throw error;
    }
  }

  private async createRun(request: IRunOrchestratorRequest): Promise<string> {
    return this.runRepository.create({
      input: {
        componentDescription: request.componentDescription,
        figmaUrl: request.figmaUrl,
        screenshotUrl: request.screenshotUrl,
      },
    });
  }

  private async markRunAsStarted(runId: string): Promise<void> {
    await this.runRepository.updateById({
      id: runId,
      startedAt: new Date(),
      status: RUN_STATUS.RUNNING,
    });
  }

  private async runParsingStage(
    request: IRunOrchestratorRequest,
  ): ReturnType<RunParsingStepUseCase['execute']> {
    return this.runParsingStepUseCase.execute({
      componentDescription: request.componentDescription,
      figmaUrl: request.figmaUrl,
      screenshotUrl: request.screenshotUrl,
    });
  }

  private async runGapAnalysisStage(
    request: IRunOrchestratorRequest,
    parsing: IRunOrchestratorResponse['parsing'],
  ): ReturnType<RunGapAnalysisStepUseCase['execute']> {
    return this.runGapAnalysisStepUseCase.execute({
      componentDescription: request.componentDescription,
      parsing,
    });
  }

  private async runResolvingGapsStage(
    request: IRunOrchestratorRequest,
    parsing: IRunOrchestratorResponse['parsing'],
    gapAnalysis: IGapAnalysisStepOutput,
  ): ReturnType<RunResolvingGapsStepUseCase['execute']> {
    return this.runResolvingGapsStepUseCase.execute({
      componentDescription: request.componentDescription,
      gapAnalysis,
      parsing,
    });
  }

  private async runUserFlowsStage(
    request: IRunOrchestratorRequest,
    parsing: IRunOrchestratorResponse['parsing'],
    gapAnalysis: IGapAnalysisStepOutput,
    resolvingGaps: IResolvingGapsStepOutput,
  ): ReturnType<RunUserFlowsStepUseCase['execute']> {
    return this.runUserFlowsStepUseCase.execute({
      componentDescription: request.componentDescription,
      gapAnalysis,
      parsing,
      resolvingGaps,
    });
  }

  private async runComponentInterfacesStage(
    input: IComponentInterfacesStepInput,
  ): ReturnType<RunComponentInterfacesStepUseCase['execute']> {
    return this.runComponentInterfacesStepUseCase.execute(input);
  }

  private buildArtifactsFromParsing(
    parsingOutput: IRunOrchestratorResponse['parsing'],
  ): IRunArtifacts {
    return {
      componentInterfaces: null,
      e2eTests: null,
      gapAnalysis: null,
      generatedCode: null,
      parsing: parsingOutput,
      resolvingGaps: null,
      unitTests: null,
      userFlows: null,
      validation: null,
    };
  }

  private buildArtifactsWithGapAnalysis(
    artifacts: IRunArtifacts,
    gapAnalysisOutput: IGapAnalysisStepOutput,
  ): IRunArtifacts {
    return {
      ...artifacts,
      gapAnalysis: gapAnalysisOutput,
    };
  }

  private buildArtifactsWithResolvingGaps(
    artifacts: IRunArtifacts,
    resolvingGapsOutput: IResolvingGapsStepOutput,
  ): IRunArtifacts {
    return {
      ...artifacts,
      resolvingGaps: resolvingGapsOutput,
    };
  }

  private buildArtifactsWithUserFlows(
    artifacts: IRunArtifacts,
    userFlowsOutput: IUserFlowsStepOutput,
  ): IRunArtifacts {
    return {
      ...artifacts,
      userFlows: userFlowsOutput,
    };
  }

  private buildArtifactsWithComponentInterface(
    artifacts: IRunArtifacts,
    componentInterfaceOutput: IComponentInterfacesStepOutput,
  ): IRunArtifacts {
    const existingComponents = artifacts.componentInterfaces?.components ?? [];

    return {
      ...artifacts,
      componentInterfaces: {
        components: [
          ...existingComponents,
          componentInterfaceOutput,
        ],
      },
    };
  }

  private buildDerivedDataFromParsing(
    parsingOutput: IRunOrchestratorResponse['parsing'],
  ): IRunDerivedData {
    const rootComponent = parsingOutput.components.find((component) => {
      return component.code === parsingOutput.rootComponentCode;
    }) ?? null;

    return {
      constraintDescriptions: parsingOutput.constraints.map((constraint) => {
        return constraint.description;
      }),
      extractionConstraints: parsingOutput.constraints,
      extractionSpecifiedStates: parsingOutput.specifiedStates,
      extractionTokenReferences: parsingOutput.tokenReferences,
      referencedTokenNames: parsingOutput.tokenReferences.map((tokenReference) => {
        return tokenReference.name;
      }),
      rootComponent,
      rootComponentName: rootComponent?.name ?? null,
      rootComponentType: this.mapRootComponentType(rootComponent?.type),
      specifiedStateNames: parsingOutput.specifiedStates.map((state) => {
        return state.name;
      }),
    };
  }

  private buildParsingStepReport(
    request: IRunOrchestratorRequest,
    attempts: number,
    output: IRunOrchestratorResponse['parsing'],
    rawOutput: string,
  ): IRunStepReport {
    const now = new Date();

    return {
      attempts,
      code: RUN_STEP_CODE.PARSING,
      completedAt: now,
      durationMs: null,
      errorDetails: null,
      errorMessage: null,
      inputJson: JSON.stringify(request),
      model: {
        model: null,
        provider: 'openai',
      },
      order: 1,
      outputJson: this.serializeOutputJson(output),
      prompt: {
        code: 'parsing',
        variant: 'control',
        version: null,
      },
      rawOutput,
      startedAt: now,
      status: RUN_STEP_STATUS.COMPLETED,
      targetComponentCode: null,
      tokenUsage: this.buildEmptyStepTokenUsage(),
    };
  }

  private buildGapAnalysisStepReport(
    request: IRunOrchestratorRequest,
    attempts: number,
    output: IGapAnalysisStepOutput,
    rawOutput: string,
  ): IRunStepReport {
    const now = new Date();

    return {
      attempts,
      code: RUN_STEP_CODE.GAP_ANALYSIS,
      completedAt: now,
      durationMs: null,
      errorDetails: null,
      errorMessage: null,
      inputJson: JSON.stringify({
        componentDescription: request.componentDescription,
      }),
      model: {
        model: null,
        provider: 'openai',
      },
      order: 2,
      outputJson: this.serializeOutputJson(output),
      prompt: {
        code: 'gap_analysis',
        variant: 'control',
        version: null,
      },
      rawOutput,
      startedAt: now,
      status: RUN_STEP_STATUS.COMPLETED,
      targetComponentCode: null,
      tokenUsage: this.buildEmptyStepTokenUsage(),
    };
  }

  private buildResolvingGapsStepReport(
    request: IRunOrchestratorRequest,
    attempts: number,
    output: IResolvingGapsStepOutput,
    rawOutput: string,
  ): IRunStepReport {
    const now = new Date();

    return {
      attempts,
      code: RUN_STEP_CODE.RESOLVING_GAPS,
      completedAt: now,
      durationMs: null,
      errorDetails: null,
      errorMessage: null,
      inputJson: JSON.stringify({
        componentDescription: request.componentDescription,
      }),
      model: {
        model: null,
        provider: 'openai',
      },
      order: 3,
      outputJson: this.serializeOutputJson(output),
      prompt: {
        code: 'resolving_gaps',
        variant: 'control',
        version: null,
      },
      rawOutput,
      startedAt: now,
      status: RUN_STEP_STATUS.COMPLETED,
      targetComponentCode: null,
      tokenUsage: this.buildEmptyStepTokenUsage(),
    };
  }

  private buildUserFlowsStepReport(
    request: IRunOrchestratorRequest,
    attempts: number,
    output: IUserFlowsStepOutput,
    rawOutput: string,
  ): IRunStepReport {
    const now = new Date();

    return {
      attempts,
      code: RUN_STEP_CODE.USER_FLOWS,
      completedAt: now,
      durationMs: null,
      errorDetails: null,
      errorMessage: null,
      inputJson: JSON.stringify({
        componentDescription: request.componentDescription,
      }),
      model: {
        model: null,
        provider: 'openai',
      },
      order: 4,
      outputJson: this.serializeOutputJson(output),
      prompt: {
        code: 'user_flows',
        variant: 'control',
        version: null,
      },
      rawOutput,
      startedAt: now,
      status: RUN_STEP_STATUS.COMPLETED,
      targetComponentCode: null,
      tokenUsage: this.buildEmptyStepTokenUsage(),
    };
  }

  private buildComponentInterfacesStepReport(
    input: IComponentInterfacesStepInput,
    attempts: number,
    output: IComponentInterfacesStepOutput,
    rawOutput: string,
    order: number,
  ): IRunStepReport {
    const now = new Date();

    return {
      attempts,
      code: RUN_STEP_CODE.COMPONENT_INTERFACES,
      completedAt: now,
      durationMs: null,
      errorDetails: null,
      errorMessage: null,
      inputJson: JSON.stringify(input),
      model: {
        model: null,
        provider: 'openai',
      },
      order,
      outputJson: this.serializeOutputJson(output),
      prompt: {
        code: 'component_interfaces',
        variant: 'control',
        version: null,
      },
      rawOutput,
      startedAt: now,
      status: RUN_STEP_STATUS.COMPLETED,
      targetComponentCode: output.componentCode,
      tokenUsage: this.buildEmptyStepTokenUsage(),
    };
  }

  private buildComponentInterfacesStageInput(
    request: IRunOrchestratorRequest,
    parsing: IRunOrchestratorResponse['parsing'],
    gapAnalysis: IGapAnalysisStepOutput,
    resolvingGaps: IResolvingGapsStepOutput,
    targetComponent: IParsedComponent,
    userFlows: IUserFlowsStepOutput,
  ): IComponentInterfacesStepInput {
    return {
      componentDescription: request.componentDescription,
      gapAnalysis,
      parsing,
      resolvingGaps,
      targetComponent,
      userFlows,
    };
  }

  private orderComponentsForInterfaces(
    components: IParsedComponent[],
  ): IParsedComponent[] {
    const dumbComponents = components.filter((component) => {
      return component.statePolicy === COMPONENT_STATE_POLICY.DUMB;
    });
    const smartComponents = components.filter((component) => {
      return component.statePolicy === COMPONENT_STATE_POLICY.SMART;
    });

    return [
      ...dumbComponents,
      ...smartComponents,
    ];
  }

  private appendStepReport(
    steps: IRunStepReport[],
    stepReport: IRunStepReport,
  ): IRunStepReport[] {
    return [
      ...steps,
      stepReport,
    ];
  }

  private async saveParsingStageResult(
    runId: string,
    artifacts: IRunArtifacts,
    derivedData: IRunDerivedData,
    steps: IRunStepReport[],
  ): Promise<void> {
    await this.runRepository.updateById({
      artifacts,
      derivedData,
      id: runId,
      steps,
      tokenUsageTotals: this.buildTokenUsageTotals(steps),
    });
  }

  private async saveResolvingGapsStageResult(
    runId: string,
    artifacts: IRunArtifacts,
    derivedData: IRunDerivedData,
    steps: IRunStepReport[],
  ): Promise<void> {
    await this.runRepository.updateById({
      artifacts,
      derivedData,
      id: runId,
      steps,
      tokenUsageTotals: this.buildTokenUsageTotals(steps),
    });
  }

  private async saveUserFlowsStageResult(
    runId: string,
    artifacts: IRunArtifacts,
    derivedData: IRunDerivedData,
    steps: IRunStepReport[],
  ): Promise<void> {
    await this.runRepository.updateById({
      artifacts,
      derivedData,
      id: runId,
      steps,
      tokenUsageTotals: this.buildTokenUsageTotals(steps),
    });
  }

  private async saveComponentInterfacesStageResult(
    runId: string,
    artifacts: IRunArtifacts,
    derivedData: IRunDerivedData,
    steps: IRunStepReport[],
  ): Promise<void> {
    await this.runRepository.updateById({
      artifacts,
      derivedData,
      id: runId,
      steps,
      tokenUsageTotals: this.buildTokenUsageTotals(steps),
    });
  }

  private async saveGapAnalysisStageResult(
    runId: string,
    artifacts: IRunArtifacts,
    derivedData: IRunDerivedData,
    steps: IRunStepReport[],
  ): Promise<void> {
    await this.runRepository.updateById({
      artifacts,
      derivedData,
      id: runId,
      steps,
      tokenUsageTotals: this.buildTokenUsageTotals(steps),
    });
  }

  private async markRunAsCompleted(runId: string): Promise<void> {
    await this.runRepository.updateById({
      completedAt: new Date(),
      id: runId,
      status: RUN_STATUS.COMPLETED,
    });
  }

  private async markRunAsFailed(
    runId: string,
    error: unknown,
  ): Promise<void> {
    const normalizedError = this.normalizeError(error);

    await this.runRepository.updateById({
      completedAt: new Date(),
      errorDetails: this.extractCauseMessage(normalizedError),
      errorMessage: normalizedError.message,
      id: runId,
      status: RUN_STATUS.FAILED,
    });
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    return new Error('Unknown orchestrator error');
  }

  private extractCauseMessage(error: Error): string | null {
    if (!(error.cause instanceof Error)) {
      return null;
    }

    return this.extractCauseMessage(error.cause) ?? error.cause.message;
  }

  private buildEmptyStepTokenUsage(): IRunStepTokenUsage {
    return {
      cachedInputTokens: null,
      inputTokens: null,
      outputTokens: null,
      reasoningTokens: null,
      totalTokens: null,
    };
  }

  private serializeOutputJson(output: object): string {
    return JSON.stringify(output);
  }

  private buildTokenUsageTotals(
    steps: IRunStepReport[],
  ): IRunTokenUsageTotals {
    return steps.reduce<IRunTokenUsageTotals>(
      (totals, step) => {
        return {
          cachedInputTokens:
            totals.cachedInputTokens + (step.tokenUsage.cachedInputTokens ?? 0),
          inputTokens:
            totals.inputTokens + (step.tokenUsage.inputTokens ?? 0),
          outputTokens:
            totals.outputTokens + (step.tokenUsage.outputTokens ?? 0),
          reasoningTokens:
            totals.reasoningTokens + (step.tokenUsage.reasoningTokens ?? 0),
          totalTokens:
            totals.totalTokens + (step.tokenUsage.totalTokens ?? 0),
        };
      },
      {
        cachedInputTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        reasoningTokens: 0,
        totalTokens: 0,
      },
    );
  }

  private mapRootComponentType(
    componentType: UI_COMPONENT_TYPE | undefined,
  ): RUN_FINAL_COMPONENT_TYPE | null {
    if (componentType === undefined) {
      return null;
    }

    switch (componentType) {
      case UI_COMPONENT_TYPE.CARD:
        return RUN_FINAL_COMPONENT_TYPE.CARD;
      case UI_COMPONENT_TYPE.FORM:
        return RUN_FINAL_COMPONENT_TYPE.FORM;
      case UI_COMPONENT_TYPE.MODAL:
        return RUN_FINAL_COMPONENT_TYPE.MODAL;
      case UI_COMPONENT_TYPE.PAGE:
        return RUN_FINAL_COMPONENT_TYPE.PAGE;
      case UI_COMPONENT_TYPE.TABLE:
        return RUN_FINAL_COMPONENT_TYPE.TABLE;
      default:
        return null;
    }
  }
}
