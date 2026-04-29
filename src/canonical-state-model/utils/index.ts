import { CANONICAL_STATE_SEVERITY, ICanonicalStateModel } from '../types';

export function extractCoveredCanonicalStates(
  canonicalStateModel: ICanonicalStateModel,
  values: string[],
): string[] {
  return extractCanonicalStates(canonicalStateModel, values, 'coveredAliases');
}

export function extractRequiredCanonicalStates(
  canonicalStateModel: ICanonicalStateModel,
  values: string[],
): string[] {
  return extractCanonicalStates(canonicalStateModel, values, 'requiredAliases');
}

export function getHardBlockingCanonicalStates(
  canonicalStateModel: ICanonicalStateModel,
  states: string[],
): string[] {
  return states.filter((state) => {
    return (
      getStateSeverity(canonicalStateModel, state) ===
      CANONICAL_STATE_SEVERITY.HARD
    );
  });
}

export function getSoftAdvisoryCanonicalStates(
  canonicalStateModel: ICanonicalStateModel,
  states: string[],
): string[] {
  return states.filter((state) => {
    return (
      getStateSeverity(canonicalStateModel, state) ===
      CANONICAL_STATE_SEVERITY.SOFT
    );
  });
}

export function normalizeCanonicalStateValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_state$/, '');
}

function extractCanonicalStates(
  canonicalStateModel: ICanonicalStateModel,
  values: string[],
  aliasField: 'coveredAliases' | 'requiredAliases',
): string[] {
  const matchedStates = new Set<string>();

  for (const value of values) {
    const normalizedValue = normalizeCanonicalStateValue(value);

    for (const state of canonicalStateModel.states) {
      if (
        state[aliasField].some((alias) => {
          return matchesAlias(normalizedValue, alias);
        })
      ) {
        matchedStates.add(state.code);
      }
    }
  }

  return Array.from(matchedStates).sort();
}

function getStateSeverity(
  canonicalStateModel: ICanonicalStateModel,
  stateCode: string,
): CANONICAL_STATE_SEVERITY | null {
  const matchingState = canonicalStateModel.states.find((state) => {
    return String(state.code) === stateCode;
  });

  return matchingState?.severity ?? null;
}

function matchesAlias(normalizedValue: string, alias: string): boolean {
  const normalizedAlias = normalizeCanonicalStateValue(alias);

  if (normalizedAlias === '') {
    return false;
  }

  return new RegExp(`(?:^|_)${escapeRegExp(normalizedAlias)}(?:_|$)`).test(
    normalizedValue,
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
