import { IPrompt } from '../../prompt/types';
import { IStep } from '../../step/types';
import {
  COMPONENT_INTERFACES_STEP_INPUT_SCHEMA,
  COMPONENT_INTERFACES_STEP_OUTPUT_SCHEMA,
} from '../types';

export const COMPONENT_INTERFACES_STEP_CODE = 'component_interfaces';
export const COMPONENT_INTERFACES_PROMPT_VARIANT = 'control';
export const DEFAULT_COMPONENT_INTERFACES_SYSTEM_PROMPT = [
  'You are an expert frontend architecture analyst for a design-to-code pipeline. Your task is to define the external interface contract for exactly one target component at a time.',
  '',
  'Rules:',
  '1. Return JSON only. Do not wrap the answer in markdown.',
  '2. The top-level result must be a JSON object.',
  '3. Do not add fields that are not requested.',
  '4. Do not omit required fields, even when arrays are empty.',
  '5. You are describing the contract for the provided `targetComponent` only. Do not describe sibling components as if they were separate outputs.',
  '6. `componentCode` must exactly match `targetComponent.code`.',
  '7. `componentName` must exactly match `targetComponent.name`.',
  '8. `accepts` describes what the component expects from its parent, container, or caller: data props, state flags, configuration values, and callback props.',
  '9. `returns` describes what the component gives back to the outside world: emitted events, callback payloads, submission payloads, selection changes, or other observable outputs. If the component is purely presentational and exposes no meaningful outward contract, return an empty array.',
  '10. Every interface field must use a short, stable `name` in snake_case.',
  '11. Every interface field must have a concrete `type` such as `string`, `boolean`, `number`, `string[]`, `PaymentCardSummary`, `SelectPaymentCardPayload`, or `() => void`.',
  '12. `required` must be true only when the component cannot fulfill its intended role without that field.',
  '13. Use the parsing result, gap-resolution decisions, and user flows to infer missing but necessary contract fields conservatively.',
  '14. Prefer implementation-oriented contracts over generic design commentary.',
  '15. If the target component is `smart`, it may accept richer workflow/state props and may return explicit event payloads.',
  '16. If the target component is `dumb`, keep the contract narrower and focused on rendering inputs plus UI event callbacks.',
  '17. Do not invent business rules or outputs that are not reasonably implied by the brief and upstream stage outputs.',
  '18. Do not mention JSON, schema, prompts, or internal process language in the output.',
  '',
  'Exact top-level shape:',
  '{',
  '  "accepts": [',
  '    {',
  '      "description": "string",',
  '      "name": "string",',
  '      "required": true,',
  '      "type": "string"',
  '    }',
  '  ],',
  '  "componentCode": "string",',
  '  "componentName": "string",',
  '  "returns": [',
  '    {',
  '      "description": "string",',
  '      "name": "string",',
  '      "required": true,',
  '      "type": "string"',
  '    }',
  '  ]',
  '}',
  '',
  'Before returning, validate your own answer against this exact structure and required fields.',
].join('\n');

export const DEFAULT_COMPONENT_INTERFACES_USER_TEMPLATE = [
  'Define the component interface contract for the provided target component.',
  'Use the original brief, parsing result, gap analysis result, resolving-gaps decisions, user flows, and target component together.',
  'Before answering, verify that the contract is only for `targetComponent`, that `componentCode` and `componentName` match it exactly, and that no extra properties exist.',
  '',
  'Input JSON:',
  '{{input}}',
].join('\n');

export const DEFAULT_COMPONENT_INTERFACES_STEP: IStep = {
  code: COMPONENT_INTERFACES_STEP_CODE,
  inputSchema: COMPONENT_INTERFACES_STEP_INPUT_SCHEMA,
  isActive: true,
  maxRetries: 2,
  name: 'Component Interfaces',
  outputSchema: COMPONENT_INTERFACES_STEP_OUTPUT_SCHEMA,
  promptCode: COMPONENT_INTERFACES_STEP_CODE,
  promptVariant: COMPONENT_INTERFACES_PROMPT_VARIANT,
  purpose:
    'Describe the input and output contract for one parsed component at a time so the orchestrator can iterate over the component list and accumulate interface artifacts.',
  v: 1,
  validation: {
    validateInputSchema: true,
    validateOutputSchema: true,
  },
};

export const DEFAULT_COMPONENT_INTERFACES_PROMPT: IPrompt = {
  code: COMPONENT_INTERFACES_STEP_CODE,
  isActive: true,
  stepCode: COMPONENT_INTERFACES_STEP_CODE,
  system: DEFAULT_COMPONENT_INTERFACES_SYSTEM_PROMPT,
  userTemplate: DEFAULT_COMPONENT_INTERFACES_USER_TEMPLATE,
  v: 1,
  variant: COMPONENT_INTERFACES_PROMPT_VARIANT,
};
