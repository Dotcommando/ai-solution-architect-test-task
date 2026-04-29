import { PromptRepository } from '../../prompt/repositories/prompt.repository';
import { IPrompt } from '../../prompt/types';
import { StepRepository } from '../../step/repositories/step.repository';
import {
  IStep,
  IStepExecutionResult,
} from '../../step/types';
import { StepExecutorService } from '../../step/services/step-executor.service';
import { IGapAnalysisStepOutput } from '../../gap-analysis/types';
import { IParsingStepOutput } from '../../types';
import { IResolvingGapsStepOutput } from '../../resolving-gaps/types';
import { IUserFlowsStepOutput } from '../types';
import { RunUserFlowsStepUseCase } from './run-user-flows-step.use-case';

describe('RunUserFlowsStepUseCase', () => {
  const createPrompt = (): IPrompt => {
    return {
      code: 'user_flows',
      isActive: true,
      stepCode: 'user_flows',
      system: 'system prompt',
      userTemplate: 'template {{input}}',
      v: 1,
      variant: 'control',
    };
  };

  const createStep = (): IStep => {
    return {
      code: 'user_flows',
      inputSchema: null,
      isActive: true,
      maxRetries: 2,
      name: 'User Flows',
      outputSchema: null,
      promptCode: 'user_flows',
      promptVariant: 'control',
      purpose: 'Define happy and unhappy user flows.',
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

  const createResolvingGapsOutput = (): IResolvingGapsStepOutput => {
    return {
      decisions: [
        {
          affectedComponentCodes: ['payment_card'],
          code: 'define_selected_state',
          decision: 'Add an explicit selected state for the payment card.',
          rationale: 'This resolves the missing selection-state gap.',
          sourceGap: 'Selected state is not explicitly defined.',
        },
      ],
    };
  };

  const createOutput = (): IUserFlowsStepOutput => {
    return {
      flows: [
        {
          code: 'select_saved_card_fast_path',
          completionCriteria: 'A saved card is selected without errors.',
          kind: 'shortest_happy',
          name: 'Select saved card quickly',
          steps: [
            {
              action: 'User selects the saved payment card.',
              code: 'select_card',
              componentCode: 'payment_card',
              expectedResult: 'The card enters the selected state.',
              inputData: null,
            },
          ],
        },
        {
          code: 'review_then_select_card',
          completionCriteria: 'A saved card is selected after review and exploration.',
          kind: 'exploratory_happy',
          name: 'Review and then select card',
          steps: [
            {
              action: 'User reviews card details before selecting it.',
              code: 'review_card_details',
              componentCode: 'payment_card',
              expectedResult: 'Card details remain visible and unchanged.',
              inputData: null,
            },
          ],
        },
        {
          code: 'invalid_delete_attempt',
          completionCriteria: 'The invalid action is rejected and the user can recover.',
          kind: 'unhappy_invalid_input',
          name: 'Invalid delete attempt',
          steps: [
            {
              action: 'User attempts a destructive action without satisfying the required confirmation condition.',
              code: 'attempt_delete_without_confirmation',
              componentCode: 'payment_card',
              expectedResult: 'The UI blocks the action and shows recovery guidance.',
              inputData: 'Delete requested without confirmation',
            },
          ],
        },
      ],
    };
  };

  const createExecutionResult = (): IStepExecutionResult<IUserFlowsStepOutput> => {
    return {
      attempts: 1,
      output: createOutput(),
      rawOutput: '{"flows":[{"code":"select_saved_card_fast_path"}]}',
      tokenUsage: {
        cachedInputTokens: 0,
        inputTokens: 12,
        outputTokens: 4,
        reasoningTokens: 1,
        totalTokens: 16,
      },
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

  it('loads the user flows step and prompt, executes the step, and returns the result', async () => {
    const promptRepository = createPromptRepositoryMock();
    const stepRepository = createStepRepositoryMock();
    const stepExecutorService = createStepExecutorServiceMock();
    const parsingOutput = createParsingOutput();
    const gapAnalysisOutput = createGapAnalysisOutput();
    const resolvingGapsOutput = createResolvingGapsOutput();
    const step = createStep();
    const prompt = createPrompt();
    const executionResult = createExecutionResult();

    stepRepository.findActiveByCode = jest.fn().mockResolvedValue(step);
    promptRepository.findActiveByCodeAndVariant = jest
      .fn()
      .mockResolvedValue(prompt);
    stepExecutorService.execute = jest.fn().mockResolvedValue(executionResult);

    const useCase = new RunUserFlowsStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        componentDescription: 'Payment card component.',
        gapAnalysis: gapAnalysisOutput,
        parsing: parsingOutput,
        resolvingGaps: resolvingGapsOutput,
      }),
    ).resolves.toEqual(executionResult);

    expect(stepRepository.findActiveByCode).toHaveBeenCalledWith('user_flows');
    expect(promptRepository.findActiveByCodeAndVariant).toHaveBeenCalledWith(
      'user_flows',
      'control',
    );
    expect(stepExecutorService.execute).toHaveBeenCalledWith({
      input: {
        componentDescription: 'Payment card component.',
        gapAnalysis: gapAnalysisOutput,
        parsing: parsingOutput,
        resolvingGaps: resolvingGapsOutput,
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
    const resolvingGapsOutput = createResolvingGapsOutput();
    const executionResult = createExecutionResult();

    stepRepository.findActiveByCode = jest.fn().mockResolvedValue(null);
    promptRepository.findActiveByCodeAndVariant = jest
      .fn()
      .mockResolvedValue(createPrompt());
    stepExecutorService.execute = jest.fn().mockResolvedValue(executionResult);

    const useCase = new RunUserFlowsStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        componentDescription: 'Payment card component.',
        gapAnalysis: gapAnalysisOutput,
        parsing: parsingOutput,
        resolvingGaps: resolvingGapsOutput,
      }),
    ).resolves.toEqual(executionResult);

    expect(stepExecutorService.execute).toHaveBeenCalledWith({
      input: {
        componentDescription: 'Payment card component.',
        gapAnalysis: gapAnalysisOutput,
        parsing: parsingOutput,
        resolvingGaps: resolvingGapsOutput,
      },
      prompt: createPrompt(),
      step: expect.objectContaining({
        code: 'user_flows',
        promptCode: 'user_flows',
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
    const resolvingGapsOutput = createResolvingGapsOutput();
    const executionResult = createExecutionResult();

    stepRepository.findActiveByCode = jest.fn().mockResolvedValue(createStep());
    promptRepository.findActiveByCodeAndVariant = jest
      .fn()
      .mockResolvedValue(null);
    stepExecutorService.execute = jest.fn().mockResolvedValue(executionResult);

    const useCase = new RunUserFlowsStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        componentDescription: 'Payment card component.',
        gapAnalysis: gapAnalysisOutput,
        parsing: parsingOutput,
        resolvingGaps: resolvingGapsOutput,
      }),
    ).resolves.toEqual(executionResult);

    expect(stepExecutorService.execute).toHaveBeenCalledWith({
      input: {
        componentDescription: 'Payment card component.',
        gapAnalysis: gapAnalysisOutput,
        parsing: parsingOutput,
        resolvingGaps: resolvingGapsOutput,
      },
      prompt: expect.objectContaining({
        code: 'user_flows',
        stepCode: 'user_flows',
        variant: 'control',
      }),
      step: createStep(),
    });
  });
});
