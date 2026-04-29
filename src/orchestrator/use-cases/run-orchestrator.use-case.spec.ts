/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { join } from 'node:path';
import { DEFAULT_CANONICAL_STATE_MODEL } from '../../canonical-state-model/constants';
import { RunComponentGenerationStepUseCase } from '../../component-generation/use-cases/run-component-generation-step.use-case';
import { RunComponentInterfacesStepUseCase } from '../../component-interfaces/use-cases/run-component-interfaces-step.use-case';
import { DEFAULT_DESIGN_SYSTEM_CONTEXT } from '../../design-system/constants';
import { RunE2eTestsStepUseCase } from '../../e2e-tests/use-cases/run-e2e-tests-step.use-case';
import { RunGapAnalysisStepUseCase } from '../../gap-analysis/use-cases/run-gap-analysis-step.use-case';
import { RunParsingStepUseCase } from '../../parsing/use-cases/run-parsing-step.use-case';
import { RunResolvingGapsStepUseCase } from '../../resolving-gaps/use-cases/run-resolving-gaps-step.use-case';
import { RUN_STATUS } from '../../run/constants';
import { RunRepository } from '../../run/repositories/run.repository';
import { RunUnitTestsStepUseCase } from '../../unit-tests/use-cases/run-unit-tests-step.use-case';
import { RunUserFlowsStepUseCase } from '../../user-flows/use-cases/run-user-flows-step.use-case';
import { RunValidationStepUseCase } from '../../validation/use-cases/run-validation-step.use-case';
import { RunOrchestratorUseCase } from './run-orchestrator.use-case';

describe('RunOrchestratorUseCase', () => {
  const createRunRepositoryMock = (): Pick<
    RunRepository,
    'create' | 'updateById'
  > => {
    return {
      create: jest.fn(),
      updateById: jest.fn(),
    };
  };

  const createRunParsingStepUseCaseMock = (): Pick<
    RunParsingStepUseCase,
    'execute'
  > => {
    return {
      execute: jest.fn(),
    };
  };

  const createRunGapAnalysisStepUseCaseMock = (): Pick<
    RunGapAnalysisStepUseCase,
    'execute'
  > => {
    return {
      execute: jest.fn(),
    };
  };

  const createRunResolvingGapsStepUseCaseMock = (): Pick<
    RunResolvingGapsStepUseCase,
    'execute'
  > => {
    return {
      execute: jest.fn(),
    };
  };

  const createRunUserFlowsStepUseCaseMock = (): Pick<
    RunUserFlowsStepUseCase,
    'execute'
  > => {
    return {
      execute: jest.fn(),
    };
  };

  const createRunComponentInterfacesStepUseCaseMock = (): Pick<
    RunComponentInterfacesStepUseCase,
    'execute'
  > => {
    return {
      execute: jest.fn(),
    };
  };

  const createRunUnitTestsStepUseCaseMock = (): Pick<
    RunUnitTestsStepUseCase,
    'execute'
  > => {
    return {
      execute: jest.fn(),
    };
  };

  const createRunE2eTestsStepUseCaseMock = (): Pick<
    RunE2eTestsStepUseCase,
    'execute'
  > => {
    return {
      execute: jest.fn(),
    };
  };

  const createRunComponentGenerationStepUseCaseMock = (): Pick<
    RunComponentGenerationStepUseCase,
    'execute'
  > => {
    return {
      execute: jest.fn(),
    };
  };

  const createRunValidationStepUseCaseMock = (): Pick<
    RunValidationStepUseCase,
    'execute'
  > => {
    return {
      execute: jest.fn(),
    };
  };

  const createTokenUsage = (
    inputTokens: number,
    outputTokens: number,
    totalTokens: number,
    cachedInputTokens = 0,
    reasoningTokens = 0,
  ) => {
    return {
      cachedInputTokens,
      inputTokens,
      outputTokens,
      reasoningTokens,
      totalTokens,
    };
  };

  it('creates a run, executes parsing, and persists progress', async () => {
    const runRepository = createRunRepositoryMock();
    const runGapAnalysisStepUseCase = createRunGapAnalysisStepUseCaseMock();
    const runParsingStepUseCase = createRunParsingStepUseCaseMock();
    const runResolvingGapsStepUseCase = createRunResolvingGapsStepUseCaseMock();
    const runUserFlowsStepUseCase = createRunUserFlowsStepUseCaseMock();
    const runComponentInterfacesStepUseCase =
      createRunComponentInterfacesStepUseCaseMock();
    const runUnitTestsStepUseCase = createRunUnitTestsStepUseCaseMock();
    const runE2eTestsStepUseCase = createRunE2eTestsStepUseCaseMock();
    const runComponentGenerationStepUseCase =
      createRunComponentGenerationStepUseCaseMock();
    const runValidationStepUseCase = createRunValidationStepUseCaseMock();

    runRepository.create = jest.fn().mockResolvedValue('run-id-1');
    runRepository.updateById = jest.fn().mockResolvedValue(null);
    runParsingStepUseCase.execute = jest.fn().mockResolvedValue({
      attempts: 1,
      output: {
        businessContext: 'merchant dashboard',
        components: [
          {
            code: 'payment_card',
            name: 'Payment card',
            parentCode: null,
            purpose: 'Display a saved card.',
            statePolicy: 'smart',
            type: 'card',
          },
          {
            code: 'card_brand_icon',
            name: 'Card brand icon',
            parentCode: 'payment_card',
            purpose: 'Show the card brand.',
            statePolicy: 'dumb',
            type: 'icon',
          },
        ],
        constraints: [],
        content: [],
        interactions: [],
        rootComponentCode: 'payment_card',
        specifiedStates: [],
        tokenReferences: [],
      },
      rawOutput: '{"businessContext":"merchant dashboard"}',
      tokenUsage: createTokenUsage(11, 5, 16, 1, 2),
    });
    runGapAnalysisStepUseCase.execute = jest.fn().mockResolvedValue({
      attempts: 1,
      output: {
        accessibilityGaps: ['Card selection must be keyboard reachable.'],
        missingStates: ['Selected state is not explicitly defined.'],
        recommendations: ['Define selected and delete-confirmation states.'],
        responsiveGaps: ['Action placement on narrow widths is not defined.'],
      },
      rawOutput:
        '{"missingStates":["Selected state is not explicitly defined."]}',
      tokenUsage: createTokenUsage(13, 4, 17, 0, 1),
    });
    runResolvingGapsStepUseCase.execute = jest.fn().mockResolvedValue({
      attempts: 1,
      output: {
        decisions: [
          {
            affectedComponentCodes: ['payment_card'],
            code: 'define_selected_state',
            decision: 'Add an explicit selected state for the payment card.',
            rationale:
              'This resolves the missing selection-state gap and supports downstream implementation work.',
            sourceGap: 'Selected state is not explicitly defined.',
          },
        ],
      },
      rawOutput: '{"decisions":[{"code":"define_selected_state"}]}',
      tokenUsage: createTokenUsage(9, 3, 12),
    });
    runUserFlowsStepUseCase.execute = jest.fn().mockResolvedValue({
      attempts: 1,
      output: {
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
            completionCriteria:
              'A saved card is selected after review and exploration.',
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
            completionCriteria:
              'The invalid action is rejected and the user can recover.',
            kind: 'unhappy_invalid_input',
            name: 'Invalid delete attempt',
            steps: [
              {
                action:
                  'User attempts a destructive action without satisfying the required confirmation condition.',
                code: 'attempt_delete_without_confirmation',
                componentCode: 'payment_card',
                expectedResult:
                  'The UI blocks the action and shows recovery guidance.',
                inputData: 'Delete requested without confirmation',
              },
            ],
          },
        ],
      },
      rawOutput: '{"flows":[{"code":"select_saved_card_fast_path"}]}',
      tokenUsage: createTokenUsage(15, 6, 21, 2, 1),
    });
    runComponentInterfacesStepUseCase.execute = jest
      .fn()
      .mockResolvedValueOnce({
        attempts: 1,
        output: {
          accepts: [
            {
              description:
                'Brand label rendered next to the icon for accessibility.',
              name: 'brand_label',
              required: true,
              type: 'string',
            },
          ],
          componentCode: 'card_brand_icon',
          componentName: 'Card brand icon',
          returns: [],
        },
        rawOutput: '{"componentCode":"card_brand_icon"}',
        tokenUsage: createTokenUsage(7, 2, 9),
      })
      .mockResolvedValueOnce({
        attempts: 1,
        output: {
          accepts: [
            {
              description:
                'Saved card data used to render the card and decide selected state.',
              name: 'card_summary',
              required: true,
              type: 'PaymentCardSummary',
            },
            {
              description: 'Whether the saved card is currently selected.',
              name: 'is_selected',
              required: true,
              type: 'boolean',
            },
          ],
          componentCode: 'payment_card',
          componentName: 'Payment card',
          returns: [
            {
              description:
                'Selection callback fired when the user selects the card.',
              name: 'on_select',
              required: true,
              type: '(payload: SelectPaymentCardPayload) => void',
            },
          ],
        },
        rawOutput: '{"componentCode":"payment_card"}',
        tokenUsage: createTokenUsage(8, 3, 11, 1, 1),
      });
    runUnitTestsStepUseCase.execute = jest
      .fn()
      .mockResolvedValueOnce({
        attempts: 1,
        output: {
          componentCode: 'card_brand_icon',
          componentName: 'Card brand icon',
          coveredBehaviors: ['renders the accessible brand label'],
          coveredStates: [],
          files: [
            {
              content: 'describe("CardBrandIcon", () => {});',
              filename: join(
                process.cwd(),
                'generated/frontend',
                'src',
                'components',
                'CardBrandIcon',
                'CardBrandIcon.spec.tsx',
              ),
            },
          ],
        },
        rawOutput: '{"componentCode":"card_brand_icon"}',
        tokenUsage: createTokenUsage(12, 5, 17),
      })
      .mockResolvedValueOnce({
        attempts: 1,
        output: {
          componentCode: 'payment_card',
          componentName: 'Payment card',
          coveredBehaviors: ['calls on_select with the selected card payload'],
          coveredStates: ['selected'],
          files: [
            {
              content: 'describe("PaymentCard", () => {});',
              filename: join(
                process.cwd(),
                'generated/frontend',
                'src',
                'components',
                'PaymentCard',
                'PaymentCard.spec.tsx',
              ),
            },
          ],
        },
        rawOutput: '{"componentCode":"payment_card"}',
        tokenUsage: createTokenUsage(14, 6, 20, 0, 2),
      });
    runE2eTestsStepUseCase.execute = jest.fn().mockResolvedValue({
      attempts: 1,
      output: {
        coveredBehaviors: [
          'propagates selection and recovery behavior across child components',
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
            filename: join(
              process.cwd(),
              'generated/frontend',
              'src',
              'components',
              'PaymentCard',
              'PaymentCard.e2e.spec.tsx',
            ),
          },
        ],
        rootComponentCode: 'payment_card',
        rootComponentName: 'Payment card',
      },
      rawOutput: '{"rootComponentCode":"payment_card"}',
      tokenUsage: createTokenUsage(16, 7, 23, 3, 2),
    });
    runComponentGenerationStepUseCase.execute = jest
      .fn()
      .mockResolvedValueOnce({
        attempts: 1,
        output: {
          componentCode: 'card_brand_icon',
          componentName: 'Card brand icon',
          files: [
            {
              content: 'export function CardBrandIcon() { return null; }',
              filename: join(
                process.cwd(),
                'generated/frontend',
                'src',
                'components',
                'CardBrandIcon',
                'CardBrandIcon.tsx',
              ),
            },
          ],
          statesCovered: [],
          tokensUsed: ['icon spacing'],
        },
        rawOutput: '{"componentCode":"card_brand_icon"}',
        tokenUsage: createTokenUsage(10, 4, 14, 1, 1),
      })
      .mockResolvedValueOnce({
        attempts: 1,
        output: {
          componentCode: 'payment_card',
          componentName: 'Payment card',
          files: [
            {
              content: 'export function PaymentCard() { return null; }',
              filename: join(
                process.cwd(),
                'generated/frontend',
                'src',
                'components',
                'PaymentCard',
                'PaymentCard.tsx',
              ),
            },
          ],
          statesCovered: ['selected'],
          tokensUsed: ['card spacing', 'status color'],
        },
        rawOutput: '{"componentCode":"payment_card"}',
        tokenUsage: createTokenUsage(18, 8, 26, 2, 3),
      });
    runValidationStepUseCase.execute = jest.fn().mockResolvedValue({
      attempts: 1,
      output: {
        accessibilityScore: 'needs_attention',
        affectedComponentCodes: [],
        contractCompatibilityIssues: [],
        hallucinationsCaught: [],
        isRegenerationRequired: false,
        issuesFound: ['Missing required states: error'],
        regenerationReasons: [],
        stateCoverage: {
          coveredCount: 1,
          label: '1/2',
          totalCount: 2,
        },
        tokenCompliance: true,
      },
      rawOutput: '{"tokenCompliance":true}',
      tokenUsage: createTokenUsage(20, 9, 29, 2, 4),
    });

    const useCase = new RunOrchestratorUseCase(
      runRepository as RunRepository,
      runGapAnalysisStepUseCase as RunGapAnalysisStepUseCase,
      runParsingStepUseCase as RunParsingStepUseCase,
      runResolvingGapsStepUseCase as RunResolvingGapsStepUseCase,
      runUserFlowsStepUseCase as RunUserFlowsStepUseCase,
      runComponentInterfacesStepUseCase as RunComponentInterfacesStepUseCase,
      runUnitTestsStepUseCase as RunUnitTestsStepUseCase,
      runE2eTestsStepUseCase as RunE2eTestsStepUseCase,
      runComponentGenerationStepUseCase as RunComponentGenerationStepUseCase,
      runValidationStepUseCase as RunValidationStepUseCase,
    );

    await expect(
      useCase.run({
        componentDescription: 'Payment card component.',
        figmaUrl: null,
        screenshotUrl: null,
      }),
    ).resolves.toEqual({
      component: {
        business_context: 'merchant dashboard',
        name: 'Payment card',
        type: 'card',
      },
      extraction: {
        constraints: [],
        specified_states: [],
        tokens_referenced: [],
      },
      gap_analysis: {
        accessibility_gaps: ['Card selection must be keyboard reachable.'],
        missing_states: ['Selected state is not explicitly defined.'],
        recommendations: ['Define selected and delete-confirmation states.'],
        responsive_gaps: ['Action placement on narrow widths is not defined.'],
      },
      generated_code: {
        files: [
          {
            content: 'export function CardBrandIcon() { return null; }',
            filename: join(
              process.cwd(),
              'generated/frontend',
              'src',
              'components',
              'CardBrandIcon',
              'CardBrandIcon.tsx',
            ),
          },
          {
            content: 'export function PaymentCard() { return null; }',
            filename: join(
              process.cwd(),
              'generated/frontend',
              'src',
              'components',
              'PaymentCard',
              'PaymentCard.tsx',
            ),
          },
        ],
        framework: 'React',
        states_covered: ['selected'],
        tokens_used: ['icon spacing', 'card spacing', 'status color'],
      },
      validation: {
        accessibility_score: 'needs_attention',
        hallucinations_caught: [],
        issues_found: ['Missing required states: error'],
        states_coverage: '1/2',
        token_compliance: true,
      },
    });

    expect(runGapAnalysisStepUseCase.execute).toHaveBeenCalledWith({
      componentDescription: 'Payment card component.',
      parsing: expect.objectContaining({
        businessContext: 'merchant dashboard',
      }),
    });
    expect(runResolvingGapsStepUseCase.execute).toHaveBeenCalledWith({
      componentDescription: 'Payment card component.',
      gapAnalysis: expect.objectContaining({
        missingStates: ['Selected state is not explicitly defined.'],
      }),
      parsing: expect.objectContaining({
        businessContext: 'merchant dashboard',
      }),
    });
    expect(runUserFlowsStepUseCase.execute).toHaveBeenCalledWith({
      componentDescription: 'Payment card component.',
      gapAnalysis: expect.objectContaining({
        missingStates: ['Selected state is not explicitly defined.'],
      }),
      parsing: expect.objectContaining({
        businessContext: 'merchant dashboard',
      }),
      resolvingGaps: expect.objectContaining({
        decisions: [
          expect.objectContaining({
            code: 'define_selected_state',
          }),
        ],
      }),
    });
    expect(runComponentInterfacesStepUseCase.execute).toHaveBeenNthCalledWith(
      1,
      {
        componentDescription: 'Payment card component.',
        gapAnalysis: expect.objectContaining({
          missingStates: ['Selected state is not explicitly defined.'],
        }),
        parsing: expect.objectContaining({
          businessContext: 'merchant dashboard',
        }),
        resolvingGaps: expect.objectContaining({
          decisions: [
            expect.objectContaining({
              code: 'define_selected_state',
            }),
          ],
        }),
        targetComponent: expect.objectContaining({
          code: 'card_brand_icon',
          statePolicy: 'dumb',
        }),
        userFlows: expect.objectContaining({
          flows: expect.arrayContaining([
            expect.objectContaining({
              code: 'select_saved_card_fast_path',
            }),
          ]),
        }),
      },
    );
    expect(runComponentInterfacesStepUseCase.execute).toHaveBeenNthCalledWith(
      2,
      {
        componentDescription: 'Payment card component.',
        gapAnalysis: expect.objectContaining({
          missingStates: ['Selected state is not explicitly defined.'],
        }),
        parsing: expect.objectContaining({
          businessContext: 'merchant dashboard',
        }),
        resolvingGaps: expect.objectContaining({
          decisions: [
            expect.objectContaining({
              code: 'define_selected_state',
            }),
          ],
        }),
        targetComponent: expect.objectContaining({
          code: 'payment_card',
          statePolicy: 'smart',
        }),
        userFlows: expect.objectContaining({
          flows: expect.arrayContaining([
            expect.objectContaining({
              code: 'select_saved_card_fast_path',
            }),
          ]),
        }),
      },
    );
    expect(runUnitTestsStepUseCase.execute).toHaveBeenNthCalledWith(1, {
      componentDescription: 'Payment card component.',
      componentInterfaces: {
        components: [
          expect.objectContaining({
            componentCode: 'card_brand_icon',
          }),
          expect.objectContaining({
            componentCode: 'payment_card',
          }),
        ],
      },
      componentSourceFiles: [
        {
          componentCode: 'card_brand_icon',
          filename: join(
            process.cwd(),
            'generated/frontend',
            'src',
            'components',
            'CardBrandIcon',
            'CardBrandIcon.tsx',
          ),
        },
        {
          componentCode: 'payment_card',
          filename: join(
            process.cwd(),
            'generated/frontend',
            'src',
            'components',
            'PaymentCard',
            'PaymentCard.tsx',
          ),
        },
      ],
      framework: 'React',
      gapAnalysis: expect.objectContaining({
        missingStates: ['Selected state is not explicitly defined.'],
      }),
      parsing: expect.objectContaining({
        businessContext: 'merchant dashboard',
      }),
      projectRootPath: join(process.cwd(), 'generated/frontend'),
      resolvingGaps: expect.objectContaining({
        decisions: [
          expect.objectContaining({
            code: 'define_selected_state',
          }),
        ],
      }),
      targetComponent: expect.objectContaining({
        code: 'card_brand_icon',
      }),
      targetComponentInterface: expect.objectContaining({
        componentCode: 'card_brand_icon',
      }),
      targetSourceFilePath: join(
        process.cwd(),
        'generated/frontend',
        'src',
        'components',
        'CardBrandIcon',
        'CardBrandIcon.tsx',
      ),
      targetTestFilePath: join(
        process.cwd(),
        'generated/frontend',
        'src',
        'components',
        'CardBrandIcon',
        'CardBrandIcon.spec.tsx',
      ),
      testFramework: 'Jest + React Testing Library',
      userFlows: expect.objectContaining({
        flows: expect.arrayContaining([
          expect.objectContaining({
            code: 'select_saved_card_fast_path',
          }),
        ]),
      }),
    });
    expect(runUnitTestsStepUseCase.execute).toHaveBeenNthCalledWith(2, {
      componentDescription: 'Payment card component.',
      componentInterfaces: {
        components: [
          expect.objectContaining({
            componentCode: 'card_brand_icon',
          }),
          expect.objectContaining({
            componentCode: 'payment_card',
          }),
        ],
      },
      componentSourceFiles: [
        {
          componentCode: 'card_brand_icon',
          filename: join(
            process.cwd(),
            'generated/frontend',
            'src',
            'components',
            'CardBrandIcon',
            'CardBrandIcon.tsx',
          ),
        },
        {
          componentCode: 'payment_card',
          filename: join(
            process.cwd(),
            'generated/frontend',
            'src',
            'components',
            'PaymentCard',
            'PaymentCard.tsx',
          ),
        },
      ],
      framework: 'React',
      gapAnalysis: expect.objectContaining({
        missingStates: ['Selected state is not explicitly defined.'],
      }),
      parsing: expect.objectContaining({
        businessContext: 'merchant dashboard',
      }),
      projectRootPath: join(process.cwd(), 'generated/frontend'),
      resolvingGaps: expect.objectContaining({
        decisions: [
          expect.objectContaining({
            code: 'define_selected_state',
          }),
        ],
      }),
      targetComponent: expect.objectContaining({
        code: 'payment_card',
      }),
      targetComponentInterface: expect.objectContaining({
        componentCode: 'payment_card',
      }),
      targetSourceFilePath: join(
        process.cwd(),
        'generated/frontend',
        'src',
        'components',
        'PaymentCard',
        'PaymentCard.tsx',
      ),
      targetTestFilePath: join(
        process.cwd(),
        'generated/frontend',
        'src',
        'components',
        'PaymentCard',
        'PaymentCard.spec.tsx',
      ),
      testFramework: 'Jest + React Testing Library',
      userFlows: expect.objectContaining({
        flows: expect.arrayContaining([
          expect.objectContaining({
            code: 'select_saved_card_fast_path',
          }),
        ]),
      }),
    });
    expect(runE2eTestsStepUseCase.execute).toHaveBeenCalledWith({
      componentDescription: 'Payment card component.',
      componentInterfaces: {
        components: [
          expect.objectContaining({
            componentCode: 'card_brand_icon',
          }),
          expect.objectContaining({
            componentCode: 'payment_card',
          }),
        ],
      },
      componentSourceFiles: [
        {
          componentCode: 'card_brand_icon',
          filename: join(
            process.cwd(),
            'generated/frontend',
            'src',
            'components',
            'CardBrandIcon',
            'CardBrandIcon.tsx',
          ),
        },
        {
          componentCode: 'payment_card',
          filename: join(
            process.cwd(),
            'generated/frontend',
            'src',
            'components',
            'PaymentCard',
            'PaymentCard.tsx',
          ),
        },
      ],
      e2eTestFilePath: join(
        process.cwd(),
        'generated/frontend',
        'src',
        'components',
        'PaymentCard',
        'PaymentCard.e2e.spec.tsx',
      ),
      framework: 'React',
      gapAnalysis: expect.objectContaining({
        missingStates: ['Selected state is not explicitly defined.'],
      }),
      parsing: expect.objectContaining({
        businessContext: 'merchant dashboard',
      }),
      projectRootPath: join(process.cwd(), 'generated/frontend'),
      resolvingGaps: expect.objectContaining({
        decisions: [
          expect.objectContaining({
            code: 'define_selected_state',
          }),
        ],
      }),
      rootComponent: expect.objectContaining({
        code: 'payment_card',
      }),
      rootComponentInterface: expect.objectContaining({
        componentCode: 'payment_card',
      }),
      rootSourceFilePath: join(
        process.cwd(),
        'generated/frontend',
        'src',
        'components',
        'PaymentCard',
        'PaymentCard.tsx',
      ),
      testFramework: 'Jest + React Testing Library',
      unitTests: {
        components: [
          expect.objectContaining({
            componentCode: 'card_brand_icon',
          }),
          expect.objectContaining({
            componentCode: 'payment_card',
          }),
        ],
      },
      userFlows: expect.objectContaining({
        flows: expect.arrayContaining([
          expect.objectContaining({
            code: 'select_saved_card_fast_path',
          }),
          expect.objectContaining({
            code: 'review_then_select_card',
          }),
          expect.objectContaining({
            code: 'invalid_delete_attempt',
          }),
        ]),
      }),
    });
    expect(runComponentGenerationStepUseCase.execute).toHaveBeenNthCalledWith(
      1,
      {
        canonicalStateModel: DEFAULT_CANONICAL_STATE_MODEL,
        componentDescription: 'Payment card component.',
        designSystemContext: DEFAULT_DESIGN_SYSTEM_CONTEXT,
        e2eTests: null,
        framework: 'React',
        gapAnalysis: expect.objectContaining({
          missingStates: ['Selected state is not explicitly defined.'],
        }),
        parsing: expect.objectContaining({
          businessContext: 'merchant dashboard',
        }),
        projectRootPath: join(process.cwd(), 'generated/frontend'),
        relatedComponentInterfaces: [],
        relatedComponentSourceFiles: [],
        resolvingGaps: expect.objectContaining({
          decisions: [
            expect.objectContaining({
              code: 'define_selected_state',
            }),
          ],
        }),
        targetComponent: expect.objectContaining({
          code: 'card_brand_icon',
          statePolicy: 'dumb',
        }),
        targetComponentInterface: expect.objectContaining({
          componentCode: 'card_brand_icon',
        }),
        targetSourceFilePath: join(
          process.cwd(),
          'generated/frontend',
          'src',
          'components',
          'CardBrandIcon',
          'CardBrandIcon.tsx',
        ),
        targetUnitTests: expect.objectContaining({
          componentCode: 'card_brand_icon',
        }),
        testFramework: 'Jest + React Testing Library',
        validationFeedback: null,
        userFlows: expect.objectContaining({
          flows: expect.arrayContaining([
            expect.objectContaining({
              code: 'select_saved_card_fast_path',
            }),
          ]),
        }),
      },
    );
    expect(runComponentGenerationStepUseCase.execute).toHaveBeenNthCalledWith(
      2,
      {
        canonicalStateModel: DEFAULT_CANONICAL_STATE_MODEL,
        componentDescription: 'Payment card component.',
        designSystemContext: DEFAULT_DESIGN_SYSTEM_CONTEXT,
        e2eTests: expect.objectContaining({
          rootComponentCode: 'payment_card',
        }),
        framework: 'React',
        gapAnalysis: expect.objectContaining({
          missingStates: ['Selected state is not explicitly defined.'],
        }),
        parsing: expect.objectContaining({
          businessContext: 'merchant dashboard',
        }),
        projectRootPath: join(process.cwd(), 'generated/frontend'),
        relatedComponentInterfaces: [
          expect.objectContaining({
            componentCode: 'card_brand_icon',
          }),
        ],
        relatedComponentSourceFiles: [
          {
            componentCode: 'card_brand_icon',
            filename: join(
              process.cwd(),
              'generated/frontend',
              'src',
              'components',
              'CardBrandIcon',
              'CardBrandIcon.tsx',
            ),
          },
        ],
        resolvingGaps: expect.objectContaining({
          decisions: [
            expect.objectContaining({
              code: 'define_selected_state',
            }),
          ],
        }),
        targetComponent: expect.objectContaining({
          code: 'payment_card',
          statePolicy: 'smart',
        }),
        targetComponentInterface: expect.objectContaining({
          componentCode: 'payment_card',
        }),
        targetSourceFilePath: join(
          process.cwd(),
          'generated/frontend',
          'src',
          'components',
          'PaymentCard',
          'PaymentCard.tsx',
        ),
        targetUnitTests: expect.objectContaining({
          componentCode: 'payment_card',
        }),
        testFramework: 'Jest + React Testing Library',
        validationFeedback: null,
        userFlows: expect.objectContaining({
          flows: expect.arrayContaining([
            expect.objectContaining({
              code: 'select_saved_card_fast_path',
            }),
          ]),
        }),
      },
    );
    expect(runValidationStepUseCase.execute).toHaveBeenCalledWith({
      canonicalStateModel: DEFAULT_CANONICAL_STATE_MODEL,
      componentDescription: 'Payment card component.',
      componentInterfaces: {
        components: [
          expect.objectContaining({
            componentCode: 'card_brand_icon',
          }),
          expect.objectContaining({
            componentCode: 'payment_card',
          }),
        ],
      },
      designSystemContext: DEFAULT_DESIGN_SYSTEM_CONTEXT,
      e2eTests: expect.objectContaining({
        rootComponentCode: 'payment_card',
      }),
      generatedCode: {
        components: [
          expect.objectContaining({
            componentCode: 'card_brand_icon',
            tokensUsed: ['icon spacing'],
          }),
          expect.objectContaining({
            componentCode: 'payment_card',
            tokensUsed: ['card spacing', 'status color'],
          }),
        ],
        files: [
          expect.objectContaining({
            filename: join(
              process.cwd(),
              'generated/frontend',
              'src',
              'components',
              'CardBrandIcon',
              'CardBrandIcon.tsx',
            ),
          }),
          expect.objectContaining({
            filename: join(
              process.cwd(),
              'generated/frontend',
              'src',
              'components',
              'PaymentCard',
              'PaymentCard.tsx',
            ),
          }),
        ],
        framework: 'React',
        statesCovered: ['selected'],
        tokensUsed: ['icon spacing', 'card spacing', 'status color'],
      },
      gapAnalysis: expect.objectContaining({
        missingStates: ['Selected state is not explicitly defined.'],
      }),
      parsing: expect.objectContaining({
        businessContext: 'merchant dashboard',
      }),
      resolvingGaps: expect.objectContaining({
        decisions: [
          expect.objectContaining({
            code: 'define_selected_state',
          }),
        ],
      }),
      unitTests: {
        components: [
          expect.objectContaining({
            componentCode: 'card_brand_icon',
          }),
          expect.objectContaining({
            componentCode: 'payment_card',
          }),
        ],
      },
      userFlows: expect.objectContaining({
        flows: expect.arrayContaining([
          expect.objectContaining({
            code: 'select_saved_card_fast_path',
          }),
        ]),
      }),
    });
    expect(runRepository.create).toHaveBeenCalledWith({
      input: {
        componentDescription: 'Payment card component.',
        figmaUrl: null,
        screenshotUrl: null,
      },
    });
    expect(runRepository.updateById).toHaveBeenCalledTimes(15);
    expect(runRepository.updateById).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        id: 'run-id-1',
        status: RUN_STATUS.RUNNING,
      }),
    );
    expect(runRepository.updateById).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        artifacts: expect.objectContaining({
          parsing: expect.objectContaining({
            businessContext: 'merchant dashboard',
          }),
        }),
        derivedData: expect.objectContaining({
          rootComponentName: 'Payment card',
        }),
        id: 'run-id-1',
        steps: [
          expect.objectContaining({
            attempts: 1,
            code: 'parsing',
            status: 'completed',
            tokenUsage: createTokenUsage(11, 5, 16, 1, 2),
          }),
        ],
        tokenUsageTotals: createTokenUsage(11, 5, 16, 1, 2),
      }),
    );
    expect(runRepository.updateById).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        artifacts: expect.objectContaining({
          gapAnalysis: expect.objectContaining({
            missingStates: ['Selected state is not explicitly defined.'],
          }),
          parsing: expect.objectContaining({
            businessContext: 'merchant dashboard',
          }),
        }),
        id: 'run-id-1',
        steps: [
          expect.objectContaining({
            code: 'parsing',
            status: 'completed',
          }),
          expect.objectContaining({
            code: 'gap_analysis',
            status: 'completed',
          }),
        ],
      }),
    );
    expect(runRepository.updateById).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        artifacts: expect.objectContaining({
          gapAnalysis: expect.objectContaining({
            missingStates: ['Selected state is not explicitly defined.'],
          }),
          resolvingGaps: expect.objectContaining({
            decisions: [
              expect.objectContaining({
                code: 'define_selected_state',
              }),
            ],
          }),
        }),
        id: 'run-id-1',
        steps: [
          expect.objectContaining({
            code: 'parsing',
          }),
          expect.objectContaining({
            code: 'gap_analysis',
          }),
          expect.objectContaining({
            code: 'resolving_gaps',
            status: 'completed',
          }),
        ],
      }),
    );
    expect(runRepository.updateById).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({
        artifacts: expect.objectContaining({
          userFlows: expect.objectContaining({
            flows: expect.arrayContaining([
              expect.objectContaining({
                code: 'select_saved_card_fast_path',
              }),
            ]),
          }),
          resolvingGaps: expect.objectContaining({
            decisions: [
              expect.objectContaining({
                code: 'define_selected_state',
              }),
            ],
          }),
        }),
        id: 'run-id-1',
        steps: [
          expect.objectContaining({
            code: 'parsing',
          }),
          expect.objectContaining({
            code: 'gap_analysis',
          }),
          expect.objectContaining({
            code: 'resolving_gaps',
          }),
          expect.objectContaining({
            code: 'user_flows',
            status: 'completed',
          }),
        ],
      }),
    );
    expect(runRepository.updateById).toHaveBeenNthCalledWith(
      6,
      expect.objectContaining({
        artifacts: expect.objectContaining({
          componentInterfaces: expect.objectContaining({
            components: [
              expect.objectContaining({
                componentCode: 'card_brand_icon',
              }),
            ],
          }),
        }),
        id: 'run-id-1',
        steps: [
          expect.objectContaining({
            code: 'parsing',
          }),
          expect.objectContaining({
            code: 'gap_analysis',
          }),
          expect.objectContaining({
            code: 'resolving_gaps',
          }),
          expect.objectContaining({
            code: 'user_flows',
          }),
          expect.objectContaining({
            code: 'component_interfaces',
            order: 5,
            status: 'completed',
            targetComponentCode: 'card_brand_icon',
          }),
        ],
      }),
    );
    expect(runRepository.updateById).toHaveBeenNthCalledWith(
      7,
      expect.objectContaining({
        artifacts: expect.objectContaining({
          componentInterfaces: expect.objectContaining({
            components: [
              expect.objectContaining({
                componentCode: 'card_brand_icon',
              }),
              expect.objectContaining({
                componentCode: 'payment_card',
              }),
            ],
          }),
        }),
        id: 'run-id-1',
        steps: [
          expect.objectContaining({
            code: 'parsing',
          }),
          expect.objectContaining({
            code: 'gap_analysis',
          }),
          expect.objectContaining({
            code: 'resolving_gaps',
          }),
          expect.objectContaining({
            code: 'user_flows',
          }),
          expect.objectContaining({
            code: 'component_interfaces',
            order: 5,
            targetComponentCode: 'card_brand_icon',
          }),
          expect.objectContaining({
            code: 'component_interfaces',
            order: 6,
            status: 'completed',
            targetComponentCode: 'payment_card',
          }),
        ],
      }),
    );
    expect(runRepository.updateById).toHaveBeenNthCalledWith(
      8,
      expect.objectContaining({
        artifacts: expect.objectContaining({
          unitTests: expect.objectContaining({
            components: [
              expect.objectContaining({
                componentCode: 'card_brand_icon',
              }),
            ],
          }),
        }),
        id: 'run-id-1',
        steps: [
          expect.objectContaining({
            code: 'parsing',
          }),
          expect.objectContaining({
            code: 'gap_analysis',
          }),
          expect.objectContaining({
            code: 'resolving_gaps',
          }),
          expect.objectContaining({
            code: 'user_flows',
          }),
          expect.objectContaining({
            code: 'component_interfaces',
            order: 5,
            targetComponentCode: 'card_brand_icon',
          }),
          expect.objectContaining({
            code: 'component_interfaces',
            order: 6,
            targetComponentCode: 'payment_card',
          }),
          expect.objectContaining({
            code: 'unit_tests',
            order: 7,
            status: 'completed',
            targetComponentCode: 'card_brand_icon',
          }),
        ],
      }),
    );
    expect(runRepository.updateById).toHaveBeenNthCalledWith(
      9,
      expect.objectContaining({
        artifacts: expect.objectContaining({
          unitTests: expect.objectContaining({
            components: [
              expect.objectContaining({
                componentCode: 'card_brand_icon',
              }),
              expect.objectContaining({
                componentCode: 'payment_card',
              }),
            ],
          }),
        }),
        id: 'run-id-1',
        steps: [
          expect.objectContaining({
            code: 'parsing',
          }),
          expect.objectContaining({
            code: 'gap_analysis',
          }),
          expect.objectContaining({
            code: 'resolving_gaps',
          }),
          expect.objectContaining({
            code: 'user_flows',
          }),
          expect.objectContaining({
            code: 'component_interfaces',
            order: 5,
            targetComponentCode: 'card_brand_icon',
          }),
          expect.objectContaining({
            code: 'component_interfaces',
            order: 6,
            targetComponentCode: 'payment_card',
          }),
          expect.objectContaining({
            code: 'unit_tests',
            order: 7,
            targetComponentCode: 'card_brand_icon',
          }),
          expect.objectContaining({
            code: 'unit_tests',
            order: 8,
            status: 'completed',
            targetComponentCode: 'payment_card',
          }),
        ],
      }),
    );
    expect(runRepository.updateById).toHaveBeenNthCalledWith(
      10,
      expect.objectContaining({
        artifacts: expect.objectContaining({
          e2eTests: expect.objectContaining({
            rootComponentCode: 'payment_card',
          }),
          unitTests: expect.objectContaining({
            components: [
              expect.objectContaining({
                componentCode: 'card_brand_icon',
              }),
              expect.objectContaining({
                componentCode: 'payment_card',
              }),
            ],
          }),
        }),
        id: 'run-id-1',
        tokenUsageTotals: createTokenUsage(105, 41, 146, 7, 9),
        steps: [
          expect.objectContaining({
            code: 'parsing',
            tokenUsage: createTokenUsage(11, 5, 16, 1, 2),
          }),
          expect.objectContaining({
            code: 'gap_analysis',
            tokenUsage: createTokenUsage(13, 4, 17, 0, 1),
          }),
          expect.objectContaining({
            code: 'resolving_gaps',
            tokenUsage: createTokenUsage(9, 3, 12),
          }),
          expect.objectContaining({
            code: 'user_flows',
            tokenUsage: createTokenUsage(15, 6, 21, 2, 1),
          }),
          expect.objectContaining({
            code: 'component_interfaces',
            order: 5,
            targetComponentCode: 'card_brand_icon',
            tokenUsage: createTokenUsage(7, 2, 9),
          }),
          expect.objectContaining({
            code: 'component_interfaces',
            order: 6,
            targetComponentCode: 'payment_card',
            tokenUsage: createTokenUsage(8, 3, 11, 1, 1),
          }),
          expect.objectContaining({
            code: 'unit_tests',
            order: 7,
            targetComponentCode: 'card_brand_icon',
            tokenUsage: createTokenUsage(12, 5, 17),
          }),
          expect.objectContaining({
            code: 'unit_tests',
            order: 8,
            targetComponentCode: 'payment_card',
            tokenUsage: createTokenUsage(14, 6, 20, 0, 2),
          }),
          expect.objectContaining({
            code: 'e2e_tests',
            order: 9,
            status: 'completed',
            targetComponentCode: 'payment_card',
            tokenUsage: createTokenUsage(16, 7, 23, 3, 2),
          }),
        ],
      }),
    );
    expect(runRepository.updateById).toHaveBeenNthCalledWith(
      11,
      expect.objectContaining({
        artifacts: expect.objectContaining({
          generatedCode: expect.objectContaining({
            components: [
              expect.objectContaining({
                componentCode: 'card_brand_icon',
              }),
            ],
            files: [
              expect.objectContaining({
                filename: join(
                  process.cwd(),
                  'generated/frontend',
                  'src',
                  'components',
                  'CardBrandIcon',
                  'CardBrandIcon.tsx',
                ),
              }),
            ],
            framework: 'React',
            statesCovered: [],
            tokensUsed: ['icon spacing'],
          }),
        }),
        id: 'run-id-1',
        steps: expect.arrayContaining([
          expect.objectContaining({
            code: 'component_generation',
            order: 10,
            status: 'completed',
            targetComponentCode: 'card_brand_icon',
          }),
        ]),
        tokenUsageTotals: createTokenUsage(115, 45, 160, 8, 10),
      }),
    );
    expect(runRepository.updateById).toHaveBeenNthCalledWith(
      12,
      expect.objectContaining({
        artifacts: expect.objectContaining({
          generatedCode: expect.objectContaining({
            components: [
              expect.objectContaining({
                componentCode: 'card_brand_icon',
              }),
              expect.objectContaining({
                componentCode: 'payment_card',
              }),
            ],
            files: [
              expect.objectContaining({
                filename: join(
                  process.cwd(),
                  'generated/frontend',
                  'src',
                  'components',
                  'CardBrandIcon',
                  'CardBrandIcon.tsx',
                ),
              }),
              expect.objectContaining({
                filename: join(
                  process.cwd(),
                  'generated/frontend',
                  'src',
                  'components',
                  'PaymentCard',
                  'PaymentCard.tsx',
                ),
              }),
            ],
            framework: 'React',
            statesCovered: ['selected'],
            tokensUsed: ['icon spacing', 'card spacing', 'status color'],
          }),
        }),
        id: 'run-id-1',
        tokenUsageTotals: createTokenUsage(133, 53, 186, 10, 13),
        steps: expect.arrayContaining([
          expect.objectContaining({
            code: 'component_generation',
            order: 10,
            targetComponentCode: 'card_brand_icon',
            tokenUsage: createTokenUsage(10, 4, 14, 1, 1),
          }),
          expect.objectContaining({
            code: 'component_generation',
            order: 11,
            status: 'completed',
            targetComponentCode: 'payment_card',
            tokenUsage: createTokenUsage(18, 8, 26, 2, 3),
          }),
        ]),
      }),
    );
    expect(runRepository.updateById).toHaveBeenNthCalledWith(
      13,
      expect.objectContaining({
        artifacts: expect.objectContaining({
          generatedCode: expect.objectContaining({
            framework: 'React',
          }),
          validation: expect.objectContaining({
            accessibilityScore: 'needs_attention',
            tokenCompliance: true,
          }),
        }),
        id: 'run-id-1',
        tokenUsageTotals: createTokenUsage(153, 62, 215, 12, 17),
        steps: expect.arrayContaining([
          expect.objectContaining({
            code: 'validation',
            order: 12,
            status: 'completed',
            tokenUsage: createTokenUsage(20, 9, 29, 2, 4),
          }),
        ]),
      }),
    );
    expect(runRepository.updateById).toHaveBeenNthCalledWith(
      14,
      expect.objectContaining({
        id: 'run-id-1',
        result: {
          component: {
            business_context: 'merchant dashboard',
            name: 'Payment card',
            type: 'card',
          },
          extraction: {
            constraints: [],
            specified_states: [],
            tokens_referenced: [],
          },
          gap_analysis: {
            accessibility_gaps: ['Card selection must be keyboard reachable.'],
            missing_states: ['Selected state is not explicitly defined.'],
            recommendations: [
              'Define selected and delete-confirmation states.',
            ],
            responsive_gaps: [
              'Action placement on narrow widths is not defined.',
            ],
          },
          generated_code: {
            files: [
              {
                content: 'export function CardBrandIcon() { return null; }',
                filename: join(
                  process.cwd(),
                  'generated/frontend',
                  'src',
                  'components',
                  'CardBrandIcon',
                  'CardBrandIcon.tsx',
                ),
              },
              {
                content: 'export function PaymentCard() { return null; }',
                filename: join(
                  process.cwd(),
                  'generated/frontend',
                  'src',
                  'components',
                  'PaymentCard',
                  'PaymentCard.tsx',
                ),
              },
            ],
            framework: 'React',
            states_covered: ['selected'],
            tokens_used: ['icon spacing', 'card spacing', 'status color'],
          },
          validation: {
            accessibility_score: 'needs_attention',
            hallucinations_caught: [],
            issues_found: ['Missing required states: error'],
            states_coverage: '1/2',
            token_compliance: true,
          },
        },
      }),
    );
    expect(runRepository.updateById).toHaveBeenNthCalledWith(
      15,
      expect.objectContaining({
        id: 'run-id-1',
        status: RUN_STATUS.COMPLETED,
      }),
    );
  });

  it('reruns component generation only for affected components when validation requests selective regeneration', async () => {
    const runRepository = createRunRepositoryMock();
    const runGapAnalysisStepUseCase = createRunGapAnalysisStepUseCaseMock();
    const runParsingStepUseCase = createRunParsingStepUseCaseMock();
    const runResolvingGapsStepUseCase = createRunResolvingGapsStepUseCaseMock();
    const runUserFlowsStepUseCase = createRunUserFlowsStepUseCaseMock();
    const runComponentInterfacesStepUseCase =
      createRunComponentInterfacesStepUseCaseMock();
    const runUnitTestsStepUseCase = createRunUnitTestsStepUseCaseMock();
    const runE2eTestsStepUseCase = createRunE2eTestsStepUseCaseMock();
    const runComponentGenerationStepUseCase =
      createRunComponentGenerationStepUseCaseMock();
    const runValidationStepUseCase = createRunValidationStepUseCaseMock();

    runRepository.create = jest.fn().mockResolvedValue('run-id-2');
    runRepository.updateById = jest.fn().mockResolvedValue(null);
    runParsingStepUseCase.execute = jest.fn().mockResolvedValue({
      attempts: 1,
      output: {
        businessContext: 'merchant dashboard',
        components: [
          {
            code: 'payment_card',
            name: 'Payment card',
            parentCode: null,
            purpose: 'Display a saved card.',
            statePolicy: 'smart',
            type: 'card',
          },
          {
            code: 'card_brand_icon',
            name: 'Card brand icon',
            parentCode: 'payment_card',
            purpose: 'Show the card brand.',
            statePolicy: 'dumb',
            type: 'icon',
          },
        ],
        constraints: [],
        content: [],
        interactions: [],
        rootComponentCode: 'payment_card',
        specifiedStates: [],
        tokenReferences: [],
      },
      rawOutput: '{"businessContext":"merchant dashboard"}',
      tokenUsage: createTokenUsage(11, 5, 16, 1, 2),
    });
    runGapAnalysisStepUseCase.execute = jest.fn().mockResolvedValue({
      attempts: 1,
      output: {
        accessibilityGaps: ['Card selection must be keyboard reachable.'],
        missingStates: ['Selected state is not explicitly defined.'],
        recommendations: ['Define selected and delete-confirmation states.'],
        responsiveGaps: ['Action placement on narrow widths is not defined.'],
      },
      rawOutput:
        '{"missingStates":["Selected state is not explicitly defined."]}',
      tokenUsage: createTokenUsage(13, 4, 17, 0, 1),
    });
    runResolvingGapsStepUseCase.execute = jest.fn().mockResolvedValue({
      attempts: 1,
      output: {
        decisions: [
          {
            affectedComponentCodes: ['payment_card'],
            code: 'define_selected_state',
            decision: 'Add an explicit selected state for the payment card.',
            rationale:
              'This resolves the missing selection-state gap and supports downstream implementation work.',
            sourceGap: 'Selected state is not explicitly defined.',
          },
        ],
      },
      rawOutput: '{"decisions":[{"code":"define_selected_state"}]}',
      tokenUsage: createTokenUsage(9, 3, 12),
    });
    runUserFlowsStepUseCase.execute = jest.fn().mockResolvedValue({
      attempts: 1,
      output: {
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
            completionCriteria:
              'A saved card is selected after review and exploration.',
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
            completionCriteria:
              'The invalid action is rejected and the user can recover.',
            kind: 'unhappy_invalid_input',
            name: 'Invalid delete attempt',
            steps: [
              {
                action:
                  'User attempts a destructive action without satisfying the required confirmation condition.',
                code: 'attempt_delete_without_confirmation',
                componentCode: 'payment_card',
                expectedResult:
                  'The UI blocks the action and shows recovery guidance.',
                inputData: 'Delete requested without confirmation',
              },
            ],
          },
        ],
      },
      rawOutput: '{"flows":[{"code":"select_saved_card_fast_path"}]}',
      tokenUsage: createTokenUsage(15, 6, 21, 2, 1),
    });
    runComponentInterfacesStepUseCase.execute = jest
      .fn()
      .mockResolvedValueOnce({
        attempts: 1,
        output: {
          accepts: [],
          componentCode: 'card_brand_icon',
          componentName: 'Card brand icon',
          returns: [],
        },
        rawOutput: '{"componentCode":"card_brand_icon"}',
        tokenUsage: createTokenUsage(7, 2, 9),
      })
      .mockResolvedValueOnce({
        attempts: 1,
        output: {
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
          returns: [
            {
              description: 'Selection callback payload.',
              name: 'on_select',
              required: true,
              type: '(payload: SelectPaymentCardPayload) => void',
            },
          ],
        },
        rawOutput: '{"componentCode":"payment_card"}',
        tokenUsage: createTokenUsage(8, 3, 11, 1, 1),
      });
    runUnitTestsStepUseCase.execute = jest
      .fn()
      .mockResolvedValueOnce({
        attempts: 1,
        output: {
          componentCode: 'card_brand_icon',
          componentName: 'Card brand icon',
          coveredBehaviors: ['renders the brand icon'],
          coveredStates: [],
          files: [
            {
              content: 'describe("CardBrandIcon", () => {});',
              filename: join(
                process.cwd(),
                'generated/frontend',
                'src',
                'components',
                'CardBrandIcon',
                'CardBrandIcon.spec.tsx',
              ),
            },
          ],
        },
        rawOutput: '{"componentCode":"card_brand_icon"}',
        tokenUsage: createTokenUsage(12, 5, 17),
      })
      .mockResolvedValueOnce({
        attempts: 1,
        output: {
          componentCode: 'payment_card',
          componentName: 'Payment card',
          coveredBehaviors: ['calls on_select with the selected card payload'],
          coveredStates: ['selected'],
          files: [
            {
              content: 'describe("PaymentCard", () => {});',
              filename: join(
                process.cwd(),
                'generated/frontend',
                'src',
                'components',
                'PaymentCard',
                'PaymentCard.spec.tsx',
              ),
            },
          ],
        },
        rawOutput: '{"componentCode":"payment_card"}',
        tokenUsage: createTokenUsage(14, 6, 20, 0, 2),
      });
    runE2eTestsStepUseCase.execute = jest.fn().mockResolvedValue({
      attempts: 1,
      output: {
        coveredBehaviors: ['propagates selection through composed behavior'],
        coveredComponentCodes: ['card_brand_icon', 'payment_card'],
        coveredFlowCodes: ['select_saved_card_fast_path'],
        coveredStates: ['selected'],
        files: [
          {
            content: 'describe("PaymentCard e2e", () => {});',
            filename: join(
              process.cwd(),
              'generated/frontend',
              'src',
              'components',
              'PaymentCard',
              'PaymentCard.e2e.spec.tsx',
            ),
          },
        ],
        rootComponentCode: 'payment_card',
        rootComponentName: 'Payment card',
      },
      rawOutput: '{"rootComponentCode":"payment_card"}',
      tokenUsage: createTokenUsage(16, 7, 23, 3, 2),
    });
    runComponentGenerationStepUseCase.execute = jest
      .fn()
      .mockResolvedValueOnce({
        attempts: 1,
        output: {
          componentCode: 'card_brand_icon',
          componentName: 'Card brand icon',
          files: [
            {
              content: 'export function CardBrandIcon() { return null; }',
              filename: join(
                process.cwd(),
                'generated/frontend',
                'src',
                'components',
                'CardBrandIcon',
                'CardBrandIcon.tsx',
              ),
            },
          ],
          statesCovered: [],
          tokensUsed: ['--icon-color-default'],
        },
        rawOutput: '{"componentCode":"card_brand_icon"}',
        tokenUsage: createTokenUsage(10, 4, 14, 1, 1),
      })
      .mockResolvedValueOnce({
        attempts: 1,
        output: {
          componentCode: 'payment_card',
          componentName: 'Payment card',
          files: [
            {
              content:
                'export function PaymentCard() { return <div style={{ color: "var(--imagined-border)" }} />; }',
              filename: join(
                process.cwd(),
                'generated/frontend',
                'src',
                'components',
                'PaymentCard',
                'PaymentCard.tsx',
              ),
            },
          ],
          statesCovered: ['selected'],
          tokensUsed: ['--imagined-border'],
        },
        rawOutput: '{"componentCode":"payment_card"}',
        tokenUsage: createTokenUsage(18, 8, 26, 2, 3),
      })
      .mockResolvedValueOnce({
        attempts: 1,
        output: {
          componentCode: 'payment_card',
          componentName: 'Payment card',
          files: [
            {
              content:
                'export function PaymentCard() { return <div style={{ color: "var(--color-text-primary)" }} />; }',
              filename: join(
                process.cwd(),
                'generated/frontend',
                'src',
                'components',
                'PaymentCard',
                'PaymentCard.tsx',
              ),
            },
          ],
          statesCovered: ['selected', 'error'],
          tokensUsed: ['--color-text-primary'],
        },
        rawOutput: '{"componentCode":"payment_card"}',
        tokenUsage: createTokenUsage(19, 9, 28, 2, 3),
      });
    runValidationStepUseCase.execute = jest
      .fn()
      .mockResolvedValueOnce({
        attempts: 1,
        output: {
          accessibilityScore: 'needs_attention',
          affectedComponentCodes: ['payment_card'],
          contractCompatibilityIssues: [],
          hallucinationsCaught: ['--imagined-border'],
          isRegenerationRequired: true,
          issuesFound: [
            'Unknown design-system tokens or CSS variables found: --imagined-border',
          ],
          regenerationReasons: [
            {
              componentCode: 'payment_card',
              reasons: [
                'Unknown design-system tokens or CSS variables found: --imagined-border',
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
        rawOutput: '{"tokenCompliance":false}',
        tokenUsage: createTokenUsage(20, 9, 29, 2, 4),
      })
      .mockResolvedValueOnce({
        attempts: 1,
        output: {
          accessibilityScore: 'basic_pass',
          affectedComponentCodes: [],
          contractCompatibilityIssues: [],
          hallucinationsCaught: [],
          isRegenerationRequired: false,
          issuesFound: [],
          regenerationReasons: [],
          stateCoverage: {
            coveredCount: 2,
            label: '2/2',
            totalCount: 2,
          },
          tokenCompliance: true,
        },
        rawOutput: '{"tokenCompliance":true}',
        tokenUsage: createTokenUsage(21, 10, 31, 2, 5),
      });

    const useCase = new RunOrchestratorUseCase(
      runRepository as RunRepository,
      runGapAnalysisStepUseCase as RunGapAnalysisStepUseCase,
      runParsingStepUseCase as RunParsingStepUseCase,
      runResolvingGapsStepUseCase as RunResolvingGapsStepUseCase,
      runUserFlowsStepUseCase as RunUserFlowsStepUseCase,
      runComponentInterfacesStepUseCase as RunComponentInterfacesStepUseCase,
      runUnitTestsStepUseCase as RunUnitTestsStepUseCase,
      runE2eTestsStepUseCase as RunE2eTestsStepUseCase,
      runComponentGenerationStepUseCase as RunComponentGenerationStepUseCase,
      runValidationStepUseCase as RunValidationStepUseCase,
    );

    await expect(
      useCase.run({
        componentDescription: 'Payment card component.',
        figmaUrl: null,
        screenshotUrl: null,
      }),
    ).resolves.toEqual({
      component: {
        business_context: 'merchant dashboard',
        name: 'Payment card',
        type: 'card',
      },
      extraction: {
        constraints: [],
        specified_states: [],
        tokens_referenced: [],
      },
      gap_analysis: {
        accessibility_gaps: ['Card selection must be keyboard reachable.'],
        missing_states: ['Selected state is not explicitly defined.'],
        recommendations: ['Define selected and delete-confirmation states.'],
        responsive_gaps: ['Action placement on narrow widths is not defined.'],
      },
      generated_code: {
        files: [
          {
            content: 'export function CardBrandIcon() { return null; }',
            filename: join(
              process.cwd(),
              'generated/frontend',
              'src',
              'components',
              'CardBrandIcon',
              'CardBrandIcon.tsx',
            ),
          },
          {
            content:
              'export function PaymentCard() { return <div style={{ color: "var(--color-text-primary)" }} />; }',
            filename: join(
              process.cwd(),
              'generated/frontend',
              'src',
              'components',
              'PaymentCard',
              'PaymentCard.tsx',
            ),
          },
        ],
        framework: 'React',
        states_covered: ['selected', 'error'],
        tokens_used: ['--icon-color-default', '--color-text-primary'],
      },
      validation: {
        accessibility_score: 'basic_pass',
        hallucinations_caught: [],
        issues_found: [],
        states_coverage: '2/2',
        token_compliance: true,
      },
    });

    expect(runComponentGenerationStepUseCase.execute).toHaveBeenCalledTimes(3);
    expect(runComponentGenerationStepUseCase.execute).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        canonicalStateModel: DEFAULT_CANONICAL_STATE_MODEL,
        designSystemContext: DEFAULT_DESIGN_SYSTEM_CONTEXT,
        targetComponent: expect.objectContaining({
          code: 'payment_card',
        }),
        targetSourceFilePath: join(
          process.cwd(),
          'generated/frontend',
          'src',
          'components',
          'PaymentCard',
          'PaymentCard.tsx',
        ),
        validationFeedback: {
          reasons: [
            'Unknown design-system tokens or CSS variables found: --imagined-border',
          ],
        },
      }),
    );
    expect(runValidationStepUseCase.execute).toHaveBeenCalledTimes(2);
    expect(runValidationStepUseCase.execute).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        canonicalStateModel: DEFAULT_CANONICAL_STATE_MODEL,
        generatedCode: expect.objectContaining({
          components: [
            expect.objectContaining({
              componentCode: 'card_brand_icon',
            }),
            expect.objectContaining({
              componentCode: 'payment_card',
              tokensUsed: ['--color-text-primary'],
            }),
          ],
          tokensUsed: expect.arrayContaining([
            '--color-text-primary',
            '--icon-color-default',
          ]),
        }),
      }),
    );
    expect(runRepository.updateById).toHaveBeenLastCalledWith(
      expect.objectContaining({
        id: 'run-id-2',
        status: RUN_STATUS.COMPLETED,
      }),
    );
  });

  it('returns the last validation result when regeneration does not converge', async () => {
    const runRepository = createRunRepositoryMock();
    const runGapAnalysisStepUseCase = createRunGapAnalysisStepUseCaseMock();
    const runParsingStepUseCase = createRunParsingStepUseCaseMock();
    const runResolvingGapsStepUseCase = createRunResolvingGapsStepUseCaseMock();
    const runUserFlowsStepUseCase = createRunUserFlowsStepUseCaseMock();
    const runComponentInterfacesStepUseCase =
      createRunComponentInterfacesStepUseCaseMock();
    const runUnitTestsStepUseCase = createRunUnitTestsStepUseCaseMock();
    const runE2eTestsStepUseCase = createRunE2eTestsStepUseCaseMock();
    const runComponentGenerationStepUseCase =
      createRunComponentGenerationStepUseCaseMock();
    const runValidationStepUseCase = createRunValidationStepUseCaseMock();

    runRepository.create = jest.fn().mockResolvedValue('run-id-3');
    runRepository.updateById = jest.fn().mockResolvedValue(null);
    runParsingStepUseCase.execute = jest.fn().mockResolvedValue({
      attempts: 1,
      output: {
        businessContext: 'merchant dashboard',
        components: [
          {
            code: 'payment_card',
            name: 'Payment card',
            parentCode: null,
            purpose: 'Display a saved card.',
            statePolicy: 'smart',
            type: 'card',
          },
        ],
        constraints: [],
        content: [],
        interactions: [
          {
            code: 'select_card',
            componentCode: 'payment_card',
            description: 'Select the saved card.',
            targetComponentCode: null,
            type: 'select',
          },
        ],
        rootComponentCode: 'payment_card',
        specifiedStates: [],
        tokenReferences: [],
      },
      rawOutput: '{"rootComponentCode":"payment_card"}',
      tokenUsage: createTokenUsage(10, 4, 14),
    });
    runGapAnalysisStepUseCase.execute = jest.fn().mockResolvedValue({
      attempts: 1,
      output: {
        accessibilityGaps: [],
        missingStates: ['Selected state is not explicitly defined.'],
        recommendations: ['Define selected state.'],
        responsiveGaps: [],
      },
      rawOutput:
        '{"missingStates":["Selected state is not explicitly defined."]}',
      tokenUsage: createTokenUsage(10, 4, 14),
    });
    runResolvingGapsStepUseCase.execute = jest.fn().mockResolvedValue({
      attempts: 1,
      output: {
        decisions: [
          {
            affectedComponentCodes: ['payment_card'],
            code: 'define_selected_state',
            decision: 'Add an explicit selected state for the payment card.',
            rationale: 'Selection must be explicit.',
            sourceGap: 'Selected state is not explicitly defined.',
          },
        ],
      },
      rawOutput: '{"decisions":[{"code":"define_selected_state"}]}',
      tokenUsage: createTokenUsage(10, 4, 14),
    });
    runUserFlowsStepUseCase.execute = jest.fn().mockResolvedValue({
      attempts: 1,
      output: {
        flows: [
          {
            code: 'select_saved_card_fast_path',
            completionCriteria: 'A saved card is selected.',
            kind: 'shortest_happy',
            name: 'Select saved card quickly',
            steps: [
              {
                action: 'User selects the saved card.',
                code: 'select_card',
                componentCode: 'payment_card',
                expectedResult: 'The card enters the selected state.',
                inputData: null,
              },
            ],
          },
        ],
      },
      rawOutput: '{"flows":[{"code":"select_saved_card_fast_path"}]}',
      tokenUsage: createTokenUsage(10, 4, 14),
    });
    runComponentInterfacesStepUseCase.execute = jest.fn().mockResolvedValue({
      attempts: 1,
      output: {
        accepts: [],
        componentCode: 'payment_card',
        componentName: 'Payment card',
        returns: [],
      },
      rawOutput: '{"componentCode":"payment_card"}',
      tokenUsage: createTokenUsage(10, 4, 14),
    });
    runUnitTestsStepUseCase.execute = jest.fn().mockResolvedValue({
      attempts: 1,
      output: {
        componentCode: 'payment_card',
        componentName: 'Payment card',
        coveredBehaviors: ['renders saved card details'],
        coveredStates: ['selected'],
        files: [
          {
            content: 'describe("PaymentCard", () => {});',
            filename: join(
              process.cwd(),
              'generated/frontend',
              'src',
              'components',
              'PaymentCard',
              'PaymentCard.spec.tsx',
            ),
          },
        ],
      },
      rawOutput: '{"componentCode":"payment_card"}',
      tokenUsage: createTokenUsage(10, 4, 14),
    });
    runE2eTestsStepUseCase.execute = jest.fn().mockResolvedValue({
      attempts: 1,
      output: {
        coveredBehaviors: ['selection propagates through the card flow'],
        coveredComponentCodes: ['payment_card'],
        coveredFlowCodes: ['select_saved_card_fast_path'],
        coveredStates: ['selected'],
        files: [
          {
            content: 'describe("PaymentCard e2e", () => {});',
            filename: join(
              process.cwd(),
              'generated/frontend',
              'src',
              'components',
              'PaymentCard',
              'PaymentCard.e2e.spec.tsx',
            ),
          },
        ],
        rootComponentCode: 'payment_card',
        rootComponentName: 'Payment card',
      },
      rawOutput: '{"rootComponentCode":"payment_card"}',
      tokenUsage: createTokenUsage(10, 4, 14),
    });
    runComponentGenerationStepUseCase.execute = jest
      .fn()
      .mockResolvedValueOnce({
        attempts: 1,
        output: {
          componentCode: 'payment_card',
          componentName: 'Payment card',
          files: [
            {
              content: 'export function PaymentCard() { return <div />; }',
              filename: join(
                process.cwd(),
                'generated/frontend',
                'src',
                'components',
                'PaymentCard',
                'PaymentCard.tsx',
              ),
            },
          ],
          statesCovered: [],
          tokensUsed: ['--color-text-primary'],
        },
        rawOutput: '{"componentCode":"payment_card"}',
        tokenUsage: createTokenUsage(10, 4, 14),
      })
      .mockResolvedValueOnce({
        attempts: 1,
        output: {
          componentCode: 'payment_card',
          componentName: 'Payment card',
          files: [
            {
              content:
                'export function PaymentCard() { return <div data-pass="2" />; }',
              filename: join(
                process.cwd(),
                'generated/frontend',
                'src',
                'components',
                'PaymentCard',
                'PaymentCard.tsx',
              ),
            },
          ],
          statesCovered: [],
          tokensUsed: ['--color-text-primary'],
        },
        rawOutput: '{"componentCode":"payment_card"}',
        tokenUsage: createTokenUsage(10, 4, 14),
      })
      .mockResolvedValueOnce({
        attempts: 1,
        output: {
          componentCode: 'payment_card',
          componentName: 'Payment card',
          files: [
            {
              content:
                'export function PaymentCard() { return <div data-pass="3" />; }',
              filename: join(
                process.cwd(),
                'generated/frontend',
                'src',
                'components',
                'PaymentCard',
                'PaymentCard.tsx',
              ),
            },
          ],
          statesCovered: [],
          tokensUsed: ['--color-text-primary'],
        },
        rawOutput: '{"componentCode":"payment_card"}',
        tokenUsage: createTokenUsage(10, 4, 14),
      });
    runValidationStepUseCase.execute = jest.fn().mockResolvedValue({
      attempts: 1,
      output: {
        accessibilityScore: 'needs_attention',
        affectedComponentCodes: ['payment_card'],
        contractCompatibilityIssues: [],
        hallucinationsCaught: [],
        isRegenerationRequired: true,
        issuesFound: ['Missing required states: selected'],
        regenerationReasons: [
          {
            componentCode: 'payment_card',
            reasons: ['Missing required states: selected'],
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
      tokenUsage: createTokenUsage(10, 4, 14),
    });

    const useCase = new RunOrchestratorUseCase(
      runRepository as RunRepository,
      runGapAnalysisStepUseCase as RunGapAnalysisStepUseCase,
      runParsingStepUseCase as RunParsingStepUseCase,
      runResolvingGapsStepUseCase as RunResolvingGapsStepUseCase,
      runUserFlowsStepUseCase as RunUserFlowsStepUseCase,
      runComponentInterfacesStepUseCase as RunComponentInterfacesStepUseCase,
      runUnitTestsStepUseCase as RunUnitTestsStepUseCase,
      runE2eTestsStepUseCase as RunE2eTestsStepUseCase,
      runComponentGenerationStepUseCase as RunComponentGenerationStepUseCase,
      runValidationStepUseCase as RunValidationStepUseCase,
    );

    await expect(
      useCase.run({
        componentDescription: 'Payment card component.',
        figmaUrl: null,
        screenshotUrl: null,
      }),
    ).resolves.toEqual({
      component: {
        business_context: 'merchant dashboard',
        name: 'Payment card',
        type: 'card',
      },
      extraction: {
        constraints: [],
        specified_states: [],
        tokens_referenced: [],
      },
      gap_analysis: {
        accessibility_gaps: [],
        missing_states: ['Selected state is not explicitly defined.'],
        recommendations: ['Define selected state.'],
        responsive_gaps: [],
      },
      generated_code: {
        files: [
          {
            content:
              'export function PaymentCard() { return <div data-pass="3" />; }',
            filename: join(
              process.cwd(),
              'generated/frontend',
              'src',
              'components',
              'PaymentCard',
              'PaymentCard.tsx',
            ),
          },
        ],
        framework: 'React',
        states_covered: [],
        tokens_used: ['--color-text-primary'],
      },
      validation: {
        accessibility_score: 'needs_attention',
        hallucinations_caught: [],
        issues_found: ['Missing required states: selected'],
        states_coverage: '0/1',
        token_compliance: true,
      },
    });

    expect(runValidationStepUseCase.execute).toHaveBeenCalledTimes(3);
    expect(runComponentGenerationStepUseCase.execute).toHaveBeenCalledTimes(3);
    expect(runRepository.updateById).toHaveBeenLastCalledWith(
      expect.objectContaining({
        id: 'run-id-3',
        status: RUN_STATUS.COMPLETED,
      }),
    );
  });

  it('interrupts the run when MAX_STEP_LIMIT is reached and returns partial data', async () => {
    const previousMaxStepLimit = process.env.MAX_STEP_LIMIT;

    process.env.MAX_STEP_LIMIT = '1';

    try {
      const runRepository = createRunRepositoryMock();
      const runGapAnalysisStepUseCase = createRunGapAnalysisStepUseCaseMock();
      const runParsingStepUseCase = createRunParsingStepUseCaseMock();
      const runResolvingGapsStepUseCase =
        createRunResolvingGapsStepUseCaseMock();
      const runUserFlowsStepUseCase = createRunUserFlowsStepUseCaseMock();
      const runComponentInterfacesStepUseCase =
        createRunComponentInterfacesStepUseCaseMock();
      const runUnitTestsStepUseCase = createRunUnitTestsStepUseCaseMock();
      const runE2eTestsStepUseCase = createRunE2eTestsStepUseCaseMock();
      const runComponentGenerationStepUseCase =
        createRunComponentGenerationStepUseCaseMock();
      const runValidationStepUseCase = createRunValidationStepUseCaseMock();

      runRepository.create = jest.fn().mockResolvedValue('run-id-4');
      runRepository.updateById = jest.fn().mockResolvedValue(null);
      runParsingStepUseCase.execute = jest.fn().mockResolvedValue({
        attempts: 1,
        output: {
          businessContext: 'merchant dashboard',
          components: [
            {
              code: 'payment_card',
              name: 'Payment card',
              parentCode: null,
              purpose: 'Display a saved card.',
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
        },
        rawOutput: '{"rootComponentCode":"payment_card"}',
        tokenUsage: createTokenUsage(10, 4, 14),
      });

      const useCase = new RunOrchestratorUseCase(
        runRepository as RunRepository,
        runGapAnalysisStepUseCase as RunGapAnalysisStepUseCase,
        runParsingStepUseCase as RunParsingStepUseCase,
        runResolvingGapsStepUseCase as RunResolvingGapsStepUseCase,
        runUserFlowsStepUseCase as RunUserFlowsStepUseCase,
        runComponentInterfacesStepUseCase as RunComponentInterfacesStepUseCase,
        runUnitTestsStepUseCase as RunUnitTestsStepUseCase,
        runE2eTestsStepUseCase as RunE2eTestsStepUseCase,
        runComponentGenerationStepUseCase as RunComponentGenerationStepUseCase,
        runValidationStepUseCase as RunValidationStepUseCase,
      );

      await expect(
        useCase.run({
          componentDescription: 'Payment card component.',
          figmaUrl: null,
          screenshotUrl: null,
        }),
      ).resolves.toEqual({
        component: {
          business_context: 'merchant dashboard',
          name: 'Payment card',
          type: 'card',
        },
        extraction: {
          constraints: [],
          specified_states: [],
          tokens_referenced: [],
        },
        gap_analysis: {
          accessibility_gaps: [],
          missing_states: [],
          recommendations: [],
          responsive_gaps: [],
        },
        generated_code: {
          files: [],
          framework: '',
          states_covered: [],
          tokens_used: [],
        },
        validation: {
          accessibility_score: 'not_run',
          hallucinations_caught: [],
          issues_found: ['Run interrupted after reaching MAX_STEP_LIMIT (1).'],
          states_coverage: '0/0',
          token_compliance: true,
        },
      });

      expect(runGapAnalysisStepUseCase.execute).not.toHaveBeenCalled();
      expect(runRepository.updateById).toHaveBeenLastCalledWith(
        expect.objectContaining({
          id: 'run-id-4',
          status: RUN_STATUS.INTERRUPTED,
        }),
      );
    } finally {
      if (previousMaxStepLimit === undefined) {
        delete process.env.MAX_STEP_LIMIT;
      } else {
        process.env.MAX_STEP_LIMIT = previousMaxStepLimit;
      }
    }
  });

  it('marks the run as failed when parsing throws', async () => {
    const runRepository = createRunRepositoryMock();
    const runGapAnalysisStepUseCase = createRunGapAnalysisStepUseCaseMock();
    const runParsingStepUseCase = createRunParsingStepUseCaseMock();
    const runResolvingGapsStepUseCase = createRunResolvingGapsStepUseCaseMock();
    const runUserFlowsStepUseCase = createRunUserFlowsStepUseCaseMock();
    const runComponentInterfacesStepUseCase =
      createRunComponentInterfacesStepUseCaseMock();
    const runUnitTestsStepUseCase = createRunUnitTestsStepUseCaseMock();
    const runE2eTestsStepUseCase = createRunE2eTestsStepUseCaseMock();
    const runComponentGenerationStepUseCase =
      createRunComponentGenerationStepUseCaseMock();
    const runValidationStepUseCase = createRunValidationStepUseCaseMock();
    const error = new Error('Step execution failed', {
      cause: new Error('Output schema validation failed'),
    });

    runRepository.create = jest.fn().mockResolvedValue('run-id-1');
    runRepository.updateById = jest.fn().mockResolvedValue(null);
    runParsingStepUseCase.execute = jest.fn().mockRejectedValue(error);

    const useCase = new RunOrchestratorUseCase(
      runRepository as RunRepository,
      runGapAnalysisStepUseCase as RunGapAnalysisStepUseCase,
      runParsingStepUseCase as RunParsingStepUseCase,
      runResolvingGapsStepUseCase as RunResolvingGapsStepUseCase,
      runUserFlowsStepUseCase as RunUserFlowsStepUseCase,
      runComponentInterfacesStepUseCase as RunComponentInterfacesStepUseCase,
      runUnitTestsStepUseCase as RunUnitTestsStepUseCase,
      runE2eTestsStepUseCase as RunE2eTestsStepUseCase,
      runComponentGenerationStepUseCase as RunComponentGenerationStepUseCase,
      runValidationStepUseCase as RunValidationStepUseCase,
    );

    await expect(
      useCase.run({
        componentDescription: 'Payment card component.',
        figmaUrl: null,
        screenshotUrl: null,
      }),
    ).rejects.toThrow('Step execution failed');

    expect(runRepository.updateById).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        completedAt: expect.any(Date),
        errorDetails: 'Output schema validation failed',
        errorMessage: 'Step execution failed',
        id: 'run-id-1',
        status: RUN_STATUS.FAILED,
      }),
    );
  });
});
