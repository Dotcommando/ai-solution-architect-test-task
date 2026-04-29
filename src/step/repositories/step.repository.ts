import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StepDocument } from '../schemas';
import { IStep } from '../types';

@Injectable()
export class StepRepository {
  constructor(
    @InjectModel(StepDocument.name)
    private readonly stepModel: Model<StepDocument>,
  ) {}

  async findActiveByCode(code: string): Promise<IStep | null> {
    return this.stepModel
      .findOne({
        code,
        isActive: true,
      })
      .lean<IStep>()
      .exec();
  }

  async findAllActive(): Promise<IStep[]> {
    return this.stepModel
      .find({
        isActive: true,
      })
      .lean<IStep[]>()
      .exec();
  }
}
