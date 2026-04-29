import {
  extractCoveredCanonicalStates,
  extractRequiredCanonicalStates,
  getHardBlockingCanonicalStates,
  getSoftAdvisoryCanonicalStates,
} from '../../canonical-state-model/utils';
import { ICanonicalStateModel } from '../../canonical-state-model/types';
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
  canonicalStateModel: ICanonicalStateModel,
  parsing: IParsingStepOutput,
  gapAnalysis: IGapAnalysisStepOutput,
  resolvingGaps: IResolvingGapsStepOutput,
  generatedCode: IRunGeneratedCodeArtifact,
  unitTests: { components: IUnitTestsStepOutput[] },
  e2eTests: IE2eTestsStepOutput | null,
): IValidationStateCoverageSummary {
  const requiredStates = deduplicateStrings([
    ...extractRequiredCanonicalStates(
      canonicalStateModel,
      parsing.specifiedStates.map((state) => {
        return state.name;
      }),
    ),
    ...extractRequiredCanonicalStates(
      canonicalStateModel,
      gapAnalysis.missingStates,
    ),
    ...extractRequiredCanonicalStates(
      canonicalStateModel,
      resolvingGaps.decisions.flatMap((decision) => {
        return [decision.decision, decision.sourceGap];
      }),
    ),
  ]);
  const coveredStates = deduplicateStrings([
    ...buildNormalizedCoveredStates(
      canonicalStateModel,
      generatedCode.statesCovered,
    ),
    ...unitTests.components.flatMap((component) => {
      return buildNormalizedCoveredStates(
        canonicalStateModel,
        component.coveredStates,
      );
    }),
    ...buildNormalizedCoveredStates(
      canonicalStateModel,
      e2eTests?.coveredStates ?? [],
    ),
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
  canonicalStateModel: ICanonicalStateModel,
  hallucinations: string[],
  stateCoverage: IValidationStateCoverageSummary,
): string[] {
  const issues: string[] = [];
  const missingHardStates = getHardBlockingCanonicalStates(
    canonicalStateModel,
    stateCoverage.missingStates,
  );
  const missingSoftStates = getSoftAdvisoryCanonicalStates(
    canonicalStateModel,
    stateCoverage.missingStates,
  );

  if (hallucinations.length > 0) {
    issues.push(
      `Unknown design-system tokens or CSS variables found: ${hallucinations.join(', ')}`,
    );
  }

  if (missingHardStates.length > 0) {
    issues.push(`Missing required states: ${missingHardStates.join(', ')}`);
  }

  if (missingSoftStates.length > 0) {
    issues.push(
      `Additional interactive states are not explicitly covered: ${missingSoftStates.join(', ')}`,
    );
  }

  return issues;
}

export function buildTokenCompliance(hallucinations: string[]): boolean {
  return hallucinations.length === 0;
}

export function buildRegenerationReasons(
  canonicalStateModel: ICanonicalStateModel,
  designSystemContext: IDesignSystemContext,
  parsing: IParsingStepOutput,
  resolvingGaps: IResolvingGapsStepOutput,
  generatedCode: IRunGeneratedCodeArtifact,
  stateCoverage: IValidationStateCoverageSummary,
): IValidationRegenerationReason[] {
  const issuesByComponent = new Map<string, Set<string>>();
  const missingHardStates = getHardBlockingCanonicalStates(
    canonicalStateModel,
    stateCoverage.missingStates,
  );
  const stateCoverageIssue =
    missingHardStates.length > 0
      ? `Missing required states: ${missingHardStates.join(', ')}`
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
      canonicalStateModel,
      parsing,
      resolvingGaps,
      missingHardStates,
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
  canonicalStateModel: ICanonicalStateModel,
  parsing: IParsingStepOutput,
  resolvingGaps: IResolvingGapsStepOutput,
  missingStates: string[],
): string[] {
  const affectedComponentCodes = new Set<string>();

  for (const state of parsing.specifiedStates) {
    if (
      extractRequiredCanonicalStates(canonicalStateModel, [state.name]).some(
        (requiredState) => {
          return missingStates.includes(requiredState);
        },
      )
    ) {
      affectedComponentCodes.add(state.componentCode);
    }
  }

  for (const decision of resolvingGaps.decisions) {
    const candidateStates = extractRequiredCanonicalStates(
      canonicalStateModel,
      [decision.decision, decision.sourceGap],
    );

    for (const missingState of missingStates) {
      if (candidateStates.includes(missingState)) {
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

function buildNormalizedCoveredStates(
  canonicalStateModel: ICanonicalStateModel,
  values: string[],
): string[] {
  return deduplicateStrings(
    extractCoveredCanonicalStates(canonicalStateModel, values),
  );
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
