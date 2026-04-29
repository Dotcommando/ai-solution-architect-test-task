import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromptModule } from '../prompt/prompt.module';
import { STEP_EXECUTOR_LLM_CLIENT } from './constants';
import { StepRepository } from './repositories/step.repository';
import { OpenAiLlmClientService } from './services/openai-llm-client.service';
import { StepExecutorService } from './services/step-executor.service';
import { StepDocument, StepSchema } from './schemas';

@Module({
  exports: [StepExecutorService, StepRepository],
  imports: [
    MongooseModule.forFeature([
      {
        name: StepDocument.name,
        schema: StepSchema,
      },
    ]),
    PromptModule,
  ],
  providers: [
    OpenAiLlmClientService,
    StepRepository,
    StepExecutorService,
    {
      provide: STEP_EXECUTOR_LLM_CLIENT,
      useExisting: OpenAiLlmClientService,
    },
  ],
})
export class StepModule {}
