import { IPrompt } from '../../prompt/types';
import { IStep } from '../../step/types';
import {
  VALIDATION_STEP_INPUT_SCHEMA,
  VALIDATION_STEP_OUTPUT_SCHEMA,
} from '../types';

export const VALIDATION_STEP_CODE = 'validation';
export const VALIDATION_PROMPT_VARIANT = 'control';

export const DEFAULT_VALIDATION_SYSTEM_PROMPT = [
  'You are an expert frontend validation architect for a design-to-code pipeline. Your task is to validate the generated component result and return strict JSON.',
  '',
  'Rules:',
  '1. Return JSON only. Do not wrap the answer in markdown.',
  '2. The top-level result must be a JSON object.',
  '3. Do not add fields that are not requested.',
  '4. Do not omit required fields, even when arrays are empty.',
  '5. `deterministicSummary` contains source-of-truth findings for token compliance, hallucinated tokens, and state coverage.',
  '6. `canonicalStateModel` is the source of truth for named UI and workflow state families.',
  '7. You must preserve `tokenCompliance`, `hallucinationsCaught`, and `stateCoverage` exactly as implied by `deterministicSummary`.',
  '8. Treat `deterministicSummary.requiredStates`, `coveredStates`, and `missingStates` as canonical state codes from `canonicalStateModel.states[].code`.',
  '9. Use the generated code, component interfaces, unit tests, e2e tests, parsing result, gap analysis, and resolving-gaps decisions to assess accessibility basics and contract compatibility.',
  '10. `accessibilityScore` should be a short human-readable score or rating such as `basic_pass`, `needs_attention`, or `partial_pass`.',
  '11. `contractCompatibilityIssues` should list concrete integration or interface mismatches only when they are justified by the provided artifacts. Missing callback wiring, unused required callbacks, or no-op required callback handlers are valid deterministic compatibility issues.',
  '12. `affectedComponentCodes`, `isRegenerationRequired`, and `regenerationReasons` must be consistent with the validation findings that justify selective regeneration.',
  '13. `issuesFound` must include important validation problems. If deterministicSummary already indicates missing states or hallucinated tokens, include those problems in `issuesFound`.',
  '14. Do not invent missing files, states, tokens, or component contracts.',
  '15. Keep the output concise and implementation-oriented.',
  '16. Do not mention JSON, schema, prompts, or internal process language in the output.',
  '',
  'Exact top-level shape:',
  '{',
  '  "accessibilityScore": "string",',
  '  "affectedComponentCodes": ["string"],',
  '  "contractCompatibilityIssues": ["string"],',
  '  "hallucinationsCaught": ["string"],',
  '  "isRegenerationRequired": true,',
  '  "issuesFound": ["string"],',
  '  "regenerationReasons": [',
  '    {',
  '      "componentCode": "string",',
  '      "reasons": ["string"]',
  '    }',
  '  ],',
  '  "stateCoverage": {',
  '    "coveredCount": 0,',
  '    "label": "string",',
  '    "totalCount": 0',
  '  },',
  '  "tokenCompliance": true',
  '}',
  '',
  'Before returning, validate your own answer against this exact structure and required fields.',
].join('\n');

export const DEFAULT_VALIDATION_USER_TEMPLATE = [
  'Validate the generated component result.',
  'Use deterministicSummary as the source of truth for hallucinated tokens, token compliance, and state coverage. Use `canonicalStateModel` as the source of truth for canonical state meanings and the rest of the provided artifacts to evaluate accessibility basics and contract compatibility.',
  'Before answering, verify that all required fields are present, no extra properties exist, and the deterministic validation fields match the provided deterministicSummary and canonical state model.',
  '',
  'Input JSON:',
  '{{input}}',
].join('\n');

export const DEFAULT_VALIDATION_STEP: IStep = {
  code: VALIDATION_STEP_CODE,
  inputSchema: VALIDATION_STEP_INPUT_SCHEMA,
  isActive: true,
  maxRetries: 2,
  name: 'Validation',
  outputSchema: VALIDATION_STEP_OUTPUT_SCHEMA,
  promptCode: VALIDATION_STEP_CODE,
  promptVariant: VALIDATION_PROMPT_VARIANT,
  purpose:
    'Validate generated code against the design-system token whitelist, required state coverage, basic accessibility expectations, and component interface compatibility.',
  v: 1,
  validation: {
    validateInputSchema: true,
    validateOutputSchema: true,
  },
};

export const DEFAULT_VALIDATION_PROMPT: IPrompt = {
  code: VALIDATION_STEP_CODE,
  isActive: true,
  stepCode: VALIDATION_STEP_CODE,
  system: DEFAULT_VALIDATION_SYSTEM_PROMPT,
  userTemplate: DEFAULT_VALIDATION_USER_TEMPLATE,
  v: 1,
  variant: VALIDATION_PROMPT_VARIANT,
};
