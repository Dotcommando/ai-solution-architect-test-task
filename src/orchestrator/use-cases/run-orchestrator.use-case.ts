import { Injectable } from '@nestjs/common';
import { RUN_FINAL_COMPONENT_TYPE, RUN_STATUS, RUN_STEP_CODE, RUN_STEP_STATUS } from '../../run/constants';
import { RunRepository } from '../../run/repositories/run.repository';
import {
  IRunArtifacts,
  IRunDerivedData,
  IRunStepReport,
  IRunStepTokenUsage,
  IRunTokenUsageTotals,
} from '../../run/types';
import { UI_COMPONENT_TYPE } from '../../types';
import { RunParsingStepUseCase } from '../../parsing/use-cases/run-parsing-step.use-case';
import type { IRunOrchestratorRequest, IRunOrchestratorResponse } from '../types';

@Injectable()
export class RunOrchestratorUseCase {
  constructor(
    private readonly runRepository: RunRepository,
    private readonly runParsingStepUseCase: RunParsingStepUseCase,
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
        parsingResult.rawOutput,
      );

      await this.saveParsingStageResult(
        runId,
        parsingArtifacts,
        parsingDerivedData,
        [parsingStepReport],
      );

      // await this.runGapAnalysisStage(runId);
      // await this.runResolvingGapsStage(runId);
      // await this.runUserFlowsStage(runId);
      // await this.runComponentInterfacesStage(runId);
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
      outputJson: rawOutput,
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
