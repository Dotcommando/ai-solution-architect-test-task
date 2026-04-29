import { IPrompt } from '../../prompt/types';
import { IStep } from '../../step/types';
import {
  RESOLVING_GAPS_STEP_INPUT_SCHEMA,
  RESOLVING_GAPS_STEP_OUTPUT_SCHEMA,
} from '../types';

export const RESOLVING_GAPS_STEP_CODE = 'resolving_gaps';
export const RESOLVING_GAPS_PROMPT_VARIANT = 'control';
export const DEFAULT_RESOLVING_GAPS_SYSTEM_PROMPT = [
  'You are an expert frontend architecture and product specification analyst for a design-to-code pipeline. Your task is to convert identified gaps into explicit implementation decisions that downstream stages can use without reinterpreting ambiguity.',
  '',
  'Rules:',
  '1. Return JSON only. Do not wrap the answer in markdown.',
  '2. The top-level result must be a JSON object.',
  '3. Do not add fields that are not requested.',
  '4. Do not omit required fields, even when arrays are empty.',
  '5. Each decision must resolve a real gap from the input. Do not create speculative work that is not justified by the brief, parsing output, or gap analysis output.',
  '6. `sourceGap` must copy or closely preserve the wording of the gap that triggered the decision.',
  '7. `affectedComponentCodes` must reference component codes that exist in the parsing result. Use an empty array only when no specific component can be cleanly scoped.',
  '8. `code` must be a short, stable snake_case identifier.',
  '9. `decision` must be an explicit implementation decision, not a vague recommendation.',
  '10. `rationale` must explain why the decision resolves the source gap and why it is a conservative choice.',
  '11. Prefer decisions that unblock downstream interface design, tests, and component generation.',
  '12. Do not duplicate equivalent decisions. Merge closely related gaps when one decision resolves them cleanly.',
  '13. Do not mention JSON, schema, prompts, or internal process language in the output.',
  '',
  'Exact top-level shape:',
  '{',
  '  "decisions": [',
  '    {',
  '      "affectedComponentCodes": ["string"],',
  '      "code": "string",',
  '      "decision": "string",',
  '      "rationale": "string",',
  '      "sourceGap": "string"',
  '    }',
  '  ]',
  '}',
  '',
  'Before returning, validate your own answer against this exact structure and required fields.',
].join('\n');

export const DEFAULT_RESOLVING_GAPS_USER_TEMPLATE = [
  'Resolve the identified gaps into implementation decisions.',
  'Use the original brief, the parsing result, and the gap analysis result together.',
  'Before answering, verify that every required field is present and that no extra properties exist.',
  '',
  'Input JSON:',
  '{{input}}',
].join('\n');

export const DEFAULT_RESOLVING_GAPS_STEP: IStep = {
  code: RESOLVING_GAPS_STEP_CODE,
  inputSchema: RESOLVING_GAPS_STEP_INPUT_SCHEMA,
  isActive: true,
  maxRetries: 2,
  name: 'Resolving Gaps',
  outputSchema: RESOLVING_GAPS_STEP_OUTPUT_SCHEMA,
  promptCode: RESOLVING_GAPS_STEP_CODE,
  promptVariant: RESOLVING_GAPS_PROMPT_VARIANT,
  purpose:
    'Convert gap analysis findings into explicit implementation decisions that downstream stages can use without reinterpreting ambiguous gaps.',
  v: 1,
  validation: {
    validateInputSchema: true,
    validateOutputSchema: true,
  },
};

export const DEFAULT_RESOLVING_GAPS_PROMPT: IPrompt = {
  code: RESOLVING_GAPS_STEP_CODE,
  isActive: true,
  stepCode: RESOLVING_GAPS_STEP_CODE,
  system: DEFAULT_RESOLVING_GAPS_SYSTEM_PROMPT,
  userTemplate: DEFAULT_RESOLVING_GAPS_USER_TEMPLATE,
  v: 1,
  variant: RESOLVING_GAPS_PROMPT_VARIANT,
};
