import { Module } from '@nestjs/common';
import { STEP_EXECUTOR_LLM_CLIENT } from './constants';
import { OpenAiLlmClientService } from './services/openai-llm-client.service';
import { StepExecutorService } from './services/step-executor.service';

@Module({
  exports: [StepExecutorService],
  providers: [
    OpenAiLlmClientService,
    StepExecutorService,
    {
      provide: STEP_EXECUTOR_LLM_CLIENT,
      useExisting: OpenAiLlmClientService,
    },
  ],
})
export class StepModule {}
