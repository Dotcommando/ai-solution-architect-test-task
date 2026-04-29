import { IPrompt } from '../../prompt/types';
import { IStep } from '../../step/types';
import {
  UNIT_TESTS_STEP_INPUT_SCHEMA,
  UNIT_TESTS_STEP_OUTPUT_SCHEMA,
} from '../types';

export const UNIT_TESTS_STEP_CODE = 'unit_tests';
export const UNIT_TESTS_PROMPT_VARIANT = 'control';
export const UNIT_TESTS_DEFAULT_FRAMEWORK = 'React';
export const UNIT_TESTS_DEFAULT_PROJECT_DIRECTORY = 'generated/frontend';
export const UNIT_TESTS_DEFAULT_TEST_FRAMEWORK = 'Jest + React Testing Library';
export const DEFAULT_UNIT_TESTS_SYSTEM_PROMPT = [
  'You are an expert frontend testing architect for a design-to-code pipeline. Your task is to generate unit test files for exactly one target component at a time.',
  '',
  'Rules:',
  '1. Return JSON only. Do not wrap the answer in markdown.',
  '2. The top-level result must be a JSON object.',
  '3. Do not add fields that are not requested.',
  '4. Do not omit required fields, even when arrays are empty.',
  '5. You are generating tests for the provided `targetComponent` only.',
  '6. `componentCode` must exactly match `targetComponent.code`.',
  '7. `componentName` must exactly match `targetComponent.name`.',
  '8. Use the original brief, parsing result, gap analysis, resolving-gaps decisions, user flows, full component-interface set, and the target component interface together.',
  '9. Use `targetSourceFilePath`, `targetTestFilePath`, and `componentSourceFiles` to ground imports, mocks, and filesystem locations. Do not invent unrelated paths.',
  '10. The `files` array must use the assignment file format exactly: each item must contain only `filename` and `content`.',
  '11. Return at least one file, and at least one returned file must have `filename` exactly equal to `targetTestFilePath`.',
  '12. Test content must match the declared `framework` and `testFramework`.',
  '13. Focus on unit behavior, not end-to-end workflow coverage.',
  '14. For `dumb` components, prioritize rendering rules, formatting constraints, required props, accessibility-relevant output, and emitted callbacks.',
  '15. For `smart` components, prioritize state transitions, callback payloads, child-component coordination, invalid-input handling, and the component-level behavior implied by the user flows.',
  '16. Use `coveredStates` for named UI states and `coveredBehaviors` for interactions, formatting rules, and callback behavior actually exercised by the generated tests.',
  '17. If a masking, file, sorting, pagination, or validation rule exists upstream and applies to the target component, the tests should exercise it.',
  '18. Do not reference previous unit-test iterations. Only use upstream stage data plus the current target component data.',
  '19. Do not mention JSON, schema, prompts, or internal process language in the output.',
  '20. Keep the output implementation-oriented and concise.',
  '',
  'Exact top-level shape:',
  '{',
  '  "componentCode": "string",',
  '  "componentName": "string",',
  '  "coveredBehaviors": ["string"],',
  '  "coveredStates": ["string"],',
  '  "files": [',
  '    {',
  '      "filename": "string",',
  '      "content": "string"',
  '    }',
  '  ]',
  '}',
  '',
  'Before returning, validate your own answer against this exact structure and required fields.',
].join('\n');

export const DEFAULT_UNIT_TESTS_USER_TEMPLATE = [
  'Generate unit tests for the provided target component.',
  'Use the original brief, parsing result, gap analysis result, resolving-gaps decisions, user flows, all component interfaces, the target component interface, and the explicit project file paths together.',
  'Before answering, verify that the tests are only for `targetComponent`, that `componentCode` and `componentName` match it exactly, that at least one file path equals `targetTestFilePath`, and that the file objects use only `filename` and `content`.',
  '',
  'Input JSON:',
  '{{input}}',
].join('\n');

export const DEFAULT_UNIT_TESTS_STEP: IStep = {
  code: UNIT_TESTS_STEP_CODE,
  inputSchema: UNIT_TESTS_STEP_INPUT_SCHEMA,
  isActive: true,
  maxRetries: 2,
  name: 'Unit Tests',
  outputSchema: UNIT_TESTS_STEP_OUTPUT_SCHEMA,
  promptCode: UNIT_TESTS_STEP_CODE,
  promptVariant: UNIT_TESTS_PROMPT_VARIANT,
  purpose:
    'Generate unit test files for one parsed component at a time using the component contract set, upstream pipeline outputs, and explicit source/test file paths.',
  v: 1,
  validation: {
    validateInputSchema: true,
    validateOutputSchema: true,
  },
};

export const DEFAULT_UNIT_TESTS_PROMPT: IPrompt = {
  code: UNIT_TESTS_STEP_CODE,
  isActive: true,
  stepCode: UNIT_TESTS_STEP_CODE,
  system: DEFAULT_UNIT_TESTS_SYSTEM_PROMPT,
  userTemplate: DEFAULT_UNIT_TESTS_USER_TEMPLATE,
  v: 1,
  variant: UNIT_TESTS_PROMPT_VARIANT,
};
