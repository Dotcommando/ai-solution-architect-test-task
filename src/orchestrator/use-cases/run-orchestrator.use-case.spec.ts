/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { join } from 'node:path';
import { RunComponentInterfacesStepUseCase } from '../../component-interfaces/use-cases/run-component-interfaces-step.use-case';
import { RunE2eTestsStepUseCase } from '../../e2e-tests/use-cases/run-e2e-tests-step.use-case';
import { RunGapAnalysisStepUseCase } from '../../gap-analysis/use-cases/run-gap-analysis-step.use-case';
import { RunParsingStepUseCase } from '../../parsing/use-cases/run-parsing-step.use-case';
import { RunResolvingGapsStepUseCase } from '../../resolving-gaps/use-cases/run-resolving-gaps-step.use-case';
import { RUN_STATUS } from '../../run/constants';
import { RunRepository } from '../../run/repositories/run.repository';
import { RunUnitTestsStepUseCase } from '../../unit-tests/use-cases/run-unit-tests-step.use-case';
import { RunUserFlowsStepUseCase } from '../../user-flows/use-cases/run-user-flows-step.use-case';
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
    );

    await expect(
      useCase.run({
        componentDescription: 'Payment card component.',
        figmaUrl: null,
        screenshotUrl: null,
      }),
    ).resolves.toEqual({
      attempts: 1,
      input: {
        componentDescription: 'Payment card component.',
        figmaUrl: null,
        screenshotUrl: null,
      },
      parsing: {
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
      runId: 'run-id-1',
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
    expect(runRepository.create).toHaveBeenCalledWith({
      input: {
        componentDescription: 'Payment card component.',
        figmaUrl: null,
        screenshotUrl: null,
      },
    });
    expect(runRepository.updateById).toHaveBeenCalledTimes(11);
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
          }),
        ],
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
            targetComponentCode: 'payment_card',
          }),
          expect.objectContaining({
            code: 'e2e_tests',
            order: 9,
            status: 'completed',
            targetComponentCode: 'payment_card',
          }),
        ],
      }),
    );
    expect(runRepository.updateById).toHaveBeenNthCalledWith(
      11,
      expect.objectContaining({
        id: 'run-id-1',
        status: RUN_STATUS.COMPLETED,
      }),
    );
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
