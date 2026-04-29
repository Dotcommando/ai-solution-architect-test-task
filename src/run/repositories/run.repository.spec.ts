import { Model, Types } from 'mongoose';
import { RUN_STATUS } from '../constants';
import { RunDocument } from '../schemas';
import { RunRepository } from './run.repository';

interface ILeanExecMock<TValue> {
  exec: jest.Mock<Promise<TValue>, []>;
}

interface ILeanQueryMock<TValue> {
  lean: jest.Mock<ILeanExecMock<TValue>, []>;
}

describe('RunRepository', () => {
  const createModelMock = (): Pick<
    Model<RunDocument>,
    'create' | 'findById' | 'findByIdAndUpdate'
  > => {
    return {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
  };

  const createStoredRun = () => {
    return {
      _id: new Types.ObjectId('65f0b8f3a8a5ab0ce6f4a001'),
      artifacts: {
        componentInterfaces: null,
        e2eTests: null,
        gapAnalysis: null,
        generatedCode: null,
        parsing: null,
        resolvingGaps: null,
        unitTests: null,
        userFlows: null,
        validation: null,
      },
      completedAt: null,
      createdAt: new Date('2026-04-29T12:00:00.000Z'),
      derivedData: {
        constraintDescriptions: [],
        extractionConstraints: [],
        extractionSpecifiedStates: [],
        extractionTokenReferences: [],
        referencedTokenNames: [],
        rootComponent: null,
        rootComponentName: null,
        rootComponentType: null,
        specifiedStateNames: [],
      },
      errorDetails: null,
      errorMessage: null,
      input: {
        componentDescription: 'Payment card component.',
        figmaUrl: null,
        screenshotUrl: null,
      },
      result: null,
      startedAt: null,
      status: RUN_STATUS.PENDING,
      steps: [],
      tokenUsageTotals: {
        cachedInputTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        reasoningTokens: 0,
        totalTokens: 0,
      },
      updatedAt: new Date('2026-04-29T12:00:00.000Z'),
    };
  };

  it('creates a run and returns its object id', async () => {
    const runModel = createModelMock();

    runModel.create = jest.fn().mockResolvedValue({
      _id: new Types.ObjectId('65f0b8f3a8a5ab0ce6f4a001'),
    });

    const repository = new RunRepository(runModel as Model<RunDocument>);

    await expect(
      repository.create({
        input: {
          componentDescription: 'Payment card component.',
          figmaUrl: null,
          screenshotUrl: null,
        },
      }),
    ).resolves.toBe('65f0b8f3a8a5ab0ce6f4a001');

    expect(runModel.create).toHaveBeenCalledWith({
      input: {
        componentDescription: 'Payment card component.',
        figmaUrl: null,
        screenshotUrl: null,
      },
    });
  });

  it('returns null from findById when the id is invalid', async () => {
    const runModel = createModelMock();
    const repository = new RunRepository(runModel as Model<RunDocument>);

    await expect(repository.findById('invalid-id')).resolves.toBeNull();

    expect(runModel.findById).not.toHaveBeenCalled();
  });

  it('loads a run by id and maps _id to id', async () => {
    const runModel = createModelMock();
    const storedRun = createStoredRun();
    const execMock: ILeanExecMock<typeof storedRun | null> = {
      exec: jest.fn().mockResolvedValue(storedRun),
    };
    const queryMock: ILeanQueryMock<typeof storedRun | null> = {
      lean: jest.fn().mockReturnValue(execMock),
    };

    runModel.findById = jest.fn().mockReturnValue(queryMock);

    const repository = new RunRepository(runModel as Model<RunDocument>);

    await expect(
      repository.findById('65f0b8f3a8a5ab0ce6f4a001'),
    ).resolves.toEqual({
      ...storedRun,
      id: '65f0b8f3a8a5ab0ce6f4a001',
    });
  });

  it('updates a run by id and returns the updated run', async () => {
    const runModel = createModelMock();
    const storedRun = createStoredRun();
    const execMock: ILeanExecMock<typeof storedRun | null> = {
      exec: jest.fn().mockResolvedValue(storedRun),
    };
    const queryMock: ILeanQueryMock<typeof storedRun | null> = {
      lean: jest.fn().mockReturnValue(execMock),
    };

    runModel.findByIdAndUpdate = jest.fn().mockReturnValue(queryMock);

    const repository = new RunRepository(runModel as Model<RunDocument>);

    await expect(
      repository.updateById({
        errorMessage: 'Step execution failed',
        id: '65f0b8f3a8a5ab0ce6f4a001',
        status: RUN_STATUS.FAILED,
      }),
    ).resolves.toEqual({
      ...storedRun,
      id: '65f0b8f3a8a5ab0ce6f4a001',
    });

    expect(runModel.findByIdAndUpdate).toHaveBeenCalledWith(
      '65f0b8f3a8a5ab0ce6f4a001',
      {
        errorMessage: 'Step execution failed',
        status: RUN_STATUS.FAILED,
      },
      {
        returnDocument: 'after',
        runValidators: true,
      },
    );
  });

  it('returns null from updateById when the id is invalid', async () => {
    const runModel = createModelMock();
    const repository = new RunRepository(runModel as Model<RunDocument>);

    await expect(
      repository.updateById({
        id: 'invalid-id',
        status: RUN_STATUS.RUNNING,
      }),
    ).resolves.toBeNull();

    expect(runModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });
});
