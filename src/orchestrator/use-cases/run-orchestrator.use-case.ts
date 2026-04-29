import { DEFAULT_CANONICAL_STATE_MODEL } from '../../canonical-state-model/constants';
import { Injectable } from '@nestjs/common';
import {
  COMPONENT_GENERATION_DEFAULT_FRAMEWORK,
  COMPONENT_GENERATION_DEFAULT_TEST_FRAMEWORK,
} from '../../component-generation/constants';
import { IComponentGenerationStepInput } from '../../component-generation/types';
import { RunComponentGenerationStepUseCase } from '../../component-generation/use-cases/run-component-generation-step.use-case';
import { RunComponentInterfacesStepUseCase } from '../../component-interfaces/use-cases/run-component-interfaces-step.use-case';
import { IComponentInterfacesStepInput } from '../../component-interfaces/types';
import { DEFAULT_DESIGN_SYSTEM_CONTEXT } from '../../design-system/constants';
import {
  E2E_TESTS_DEFAULT_TEST_FRAMEWORK,
  E2E_TESTS_FILE_SUFFIX,
} from '../../e2e-tests/constants';
import { IE2eTestsStepInput } from '../../e2e-tests/types';
import { RunE2eTestsStepUseCase } from '../../e2e-tests/use-cases/run-e2e-tests-step.use-case';
import { RunGapAnalysisStepUseCase } from '../../gap-analysis/use-cases/run-gap-analysis-step.use-case';
import { IGapAnalysisStepOutput } from '../../gap-analysis/types';
import { ORCHESTRATOR_MAX_VALIDATION_PASSES } from '../constants';
import { RunParsingStepUseCase } from '../../parsing/use-cases/run-parsing-step.use-case';
import { RunResolvingGapsStepUseCase } from '../../resolving-gaps/use-cases/run-resolving-gaps-step.use-case';
import { IResolvingGapsStepOutput } from '../../resolving-gaps/types';
import { RunRepository } from '../../run/repositories/run.repository';
import {
  IRunArtifacts,
  IRunDerivedData,
  IRunResult,
  IRunStepReport,
} from '../../run/types';
import {
  UNIT_TESTS_DEFAULT_FRAMEWORK,
  UNIT_TESTS_DEFAULT_PROJECT_DIRECTORY,
  UNIT_TESTS_DEFAULT_TEST_FRAMEWORK,
} from '../../unit-tests/constants';
import { IUnitTestsStepInput } from '../../unit-tests/types';
import { RunUnitTestsStepUseCase } from '../../unit-tests/use-cases/run-unit-tests-step.use-case';
import { RunUserFlowsStepUseCase } from '../../user-flows/use-cases/run-user-flows-step.use-case';
import { IRunValidationStepUseCaseRequest } from '../../validation/types';
import { RunValidationStepUseCase } from '../../validation/use-cases/run-validation-step.use-case';
import { COMPONENT_STATE_POLICY, IParsingStepOutput } from '../../types';
import type {
  IRunOrchestratorRequest,
  IRunOrchestratorResponse,
} from '../types';
import {
  appendStepReport,
  buildArtifactsWithGeneratedComponent,
  buildArtifactsFromParsing,
  buildArtifactsWithComponentInterface,
  buildArtifactsWithE2eTests,
  buildArtifactsWithGapAnalysis,
  buildArtifactsWithResolvingGaps,
  buildArtifactsWithUnitTest,
  buildArtifactsWithUserFlows,
  buildArtifactsWithValidation,
  buildComponentGenerationStageInput,
  buildComponentGenerationStepReport,
  buildComponentInterfacesStageInput,
  buildComponentInterfacesStepReport,
  buildComponentSourceFiles,
  buildComponentTestFilePath,
  buildDerivedDataFromParsing,
  buildE2eTestFilePath,
  buildE2eTestsStageInput,
  buildE2eTestsStepReport,
  buildGapAnalysisStepReport,
  buildParsingStepReport,
  buildProjectRootPath,
  buildRelatedComponentInterfacesForGeneration,
  buildRelatedComponentSourceFilesForGeneration,
  buildResolvingGapsStepReport,
  buildRunCompletedUpdate,
  buildRunFailedUpdate,
  buildRunResult,
  buildRunStepTokenUsage,
  buildRunStartedUpdate,
  buildTokenUsageTotals,
  buildUnitTestsStageInput,
  buildUnitTestsStepReport,
  buildUserFlowsStepReport,
  buildValidationStageInput,
  buildValidationFeedbackForComponent,
  buildValidationStepReport,
  findComponentInterface,
  findComponentSourceFile,
  findRelatedDumbComponentsForGeneration,
  findRootComponent,
  findUnitTestComponent,
  normalizeError,
  orderComponentsForInterfaces,
} from '../utils';

@Injectable()
export class RunOrchestratorUseCase {
  constructor(
    private readonly runRepository: RunRepository,
    private readonly runGapAnalysisStepUseCase: RunGapAnalysisStepUseCase,
    private readonly runParsingStepUseCase: RunParsingStepUseCase,
    private readonly runResolvingGapsStepUseCase: RunResolvingGapsStepUseCase,
    private readonly runUserFlowsStepUseCase: RunUserFlowsStepUseCase,
    private readonly runComponentInterfacesStepUseCase: RunComponentInterfacesStepUseCase,
    private readonly runUnitTestsStepUseCase: RunUnitTestsStepUseCase,
    private readonly runE2eTestsStepUseCase: RunE2eTestsStepUseCase,
    private readonly runComponentGenerationStepUseCase: RunComponentGenerationStepUseCase,
    private readonly runValidationStepUseCase: RunValidationStepUseCase,
  ) {}

  async run(
    request: IRunOrchestratorRequest,
  ): Promise<IRunOrchestratorResponse> {
    const runId = await this.createRun(request);

    try {
      await this.markRunAsStarted(runId);

      const parsingResult = await this.runParsingStage(request);
      const parsingArtifacts = buildArtifactsFromParsing(parsingResult.output);
      const parsingDerivedData = buildDerivedDataFromParsing(
        parsingResult.output,
      );
      const parsingStepReport = buildParsingStepReport(
        request,
        parsingResult.attempts,
        parsingResult.output,
        parsingResult.rawOutput,
        buildRunStepTokenUsage(parsingResult.tokenUsage),
      );

      await this.saveRunProgress(runId, parsingArtifacts, parsingDerivedData, [
        parsingStepReport,
      ]);

      const gapAnalysisResult = await this.runGapAnalysisStage(
        request,
        parsingResult.output,
      );
      const artifactsWithGapAnalysis = buildArtifactsWithGapAnalysis(
        parsingArtifacts,
        gapAnalysisResult.output,
      );
      const stepsWithGapAnalysis = appendStepReport(
        [parsingStepReport],
        buildGapAnalysisStepReport(
          request,
          gapAnalysisResult.attempts,
          gapAnalysisResult.output,
          gapAnalysisResult.rawOutput,
          buildRunStepTokenUsage(gapAnalysisResult.tokenUsage),
        ),
      );

      await this.saveRunProgress(
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
      const artifactsWithResolvingGaps = buildArtifactsWithResolvingGaps(
        artifactsWithGapAnalysis,
        resolvingGapsResult.output,
      );
      const stepsWithResolvingGaps = appendStepReport(
        stepsWithGapAnalysis,
        buildResolvingGapsStepReport(
          request,
          resolvingGapsResult.attempts,
          resolvingGapsResult.output,
          resolvingGapsResult.rawOutput,
          buildRunStepTokenUsage(resolvingGapsResult.tokenUsage),
        ),
      );

      await this.saveRunProgress(
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
      const artifactsWithUserFlows = buildArtifactsWithUserFlows(
        artifactsWithResolvingGaps,
        userFlowsResult.output,
      );
      const stepsWithUserFlows = appendStepReport(
        stepsWithResolvingGaps,
        buildUserFlowsStepReport(
          request,
          userFlowsResult.attempts,
          userFlowsResult.output,
          userFlowsResult.rawOutput,
          buildRunStepTokenUsage(userFlowsResult.tokenUsage),
        ),
      );

      await this.saveRunProgress(
        runId,
        artifactsWithUserFlows,
        parsingDerivedData,
        stepsWithUserFlows,
      );

      const orderedComponents = orderComponentsForInterfaces(
        parsingResult.output.components,
      );
      let artifactsWithComponentInterfaces = artifactsWithUserFlows;
      let stepsWithComponentInterfaces = stepsWithUserFlows;

      for (const targetComponent of orderedComponents) {
        const componentInterfacesInput = buildComponentInterfacesStageInput(
          request,
          parsingResult.output,
          gapAnalysisResult.output,
          resolvingGapsResult.output,
          targetComponent,
          userFlowsResult.output,
        );
        const componentInterfacesResult =
          await this.runComponentInterfacesStage(componentInterfacesInput);

        artifactsWithComponentInterfaces = buildArtifactsWithComponentInterface(
          artifactsWithComponentInterfaces,
          componentInterfacesResult.output,
        );
        stepsWithComponentInterfaces = appendStepReport(
          stepsWithComponentInterfaces,
          buildComponentInterfacesStepReport(
            componentInterfacesInput,
            componentInterfacesResult.attempts,
            componentInterfacesResult.output,
            componentInterfacesResult.rawOutput,
            stepsWithComponentInterfaces.length + 1,
            buildRunStepTokenUsage(componentInterfacesResult.tokenUsage),
          ),
        );

        await this.saveRunProgress(
          runId,
          artifactsWithComponentInterfaces,
          parsingDerivedData,
          stepsWithComponentInterfaces,
        );
      }

      const componentInterfaces =
        artifactsWithComponentInterfaces.componentInterfaces;

      if (componentInterfaces === null) {
        throw new Error(
          'Component interfaces artifact is required for unit tests',
        );
      }

      const projectRootPath = buildProjectRootPath(
        process.cwd(),
        UNIT_TESTS_DEFAULT_PROJECT_DIRECTORY,
      );
      const componentSourceFiles = buildComponentSourceFiles(
        projectRootPath,
        orderedComponents,
      );
      let artifactsWithUnitTests = artifactsWithComponentInterfaces;
      let stepsWithUnitTests = stepsWithComponentInterfaces;

      for (const targetComponent of orderedComponents) {
        const targetComponentInterface = findComponentInterface(
          componentInterfaces.components,
          targetComponent.code,
        );
        const targetSourceFilePath = findComponentSourceFile(
          componentSourceFiles,
          targetComponent.code,
        );
        const targetTestFilePath = buildComponentTestFilePath(
          projectRootPath,
          targetComponent,
        );
        const unitTestsInput = buildUnitTestsStageInput({
          componentDescription: request.componentDescription,
          componentInterfaces,
          componentSourceFiles,
          framework: UNIT_TESTS_DEFAULT_FRAMEWORK,
          gapAnalysis: gapAnalysisResult.output,
          parsing: parsingResult.output,
          projectRootPath,
          resolvingGaps: resolvingGapsResult.output,
          targetComponent,
          targetComponentInterface,
          targetSourceFilePath,
          targetTestFilePath,
          testFramework: UNIT_TESTS_DEFAULT_TEST_FRAMEWORK,
          userFlows: userFlowsResult.output,
        });
        const unitTestsResult = await this.runUnitTestsStage(unitTestsInput);

        artifactsWithUnitTests = buildArtifactsWithUnitTest(
          artifactsWithUnitTests,
          unitTestsResult.output,
        );
        stepsWithUnitTests = appendStepReport(
          stepsWithUnitTests,
          buildUnitTestsStepReport(
            unitTestsInput,
            unitTestsResult.attempts,
            unitTestsResult.output,
            unitTestsResult.rawOutput,
            stepsWithUnitTests.length + 1,
            buildRunStepTokenUsage(unitTestsResult.tokenUsage),
          ),
        );

        await this.saveRunProgress(
          runId,
          artifactsWithUnitTests,
          parsingDerivedData,
          stepsWithUnitTests,
        );
      }

      const unitTests = artifactsWithUnitTests.unitTests;

      if (unitTests === null) {
        throw new Error('Unit tests artifact is required for e2e tests');
      }

      const rootComponent = findRootComponent(parsingResult.output);

      if (rootComponent === null) {
        throw new Error('Root component is required for e2e tests');
      }

      const rootComponentInterface = findComponentInterface(
        componentInterfaces.components,
        rootComponent.code,
      );
      const rootSourceFilePath = findComponentSourceFile(
        componentSourceFiles,
        rootComponent.code,
      );
      const e2eTestFilePath = buildE2eTestFilePath(
        projectRootPath,
        rootComponent,
        E2E_TESTS_FILE_SUFFIX,
      );
      const e2eTestsInput = buildE2eTestsStageInput({
        componentDescription: request.componentDescription,
        componentInterfaces,
        componentSourceFiles,
        e2eTestFilePath,
        framework: UNIT_TESTS_DEFAULT_FRAMEWORK,
        gapAnalysis: gapAnalysisResult.output,
        parsing: parsingResult.output,
        projectRootPath,
        resolvingGaps: resolvingGapsResult.output,
        rootComponent,
        rootComponentInterface,
        rootSourceFilePath,
        testFramework: E2E_TESTS_DEFAULT_TEST_FRAMEWORK,
        unitTests,
        userFlows: userFlowsResult.output,
      });
      const e2eTestsResult = await this.runE2eTestsStage(e2eTestsInput);
      const artifactsWithE2eTests = buildArtifactsWithE2eTests(
        artifactsWithUnitTests,
        e2eTestsResult.output,
      );
      const stepsWithE2eTests = appendStepReport(
        stepsWithUnitTests,
        buildE2eTestsStepReport(
          e2eTestsInput,
          e2eTestsResult.attempts,
          e2eTestsResult.output,
          e2eTestsResult.rawOutput,
          stepsWithUnitTests.length + 1,
          buildRunStepTokenUsage(e2eTestsResult.tokenUsage),
        ),
      );

      await this.saveRunProgress(
        runId,
        artifactsWithE2eTests,
        parsingDerivedData,
        stepsWithE2eTests,
      );

      let artifactsWithGeneratedCode = artifactsWithE2eTests;
      let stepsWithGeneratedCode = stepsWithE2eTests;

      for (const targetComponent of orderedComponents) {
        const targetComponentInterface = findComponentInterface(
          componentInterfaces.components,
          targetComponent.code,
        );
        const targetUnitTests = findUnitTestComponent(
          unitTests.components,
          targetComponent.code,
        );
        const targetSourceFilePath = findComponentSourceFile(
          componentSourceFiles,
          targetComponent.code,
        );
        const relatedComponents = findRelatedDumbComponentsForGeneration(
          orderedComponents,
          targetComponent,
        );
        const relatedComponentInterfaces =
          buildRelatedComponentInterfacesForGeneration(
            componentInterfaces.components,
            relatedComponents,
          );
        const relatedComponentSourceFiles =
          buildRelatedComponentSourceFilesForGeneration(
            componentSourceFiles,
            relatedComponents,
          );
        const componentGenerationInput = buildComponentGenerationStageInput({
          canonicalStateModel: DEFAULT_CANONICAL_STATE_MODEL,
          componentDescription: request.componentDescription,
          designSystemContext: DEFAULT_DESIGN_SYSTEM_CONTEXT,
          e2eTests:
            targetComponent.statePolicy === COMPONENT_STATE_POLICY.SMART
              ? artifactsWithE2eTests.e2eTests
              : null,
          framework: COMPONENT_GENERATION_DEFAULT_FRAMEWORK,
          gapAnalysis: gapAnalysisResult.output,
          parsing: parsingResult.output,
          projectRootPath,
          relatedComponentInterfaces,
          relatedComponentSourceFiles,
          resolvingGaps: resolvingGapsResult.output,
          targetComponent,
          targetComponentInterface,
          targetSourceFilePath,
          targetUnitTests,
          testFramework: COMPONENT_GENERATION_DEFAULT_TEST_FRAMEWORK,
          validationFeedback: null,
          userFlows: userFlowsResult.output,
        });
        const componentGenerationResult =
          await this.runComponentGenerationStage(componentGenerationInput);

        artifactsWithGeneratedCode = buildArtifactsWithGeneratedComponent(
          artifactsWithGeneratedCode,
          COMPONENT_GENERATION_DEFAULT_FRAMEWORK,
          componentGenerationResult.output,
        );
        stepsWithGeneratedCode = appendStepReport(
          stepsWithGeneratedCode,
          buildComponentGenerationStepReport(
            componentGenerationInput,
            componentGenerationResult.attempts,
            componentGenerationResult.output,
            componentGenerationResult.rawOutput,
            stepsWithGeneratedCode.length + 1,
            buildRunStepTokenUsage(componentGenerationResult.tokenUsage),
          ),
        );

        await this.saveRunProgress(
          runId,
          artifactsWithGeneratedCode,
          parsingDerivedData,
          stepsWithGeneratedCode,
        );
      }

      let artifactsWithValidation = artifactsWithGeneratedCode;
      let stepsWithValidation = stepsWithGeneratedCode;

      for (
        let validationPass = 0;
        validationPass < ORCHESTRATOR_MAX_VALIDATION_PASSES;
        validationPass += 1
      ) {
        const generatedCode = artifactsWithValidation.generatedCode;

        if (generatedCode === null) {
          throw new Error('Generated code artifact is required for validation');
        }

        const validationInput = buildValidationStageInput({
          canonicalStateModel: DEFAULT_CANONICAL_STATE_MODEL,
          componentDescription: request.componentDescription,
          componentInterfaces,
          designSystemContext: DEFAULT_DESIGN_SYSTEM_CONTEXT,
          e2eTests: artifactsWithValidation.e2eTests,
          generatedCode,
          gapAnalysis: gapAnalysisResult.output,
          parsing: parsingResult.output,
          resolvingGaps: resolvingGapsResult.output,
          unitTests,
          userFlows: userFlowsResult.output,
        });
        const validationResult = await this.runValidationStage(validationInput);

        artifactsWithValidation = buildArtifactsWithValidation(
          artifactsWithValidation,
          validationResult.output,
        );
        stepsWithValidation = appendStepReport(
          stepsWithValidation,
          buildValidationStepReport(
            validationInput,
            validationResult.attempts,
            validationResult.output,
            validationResult.rawOutput,
            stepsWithValidation.length + 1,
            buildRunStepTokenUsage(validationResult.tokenUsage),
          ),
        );

        await this.saveRunProgress(
          runId,
          artifactsWithValidation,
          parsingDerivedData,
          stepsWithValidation,
        );

        if (!validationResult.output.isRegenerationRequired) {
          break;
        }

        if (validationPass === ORCHESTRATOR_MAX_VALIDATION_PASSES - 1) {
          throw new Error(
            'Validation did not converge within the allowed regeneration passes',
          );
        }

        const regenerationTargets = orderedComponents.filter((component) => {
          return validationResult.output.affectedComponentCodes.includes(
            component.code,
          );
        });

        if (regenerationTargets.length === 0) {
          throw new Error(
            'Validation requested regeneration but no matching components were found',
          );
        }

        for (const targetComponent of regenerationTargets) {
          const targetComponentInterface = findComponentInterface(
            componentInterfaces.components,
            targetComponent.code,
          );
          const targetUnitTests = findUnitTestComponent(
            unitTests.components,
            targetComponent.code,
          );
          const targetSourceFilePath = findComponentSourceFile(
            componentSourceFiles,
            targetComponent.code,
          );
          const relatedComponents = findRelatedDumbComponentsForGeneration(
            orderedComponents,
            targetComponent,
          );
          const relatedComponentInterfaces =
            buildRelatedComponentInterfacesForGeneration(
              componentInterfaces.components,
              relatedComponents,
            );
          const relatedComponentSourceFiles =
            buildRelatedComponentSourceFilesForGeneration(
              componentSourceFiles,
              relatedComponents,
            );
          const componentGenerationInput = buildComponentGenerationStageInput({
            canonicalStateModel: DEFAULT_CANONICAL_STATE_MODEL,
            componentDescription: request.componentDescription,
            designSystemContext: DEFAULT_DESIGN_SYSTEM_CONTEXT,
            e2eTests:
              targetComponent.statePolicy === COMPONENT_STATE_POLICY.SMART
                ? artifactsWithValidation.e2eTests
                : null,
            framework: COMPONENT_GENERATION_DEFAULT_FRAMEWORK,
            gapAnalysis: gapAnalysisResult.output,
            parsing: parsingResult.output,
            projectRootPath,
            relatedComponentInterfaces,
            relatedComponentSourceFiles,
            resolvingGaps: resolvingGapsResult.output,
            targetComponent,
            targetComponentInterface,
            targetSourceFilePath,
            targetUnitTests,
            testFramework: COMPONENT_GENERATION_DEFAULT_TEST_FRAMEWORK,
            validationFeedback: buildValidationFeedbackForComponent(
              validationResult.output.regenerationReasons,
              targetComponent.code,
            ),
            userFlows: userFlowsResult.output,
          });
          const componentGenerationResult =
            await this.runComponentGenerationStage(componentGenerationInput);

          artifactsWithValidation = buildArtifactsWithGeneratedComponent(
            artifactsWithValidation,
            COMPONENT_GENERATION_DEFAULT_FRAMEWORK,
            componentGenerationResult.output,
          );
          stepsWithValidation = appendStepReport(
            stepsWithValidation,
            buildComponentGenerationStepReport(
              componentGenerationInput,
              componentGenerationResult.attempts,
              componentGenerationResult.output,
              componentGenerationResult.rawOutput,
              stepsWithValidation.length + 1,
              buildRunStepTokenUsage(componentGenerationResult.tokenUsage),
            ),
          );

          await this.saveRunProgress(
            runId,
            artifactsWithValidation,
            parsingDerivedData,
            stepsWithValidation,
          );
        }
      }

      const result = buildRunResult(
        artifactsWithValidation,
        parsingDerivedData,
      );

      await this.saveRunProgress(
        runId,
        artifactsWithValidation,
        parsingDerivedData,
        stepsWithValidation,
        result,
      );

      await this.markRunAsCompleted(runId);

      return result;
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
    await this.runRepository.updateById(buildRunStartedUpdate(runId));
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
    parsing: IParsingStepOutput,
  ): ReturnType<RunGapAnalysisStepUseCase['execute']> {
    return this.runGapAnalysisStepUseCase.execute({
      componentDescription: request.componentDescription,
      parsing,
    });
  }

  private async runResolvingGapsStage(
    request: IRunOrchestratorRequest,
    parsing: IParsingStepOutput,
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
    parsing: IParsingStepOutput,
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

  private async runUnitTestsStage(
    input: IUnitTestsStepInput,
  ): ReturnType<RunUnitTestsStepUseCase['execute']> {
    return this.runUnitTestsStepUseCase.execute(input);
  }

  private async runE2eTestsStage(
    input: IE2eTestsStepInput,
  ): ReturnType<RunE2eTestsStepUseCase['execute']> {
    return this.runE2eTestsStepUseCase.execute(input);
  }

  private async runComponentGenerationStage(
    input: IComponentGenerationStepInput,
  ): ReturnType<RunComponentGenerationStepUseCase['execute']> {
    return this.runComponentGenerationStepUseCase.execute(input);
  }

  private async runValidationStage(
    input: IRunValidationStepUseCaseRequest,
  ): ReturnType<RunValidationStepUseCase['execute']> {
    return this.runValidationStepUseCase.execute(input);
  }

  private async saveRunProgress(
    runId: string,
    artifacts: IRunArtifacts,
    derivedData: IRunDerivedData,
    steps: IRunStepReport[],
    result?: IRunResult,
  ): Promise<void> {
    await this.runRepository.updateById({
      artifacts,
      derivedData,
      id: runId,
      result,
      steps,
      tokenUsageTotals: buildTokenUsageTotals(steps),
    });
  }

  private async markRunAsCompleted(runId: string): Promise<void> {
    await this.runRepository.updateById(buildRunCompletedUpdate(runId));
  }

  private async markRunAsFailed(runId: string, error: unknown): Promise<void> {
    const normalizedError = normalizeError(error);

    await this.runRepository.updateById(
      buildRunFailedUpdate(runId, normalizedError),
    );
  }
}
