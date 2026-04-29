import { Inject, Injectable } from '@nestjs/common';
import { ErrorObject } from 'ajv';
import Ajv2020 from 'ajv/dist/2020';
import type { IPrompt } from '../../prompt/types';
import { STEP_EXECUTOR_LLM_CLIENT } from '../constants';
import {
  IStep,
  IStepExecutionRequest,
  IStepExecutionResult,
} from '../types';
import type { IStepExecutorLlmClient } from '../types';

export class StepExecutionError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'StepExecutionError';
  }
}

@Injectable()
export class StepExecutorService {
  private readonly ajv: Ajv2020;

  constructor(
    @Inject(STEP_EXECUTOR_LLM_CLIENT)
    private readonly llmClient: IStepExecutorLlmClient,
  ) {
    this.ajv = new Ajv2020({
      allErrors: true,
      strict: false,
    });
  }

  async execute(
    request: IStepExecutionRequest,
  ): Promise<IStepExecutionResult>;
  async execute<TInput extends object, TOutput extends object>(
    request: IStepExecutionRequest<TInput>,
  ): Promise<IStepExecutionResult<TOutput>>;
  async execute<TInput extends object, TOutput extends object>(
    request: IStepExecutionRequest<TInput>,
  ): Promise<IStepExecutionResult<TOutput>> {
    this.validateInput(request.step, request.input);

    const baseUserPrompt = this.renderUserPrompt(request.prompt, request.input);
    const maxAttempts = request.step.maxRetries + 1;

    let attempt = 0;
    let lastError: Error | null = null;

    for (attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const userPrompt = this.buildAttemptUserPrompt(
        baseUserPrompt,
        request.step,
        lastError,
      );

      try {
        const rawOutput = await this.llmClient.execute(
          request.prompt.system,
          userPrompt,
        );
        const output = this.parseAndValidateOutput<TOutput>(
          request.step,
          rawOutput,
        );

        return {
          attempts: attempt,
          output,
          rawOutput,
        };
      } catch (error) {
        lastError = this.normalizeError(error);
      }
    }

    throw new StepExecutionError('Step execution failed', {
      cause: lastError,
    });
  }

  private buildAttemptUserPrompt(
    baseUserPrompt: string,
    step: IStep,
    error: Error | null,
  ): string {
    if (error === null) {
      return baseUserPrompt;
    }

    if (
      step.outputSchema === null
      || !step.validation.validateOutputSchema
    ) {
      return `${baseUserPrompt}\n\nPrevious error: ${error.message}\nRegenerate the full JSON response from scratch.\nReturn valid JSON only.`;
    }

    return `${baseUserPrompt}\n\nPrevious error: ${error.message}\nRegenerate the full JSON response from scratch.\nCorrect every schema violation listed in the previous error.\nUse exact property names and no additional fields.\nReturn valid JSON only and make sure it matches the configured output schema.`;
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    return new Error('Unknown step execution error');
  }

  private parseAndValidateOutput<TOutput extends object>(
    step: IStep,
    rawOutput: string,
  ): TOutput {
    const parsedOutput = this.parseJson(rawOutput);

    if (
      step.validation.validateOutputSchema
      && step.outputSchema !== null
    ) {
      const validate = this.ajv.compile(step.outputSchema);

      if (!validate(parsedOutput)) {
        throw new StepExecutionError(
          `Output schema validation failed: ${this.formatAjvErrors(validate.errors)}`,
        );
      }
    }

    if (!this.isJsonObject(parsedOutput)) {
      throw new StepExecutionError(
        'LLM output must be a JSON object',
      );
    }

    return parsedOutput as TOutput;
  }

  private parseJson(rawOutput: string): unknown {
    try {
      return JSON.parse(rawOutput) as unknown;
    } catch (error) {
      throw new StepExecutionError('Invalid JSON received from LLM', {
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  private renderUserPrompt(
    prompt: IPrompt,
    input: object,
  ): string {
    const serializedInput = JSON.stringify(input, null, 2);

    return prompt.userTemplate.replaceAll('{{input}}', serializedInput);
  }

  private validateInput(step: IStep, input: object): void {
    if (
      !step.validation.validateInputSchema
      || step.inputSchema === null
    ) {
      return;
    }

    const validate = this.ajv.compile(step.inputSchema);

    if (!validate(input)) {
      throw new StepExecutionError(
        `Input schema validation failed: ${this.formatAjvErrors(validate.errors)}`,
      );
    }
  }

  private formatAjvErrors(errors: ErrorObject[] | null | undefined): string {
    if (
      errors === null
      || errors === undefined
      || errors.length === 0
    ) {
      return 'unknown validation error';
    }

    return errors
      .map((error) => {
        const instancePath = error.instancePath === '' ? '/' : error.instancePath;
        const message = error.message ?? 'validation error';

        return `${instancePath} ${message}`;
      })
      .join('; ');
  }

  private isJsonObject(
    value: unknown,
  ): value is Record<string, unknown> {
    return (
      value !== null
      && !Array.isArray(value)
      && typeof value === 'object'
    );
  }
}
