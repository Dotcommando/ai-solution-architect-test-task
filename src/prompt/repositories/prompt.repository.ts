import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PromptDocument } from '../schemas';
import { IPrompt } from '../types';

@Injectable()
export class PromptRepository {
  constructor(
    @InjectModel(PromptDocument.name)
    private readonly promptModel: Model<PromptDocument>,
  ) {}

  async findActiveByCodeAndVariant(
    code: string,
    variant: string,
  ): Promise<IPrompt | null> {
    return this.promptModel
      .findOne({
        code,
        isActive: true,
        variant,
      })
      .lean<IPrompt>()
      .exec();
  }

  async findActiveByStepCodeAndVariant(
    stepCode: string,
    variant: string,
  ): Promise<IPrompt | null> {
    return this.promptModel
      .findOne({
        isActive: true,
        stepCode,
        variant,
      })
      .lean<IPrompt>()
      .exec();
  }
}
