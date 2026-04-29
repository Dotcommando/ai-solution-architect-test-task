import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {
  RUN_COLLECTION_NAME,
  RUN_STATUS,
  RUN_STEP_CODE,
  RUN_STEP_STATUS,
} from '../constants';
import {
  IRun,
  IRunArtifacts,
  IRunDerivedData,
  IRunInput,
  IRunResult,
  IRunStepModelReference,
  IRunStepPromptReference,
  IRunStepReport,
  IRunStepTokenUsage,
  IRunTokenUsageTotals,
} from '../types';

@Schema({
  _id: false,
  versionKey: false,
})
export class RunInputDocument implements IRunInput {
  @Prop({
    required: true,
    trim: true,
    type: String,
  })
  componentDescription: string;

  @Prop({
    default: null,
    trim: true,
    type: String,
  })
  figmaUrl: string | null;

  @Prop({
    default: null,
    trim: true,
    type: String,
  })
  screenshotUrl: string | null;
}

export const RunInputSchema = SchemaFactory.createForClass(RunInputDocument);

@Schema({
  _id: false,
  versionKey: false,
})
export class RunStepTokenUsageDocument implements IRunStepTokenUsage {
  @Prop({
    default: null,
    type: Number,
  })
  cachedInputTokens: number | null;

  @Prop({
    default: null,
    type: Number,
  })
  inputTokens: number | null;

  @Prop({
    default: null,
    type: Number,
  })
  outputTokens: number | null;

  @Prop({
    default: null,
    type: Number,
  })
  reasoningTokens: number | null;

  @Prop({
    default: null,
    type: Number,
  })
  totalTokens: number | null;
}

export const RunStepTokenUsageSchema = SchemaFactory.createForClass(
  RunStepTokenUsageDocument,
);

@Schema({
  _id: false,
  versionKey: false,
})
export class RunStepPromptReferenceDocument implements IRunStepPromptReference {
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
  variant: string;

  @Prop({
    default: null,
    type: Number,
  })
  version: number | null;
}

export const RunStepPromptReferenceSchema = SchemaFactory.createForClass(
  RunStepPromptReferenceDocument,
);

@Schema({
  _id: false,
  versionKey: false,
})
export class RunStepModelReferenceDocument implements IRunStepModelReference {
  @Prop({
    default: null,
    trim: true,
    type: String,
  })
  model: string | null;

  @Prop({
    required: true,
    trim: true,
    type: String,
  })
  provider: string;
}

export const RunStepModelReferenceSchema = SchemaFactory.createForClass(
  RunStepModelReferenceDocument,
);

@Schema({
  _id: false,
  versionKey: false,
})
export class RunStepReportDocument implements IRunStepReport {
  @Prop({
    min: 0,
    required: true,
    type: Number,
  })
  attempts: number;

  @Prop({
    enum: Object.values(RUN_STEP_CODE),
    required: true,
    type: String,
  })
  code: RUN_STEP_CODE;

  @Prop({
    default: null,
    type: Date,
  })
  completedAt: Date | null;

  @Prop({
    default: null,
    min: 0,
    type: Number,
  })
  durationMs: number | null;

  @Prop({
    default: null,
    trim: true,
    type: String,
  })
  errorDetails: string | null;

  @Prop({
    default: null,
    trim: true,
    type: String,
  })
  errorMessage: string | null;

  @Prop({
    required: true,
    type: String,
  })
  inputJson: string;

  @Prop({
    required: true,
    type: RunStepModelReferenceSchema,
  })
  model: RunStepModelReferenceDocument;

  @Prop({
    min: 0,
    required: true,
    type: Number,
  })
  order: number;

  @Prop({
    default: null,
    type: String,
  })
  outputJson: string | null;

  @Prop({
    required: true,
    type: RunStepPromptReferenceSchema,
  })
  prompt: RunStepPromptReferenceDocument;

  @Prop({
    default: null,
    type: String,
  })
  rawOutput: string | null;

  @Prop({
    default: null,
    type: Date,
  })
  startedAt: Date | null;

  @Prop({
    enum: Object.values(RUN_STEP_STATUS),
    required: true,
    type: String,
  })
  status: RUN_STEP_STATUS;

  @Prop({
    default: null,
    trim: true,
    type: String,
  })
  targetComponentCode: string | null;

  @Prop({
    required: true,
    type: RunStepTokenUsageSchema,
  })
  tokenUsage: RunStepTokenUsageDocument;
}

export const RunStepReportSchema = SchemaFactory.createForClass(
  RunStepReportDocument,
);

@Schema({
  _id: false,
  versionKey: false,
})
export class RunTokenUsageTotalsDocument implements IRunTokenUsageTotals {
  @Prop({
    default: 0,
    min: 0,
    required: true,
    type: Number,
  })
  cachedInputTokens: number;

  @Prop({
    default: 0,
    min: 0,
    required: true,
    type: Number,
  })
  inputTokens: number;

  @Prop({
    default: 0,
    min: 0,
    required: true,
    type: Number,
  })
  outputTokens: number;

  @Prop({
    default: 0,
    min: 0,
    required: true,
    type: Number,
  })
  reasoningTokens: number;

  @Prop({
    default: 0,
    min: 0,
    required: true,
    type: Number,
  })
  totalTokens: number;
}

export const RunTokenUsageTotalsSchema = SchemaFactory.createForClass(
  RunTokenUsageTotalsDocument,
);

@Schema({
  _id: false,
  versionKey: false,
})
export class RunArtifactsDocument implements IRunArtifacts {
  @Prop({
    default: null,
    type: mongoose.Schema.Types.Mixed,
  })
  componentInterfaces: IRunArtifacts['componentInterfaces'];

  @Prop({
    default: null,
    type: mongoose.Schema.Types.Mixed,
  })
  generatedCode: IRunArtifacts['generatedCode'];

  @Prop({
    default: null,
    type: mongoose.Schema.Types.Mixed,
  })
  gapAnalysis: IRunArtifacts['gapAnalysis'];

  @Prop({
    default: null,
    type: mongoose.Schema.Types.Mixed,
  })
  e2eTests: IRunArtifacts['e2eTests'];

  @Prop({
    default: null,
    type: mongoose.Schema.Types.Mixed,
  })
  parsing: IRunArtifacts['parsing'];

  @Prop({
    default: null,
    type: mongoose.Schema.Types.Mixed,
  })
  resolvingGaps: IRunArtifacts['resolvingGaps'];

  @Prop({
    default: null,
    type: mongoose.Schema.Types.Mixed,
  })
  unitTests: IRunArtifacts['unitTests'];

  @Prop({
    default: null,
    type: mongoose.Schema.Types.Mixed,
  })
  userFlows: IRunArtifacts['userFlows'];

  @Prop({
    default: null,
    type: mongoose.Schema.Types.Mixed,
  })
  validation: IRunArtifacts['validation'];
}

export const RunArtifactsSchema = SchemaFactory.createForClass(
  RunArtifactsDocument,
);

@Schema({
  _id: false,
  versionKey: false,
})
export class RunDerivedDataDocument implements IRunDerivedData {
  @Prop({
    default: [],
    required: true,
    type: [String],
  })
  constraintDescriptions: string[];

  @Prop({
    default: [],
    required: true,
    type: [mongoose.Schema.Types.Mixed],
  })
  extractionConstraints: IRunDerivedData['extractionConstraints'];

  @Prop({
    default: [],
    required: true,
    type: [mongoose.Schema.Types.Mixed],
  })
  extractionSpecifiedStates: IRunDerivedData['extractionSpecifiedStates'];

  @Prop({
    default: [],
    required: true,
    type: [mongoose.Schema.Types.Mixed],
  })
  extractionTokenReferences: IRunDerivedData['extractionTokenReferences'];

  @Prop({
    default: [],
    required: true,
    type: [String],
  })
  referencedTokenNames: string[];

  @Prop({
    default: null,
    type: mongoose.Schema.Types.Mixed,
  })
  rootComponent: IRunDerivedData['rootComponent'];

  @Prop({
    default: null,
    trim: true,
    type: String,
  })
  rootComponentName: string | null;

  @Prop({
    default: null,
    type: String,
  })
  rootComponentType: IRunDerivedData['rootComponentType'];

  @Prop({
    default: [],
    required: true,
    type: [String],
  })
  specifiedStateNames: string[];
}

export const RunDerivedDataSchema = SchemaFactory.createForClass(
  RunDerivedDataDocument,
);

@Schema({
  collection: RUN_COLLECTION_NAME,
  timestamps: true,
  versionKey: false,
})
export class RunDocument {
  @Prop({
    default: {},
    required: true,
    type: RunArtifactsSchema,
  })
  artifacts: RunArtifactsDocument;

  @Prop({
    default: null,
    type: Date,
  })
  completedAt: Date | null;

  @Prop({
    default: {},
    required: true,
    type: RunDerivedDataSchema,
  })
  derivedData: RunDerivedDataDocument;

  @Prop({
    default: null,
    trim: true,
    type: String,
  })
  errorDetails: string | null;

  @Prop({
    default: null,
    trim: true,
    type: String,
  })
  errorMessage: string | null;

  @Prop({
    required: true,
    type: RunInputSchema,
  })
  input: RunInputDocument;

  @Prop({
    default: null,
    type: mongoose.Schema.Types.Mixed,
  })
  result: IRunResult | null;

  @Prop({
    default: null,
    type: Date,
  })
  startedAt: Date | null;

  @Prop({
    default: RUN_STATUS.PENDING,
    enum: Object.values(RUN_STATUS),
    required: true,
    type: String,
  })
  status: RUN_STATUS;

  @Prop({
    default: [],
    required: true,
    type: [RunStepReportSchema],
  })
  steps: RunStepReportDocument[];

  @Prop({
    default: {},
    required: true,
    type: RunTokenUsageTotalsSchema,
  })
  tokenUsageTotals: RunTokenUsageTotalsDocument;

  createdAt: Date;
  updatedAt: Date;
}

export type RunHydratedDocument = HydratedDocument<RunDocument>;

export const RunSchema = SchemaFactory.createForClass(RunDocument);

RunSchema.index({
  createdAt: -1,
});

RunSchema.index({
  status: 1,
  createdAt: -1,
});
