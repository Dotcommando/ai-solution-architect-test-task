import type { AnySchemaObject } from 'ajv';
import { IParsingStepOutput } from '../../types';

export interface IGapAnalysisStepInput {
  componentDescription: string;
  parsing: IParsingStepOutput;
}

export interface IGapAnalysisStepOutput {
  accessibilityGaps: string[];
  missingStates: string[];
  recommendations: string[];
  responsiveGaps: string[];
}

export interface IRunGapAnalysisStepUseCaseRequest {
  componentDescription: string;
  parsing: IParsingStepOutput;
}

export interface IRunGapAnalysisStepUseCaseResponse {
  attempts: number;
  output: IGapAnalysisStepOutput;
  rawOutput: string;
}

export const GAP_ANALYSIS_STEP_INPUT_SCHEMA: AnySchemaObject = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  additionalProperties: false,
  properties: {
    componentDescription: {
      minLength: 1,
      type: 'string',
    },
    parsing: {
      additionalProperties: true,
      required: [
        'businessContext',
        'components',
        'constraints',
        'content',
        'interactions',
        'rootComponentCode',
        'specifiedStates',
        'tokenReferences',
      ],
      type: 'object',
    },
  },
  required: ['componentDescription', 'parsing'],
  type: 'object',
};

export const GAP_ANALYSIS_STEP_OUTPUT_SCHEMA: AnySchemaObject = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  additionalProperties: false,
  properties: {
    accessibilityGaps: {
      items: {
        minLength: 1,
        type: 'string',
      },
      type: 'array',
    },
    missingStates: {
      items: {
        minLength: 1,
        type: 'string',
      },
      type: 'array',
    },
    recommendations: {
      items: {
        minLength: 1,
        type: 'string',
      },
      type: 'array',
    },
    responsiveGaps: {
      items: {
        minLength: 1,
        type: 'string',
      },
      type: 'array',
    },
  },
  required: [
    'accessibilityGaps',
    'missingStates',
    'recommendations',
    'responsiveGaps',
  ],
  type: 'object',
};
