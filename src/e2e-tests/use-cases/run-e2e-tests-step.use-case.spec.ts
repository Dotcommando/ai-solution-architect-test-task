import { IComponentInterfacesStepOutput } from '../../component-interfaces/types';
import { IE2eTestsStepOutput } from '../../e2e-tests/types';
import { IGapAnalysisStepOutput } from '../../gap-analysis/types';
import { PromptRepository } from '../../prompt/repositories/prompt.repository';
import { IPrompt } from '../../prompt/types';
import { IResolvingGapsStepOutput } from '../../resolving-gaps/types';
import { StepRepository } from '../../step/repositories/step.repository';
import { StepExecutorService } from '../../step/services/step-executor.service';
import { IStep, IStepExecutionResult } from '../../step/types';
import {
  COMPONENT_STATE_POLICY,
  IParsedComponent,
  IParsingStepOutput,
} from '../../types';
import { IUnitTestsStepOutput } from '../../unit-tests/types';
import { IUserFlowsStepOutput } from '../../user-flows/types';
import { RunE2eTestsStepUseCase } from './run-e2e-tests-step.use-case';

describe('RunE2eTestsStepUseCase', () => {
  const createPrompt = (): IPrompt => {
    return {
      code: 'e2e_tests',
      isActive: true,
      stepCode: 'e2e_tests',
      system: 'system prompt',
      userTemplate: 'template {{input}}',
      v: 1,
      variant: 'control',
    };
  };

  const createStep = (): IStep => {
    return {
      code: 'e2e_tests',
      inputSchema: null,
      isActive: true,
      maxRetries: 2,
      name: 'E2E Tests',
      outputSchema: null,
      promptCode: 'e2e_tests',
      promptVariant: 'control',
      purpose: 'Generate one composed e2e test file for the root component.',
      v: 1,
      validation: {
        validateInputSchema: true,
        validateOutputSchema: true,
      },
    };
  };

  const createRootComponent = (): IParsedComponent => {
    return {
      code: 'payment_card',
      name: 'Payment card',
      parentCode: null,
      purpose: 'Display a saved payment card and allow selection.',
      statePolicy: COMPONENT_STATE_POLICY.SMART,
      type: 'card',
    };
  };

  const createRootComponentInterface = (): IComponentInterfacesStepOutput => {
    return {
      accepts: [
        {
          description: 'Saved card data used to render the card.',
          name: 'card_summary',
          required: true,
          type: 'PaymentCardSummary',
        },
      ],
      componentCode: 'payment_card',
      componentName: 'Payment card',
      returns: [
        {
          description: 'Selection callback.',
          name: 'on_select',
          required: true,
          type: '(payload: SelectPaymentCardPayload) => void',
        },
      ],
    };
  };

  const createParsingOutput = (): IParsingStepOutput => {
    return {
      businessContext: 'merchant dashboard',
      components: [
        createRootComponent(),
        {
          code: 'card_brand_icon',
          name: 'Card brand icon',
          parentCode: 'payment_card',
          purpose: 'Show the card brand.',
          statePolicy: COMPONENT_STATE_POLICY.DUMB,
          type: 'icon',
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
      recommendations: ['Define selected and recovery states.'],
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

  const createUserFlowsOutput = (): IUserFlowsStepOutput => {
    return {
      flows: [
        {
          code: 'select_saved_card_fast_path',
          completionCriteria: 'A saved card is selected.',
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
          completionCriteria: 'A saved card is selected after review.',
          kind: 'exploratory_happy',
          name: 'Review and then select card',
          steps: [
            {
              action: 'User reviews card details.',
              code: 'review_card_details',
              componentCode: 'payment_card',
              expectedResult: 'Card details remain visible.',
              inputData: null,
            },
          ],
        },
        {
          code: 'invalid_delete_attempt',
          completionCriteria: 'The invalid action is rejected.',
          kind: 'unhappy_invalid_input',
          name: 'Invalid delete attempt',
          steps: [
            {
              action: 'User attempts an invalid destructive action.',
              code: 'attempt_invalid_action',
              componentCode: 'payment_card',
              expectedResult: 'The UI blocks the action.',
              inputData: 'Delete requested without confirmation',
            },
          ],
        },
      ],
    };
  };

  const createUnitTestsOutput = (): { components: IUnitTestsStepOutput[] } => {
    return {
      components: [
        {
          componentCode: 'card_brand_icon',
          componentName: 'Card brand icon',
          coveredBehaviors: ['renders the accessible brand label'],
          coveredStates: [],
          files: [
            {
              content: 'describe("CardBrandIcon", () => {});',
              filename:
                '/workspace/generated/frontend/src/components/CardBrandIcon/CardBrandIcon.spec.tsx',
            },
          ],
        },
        {
          componentCode: 'payment_card',
          componentName: 'Payment card',
          coveredBehaviors: ['calls on_select with the selected card payload'],
          coveredStates: ['selected'],
          files: [
            {
              content: 'describe("PaymentCard", () => {});',
              filename:
                '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.spec.tsx',
            },
          ],
        },
      ],
    };
  };

  const createOutput = (): IE2eTestsStepOutput => {
    return {
      coveredBehaviors: [
        'propagates card selection from user interaction to parent callback',
      ],
      coveredComponentCodes: ['payment_card', 'card_brand_icon'],
      coveredFlowCodes: [
        'select_saved_card_fast_path',
        'review_then_select_card',
        'invalid_delete_attempt',
      ],
      coveredStates: ['selected'],
      files: [
        {
          content: 'describe("PaymentCard e2e", () => {});',
          filename:
            '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.e2e.spec.tsx',
        },
      ],
      rootComponentCode: 'payment_card',
      rootComponentName: 'Payment card',
    };
  };

  const createExecutionResult =
    (): IStepExecutionResult<IE2eTestsStepOutput> => {
      return {
        attempts: 1,
        output: createOutput(),
        rawOutput: '{"rootComponentCode":"payment_card"}',
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

  it('loads the e2e-tests step and prompt, executes the step, and returns the result', async () => {
    const promptRepository = createPromptRepositoryMock();
    const stepRepository = createStepRepositoryMock();
    const stepExecutorService = createStepExecutorServiceMock();
    const parsingOutput = createParsingOutput();
    const gapAnalysisOutput = createGapAnalysisOutput();
    const resolvingGapsOutput = createResolvingGapsOutput();
    const userFlowsOutput = createUserFlowsOutput();
    const rootComponent = createRootComponent();
    const rootComponentInterface = createRootComponentInterface();
    const componentInterfaces = {
      components: [
        rootComponentInterface,
        {
          accepts: [
            {
              description: 'Accessible payment network label.',
              name: 'brand_label',
              required: true,
              type: 'string',
            },
          ],
          componentCode: 'card_brand_icon',
          componentName: 'Card brand icon',
          returns: [],
        },
      ],
    };
    const componentSourceFiles = [
      {
        componentCode: 'payment_card',
        filename:
          '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
      },
      {
        componentCode: 'card_brand_icon',
        filename:
          '/workspace/generated/frontend/src/components/CardBrandIcon/CardBrandIcon.tsx',
      },
    ];
    const step = createStep();
    const prompt = createPrompt();
    const executionResult = createExecutionResult();

    stepRepository.findActiveByCode = jest.fn().mockResolvedValue(step);
    promptRepository.findActiveByCodeAndVariant = jest
      .fn()
      .mockResolvedValue(prompt);
    stepExecutorService.execute = jest.fn().mockResolvedValue(executionResult);

    const useCase = new RunE2eTestsStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        componentDescription: 'Payment card component.',
        componentInterfaces,
        componentSourceFiles,
        e2eTestFilePath:
          '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.e2e.spec.tsx',
        framework: 'React',
        gapAnalysis: gapAnalysisOutput,
        parsing: parsingOutput,
        projectRootPath: '/workspace/generated/frontend',
        resolvingGaps: resolvingGapsOutput,
        rootComponent,
        rootComponentInterface,
        rootSourceFilePath:
          '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
        testFramework: 'Jest + React Testing Library',
        unitTests: createUnitTestsOutput(),
        userFlows: userFlowsOutput,
      }),
    ).resolves.toEqual(executionResult);

    expect(stepRepository.findActiveByCode).toHaveBeenCalledWith('e2e_tests');
    expect(promptRepository.findActiveByCodeAndVariant).toHaveBeenCalledWith(
      'e2e_tests',
      'control',
    );
    expect(stepExecutorService.execute).toHaveBeenCalledWith({
      input: {
        componentDescription: 'Payment card component.',
        componentInterfaces,
        componentSourceFiles,
        e2eTestFilePath:
          '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.e2e.spec.tsx',
        framework: 'React',
        gapAnalysis: gapAnalysisOutput,
        parsing: parsingOutput,
        projectRootPath: '/workspace/generated/frontend',
        resolvingGaps: resolvingGapsOutput,
        rootComponent,
        rootComponentInterface,
        rootSourceFilePath:
          '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
        testFramework: 'Jest + React Testing Library',
        unitTests: createUnitTestsOutput(),
        userFlows: userFlowsOutput,
      },
      prompt,
      step,
    });
  });
});
