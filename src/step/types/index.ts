import type { AnySchemaObject } from 'ajv';
import type { IPrompt } from '../../prompt/types';

export interface IStepValidation {
  validateInputSchema: boolean;
  validateOutputSchema: boolean;
}

export interface IStep {
  v: number;
  name: string;
  purpose: string;
  code: string;
  promptCode: string;
  promptVariant: string;
  inputSchema: AnySchemaObject | null;
  outputSchema: AnySchemaObject | null;
  maxRetries: number;
  validation: IStepValidation;
  isActive: boolean;
}

export interface IStepExecutionRequest<
  TInput extends object = Record<string, unknown>,
> {
  input: TInput;
  prompt: IPrompt;
  step: IStep;
}

export interface IStepTokenUsage {
  cachedInputTokens: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  reasoningTokens: number | null;
  totalTokens: number | null;
}

export interface IStepExecutorLlmResponse {
  rawOutput: string;
  tokenUsage: IStepTokenUsage;
}

export interface IStepExecutionResult<
  TOutput extends object = Record<string, unknown>,
> {
  attempts: number;
  output: TOutput;
  rawOutput: string;
  tokenUsage: IStepTokenUsage;
}

export interface IStepExecutorLlmClient {
  execute(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<IStepExecutorLlmResponse>;
}
