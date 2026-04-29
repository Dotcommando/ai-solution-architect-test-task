import type { AnySchemaObject } from 'ajv';

export enum COMPONENT_STATE_POLICY {
  DUMB = 'dumb',
  SMART = 'smart',
}

export enum UI_COMPONENT_TYPE {
  ACTION = 'action',
  BADGE = 'badge',
  BUTTON = 'button',
  CARD = 'card',
  FIELD = 'field',
  FILE_UPLOAD = 'file_upload',
  FORM = 'form',
  ICON = 'icon',
  MODAL = 'modal',
  PAGE = 'page',
  PAGINATION = 'pagination',
  STATUS = 'status',
  STEP_INDICATOR = 'step_indicator',
  TABLE = 'table',
  WIZARD = 'wizard',
}

export enum COMPONENT_CONTENT_KIND {
  ACTION = 'action',
  COLUMN = 'column',
  FIELD = 'field',
  ICON = 'icon',
  STATUS = 'status',
  STEP = 'step',
}

export enum COMPONENT_INTERACTION_TYPE {
  DELETE = 'delete',
  DRAG_AND_DROP = 'drag_and_drop',
  NEXT = 'next',
  OPEN_DETAILS = 'open_details',
  PAGINATE = 'paginate',
  PICK_FILE = 'pick_file',
  PREVIOUS = 'previous',
  SELECT = 'select',
  SORT = 'sort',
}

export enum DESIGN_TOKEN_TYPE {
  COLOR = 'color',
  FONT = 'font',
  ICON = 'icon',
  RADIUS = 'radius',
  SHADOW = 'shadow',
  SPACING = 'spacing',
  TYPOGRAPHY = 'typography',
}

export enum CONSTRAINT_TYPE {
  FILE_SIZE = 'file_size',
  FILE_TYPE = 'file_type',
  MASKING = 'masking',
  NAVIGATION = 'navigation',
  PAGINATION = 'pagination',
  SORTING = 'sorting',
  STATE = 'state',
}

export interface IParsingStepInput {
  componentDescription: string;
  figmaUrl: string | null;
  screenshotUrl: string | null;
}

export interface IParsedComponent {
  code: string;
  name: string;
  parentCode: string | null;
  purpose: string;
  statePolicy: COMPONENT_STATE_POLICY;
  type: UI_COMPONENT_TYPE;
}

export interface IParsedComponentState {
  code: string;
  componentCode: string;
  description: string;
  isExplicit: boolean;
  name: string;
}

export interface IParsedComponentContent {
  code: string;
  componentCode: string;
  description: string;
  kind: COMPONENT_CONTENT_KIND;
  name: string;
  isRequired: boolean;
}

export interface IParsedComponentInteraction {
  code: string;
  componentCode: string;
  description: string;
  targetComponentCode: string | null;
  type: COMPONENT_INTERACTION_TYPE;
}

export interface IParsedTokenReference {
  componentCode: string | null;
  description: string;
  name: string;
  type: DESIGN_TOKEN_TYPE;
}

export interface IParsedConstraint {
  componentCode: string | null;
  description: string;
  type: CONSTRAINT_TYPE;
}

export interface IParsingStepOutput {
  businessContext: string;
  components: IParsedComponent[];
  constraints: IParsedConstraint[];
  content: IParsedComponentContent[];
  interactions: IParsedComponentInteraction[];
  rootComponentCode: string;
  specifiedStates: IParsedComponentState[];
  tokenReferences: IParsedTokenReference[];
}

export const COMPONENT_STATE_POLICY_ARRAY = Object.values(
  COMPONENT_STATE_POLICY,
);

export const UI_COMPONENT_TYPE_ARRAY = Object.values(UI_COMPONENT_TYPE);

export const COMPONENT_CONTENT_KIND_ARRAY = Object.values(
  COMPONENT_CONTENT_KIND,
);

export const COMPONENT_INTERACTION_TYPE_ARRAY = Object.values(
  COMPONENT_INTERACTION_TYPE,
);

export const DESIGN_TOKEN_TYPE_ARRAY = Object.values(DESIGN_TOKEN_TYPE);

export const CONSTRAINT_TYPE_ARRAY = Object.values(CONSTRAINT_TYPE);

export const PARSING_STEP_INPUT_SCHEMA: AnySchemaObject = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  additionalProperties: false,
  properties: {
    componentDescription: {
      minLength: 1,
      type: 'string',
    },
    figmaUrl: {
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
    screenshotUrl: {
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
  required: ['componentDescription', 'figmaUrl', 'screenshotUrl'],
  type: 'object',
};

export const PARSING_STEP_OUTPUT_SCHEMA: AnySchemaObject = {
  $defs: {
    parsedComponent: {
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
    parsedConstraint: {
      additionalProperties: false,
      properties: {
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
        description: {
          minLength: 1,
          type: 'string',
        },
        type: {
          enum: CONSTRAINT_TYPE_ARRAY,
        },
      },
      required: ['componentCode', 'description', 'type'],
      type: 'object',
    },
    parsedContent: {
      additionalProperties: false,
      properties: {
        code: {
          minLength: 1,
          type: 'string',
        },
        componentCode: {
          minLength: 1,
          type: 'string',
        },
        description: {
          minLength: 1,
          type: 'string',
        },
        isRequired: {
          type: 'boolean',
        },
        kind: {
          enum: COMPONENT_CONTENT_KIND_ARRAY,
        },
        name: {
          minLength: 1,
          type: 'string',
        },
      },
      required: [
        'code',
        'componentCode',
        'description',
        'isRequired',
        'kind',
        'name',
      ],
      type: 'object',
    },
    parsedInteraction: {
      additionalProperties: false,
      properties: {
        code: {
          minLength: 1,
          type: 'string',
        },
        componentCode: {
          minLength: 1,
          type: 'string',
        },
        description: {
          minLength: 1,
          type: 'string',
        },
        targetComponentCode: {
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
        type: {
          enum: COMPONENT_INTERACTION_TYPE_ARRAY,
        },
      },
      required: [
        'code',
        'componentCode',
        'description',
        'targetComponentCode',
        'type',
      ],
      type: 'object',
    },
    parsedState: {
      additionalProperties: false,
      properties: {
        code: {
          minLength: 1,
          type: 'string',
        },
        componentCode: {
          minLength: 1,
          type: 'string',
        },
        description: {
          minLength: 1,
          type: 'string',
        },
        isExplicit: {
          type: 'boolean',
        },
        name: {
          minLength: 1,
          type: 'string',
        },
      },
      required: ['code', 'componentCode', 'description', 'isExplicit', 'name'],
      type: 'object',
    },
    parsedTokenReference: {
      additionalProperties: false,
      properties: {
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
        description: {
          minLength: 1,
          type: 'string',
        },
        name: {
          minLength: 1,
          type: 'string',
        },
        type: {
          enum: DESIGN_TOKEN_TYPE_ARRAY,
        },
      },
      required: ['componentCode', 'description', 'name', 'type'],
      type: 'object',
    },
  },
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  additionalProperties: false,
  properties: {
    businessContext: {
      minLength: 1,
      type: 'string',
    },
    components: {
      items: {
        $ref: '#/$defs/parsedComponent',
      },
      minItems: 1,
      type: 'array',
    },
    constraints: {
      items: {
        $ref: '#/$defs/parsedConstraint',
      },
      type: 'array',
    },
    content: {
      items: {
        $ref: '#/$defs/parsedContent',
      },
      type: 'array',
    },
    interactions: {
      items: {
        $ref: '#/$defs/parsedInteraction',
      },
      type: 'array',
    },
    rootComponentCode: {
      minLength: 1,
      type: 'string',
    },
    specifiedStates: {
      items: {
        $ref: '#/$defs/parsedState',
      },
      type: 'array',
    },
    tokenReferences: {
      items: {
        $ref: '#/$defs/parsedTokenReference',
      },
      type: 'array',
    },
  },
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
};
