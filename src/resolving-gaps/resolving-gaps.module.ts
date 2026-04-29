import { Module } from '@nestjs/common';
import { PromptModule } from '../prompt/prompt.module';
import { StepModule } from '../step/step.module';
import { RunResolvingGapsStepUseCase } from './use-cases/run-resolving-gaps-step.use-case';

@Module({
  exports: [RunResolvingGapsStepUseCase],
  imports: [PromptModule, StepModule],
  providers: [RunResolvingGapsStepUseCase],
})
export class ResolvingGapsModule {}
