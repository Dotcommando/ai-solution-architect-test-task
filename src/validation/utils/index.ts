import {
  extractCoveredCanonicalStates,
  extractRequiredCanonicalStates,
  getHardBlockingCanonicalStates,
  getSoftAdvisoryCanonicalStates,
} from '../../canonical-state-model/utils';
import { ICanonicalStateModel } from '../../canonical-state-model/types';
import { IComponentInterfacesStepOutput } from '../../component-interfaces/types';
import { IDesignSystemContext } from '../../design-system/types';
import { IGapAnalysisStepOutput } from '../../gap-analysis/types';
import {
  IRunGeneratedCodeArtifact,
  IRunGeneratedComponentArtifact,
} from '../../run/types';
import { IResolvingGapsStepOutput } from '../../resolving-gaps/types';
import {
  COMPONENT_INTERACTION_TYPE,
  IParsedComponent,
  IParsingStepOutput,
  UI_COMPONENT_TYPE,
} from '../../types';
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
): IValidationStateCoverageSummary {
  const requiredStates = buildRequiredStates(
    canonicalStateModel,
    parsing,
    gapAnalysis,
    resolvingGaps,
  );
  const coveredStates = deduplicateStrings([
    ...buildNormalizedCoveredStates(
      canonicalStateModel,
      generatedCode.statesCovered,
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

export function buildDeterministicContractCompatibilityIssues(
  componentInterfaces: {
    components: IComponentInterfacesStepOutput[];
  },
  generatedCode: IRunGeneratedCodeArtifact,
): string[] {
  const issues = new Set<string>();
  const callbackNames = extractKnownCallbackNames(componentInterfaces);

  for (const componentInterface of componentInterfaces.components) {
    const generatedComponent = generatedCode.components.find((component) => {
      return component.componentCode === componentInterface.componentCode;
    });

    if (generatedComponent === undefined) {
      continue;
    }

    const callbackFields = [
      ...componentInterface.accepts,
      ...componentInterface.returns,
    ].filter((field) => {
      return isCallbackFieldName(field.name);
    });

    for (const callbackField of callbackFields) {
      const isCallbackUsed = generatedComponent.files.some((file) => {
        return isCallbackInvoked(file.content, callbackField.name);
      });

      if (!isCallbackUsed) {
        issues.add(
          `${componentInterface.componentCode}: callback \`${callbackField.name}\` from the interface is never invoked in generated files.`,
        );
      }
    }
  }

  for (const component of generatedCode.components) {
    for (const callbackName of callbackNames) {
      if (
        component.files.some((file) => {
          return containsNoOpCallbackProp(file.content, callbackName);
        })
      ) {
        issues.add(
          `${component.componentCode}: passes a no-op handler for \`${callbackName}\`, which breaks callback wiring.`,
        );
      }
    }
  }

  return Array.from(issues).sort();
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
    const component = findParsedComponent(parsing, state.componentCode);
    const requiredStates = extractCoveredCanonicalStates(canonicalStateModel, [
      state.name,
    ]);

    if (
      component !== null &&
      requiredStates.some((requiredState) => {
        return (
          missingStates.includes(requiredState) &&
          canComponentOwnCanonicalState(component, requiredState)
        );
      })
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
          const component = findParsedComponent(parsing, componentCode);

          if (
            component !== null &&
            canComponentOwnCanonicalState(component, missingState)
          ) {
            affectedComponentCodes.add(componentCode);
          }
        }
      }
    }
  }

  if (affectedComponentCodes.size === 0 && parsing.rootComponentCode !== '') {
    const rootComponent = findParsedComponent(
      parsing,
      parsing.rootComponentCode,
    );

    for (const missingState of missingStates) {
      if (
        rootComponent !== null &&
        canComponentOwnCanonicalState(rootComponent, missingState)
      ) {
        affectedComponentCodes.add(parsing.rootComponentCode);
      }
    }
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

function buildRequiredStates(
  canonicalStateModel: ICanonicalStateModel,
  parsing: IParsingStepOutput,
  gapAnalysis: IGapAnalysisStepOutput,
  resolvingGaps: IResolvingGapsStepOutput,
): string[] {
  const explicitRequiredStates = deduplicateStrings(
    extractCoveredCanonicalStates(
      canonicalStateModel,
      parsing.specifiedStates.map((state) => {
        return state.name;
      }),
    ),
  );
  const inferredRequiredStates = deduplicateStrings([
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

  return deduplicateStrings([
    ...explicitRequiredStates,
    ...inferredRequiredStates.filter((state) => {
      return shouldTreatInferredStateAsRequired(
        parsing,
        explicitRequiredStates,
        state,
      );
    }),
  ]);
}

function extractKnownCallbackNames(componentInterfaces: {
  components: IComponentInterfacesStepOutput[];
}): string[] {
  const callbackNames = new Set<string>();

  for (const componentInterface of componentInterfaces.components) {
    for (const field of [
      ...componentInterface.accepts,
      ...componentInterface.returns,
    ]) {
      if (isCallbackFieldName(field.name)) {
        callbackNames.add(field.name);
      }
    }
  }

  return Array.from(callbackNames).sort();
}

function isCallbackFieldName(name: string): boolean {
  return /^on_[a-z0-9_]+$/i.test(name);
}

function isCallbackInvoked(content: string, callbackName: string): boolean {
  const invocationPatterns = [
    new RegExp(`\\b${escapeRegExp(callbackName)}\\s*\\(`),
    new RegExp(`\\.${escapeRegExp(callbackName)}\\s*\\(`),
  ];

  return invocationPatterns.some((pattern) => {
    return pattern.test(content);
  });
}

function containsNoOpCallbackProp(
  content: string,
  callbackName: string,
): boolean {
  const pattern = new RegExp(
    `${escapeRegExp(callbackName)}=\\{\\s*(?:\\([^)]*\\)|[a-zA-Z0-9_]+)?\\s*=>\\s*\\{\\s*(?:(?:/\\*[\\s\\S]*?\\*/)|(?://[^\\n]*\\n?)|\\s)*\\}\\s*\\}`,
    'm',
  );

  return pattern.test(content);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function shouldTreatInferredStateAsRequired(
  parsing: IParsingStepOutput,
  explicitRequiredStates: string[],
  state: string,
): boolean {
  if (explicitRequiredStates.includes(state)) {
    return true;
  }

  if (state === 'selected') {
    return parsing.interactions.some((interaction) => {
      return interaction.type === COMPONENT_INTERACTION_TYPE.SELECT;
    });
  }

  if (state === 'confirming') {
    return (
      parsing.interactions.some((interaction) => {
        return (
          interaction.type === COMPONENT_INTERACTION_TYPE.DELETE ||
          interaction.type === COMPONENT_INTERACTION_TYPE.PICK_FILE
        );
      }) ||
      parsing.components.some((component) => {
        return canComponentOwnCanonicalState(component, state);
      })
    );
  }

  return true;
}

function findParsedComponent(
  parsing: IParsingStepOutput,
  componentCode: string,
): IParsedComponent | null {
  return (
    parsing.components.find((component) => {
      return component.code === componentCode;
    }) ?? null
  );
}

function canComponentOwnCanonicalState(
  component: IParsedComponent,
  state: string,
): boolean {
  switch (state) {
    case 'selected':
      return [
        UI_COMPONENT_TYPE.ACTION,
        UI_COMPONENT_TYPE.BUTTON,
        UI_COMPONENT_TYPE.CARD,
        UI_COMPONENT_TYPE.FIELD,
        UI_COMPONENT_TYPE.FILE_UPLOAD,
        UI_COMPONENT_TYPE.FORM,
        UI_COMPONENT_TYPE.TABLE,
        UI_COMPONENT_TYPE.WIZARD,
      ].includes(component.type);
    case 'confirming':
      return [
        UI_COMPONENT_TYPE.ACTION,
        UI_COMPONENT_TYPE.BUTTON,
        UI_COMPONENT_TYPE.CARD,
        UI_COMPONENT_TYPE.FILE_UPLOAD,
        UI_COMPONENT_TYPE.FORM,
        UI_COMPONENT_TYPE.MODAL,
        UI_COMPONENT_TYPE.PAGE,
        UI_COMPONENT_TYPE.WIZARD,
      ].includes(component.type);
    default:
      return true;
  }
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
