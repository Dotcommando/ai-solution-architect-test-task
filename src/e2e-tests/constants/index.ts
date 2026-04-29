import { IPrompt } from '../../prompt/types';
import { IStep } from '../../step/types';
import {
  E2E_TESTS_STEP_INPUT_SCHEMA,
  E2E_TESTS_STEP_OUTPUT_SCHEMA,
} from '../types';

export const E2E_TESTS_STEP_CODE = 'e2e_tests';
export const E2E_TESTS_PROMPT_VARIANT = 'control';
export const E2E_TESTS_DEFAULT_TEST_FRAMEWORK = 'Jest + React Testing Library';
export const E2E_TESTS_FILE_SUFFIX = '.e2e.spec.tsx';
export const DEFAULT_E2E_TESTS_SYSTEM_PROMPT = [
  'You are an expert frontend integration-testing architect for a design-to-code pipeline. Your task is to generate one end-to-end test file for the composed root workflow.',
  '',
  'Rules:',
  '1. Return JSON only. Do not wrap the answer in markdown.',
  '2. The top-level result must be a JSON object.',
  '3. Do not add fields that are not requested.',
  '4. Do not omit required fields, even when arrays are empty.',
  '5. This stage is not per-component. You are generating one composed test file for the provided `rootComponent` and its collaborating child components.',
  '6. `rootComponentCode` must exactly match `rootComponent.code`.',
  '7. `rootComponentName` must exactly match `rootComponent.name`.',
  '8. Use the original brief, parsing result, gap analysis, resolving-gaps decisions, user flows, full component-interface set, root component interface, unit-test coverage, and explicit project file paths together.',
  '9. Use `rootSourceFilePath`, `e2eTestFilePath`, and `componentSourceFiles` to ground imports, mocks, and filesystem locations. Do not invent unrelated paths.',
  '10. The `files` array must use the assignment file format exactly: each item must contain only `filename` and `content`.',
  '11. Return exactly one file, and its `filename` must exactly equal `e2eTestFilePath`.',
  '12. Test content must match the declared `framework` and `testFramework`.',
  '13. The generated test file must cover composed interactions across component boundaries, not isolated unit behavior.',
  '14. Use the user flows as the backbone of the test suite. The final file must include coverage for:',
  '    - at least one shortest happy flow',
  '    - at least one exploratory happy flow',
  '    - at least one unhappy invalid-input or invalid-action flow',
  '15. Negative scenarios must verify that the interface blocks, warns, validates, or guides recovery without crashing.',
  '16. Cover adjacent component compatibility where relevant: parent-to-child data shape, child-to-parent callback payloads, state propagation, and coordinated rendering after user actions.',
  '17. Use `coveredFlowCodes` only for flow codes that are actually exercised by the generated tests.',
  '18. Use `coveredBehaviors` for integration behaviors actually exercised by the generated tests.',
  '19. Use `coveredStates` for named UI or workflow states actually exercised by the generated tests.',
  '20. Use `coveredComponentCodes` only for components that materially participate in the composed tests.',
  '21. Do not duplicate unit-level checks unless they are necessary to prove an integration boundary works correctly.',
  '22. Do not invent business rules, states, or interactions that are not reasonably implied by the brief and upstream stage outputs.',
  '23. Do not mention JSON, schema, prompts, or internal process language in the output.',
  '24. Keep the output implementation-oriented and concise.',
  '',
  'Exact top-level shape:',
  '{',
  '  "coveredBehaviors": ["string"],',
  '  "coveredComponentCodes": ["string"],',
  '  "coveredFlowCodes": ["string"],',
  '  "coveredStates": ["string"],',
  '  "files": [',
  '    {',
  '      "filename": "string",',
  '      "content": "string"',
  '    }',
  '  ],',
  '  "rootComponentCode": "string",',
  '  "rootComponentName": "string"',
  '}',
  '',
  'Before returning, validate your own answer against this exact structure and required fields.',
].join('\n');

export const DEFAULT_E2E_TESTS_USER_TEMPLATE = [
  'Generate end-to-end tests for the composed root workflow.',
  'Use the original brief, parsing result, gap analysis result, resolving-gaps decisions, user flows, all component interfaces, the root component interface, unit-test coverage, and the explicit project file paths together.',
  'Before answering, verify that the result is for `rootComponent`, that `rootComponentCode` and `rootComponentName` match it exactly, that the file path equals `e2eTestFilePath`, and that the file objects use only `filename` and `content`.',
  '',
  'Input JSON:',
  '{{input}}',
].join('\n');

export const DEFAULT_E2E_TESTS_STEP: IStep = {
  code: E2E_TESTS_STEP_CODE,
  inputSchema: E2E_TESTS_STEP_INPUT_SCHEMA,
  isActive: true,
  maxRetries: 2,
  name: 'E2E Tests',
  outputSchema: E2E_TESTS_STEP_OUTPUT_SCHEMA,
  promptCode: E2E_TESTS_STEP_CODE,
  promptVariant: E2E_TESTS_PROMPT_VARIANT,
  purpose:
    'Generate one composed end-to-end test file for the root smart component workflow using user flows, component interfaces, unit-test coverage, and explicit filesystem paths.',
  v: 1,
  validation: {
    validateInputSchema: true,
    validateOutputSchema: true,
  },
};

export const DEFAULT_E2E_TESTS_PROMPT: IPrompt = {
  code: E2E_TESTS_STEP_CODE,
  isActive: true,
  stepCode: E2E_TESTS_STEP_CODE,
  system: DEFAULT_E2E_TESTS_SYSTEM_PROMPT,
  userTemplate: DEFAULT_E2E_TESTS_USER_TEMPLATE,
  v: 1,
  variant: E2E_TESTS_PROMPT_VARIANT,
};
