import { IComponentInterfacesStepOutput } from '../../component-interfaces/types';
import { DEFAULT_DESIGN_SYSTEM_CONTEXT } from '../../design-system/constants';
import { IE2eTestsStepOutput } from '../../e2e-tests/types';
import { IGapAnalysisStepOutput } from '../../gap-analysis/types';
import { PromptRepository } from '../../prompt/repositories/prompt.repository';
import { IPrompt } from '../../prompt/types';
import { IRunGeneratedCodeArtifact } from '../../run/types';
import { IResolvingGapsStepOutput } from '../../resolving-gaps/types';
import { StepRepository } from '../../step/repositories/step.repository';
import { StepExecutorService } from '../../step/services/step-executor.service';
import { IStep, IStepExecutionResult } from '../../step/types';
import { COMPONENT_STATE_POLICY, IParsingStepOutput } from '../../types';
import { IUnitTestsStepOutput } from '../../unit-tests/types';
import { IUserFlowsStepOutput } from '../../user-flows/types';
import { IValidationStepInput, IValidationStepOutput } from '../types';
import { RunValidationStepUseCase } from './run-validation-step.use-case';

interface IValidationStepExecutorRequest {
  input: IValidationStepInput;
  prompt: IPrompt;
  step: IStep;
}

interface IValidationStepExecutorServiceMock {
  execute: jest.Mock<
    Promise<IStepExecutionResult<IValidationStepOutput>>,
    [IValidationStepExecutorRequest]
  >;
}

describe('RunValidationStepUseCase', () => {
  const createPrompt = (): IPrompt => {
    return {
      code: 'validation',
      isActive: true,
      stepCode: 'validation',
      system: 'system prompt',
      userTemplate: 'template {{input}}',
      v: 1,
      variant: 'control',
    };
  };

  const createStep = (): IStep => {
    return {
      code: 'validation',
      inputSchema: null,
      isActive: true,
      maxRetries: 2,
      name: 'Validation',
      outputSchema: null,
      promptCode: 'validation',
      promptVariant: 'control',
      purpose: 'Validate generated component output.',
      v: 1,
      validation: {
        validateInputSchema: true,
        validateOutputSchema: true,
      },
    };
  };

  const createComponentInterfaces = (): {
    components: IComponentInterfacesStepOutput[];
  } => {
    return {
      components: [
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
      ],
      constraints: [],
      content: [],
      interactions: [],
      rootComponentCode: 'payment_card',
      specifiedStates: [
        {
          code: 'selected',
          componentCode: 'payment_card',
          description: 'Selected card state.',
          isExplicit: true,
          name: 'selected',
        },
      ],
      tokenReferences: [],
    };
  };

  const createGapAnalysisOutput = (): IGapAnalysisStepOutput => {
    return {
      accessibilityGaps: ['Card selection must be keyboard reachable.'],
      missingStates: ['Error state is not explicitly defined.'],
      recommendations: ['Define selected and error states.'],
      responsiveGaps: ['Action placement on narrow widths is not defined.'],
    };
  };

  const createResolvingGapsOutput = (): IResolvingGapsStepOutput => {
    return {
      decisions: [
        {
          affectedComponentCodes: ['payment_card'],
          code: 'define_error_state',
          decision:
            'Add an explicit error state for invalid destructive actions.',
          rationale: 'This resolves the missing error-state gap.',
          sourceGap: 'Error state is not explicitly defined.',
        },
      ],
    };
  };

  const createGeneratedCode = (): IRunGeneratedCodeArtifact => {
    return {
      components: [
        {
          componentCode: 'payment_card',
          files: [
            {
              content:
                'export function PaymentCard() { return <div style={{ color: "var(--color-text-primary)" }} />; }',
              filename:
                '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
            },
          ],
          statesCovered: ['selected'],
          tokensUsed: ['--color-text-primary'],
        },
      ],
      files: [
        {
          content:
            'export function PaymentCard() { return <div style={{ color: "var(--color-text-primary)" }} />; }',
          filename:
            '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
        },
      ],
      framework: 'React',
      statesCovered: ['selected'],
      tokensUsed: ['--color-text-primary'],
    };
  };

  const createUnitTests = (): { components: IUnitTestsStepOutput[] } => {
    return {
      components: [
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

  const createE2eTests = (): IE2eTestsStepOutput => {
    return {
      coveredBehaviors: ['propagates selection through composed behavior'],
      coveredComponentCodes: ['payment_card'],
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

  const createUserFlowsOutput = (): IUserFlowsStepOutput => {
    return {
      flows: [
        {
          code: 'select_saved_card_fast_path',
          completionCriteria: 'The card is selected.',
          kind: 'shortest_happy',
          name: 'Select card',
          steps: [
            {
              action: 'Select card',
              code: 'select_card',
              componentCode: 'payment_card',
              expectedResult: 'Card is selected.',
              inputData: null,
            },
          ],
        },
      ],
    };
  };

  const createOutput = (): IValidationStepOutput => {
    return {
      accessibilityScore: 'needs_attention',
      affectedComponentCodes: [],
      contractCompatibilityIssues: [],
      hallucinationsCaught: [],
      isRegenerationRequired: false,
      issuesFound: ['Keyboard focus styling needs explicit coverage.'],
      regenerationReasons: [],
      stateCoverage: {
        coveredCount: 1,
        label: '1/2',
        totalCount: 2,
      },
      tokenCompliance: true,
    };
  };

  const createExecutionResult =
    (): IStepExecutionResult<IValidationStepOutput> => {
      return {
        attempts: 1,
        output: createOutput(),
        rawOutput: '{"tokenCompliance":true}',
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

  const createStepExecutorServiceMock =
    (): IValidationStepExecutorServiceMock => {
      return {
        execute: jest.fn<
          Promise<IStepExecutionResult<IValidationStepOutput>>,
          [IValidationStepExecutorRequest]
        >(),
      };
    };

  it('loads the validation step and prompt, executes the step, and returns deterministic token and state findings', async () => {
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
    stepExecutorService.execute = jest
      .fn<
        Promise<IStepExecutionResult<IValidationStepOutput>>,
        [IValidationStepExecutorRequest]
      >()
      .mockResolvedValue(executionResult);

    const useCase = new RunValidationStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        componentDescription: 'Payment card component.',
        componentInterfaces: createComponentInterfaces(),
        designSystemContext: DEFAULT_DESIGN_SYSTEM_CONTEXT,
        e2eTests: createE2eTests(),
        generatedCode: createGeneratedCode(),
        gapAnalysis: createGapAnalysisOutput(),
        parsing: createParsingOutput(),
        resolvingGaps: createResolvingGapsOutput(),
        unitTests: createUnitTests(),
        userFlows: createUserFlowsOutput(),
      }),
    ).resolves.toEqual({
      attempts: 1,
      output: {
        accessibilityScore: 'needs_attention',
        affectedComponentCodes: ['payment_card'],
        contractCompatibilityIssues: [],
        hallucinationsCaught: [],
        isRegenerationRequired: true,
        issuesFound: [
          'Missing required states: error, invalid',
          'Keyboard focus styling needs explicit coverage.',
        ],
        regenerationReasons: [
          {
            componentCode: 'payment_card',
            reasons: ['Missing required states: error, invalid'],
          },
        ],
        stateCoverage: {
          coveredCount: 1,
          label: '1/3',
          totalCount: 3,
        },
        tokenCompliance: true,
      },
      rawOutput: '{"tokenCompliance":true}',
      tokenUsage: executionResult.tokenUsage,
    });

    expect(stepRepository.findActiveByCode).toHaveBeenCalledWith('validation');
    expect(promptRepository.findActiveByCodeAndVariant).toHaveBeenCalledWith(
      'validation',
      'control',
    );
    expect(stepExecutorService.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt,
        step,
      }),
    );

    const executeCall = stepExecutorService.execute.mock.calls[0]?.[0];

    expect(executeCall).toBeDefined();
    expect(executeCall.input).toEqual(
      expect.objectContaining({
        componentDescription: 'Payment card component.',
        designSystemContext: DEFAULT_DESIGN_SYSTEM_CONTEXT,
        deterministicSummary: {
          coveredStates: ['selected'],
          detectedHallucinations: [],
          knownTokenCompliance: true,
          missingStates: ['error', 'invalid'],
          requiredStates: ['error', 'invalid', 'selected'],
          stateCoverage: {
            coveredCount: 1,
            label: '1/3',
            totalCount: 3,
          },
        },
      }),
    );
  });

  it('requests selective regeneration for components with hallucinated tokens', async () => {
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
    stepExecutorService.execute = jest
      .fn<
        Promise<IStepExecutionResult<IValidationStepOutput>>,
        [IValidationStepExecutorRequest]
      >()
      .mockResolvedValue({
        ...executionResult,
        output: {
          ...executionResult.output,
          issuesFound: [],
        },
      });

    const useCase = new RunValidationStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        componentDescription: 'Payment card component.',
        componentInterfaces: createComponentInterfaces(),
        designSystemContext: DEFAULT_DESIGN_SYSTEM_CONTEXT,
        e2eTests: createE2eTests(),
        generatedCode: {
          ...createGeneratedCode(),
          components: [
            {
              ...createGeneratedCode().components[0],
              files: [
                {
                  content:
                    'export function PaymentCard() { return <div style={{ borderColor: "var(--imagined-border)" }} />; }',
                  filename:
                    '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
                },
              ],
              tokensUsed: ['--imagined-border'],
            },
          ],
          files: [
            {
              content:
                'export function PaymentCard() { return <div style={{ borderColor: "var(--imagined-border)" }} />; }',
              filename:
                '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
            },
          ],
          tokensUsed: ['--imagined-border'],
        },
        gapAnalysis: createGapAnalysisOutput(),
        parsing: createParsingOutput(),
        resolvingGaps: createResolvingGapsOutput(),
        unitTests: createUnitTests(),
        userFlows: createUserFlowsOutput(),
      }),
    ).resolves.toEqual({
      attempts: 1,
      output: {
        accessibilityScore: 'needs_attention',
        affectedComponentCodes: ['payment_card'],
        contractCompatibilityIssues: [],
        hallucinationsCaught: ['--imagined-border'],
        isRegenerationRequired: true,
        issuesFound: [
          'Unknown design-system tokens or CSS variables found: --imagined-border',
          'Missing required states: error, invalid',
        ],
        regenerationReasons: [
          {
            componentCode: 'payment_card',
            reasons: [
              'Unknown design-system tokens or CSS variables found: --imagined-border',
              'Missing required states: error, invalid',
            ],
          },
        ],
        stateCoverage: {
          coveredCount: 1,
          label: '1/3',
          totalCount: 3,
        },
        tokenCompliance: false,
      },
      rawOutput: '{"tokenCompliance":true}',
      tokenUsage: executionResult.tokenUsage,
    });

    const executeCall = stepExecutorService.execute.mock.calls[0]?.[0];

    expect(executeCall).toBeDefined();
    expect(executeCall.input).toEqual(
      expect.objectContaining({
        deterministicSummary: {
          coveredStates: ['selected'],
          detectedHallucinations: ['--imagined-border'],
          knownTokenCompliance: false,
          missingStates: ['error', 'invalid'],
          requiredStates: ['error', 'invalid', 'selected'],
          stateCoverage: {
            coveredCount: 1,
            label: '1/3',
            totalCount: 3,
          },
        },
      }),
    );
  });
});
