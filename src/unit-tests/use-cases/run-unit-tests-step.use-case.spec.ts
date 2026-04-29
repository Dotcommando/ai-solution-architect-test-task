import { IComponentInterfacesStepOutput } from '../../component-interfaces/types';
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
import { IUserFlowsStepOutput } from '../../user-flows/types';
import { IUnitTestsStepOutput } from '../types';
import { RunUnitTestsStepUseCase } from './run-unit-tests-step.use-case';

describe('RunUnitTestsStepUseCase', () => {
  const createPrompt = (): IPrompt => {
    return {
      code: 'unit_tests',
      isActive: true,
      stepCode: 'unit_tests',
      system: 'system prompt',
      userTemplate: 'template {{input}}',
      v: 1,
      variant: 'control',
    };
  };

  const createStep = (): IStep => {
    return {
      code: 'unit_tests',
      inputSchema: null,
      isActive: true,
      maxRetries: 2,
      name: 'Unit Tests',
      outputSchema: null,
      promptCode: 'unit_tests',
      promptVariant: 'control',
      purpose: 'Generate unit test files one component at a time.',
      v: 1,
      validation: {
        validateInputSchema: true,
        validateOutputSchema: true,
      },
    };
  };

  const createTargetComponent = (): IParsedComponent => {
    return {
      code: 'card_brand_icon',
      name: 'Card brand icon',
      parentCode: 'payment_card',
      purpose: 'Show the payment card brand.',
      statePolicy: COMPONENT_STATE_POLICY.DUMB,
      type: 'icon',
    };
  };

  const createTargetComponentInterface = (): IComponentInterfacesStepOutput => {
    return {
      accepts: [
        {
          description:
            'Accessible payment network label to render with the icon.',
          name: 'brand_label',
          required: true,
          type: 'string',
        },
      ],
      componentCode: 'card_brand_icon',
      componentName: 'Card brand icon',
      returns: [],
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
          statePolicy: COMPONENT_STATE_POLICY.SMART,
          type: 'card',
        },
        createTargetComponent(),
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
      accessibilityGaps: ['Brand icon needs an accessible label.'],
      missingStates: ['Selected state is not explicitly defined.'],
      recommendations: ['Define accessible brand-label behavior.'],
      responsiveGaps: ['Icon alignment on narrow widths is not defined.'],
    };
  };

  const createResolvingGapsOutput = (): IResolvingGapsStepOutput => {
    return {
      decisions: [
        {
          affectedComponentCodes: ['card_brand_icon'],
          code: 'expose_brand_label',
          decision: 'Expose the payment network name as accessible text.',
          rationale: 'This resolves the icon-only accessibility gap.',
          sourceGap: 'Brand icon needs an accessible label.',
        },
      ],
    };
  };

  const createUserFlowsOutput = (): IUserFlowsStepOutput => {
    return {
      flows: [
        {
          code: 'select_saved_card_fast_path',
          completionCriteria: 'The user selects a saved card.',
          kind: 'shortest_happy',
          name: 'Select saved card quickly',
          steps: [
            {
              action: 'User reviews the brand icon and selects the card.',
              code: 'select_card',
              componentCode: 'payment_card',
              expectedResult: 'The card is selected.',
              inputData: null,
            },
          ],
        },
        {
          code: 'review_card_before_selection',
          completionCriteria: 'The user reviews details before selection.',
          kind: 'exploratory_happy',
          name: 'Review before selecting',
          steps: [
            {
              action: 'User inspects the brand icon and details.',
              code: 'review_card',
              componentCode: 'card_brand_icon',
              expectedResult: 'Brand information remains visible.',
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
              action: 'User attempts an invalid action.',
              code: 'invalid_action',
              componentCode: 'payment_card',
              expectedResult: 'The UI rejects the invalid action.',
              inputData: 'Invalid action request',
            },
          ],
        },
      ],
    };
  };

  const createOutput = (): IUnitTestsStepOutput => {
    return {
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
    };
  };

  const createExecutionResult =
    (): IStepExecutionResult<IUnitTestsStepOutput> => {
      return {
        attempts: 1,
        output: createOutput(),
        rawOutput: '{"componentCode":"card_brand_icon"}',
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

  it('loads the unit-tests step and prompt, executes the step, and returns the result', async () => {
    const promptRepository = createPromptRepositoryMock();
    const stepRepository = createStepRepositoryMock();
    const stepExecutorService = createStepExecutorServiceMock();
    const parsingOutput = createParsingOutput();
    const gapAnalysisOutput = createGapAnalysisOutput();
    const resolvingGapsOutput = createResolvingGapsOutput();
    const userFlowsOutput = createUserFlowsOutput();
    const targetComponent = createTargetComponent();
    const targetComponentInterface = createTargetComponentInterface();
    const componentInterfaces = {
      components: [
        targetComponentInterface,
        {
          accepts: [
            {
              description: 'Saved card data.',
              name: 'card_summary',
              required: true,
              type: 'PaymentCardSummary',
            },
          ],
          componentCode: 'payment_card',
          componentName: 'Payment card',
          returns: [],
        },
      ],
    };
    const componentSourceFiles = [
      {
        componentCode: 'card_brand_icon',
        filename:
          '/workspace/generated/frontend/src/components/CardBrandIcon/CardBrandIcon.tsx',
      },
      {
        componentCode: 'payment_card',
        filename:
          '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
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

    const useCase = new RunUnitTestsStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        componentDescription: 'Payment card component.',
        componentInterfaces,
        componentSourceFiles,
        framework: 'React',
        gapAnalysis: gapAnalysisOutput,
        parsing: parsingOutput,
        projectRootPath: '/workspace/generated/frontend',
        resolvingGaps: resolvingGapsOutput,
        targetComponent,
        targetComponentInterface,
        targetSourceFilePath:
          '/workspace/generated/frontend/src/components/CardBrandIcon/CardBrandIcon.tsx',
        targetTestFilePath:
          '/workspace/generated/frontend/src/components/CardBrandIcon/CardBrandIcon.spec.tsx',
        testFramework: 'Jest + React Testing Library',
        userFlows: userFlowsOutput,
      }),
    ).resolves.toEqual(executionResult);

    expect(stepRepository.findActiveByCode).toHaveBeenCalledWith('unit_tests');
    expect(promptRepository.findActiveByCodeAndVariant).toHaveBeenCalledWith(
      'unit_tests',
      'control',
    );
    expect(stepExecutorService.execute).toHaveBeenCalledWith({
      input: {
        componentDescription: 'Payment card component.',
        componentInterfaces,
        componentSourceFiles,
        framework: 'React',
        gapAnalysis: gapAnalysisOutput,
        parsing: parsingOutput,
        projectRootPath: '/workspace/generated/frontend',
        resolvingGaps: resolvingGapsOutput,
        targetComponent,
        targetComponentInterface,
        targetSourceFilePath:
          '/workspace/generated/frontend/src/components/CardBrandIcon/CardBrandIcon.tsx',
        targetTestFilePath:
          '/workspace/generated/frontend/src/components/CardBrandIcon/CardBrandIcon.spec.tsx',
        testFramework: 'Jest + React Testing Library',
        userFlows: userFlowsOutput,
      },
      prompt,
      step,
    });
  });
});
