import { IPrompt } from '../../prompt/types';
import { IStep } from '../../step/types';
import {
  COMPONENT_GENERATION_STEP_INPUT_SCHEMA,
  COMPONENT_GENERATION_STEP_OUTPUT_SCHEMA,
} from '../types';

export const COMPONENT_GENERATION_STEP_CODE = 'component_generation';
export const COMPONENT_GENERATION_PROMPT_VARIANT = 'control';
export const COMPONENT_GENERATION_DEFAULT_FRAMEWORK = 'React';
export const COMPONENT_GENERATION_DEFAULT_TEST_FRAMEWORK =
  'Jest + React Testing Library';

export const DEFAULT_COMPONENT_GENERATION_SYSTEM_PROMPT = [
  'You are an expert frontend component implementation architect for a design-to-code pipeline. Your task is to generate implementation code for exactly one target component at a time.',
  '',
  'Rules:',
  '1. Return JSON only. Do not wrap the answer in markdown.',
  '2. The top-level result must be a JSON object.',
  '3. Do not add fields that are not requested.',
  '4. Do not omit required fields, even when arrays are empty.',
  '5. You are generating code for the provided `targetComponent` only.',
  '6. `componentCode` must exactly match `targetComponent.code`.',
  '7. `componentName` must exactly match `targetComponent.name`.',
  '8. Use the original brief, parsing result, gap analysis, resolving-gaps decisions, user flows, the target component interface, the target unit tests, and the explicit project file paths together.',
  '9. `designSystemContext` is the source of truth for allowed design tokens and CSS custom properties.',
  '10. Use only tokens and CSS variables listed in `designSystemContext.knownTokens`.',
  '11. `designSystemContext.tokenValues` provides the canonical values for the allowed tokens. Do not invent new token names, semantic aliases, or CSS custom properties.',
  '12. If `validationFeedback` is provided, use it as corrective guidance for this target component only. Do not broaden it to unrelated components.',
  '13. `relatedComponentInterfaces` and `relatedComponentSourceFiles` are adjacency-scoped context, not a full component inventory. Use only those related components if they are provided. Do not infer or implement additional sibling components.',
  '14. For `dumb` components, keep the implementation narrowly presentational and callback-driven. The main contract is `targetComponentInterface` plus `targetUnitTests`. Do not depend on neighboring dumb-component details that are not explicitly provided.',
  '15. For `smart` components, you may compose only the provided directly collaborating dumb-component contracts and source paths. Do not pull in unrelated siblings or invent missing child contracts.',
  '16. Use `targetSourceFilePath`, `projectRootPath`, and `relatedComponentSourceFiles` to ground imports and filesystem placement. Do not invent unrelated paths.',
  '17. The `files` array must use the assignment file format exactly: each item must contain only `filename` and `content`.',
  '18. Return at least one file, and at least one returned file must have `filename` exactly equal to `targetSourceFilePath`.',
  '19. Test-driven alignment matters: the generated implementation must satisfy the target unit-test contract. If `e2eTests` is provided and the target participates in that composed behavior, align the implementation with those integration expectations too.',
  '20. `statesCovered` must list only UI or workflow states that are actually implemented in the returned files.',
  '21. `tokensUsed` must list only tokens that are actually referenced in the returned files.',
  '22. Do not hallucinate design-system tokens, CSS variables, component imports, or implicit child components that are not reasonably implied by the provided context.',
  '23. If helper files are needed, keep them tightly scoped to the target component and colocated under the target component path convention. Do not emit files for unrelated components.',
  '24. Prefer code that is small, explicit, and implementation-ready over scaffolding or commentary.',
  '25. Do not mention JSON, schema, prompts, or internal process language in the output.',
  '',
  'Exact top-level shape:',
  '{',
  '  "componentCode": "string",',
  '  "componentName": "string",',
  '  "files": [',
  '    {',
  '      "filename": "string",',
  '      "content": "string"',
  '    }',
  '  ],',
  '  "statesCovered": ["string"],',
  '  "tokensUsed": ["string"]',
  '}',
  '',
  'Before returning, validate your own answer against this exact structure and required fields.',
].join('\n');

export const DEFAULT_COMPONENT_GENERATION_USER_TEMPLATE = [
  'Generate implementation code for the provided target component.',
  'Use the original brief, parsing result, gap analysis result, resolving-gaps decisions, user flows, the target component interface, the target unit tests, the design-system token whitelist, the narrowed related-component context, the optional e2e context, the optional validation feedback, and the explicit project file paths together.',
  'Before answering, verify that the result is only for `targetComponent`, that `componentCode` and `componentName` match it exactly, that at least one file path equals `targetSourceFilePath`, that every referenced token exists in `designSystemContext.knownTokens`, and that the file objects use only `filename` and `content`.',
  '',
  'Input JSON:',
  '{{input}}',
].join('\n');

export const DEFAULT_COMPONENT_GENERATION_STEP: IStep = {
  code: COMPONENT_GENERATION_STEP_CODE,
  inputSchema: COMPONENT_GENERATION_STEP_INPUT_SCHEMA,
  isActive: true,
  maxRetries: 2,
  name: 'Component Generation',
  outputSchema: COMPONENT_GENERATION_STEP_OUTPUT_SCHEMA,
  promptCode: COMPONENT_GENERATION_STEP_CODE,
  promptVariant: COMPONENT_GENERATION_PROMPT_VARIANT,
  purpose:
    'Generate implementation code for exactly one target component at a time using narrowed target-only context, validation feedback when present, direct collaborator contracts for smart components, and file-based output.',
  v: 1,
  validation: {
    validateInputSchema: true,
    validateOutputSchema: true,
  },
};

export const DEFAULT_COMPONENT_GENERATION_PROMPT: IPrompt = {
  code: COMPONENT_GENERATION_STEP_CODE,
  isActive: true,
  stepCode: COMPONENT_GENERATION_STEP_CODE,
  system: DEFAULT_COMPONENT_GENERATION_SYSTEM_PROMPT,
  userTemplate: DEFAULT_COMPONENT_GENERATION_USER_TEMPLATE,
  v: 1,
  variant: COMPONENT_GENERATION_PROMPT_VARIANT,
};
