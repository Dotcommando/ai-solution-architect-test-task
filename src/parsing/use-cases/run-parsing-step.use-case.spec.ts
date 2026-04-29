import { PromptRepository } from '../../prompt/repositories/prompt.repository';
import { IPrompt } from '../../prompt/types';
import { IParsingStepOutput } from '../../types';
import { StepRepository } from '../../step/repositories/step.repository';
import {
  IStep,
  IStepExecutionResult,
} from '../../step/types';
import { StepExecutorService } from '../../step/services/step-executor.service';
import { RunParsingStepUseCase } from './run-parsing-step.use-case';

describe('RunParsingStepUseCase', () => {
  const createPrompt = (): IPrompt => {
    return {
      code: 'parsing',
      isActive: true,
      stepCode: 'parsing',
      system: 'system prompt',
      userTemplate: 'template {{input}}',
      v: 1,
      variant: 'control',
    };
  };

  const createStep = (): IStep => {
    return {
      code: 'parsing',
      inputSchema: null,
      isActive: true,
      maxRetries: 2,
      name: 'Parsing',
      outputSchema: null,
      promptCode: 'parsing',
      promptVariant: 'control',
      purpose: 'Parse a component brief.',
      v: 1,
      validation: {
        validateInputSchema: true,
        validateOutputSchema: true,
      },
    };
  };

  const createOutput = (): IParsingStepOutput => {
    return {
      businessContext: 'merchant dashboard',
      components: [
        {
          code: 'payment_card',
          name: 'Payment card',
          parentCode: null,
          purpose: 'Display a saved payment method.',
          statePolicy: 'smart',
          type: 'card',
        },
      ],
      constraints: [],
      content: [],
      interactions: [],
      rootComponentCode: 'payment_card',
      specifiedStates: [],
      tokenReferences: [],
    };
  };

  const createExecutionResult = (): IStepExecutionResult<IParsingStepOutput> => {
    return {
      attempts: 1,
      output: createOutput(),
      rawOutput: '{"businessContext":"merchant dashboard"}',
    };
  };

  const createPromptRepositoryMock = (): Pick<
    PromptRepository,
    'findActiveByCodeAndVariant'
  > => {
    return {
      findActiveByCodeAndVariant: jest.fn(),
    };
  };

  const createStepRepositoryMock = (): Pick<
    StepRepository,
    'findActiveByCode'
  > => {
    return {
      findActiveByCode: jest.fn(),
    };
  };

  const createStepExecutorServiceMock = (): Pick<
    StepExecutorService,
    'execute'
  > => {
    return {
      execute: jest.fn(),
    };
  };

  it('loads the parsing step and prompt, executes the step, and returns the result', async () => {
    const promptRepository = createPromptRepositoryMock();
    const stepRepository = createStepRepositoryMock();
    const stepExecutorService = createStepExecutorServiceMock();

    const step = createStep();
    const prompt = createPrompt();
    const executionResult = createExecutionResult();

    stepRepository.findActiveByCode = jest.fn().mockResolvedValue(step);
    promptRepository.findActiveByCodeAndVariant = jest
      .fn()
      .mockResolvedValue(prompt);
    stepExecutorService.execute = jest.fn().mockResolvedValue(executionResult);

    const useCase = new RunParsingStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        componentDescription:
          'Payment card component. User can select a card or delete it.',
      }),
    ).resolves.toEqual(executionResult);

    expect(stepRepository.findActiveByCode).toHaveBeenCalledWith('parsing');
    expect(promptRepository.findActiveByCodeAndVariant).toHaveBeenCalledWith(
      'parsing',
      'control',
    );
    expect(stepExecutorService.execute).toHaveBeenCalledWith({
      input: {
        componentDescription:
          'Payment card component. User can select a card or delete it.',
        figmaUrl: null,
        screenshotUrl: null,
      },
      prompt,
      step,
    });
  });

  it('throws when the parsing step is not found', async () => {
    const promptRepository = createPromptRepositoryMock();
    const stepRepository = createStepRepositoryMock();
    const stepExecutorService = createStepExecutorServiceMock();
    const executionResult = createExecutionResult();

    stepRepository.findActiveByCode = jest.fn().mockResolvedValue(null);
    promptRepository.findActiveByCodeAndVariant = jest
      .fn()
      .mockResolvedValue(createPrompt());
    stepExecutorService.execute = jest.fn().mockResolvedValue(executionResult);

    const useCase = new RunParsingStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        componentDescription: 'Payment card component.',
      }),
    ).resolves.toEqual(executionResult);

    expect(stepExecutorService.execute).toHaveBeenCalledWith({
      input: {
        componentDescription: 'Payment card component.',
        figmaUrl: null,
        screenshotUrl: null,
      },
      prompt: createPrompt(),
      step: expect.objectContaining({
        code: 'parsing',
        promptCode: 'parsing',
        promptVariant: 'control',
      }),
    });
  });

  it('throws when the parsing prompt is not found', async () => {
    const promptRepository = createPromptRepositoryMock();
    const stepRepository = createStepRepositoryMock();
    const stepExecutorService = createStepExecutorServiceMock();
    const executionResult = createExecutionResult();

    stepRepository.findActiveByCode = jest.fn().mockResolvedValue(createStep());
    promptRepository.findActiveByCodeAndVariant = jest
      .fn()
      .mockResolvedValue(null);
    stepExecutorService.execute = jest.fn().mockResolvedValue(executionResult);

    const useCase = new RunParsingStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        componentDescription: 'Payment card component.',
      }),
    ).resolves.toEqual(executionResult);

    expect(stepExecutorService.execute).toHaveBeenCalledWith({
      input: {
        componentDescription: 'Payment card component.',
        figmaUrl: null,
        screenshotUrl: null,
      },
      prompt: expect.objectContaining({
        code: 'parsing',
        stepCode: 'parsing',
        variant: 'control',
      }),
      step: createStep(),
    });
  });
});
