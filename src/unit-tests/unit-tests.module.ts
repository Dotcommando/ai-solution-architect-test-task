import { Module } from '@nestjs/common';
import { PromptModule } from '../prompt/prompt.module';
import { StepModule } from '../step/step.module';
import { RunUnitTestsStepUseCase } from './use-cases/run-unit-tests-step.use-case';

@Module({
  exports: [RunUnitTestsStepUseCase],
  imports: [PromptModule, StepModule],
  providers: [RunUnitTestsStepUseCase],
})
export class UnitTestsModule {}
