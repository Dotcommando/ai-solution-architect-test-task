import { Injectable } from '@nestjs/common';
import { PromptRepository } from '../../prompt/repositories/prompt.repository';
import { StepRepository } from '../../step/repositories/step.repository';
import { StepExecutorService } from '../../step/services/step-executor.service';
import {
  DEFAULT_RESOLVING_GAPS_PROMPT,
  DEFAULT_RESOLVING_GAPS_STEP,
  RESOLVING_GAPS_STEP_CODE,
} from '../constants';
import {
  IResolvingGapsStepInput,
  IResolvingGapsStepOutput,
  IRunResolvingGapsStepUseCaseRequest,
  IRunResolvingGapsStepUseCaseResponse,
} from '../types';

@Injectable()
export class RunResolvingGapsStepUseCase {
  constructor(
    private readonly stepRepository: StepRepository,
    private readonly promptRepository: PromptRepository,
    private readonly stepExecutorService: StepExecutorService,
  ) {}

  async execute(
    request: IRunResolvingGapsStepUseCaseRequest,
  ): Promise<IRunResolvingGapsStepUseCaseResponse> {
    const step = await this.stepRepository.findActiveByCode(
      RESOLVING_GAPS_STEP_CODE,
    ) ?? DEFAULT_RESOLVING_GAPS_STEP;

    const prompt = await this.promptRepository.findActiveByCodeAndVariant(
      step.promptCode,
      step.promptVariant,
    ) ?? DEFAULT_RESOLVING_GAPS_PROMPT;

    const input = this.buildStepInput(request);
    const result = await this.stepExecutorService.execute<
      IResolvingGapsStepInput,
      IResolvingGapsStepOutput
    >({
      input,
      prompt,
      step,
    });

    return {
      attempts: result.attempts,
      output: result.output,
      rawOutput: result.rawOutput,
    };
  }

  private buildStepInput(
    request: IRunResolvingGapsStepUseCaseRequest,
  ): IResolvingGapsStepInput {
    return {
      componentDescription: request.componentDescription,
      gapAnalysis: request.gapAnalysis,
      parsing: request.parsing,
    };
  }
}
