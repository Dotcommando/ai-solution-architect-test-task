import type { AnySchemaObject } from 'ajv';
import {
  CANONICAL_STATE_MODEL_SCHEMA,
  ICanonicalStateModel,
} from '../../canonical-state-model/types';
import { IComponentInterfacesStepOutput } from '../../component-interfaces/types';
import {
  DESIGN_SYSTEM_CONTEXT_SCHEMA,
  IDesignSystemContext,
} from '../../design-system/types';
import { IE2eTestsStepOutput } from '../../e2e-tests/types';
import { IGapAnalysisStepOutput } from '../../gap-analysis/types';
import {
  IRunGeneratedCodeArtifact,
  IRunValidationArtifact,
} from '../../run/types';
import { IResolvingGapsStepOutput } from '../../resolving-gaps/types';
import { IStepTokenUsage } from '../../step/types';
import { IParsingStepOutput } from '../../types';
import { IUnitTestsStepOutput } from '../../unit-tests/types';
import { IUserFlowsStepOutput } from '../../user-flows/types';

export interface IValidationDeterministicSummary {
  detectedHallucinations: string[];
  knownTokenCompliance: boolean;
  requiredStates: string[];
  coveredStates: string[];
  missingStates: string[];
  stateCoverage: {
    coveredCount: number;
    label: string;
    totalCount: number;
  };
}

export interface IValidationRegenerationReason {
  componentCode: string;
  reasons: string[];
}

export interface IValidationStepInput {
  canonicalStateModel: ICanonicalStateModel;
  componentDescription: string;
  componentInterfaces: {
    components: IComponentInterfacesStepOutput[];
  };
  designSystemContext: IDesignSystemContext;
  e2eTests: IE2eTestsStepOutput | null;
  generatedCode: IRunGeneratedCodeArtifact;
  gapAnalysis: IGapAnalysisStepOutput;
  parsing: IParsingStepOutput;
  resolvingGaps: IResolvingGapsStepOutput;
  unitTests: {
    components: IUnitTestsStepOutput[];
  };
  userFlows: IUserFlowsStepOutput;
  deterministicSummary: IValidationDeterministicSummary;
}

export interface IValidationStepOutput {
  accessibilityScore: string;
  affectedComponentCodes: string[];
  contractCompatibilityIssues: string[];
  hallucinationsCaught: string[];
  isRegenerationRequired: boolean;
  issuesFound: string[];
  regenerationReasons: IValidationRegenerationReason[];
  stateCoverage: IRunValidationArtifact['stateCoverage'];
  tokenCompliance: boolean;
}

export interface IRunValidationStepUseCaseRequest {
  canonicalStateModel: ICanonicalStateModel;
  componentDescription: string;
  componentInterfaces: {
    components: IComponentInterfacesStepOutput[];
  };
  designSystemContext: IDesignSystemContext;
  e2eTests: IE2eTestsStepOutput | null;
  generatedCode: IRunGeneratedCodeArtifact;
  gapAnalysis: IGapAnalysisStepOutput;
  parsing: IParsingStepOutput;
  resolvingGaps: IResolvingGapsStepOutput;
  unitTests: {
    components: IUnitTestsStepOutput[];
  };
  userFlows: IUserFlowsStepOutput;
}

export interface IRunValidationStepUseCaseResponse {
  attempts: number;
  output: IValidationStepOutput;
  rawOutput: string;
  tokenUsage: IStepTokenUsage;
}

export const VALIDATION_STEP_INPUT_SCHEMA: AnySchemaObject = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  additionalProperties: false,
  properties: {
    canonicalStateModel: CANONICAL_STATE_MODEL_SCHEMA,
    componentDescription: {
      minLength: 1,
      type: 'string',
    },
    componentInterfaces: {
      additionalProperties: false,
      properties: {
        components: {
          minItems: 1,
          type: 'array',
        },
      },
      required: ['components'],
      type: 'object',
    },
    designSystemContext: DESIGN_SYSTEM_CONTEXT_SCHEMA,
    deterministicSummary: {
      additionalProperties: false,
      properties: {
        coveredStates: {
          items: {
            minLength: 1,
            type: 'string',
          },
          type: 'array',
        },
        detectedHallucinations: {
          items: {
            minLength: 1,
            type: 'string',
          },
          type: 'array',
        },
        knownTokenCompliance: {
          type: 'boolean',
        },
        missingStates: {
          items: {
            minLength: 1,
            type: 'string',
          },
          type: 'array',
        },
        requiredStates: {
          items: {
            minLength: 1,
            type: 'string',
          },
          type: 'array',
        },
        stateCoverage: {
          additionalProperties: false,
          properties: {
            coveredCount: {
              minimum: 0,
              type: 'number',
            },
            label: {
              minLength: 1,
              type: 'string',
            },
            totalCount: {
              minimum: 0,
              type: 'number',
            },
          },
          required: ['coveredCount', 'label', 'totalCount'],
          type: 'object',
        },
      },
      required: [
        'coveredStates',
        'detectedHallucinations',
        'knownTokenCompliance',
        'missingStates',
        'requiredStates',
        'stateCoverage',
      ],
      type: 'object',
    },
    e2eTests: {
      anyOf: [
        {
          type: 'object',
        },
        {
          type: 'null',
        },
      ],
    },
    generatedCode: {
      additionalProperties: false,
      properties: {
        components: {
          minItems: 1,
          type: 'array',
        },
        files: {
          minItems: 1,
          type: 'array',
        },
        framework: {
          minLength: 1,
          type: 'string',
        },
        statesCovered: {
          type: 'array',
        },
        tokensUsed: {
          type: 'array',
        },
      },
      required: [
        'components',
        'files',
        'framework',
        'statesCovered',
        'tokensUsed',
      ],
      type: 'object',
    },
    gapAnalysis: {
      additionalProperties: false,
      properties: {
        accessibilityGaps: {
          type: 'array',
        },
        missingStates: {
          type: 'array',
        },
        recommendations: {
          type: 'array',
        },
        responsiveGaps: {
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
          type: 'array',
        },
      },
      required: ['decisions'],
      type: 'object',
    },
    unitTests: {
      additionalProperties: false,
      properties: {
        components: {
          minItems: 1,
          type: 'array',
        },
      },
      required: ['components'],
      type: 'object',
    },
    userFlows: {
      additionalProperties: false,
      properties: {
        flows: {
          minItems: 1,
          type: 'array',
        },
      },
      required: ['flows'],
      type: 'object',
    },
  },
  required: [
    'canonicalStateModel',
    'componentDescription',
    'componentInterfaces',
    'designSystemContext',
    'deterministicSummary',
    'e2eTests',
    'generatedCode',
    'gapAnalysis',
    'parsing',
    'resolvingGaps',
    'unitTests',
    'userFlows',
  ],
  type: 'object',
};

export const VALIDATION_STEP_OUTPUT_SCHEMA: AnySchemaObject = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  additionalProperties: false,
  properties: {
    accessibilityScore: {
      minLength: 1,
      type: 'string',
    },
    affectedComponentCodes: {
      items: {
        minLength: 1,
        type: 'string',
      },
      type: 'array',
    },
    contractCompatibilityIssues: {
      items: {
        minLength: 1,
        type: 'string',
      },
      type: 'array',
    },
    hallucinationsCaught: {
      items: {
        minLength: 1,
        type: 'string',
      },
      type: 'array',
    },
    isRegenerationRequired: {
      type: 'boolean',
    },
    issuesFound: {
      items: {
        minLength: 1,
        type: 'string',
      },
      type: 'array',
    },
    regenerationReasons: {
      items: {
        additionalProperties: false,
        properties: {
          componentCode: {
            minLength: 1,
            type: 'string',
          },
          reasons: {
            items: {
              minLength: 1,
              type: 'string',
            },
            minItems: 1,
            type: 'array',
          },
        },
        required: ['componentCode', 'reasons'],
        type: 'object',
      },
      type: 'array',
    },
    stateCoverage: {
      additionalProperties: false,
      properties: {
        coveredCount: {
          minimum: 0,
          type: 'number',
        },
        label: {
          minLength: 1,
          type: 'string',
        },
        totalCount: {
          minimum: 0,
          type: 'number',
        },
      },
      required: ['coveredCount', 'label', 'totalCount'],
      type: 'object',
    },
    tokenCompliance: {
      type: 'boolean',
    },
  },
  required: [
    'accessibilityScore',
    'affectedComponentCodes',
    'contractCompatibilityIssues',
    'hallucinationsCaught',
    'isRegenerationRequired',
    'issuesFound',
    'regenerationReasons',
    'stateCoverage',
    'tokenCompliance',
  ],
  type: 'object',
};
