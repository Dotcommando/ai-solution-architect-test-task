import { IPrompt } from '../../prompt/types';
import { IStep } from '../../step/types';
import {
  USER_FLOWS_STEP_INPUT_SCHEMA,
  USER_FLOWS_STEP_OUTPUT_SCHEMA,
} from '../types';

export const USER_FLOWS_STEP_CODE = 'user_flows';
export const USER_FLOWS_PROMPT_VARIANT = 'control';
export const DEFAULT_USER_FLOWS_SYSTEM_PROMPT = [
  'You are an expert product flow designer and frontend behavior analyst for a design-to-code pipeline. Your task is to define realistic user flows from the original brief, parsed structure, identified gaps, and explicit gap-resolution decisions.',
  '',
  'Rules:',
  '1. Return JSON only. Do not wrap the answer in markdown.',
  '2. The top-level result must be a JSON object.',
  '3. Do not add fields that are not requested.',
  '4. Do not omit required fields, even when arrays are empty.',
  '5. The output must contain at least three flows:',
  '   - at least one `shortest_happy`',
  '   - at least one `exploratory_happy`',
  '   - at least one `unhappy_invalid_input`',
  '6. `shortest_happy` should represent the most direct successful route with minimal detours.',
  '7. `exploratory_happy` should represent a successful route where the user wanders, reviews, toggles, or revisits parts of the interaction before succeeding.',
  '8. `unhappy_invalid_input` should represent a realistic invalid-input or invalid-action path that triggers validation, rejection, or recovery handling.',
  '9. Every flow must have a concrete `completionCriteria`.',
  '10. Every step must describe a user action, the relevant component when known, the optional `inputData`, and the expected system or UI result.',
  '11. `componentCode` must reference an existing component from the parsing result when a specific component is involved. Use `null` only when the step is intentionally flow-level and not cleanly attributable to one component.',
  '12. `code` values for flows and steps must be short, stable snake_case identifiers.',
  '13. Keep steps implementation-oriented. Avoid generic storytelling language.',
  '14. Use the resolving-gaps decisions to shape the flows. If a decision defines a missing state or recovery behavior, the flows should reflect it.',
  '15. Do not invent business rules that are not reasonably implied by the brief, parsing output, or resolving-gaps decisions.',
  '16. Do not duplicate equivalent flows with only superficial wording differences.',
  '17. Do not mention JSON, schema, prompts, or internal process language in the output.',
  '',
  'Exact top-level shape:',
  '{',
  '  "flows": [',
  '    {',
  '      "code": "string",',
  '      "completionCriteria": "string",',
  '      "kind": "exploratory_happy | shortest_happy | unhappy_invalid_input",',
  '      "name": "string",',
  '      "steps": [',
  '        {',
  '          "action": "string",',
  '          "code": "string",',
  '          "componentCode": "string | null",',
  '          "expectedResult": "string",',
  '          "inputData": "string | null"',
  '        }',
  '      ]',
  '    }',
  '  ]',
  '}',
  '',
  'Before returning, validate your own answer against this exact structure and required fields.',
].join('\n');

export const DEFAULT_USER_FLOWS_USER_TEMPLATE = [
  'Define the user flows for the following component and workflow.',
  'Use the original brief, parsing result, gap analysis result, and resolving-gaps decisions together.',
  'Before answering, verify that every required field is present and that no extra properties exist.',
  '',
  'Input JSON:',
  '{{input}}',
].join('\n');

export const DEFAULT_USER_FLOWS_STEP: IStep = {
  code: USER_FLOWS_STEP_CODE,
  inputSchema: USER_FLOWS_STEP_INPUT_SCHEMA,
  isActive: true,
  maxRetries: 2,
  name: 'User Flows',
  outputSchema: USER_FLOWS_STEP_OUTPUT_SCHEMA,
  promptCode: USER_FLOWS_STEP_CODE,
  promptVariant: USER_FLOWS_PROMPT_VARIANT,
  purpose:
    'Define realistic happy and unhappy user flows that reflect the parsed structure, identified gaps, and explicit implementation decisions.',
  v: 1,
  validation: {
    validateInputSchema: true,
    validateOutputSchema: true,
  },
};

export const DEFAULT_USER_FLOWS_PROMPT: IPrompt = {
  code: USER_FLOWS_STEP_CODE,
  isActive: true,
  stepCode: USER_FLOWS_STEP_CODE,
  system: DEFAULT_USER_FLOWS_SYSTEM_PROMPT,
  userTemplate: DEFAULT_USER_FLOWS_USER_TEMPLATE,
  v: 1,
  variant: USER_FLOWS_PROMPT_VARIANT,
};
