import { Injectable } from '@nestjs/common';
import { PromptRepository } from '../../prompt/repositories/prompt.repository';
import { IParsingStepInput, IParsingStepOutput } from '../../types';
import { StepRepository } from '../../step/repositories/step.repository';
import { StepExecutorService } from '../../step/services/step-executor.service';
import {
  DEFAULT_PARSING_PROMPT,
  DEFAULT_PARSING_STEP,
  PARSING_STEP_CODE,
} from '../constants';
import {
  IRunParsingStepUseCaseRequest,
  IRunParsingStepUseCaseResponse,
} from '../types';

@Injectable()
export class RunParsingStepUseCase {
  constructor(
    private readonly stepRepository: StepRepository,
    private readonly promptRepository: PromptRepository,
    private readonly stepExecutorService: StepExecutorService,
  ) {}

  async execute(
    request: IRunParsingStepUseCaseRequest,
  ): Promise<IRunParsingStepUseCaseResponse> {
    const step =
      (await this.stepRepository.findActiveByCode(PARSING_STEP_CODE)) ??
      DEFAULT_PARSING_STEP;

    const prompt =
      (await this.promptRepository.findActiveByCodeAndVariant(
        step.promptCode,
        step.promptVariant,
      )) ?? DEFAULT_PARSING_PROMPT;

    const input = this.buildStepInput(request);
    const result = await this.stepExecutorService.execute<
      IParsingStepInput,
      IParsingStepOutput
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
    request: IRunParsingStepUseCaseRequest,
  ): IParsingStepInput {
    return {
      componentDescription: request.componentDescription,
      figmaUrl: request.figmaUrl ?? null,
      screenshotUrl: request.screenshotUrl ?? null,
    };
  }
}
