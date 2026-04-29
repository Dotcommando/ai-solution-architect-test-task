import type { AnySchemaObject } from 'ajv';

export enum CANONICAL_STATE_CODE {
  ACTIVE = 'active',
  CONFIRMING = 'confirming',
  DEFAULT = 'default',
  DISABLED = 'disabled',
  EMPTY = 'empty',
  ERROR = 'error',
  EXPIRED = 'expired',
  FAILED = 'failed',
  FOCUS_VISIBLE = 'focus_visible',
  HOVER = 'hover',
  INVALID = 'invalid',
  LOADING = 'loading',
  SELECTED = 'selected',
  SUCCESS = 'success',
  UNKNOWN = 'unknown',
}

export enum CANONICAL_STATE_SEVERITY {
  HARD = 'hard',
  SOFT = 'soft',
}

export interface ICanonicalStateDefinition {
  code: CANONICAL_STATE_CODE;
  coveredAliases: string[];
  description: string;
  requiredAliases: string[];
  severity: CANONICAL_STATE_SEVERITY;
}

export interface ICanonicalStateModel {
  states: ICanonicalStateDefinition[];
}

export const CANONICAL_STATE_MODEL_SCHEMA: AnySchemaObject = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  additionalProperties: false,
  properties: {
    states: {
      items: {
        additionalProperties: false,
        properties: {
          code: {
            enum: Object.values(CANONICAL_STATE_CODE),
            type: 'string',
          },
          coveredAliases: {
            items: {
              minLength: 1,
              type: 'string',
            },
            minItems: 1,
            type: 'array',
          },
          description: {
            minLength: 1,
            type: 'string',
          },
          requiredAliases: {
            items: {
              minLength: 1,
              type: 'string',
            },
            minItems: 1,
            type: 'array',
          },
          severity: {
            enum: Object.values(CANONICAL_STATE_SEVERITY),
            type: 'string',
          },
        },
        required: [
          'code',
          'coveredAliases',
          'description',
          'requiredAliases',
          'severity',
        ],
        type: 'object',
      },
      minItems: 1,
      type: 'array',
    },
  },
  required: ['states'],
  type: 'object',
};
