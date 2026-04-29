import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { STEP_COLLECTION_NAME } from '../constants';
import type { IStep } from '../types';
import { IStepValidation } from '../types';

@Schema({
  _id: false,
  versionKey: false,
})
export class StepValidationDocument implements IStepValidation {
  @Prop({
    required: true,
    type: Boolean,
  })
  validateInputSchema: boolean;

  @Prop({
    required: true,
    type: Boolean,
  })
  validateOutputSchema: boolean;
}

export const StepValidationSchema = SchemaFactory.createForClass(
  StepValidationDocument,
);

@Schema({
  collection: STEP_COLLECTION_NAME,
  versionKey: false,
})
export class StepDocument implements IStep {
  @Prop({
    min: 1,
    required: true,
    type: Number,
  })
  v: number;

  @Prop({
    required: true,
    trim: true,
    type: String,
  })
  name: string;

  @Prop({
    required: true,
    trim: true,
    type: String,
  })
  purpose: string;

  @Prop({
    required: true,
    trim: true,
    type: String,
  })
  code: string;

  @Prop({
    required: true,
    trim: true,
    type: String,
  })
  promptCode: string;

  @Prop({
    required: true,
    trim: true,
    type: String,
  })
  promptVariant: string;

  @Prop({
    default: null,
    type: mongoose.Schema.Types.Mixed,
  })
  inputSchema: IStep['inputSchema'];

  @Prop({
    default: null,
    type: mongoose.Schema.Types.Mixed,
  })
  outputSchema: IStep['outputSchema'];

  @Prop({
    min: 0,
    required: true,
    type: Number,
  })
  maxRetries: number;

  @Prop({
    required: true,
    type: StepValidationSchema,
  })
  validation: StepValidationDocument;

  @Prop({
    default: true,
    required: true,
    type: Boolean,
  })
  isActive: boolean;
}

export type StepHydratedDocument = HydratedDocument<StepDocument>;

export const StepSchema = SchemaFactory.createForClass(StepDocument);

StepSchema.index(
  {
    code: 1,
    v: 1,
  },
  {
    unique: true,
  },
);

StepSchema.index({
  code: 1,
  isActive: 1,
});
