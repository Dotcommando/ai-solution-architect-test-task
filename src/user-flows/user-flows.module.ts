import { Module } from '@nestjs/common';
import { PromptModule } from '../prompt/prompt.module';
import { StepModule } from '../step/step.module';
import { RunUserFlowsStepUseCase } from './use-cases/run-user-flows-step.use-case';

@Module({
  exports: [RunUserFlowsStepUseCase],
  imports: [PromptModule, StepModule],
  providers: [RunUserFlowsStepUseCase],
})
export class UserFlowsModule {}
