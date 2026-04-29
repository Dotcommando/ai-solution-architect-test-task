import { PromptRepository } from '../../prompt/repositories/prompt.repository';
import { IPrompt } from '../../prompt/types';
import { StepRepository } from '../../step/repositories/step.repository';
import {
  IStep,
  IStepExecutionResult,
} from '../../step/types';
import { StepExecutorService } from '../../step/services/step-executor.service';
import { IParsingStepOutput } from '../../types';
import { IGapAnalysisStepOutput } from '../types';
import { RunGapAnalysisStepUseCase } from './run-gap-analysis-step.use-case';

describe('RunGapAnalysisStepUseCase', () => {
  const createPrompt = (): IPrompt => {
    return {
      code: 'gap_analysis',
      isActive: true,
      stepCode: 'gap_analysis',
      system: 'system prompt',
      userTemplate: 'template {{input}}',
      v: 1,
      variant: 'control',
    };
  };

  const createStep = (): IStep => {
    return {
      code: 'gap_analysis',
      inputSchema: null,
      isActive: true,
      maxRetries: 2,
      name: 'Gap Analysis',
      outputSchema: null,
      promptCode: 'gap_analysis',
      promptVariant: 'control',
      purpose: 'Analyze missing states and implementation gaps.',
      v: 1,
      validation: {
        validateInputSchema: true,
        validateOutputSchema: true,
      },
    };
  };

  const createParsingOutput = (): IParsingStepOutput => {
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

  const createOutput = (): IGapAnalysisStepOutput => {
    return {
      accessibilityGaps: ['Card selection must be keyboard reachable.'],
      missingStates: ['Selected state is not explicitly defined.'],
      recommendations: ['Define selected, hover, and delete-confirmation states.'],
      responsiveGaps: ['Action placement on narrow widths is not defined.'],
    };
  };

  const createExecutionResult = (): IStepExecutionResult<IGapAnalysisStepOutput> => {
    return {
      attempts: 1,
      output: createOutput(),
      rawOutput: '{"missingStates":["Selected state is not explicitly defined."]}',
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

  it('loads the gap analysis step and prompt, executes the step, and returns the result', async () => {
    const promptRepository = createPromptRepositoryMock();
    const stepRepository = createStepRepositoryMock();
    const stepExecutorService = createStepExecutorServiceMock();
    const parsingOutput = createParsingOutput();
    const step = createStep();
    const prompt = createPrompt();
    const executionResult = createExecutionResult();

    stepRepository.findActiveByCode = jest.fn().mockResolvedValue(step);
    promptRepository.findActiveByCodeAndVariant = jest
      .fn()
      .mockResolvedValue(prompt);
    stepExecutorService.execute = jest.fn().mockResolvedValue(executionResult);

    const useCase = new RunGapAnalysisStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        componentDescription: 'Payment card component.',
        parsing: parsingOutput,
      }),
    ).resolves.toEqual(executionResult);

    expect(stepRepository.findActiveByCode).toHaveBeenCalledWith('gap_analysis');
    expect(promptRepository.findActiveByCodeAndVariant).toHaveBeenCalledWith(
      'gap_analysis',
      'control',
    );
    expect(stepExecutorService.execute).toHaveBeenCalledWith({
      input: {
        componentDescription: 'Payment card component.',
        parsing: parsingOutput,
      },
      prompt,
      step,
    });
  });

  it('uses the default step when the configured step is not found', async () => {
    const promptRepository = createPromptRepositoryMock();
    const stepRepository = createStepRepositoryMock();
    const stepExecutorService = createStepExecutorServiceMock();
    const parsingOutput = createParsingOutput();
    const executionResult = createExecutionResult();

    stepRepository.findActiveByCode = jest.fn().mockResolvedValue(null);
    promptRepository.findActiveByCodeAndVariant = jest
      .fn()
      .mockResolvedValue(createPrompt());
    stepExecutorService.execute = jest.fn().mockResolvedValue(executionResult);

    const useCase = new RunGapAnalysisStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        componentDescription: 'Payment card component.',
        parsing: parsingOutput,
      }),
    ).resolves.toEqual(executionResult);

    expect(stepExecutorService.execute).toHaveBeenCalledWith({
      input: {
        componentDescription: 'Payment card component.',
        parsing: parsingOutput,
      },
      prompt: createPrompt(),
      step: expect.objectContaining({
        code: 'gap_analysis',
        promptCode: 'gap_analysis',
        promptVariant: 'control',
      }),
    });
  });

  it('uses the default prompt when the configured prompt is not found', async () => {
    const promptRepository = createPromptRepositoryMock();
    const stepRepository = createStepRepositoryMock();
    const stepExecutorService = createStepExecutorServiceMock();
    const parsingOutput = createParsingOutput();
    const executionResult = createExecutionResult();

    stepRepository.findActiveByCode = jest.fn().mockResolvedValue(createStep());
    promptRepository.findActiveByCodeAndVariant = jest
      .fn()
      .mockResolvedValue(null);
    stepExecutorService.execute = jest.fn().mockResolvedValue(executionResult);

    const useCase = new RunGapAnalysisStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        componentDescription: 'Payment card component.',
        parsing: parsingOutput,
      }),
    ).resolves.toEqual(executionResult);

    expect(stepExecutorService.execute).toHaveBeenCalledWith({
      input: {
        componentDescription: 'Payment card component.',
        parsing: parsingOutput,
      },
      prompt: expect.objectContaining({
        code: 'gap_analysis',
        stepCode: 'gap_analysis',
        variant: 'control',
      }),
      step: createStep(),
    });
  });
});
