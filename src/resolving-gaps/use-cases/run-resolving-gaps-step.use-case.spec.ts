import { PromptRepository } from '../../prompt/repositories/prompt.repository';
import { IPrompt } from '../../prompt/types';
import { StepRepository } from '../../step/repositories/step.repository';
import {
  IStep,
  IStepExecutionResult,
} from '../../step/types';
import { StepExecutorService } from '../../step/services/step-executor.service';
import { IParsingStepOutput } from '../../types';
import { IGapAnalysisStepOutput } from '../../gap-analysis/types';
import { IResolvingGapsStepOutput } from '../types';
import { RunResolvingGapsStepUseCase } from './run-resolving-gaps-step.use-case';

describe('RunResolvingGapsStepUseCase', () => {
  const createPrompt = (): IPrompt => {
    return {
      code: 'resolving_gaps',
      isActive: true,
      stepCode: 'resolving_gaps',
      system: 'system prompt',
      userTemplate: 'template {{input}}',
      v: 1,
      variant: 'control',
    };
  };

  const createStep = (): IStep => {
    return {
      code: 'resolving_gaps',
      inputSchema: null,
      isActive: true,
      maxRetries: 2,
      name: 'Resolving Gaps',
      outputSchema: null,
      promptCode: 'resolving_gaps',
      promptVariant: 'control',
      purpose: 'Resolve gaps into implementation decisions.',
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

  const createGapAnalysisOutput = (): IGapAnalysisStepOutput => {
    return {
      accessibilityGaps: ['Card selection must be keyboard reachable.'],
      missingStates: ['Selected state is not explicitly defined.'],
      recommendations: ['Define selected and delete-confirmation states.'],
      responsiveGaps: ['Action placement on narrow widths is not defined.'],
    };
  };

  const createOutput = (): IResolvingGapsStepOutput => {
    return {
      decisions: [
        {
          affectedComponentCodes: ['payment_card'],
          code: 'define_selected_state',
          decision: 'Add an explicit selected state for the payment card.',
          rationale: 'This resolves the missing selection-state gap and supports downstream interaction and visual-state work.',
          sourceGap: 'Selected state is not explicitly defined.',
        },
      ],
    };
  };

  const createExecutionResult = (): IStepExecutionResult<IResolvingGapsStepOutput> => {
    return {
      attempts: 1,
      output: createOutput(),
      rawOutput: '{"decisions":[{"code":"define_selected_state"}]}',
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

  it('loads the resolving gaps step and prompt, executes the step, and returns the result', async () => {
    const promptRepository = createPromptRepositoryMock();
    const stepRepository = createStepRepositoryMock();
    const stepExecutorService = createStepExecutorServiceMock();
    const parsingOutput = createParsingOutput();
    const gapAnalysisOutput = createGapAnalysisOutput();
    const step = createStep();
    const prompt = createPrompt();
    const executionResult = createExecutionResult();

    stepRepository.findActiveByCode = jest.fn().mockResolvedValue(step);
    promptRepository.findActiveByCodeAndVariant = jest
      .fn()
      .mockResolvedValue(prompt);
    stepExecutorService.execute = jest.fn().mockResolvedValue(executionResult);

    const useCase = new RunResolvingGapsStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        componentDescription: 'Payment card component.',
        gapAnalysis: gapAnalysisOutput,
        parsing: parsingOutput,
      }),
    ).resolves.toEqual(executionResult);

    expect(stepRepository.findActiveByCode).toHaveBeenCalledWith(
      'resolving_gaps',
    );
    expect(promptRepository.findActiveByCodeAndVariant).toHaveBeenCalledWith(
      'resolving_gaps',
      'control',
    );
    expect(stepExecutorService.execute).toHaveBeenCalledWith({
      input: {
        componentDescription: 'Payment card component.',
        gapAnalysis: gapAnalysisOutput,
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
    const gapAnalysisOutput = createGapAnalysisOutput();
    const executionResult = createExecutionResult();

    stepRepository.findActiveByCode = jest.fn().mockResolvedValue(null);
    promptRepository.findActiveByCodeAndVariant = jest
      .fn()
      .mockResolvedValue(createPrompt());
    stepExecutorService.execute = jest.fn().mockResolvedValue(executionResult);

    const useCase = new RunResolvingGapsStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        componentDescription: 'Payment card component.',
        gapAnalysis: gapAnalysisOutput,
        parsing: parsingOutput,
      }),
    ).resolves.toEqual(executionResult);

    expect(stepExecutorService.execute).toHaveBeenCalledWith({
      input: {
        componentDescription: 'Payment card component.',
        gapAnalysis: gapAnalysisOutput,
        parsing: parsingOutput,
      },
      prompt: createPrompt(),
      step: expect.objectContaining({
        code: 'resolving_gaps',
        promptCode: 'resolving_gaps',
        promptVariant: 'control',
      }),
    });
  });

  it('uses the default prompt when the configured prompt is not found', async () => {
    const promptRepository = createPromptRepositoryMock();
    const stepRepository = createStepRepositoryMock();
    const stepExecutorService = createStepExecutorServiceMock();
    const parsingOutput = createParsingOutput();
    const gapAnalysisOutput = createGapAnalysisOutput();
    const executionResult = createExecutionResult();

    stepRepository.findActiveByCode = jest.fn().mockResolvedValue(createStep());
    promptRepository.findActiveByCodeAndVariant = jest
      .fn()
      .mockResolvedValue(null);
    stepExecutorService.execute = jest.fn().mockResolvedValue(executionResult);

    const useCase = new RunResolvingGapsStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        componentDescription: 'Payment card component.',
        gapAnalysis: gapAnalysisOutput,
        parsing: parsingOutput,
      }),
    ).resolves.toEqual(executionResult);

    expect(stepExecutorService.execute).toHaveBeenCalledWith({
      input: {
        componentDescription: 'Payment card component.',
        gapAnalysis: gapAnalysisOutput,
        parsing: parsingOutput,
      },
      prompt: expect.objectContaining({
        code: 'resolving_gaps',
        stepCode: 'resolving_gaps',
        variant: 'control',
      }),
      step: createStep(),
    });
  });
});
