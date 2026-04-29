import { DEFAULT_CANONICAL_STATE_MODEL } from '../../canonical-state-model/constants';
import { DEFAULT_DESIGN_SYSTEM_CONTEXT } from '../../design-system/constants';
import { IRunGeneratedCodeArtifact } from '../../run/types';
import { IGapAnalysisStepOutput } from '../../gap-analysis/types';
import { IResolvingGapsStepOutput } from '../../resolving-gaps/types';
import {
  COMPONENT_INTERACTION_TYPE,
  COMPONENT_STATE_POLICY,
  IParsingStepOutput,
  UI_COMPONENT_TYPE,
} from '../../types';
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
    const stateCoverage = buildStateCoverageSummary(
      DEFAULT_CANONICAL_STATE_MODEL,
      parsing,
      gapAnalysis,
      resolvingGaps,
      generatedCode,
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
        DEFAULT_CANONICAL_STATE_MODEL,
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
      DEFAULT_CANONICAL_STATE_MODEL,
      parsing,
      gapAnalysis,
      resolvingGaps,
      generatedCode,
    );

    expect(stateCoverage.requiredStates).toEqual(['error', 'hover']);
    expect(stateCoverage.missingStates).toEqual(['hover']);
    expect(stateCoverage.label).toBe('1/2');
  });

  it('does not promote selected to a hard required state without an explicit select interaction', () => {
    const parsing: IParsingStepOutput = {
      businessContext: 'merchant dashboard',
      components: [
        {
          code: 'transaction_table',
          name: 'Transaction table',
          parentCode: null,
          purpose: 'Display a transaction list.',
          statePolicy: COMPONENT_STATE_POLICY.SMART,
          type: UI_COMPONENT_TYPE.TABLE,
        },
        {
          code: 'transaction_table_status_badge',
          name: 'Transaction status badge',
          parentCode: 'transaction_table',
          purpose: 'Render transaction status.',
          statePolicy: COMPONENT_STATE_POLICY.DUMB,
          type: UI_COMPONENT_TYPE.BADGE,
        },
      ],
      constraints: [],
      content: [],
      interactions: [
        {
          code: 'open_transaction_details',
          componentCode: 'transaction_table',
          description: 'Open the transaction details view.',
          targetComponentCode: null,
          type: COMPONENT_INTERACTION_TYPE.OPEN_DETAILS,
        },
      ],
      rootComponentCode: 'transaction_table',
      specifiedStates: [],
      tokenReferences: [],
    };
    const gapAnalysis: IGapAnalysisStepOutput = {
      accessibilityGaps: [],
      missingStates: ['Selected state is not explicitly defined.'],
      recommendations: [],
      responsiveGaps: [],
    };
    const resolvingGaps: IResolvingGapsStepOutput = {
      decisions: [
        {
          affectedComponentCodes: ['transaction_table_status_badge'],
          code: 'define_selected_status_treatment',
          decision:
            'Add a selected presentation treatment for the active transaction status badge.',
          rationale: 'Clarify which transaction is currently active.',
          sourceGap: 'Selected state is not explicitly defined.',
        },
      ],
    };
    const generatedCode: IRunGeneratedCodeArtifact = {
      components: [
        {
          componentCode: 'transaction_table',
          files: [
            {
              content: 'export function TransactionTable() { return null; }',
              filename:
                '/workspace/generated/frontend/src/components/TransactionTable/TransactionTable.tsx',
            },
          ],
          statesCovered: ['default'],
          tokensUsed: ['--color-text-primary'],
        },
        {
          componentCode: 'transaction_table_status_badge',
          files: [
            {
              content:
                'export function TransactionTableStatusBadge() { return null; }',
              filename:
                '/workspace/generated/frontend/src/components/TransactionTableStatusBadge/TransactionTableStatusBadge.tsx',
            },
          ],
          statesCovered: ['default', 'unknown'],
          tokensUsed: ['--color-text-primary'],
        },
      ],
      files: [],
      framework: 'React',
      statesCovered: ['default', 'unknown'],
      tokensUsed: ['--color-text-primary'],
    };

    const stateCoverage = buildStateCoverageSummary(
      DEFAULT_CANONICAL_STATE_MODEL,
      parsing,
      gapAnalysis,
      resolvingGaps,
      generatedCode,
    );

    expect(stateCoverage.requiredStates).toEqual(['active']);
    expect(stateCoverage.missingStates).toEqual(['active']);
    expect(
      buildRegenerationReasons(
        DEFAULT_CANONICAL_STATE_MODEL,
        DEFAULT_DESIGN_SYSTEM_CONTEXT,
        parsing,
        resolvingGaps,
        generatedCode,
        stateCoverage,
      ),
    ).toEqual([]);
  });

  it('does not infer active from the word interactive', () => {
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
      missingStates: [
        'Delete error state (failed deletion messaging and recovery action)',
      ],
      recommendations: [],
      responsiveGaps: [],
    };
    const resolvingGaps: IResolvingGapsStepOutput = {
      decisions: [
        {
          affectedComponentCodes: ['payment_card'],
          code: 'delete_error_inline_recovery',
          decision:
            'On delete failure: keep the card visible and interactive again, render an inline error message beneath the card details, and keep the delete button available as a retry.',
          rationale:
            'Define the failure state without introducing new gestures.',
          sourceGap:
            'Delete error state (failed deletion messaging and recovery action)',
        },
      ],
    };

    const stateCoverage = buildStateCoverageSummary(
      DEFAULT_CANONICAL_STATE_MODEL,
      parsing,
      gapAnalysis,
      resolvingGaps,
      {
        components: [],
        files: [],
        framework: 'React',
        statesCovered: [],
        tokensUsed: [],
      },
    );

    expect(stateCoverage.requiredStates).toEqual(['error', 'failed']);
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
      DEFAULT_CANONICAL_STATE_MODEL,
      parsing,
      gapAnalysis,
      resolvingGaps,
      generatedCode,
    );

    expect(stateCoverage.requiredStates).toEqual(['hover']);
    expect(
      buildDeterministicValidationIssues(
        DEFAULT_CANONICAL_STATE_MODEL,
        [],
        stateCoverage,
      ),
    ).toEqual([
      'Additional interactive states are not explicitly covered: hover',
    ]);
    expect(
      buildRegenerationReasons(
        DEFAULT_CANONICAL_STATE_MODEL,
        DEFAULT_DESIGN_SYSTEM_CONTEXT,
        parsing,
        resolvingGaps,
        generatedCode,
        stateCoverage,
      ),
    ).toEqual([]);
  });

  it('treats deleting and in-progress states as coverage for loading', () => {
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
        {
          code: 'delete_card_action',
          name: 'Delete card action',
          parentCode: 'payment_card',
          purpose: 'Delete a saved payment method.',
          statePolicy: COMPONENT_STATE_POLICY.DUMB,
          type: 'button',
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
      missingStates: [
        'Deletion in-progress state (loading/spinner, temporarily disable interactions)',
      ],
      recommendations: [],
      responsiveGaps: [],
    };
    const resolvingGaps: IResolvingGapsStepOutput = {
      decisions: [
        {
          affectedComponentCodes: ['delete_card_action', 'payment_card'],
          code: 'deletion_async_in_progress_behavior',
          decision:
            'During deletion request: show an inline loading indicator on delete_card_action (spinner replacing the icon) and disable both payment_card selection and delete_card_action until the request resolves.',
          rationale:
            'Define the in-progress state behavior for async deletion.',
          sourceGap:
            'Deletion in-progress state (loading/spinner, temporarily disable interactions)',
        },
      ],
    };
    const generatedCode: IRunGeneratedCodeArtifact = {
      components: [
        {
          componentCode: 'delete_card_action',
          files: [
            {
              content: 'export function DeleteCardAction() { return null; }',
              filename:
                '/workspace/generated/frontend/src/components/DeleteCardAction/DeleteCardAction.tsx',
            },
          ],
          statesCovered: ['deleting (is_deleting=true)'],
          tokensUsed: ['--color-text-primary'],
        },
        {
          componentCode: 'payment_card',
          files: [
            {
              content: 'export function PaymentCard() { return null; }',
              filename:
                '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
            },
          ],
          statesCovered: ['deleting in progress'],
          tokensUsed: ['--color-text-primary'],
        },
      ],
      files: [
        {
          content: 'export function DeleteCardAction() { return null; }',
          filename:
            '/workspace/generated/frontend/src/components/DeleteCardAction/DeleteCardAction.tsx',
        },
        {
          content: 'export function PaymentCard() { return null; }',
          filename:
            '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
        },
      ],
      framework: 'React',
      statesCovered: ['deleting (is_deleting=true)', 'deleting in progress'],
      tokensUsed: ['--color-text-primary'],
    };

    const stateCoverage = buildStateCoverageSummary(
      DEFAULT_CANONICAL_STATE_MODEL,
      parsing,
      gapAnalysis,
      resolvingGaps,
      generatedCode,
    );

    expect(stateCoverage.coveredStates).toEqual(['loading']);
    expect(stateCoverage.requiredStates).toEqual(['loading']);
    expect(stateCoverage.missingStates).toEqual([]);
    expect(stateCoverage.label).toBe('1/1');
    expect(
      buildRegenerationReasons(
        DEFAULT_CANONICAL_STATE_MODEL,
        DEFAULT_DESIGN_SYSTEM_CONTEXT,
        parsing,
        resolvingGaps,
        generatedCode,
        stateCoverage,
      ),
    ).toEqual([]);
  });

  it('treats deleted and removed states as coverage for success', () => {
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
        {
          code: 'delete_card_action',
          name: 'Delete card action',
          parentCode: 'payment_card',
          purpose: 'Delete a saved payment method.',
          statePolicy: COMPONENT_STATE_POLICY.DUMB,
          type: 'button',
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
      missingStates: [
        'Deletion success feedback/removed state handling (animation, toast, list update expectations)',
      ],
      recommendations: [],
      responsiveGaps: [],
    };
    const resolvingGaps: IResolvingGapsStepOutput = {
      decisions: [
        {
          affectedComponentCodes: ['delete_card_action', 'payment_card'],
          code: 'delete_success_removal_handling',
          decision:
            'On successful deletion, the parent removes the payment_card from the list; the component itself does not animate removal. If the component remains mounted temporarily, it must render nothing when a controlled "deleted" flag is true.',
          rationale:
            'Clarify list-update ownership while preserving a deterministic deleted outcome.',
          sourceGap:
            'Deletion success feedback/removed state handling (animation, toast, list update expectations)',
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
          statesCovered: ['deleted=true', 'removed from list'],
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
      statesCovered: ['deleted=true', 'removed from list'],
      tokensUsed: ['--color-text-primary'],
    };

    const stateCoverage = buildStateCoverageSummary(
      DEFAULT_CANONICAL_STATE_MODEL,
      parsing,
      gapAnalysis,
      resolvingGaps,
      generatedCode,
    );

    expect(stateCoverage.coveredStates).toEqual(['success']);
    expect(stateCoverage.requiredStates).toEqual(['success']);
    expect(stateCoverage.missingStates).toEqual([]);
    expect(stateCoverage.label).toBe('1/1');
    expect(
      buildRegenerationReasons(
        DEFAULT_CANONICAL_STATE_MODEL,
        DEFAULT_DESIGN_SYSTEM_CONTEXT,
        parsing,
        resolvingGaps,
        generatedCode,
        stateCoverage,
      ),
    ).toEqual([]);
  });

  it('treats confirmation dialog open as coverage for confirming', () => {
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
      missingStates: [
        'Delete confirmation state (modal/popover) to prevent accidental destructive action',
      ],
      recommendations: [],
      responsiveGaps: [],
    };
    const resolvingGaps: IResolvingGapsStepOutput = {
      decisions: [
        {
          affectedComponentCodes: ['payment_card'],
          code: 'delete_confirmation_dialog',
          decision:
            'Require a confirmation dialog before deletion and open the modal dialog when the delete action is triggered.',
          rationale:
            'This defines a concrete confirmation state for destructive actions.',
          sourceGap:
            'Delete confirmation state (modal/popover) to prevent accidental destructive action',
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
          statesCovered: ['confirmation dialog open'],
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
      statesCovered: ['confirmation dialog open'],
      tokensUsed: ['--color-text-primary'],
    };

    const stateCoverage = buildStateCoverageSummary(
      DEFAULT_CANONICAL_STATE_MODEL,
      parsing,
      gapAnalysis,
      resolvingGaps,
      generatedCode,
    );

    expect(stateCoverage.coveredStates).toEqual(['confirming']);
    expect(stateCoverage.requiredStates).toEqual(['confirming']);
    expect(stateCoverage.missingStates).toEqual([]);
  });

  it('treats delete error and failure states as coverage for failed', () => {
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
        {
          code: 'delete_card_action',
          name: 'Delete card action',
          parentCode: 'payment_card',
          purpose: 'Delete a saved payment method.',
          statePolicy: COMPONENT_STATE_POLICY.DUMB,
          type: 'button',
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
      missingStates: [
        'Delete error state (failed deletion messaging and recovery action)',
      ],
      recommendations: [],
      responsiveGaps: [],
    };
    const resolvingGaps: IResolvingGapsStepOutput = {
      decisions: [
        {
          affectedComponentCodes: ['delete_card_action', 'payment_card'],
          code: 'delete_error_inline_recovery',
          decision:
            'On delete failure: keep the card visible and interactive again, render an inline error message beneath the card details, and keep the delete button available as a retry.',
          rationale:
            'Define the delete failure state and the local recovery path.',
          sourceGap:
            'Delete error state (failed deletion messaging and recovery action)',
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
          statesCovered: ['delete error (delete_error_message present)'],
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
      statesCovered: ['delete error (delete_error_message present)'],
      tokensUsed: ['--color-text-primary'],
    };

    const stateCoverage = buildStateCoverageSummary(
      DEFAULT_CANONICAL_STATE_MODEL,
      parsing,
      gapAnalysis,
      resolvingGaps,
      generatedCode,
    );

    expect(stateCoverage.coveredStates).toEqual(
      expect.arrayContaining(['error', 'failed']),
    );
    expect(stateCoverage.requiredStates).toEqual(['error', 'failed']);
    expect(stateCoverage.missingStates).toEqual([]);
    expect(stateCoverage.label).toBe('2/2');
    expect(
      buildRegenerationReasons(
        DEFAULT_CANONICAL_STATE_MODEL,
        DEFAULT_DESIGN_SYSTEM_CONTEXT,
        parsing,
        resolvingGaps,
        generatedCode,
        stateCoverage,
      ),
    ).toEqual([]);
  });
});
