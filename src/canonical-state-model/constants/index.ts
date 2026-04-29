import {
  CANONICAL_STATE_CODE,
  CANONICAL_STATE_SEVERITY,
  ICanonicalStateModel,
} from '../types';

export const DEFAULT_CANONICAL_STATE_MODEL: ICanonicalStateModel = {
  states: [
    {
      code: CANONICAL_STATE_CODE.DEFAULT,
      coveredAliases: ['default', 'idle', 'unselected', 'closed'],
      description:
        'Baseline rendered state with no transient interaction or outcome applied.',
      requiredAliases: ['default state', 'idle state', 'baseline state'],
      severity: CANONICAL_STATE_SEVERITY.SOFT,
    },
    {
      code: CANONICAL_STATE_CODE.HOVER,
      coveredAliases: ['hover'],
      description: 'Pointer hover treatment.',
      requiredAliases: ['hover state', 'hover'],
      severity: CANONICAL_STATE_SEVERITY.SOFT,
    },
    {
      code: CANONICAL_STATE_CODE.ACTIVE,
      coveredAliases: ['active', 'pressed'],
      description: 'Pressed or active pointer interaction treatment.',
      requiredAliases: ['pressed state', 'active state', 'pressed', 'active'],
      severity: CANONICAL_STATE_SEVERITY.SOFT,
    },
    {
      code: CANONICAL_STATE_CODE.FOCUS_VISIBLE,
      coveredAliases: ['focus visible', 'focus_visible', 'keyboard focus'],
      description: 'Keyboard-visible focus treatment.',
      requiredAliases: [
        'focus visible',
        'focus-visible',
        'keyboard focus state',
      ],
      severity: CANONICAL_STATE_SEVERITY.SOFT,
    },
    {
      code: CANONICAL_STATE_CODE.SELECTED,
      coveredAliases: ['selected', 'selected true'],
      description: 'Selected choice or active card state.',
      requiredAliases: ['selected state', 'selected'],
      severity: CANONICAL_STATE_SEVERITY.HARD,
    },
    {
      code: CANONICAL_STATE_CODE.DISABLED,
      coveredAliases: [
        'disabled',
        'aria disabled',
        'delete disabled',
        'selection disabled',
        'not allowed',
      ],
      description: 'Interaction blocked due to permission or in-flight action.',
      requiredAliases: ['disabled state', 'disabled', 'not allowed'],
      severity: CANONICAL_STATE_SEVERITY.HARD,
    },
    {
      code: CANONICAL_STATE_CODE.LOADING,
      coveredAliases: [
        'loading',
        'in progress',
        'deleting',
        'is deleting',
        'spinner',
        'busy',
        'pending',
      ],
      description:
        'Async work in progress with interaction suppression as needed.',
      requiredAliases: [
        'loading state',
        'in progress state',
        'spinner',
        'deleting in progress',
        'pending state',
      ],
      severity: CANONICAL_STATE_SEVERITY.HARD,
    },
    {
      code: CANONICAL_STATE_CODE.SUCCESS,
      coveredAliases: ['success', 'deleted', 'removed', 'removal', 'completed'],
      description:
        'Successful completion outcome for an async or destructive flow.',
      requiredAliases: [
        'success state',
        'success feedback',
        'deleted state',
        'removed state',
        'deletion success',
      ],
      severity: CANONICAL_STATE_SEVERITY.HARD,
    },
    {
      code: CANONICAL_STATE_CODE.FAILED,
      coveredAliases: ['failed', 'failure', 'delete error', 'retry'],
      description:
        'Failed completion outcome that keeps the user in a recovery path.',
      requiredAliases: [
        'failed state',
        'failure state',
        'failed deletion',
        'retry affordance',
      ],
      severity: CANONICAL_STATE_SEVERITY.HARD,
    },
    {
      code: CANONICAL_STATE_CODE.ERROR,
      coveredAliases: ['error', 'delete error', 'error message'],
      description: 'Inline or local error presentation state.',
      requiredAliases: ['error state', 'error message'],
      severity: CANONICAL_STATE_SEVERITY.HARD,
    },
    {
      code: CANONICAL_STATE_CODE.INVALID,
      coveredAliases: ['invalid', 'validation error', 'blocked invalid action'],
      description: 'Rejected invalid input or invalid action state.',
      requiredAliases: [
        'invalid input state',
        'invalid action state',
        'validation state',
      ],
      severity: CANONICAL_STATE_SEVERITY.HARD,
    },
    {
      code: CANONICAL_STATE_CODE.EMPTY,
      coveredAliases: ['empty', 'missing', 'placeholder', 'no data'],
      description: 'Empty or fallback presentation for missing content.',
      requiredAliases: ['empty state', 'missing field fallback', 'placeholder'],
      severity: CANONICAL_STATE_SEVERITY.SOFT,
    },
    {
      code: CANONICAL_STATE_CODE.EXPIRED,
      coveredAliases: ['expired', 'is expired'],
      description: 'Expired card or outdated validity state.',
      requiredAliases: ['expired state', 'expired card'],
      severity: CANONICAL_STATE_SEVERITY.HARD,
    },
    {
      code: CANONICAL_STATE_CODE.UNKNOWN,
      coveredAliases: ['unknown', 'fallback', 'generic'],
      description: 'Unknown-brand or unknown-data fallback state.',
      requiredAliases: ['unknown brand', 'fallback state'],
      severity: CANONICAL_STATE_SEVERITY.SOFT,
    },
    {
      code: CANONICAL_STATE_CODE.CONFIRMING,
      coveredAliases: [
        'confirm',
        'confirmation',
        'dialog open',
        'alertdialog',
        'modal open',
      ],
      description: 'Confirmation or destructive-dialog open state.',
      requiredAliases: [
        'confirmation state',
        'confirm dialog',
        'confirmation dialog',
        'alertdialog',
      ],
      severity: CANONICAL_STATE_SEVERITY.HARD,
    },
  ],
};
