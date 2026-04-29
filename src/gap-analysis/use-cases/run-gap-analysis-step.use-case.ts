import { Injectable } from '@nestjs/common';
import { PromptRepository } from '../../prompt/repositories/prompt.repository';
import { StepRepository } from '../../step/repositories/step.repository';
import { StepExecutorService } from '../../step/services/step-executor.service';
import {
  DEFAULT_GAP_ANALYSIS_PROMPT,
  DEFAULT_GAP_ANALYSIS_STEP,
  GAP_ANALYSIS_STEP_CODE,
} from '../constants';
import {
  IGapAnalysisStepInput,
  IGapAnalysisStepOutput,
  IRunGapAnalysisStepUseCaseRequest,
  IRunGapAnalysisStepUseCaseResponse,
} from '../types';

@Injectable()
export class RunGapAnalysisStepUseCase {
  constructor(
    private readonly stepRepository: StepRepository,
    private readonly promptRepository: PromptRepository,
    private readonly stepExecutorService: StepExecutorService,
  ) {}

  async execute(
    request: IRunGapAnalysisStepUseCaseRequest,
  ): Promise<IRunGapAnalysisStepUseCaseResponse> {
    const step =
      (await this.stepRepository.findActiveByCode(GAP_ANALYSIS_STEP_CODE)) ??
      DEFAULT_GAP_ANALYSIS_STEP;

    const prompt =
      (await this.promptRepository.findActiveByCodeAndVariant(
        step.promptCode,
        step.promptVariant,
      )) ?? DEFAULT_GAP_ANALYSIS_PROMPT;

    const input = this.buildStepInput(request);
    const result = await this.stepExecutorService.execute<
      IGapAnalysisStepInput,
      IGapAnalysisStepOutput
    >({
      input,
      prompt,
      step,
    });

    return {
      attempts: result.attempts,
      output: result.output,
      rawOutput: result.rawOutput,
      tokenUsage: result.tokenUsage,
    };
  }

  private buildStepInput(
    request: IRunGapAnalysisStepUseCaseRequest,
  ): IGapAnalysisStepInput {
    return {
      componentDescription: request.componentDescription,
      parsing: request.parsing,
    };
  }
}
