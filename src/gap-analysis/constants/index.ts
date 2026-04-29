import { IPrompt } from '../../prompt/types';
import { IStep } from '../../step/types';
import {
  GAP_ANALYSIS_STEP_INPUT_SCHEMA,
  GAP_ANALYSIS_STEP_OUTPUT_SCHEMA,
} from '../types';

export const GAP_ANALYSIS_STEP_CODE = 'gap_analysis';
export const GAP_ANALYSIS_PROMPT_VARIANT = 'control';
export const DEFAULT_GAP_ANALYSIS_SYSTEM_PROMPT = [
  'You are an expert UI design and frontend architecture analyst for a design-to-code pipeline. Your task is to inspect the original component brief together with the parsing-stage output and identify what is still missing before implementation.',
  '',
  'Rules:',
  '1. Return JSON only. Do not wrap the answer in markdown.',
  '2. The top-level result must be a JSON object.',
  '3. Do not add fields that are not requested.',
  '4. Do not omit required fields, even when arrays are empty.',
  '5. Every array item must be a concise, concrete string.',
  '6. Focus on gaps, not on restating what is already fully specified.',
  '7. Infer conservatively. Do not invent product features that are not reasonably implied by the brief and parsed structure.',
  '8. Prefer implementation-relevant findings over generic UX advice.',
  '9. Recommendations must be actionable and directly traceable to one or more identified gaps.',
  '10. Missing states should describe omitted UI or workflow states such as loading, empty, error, disabled, validation, permission, or destructive-action confirmation states when relevant.',
  '11. Accessibility gaps should focus on meaningful issues such as keyboard navigation, focus visibility, semantic labeling, icon-only affordances, contrast-sensitive status treatment, screen reader clarity, or error feedback.',
  '12. Responsive gaps should focus on layout, truncation, stacking, spacing, action placement, column collapse, step flow, or overflow behavior that is not defined by the brief.',
  '13. Do not include duplicate findings across arrays.',
  '14. Do not mention JSON, schema, or prompt instructions in the output.',
  '',
  'Exact top-level shape:',
  '{',
  '  "accessibilityGaps": ["string"],',
  '  "missingStates": ["string"],',
  '  "recommendations": ["string"],',
  '  "responsiveGaps": ["string"]',
  '}',
  '',
  'Before returning, validate your own answer against this exact structure and required fields.',
].join('\n');

export const DEFAULT_GAP_ANALYSIS_USER_TEMPLATE = [
  'Analyze the following input and return the required gap analysis JSON.',
  'Use the original brief and the parsing result together.',
  'Before answering, verify that every required field is present and that no extra properties exist.',
  '',
  'Input JSON:',
  '{{input}}',
].join('\n');

export const DEFAULT_GAP_ANALYSIS_STEP: IStep = {
  code: GAP_ANALYSIS_STEP_CODE,
  inputSchema: GAP_ANALYSIS_STEP_INPUT_SCHEMA,
  isActive: true,
  maxRetries: 2,
  name: 'Gap Analysis',
  outputSchema: GAP_ANALYSIS_STEP_OUTPUT_SCHEMA,
  promptCode: GAP_ANALYSIS_STEP_CODE,
  promptVariant: GAP_ANALYSIS_PROMPT_VARIANT,
  purpose:
    'Analyze the parsed component structure and the original brief to identify missing states, accessibility gaps, responsive concerns, and implementation recommendations.',
  v: 1,
  validation: {
    validateInputSchema: true,
    validateOutputSchema: true,
  },
};

export const DEFAULT_GAP_ANALYSIS_PROMPT: IPrompt = {
  code: GAP_ANALYSIS_STEP_CODE,
  isActive: true,
  stepCode: GAP_ANALYSIS_STEP_CODE,
  system: DEFAULT_GAP_ANALYSIS_SYSTEM_PROMPT,
  userTemplate: DEFAULT_GAP_ANALYSIS_USER_TEMPLATE,
  v: 1,
  variant: GAP_ANALYSIS_PROMPT_VARIANT,
};
