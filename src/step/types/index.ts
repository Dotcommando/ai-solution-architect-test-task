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

export interface IStepExecutionRequest {
  input: Record<string, unknown>;
  prompt: IPrompt;
  step: IStep;
}

export interface IStepExecutionResult {
  attempts: number;
  output: Record<string, unknown>;
  rawOutput: string;
}

export interface IStepExecutorLlmClient {
  execute(systemPrompt: string, userPrompt: string): Promise<string>;
}
