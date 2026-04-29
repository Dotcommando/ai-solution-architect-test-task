import { Injectable } from '@nestjs/common';
import { PromptRepository } from '../../prompt/repositories/prompt.repository';
import { StepRepository } from '../../step/repositories/step.repository';
import { StepExecutorService } from '../../step/services/step-executor.service';
import {
  DEFAULT_VALIDATION_PROMPT,
  DEFAULT_VALIDATION_STEP,
  VALIDATION_STEP_CODE,
} from '../constants';
import {
  IRunValidationStepUseCaseRequest,
  IRunValidationStepUseCaseResponse,
  IValidationStepInput,
  IValidationStepOutput,
} from '../types';
import {
  buildDetectedHallucinations,
  buildDeterministicContractCompatibilityIssues,
  buildDeterministicValidationIssues,
  buildEmptyContractCompatibilityIssues,
  buildRegenerationReasons,
  buildStateCoverageSummary,
  buildTokenCompliance,
} from '../utils';

@Injectable()
export class RunValidationStepUseCase {
  constructor(
    private readonly stepRepository: StepRepository,
    private readonly promptRepository: PromptRepository,
    private readonly stepExecutorService: StepExecutorService,
  ) {}

  async execute(
    request: IRunValidationStepUseCaseRequest,
  ): Promise<IRunValidationStepUseCaseResponse> {
    const step =
      (await this.stepRepository.findActiveByCode(VALIDATION_STEP_CODE)) ??
      DEFAULT_VALIDATION_STEP;

    const prompt =
      (await this.promptRepository.findActiveByCodeAndVariant(
        step.promptCode,
        step.promptVariant,
      )) ?? DEFAULT_VALIDATION_PROMPT;

    const input = this.buildStepInput(request);
    const result = await this.stepExecutorService.execute<
      IValidationStepInput,
      IValidationStepOutput
    >({
      input,
      prompt,
      step,
    });
    const deterministicIssues = buildDeterministicValidationIssues(
      request.canonicalStateModel,
      input.deterministicSummary.detectedHallucinations,
      {
        coveredCount: input.deterministicSummary.stateCoverage.coveredCount,
        coveredStates: input.deterministicSummary.coveredStates,
        label: input.deterministicSummary.stateCoverage.label,
        missingStates: input.deterministicSummary.missingStates,
        requiredStates: input.deterministicSummary.requiredStates,
        totalCount: input.deterministicSummary.stateCoverage.totalCount,
      },
    );
    const regenerationReasons = buildRegenerationReasons(
      request.canonicalStateModel,
      request.designSystemContext,
      request.parsing,
      request.resolvingGaps,
      request.generatedCode,
      {
        coveredCount: input.deterministicSummary.stateCoverage.coveredCount,
        coveredStates: input.deterministicSummary.coveredStates,
        label: input.deterministicSummary.stateCoverage.label,
        missingStates: input.deterministicSummary.missingStates,
        requiredStates: input.deterministicSummary.requiredStates,
        totalCount: input.deterministicSummary.stateCoverage.totalCount,
      },
    );
    const deterministicContractCompatibilityIssues =
      buildDeterministicContractCompatibilityIssues(
        request.componentInterfaces,
        request.generatedCode,
      );

    return {
      attempts: result.attempts,
      output: {
        accessibilityScore: result.output.accessibilityScore,
        affectedComponentCodes: regenerationReasons.map((reason) => {
          return reason.componentCode;
        }),
        contractCompatibilityIssues: deduplicateStrings([
          ...deterministicContractCompatibilityIssues,
          ...buildEmptyContractCompatibilityIssues(request.componentInterfaces),
          ...result.output.contractCompatibilityIssues,
        ]),
        hallucinationsCaught: input.deterministicSummary.detectedHallucinations,
        isRegenerationRequired: regenerationReasons.length > 0,
        issuesFound: deduplicateStrings([
          ...deterministicIssues,
          ...deterministicContractCompatibilityIssues,
          ...result.output.issuesFound,
        ]),
        regenerationReasons,
        stateCoverage: input.deterministicSummary.stateCoverage,
        tokenCompliance: input.deterministicSummary.knownTokenCompliance,
      },
      rawOutput: result.rawOutput,
      tokenUsage: result.tokenUsage,
    };
  }

  private buildStepInput(
    request: IRunValidationStepUseCaseRequest,
  ): IValidationStepInput {
    const detectedHallucinations = buildDetectedHallucinations(
      request.designSystemContext,
      request.generatedCode,
    );
    const stateCoverageSummary = buildStateCoverageSummary(
      request.canonicalStateModel,
      request.parsing,
      request.gapAnalysis,
      request.resolvingGaps,
      request.generatedCode,
    );

    return {
      canonicalStateModel: request.canonicalStateModel,
      componentDescription: request.componentDescription,
      componentInterfaces: request.componentInterfaces,
      designSystemContext: request.designSystemContext,
      deterministicSummary: {
        coveredStates: stateCoverageSummary.coveredStates,
        detectedHallucinations,
        knownTokenCompliance: buildTokenCompliance(detectedHallucinations),
        missingStates: stateCoverageSummary.missingStates,
        requiredStates: stateCoverageSummary.requiredStates,
        stateCoverage: {
          coveredCount: stateCoverageSummary.coveredCount,
          label: stateCoverageSummary.label,
          totalCount: stateCoverageSummary.totalCount,
        },
      },
      e2eTests: request.e2eTests,
      generatedCode: request.generatedCode,
      gapAnalysis: request.gapAnalysis,
      parsing: request.parsing,
      resolvingGaps: request.resolvingGaps,
      unitTests: request.unitTests,
      userFlows: request.userFlows,
    };
  }
}

function deduplicateStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}
