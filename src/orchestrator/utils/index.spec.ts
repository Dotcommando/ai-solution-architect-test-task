import { RUN_FINAL_COMPONENT_TYPE } from '../../run/constants';
import { IRunArtifacts, IRunDerivedData, IRunResult } from '../../run/types';
import { buildRunResult } from './index';

describe('buildRunResult', () => {
  it('maps artifacts and derived data to the exact expected output shape', () => {
    const artifacts: IRunArtifacts = {
      componentInterfaces: {
        components: [],
      },
      e2eTests: null,
      gapAnalysis: {
        accessibilityGaps: ['Keyboard navigation needs explicit coverage.'],
        missingStates: ['error'],
        recommendations: ['Define the error state.'],
        responsiveGaps: ['Action placement on narrow widths is undefined.'],
      },
      generatedCode: {
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
            statesCovered: ['selected'],
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
        statesCovered: ['selected'],
        tokensUsed: ['--color-text-primary'],
      },
      parsing: {
        businessContext: 'merchant dashboard',
        components: [],
        constraints: [],
        content: [],
        interactions: [],
        rootComponentCode: 'payment_card',
        specifiedStates: [],
        tokenReferences: [],
      },
      resolvingGaps: {
        decisions: [],
      },
      unitTests: {
        components: [],
      },
      userFlows: {
        flows: [],
      },
      validation: {
        accessibilityScore: 'needs_attention',
        affectedComponentCodes: [],
        contractCompatibilityIssues: [],
        hallucinationsCaught: [],
        isRegenerationRequired: false,
        issuesFound: ['Missing required states: error'],
        regenerationReasons: [],
        stateCoverage: {
          coveredCount: 1,
          label: '1/2',
          totalCount: 2,
        },
        tokenCompliance: true,
      },
    };
    const derivedData: IRunDerivedData = {
      constraintDescriptions: ['Mask the card number.'],
      extractionConstraints: [],
      extractionSpecifiedStates: [],
      extractionTokenReferences: [],
      referencedTokenNames: ['--color-text-primary'],
      rootComponent: null,
      rootComponentName: 'Payment card',
      rootComponentType: RUN_FINAL_COMPONENT_TYPE.CARD,
      specifiedStateNames: ['selected'],
    };

    expect(buildRunResult(artifacts, derivedData)).toEqual<IRunResult>({
      component: {
        business_context: 'merchant dashboard',
        name: 'Payment card',
        type: 'card',
      },
      extraction: {
        constraints: ['Mask the card number.'],
        specified_states: ['selected'],
        tokens_referenced: ['--color-text-primary'],
      },
      gap_analysis: {
        accessibility_gaps: ['Keyboard navigation needs explicit coverage.'],
        missing_states: ['error'],
        recommendations: ['Define the error state.'],
        responsive_gaps: ['Action placement on narrow widths is undefined.'],
      },
      generated_code: {
        files: [
          {
            content: 'export function PaymentCard() { return null; }',
            filename:
              '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
          },
        ],
        framework: 'React',
        states_covered: ['selected'],
        tokens_used: ['--color-text-primary'],
      },
      validation: {
        accessibility_score: 'needs_attention',
        hallucinations_caught: [],
        issues_found: ['Missing required states: error'],
        states_coverage: '1/2',
        token_compliance: true,
      },
    });
  });

  it('supports wizard root components in the final result shape', () => {
    const artifacts: IRunArtifacts = {
      componentInterfaces: {
        components: [],
      },
      e2eTests: null,
      gapAnalysis: {
        accessibilityGaps: [],
        missingStates: [],
        recommendations: [],
        responsiveGaps: [],
      },
      generatedCode: {
        components: [],
        files: [],
        framework: 'React',
        statesCovered: ['default'],
        tokensUsed: [],
      },
      parsing: {
        businessContext: 'KYC onboarding',
        components: [],
        constraints: [],
        content: [],
        interactions: [],
        rootComponentCode: 'kyc_verification_wizard',
        specifiedStates: [],
        tokenReferences: [],
      },
      resolvingGaps: {
        decisions: [],
      },
      unitTests: {
        components: [],
      },
      userFlows: {
        flows: [],
      },
      validation: {
        accessibilityScore: 'partial_pass',
        affectedComponentCodes: [],
        contractCompatibilityIssues: [],
        hallucinationsCaught: [],
        isRegenerationRequired: false,
        issuesFound: [],
        regenerationReasons: [],
        stateCoverage: {
          coveredCount: 1,
          label: '1/1',
          totalCount: 1,
        },
        tokenCompliance: true,
      },
    };
    const derivedData: IRunDerivedData = {
      constraintDescriptions: [],
      extractionConstraints: [],
      extractionSpecifiedStates: [],
      extractionTokenReferences: [],
      referencedTokenNames: [],
      rootComponent: null,
      rootComponentName: 'KYC verification wizard',
      rootComponentType: RUN_FINAL_COMPONENT_TYPE.WIZARD,
      specifiedStateNames: [],
    };

    expect(buildRunResult(artifacts, derivedData)).toEqual<IRunResult>({
      component: {
        business_context: 'KYC onboarding',
        name: 'KYC verification wizard',
        type: 'wizard',
      },
      extraction: {
        constraints: [],
        specified_states: [],
        tokens_referenced: [],
      },
      gap_analysis: {
        accessibility_gaps: [],
        missing_states: [],
        recommendations: [],
        responsive_gaps: [],
      },
      generated_code: {
        files: [],
        framework: 'React',
        states_covered: ['default'],
        tokens_used: [],
      },
      validation: {
        accessibility_score: 'partial_pass',
        hallucinations_caught: [],
        issues_found: [],
        states_coverage: '1/1',
        token_compliance: true,
      },
    });
  });
});
