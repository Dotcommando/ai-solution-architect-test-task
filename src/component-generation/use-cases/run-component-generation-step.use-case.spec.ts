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
import { IComponentGenerationStepOutput } from '../types';
import { RunComponentGenerationStepUseCase } from './run-component-generation-step.use-case';

describe('RunComponentGenerationStepUseCase', () => {
  const createPrompt = (): IPrompt => {
    return {
      code: 'component_generation',
      isActive: true,
      stepCode: 'component_generation',
      system: 'system prompt',
      userTemplate: 'template {{input}}',
      v: 1,
      variant: 'control',
    };
  };

  const createStep = (): IStep => {
    return {
      code: 'component_generation',
      inputSchema: null,
      isActive: true,
      maxRetries: 2,
      name: 'Component Generation',
      outputSchema: null,
      promptCode: 'component_generation',
      promptVariant: 'control',
      purpose: 'Generate component files one component at a time.',
      v: 1,
      validation: {
        validateInputSchema: true,
        validateOutputSchema: true,
      },
    };
  };

  const createTargetComponent = (): IParsedComponent => {
    return {
      code: 'payment_card',
      name: 'Payment card',
      parentCode: null,
      purpose: 'Display a saved payment card and allow selection.',
      statePolicy: COMPONENT_STATE_POLICY.SMART,
      type: 'card',
    };
  };

  const createRelatedComponentInterface =
    (): IComponentInterfacesStepOutput => {
      return {
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
      };
    };

  const createTargetComponentInterface = (): IComponentInterfacesStepOutput => {
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
        createTargetComponent(),
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
      ],
    };
  };

  const createTargetUnitTests = (): IUnitTestsStepOutput => {
    return {
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
    };
  };

  const createE2eTestsOutput = (): IE2eTestsStepOutput => {
    return {
      coveredBehaviors: ['propagates selection through composed behavior'],
      coveredComponentCodes: ['payment_card', 'card_brand_icon'],
      coveredFlowCodes: ['select_saved_card_fast_path'],
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

  const createOutput = (): IComponentGenerationStepOutput => {
    return {
      componentCode: 'payment_card',
      componentName: 'Payment card',
      files: [
        {
          content: 'export function PaymentCard() { return null; }',
          filename:
            '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
        },
      ],
      statesCovered: ['selected'],
      tokensUsed: ['card spacing'],
    };
  };

  const createExecutionResult =
    (): IStepExecutionResult<IComponentGenerationStepOutput> => {
      return {
        attempts: 1,
        output: createOutput(),
        rawOutput: '{"componentCode":"payment_card"}',
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

  it('loads the component-generation step and prompt, executes the step, and returns the result', async () => {
    const promptRepository = createPromptRepositoryMock();
    const stepRepository = createStepRepositoryMock();
    const stepExecutorService = createStepExecutorServiceMock();
    const step = createStep();
    const prompt = createPrompt();
    const executionResult = createExecutionResult();
    const targetComponent = createTargetComponent();
    const targetComponentInterface = createTargetComponentInterface();
    const relatedComponentInterfaces = [createRelatedComponentInterface()];
    const relatedComponentSourceFiles = [
      {
        componentCode: 'card_brand_icon',
        filename:
          '/workspace/generated/frontend/src/components/CardBrandIcon/CardBrandIcon.tsx',
      },
    ];

    stepRepository.findActiveByCode = jest.fn().mockResolvedValue(step);
    promptRepository.findActiveByCodeAndVariant = jest
      .fn()
      .mockResolvedValue(prompt);
    stepExecutorService.execute = jest.fn().mockResolvedValue(executionResult);

    const useCase = new RunComponentGenerationStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        componentDescription: 'Payment card component.',
        e2eTests: createE2eTestsOutput(),
        framework: 'React',
        gapAnalysis: createGapAnalysisOutput(),
        parsing: createParsingOutput(),
        projectRootPath: '/workspace/generated/frontend',
        relatedComponentInterfaces,
        relatedComponentSourceFiles,
        resolvingGaps: createResolvingGapsOutput(),
        targetComponent,
        targetComponentInterface,
        targetSourceFilePath:
          '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
        targetUnitTests: createTargetUnitTests(),
        testFramework: 'Jest + React Testing Library',
        userFlows: createUserFlowsOutput(),
      }),
    ).resolves.toEqual(executionResult);

    expect(stepRepository.findActiveByCode).toHaveBeenCalledWith(
      'component_generation',
    );
    expect(promptRepository.findActiveByCodeAndVariant).toHaveBeenCalledWith(
      'component_generation',
      'control',
    );
    expect(stepExecutorService.execute).toHaveBeenCalledWith({
      input: {
        componentDescription: 'Payment card component.',
        e2eTests: createE2eTestsOutput(),
        framework: 'React',
        gapAnalysis: createGapAnalysisOutput(),
        parsing: createParsingOutput(),
        projectRootPath: '/workspace/generated/frontend',
        relatedComponentInterfaces,
        relatedComponentSourceFiles,
        resolvingGaps: createResolvingGapsOutput(),
        targetComponent,
        targetComponentInterface,
        targetSourceFilePath:
          '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
        targetUnitTests: createTargetUnitTests(),
        testFramework: 'Jest + React Testing Library',
        userFlows: createUserFlowsOutput(),
      },
      prompt,
      step,
    });
  });
});
