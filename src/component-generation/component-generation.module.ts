import { Module } from '@nestjs/common';
import { PromptModule } from '../prompt/prompt.module';
import { StepModule } from '../step/step.module';
import { RunComponentGenerationStepUseCase } from './use-cases/run-component-generation-step.use-case';

@Module({
  exports: [RunComponentGenerationStepUseCase],
  imports: [PromptModule, StepModule],
  providers: [RunComponentGenerationStepUseCase],
})
export class ComponentGenerationModule {}
