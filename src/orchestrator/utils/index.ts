import { join } from 'node:path';
import {
  IComponentGenerationValidationFeedback,
  IComponentGenerationStepInput,
  IComponentGenerationStepOutput,
} from '../../component-generation/types';
import {
  IComponentInterfacesStepInput,
  IComponentInterfacesStepOutput,
} from '../../component-interfaces/types';
import { IE2eTestsStepInput, IE2eTestsStepOutput } from '../../e2e-tests/types';
import { IGapAnalysisStepOutput } from '../../gap-analysis/types';
import { IResolvingGapsStepOutput } from '../../resolving-gaps/types';
import {
  RUN_FINAL_COMPONENT_TYPE,
  RUN_STATUS,
  RUN_STEP_CODE,
  RUN_STEP_STATUS,
} from '../../run/constants';
import {
  IRunArtifacts,
  IRunDerivedData,
  IRunResult,
  IRunStepReport,
  IRunStepTokenUsage,
  IRunTokenUsageTotals,
  IRunValidationArtifact,
} from '../../run/types';
import {
  COMPONENT_STATE_POLICY,
  IParsedComponent,
  IParsingStepOutput,
  UI_COMPONENT_TYPE,
} from '../../types';
import {
  IComponentFileReference,
  IUnitTestsStepInput,
  IUnitTestsStepOutput,
} from '../../unit-tests/types';
import { IUserFlowsStepOutput } from '../../user-flows/types';
import {
  IRunValidationStepUseCaseRequest,
  IValidationRegenerationReason,
  IValidationStepOutput,
} from '../../validation/types';
import { IStepTokenUsage } from '../../step/types';
import type { IRunOrchestratorRequest } from '../types';

interface IBuildBaseStepReportParams {
  attempts: number;
  code: RUN_STEP_CODE;
  inputJson: string;
  order: number;
  output: object;
  promptCode: string;
  rawOutput: string;
  targetComponentCode: string | null;
  tokenUsage: IRunStepTokenUsage;
}

export function buildArtifactsFromParsing(
  parsingOutput: IParsingStepOutput,
): IRunArtifacts {
  return {
    componentInterfaces: null,
    e2eTests: null,
    gapAnalysis: null,
    generatedCode: null,
    parsing: parsingOutput,
    resolvingGaps: null,
    unitTests: null,
    userFlows: null,
    validation: null,
  };
}

export function buildArtifactsWithGapAnalysis(
  artifacts: IRunArtifacts,
  gapAnalysisOutput: IGapAnalysisStepOutput,
): IRunArtifacts {
  return {
    ...artifacts,
    gapAnalysis: gapAnalysisOutput,
  };
}

export function buildArtifactsWithResolvingGaps(
  artifacts: IRunArtifacts,
  resolvingGapsOutput: IResolvingGapsStepOutput,
): IRunArtifacts {
  return {
    ...artifacts,
    resolvingGaps: resolvingGapsOutput,
  };
}

export function buildArtifactsWithUserFlows(
  artifacts: IRunArtifacts,
  userFlowsOutput: IUserFlowsStepOutput,
): IRunArtifacts {
  return {
    ...artifacts,
    userFlows: userFlowsOutput,
  };
}

export function buildArtifactsWithComponentInterface(
  artifacts: IRunArtifacts,
  componentInterfaceOutput: IComponentInterfacesStepOutput,
): IRunArtifacts {
  const existingComponents = artifacts.componentInterfaces?.components ?? [];

  return {
    ...artifacts,
    componentInterfaces: {
      components: [...existingComponents, componentInterfaceOutput],
    },
  };
}

export function buildArtifactsWithUnitTest(
  artifacts: IRunArtifacts,
  unitTestOutput: IUnitTestsStepOutput,
): IRunArtifacts {
  const existingComponents = artifacts.unitTests?.components ?? [];

  return {
    ...artifacts,
    unitTests: {
      components: [...existingComponents, unitTestOutput],
    },
  };
}

export function buildArtifactsWithE2eTests(
  artifacts: IRunArtifacts,
  e2eTestsOutput: IE2eTestsStepOutput,
): IRunArtifacts {
  return {
    ...artifacts,
    e2eTests: e2eTestsOutput,
  };
}

export function buildArtifactsWithGeneratedComponent(
  artifacts: IRunArtifacts,
  framework: string,
  generatedComponentOutput: IComponentGenerationStepOutput,
): IRunArtifacts {
  const existingComponents = artifacts.generatedCode?.components ?? [];
  const generatedComponent = {
    componentCode: generatedComponentOutput.componentCode,
    files: generatedComponentOutput.files,
    statesCovered: generatedComponentOutput.statesCovered,
    tokensUsed: generatedComponentOutput.tokensUsed,
  };
  const components = [
    ...existingComponents.filter((component) => {
      return component.componentCode !== generatedComponent.componentCode;
    }),
    generatedComponent,
  ].sort((left, right) => {
    return left.componentCode.localeCompare(right.componentCode);
  });

  return {
    ...artifacts,
    generatedCode: {
      components,
      files: components.flatMap((component) => {
        return component.files;
      }),
      framework,
      statesCovered: deduplicateStrings(
        components.flatMap((component) => {
          return component.statesCovered;
        }),
      ),
      tokensUsed: deduplicateStrings(
        components.flatMap((component) => {
          return component.tokensUsed;
        }),
      ),
    },
  };
}

export function buildArtifactsWithValidation(
  artifacts: IRunArtifacts,
  validationOutput: IRunValidationArtifact,
): IRunArtifacts {
  return {
    ...artifacts,
    validation: validationOutput,
  };
}

export function buildDerivedDataFromParsing(
  parsingOutput: IParsingStepOutput,
): IRunDerivedData {
  const rootComponent = findRootComponent(parsingOutput);

  return {
    constraintDescriptions: parsingOutput.constraints.map((constraint) => {
      return constraint.description;
    }),
    extractionConstraints: parsingOutput.constraints,
    extractionSpecifiedStates: parsingOutput.specifiedStates,
    extractionTokenReferences: parsingOutput.tokenReferences,
    referencedTokenNames: parsingOutput.tokenReferences.map(
      (tokenReference) => {
        return tokenReference.name;
      },
    ),
    rootComponent,
    rootComponentName: rootComponent?.name ?? null,
    rootComponentType: mapRootComponentType(rootComponent?.type),
    specifiedStateNames: parsingOutput.specifiedStates.map((state) => {
      return state.name;
    }),
  };
}

export function buildParsingStepReport(
  request: IRunOrchestratorRequest,
  attempts: number,
  output: IParsingStepOutput,
  rawOutput: string,
  tokenUsage: IRunStepTokenUsage,
): IRunStepReport {
  return buildBaseCompletedStepReport({
    attempts,
    code: RUN_STEP_CODE.PARSING,
    inputJson: JSON.stringify(request),
    order: 1,
    output,
    promptCode: 'parsing',
    rawOutput,
    targetComponentCode: null,
    tokenUsage,
  });
}

export function buildGapAnalysisStepReport(
  request: IRunOrchestratorRequest,
  attempts: number,
  output: IGapAnalysisStepOutput,
  rawOutput: string,
  tokenUsage: IRunStepTokenUsage,
): IRunStepReport {
  return buildBaseCompletedStepReport({
    attempts,
    code: RUN_STEP_CODE.GAP_ANALYSIS,
    inputJson: JSON.stringify({
      componentDescription: request.componentDescription,
    }),
    order: 2,
    output,
    promptCode: 'gap_analysis',
    rawOutput,
    targetComponentCode: null,
    tokenUsage,
  });
}

export function buildResolvingGapsStepReport(
  request: IRunOrchestratorRequest,
  attempts: number,
  output: IResolvingGapsStepOutput,
  rawOutput: string,
  tokenUsage: IRunStepTokenUsage,
): IRunStepReport {
  return buildBaseCompletedStepReport({
    attempts,
    code: RUN_STEP_CODE.RESOLVING_GAPS,
    inputJson: JSON.stringify({
      componentDescription: request.componentDescription,
    }),
    order: 3,
    output,
    promptCode: 'resolving_gaps',
    rawOutput,
    targetComponentCode: null,
    tokenUsage,
  });
}

export function buildUserFlowsStepReport(
  request: IRunOrchestratorRequest,
  attempts: number,
  output: IUserFlowsStepOutput,
  rawOutput: string,
  tokenUsage: IRunStepTokenUsage,
): IRunStepReport {
  return buildBaseCompletedStepReport({
    attempts,
    code: RUN_STEP_CODE.USER_FLOWS,
    inputJson: JSON.stringify({
      componentDescription: request.componentDescription,
    }),
    order: 4,
    output,
    promptCode: 'user_flows',
    rawOutput,
    targetComponentCode: null,
    tokenUsage,
  });
}

export function buildComponentInterfacesStepReport(
  input: IComponentInterfacesStepInput,
  attempts: number,
  output: IComponentInterfacesStepOutput,
  rawOutput: string,
  order: number,
  tokenUsage: IRunStepTokenUsage,
): IRunStepReport {
  return buildBaseCompletedStepReport({
    attempts,
    code: RUN_STEP_CODE.COMPONENT_INTERFACES,
    inputJson: JSON.stringify(input),
    order,
    output,
    promptCode: 'component_interfaces',
    rawOutput,
    targetComponentCode: output.componentCode,
    tokenUsage,
  });
}

export function buildUnitTestsStepReport(
  input: IUnitTestsStepInput,
  attempts: number,
  output: IUnitTestsStepOutput,
  rawOutput: string,
  order: number,
  tokenUsage: IRunStepTokenUsage,
): IRunStepReport {
  return buildBaseCompletedStepReport({
    attempts,
    code: RUN_STEP_CODE.UNIT_TESTS,
    inputJson: JSON.stringify(input),
    order,
    output,
    promptCode: 'unit_tests',
    rawOutput,
    targetComponentCode: output.componentCode,
    tokenUsage,
  });
}

export function buildE2eTestsStepReport(
  input: IE2eTestsStepInput,
  attempts: number,
  output: IE2eTestsStepOutput,
  rawOutput: string,
  order: number,
  tokenUsage: IRunStepTokenUsage,
): IRunStepReport {
  return buildBaseCompletedStepReport({
    attempts,
    code: RUN_STEP_CODE.E2E_TESTS,
    inputJson: JSON.stringify(input),
    order,
    output,
    promptCode: 'e2e_tests',
    rawOutput,
    targetComponentCode: output.rootComponentCode,
    tokenUsage,
  });
}

export function buildComponentGenerationStepReport(
  input: IComponentGenerationStepInput,
  attempts: number,
  output: IComponentGenerationStepOutput,
  rawOutput: string,
  order: number,
  tokenUsage: IRunStepTokenUsage,
): IRunStepReport {
  return buildBaseCompletedStepReport({
    attempts,
    code: RUN_STEP_CODE.COMPONENT_GENERATION,
    inputJson: JSON.stringify(input),
    order,
    output,
    promptCode: 'component_generation',
    rawOutput,
    targetComponentCode: output.componentCode,
    tokenUsage,
  });
}

export function buildValidationStepReport(
  input: IRunValidationStepUseCaseRequest,
  attempts: number,
  output: IValidationStepOutput,
  rawOutput: string,
  order: number,
  tokenUsage: IRunStepTokenUsage,
): IRunStepReport {
  return buildBaseCompletedStepReport({
    attempts,
    code: RUN_STEP_CODE.VALIDATION,
    inputJson: JSON.stringify(input),
    order,
    output,
    promptCode: 'validation',
    rawOutput,
    targetComponentCode: null,
    tokenUsage,
  });
}

export function buildComponentInterfacesStageInput(
  request: IRunOrchestratorRequest,
  parsing: IParsingStepOutput,
  gapAnalysis: IGapAnalysisStepOutput,
  resolvingGaps: IResolvingGapsStepOutput,
  targetComponent: IParsedComponent,
  userFlows: IUserFlowsStepOutput,
): IComponentInterfacesStepInput {
  return {
    componentDescription: request.componentDescription,
    gapAnalysis,
    parsing,
    resolvingGaps,
    targetComponent,
    userFlows,
  };
}

export function buildUnitTestsStageInput(
  input: IUnitTestsStepInput,
): IUnitTestsStepInput {
  return input;
}

export function buildE2eTestsStageInput(
  input: IE2eTestsStepInput,
): IE2eTestsStepInput {
  return input;
}

export function buildComponentGenerationStageInput(
  input: IComponentGenerationStepInput,
): IComponentGenerationStepInput {
  return input;
}

export function buildValidationStageInput(
  input: IRunValidationStepUseCaseRequest,
): IRunValidationStepUseCaseRequest {
  return input;
}

export function buildValidationFeedbackForComponent(
  regenerationReasons: IValidationRegenerationReason[],
  componentCode: string,
): IComponentGenerationValidationFeedback | null {
  const matchingReason = regenerationReasons.find((reason) => {
    return reason.componentCode === componentCode;
  });

  return matchingReason === undefined
    ? null
    : {
        reasons: matchingReason.reasons,
      };
}

export function buildRunResult(
  artifacts: IRunArtifacts,
  derivedData: IRunDerivedData,
): IRunResult {
  const parsing = artifacts.parsing;
  const gapAnalysis = artifacts.gapAnalysis;
  const generatedCode = artifacts.generatedCode;
  const validation = artifacts.validation;
  const rootComponentName = derivedData.rootComponentName;
  const rootComponentType = derivedData.rootComponentType;

  if (
    parsing === null ||
    gapAnalysis === null ||
    generatedCode === null ||
    validation === null ||
    rootComponentName === null ||
    rootComponentType === null
  ) {
    throw new Error('Run result cannot be built from incomplete artifacts');
  }

  return {
    component: {
      business_context: parsing.businessContext,
      name: rootComponentName,
      type: rootComponentType,
    },
    extraction: {
      constraints: derivedData.constraintDescriptions,
      specified_states: derivedData.specifiedStateNames,
      tokens_referenced: derivedData.referencedTokenNames,
    },
    gap_analysis: {
      accessibility_gaps: gapAnalysis.accessibilityGaps,
      missing_states: gapAnalysis.missingStates,
      recommendations: gapAnalysis.recommendations,
      responsive_gaps: gapAnalysis.responsiveGaps,
    },
    generated_code: {
      files: generatedCode.files,
      framework: generatedCode.framework,
      states_covered: generatedCode.statesCovered,
      tokens_used: generatedCode.tokensUsed,
    },
    validation: {
      accessibility_score: validation.accessibilityScore,
      hallucinations_caught: validation.hallucinationsCaught,
      issues_found: validation.issuesFound,
      states_coverage: validation.stateCoverage.label,
      token_compliance: validation.tokenCompliance,
    },
  };
}

export function canBuildRunResult(
  artifacts: IRunArtifacts,
  derivedData: IRunDerivedData,
): boolean {
  return !(
    artifacts.parsing === null ||
    artifacts.gapAnalysis === null ||
    artifacts.generatedCode === null ||
    artifacts.validation === null ||
    derivedData.rootComponentName === null ||
    derivedData.rootComponentType === null
  );
}

export function buildInterruptedRunResult(
  artifacts: IRunArtifacts,
  derivedData: IRunDerivedData,
  issueMessage: string,
): IRunResult {
  if (canBuildRunResult(artifacts, derivedData)) {
    const result = buildRunResult(artifacts, derivedData);

    return {
      ...result,
      validation: {
        ...result.validation,
        issues_found: deduplicateStrings([
          ...result.validation.issues_found,
          issueMessage,
        ]),
      },
    };
  }

  return {
    component: {
      business_context: artifacts.parsing?.businessContext ?? '',
      name: derivedData.rootComponentName ?? 'Unknown component',
      type: derivedData.rootComponentType ?? RUN_FINAL_COMPONENT_TYPE.CARD,
    },
    extraction: {
      constraints: derivedData.constraintDescriptions,
      specified_states: derivedData.specifiedStateNames,
      tokens_referenced: derivedData.referencedTokenNames,
    },
    gap_analysis: {
      accessibility_gaps: artifacts.gapAnalysis?.accessibilityGaps ?? [],
      missing_states: artifacts.gapAnalysis?.missingStates ?? [],
      recommendations: artifacts.gapAnalysis?.recommendations ?? [],
      responsive_gaps: artifacts.gapAnalysis?.responsiveGaps ?? [],
    },
    generated_code: {
      files: artifacts.generatedCode?.files ?? [],
      framework: artifacts.generatedCode?.framework ?? '',
      states_covered: artifacts.generatedCode?.statesCovered ?? [],
      tokens_used: artifacts.generatedCode?.tokensUsed ?? [],
    },
    validation: {
      accessibility_score:
        artifacts.validation?.accessibilityScore ?? 'not_run',
      hallucinations_caught: artifacts.validation?.hallucinationsCaught ?? [],
      issues_found: deduplicateStrings([
        ...(artifacts.validation?.issuesFound ?? []),
        issueMessage,
      ]),
      states_coverage: artifacts.validation?.stateCoverage.label ?? '0/0',
      token_compliance: artifacts.validation?.tokenCompliance ?? true,
    },
  };
}

export function orderComponentsForInterfaces(
  components: IParsedComponent[],
): IParsedComponent[] {
  const dumbComponents = components.filter((component) => {
    return component.statePolicy === COMPONENT_STATE_POLICY.DUMB;
  });
  const smartComponents = components.filter((component) => {
    return component.statePolicy === COMPONENT_STATE_POLICY.SMART;
  });

  return [...dumbComponents, ...smartComponents];
}

export function buildProjectRootPath(
  cwd: string,
  projectDirectory: string,
): string {
  return join(cwd, projectDirectory);
}

export function buildComponentSourceFiles(
  projectRootPath: string,
  components: IParsedComponent[],
): IComponentFileReference[] {
  return components.map((component) => {
    return {
      componentCode: component.code,
      filename: buildComponentSourceFilePath(projectRootPath, component),
    };
  });
}

export function buildComponentSourceFilePath(
  projectRootPath: string,
  component: IParsedComponent,
): string {
  return buildComponentFilePath(projectRootPath, component, '.tsx');
}

export function buildComponentTestFilePath(
  projectRootPath: string,
  component: IParsedComponent,
): string {
  return buildComponentFilePath(projectRootPath, component, '.spec.tsx');
}

export function buildE2eTestFilePath(
  projectRootPath: string,
  component: IParsedComponent,
  fileSuffix: string,
): string {
  return buildComponentFilePath(projectRootPath, component, fileSuffix);
}

export function buildComponentFileName(componentCode: string): string {
  return componentCode
    .split('_')
    .filter((segment) => {
      return segment !== '';
    })
    .map((segment) => {
      return `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`;
    })
    .join('');
}

export function findRootComponent(
  parsingOutput: IParsingStepOutput,
): IParsedComponent | null {
  return (
    parsingOutput.components.find((component) => {
      return component.code === parsingOutput.rootComponentCode;
    }) ?? null
  );
}

export function findComponentInterface(
  componentInterfaces: IComponentInterfacesStepOutput[],
  componentCode: string,
): IComponentInterfacesStepOutput {
  const componentInterface = componentInterfaces.find((item) => {
    return item.componentCode === componentCode;
  });

  if (componentInterface === undefined) {
    throw new Error(
      `Missing component interface artifact for component "${componentCode}"`,
    );
  }

  return componentInterface;
}

export function findComponentSourceFile(
  componentSourceFiles: IComponentFileReference[],
  componentCode: string,
): string {
  const componentSourceFile = componentSourceFiles.find((item) => {
    return item.componentCode === componentCode;
  });

  if (componentSourceFile === undefined) {
    throw new Error(
      `Missing component source file for component "${componentCode}"`,
    );
  }

  return componentSourceFile.filename;
}

export function findUnitTestComponent(
  unitTests: IUnitTestsStepOutput[],
  componentCode: string,
): IUnitTestsStepOutput {
  const unitTestComponent = unitTests.find((item) => {
    return item.componentCode === componentCode;
  });

  if (unitTestComponent === undefined) {
    throw new Error(
      `Missing unit tests artifact for component "${componentCode}"`,
    );
  }

  return unitTestComponent;
}

export function findRelatedDumbComponentsForGeneration(
  components: IParsedComponent[],
  targetComponent: IParsedComponent,
): IParsedComponent[] {
  if (targetComponent.statePolicy !== COMPONENT_STATE_POLICY.SMART) {
    return [];
  }

  return components.filter((component) => {
    return (
      component.parentCode === targetComponent.code &&
      component.statePolicy === COMPONENT_STATE_POLICY.DUMB
    );
  });
}

export function buildRelatedComponentInterfacesForGeneration(
  componentInterfaces: IComponentInterfacesStepOutput[],
  relatedComponents: IParsedComponent[],
): IComponentInterfacesStepOutput[] {
  return relatedComponents.map((component) => {
    return findComponentInterface(componentInterfaces, component.code);
  });
}

export function buildRelatedComponentSourceFilesForGeneration(
  componentSourceFiles: IComponentFileReference[],
  relatedComponents: IParsedComponent[],
): IComponentFileReference[] {
  return relatedComponents.map((component) => {
    return {
      componentCode: component.code,
      filename: findComponentSourceFile(componentSourceFiles, component.code),
    };
  });
}

export function appendStepReport(
  steps: IRunStepReport[],
  stepReport: IRunStepReport,
): IRunStepReport[] {
  return [...steps, stepReport];
}

export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error('Unknown orchestrator error');
}

export function extractCauseMessage(error: Error): string | null {
  if (!(error.cause instanceof Error)) {
    return null;
  }

  return extractCauseMessage(error.cause) ?? error.cause.message;
}

export function buildEmptyStepTokenUsage(): IRunStepTokenUsage {
  return {
    cachedInputTokens: null,
    inputTokens: null,
    outputTokens: null,
    reasoningTokens: null,
    totalTokens: null,
  };
}

export function buildRunStepTokenUsage(
  tokenUsage: IStepTokenUsage,
): IRunStepTokenUsage {
  return {
    cachedInputTokens: tokenUsage.cachedInputTokens,
    inputTokens: tokenUsage.inputTokens,
    outputTokens: tokenUsage.outputTokens,
    reasoningTokens: tokenUsage.reasoningTokens,
    totalTokens: tokenUsage.totalTokens,
  };
}

export function serializeOutputJson(output: object): string {
  return JSON.stringify(output);
}

export function buildTokenUsageTotals(
  steps: IRunStepReport[],
): IRunTokenUsageTotals {
  return steps.reduce<IRunTokenUsageTotals>(
    (totals, step) => {
      return {
        cachedInputTokens:
          totals.cachedInputTokens + (step.tokenUsage.cachedInputTokens ?? 0),
        inputTokens: totals.inputTokens + (step.tokenUsage.inputTokens ?? 0),
        outputTokens: totals.outputTokens + (step.tokenUsage.outputTokens ?? 0),
        reasoningTokens:
          totals.reasoningTokens + (step.tokenUsage.reasoningTokens ?? 0),
        totalTokens: totals.totalTokens + (step.tokenUsage.totalTokens ?? 0),
      };
    },
    {
      cachedInputTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      reasoningTokens: 0,
      totalTokens: 0,
    },
  );
}

export function mapRootComponentType(
  componentType: UI_COMPONENT_TYPE | undefined,
): RUN_FINAL_COMPONENT_TYPE | null {
  if (componentType === undefined) {
    return null;
  }

  switch (componentType) {
    case UI_COMPONENT_TYPE.CARD:
      return RUN_FINAL_COMPONENT_TYPE.CARD;
    case UI_COMPONENT_TYPE.FORM:
      return RUN_FINAL_COMPONENT_TYPE.FORM;
    case UI_COMPONENT_TYPE.MODAL:
      return RUN_FINAL_COMPONENT_TYPE.MODAL;
    case UI_COMPONENT_TYPE.PAGE:
      return RUN_FINAL_COMPONENT_TYPE.PAGE;
    case UI_COMPONENT_TYPE.TABLE:
      return RUN_FINAL_COMPONENT_TYPE.TABLE;
    case UI_COMPONENT_TYPE.WIZARD:
      return RUN_FINAL_COMPONENT_TYPE.WIZARD;
    default:
      return null;
  }
}

export function buildRunStartedUpdate(runId: string): {
  id: string;
  startedAt: Date;
  status: RUN_STATUS;
} {
  return {
    id: runId,
    startedAt: new Date(),
    status: RUN_STATUS.RUNNING,
  };
}

export function buildRunCompletedUpdate(runId: string): {
  completedAt: Date;
  id: string;
  status: RUN_STATUS;
} {
  return {
    completedAt: new Date(),
    id: runId,
    status: RUN_STATUS.COMPLETED,
  };
}

export function buildRunInterruptedUpdate(runId: string): {
  completedAt: Date;
  errorDetails: null;
  errorMessage: null;
  id: string;
  status: RUN_STATUS;
} {
  return {
    completedAt: new Date(),
    errorDetails: null,
    errorMessage: null,
    id: runId,
    status: RUN_STATUS.INTERRUPTED,
  };
}

export function buildRunFailedUpdate(
  runId: string,
  error: Error,
): {
  completedAt: Date;
  errorDetails: string | null;
  errorMessage: string;
  id: string;
  status: RUN_STATUS;
} {
  return {
    completedAt: new Date(),
    errorDetails: extractCauseMessage(error),
    errorMessage: error.message,
    id: runId,
    status: RUN_STATUS.FAILED,
  };
}

function buildBaseCompletedStepReport(
  params: IBuildBaseStepReportParams,
): IRunStepReport {
  const now = new Date();

  return {
    attempts: params.attempts,
    code: params.code,
    completedAt: now,
    durationMs: null,
    errorDetails: null,
    errorMessage: null,
    inputJson: params.inputJson,
    model: {
      model: null,
      provider: 'openai',
    },
    order: params.order,
    outputJson: serializeOutputJson(params.output),
    prompt: {
      code: params.promptCode,
      variant: 'control',
      version: null,
    },
    rawOutput: params.rawOutput,
    startedAt: now,
    status: RUN_STEP_STATUS.COMPLETED,
    targetComponentCode: params.targetComponentCode,
    tokenUsage: params.tokenUsage,
  };
}

function deduplicateStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

function buildComponentFilePath(
  projectRootPath: string,
  component: IParsedComponent,
  fileSuffix: string,
): string {
  const componentFileName = buildComponentFileName(component.code);

  return join(
    projectRootPath,
    'src',
    'components',
    componentFileName,
    `${componentFileName}${fileSuffix}`,
  );
}
