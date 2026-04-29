import { Injectable } from '@nestjs/common';
import { PromptRepository } from '../../prompt/repositories/prompt.repository';
import { StepRepository } from '../../step/repositories/step.repository';
import { StepExecutorService } from '../../step/services/step-executor.service';
import {
  COMPONENT_GENERATION_STEP_CODE,
  DEFAULT_COMPONENT_GENERATION_PROMPT,
  DEFAULT_COMPONENT_GENERATION_STEP,
} from '../constants';
import {
  IComponentGenerationStepInput,
  IComponentGenerationStepOutput,
  IRunComponentGenerationStepUseCaseRequest,
  IRunComponentGenerationStepUseCaseResponse,
} from '../types';

@Injectable()
export class RunComponentGenerationStepUseCase {
  constructor(
    private readonly stepRepository: StepRepository,
    private readonly promptRepository: PromptRepository,
    private readonly stepExecutorService: StepExecutorService,
  ) {}

  async execute(
    request: IRunComponentGenerationStepUseCaseRequest,
  ): Promise<IRunComponentGenerationStepUseCaseResponse> {
    const step =
      (await this.stepRepository.findActiveByCode(
        COMPONENT_GENERATION_STEP_CODE,
      )) ?? DEFAULT_COMPONENT_GENERATION_STEP;

    const prompt =
      (await this.promptRepository.findActiveByCodeAndVariant(
        step.promptCode,
        step.promptVariant,
      )) ?? DEFAULT_COMPONENT_GENERATION_PROMPT;

    const input = this.buildStepInput(request);
    const result = await this.stepExecutorService.execute<
      IComponentGenerationStepInput,
      IComponentGenerationStepOutput
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
    request: IRunComponentGenerationStepUseCaseRequest,
  ): IComponentGenerationStepInput {
    return {
      componentDescription: request.componentDescription,
      e2eTests: request.e2eTests,
      framework: request.framework,
      gapAnalysis: request.gapAnalysis,
      parsing: request.parsing,
      projectRootPath: request.projectRootPath,
      relatedComponentInterfaces: request.relatedComponentInterfaces,
      relatedComponentSourceFiles: request.relatedComponentSourceFiles,
      resolvingGaps: request.resolvingGaps,
      targetComponent: request.targetComponent,
      targetComponentInterface: request.targetComponentInterface,
      targetSourceFilePath: request.targetSourceFilePath,
      targetUnitTests: request.targetUnitTests,
      testFramework: request.testFramework,
      userFlows: request.userFlows,
    };
  }
}
