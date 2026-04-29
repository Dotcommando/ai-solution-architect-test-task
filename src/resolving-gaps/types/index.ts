import type { AnySchemaObject } from 'ajv';
import { IGapAnalysisStepOutput } from '../../gap-analysis/types';
import { IStepTokenUsage } from '../../step/types';
import { IParsingStepOutput } from '../../types';

export interface IResolvedGapDecisionArtifact {
  affectedComponentCodes: string[];
  code: string;
  decision: string;
  rationale: string;
  sourceGap: string;
}

export interface IResolvingGapsStepInput {
  componentDescription: string;
  gapAnalysis: IGapAnalysisStepOutput;
  parsing: IParsingStepOutput;
}

export interface IResolvingGapsStepOutput {
  decisions: IResolvedGapDecisionArtifact[];
}

export interface IRunResolvingGapsStepUseCaseRequest {
  componentDescription: string;
  gapAnalysis: IGapAnalysisStepOutput;
  parsing: IParsingStepOutput;
}

export interface IRunResolvingGapsStepUseCaseResponse {
  attempts: number;
  output: IResolvingGapsStepOutput;
  rawOutput: string;
  tokenUsage: IStepTokenUsage;
}

export const RESOLVING_GAPS_STEP_INPUT_SCHEMA: AnySchemaObject = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  additionalProperties: false,
  properties: {
    componentDescription: {
      minLength: 1,
      type: 'string',
    },
    gapAnalysis: {
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
  required: ['componentDescription', 'gapAnalysis', 'parsing'],
  type: 'object',
};

export const RESOLVING_GAPS_STEP_OUTPUT_SCHEMA: AnySchemaObject = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $defs: {
    resolvedGapDecision: {
      additionalProperties: false,
      properties: {
        affectedComponentCodes: {
          items: {
            minLength: 1,
            type: 'string',
          },
          type: 'array',
        },
        code: {
          minLength: 1,
          type: 'string',
        },
        decision: {
          minLength: 1,
          type: 'string',
        },
        rationale: {
          minLength: 1,
          type: 'string',
        },
        sourceGap: {
          minLength: 1,
          type: 'string',
        },
      },
      required: [
        'affectedComponentCodes',
        'code',
        'decision',
        'rationale',
        'sourceGap',
      ],
      type: 'object',
    },
  },
  additionalProperties: false,
  properties: {
    decisions: {
      items: {
        $ref: '#/$defs/resolvedGapDecision',
      },
      type: 'array',
    },
  },
  required: ['decisions'],
  type: 'object',
};
