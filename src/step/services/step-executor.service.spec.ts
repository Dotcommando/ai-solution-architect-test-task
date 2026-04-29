import { IPrompt } from '../../prompt/types';
import { PARSING_STEP_INPUT_SCHEMA } from '../../types';
import { IStep } from '../types';
import { StepExecutorService } from './step-executor.service';

interface ITestLlmClient {
  execute: jest.Mock<Promise<string>, [string, string]>;
}

describe('StepExecutorService', () => {
  const inputSchema = {
    additionalProperties: false,
    properties: {
      value: {
        minLength: 1,
        type: 'string',
      },
    },
    required: ['value'],
    type: 'object',
  };

  const outputSchema = {
    additionalProperties: false,
    properties: {
      status: {
        minLength: 1,
        type: 'string',
      },
    },
    required: ['status'],
    type: 'object',
  };

  const createPrompt = (): IPrompt => {
    return {
      code: 'parsing',
      isActive: true,
      stepCode: 'parsing',
      system: 'You are a parser.',
      userTemplate: 'Return JSON for input:\n{{input}}',
      v: 1,
      variant: 'control',
    };
  };

  const createStep = (): IStep => {
    return {
      code: 'parsing',
      inputSchema,
      isActive: true,
      maxRetries: 2,
      name: 'Parsing',
      outputSchema,
      promptCode: 'parsing',
      promptVariant: 'control',
      purpose: 'Parse input into structured JSON.',
      v: 1,
      validation: {
        validateInputSchema: true,
        validateOutputSchema: true,
      },
    };
  };

  const createLlmClient = (): ITestLlmClient => {
    return {
      execute: jest.fn<Promise<string>, [string, string]>(),
    };
  };

  it('rejects before LLM invocation when input schema validation fails', async () => {
    const llmClient = createLlmClient();
    const service = new StepExecutorService(llmClient);

    await expect(
      service.execute({
        input: {},
        prompt: createPrompt(),
        step: createStep(),
      }),
    ).rejects.toThrow('Input schema validation failed');

    expect(llmClient.execute).not.toHaveBeenCalled();
  });

  it('returns parsed output when the first LLM response is valid JSON matching the schema', async () => {
    const llmClient = createLlmClient();
    const service = new StepExecutorService(llmClient);

    llmClient.execute.mockResolvedValueOnce(
      JSON.stringify({
        status: 'ok',
      }),
    );

    await expect(
      service.execute({
        input: {
          value: 'payment card',
        },
        prompt: createPrompt(),
        step: createStep(),
      }),
    ).resolves.toEqual({
      attempts: 1,
      output: {
        status: 'ok',
      },
      rawOutput: '{"status":"ok"}',
    });

    expect(llmClient.execute).toHaveBeenCalledWith(
      'You are a parser.',
      'Return JSON for input:\n{\n  "value": "payment card"\n}',
    );
  });

  it('retries when the first LLM response is not valid JSON and succeeds on the next attempt', async () => {
    const llmClient = createLlmClient();
    const service = new StepExecutorService(llmClient);

    llmClient.execute
      .mockResolvedValueOnce('not-json')
      .mockResolvedValueOnce(
        JSON.stringify({
          status: 'ok',
        }),
      );

    await expect(
      service.execute({
        input: {
          value: 'transaction table',
        },
        prompt: createPrompt(),
        step: createStep(),
      }),
    ).resolves.toEqual({
      attempts: 2,
      output: {
        status: 'ok',
      },
      rawOutput: '{"status":"ok"}',
    });

    expect(llmClient.execute).toHaveBeenCalledTimes(2);
  });

  it('retries when the parsed JSON does not match the output schema and succeeds on the next attempt', async () => {
    const llmClient = createLlmClient();
    const service = new StepExecutorService(llmClient);

    llmClient.execute
      .mockResolvedValueOnce(
        JSON.stringify({
          invalid: true,
        }),
      )
      .mockResolvedValueOnce(
        JSON.stringify({
          status: 'ok',
        }),
      );

    await expect(
      service.execute({
        input: {
          value: 'kyc wizard',
        },
        prompt: createPrompt(),
        step: createStep(),
      }),
    ).resolves.toEqual({
      attempts: 2,
      output: {
        status: 'ok',
      },
      rawOutput: '{"status":"ok"}',
    });

    expect(llmClient.execute).toHaveBeenCalledTimes(2);
  });

  it('throws after exhausting the configured retries', async () => {
    const llmClient = createLlmClient();
    const service = new StepExecutorService(llmClient);

    llmClient.execute
      .mockResolvedValueOnce('not-json')
      .mockResolvedValueOnce('still-not-json')
      .mockResolvedValueOnce('again-not-json');

    await expect(
      service.execute({
        input: {
          value: 'payment form',
        },
        prompt: createPrompt(),
        step: createStep(),
      }),
    ).rejects.toThrow('Step execution failed');

    expect(llmClient.execute).toHaveBeenCalledTimes(3);
  });

  it('supports draft 2020-12 schemas during input validation', async () => {
    const llmClient = createLlmClient();
    const service = new StepExecutorService(llmClient);

    const step = createStep();

    step.inputSchema = PARSING_STEP_INPUT_SCHEMA;

    llmClient.execute.mockResolvedValueOnce(
      JSON.stringify({
        status: 'ok',
      }),
    );

    await expect(
      service.execute({
        input: {
          componentDescription: 'Payment card component.',
          figmaUrl: null,
          screenshotUrl: null,
        },
        prompt: createPrompt(),
        step,
      }),
    ).resolves.toEqual({
      attempts: 1,
      output: {
        status: 'ok',
      },
      rawOutput: '{"status":"ok"}',
    });
  });
});
