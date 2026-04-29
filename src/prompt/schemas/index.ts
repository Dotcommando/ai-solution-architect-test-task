import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PROMPT_COLLECTION_NAME } from '../constants';
import { IPrompt } from '../types';

@Schema({
  collection: PROMPT_COLLECTION_NAME,
  versionKey: false,
})
export class PromptDocument implements IPrompt {
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
  code: string;

  @Prop({
    required: true,
    trim: true,
    type: String,
  })
  stepCode: string;

  @Prop({
    required: true,
    trim: true,
    type: String,
  })
  variant: string;

  @Prop({
    required: true,
    trim: true,
    type: String,
  })
  system: string;

  @Prop({
    required: true,
    trim: true,
    type: String,
  })
  userTemplate: string;

  @Prop({
    default: true,
    required: true,
    type: Boolean,
  })
  isActive: boolean;
}

export type PromptHydratedDocument = HydratedDocument<PromptDocument>;

export const PromptSchema = SchemaFactory.createForClass(PromptDocument);

PromptSchema.index(
  {
    code: 1,
    variant: 1,
    v: 1,
  },
  {
    unique: true,
  },
);

PromptSchema.index({
  code: 1,
  isActive: 1,
  variant: 1,
});

PromptSchema.index({
  isActive: 1,
  stepCode: 1,
  variant: 1,
});
