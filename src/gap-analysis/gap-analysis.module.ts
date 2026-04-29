import { Module } from '@nestjs/common';
import { PromptModule } from '../prompt/prompt.module';
import { StepModule } from '../step/step.module';
import { RunGapAnalysisStepUseCase } from './use-cases/run-gap-analysis-step.use-case';

@Module({
  exports: [RunGapAnalysisStepUseCase],
  imports: [PromptModule, StepModule],
  providers: [RunGapAnalysisStepUseCase],
})
export class GapAnalysisModule {}
