import type { AnySchemaObject } from 'ajv';
import { IGapAnalysisStepOutput } from '../../gap-analysis/types';
import { IResolvingGapsStepOutput } from '../../resolving-gaps/types';
import {
  COMPONENT_STATE_POLICY_ARRAY,
  IParsedComponent,
  IParsingStepOutput,
  UI_COMPONENT_TYPE_ARRAY,
} from '../../types';
import { RUN_USER_FLOW_KIND } from '../../run/constants';
import { IUserFlowsStepOutput } from '../../user-flows/types';

export interface IComponentInterfaceField {
  description: string;
  name: string;
  required: boolean;
  type: string;
}

export interface IComponentInterfacesStepInput {
  componentDescription: string;
  gapAnalysis: IGapAnalysisStepOutput;
  parsing: IParsingStepOutput;
  resolvingGaps: IResolvingGapsStepOutput;
  targetComponent: IParsedComponent;
  userFlows: IUserFlowsStepOutput;
}

export interface IComponentInterfacesStepOutput {
  accepts: IComponentInterfaceField[];
  componentCode: string;
  componentName: string;
  returns: IComponentInterfaceField[];
}

export interface IRunComponentInterfacesStepUseCaseRequest {
  componentDescription: string;
  gapAnalysis: IGapAnalysisStepOutput;
  parsing: IParsingStepOutput;
  resolvingGaps: IResolvingGapsStepOutput;
  targetComponent: IParsedComponent;
  userFlows: IUserFlowsStepOutput;
}

export interface IRunComponentInterfacesStepUseCaseResponse {
  attempts: number;
  output: IComponentInterfacesStepOutput;
  rawOutput: string;
}

export const COMPONENT_INTERFACES_STEP_INPUT_SCHEMA: AnySchemaObject = {
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
    targetComponent: {
      additionalProperties: false,
      properties: {
        code: {
          minLength: 1,
          type: 'string',
        },
        name: {
          minLength: 1,
          type: 'string',
        },
        parentCode: {
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
        purpose: {
          minLength: 1,
          type: 'string',
        },
        statePolicy: {
          enum: COMPONENT_STATE_POLICY_ARRAY,
        },
        type: {
          enum: UI_COMPONENT_TYPE_ARRAY,
        },
      },
      required: ['code', 'name', 'parentCode', 'purpose', 'statePolicy', 'type'],
      type: 'object',
    },
    userFlows: {
      additionalProperties: false,
      properties: {
        flows: {
          items: {
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
                minItems: 1,
                type: 'array',
              },
            },
            required: ['code', 'completionCriteria', 'kind', 'name', 'steps'],
            type: 'object',
          },
          minItems: 1,
          type: 'array',
        },
      },
      required: ['flows'],
      type: 'object',
    },
  },
  required: [
    'componentDescription',
    'gapAnalysis',
    'parsing',
    'resolvingGaps',
    'targetComponent',
    'userFlows',
  ],
  type: 'object',
};

export const COMPONENT_INTERFACES_STEP_OUTPUT_SCHEMA: AnySchemaObject = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $defs: {
    componentInterfaceField: {
      additionalProperties: false,
      properties: {
        description: {
          minLength: 1,
          type: 'string',
        },
        name: {
          minLength: 1,
          type: 'string',
        },
        required: {
          type: 'boolean',
        },
        type: {
          minLength: 1,
          type: 'string',
        },
      },
      required: ['description', 'name', 'required', 'type'],
      type: 'object',
    },
  },
  additionalProperties: false,
  properties: {
    accepts: {
      items: {
        $ref: '#/$defs/componentInterfaceField',
      },
      type: 'array',
    },
    componentCode: {
      minLength: 1,
      type: 'string',
    },
    componentName: {
      minLength: 1,
      type: 'string',
    },
    returns: {
      items: {
        $ref: '#/$defs/componentInterfaceField',
      },
      type: 'array',
    },
  },
  required: ['accepts', 'componentCode', 'componentName', 'returns'],
  type: 'object',
};
