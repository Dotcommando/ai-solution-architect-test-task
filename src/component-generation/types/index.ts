import type { AnySchemaObject } from 'ajv';
import { IComponentInterfacesStepOutput } from '../../component-interfaces/types';
import { IE2eTestsStepOutput } from '../../e2e-tests/types';
import { IGapAnalysisStepOutput } from '../../gap-analysis/types';
import { IResolvingGapsStepOutput } from '../../resolving-gaps/types';
import { IStepTokenUsage } from '../../step/types';
import {
  COMPONENT_STATE_POLICY_ARRAY,
  IParsedComponent,
  IParsingStepOutput,
  UI_COMPONENT_TYPE_ARRAY,
} from '../../types';
import {
  IComponentFileReference,
  IUnitTestsStepOutput,
} from '../../unit-tests/types';
import { RUN_USER_FLOW_KIND } from '../../run/constants';
import { IUserFlowsStepOutput } from '../../user-flows/types';

export interface IGeneratedCodeFile {
  content: string;
  filename: string;
}

export interface IComponentGenerationStepInput {
  componentDescription: string;
  e2eTests: IE2eTestsStepOutput | null;
  framework: string;
  gapAnalysis: IGapAnalysisStepOutput;
  parsing: IParsingStepOutput;
  projectRootPath: string;
  relatedComponentInterfaces: IComponentInterfacesStepOutput[];
  relatedComponentSourceFiles: IComponentFileReference[];
  resolvingGaps: IResolvingGapsStepOutput;
  targetComponent: IParsedComponent;
  targetComponentInterface: IComponentInterfacesStepOutput;
  targetSourceFilePath: string;
  targetUnitTests: IUnitTestsStepOutput;
  testFramework: string;
  userFlows: IUserFlowsStepOutput;
}

export interface IComponentGenerationStepOutput {
  componentCode: string;
  componentName: string;
  files: IGeneratedCodeFile[];
  statesCovered: string[];
  tokensUsed: string[];
}

export interface IRunComponentGenerationStepUseCaseRequest {
  componentDescription: string;
  e2eTests: IE2eTestsStepOutput | null;
  framework: string;
  gapAnalysis: IGapAnalysisStepOutput;
  parsing: IParsingStepOutput;
  projectRootPath: string;
  relatedComponentInterfaces: IComponentInterfacesStepOutput[];
  relatedComponentSourceFiles: IComponentFileReference[];
  resolvingGaps: IResolvingGapsStepOutput;
  targetComponent: IParsedComponent;
  targetComponentInterface: IComponentInterfacesStepOutput;
  targetSourceFilePath: string;
  targetUnitTests: IUnitTestsStepOutput;
  testFramework: string;
  userFlows: IUserFlowsStepOutput;
}

export interface IRunComponentGenerationStepUseCaseResponse {
  attempts: number;
  output: IComponentGenerationStepOutput;
  rawOutput: string;
  tokenUsage: IStepTokenUsage;
}

export const COMPONENT_GENERATION_STEP_INPUT_SCHEMA: AnySchemaObject = {
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
    e2eTests: {
      additionalProperties: false,
      properties: {
        coveredBehaviors: {
          items: {
            minLength: 1,
            type: 'string',
          },
          type: 'array',
        },
        coveredComponentCodes: {
          items: {
            minLength: 1,
            type: 'string',
          },
          type: 'array',
        },
        coveredFlowCodes: {
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
        rootComponentCode: {
          minLength: 1,
          type: 'string',
        },
        rootComponentName: {
          minLength: 1,
          type: 'string',
        },
      },
      required: [
        'coveredBehaviors',
        'coveredComponentCodes',
        'coveredFlowCodes',
        'coveredStates',
        'files',
        'rootComponentCode',
        'rootComponentName',
      ],
      type: 'object',
    },
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
    unitTestComponent: {
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
    e2eTests: {
      anyOf: [
        {
          $ref: '#/$defs/e2eTests',
        },
        {
          type: 'null',
        },
      ],
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
    relatedComponentInterfaces: {
      items: {
        $ref: '#/$defs/componentInterface',
      },
      type: 'array',
    },
    relatedComponentSourceFiles: {
      items: {
        $ref: '#/$defs/componentFileReference',
      },
      type: 'array',
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
    targetUnitTests: {
      $ref: '#/$defs/unitTestComponent',
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
    'e2eTests',
    'framework',
    'gapAnalysis',
    'parsing',
    'projectRootPath',
    'relatedComponentInterfaces',
    'relatedComponentSourceFiles',
    'resolvingGaps',
    'targetComponent',
    'targetComponentInterface',
    'targetSourceFilePath',
    'targetUnitTests',
    'testFramework',
    'userFlows',
  ],
  type: 'object',
};

export const COMPONENT_GENERATION_STEP_OUTPUT_SCHEMA: AnySchemaObject = {
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
    files: {
      items: {
        $ref: '#/$defs/generatedFile',
      },
      minItems: 1,
      type: 'array',
    },
    statesCovered: {
      items: {
        minLength: 1,
        type: 'string',
      },
      type: 'array',
    },
    tokensUsed: {
      items: {
        minLength: 1,
        type: 'string',
      },
      type: 'array',
    },
  },
  required: [
    'componentCode',
    'componentName',
    'files',
    'statesCovered',
    'tokensUsed',
  ],
  type: 'object',
};
