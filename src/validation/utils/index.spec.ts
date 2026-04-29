import { DEFAULT_DESIGN_SYSTEM_CONTEXT } from '../../design-system/constants';
import { IRunGeneratedCodeArtifact } from '../../run/types';
import { IGapAnalysisStepOutput } from '../../gap-analysis/types';
import { IResolvingGapsStepOutput } from '../../resolving-gaps/types';
import { IParsingStepOutput } from '../../types';
import { COMPONENT_STATE_POLICY } from '../../types';
import {
  buildDeterministicValidationIssues,
  buildRegenerationReasons,
  buildStateCoverageSummary,
} from './index';

describe('validation utils', () => {
  it('treats descriptive covered states as coverage for selected, error, and invalid', () => {
    const parsing: IParsingStepOutput = {
      businessContext: 'merchant dashboard',
      components: [
        {
          code: 'payment_card',
          name: 'Payment card',
          parentCode: null,
          purpose: 'Display a saved payment method.',
          statePolicy: COMPONENT_STATE_POLICY.SMART,
          type: 'card',
        },
      ],
      constraints: [],
      content: [],
      interactions: [],
      rootComponentCode: 'payment_card',
      specifiedStates: [
        {
          code: 'selected',
          componentCode: 'payment_card',
          description: 'Selected card state.',
          isExplicit: true,
          name: 'selected',
        },
      ],
      tokenReferences: [],
    };
    const gapAnalysis: IGapAnalysisStepOutput = {
      accessibilityGaps: [],
      missingStates: ['Error state is not explicitly defined.'],
      recommendations: [],
      responsiveGaps: [],
    };
    const resolvingGaps: IResolvingGapsStepOutput = {
      decisions: [
        {
          affectedComponentCodes: ['payment_card'],
          code: 'define_error_state',
          decision:
            'Add an explicit error state for invalid destructive actions.',
          rationale: 'This resolves the missing error-state gap.',
          sourceGap: 'Error state is not explicitly defined.',
        },
      ],
    };
    const generatedCode: IRunGeneratedCodeArtifact = {
      components: [
        {
          componentCode: 'payment_card',
          files: [
            {
              content: 'export function PaymentCard() { return null; }',
              filename:
                '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
            },
          ],
          statesCovered: [
            'selected=true',
            'delete_error present',
            'invalid destructive action blocked',
          ],
          tokensUsed: ['--color-text-primary'],
        },
      ],
      files: [
        {
          content: 'export function PaymentCard() { return null; }',
          filename:
            '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
        },
      ],
      framework: 'React',
      statesCovered: [
        'selected=true',
        'delete_error present',
        'invalid destructive action blocked',
      ],
      tokensUsed: ['--color-text-primary'],
    };
    const unitTests = {
      components: [],
    };

    const stateCoverage = buildStateCoverageSummary(
      parsing,
      gapAnalysis,
      resolvingGaps,
      generatedCode,
      unitTests,
      null,
    );

    expect(stateCoverage.coveredCount).toBe(2);
    expect(stateCoverage.coveredStates).toEqual(
      expect.arrayContaining(['selected', 'error', 'invalid']),
    );
    expect(stateCoverage.label).toBe('2/2');
    expect(stateCoverage.missingStates).toEqual([]);
    expect(stateCoverage.requiredStates).toEqual(['error', 'selected']);
    expect(stateCoverage.totalCount).toBe(2);
    expect(
      buildRegenerationReasons(
        DEFAULT_DESIGN_SYSTEM_CONTEXT,
        parsing,
        resolvingGaps,
        generatedCode,
        stateCoverage,
      ),
    ).toEqual([]);
  });

  it('does not infer invalid as a required state from loose invalid wording', () => {
    const parsing: IParsingStepOutput = {
      businessContext: 'merchant dashboard',
      components: [
        {
          code: 'payment_card',
          name: 'Payment card',
          parentCode: null,
          purpose: 'Display a saved payment method.',
          statePolicy: COMPONENT_STATE_POLICY.SMART,
          type: 'card',
        },
      ],
      constraints: [],
      content: [],
      interactions: [],
      rootComponentCode: 'payment_card',
      specifiedStates: [],
      tokenReferences: [],
    };
    const gapAnalysis: IGapAnalysisStepOutput = {
      accessibilityGaps: [],
      missingStates: ['Hover state is not explicit.'],
      recommendations: [],
      responsiveGaps: [],
    };
    const resolvingGaps: IResolvingGapsStepOutput = {
      decisions: [
        {
          affectedComponentCodes: ['payment_card'],
          code: 'protect_delete_action',
          decision:
            'Prevent invalid destructive actions and show an error message when deletion fails.',
          rationale: 'The destructive action must stay resilient.',
          sourceGap:
            'The brief does not explain how invalid destructive actions are prevented.',
        },
      ],
    };
    const generatedCode: IRunGeneratedCodeArtifact = {
      components: [
        {
          componentCode: 'payment_card',
          files: [
            {
              content: 'export function PaymentCard() { return null; }',
              filename:
                '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
            },
          ],
          statesCovered: ['delete_error present'],
          tokensUsed: ['--color-text-primary'],
        },
      ],
      files: [
        {
          content: 'export function PaymentCard() { return null; }',
          filename:
            '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
        },
      ],
      framework: 'React',
      statesCovered: ['delete_error present'],
      tokensUsed: ['--color-text-primary'],
    };

    const stateCoverage = buildStateCoverageSummary(
      parsing,
      gapAnalysis,
      resolvingGaps,
      generatedCode,
      {
        components: [],
      },
      null,
    );

    expect(stateCoverage.requiredStates).toEqual(['error', 'hover']);
    expect(stateCoverage.missingStates).toEqual(['hover']);
    expect(stateCoverage.label).toBe('1/2');
  });

  it('treats hover as an advisory issue without triggering regeneration', () => {
    const parsing: IParsingStepOutput = {
      businessContext: 'merchant dashboard',
      components: [
        {
          code: 'payment_card',
          name: 'Payment card',
          parentCode: null,
          purpose: 'Display a saved payment method.',
          statePolicy: COMPONENT_STATE_POLICY.SMART,
          type: 'card',
        },
      ],
      constraints: [],
      content: [],
      interactions: [],
      rootComponentCode: 'payment_card',
      specifiedStates: [],
      tokenReferences: [],
    };
    const gapAnalysis: IGapAnalysisStepOutput = {
      accessibilityGaps: [],
      missingStates: ['Hover state is not explicitly defined.'],
      recommendations: [],
      responsiveGaps: [],
    };
    const resolvingGaps: IResolvingGapsStepOutput = {
      decisions: [],
    };
    const generatedCode: IRunGeneratedCodeArtifact = {
      components: [
        {
          componentCode: 'payment_card',
          files: [
            {
              content: 'export function PaymentCard() { return null; }',
              filename:
                '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
            },
          ],
          statesCovered: ['idle'],
          tokensUsed: ['--color-text-primary'],
        },
      ],
      files: [
        {
          content: 'export function PaymentCard() { return null; }',
          filename:
            '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
        },
      ],
      framework: 'React',
      statesCovered: ['idle'],
      tokensUsed: ['--color-text-primary'],
    };

    const stateCoverage = buildStateCoverageSummary(
      parsing,
      gapAnalysis,
      resolvingGaps,
      generatedCode,
      {
        components: [],
      },
      null,
    );

    expect(stateCoverage.requiredStates).toEqual(['hover']);
    expect(buildDeterministicValidationIssues([], stateCoverage)).toEqual([
      'Additional interactive states are not explicitly covered: hover',
    ]);
    expect(
      buildRegenerationReasons(
        DEFAULT_DESIGN_SYSTEM_CONTEXT,
        parsing,
        resolvingGaps,
        generatedCode,
        stateCoverage,
      ),
    ).toEqual([]);
  });
});
