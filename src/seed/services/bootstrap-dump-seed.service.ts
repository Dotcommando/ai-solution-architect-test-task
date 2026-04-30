import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PROMPTS_DUMP_RELATIVE_PATH,
  STEPS_DUMP_RELATIVE_PATH,
} from '../constants';
import { PromptDocument } from '../../prompt/schemas';
import { IPrompt } from '../../prompt/types';
import { StepDocument } from '../../step/schemas';
import { IStep } from '../../step/types';
import { ISeedCollectionStats } from '../types';

@Injectable()
export class BootstrapDumpSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapDumpSeedService.name);

  constructor(
    @InjectModel(PromptDocument.name)
    private readonly promptModel: Model<PromptDocument>,
    @InjectModel(StepDocument.name)
    private readonly stepModel: Model<StepDocument>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const stats = await this.seedMissingCollections();

    if (stats.promptsSeeded > 0 || stats.stepsSeeded > 0) {
      this.logger.log(
        `Seeded MongoDB dumps: prompts=${stats.promptsSeeded}, steps=${stats.stepsSeeded}`,
      );
    }
  }

  async seedMissingCollections(): Promise<ISeedCollectionStats> {
    const promptsSeeded = await this.seedPromptsIfCollectionIsEmpty();
    const stepsSeeded = await this.seedStepsIfCollectionIsEmpty();

    return {
      promptsSeeded,
      stepsSeeded,
    };
  }

  private async seedPromptsIfCollectionIsEmpty(): Promise<number> {
    const promptCount = await this.promptModel.countDocuments({}).exec();

    if (promptCount > 0) {
      return 0;
    }

    const prompts = await this.readDumpFile<IPrompt>(
      PROMPTS_DUMP_RELATIVE_PATH,
    );

    if (prompts.length === 0) {
      return 0;
    }

    await this.promptModel.bulkWrite(
      prompts.map((prompt) => {
        return {
          updateOne: {
            filter: {
              code: prompt.code,
              v: prompt.v,
              variant: prompt.variant,
            },
            update: {
              $set: prompt,
            },
            upsert: true,
          },
        };
      }),
    );

    return prompts.length;
  }

  private async seedStepsIfCollectionIsEmpty(): Promise<number> {
    const stepCount = await this.stepModel.countDocuments({}).exec();

    if (stepCount > 0) {
      return 0;
    }

    const steps = await this.readDumpFile<IStep>(STEPS_DUMP_RELATIVE_PATH);

    if (steps.length === 0) {
      return 0;
    }

    await this.stepModel.bulkWrite(
      steps.map((step) => {
        return {
          updateOne: {
            filter: {
              code: step.code,
              v: step.v,
            },
            update: {
              $set: step,
            },
            upsert: true,
          },
        };
      }),
    );

    return steps.length;
  }

  private async readDumpFile<TDocument extends object>(
    relativePath: string,
  ): Promise<TDocument[]> {
    const dumpPath = join(process.cwd(), relativePath);
    const dumpContent = await readFile(dumpPath, 'utf8');

    return JSON.parse(dumpContent) as TDocument[];
  }
}
