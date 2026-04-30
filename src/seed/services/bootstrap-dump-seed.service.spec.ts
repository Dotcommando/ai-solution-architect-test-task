import { readFile } from 'node:fs/promises';
import { Model } from 'mongoose';
import { IPrompt } from '../../prompt/types';
import { IStep } from '../../step/types';
import { BootstrapDumpSeedService } from './bootstrap-dump-seed.service';

jest.mock('node:fs/promises', () => {
  return {
    readFile: jest.fn(),
  };
});

interface ICountDocumentsQuery {
  exec(): Promise<number>;
}

interface ISeedModel {
  bulkWrite: jest.Mock<Promise<unknown>, [unknown[]]>;
  countDocuments: jest.Mock<ICountDocumentsQuery, [Record<string, never>]>;
}

function createSeedModel(count: number): ISeedModel {
  return {
    bulkWrite: jest.fn<Promise<unknown>, [unknown[]]>().mockResolvedValue({}),
    countDocuments: jest.fn<ICountDocumentsQuery, [Record<string, never>]>(
      () => {
        return {
          exec: jest.fn<Promise<number>, []>().mockResolvedValue(count),
        };
      },
    ),
  };
}

describe('BootstrapDumpSeedService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('seeds prompts and steps when both collections are empty', async () => {
    const promptModel = createSeedModel(0);
    const stepModel = createSeedModel(0);
    const prompts: IPrompt[] = [
      {
        code: 'parsing',
        isActive: true,
        stepCode: 'parsing',
        system: 'system',
        userTemplate: 'template',
        v: 1,
        variant: 'control',
      },
    ];
    const steps: IStep[] = [
      {
        code: 'parsing',
        inputSchema: null,
        isActive: true,
        maxRetries: 2,
        name: 'Parsing',
        outputSchema: null,
        promptCode: 'parsing',
        promptVariant: 'control',
        purpose: 'Parse input',
        v: 1,
        validation: {
          validateInputSchema: true,
          validateOutputSchema: true,
        },
      },
    ];

    jest
      .mocked(readFile)
      .mockResolvedValueOnce(JSON.stringify(prompts))
      .mockResolvedValueOnce(JSON.stringify(steps));

    const service = new BootstrapDumpSeedService(
      promptModel as unknown as Model<IPrompt>,
      stepModel as unknown as Model<IStep>,
    );

    await expect(service.seedMissingCollections()).resolves.toEqual({
      promptsSeeded: 1,
      stepsSeeded: 1,
    });

    expect(promptModel.bulkWrite).toHaveBeenCalledTimes(1);
    expect(stepModel.bulkWrite).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledTimes(2);
  });

  it('does not seed collections that already contain data', async () => {
    const promptModel = createSeedModel(1);
    const stepModel = createSeedModel(3);
    const service = new BootstrapDumpSeedService(
      promptModel as unknown as Model<IPrompt>,
      stepModel as unknown as Model<IStep>,
    );

    await expect(service.seedMissingCollections()).resolves.toEqual({
      promptsSeeded: 0,
      stepsSeeded: 0,
    });

    expect(promptModel.bulkWrite).not.toHaveBeenCalled();
    expect(stepModel.bulkWrite).not.toHaveBeenCalled();
    expect(readFile).not.toHaveBeenCalled();
  });
});
