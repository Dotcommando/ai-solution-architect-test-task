import { Module } from '@nestjs/common';
import { PromptModule } from '../prompt/prompt.module';
import { StepModule } from '../step/step.module';
import { RunParsingStepUseCase } from './use-cases/run-parsing-step.use-case';

@Module({
  exports: [RunParsingStepUseCase],
  imports: [PromptModule, StepModule],
  providers: [RunParsingStepUseCase],
})
export class ParsingModule {}
