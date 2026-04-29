import { Module } from '@nestjs/common';
import { PromptModule } from '../prompt/prompt.module';
import { StepModule } from '../step/step.module';
import { RunValidationStepUseCase } from './use-cases/run-validation-step.use-case';

@Module({
  exports: [RunValidationStepUseCase],
  imports: [PromptModule, StepModule],
  providers: [RunValidationStepUseCase],
})
export class ValidationModule {}
