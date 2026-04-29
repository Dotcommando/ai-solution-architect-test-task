import { RunGapAnalysisStepUseCase } from '../../gap-analysis/use-cases/run-gap-analysis-step.use-case';
import { RunParsingStepUseCase } from '../../parsing/use-cases/run-parsing-step.use-case';
import { RUN_STATUS } from '../../run/constants';
import { RunRepository } from '../../run/repositories/run.repository';
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

  it('creates a run, executes parsing, and persists progress', async () => {
    const runRepository = createRunRepositoryMock();
    const runGapAnalysisStepUseCase = createRunGapAnalysisStepUseCaseMock();
    const runParsingStepUseCase = createRunParsingStepUseCaseMock();

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
      rawOutput: '{"missingStates":["Selected state is not explicitly defined."]}',
    });

    const useCase = new RunOrchestratorUseCase(
      runRepository as RunRepository,
      runGapAnalysisStepUseCase as RunGapAnalysisStepUseCase,
      runParsingStepUseCase as RunParsingStepUseCase,
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
    expect(runRepository.create).toHaveBeenCalledWith({
      input: {
        componentDescription: 'Payment card component.',
        figmaUrl: null,
        screenshotUrl: null,
      },
    });
    expect(runRepository.updateById).toHaveBeenCalledTimes(4);
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
        id: 'run-id-1',
        status: RUN_STATUS.COMPLETED,
      }),
    );
  });

  it('marks the run as failed when parsing throws', async () => {
    const runRepository = createRunRepositoryMock();
    const runGapAnalysisStepUseCase = createRunGapAnalysisStepUseCaseMock();
    const runParsingStepUseCase = createRunParsingStepUseCaseMock();
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
