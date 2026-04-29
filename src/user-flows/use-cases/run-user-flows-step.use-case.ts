import { Injectable } from '@nestjs/common';
import { PromptRepository } from '../../prompt/repositories/prompt.repository';
import { StepRepository } from '../../step/repositories/step.repository';
import { StepExecutorService } from '../../step/services/step-executor.service';
import {
  DEFAULT_USER_FLOWS_PROMPT,
  DEFAULT_USER_FLOWS_STEP,
  USER_FLOWS_STEP_CODE,
} from '../constants';
import {
  IRunUserFlowsStepUseCaseRequest,
  IRunUserFlowsStepUseCaseResponse,
  IUserFlowsStepInput,
  IUserFlowsStepOutput,
} from '../types';

@Injectable()
export class RunUserFlowsStepUseCase {
  constructor(
    private readonly stepRepository: StepRepository,
    private readonly promptRepository: PromptRepository,
    private readonly stepExecutorService: StepExecutorService,
  ) {}

  async execute(
    request: IRunUserFlowsStepUseCaseRequest,
  ): Promise<IRunUserFlowsStepUseCaseResponse> {
    const step =
      (await this.stepRepository.findActiveByCode(USER_FLOWS_STEP_CODE)) ??
      DEFAULT_USER_FLOWS_STEP;

    const prompt =
      (await this.promptRepository.findActiveByCodeAndVariant(
        step.promptCode,
        step.promptVariant,
      )) ?? DEFAULT_USER_FLOWS_PROMPT;

    const input = this.buildStepInput(request);
    const result = await this.stepExecutorService.execute<
      IUserFlowsStepInput,
      IUserFlowsStepOutput
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
    request: IRunUserFlowsStepUseCaseRequest,
  ): IUserFlowsStepInput {
    return {
      componentDescription: request.componentDescription,
      gapAnalysis: request.gapAnalysis,
      parsing: request.parsing,
      resolvingGaps: request.resolvingGaps,
    };
  }
}
