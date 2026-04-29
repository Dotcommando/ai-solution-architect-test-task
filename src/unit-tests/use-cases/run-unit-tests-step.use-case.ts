import { Injectable } from '@nestjs/common';
import { PromptRepository } from '../../prompt/repositories/prompt.repository';
import { StepRepository } from '../../step/repositories/step.repository';
import { StepExecutorService } from '../../step/services/step-executor.service';
import {
  DEFAULT_UNIT_TESTS_PROMPT,
  DEFAULT_UNIT_TESTS_STEP,
  UNIT_TESTS_STEP_CODE,
} from '../constants';
import {
  IRunUnitTestsStepUseCaseRequest,
  IRunUnitTestsStepUseCaseResponse,
  IUnitTestsStepInput,
  IUnitTestsStepOutput,
} from '../types';

@Injectable()
export class RunUnitTestsStepUseCase {
  constructor(
    private readonly stepRepository: StepRepository,
    private readonly promptRepository: PromptRepository,
    private readonly stepExecutorService: StepExecutorService,
  ) {}

  async execute(
    request: IRunUnitTestsStepUseCaseRequest,
  ): Promise<IRunUnitTestsStepUseCaseResponse> {
    const step =
      (await this.stepRepository.findActiveByCode(UNIT_TESTS_STEP_CODE)) ??
      DEFAULT_UNIT_TESTS_STEP;

    const prompt =
      (await this.promptRepository.findActiveByCodeAndVariant(
        step.promptCode,
        step.promptVariant,
      )) ?? DEFAULT_UNIT_TESTS_PROMPT;

    const input = this.buildStepInput(request);
    const result = await this.stepExecutorService.execute<
      IUnitTestsStepInput,
      IUnitTestsStepOutput
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
    request: IRunUnitTestsStepUseCaseRequest,
  ): IUnitTestsStepInput {
    return {
      componentDescription: request.componentDescription,
      componentInterfaces: request.componentInterfaces,
      componentSourceFiles: request.componentSourceFiles,
      framework: request.framework,
      gapAnalysis: request.gapAnalysis,
      parsing: request.parsing,
      projectRootPath: request.projectRootPath,
      resolvingGaps: request.resolvingGaps,
      targetComponent: request.targetComponent,
      targetComponentInterface: request.targetComponentInterface,
      targetSourceFilePath: request.targetSourceFilePath,
      targetTestFilePath: request.targetTestFilePath,
      testFramework: request.testFramework,
      userFlows: request.userFlows,
    };
  }
}
