import type { AnySchemaObject } from 'ajv';

export interface IDesignSystemContext {
  knownTokens: string[];
  tokenValues: Record<string, string>;
}

export const DESIGN_SYSTEM_CONTEXT_SCHEMA: AnySchemaObject = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  additionalProperties: false,
  properties: {
    knownTokens: {
      items: {
        minLength: 1,
        type: 'string',
      },
      minItems: 1,
      type: 'array',
    },
    tokenValues: {
      additionalProperties: {
        minLength: 1,
        type: 'string',
      },
      minProperties: 1,
      propertyNames: {
        minLength: 1,
      },
      type: 'object',
    },
  },
  required: ['knownTokens', 'tokenValues'],
  type: 'object',
};
