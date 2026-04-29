import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RunDocument } from '../schemas';
import {
  ICreateRunRepositoryRequest,
  IRun,
  IUpdateRunByIdRepositoryRequest,
} from '../types';

interface IRunStoredRecord extends Omit<IRun, 'id'> {
  _id: Types.ObjectId | string;
}

@Injectable()
export class RunRepository {
  constructor(
    @InjectModel(RunDocument.name)
    private readonly runModel: Model<RunDocument>,
  ) {}

  async create(request: ICreateRunRepositoryRequest): Promise<string> {
    const createdRun = await this.runModel.create({
      input: request.input,
    });

    return createdRun._id.toString();
  }

  async findById(id: string): Promise<IRun | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const run = await this.runModel
      .findById(id)
      .lean<IRunStoredRecord>()
      .exec();

    return this.mapToRun(run);
  }

  async updateById(
    request: IUpdateRunByIdRepositoryRequest,
  ): Promise<IRun | null> {
    if (!Types.ObjectId.isValid(request.id)) {
      return null;
    }

    const updatePayload = this.buildUpdatePayload(request);
    const run = await this.runModel
      .findByIdAndUpdate(
        request.id,
        updatePayload,
        {
          returnDocument: 'after',
          runValidators: true,
        },
      )
      .lean<IRunStoredRecord>()
      .exec();

    return this.mapToRun(run);
  }

  private buildUpdatePayload(
    request: IUpdateRunByIdRepositoryRequest,
  ): Record<string, unknown> {
    const updatePayload: Record<string, unknown> = {};

    if (request.artifacts !== undefined) {
      updatePayload.artifacts = request.artifacts;
    }

    if (request.completedAt !== undefined) {
      updatePayload.completedAt = request.completedAt;
    }

    if (request.derivedData !== undefined) {
      updatePayload.derivedData = request.derivedData;
    }

    if (request.errorDetails !== undefined) {
      updatePayload.errorDetails = request.errorDetails;
    }

    if (request.errorMessage !== undefined) {
      updatePayload.errorMessage = request.errorMessage;
    }

    if (request.result !== undefined) {
      updatePayload.result = request.result;
    }

    if (request.startedAt !== undefined) {
      updatePayload.startedAt = request.startedAt;
    }

    if (request.status !== undefined) {
      updatePayload.status = request.status;
    }

    if (request.steps !== undefined) {
      updatePayload.steps = request.steps;
    }

    if (request.tokenUsageTotals !== undefined) {
      updatePayload.tokenUsageTotals = request.tokenUsageTotals;
    }

    return updatePayload;
  }

  private mapToRun(record: IRunStoredRecord | null): IRun | null {
    if (record === null) {
      return null;
    }

    return {
      ...record,
      id: record._id.toString(),
    };
  }
}
