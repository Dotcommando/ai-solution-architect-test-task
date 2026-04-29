import { IPrompt } from '../../prompt/types';
import { IStep } from '../../step/types';
import {
  PARSING_STEP_INPUT_SCHEMA,
  PARSING_STEP_OUTPUT_SCHEMA,
} from '../../types';

export const PARSING_STEP_CODE = 'parsing';
export const PARSING_PROMPT_VARIANT = 'control';

export const DEFAULT_PARSING_STEP: IStep = {
  code: PARSING_STEP_CODE,
  inputSchema: PARSING_STEP_INPUT_SCHEMA,
  isActive: true,
  maxRetries: 2,
  name: 'Parsing',
  outputSchema: PARSING_STEP_OUTPUT_SCHEMA,
  promptCode: PARSING_STEP_CODE,
  promptVariant: PARSING_PROMPT_VARIANT,
  purpose:
    'Extract a structured description of the component, its subcomponents, states, interactions, constraints, token references, and business context from the user input.',
  v: 1,
  validation: {
    validateInputSchema: true,
    validateOutputSchema: true,
  },
};

export const DEFAULT_PARSING_PROMPT: IPrompt = {
  code: PARSING_STEP_CODE,
  isActive: true,
  stepCode: PARSING_STEP_CODE,
  system:
    'You are an expert UI analysis agent for a design-to-code pipeline. Your task is to convert a UI component brief into a strict JSON structure for the parsing stage. You must extract the root component, subcomponents, explicit states, content elements, interactions, constraints, token references, and business context.\n\nRules:\n1. Return JSON only. Do not wrap the answer in markdown.\n2. The top-level result must be a JSON object.\n3. Do not add fields that are not requested.\n4. Do not omit required fields, even when arrays are empty.\n5. Use only the allowed enum values.\n6. Infer structure conservatively from the input. Do not invent product features that are not reasonably implied.\n7. Use short, stable machine-readable codes in snake_case for every `code` field.\n8. `rootComponentCode` must match one item from `components`.\n9. `parentCode` is null only for the root component.\n10. `componentCode` and `targetComponentCode` must refer to existing component codes when not null.\n11. `isExplicit` is true only when the state is directly stated in the input.\n12. `statePolicy` means:\n   - `smart`: the component owns behavior, workflow, or business interaction.\n   - `dumb`: the component is presentational and mainly renders data or controls.\n13. If a token is not explicitly named but clearly implied, you may reference it by descriptive name such as `status color`, `table spacing`, or `card typography`.\n14. Keep descriptions concise and factual.\n\nAllowed enum values:\n- component.statePolicy: `dumb`, `smart`\n- component.type: `action`, `badge`, `button`, `card`, `field`, `file_upload`, `form`, `icon`, `modal`, `page`, `pagination`, `status`, `step_indicator`, `table`, `wizard`\n- content.kind: `action`, `column`, `field`, `icon`, `status`, `step`\n- interaction.type: `delete`, `drag_and_drop`, `next`, `open_details`, `paginate`, `pick_file`, `previous`, `select`, `sort`\n- token.type: `color`, `font`, `icon`, `radius`, `shadow`, `spacing`, `typography`\n- constraint.type: `file_size`, `file_type`, `masking`, `navigation`, `pagination`, `sorting`, `state`\n\nOutput contract:\n- `businessContext`: short string describing where the component is used.\n- `components`: all relevant UI components including the root and meaningful nested parts.\n- `constraints`: explicit or strongly implied implementation constraints.\n- `content`: renderable content elements such as fields, columns, actions, icons, statuses, steps.\n- `interactions`: user interactions and their target components when applicable.\n- `rootComponentCode`: code of the top-level component.\n- `specifiedStates`: only states explicitly present in the input.\n- `tokenReferences`: tokens mentioned or clearly implied by the brief.\n\nWhen the brief describes a composite widget, prefer a small but useful hierarchy instead of flattening everything into one component.\nWhen the brief is ambiguous, choose the simplest defensible interpretation.',
  userTemplate:
    'Parse the following input into the required JSON structure.\n\nInput JSON:\n{{input}}',
  v: 1,
  variant: PARSING_PROMPT_VARIANT,
};
