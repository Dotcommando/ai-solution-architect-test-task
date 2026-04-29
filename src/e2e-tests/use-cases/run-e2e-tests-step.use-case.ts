import { Injectable } from '@nestjs/common';
import { PromptRepository } from '../../prompt/repositories/prompt.repository';
import { StepRepository } from '../../step/repositories/step.repository';
import { StepExecutorService } from '../../step/services/step-executor.service';
import {
  DEFAULT_E2E_TESTS_PROMPT,
  DEFAULT_E2E_TESTS_STEP,
  E2E_TESTS_STEP_CODE,
} from '../constants';
import {
  IE2eTestsStepInput,
  IE2eTestsStepOutput,
  IRunE2eTestsStepUseCaseRequest,
  IRunE2eTestsStepUseCaseResponse,
} from '../types';

@Injectable()
export class RunE2eTestsStepUseCase {
  constructor(
    private readonly stepRepository: StepRepository,
    private readonly promptRepository: PromptRepository,
    private readonly stepExecutorService: StepExecutorService,
  ) {}

  async execute(
    request: IRunE2eTestsStepUseCaseRequest,
  ): Promise<IRunE2eTestsStepUseCaseResponse> {
    const step =
      (await this.stepRepository.findActiveByCode(E2E_TESTS_STEP_CODE)) ??
      DEFAULT_E2E_TESTS_STEP;

    const prompt =
      (await this.promptRepository.findActiveByCodeAndVariant(
        step.promptCode,
        step.promptVariant,
      )) ?? DEFAULT_E2E_TESTS_PROMPT;

    const input = this.buildStepInput(request);
    const result = await this.stepExecutorService.execute<
      IE2eTestsStepInput,
      IE2eTestsStepOutput
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
    request: IRunE2eTestsStepUseCaseRequest,
  ): IE2eTestsStepInput {
    return {
      componentDescription: request.componentDescription,
      componentInterfaces: request.componentInterfaces,
      componentSourceFiles: request.componentSourceFiles,
      e2eTestFilePath: request.e2eTestFilePath,
      framework: request.framework,
      gapAnalysis: request.gapAnalysis,
      parsing: request.parsing,
      projectRootPath: request.projectRootPath,
      resolvingGaps: request.resolvingGaps,
      rootComponent: request.rootComponent,
      rootComponentInterface: request.rootComponentInterface,
      rootSourceFilePath: request.rootSourceFilePath,
      testFramework: request.testFramework,
      unitTests: request.unitTests,
      userFlows: request.userFlows,
    };
  }
}
