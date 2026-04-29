import type { AnySchemaObject } from 'ajv';
import { IComponentInterfacesStepOutput } from '../../component-interfaces/types';
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

export interface IComponentFileReference {
  componentCode: string;
  filename: string;
}

export interface IGeneratedUnitTestFile {
  content: string;
  filename: string;
}

export interface IUnitTestsStepInput {
  componentDescription: string;
  componentInterfaces: {
    components: IComponentInterfacesStepOutput[];
  };
  componentSourceFiles: IComponentFileReference[];
  framework: string;
  gapAnalysis: IGapAnalysisStepOutput;
  parsing: IParsingStepOutput;
  projectRootPath: string;
  resolvingGaps: IResolvingGapsStepOutput;
  targetComponent: IParsedComponent;
  targetComponentInterface: IComponentInterfacesStepOutput;
  targetSourceFilePath: string;
  targetTestFilePath: string;
  testFramework: string;
  userFlows: IUserFlowsStepOutput;
}

export interface IUnitTestsStepOutput {
  componentCode: string;
  componentName: string;
  coveredBehaviors: string[];
  coveredStates: string[];
  files: IGeneratedUnitTestFile[];
}

export interface IRunUnitTestsStepUseCaseRequest {
  componentDescription: string;
  componentInterfaces: {
    components: IComponentInterfacesStepOutput[];
  };
  componentSourceFiles: IComponentFileReference[];
  framework: string;
  gapAnalysis: IGapAnalysisStepOutput;
  parsing: IParsingStepOutput;
  projectRootPath: string;
  resolvingGaps: IResolvingGapsStepOutput;
  targetComponent: IParsedComponent;
  targetComponentInterface: IComponentInterfacesStepOutput;
  targetSourceFilePath: string;
  targetTestFilePath: string;
  testFramework: string;
  userFlows: IUserFlowsStepOutput;
}

export interface IRunUnitTestsStepUseCaseResponse {
  attempts: number;
  output: IUnitTestsStepOutput;
  rawOutput: string;
}

export const UNIT_TESTS_STEP_INPUT_SCHEMA: AnySchemaObject = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $defs: {
    componentFileReference: {
      additionalProperties: false,
      properties: {
        componentCode: {
          minLength: 1,
          type: 'string',
        },
        filename: {
          minLength: 1,
          type: 'string',
        },
      },
      required: ['componentCode', 'filename'],
      type: 'object',
    },
    componentInterface: {
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
    },
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
    componentDescription: {
      minLength: 1,
      type: 'string',
    },
    componentInterfaces: {
      additionalProperties: false,
      properties: {
        components: {
          items: {
            $ref: '#/$defs/componentInterface',
          },
          minItems: 1,
          type: 'array',
        },
      },
      required: ['components'],
      type: 'object',
    },
    componentSourceFiles: {
      items: {
        $ref: '#/$defs/componentFileReference',
      },
      minItems: 1,
      type: 'array',
    },
    framework: {
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
    projectRootPath: {
      minLength: 1,
      type: 'string',
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
      required: [
        'code',
        'name',
        'parentCode',
        'purpose',
        'statePolicy',
        'type',
      ],
      type: 'object',
    },
    targetComponentInterface: {
      $ref: '#/$defs/componentInterface',
    },
    targetSourceFilePath: {
      minLength: 1,
      type: 'string',
    },
    targetTestFilePath: {
      minLength: 1,
      type: 'string',
    },
    testFramework: {
      minLength: 1,
      type: 'string',
    },
    userFlows: {
      additionalProperties: false,
      properties: {
        flows: {
          items: {
            $ref: '#/$defs/userFlow',
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
    'componentInterfaces',
    'componentSourceFiles',
    'framework',
    'gapAnalysis',
    'parsing',
    'projectRootPath',
    'resolvingGaps',
    'targetComponent',
    'targetComponentInterface',
    'targetSourceFilePath',
    'targetTestFilePath',
    'testFramework',
    'userFlows',
  ],
  type: 'object',
};

export const UNIT_TESTS_STEP_OUTPUT_SCHEMA: AnySchemaObject = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $defs: {
    generatedFile: {
      additionalProperties: false,
      properties: {
        content: {
          minLength: 1,
          type: 'string',
        },
        filename: {
          minLength: 1,
          type: 'string',
        },
      },
      required: ['filename', 'content'],
      type: 'object',
    },
  },
  additionalProperties: false,
  properties: {
    componentCode: {
      minLength: 1,
      type: 'string',
    },
    componentName: {
      minLength: 1,
      type: 'string',
    },
    coveredBehaviors: {
      items: {
        minLength: 1,
        type: 'string',
      },
      type: 'array',
    },
    coveredStates: {
      items: {
        minLength: 1,
        type: 'string',
      },
      type: 'array',
    },
    files: {
      items: {
        $ref: '#/$defs/generatedFile',
      },
      minItems: 1,
      type: 'array',
    },
  },
  required: [
    'componentCode',
    'componentName',
    'coveredBehaviors',
    'coveredStates',
    'files',
  ],
  type: 'object',
};
