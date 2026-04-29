import { IComponentInterfacesStepOutput } from '../../component-interfaces/types';
import { IDesignSystemContext } from '../../design-system/types';
import { IE2eTestsStepOutput } from '../../e2e-tests/types';
import { IGapAnalysisStepOutput } from '../../gap-analysis/types';
import {
  IRunGeneratedCodeArtifact,
  IRunGeneratedComponentArtifact,
} from '../../run/types';
import { IResolvingGapsStepOutput } from '../../resolving-gaps/types';
import { IParsingStepOutput } from '../../types';
import { IUnitTestsStepOutput } from '../../unit-tests/types';
import { IValidationRegenerationReason } from '../types';

export interface IValidationStateCoverageSummary {
  coveredCount: number;
  coveredStates: string[];
  label: string;
  missingStates: string[];
  requiredStates: string[];
  totalCount: number;
}

const STATE_KEYWORDS = [
  'approved',
  'disabled',
  'empty',
  'error',
  'failed',
  'hover',
  'invalid',
  'loading',
  'pending',
  'rejected',
  'selected',
  'success',
  'validation',
];

export function buildDetectedHallucinations(
  designSystemContext: IDesignSystemContext,
  generatedCode: IRunGeneratedCodeArtifact,
): string[] {
  const hallucinations = new Set<string>();

  for (const component of generatedCode.components) {
    for (const hallucination of buildDetectedHallucinationsForComponent(
      designSystemContext,
      component,
    )) {
      hallucinations.add(hallucination);
    }
  }

  return Array.from(hallucinations).sort();
}

export function buildStateCoverageSummary(
  parsing: IParsingStepOutput,
  gapAnalysis: IGapAnalysisStepOutput,
  resolvingGaps: IResolvingGapsStepOutput,
  generatedCode: IRunGeneratedCodeArtifact,
  unitTests: { components: IUnitTestsStepOutput[] },
  e2eTests: IE2eTestsStepOutput | null,
): IValidationStateCoverageSummary {
  const requiredStates = deduplicateStrings([
    ...parsing.specifiedStates.map((state) => {
      return normalizeStateName(state.name);
    }),
    ...extractStateNamesFromStrings(gapAnalysis.missingStates),
    ...extractStateNamesFromStrings(
      resolvingGaps.decisions.flatMap((decision) => {
        return [decision.decision, decision.sourceGap];
      }),
    ),
  ]);
  const coveredStates = deduplicateStrings([
    ...generatedCode.statesCovered.map(normalizeStateName),
    ...unitTests.components.flatMap((component) => {
      return component.coveredStates.map(normalizeStateName);
    }),
    ...(e2eTests?.coveredStates ?? []).map(normalizeStateName),
  ]);
  const missingStates = requiredStates.filter((state) => {
    return !coveredStates.includes(state);
  });
  const coveredCount = requiredStates.length - missingStates.length;
  const totalCount = requiredStates.length;

  return {
    coveredCount,
    coveredStates,
    label: `${coveredCount}/${totalCount}`,
    missingStates,
    requiredStates,
    totalCount,
  };
}

export function buildDeterministicValidationIssues(
  hallucinations: string[],
  stateCoverage: IValidationStateCoverageSummary,
): string[] {
  const issues: string[] = [];

  if (hallucinations.length > 0) {
    issues.push(
      `Unknown design-system tokens or CSS variables found: ${hallucinations.join(', ')}`,
    );
  }

  if (stateCoverage.missingStates.length > 0) {
    issues.push(
      `Missing required states: ${stateCoverage.missingStates.join(', ')}`,
    );
  }

  return issues;
}

export function buildTokenCompliance(hallucinations: string[]): boolean {
  return hallucinations.length === 0;
}

export function buildRegenerationReasons(
  designSystemContext: IDesignSystemContext,
  parsing: IParsingStepOutput,
  resolvingGaps: IResolvingGapsStepOutput,
  generatedCode: IRunGeneratedCodeArtifact,
  stateCoverage: IValidationStateCoverageSummary,
): IValidationRegenerationReason[] {
  const issuesByComponent = new Map<string, Set<string>>();
  const stateCoverageIssue =
    stateCoverage.missingStates.length > 0
      ? `Missing required states: ${stateCoverage.missingStates.join(', ')}`
      : null;

  for (const component of generatedCode.components) {
    const hallucinations = buildDetectedHallucinationsForComponent(
      designSystemContext,
      component,
    );

    if (hallucinations.length > 0) {
      issuesByComponent.set(
        component.componentCode,
        new Set([
          `Unknown design-system tokens or CSS variables found: ${hallucinations.join(', ')}`,
        ]),
      );
    }
  }

  if (stateCoverageIssue !== null) {
    for (const componentCode of findStateCoverageAffectedComponentCodes(
      parsing,
      resolvingGaps,
      stateCoverage.missingStates,
    )) {
      const existingIssues = issuesByComponent.get(componentCode) ?? new Set();

      existingIssues.add(stateCoverageIssue);
      issuesByComponent.set(componentCode, existingIssues);
    }
  }

  return Array.from(issuesByComponent.entries())
    .map(([componentCode, reasons]) => {
      return {
        componentCode,
        reasons: Array.from(reasons),
      };
    })
    .sort((left, right) => {
      return left.componentCode.localeCompare(right.componentCode);
    });
}

export function buildEmptyContractCompatibilityIssues(componentInterfaces: {
  components: IComponentInterfacesStepOutput[];
}): string[] {
  return componentInterfaces.components.length === 0
    ? ['No component interfaces were available for validation.']
    : [];
}

function extractCssVariables(content: string): string[] {
  const cssVariables = new Set<string>();
  const cssVariablePattern = /var\(\s*(--[A-Za-z0-9-_]+)\s*(?:,[^)]+)?\)/g;

  for (const match of content.matchAll(cssVariablePattern)) {
    const cssVariable = match[1];

    if (cssVariable !== undefined) {
      cssVariables.add(cssVariable);
    }
  }

  return Array.from(cssVariables);
}

function buildDetectedHallucinationsForComponent(
  designSystemContext: IDesignSystemContext,
  component: IRunGeneratedComponentArtifact,
): string[] {
  const knownTokens = new Set(designSystemContext.knownTokens);
  const hallucinations = new Set<string>();

  for (const token of component.tokensUsed) {
    if (!knownTokens.has(token)) {
      hallucinations.add(token);
    }
  }

  for (const file of component.files) {
    for (const cssVariable of extractCssVariables(file.content)) {
      if (!knownTokens.has(cssVariable)) {
        hallucinations.add(cssVariable);
      }
    }
  }

  return Array.from(hallucinations).sort();
}

function findStateCoverageAffectedComponentCodes(
  parsing: IParsingStepOutput,
  resolvingGaps: IResolvingGapsStepOutput,
  missingStates: string[],
): string[] {
  const affectedComponentCodes = new Set<string>();

  for (const state of parsing.specifiedStates) {
    const normalizedStateName = normalizeStateName(state.name);

    if (missingStates.includes(normalizedStateName)) {
      affectedComponentCodes.add(state.componentCode);
    }
  }

  for (const decision of resolvingGaps.decisions) {
    const candidateValues = [decision.decision, decision.sourceGap].map(
      normalizeStateName,
    );

    for (const missingState of missingStates) {
      if (
        candidateValues.some((candidateValue) => {
          return candidateValue.includes(missingState);
        })
      ) {
        for (const componentCode of decision.affectedComponentCodes) {
          affectedComponentCodes.add(componentCode);
        }
      }
    }
  }

  if (affectedComponentCodes.size === 0 && parsing.rootComponentCode !== '') {
    affectedComponentCodes.add(parsing.rootComponentCode);
  }

  return Array.from(affectedComponentCodes).sort();
}

function extractStateNamesFromStrings(values: string[]): string[] {
  const extractedStates = new Set<string>();

  for (const value of values) {
    const normalizedValue = normalizeStateName(value);
    const stateMatch = normalizedValue.match(
      /([a-z0-9_]+)(?:_state|_states)?(?:_is|_are|_was|_were|_not|$)/,
    );

    if (stateMatch !== null) {
      const stateName = stateMatch[1];

      if (stateName !== undefined && STATE_KEYWORDS.includes(stateName)) {
        extractedStates.add(stateName);
      }
    }

    for (const keyword of STATE_KEYWORDS) {
      if (normalizedValue.includes(keyword)) {
        extractedStates.add(keyword);
      }
    }
  }

  return Array.from(extractedStates);
}

function normalizeStateName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_state$/, '');
}

function deduplicateStrings(values: string[]): string[] {
  return Array.from(
    new Set(
      values.filter((value) => {
        return value !== '';
      }),
    ),
  ).sort();
}
