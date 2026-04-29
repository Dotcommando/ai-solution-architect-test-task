import { DEFAULT_CANONICAL_STATE_MODEL } from '../../canonical-state-model/constants';
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

  const createDeleteCardActionInterface =
    (): IComponentInterfacesStepOutput => {
      return {
        accepts: [
          {
            description: 'Request delete callback.',
            name: 'on_request_delete',
            required: true,
            type: '(payload: RequestDeletePayload) => void',
          },
          {
            description: 'Confirm delete callback.',
            name: 'on_confirm_delete',
            required: true,
            type: '(payload: ConfirmDeletePayload) => void',
          },
          {
            description: 'Cancel delete callback.',
            name: 'on_cancel_delete',
            required: true,
            type: '(payload: CancelDeletePayload) => void',
          },
        ],
        componentCode: 'delete_card_action',
        componentName: 'Delete card action',
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
        canonicalStateModel: DEFAULT_CANONICAL_STATE_MODEL,
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
          'Missing required states: error',
          'Keyboard focus styling needs explicit coverage.',
        ],
        regenerationReasons: [
          {
            componentCode: 'payment_card',
            reasons: ['Missing required states: error'],
          },
        ],
        stateCoverage: {
          coveredCount: 1,
          label: '1/2',
          totalCount: 2,
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
        canonicalStateModel: DEFAULT_CANONICAL_STATE_MODEL,
        componentDescription: 'Payment card component.',
        designSystemContext: DEFAULT_DESIGN_SYSTEM_CONTEXT,
        deterministicSummary: {
          coveredStates: ['selected'],
          detectedHallucinations: [],
          knownTokenCompliance: true,
          missingStates: ['error'],
          requiredStates: ['error', 'selected'],
          stateCoverage: {
            coveredCount: 1,
            label: '1/2',
            totalCount: 2,
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
        canonicalStateModel: DEFAULT_CANONICAL_STATE_MODEL,
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
          'Missing required states: error',
        ],
        regenerationReasons: [
          {
            componentCode: 'payment_card',
            reasons: [
              'Unknown design-system tokens or CSS variables found: --imagined-border',
              'Missing required states: error',
            ],
          },
        ],
        stateCoverage: {
          coveredCount: 1,
          label: '1/2',
          totalCount: 2,
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
          missingStates: ['error'],
          requiredStates: ['error', 'selected'],
          stateCoverage: {
            coveredCount: 1,
            label: '1/2',
            totalCount: 2,
          },
        },
      }),
    );
  });

  it('does not request regeneration when hard state blockers are already covered and only soft issues remain', async () => {
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
          issuesFound: [
            'Delete action buttons could use more specific accessible labels.',
          ],
        },
      });

    const useCase = new RunValidationStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        canonicalStateModel: DEFAULT_CANONICAL_STATE_MODEL,
        componentDescription: 'Payment card component.',
        componentInterfaces: createComponentInterfaces(),
        designSystemContext: DEFAULT_DESIGN_SYSTEM_CONTEXT,
        e2eTests: null,
        generatedCode: {
          ...createGeneratedCode(),
          components: [
            {
              ...createGeneratedCode().components[0],
              statesCovered: [
                'selected=true',
                'delete_error present',
                'invalid destructive action blocked',
              ],
            },
          ],
          statesCovered: [
            'selected=true',
            'delete_error present',
            'invalid destructive action blocked',
          ],
        },
        gapAnalysis: createGapAnalysisOutput(),
        parsing: createParsingOutput(),
        resolvingGaps: createResolvingGapsOutput(),
        unitTests: {
          components: [],
        },
        userFlows: createUserFlowsOutput(),
      }),
    ).resolves.toEqual({
      attempts: 1,
      output: {
        accessibilityScore: 'needs_attention',
        affectedComponentCodes: [],
        contractCompatibilityIssues: [],
        hallucinationsCaught: [],
        isRegenerationRequired: false,
        issuesFound: [
          'Delete action buttons could use more specific accessible labels.',
        ],
        regenerationReasons: [],
        stateCoverage: {
          coveredCount: 2,
          label: '2/2',
          totalCount: 2,
        },
        tokenCompliance: true,
      },
      rawOutput: '{"tokenCompliance":true}',
      tokenUsage: executionResult.tokenUsage,
    });

    const executeCall = stepExecutorService.execute.mock.calls[0]?.[0];

    expect(executeCall).toBeDefined();
    expect(executeCall.input.deterministicSummary.coveredStates).toEqual(
      expect.arrayContaining(['selected', 'error', 'invalid']),
    );
    expect(
      executeCall.input.deterministicSummary.detectedHallucinations,
    ).toEqual([]);
    expect(executeCall.input.deterministicSummary.knownTokenCompliance).toBe(
      true,
    );
    expect(executeCall.input.deterministicSummary.missingStates).toEqual([]);
    expect(executeCall.input.deterministicSummary.requiredStates).toEqual([
      'error',
      'selected',
    ]);
    expect(executeCall.input.deterministicSummary.stateCoverage).toEqual({
      coveredCount: 2,
      label: '2/2',
      totalCount: 2,
    });
  });

  it('keeps hover gaps as advisory findings without triggering regeneration', async () => {
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
          issuesFound: ['Hover styling should be visually clearer.'],
        },
      });

    const useCase = new RunValidationStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        canonicalStateModel: DEFAULT_CANONICAL_STATE_MODEL,
        componentDescription: 'Payment card component.',
        componentInterfaces: createComponentInterfaces(),
        designSystemContext: DEFAULT_DESIGN_SYSTEM_CONTEXT,
        e2eTests: null,
        generatedCode: {
          ...createGeneratedCode(),
          components: [
            {
              ...createGeneratedCode().components[0],
              statesCovered: ['selected'],
            },
          ],
          statesCovered: ['selected'],
        },
        gapAnalysis: {
          ...createGapAnalysisOutput(),
          missingStates: ['Hover state is not explicitly defined.'],
        },
        parsing: {
          ...createParsingOutput(),
          specifiedStates: [],
        },
        resolvingGaps: {
          decisions: [],
        },
        unitTests: {
          components: [],
        },
        userFlows: createUserFlowsOutput(),
      }),
    ).resolves.toEqual({
      attempts: 1,
      output: {
        accessibilityScore: 'needs_attention',
        affectedComponentCodes: [],
        contractCompatibilityIssues: [],
        hallucinationsCaught: [],
        isRegenerationRequired: false,
        issuesFound: [
          'Additional interactive states are not explicitly covered: hover',
          'Hover styling should be visually clearer.',
        ],
        regenerationReasons: [],
        stateCoverage: {
          coveredCount: 0,
          label: '0/1',
          totalCount: 1,
        },
        tokenCompliance: true,
      },
      rawOutput: '{"tokenCompliance":true}',
      tokenUsage: executionResult.tokenUsage,
    });
  });

  it('does not request regeneration when loading is covered by deleting and in-progress states', async () => {
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
          issuesFound: ['Focus restore could be more robust.'],
        },
      });

    const useCase = new RunValidationStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        canonicalStateModel: DEFAULT_CANONICAL_STATE_MODEL,
        componentDescription: 'Payment card component.',
        componentInterfaces: createComponentInterfaces(),
        designSystemContext: DEFAULT_DESIGN_SYSTEM_CONTEXT,
        e2eTests: null,
        generatedCode: {
          ...createGeneratedCode(),
          components: [
            {
              ...createGeneratedCode().components[0],
              componentCode: 'payment_card',
              statesCovered: ['deleting in progress'],
            },
            {
              componentCode: 'delete_card_action',
              files: [
                {
                  content:
                    'export function DeleteCardAction() { return null; }',
                  filename:
                    '/workspace/generated/frontend/src/components/DeleteCardAction/DeleteCardAction.tsx',
                },
              ],
              statesCovered: ['deleting (is_deleting=true)'],
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
            {
              content: 'export function DeleteCardAction() { return null; }',
              filename:
                '/workspace/generated/frontend/src/components/DeleteCardAction/DeleteCardAction.tsx',
            },
          ],
          statesCovered: [
            'deleting in progress',
            'deleting (is_deleting=true)',
          ],
        },
        gapAnalysis: {
          ...createGapAnalysisOutput(),
          missingStates: [
            'Deletion in-progress state (loading/spinner, temporarily disable interactions)',
          ],
        },
        parsing: {
          ...createParsingOutput(),
          specifiedStates: [],
        },
        resolvingGaps: {
          decisions: [
            {
              affectedComponentCodes: ['delete_card_action', 'payment_card'],
              code: 'deletion_async_in_progress_behavior',
              decision:
                'During deletion request: show an inline loading indicator on delete_card_action (spinner replacing the icon) and disable both payment_card selection and delete_card_action until the request resolves.',
              rationale:
                'This defines the in-progress state behavior for async deletion.',
              sourceGap:
                'Deletion in-progress state (loading/spinner, temporarily disable interactions)',
            },
          ],
        },
        unitTests: {
          components: [],
        },
        userFlows: createUserFlowsOutput(),
      }),
    ).resolves.toEqual({
      attempts: 1,
      output: {
        accessibilityScore: 'needs_attention',
        affectedComponentCodes: [],
        contractCompatibilityIssues: [],
        hallucinationsCaught: [],
        isRegenerationRequired: false,
        issuesFound: ['Focus restore could be more robust.'],
        regenerationReasons: [],
        stateCoverage: {
          coveredCount: 1,
          label: '1/1',
          totalCount: 1,
        },
        tokenCompliance: true,
      },
      rawOutput: '{"tokenCompliance":true}',
      tokenUsage: executionResult.tokenUsage,
    });
  });

  it('does not request regeneration when success is covered by deleted state handling', async () => {
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
          issuesFound: [
            'Focus handling after deletion could be more explicit.',
          ],
        },
      });

    const useCase = new RunValidationStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        canonicalStateModel: DEFAULT_CANONICAL_STATE_MODEL,
        componentDescription: 'Payment card component.',
        componentInterfaces: createComponentInterfaces(),
        designSystemContext: DEFAULT_DESIGN_SYSTEM_CONTEXT,
        e2eTests: null,
        generatedCode: {
          ...createGeneratedCode(),
          components: [
            {
              ...createGeneratedCode().components[0],
              componentCode: 'payment_card',
              statesCovered: ['deleted=true', 'removed from list'],
            },
          ],
          statesCovered: ['deleted=true', 'removed from list'],
        },
        gapAnalysis: {
          ...createGapAnalysisOutput(),
          missingStates: [
            'Deletion success feedback/removed state handling (animation, toast, list update expectations)',
          ],
        },
        parsing: {
          ...createParsingOutput(),
          specifiedStates: [],
        },
        resolvingGaps: {
          decisions: [
            {
              affectedComponentCodes: ['delete_card_action', 'payment_card'],
              code: 'delete_success_removal_handling',
              decision:
                'On successful deletion, the parent removes the payment_card from the list; the component itself does not animate removal. If the component remains mounted temporarily, it must render nothing when a controlled "deleted" flag is true.',
              rationale:
                'Clarify list-update ownership while preserving a deterministic deleted outcome.',
              sourceGap:
                'Deletion success feedback/removed state handling (animation, toast, list update expectations)',
            },
          ],
        },
        unitTests: {
          components: [],
        },
        userFlows: createUserFlowsOutput(),
      }),
    ).resolves.toEqual({
      attempts: 1,
      output: {
        accessibilityScore: 'needs_attention',
        affectedComponentCodes: [],
        contractCompatibilityIssues: [],
        hallucinationsCaught: [],
        isRegenerationRequired: false,
        issuesFound: ['Focus handling after deletion could be more explicit.'],
        regenerationReasons: [],
        stateCoverage: {
          coveredCount: 1,
          label: '1/1',
          totalCount: 1,
        },
        tokenCompliance: true,
      },
      rawOutput: '{"tokenCompliance":true}',
      tokenUsage: executionResult.tokenUsage,
    });
  });

  it('does not request regeneration when failed is covered by delete error handling', async () => {
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
          issuesFound: ['Backdrop close behavior could be clarified.'],
        },
      });

    const useCase = new RunValidationStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    await expect(
      useCase.execute({
        canonicalStateModel: DEFAULT_CANONICAL_STATE_MODEL,
        componentDescription: 'Payment card component.',
        componentInterfaces: createComponentInterfaces(),
        designSystemContext: DEFAULT_DESIGN_SYSTEM_CONTEXT,
        e2eTests: null,
        generatedCode: {
          ...createGeneratedCode(),
          components: [
            {
              ...createGeneratedCode().components[0],
              componentCode: 'payment_card',
              statesCovered: ['delete error (delete_error_message present)'],
            },
          ],
          statesCovered: ['delete error (delete_error_message present)'],
        },
        gapAnalysis: {
          ...createGapAnalysisOutput(),
          missingStates: [
            'Delete error state (failed deletion messaging and recovery action)',
          ],
        },
        parsing: {
          ...createParsingOutput(),
          specifiedStates: [],
        },
        resolvingGaps: {
          decisions: [
            {
              affectedComponentCodes: ['delete_card_action', 'payment_card'],
              code: 'delete_error_inline_recovery',
              decision:
                'On delete failure: keep the card visible and interactive again, render an inline error message beneath the card details, and keep the delete button available as a retry.',
              rationale:
                'Define the delete failure state and the local recovery path.',
              sourceGap:
                'Delete error state (failed deletion messaging and recovery action)',
            },
          ],
        },
        unitTests: {
          components: [],
        },
        userFlows: createUserFlowsOutput(),
      }),
    ).resolves.toEqual({
      attempts: 1,
      output: {
        accessibilityScore: 'needs_attention',
        affectedComponentCodes: [],
        contractCompatibilityIssues: [],
        hallucinationsCaught: [],
        isRegenerationRequired: false,
        issuesFound: ['Backdrop close behavior could be clarified.'],
        regenerationReasons: [],
        stateCoverage: {
          coveredCount: 2,
          label: '2/2',
          totalCount: 2,
        },
        tokenCompliance: true,
      },
      rawOutput: '{"tokenCompliance":true}',
      tokenUsage: executionResult.tokenUsage,
    });
  });

  it('does not count unit and e2e references as implemented state coverage', async () => {
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
        canonicalStateModel: DEFAULT_CANONICAL_STATE_MODEL,
        componentDescription: 'Payment card component.',
        componentInterfaces: createComponentInterfaces(),
        designSystemContext: DEFAULT_DESIGN_SYSTEM_CONTEXT,
        e2eTests: {
          ...createE2eTests(),
          coveredStates: ['confirming'],
        },
        generatedCode: {
          ...createGeneratedCode(),
          components: [
            {
              ...createGeneratedCode().components[0],
              statesCovered: [],
            },
          ],
          statesCovered: [],
        },
        gapAnalysis: {
          ...createGapAnalysisOutput(),
          missingStates: [
            'Delete confirmation state (modal/popover) to prevent accidental destructive action',
          ],
        },
        parsing: {
          ...createParsingOutput(),
          specifiedStates: [],
        },
        resolvingGaps: {
          decisions: [
            {
              affectedComponentCodes: ['payment_card'],
              code: 'delete_confirmation_dialog',
              decision:
                'Require a confirmation dialog before deletion and open the modal when delete is triggered.',
              rationale:
                'Define the confirmation state before destructive action.',
              sourceGap:
                'Delete confirmation state (modal/popover) to prevent accidental destructive action',
            },
          ],
        },
        unitTests: {
          components: [
            {
              ...createUnitTests().components[0],
              coveredStates: ['confirming'],
            },
          ],
        },
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
        issuesFound: ['Missing required states: confirming'],
        regenerationReasons: [
          {
            componentCode: 'payment_card',
            reasons: ['Missing required states: confirming'],
          },
        ],
        stateCoverage: {
          coveredCount: 0,
          label: '0/1',
          totalCount: 1,
        },
        tokenCompliance: true,
      },
      rawOutput: '{"tokenCompliance":true}',
      tokenUsage: executionResult.tokenUsage,
    });

    const executeCall = stepExecutorService.execute.mock.calls[0]?.[0];

    expect(executeCall).toBeDefined();
    expect(executeCall.input.deterministicSummary.coveredStates).toEqual([]);
  });

  it('adds deterministic contract issues for no-op and missing callback wiring', async () => {
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
          contractCompatibilityIssues: [],
          issuesFound: [],
        },
      });

    const useCase = new RunValidationStepUseCase(
      stepRepository as StepRepository,
      promptRepository as PromptRepository,
      stepExecutorService as StepExecutorService,
    );

    const componentInterfaces = {
      components: [
        createComponentInterfaces().components[0],
        createDeleteCardActionInterface(),
      ],
    };

    const result = await useCase.execute({
      canonicalStateModel: DEFAULT_CANONICAL_STATE_MODEL,
      componentDescription: 'Payment card component.',
      componentInterfaces,
      designSystemContext: DEFAULT_DESIGN_SYSTEM_CONTEXT,
      e2eTests: null,
      generatedCode: {
        components: [
          {
            componentCode: 'delete_card_action',
            files: [
              {
                content:
                  'export function DeleteCardAction(props: { on_request_delete: () => void; on_confirm_delete: () => void; on_cancel_delete: () => void; }) { return <button onClick={props.on_request_delete}>Delete</button>; }',
                filename:
                  '/workspace/generated/frontend/src/components/DeleteCardAction/DeleteCardAction.tsx',
              },
            ],
            statesCovered: ['confirming'],
            tokensUsed: ['--color-text-primary'],
          },
          {
            componentCode: 'payment_card',
            files: [
              {
                content:
                  'export function PaymentCard() { return <DeleteCardAction on_request_delete={() => {}} on_confirm_delete={() => {}} on_cancel_delete={() => {}} />; }',
                filename:
                  '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
              },
            ],
            statesCovered: ['confirming'],
            tokensUsed: ['--color-text-primary'],
          },
        ],
        files: [
          {
            content:
              'export function DeleteCardAction(props: { on_request_delete: () => void; on_confirm_delete: () => void; on_cancel_delete: () => void; }) { return <button onClick={props.on_request_delete}>Delete</button>; }',
            filename:
              '/workspace/generated/frontend/src/components/DeleteCardAction/DeleteCardAction.tsx',
          },
          {
            content:
              'export function PaymentCard() { return <DeleteCardAction on_request_delete={() => {}} on_confirm_delete={() => {}} on_cancel_delete={() => {}} />; }',
            filename:
              '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
          },
        ],
        framework: 'React',
        statesCovered: ['confirming'],
        tokensUsed: ['--color-text-primary'],
      },
      gapAnalysis: {
        ...createGapAnalysisOutput(),
        missingStates: [],
      },
      parsing: {
        ...createParsingOutput(),
        specifiedStates: [],
      },
      resolvingGaps: {
        decisions: [],
      },
      unitTests: {
        components: [],
      },
      userFlows: createUserFlowsOutput(),
    });

    expect(result.attempts).toBe(1);
    expect(result.rawOutput).toBe('{"tokenCompliance":true}');
    expect(result.tokenUsage).toEqual(executionResult.tokenUsage);
    expect(result.output.accessibilityScore).toBe('needs_attention');
    expect(result.output.affectedComponentCodes).toEqual([]);
    expect(result.output.hallucinationsCaught).toEqual([]);
    expect(result.output.isRegenerationRequired).toBe(false);
    expect(result.output.regenerationReasons).toEqual([]);
    expect(result.output.stateCoverage).toEqual({
      coveredCount: 0,
      label: '0/0',
      totalCount: 0,
    });
    expect(result.output.tokenCompliance).toBe(true);
    expect(Array.isArray(result.output.contractCompatibilityIssues)).toBe(true);
    expect(result.output.contractCompatibilityIssues).toEqual(
      expect.arrayContaining([
        expect.stringContaining('payment_card'),
        expect.stringContaining('on_request_delete'),
        expect.stringContaining('delete_card_action'),
        expect.stringContaining('on_confirm_delete'),
      ]),
    );
    expect(Array.isArray(result.output.issuesFound)).toBe(true);
    expect(result.output.issuesFound).toEqual(
      expect.arrayContaining([
        expect.stringContaining('payment_card'),
        expect.stringContaining('delete_card_action'),
      ]),
    );
  });
});
