import { Module } from '@nestjs/common';
import { PromptModule } from '../prompt/prompt.module';
import { StepModule } from '../step/step.module';
import { RunE2eTestsStepUseCase } from './use-cases/run-e2e-tests-step.use-case';

@Module({
  exports: [RunE2eTestsStepUseCase],
  imports: [PromptModule, StepModule],
  providers: [RunE2eTestsStepUseCase],
})
export class E2eTestsModule {}
