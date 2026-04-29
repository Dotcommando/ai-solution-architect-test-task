import { Injectable } from '@nestjs/common';
import { PromptRepository } from '../../prompt/repositories/prompt.repository';
import { StepRepository } from '../../step/repositories/step.repository';
import { StepExecutorService } from '../../step/services/step-executor.service';
import {
  COMPONENT_INTERFACES_STEP_CODE,
  DEFAULT_COMPONENT_INTERFACES_PROMPT,
  DEFAULT_COMPONENT_INTERFACES_STEP,
} from '../constants';
import {
  IComponentInterfacesStepInput,
  IComponentInterfacesStepOutput,
  IRunComponentInterfacesStepUseCaseRequest,
  IRunComponentInterfacesStepUseCaseResponse,
} from '../types';

@Injectable()
export class RunComponentInterfacesStepUseCase {
  constructor(
    private readonly stepRepository: StepRepository,
    private readonly promptRepository: PromptRepository,
    private readonly stepExecutorService: StepExecutorService,
  ) {}

  async execute(
    request: IRunComponentInterfacesStepUseCaseRequest,
  ): Promise<IRunComponentInterfacesStepUseCaseResponse> {
    const step = await this.stepRepository.findActiveByCode(
      COMPONENT_INTERFACES_STEP_CODE,
    ) ?? DEFAULT_COMPONENT_INTERFACES_STEP;

    const prompt = await this.promptRepository.findActiveByCodeAndVariant(
      step.promptCode,
      step.promptVariant,
    ) ?? DEFAULT_COMPONENT_INTERFACES_PROMPT;

    const input = this.buildStepInput(request);
    const result = await this.stepExecutorService.execute<
      IComponentInterfacesStepInput,
      IComponentInterfacesStepOutput
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
    request: IRunComponentInterfacesStepUseCaseRequest,
  ): IComponentInterfacesStepInput {
    return {
      componentDescription: request.componentDescription,
      gapAnalysis: request.gapAnalysis,
      parsing: request.parsing,
      resolvingGaps: request.resolvingGaps,
      targetComponent: request.targetComponent,
      userFlows: request.userFlows,
    };
  }
}
