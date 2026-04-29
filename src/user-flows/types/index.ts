import type { AnySchemaObject } from 'ajv';
import { IGapAnalysisStepOutput } from '../../gap-analysis/types';
import { RUN_USER_FLOW_KIND } from '../../run/constants';
import { IParsingStepOutput } from '../../types';
import { IResolvingGapsStepOutput } from '../../resolving-gaps/types';

export interface IUserFlowStepArtifact {
  action: string;
  code: string;
  componentCode: string | null;
  expectedResult: string;
  inputData: string | null;
}

export interface IUserFlowArtifact {
  code: string;
  completionCriteria: string;
  kind: RUN_USER_FLOW_KIND;
  name: string;
  steps: IUserFlowStepArtifact[];
}

export interface IUserFlowsStepInput {
  componentDescription: string;
  gapAnalysis: IGapAnalysisStepOutput;
  parsing: IParsingStepOutput;
  resolvingGaps: IResolvingGapsStepOutput;
}

export interface IUserFlowsStepOutput {
  flows: IUserFlowArtifact[];
}

export interface IRunUserFlowsStepUseCaseRequest {
  componentDescription: string;
  gapAnalysis: IGapAnalysisStepOutput;
  parsing: IParsingStepOutput;
  resolvingGaps: IResolvingGapsStepOutput;
}

export interface IRunUserFlowsStepUseCaseResponse {
  attempts: number;
  output: IUserFlowsStepOutput;
  rawOutput: string;
}

export const USER_FLOWS_STEP_INPUT_SCHEMA: AnySchemaObject = {
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
    resolvingGaps: {
      additionalProperties: false,
      properties: {
        decisions: {
          items: {
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
          type: 'array',
        },
      },
      required: ['decisions'],
      type: 'object',
    },
  },
  required: ['componentDescription', 'gapAnalysis', 'parsing', 'resolvingGaps'],
  type: 'object',
};

export const USER_FLOWS_STEP_OUTPUT_SCHEMA: AnySchemaObject = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $defs: {
    userFlow: {
      additionalProperties: false,
      properties: {
        code: {
          minLength: 1,
          type: 'string',
        },
        completionCriteria: {
          minLength: 1,
          type: 'string',
        },
        kind: {
          enum: Object.values(RUN_USER_FLOW_KIND),
        },
        name: {
          minLength: 1,
          type: 'string',
        },
        steps: {
          items: {
            $ref: '#/$defs/userFlowStep',
          },
          minItems: 1,
          type: 'array',
        },
      },
      required: ['code', 'completionCriteria', 'kind', 'name', 'steps'],
      type: 'object',
    },
    userFlowStep: {
      additionalProperties: false,
      properties: {
        action: {
          minLength: 1,
          type: 'string',
        },
        code: {
          minLength: 1,
          type: 'string',
        },
        componentCode: {
          anyOf: [
            {
              minLength: 1,
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
        },
        expectedResult: {
          minLength: 1,
          type: 'string',
        },
        inputData: {
          anyOf: [
            {
              minLength: 1,
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
        },
      },
      required: [
        'action',
        'code',
        'componentCode',
        'expectedResult',
        'inputData',
      ],
      type: 'object',
    },
  },
  additionalProperties: false,
  properties: {
    flows: {
      items: {
        $ref: '#/$defs/userFlow',
      },
      minItems: 3,
      type: 'array',
    },
  },
  required: ['flows'],
  type: 'object',
};
