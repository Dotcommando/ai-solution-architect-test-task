import {
  IParsedComponent,
  IParsedConstraint,
  IParsingStepOutput,
  IParsedComponentState,
  IParsedTokenReference,
} from '../../types';
import {
  RUN_FINAL_COMPONENT_TYPE,
  RUN_STATUS,
  RUN_STEP_CODE,
  RUN_STEP_STATUS,
  RUN_TEST_TYPE,
  RUN_USER_FLOW_KIND,
} from '../constants';

export interface IRunInput {
  componentDescription: string;
  figmaUrl: string | null;
  screenshotUrl: string | null;
}

export interface IRunStepTokenUsage {
  cachedInputTokens: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  reasoningTokens: number | null;
  totalTokens: number | null;
}

export interface IRunStepPromptReference {
  code: string;
  variant: string;
  version: number | null;
}

export interface IRunStepModelReference {
  model: string | null;
  provider: string;
}

export interface IRunStepReport {
  attempts: number;
  code: RUN_STEP_CODE;
  completedAt: Date | null;
  durationMs: number | null;
  errorDetails: string | null;
  errorMessage: string | null;
  inputJson: string;
  model: IRunStepModelReference;
  order: number;
  outputJson: string | null;
  prompt: IRunStepPromptReference;
  rawOutput: string | null;
  startedAt: Date | null;
  status: RUN_STEP_STATUS;
  targetComponentCode: string | null;
  tokenUsage: IRunStepTokenUsage;
}

export interface IRunTokenUsageTotals {
  cachedInputTokens: number;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  totalTokens: number;
}

export interface IRunGapAnalysisArtifact {
  accessibilityGaps: string[];
  missingStates: string[];
  recommendations: string[];
  responsiveGaps: string[];
}

export interface IRunResolvedGapDecisionArtifact {
  affectedComponentCodes: string[];
  code: string;
  decision: string;
  rationale: string;
  sourceGap: string;
}

export interface IRunResolvingGapsArtifact {
  decisions: IRunResolvedGapDecisionArtifact[];
}

export interface IRunUserFlowStepArtifact {
  action: string;
  code: string;
  componentCode: string | null;
  expectedResult: string;
  inputData: string | null;
}

export interface IRunUserFlowArtifact {
  code: string;
  completionCriteria: string;
  kind: RUN_USER_FLOW_KIND;
  name: string;
  steps: IRunUserFlowStepArtifact[];
}

export interface IRunUserFlowsArtifact {
  flows: IRunUserFlowArtifact[];
}

export interface IRunComponentInterfaceFieldArtifact {
  description: string;
  name: string;
  required: boolean;
  type: string;
}

export interface IRunComponentInterfaceArtifact {
  accepts: IRunComponentInterfaceFieldArtifact[];
  componentCode: string;
  componentName: string;
  returns: IRunComponentInterfaceFieldArtifact[];
}

export interface IRunComponentInterfacesArtifact {
  components: IRunComponentInterfaceArtifact[];
}

export interface IRunTestCaseArtifact {
  assertions: string[];
  code: string;
  componentCode: string | null;
  description: string;
  setup: string;
  testType: RUN_TEST_TYPE;
  title: string;
}

export interface IRunUnitTestFileArtifact {
  content: string;
  filename: string;
}

export interface IRunUnitTestComponentArtifact {
  componentCode: string;
  componentName: string;
  coveredBehaviors: string[];
  coveredStates: string[];
  files: IRunUnitTestFileArtifact[];
}

export interface IRunUnitTestsArtifact {
  components: IRunUnitTestComponentArtifact[];
}

export interface IRunE2eTestsArtifact {
  coveredBehaviors: string[];
  coveredComponentCodes: string[];
  coveredFlowCodes: string[];
  coveredStates: string[];
  files: IRunGeneratedCodeFileArtifact[];
  rootComponentCode: string;
  rootComponentName: string;
}

export interface IRunGeneratedCodeFileArtifact {
  content: string;
  filename: string;
}

export interface IRunGeneratedComponentArtifact {
  componentCode: string;
  files: IRunGeneratedCodeFileArtifact[];
  statesCovered: string[];
  tokensUsed: string[];
}

export interface IRunGeneratedCodeArtifact {
  components: IRunGeneratedComponentArtifact[];
  files: IRunGeneratedCodeFileArtifact[];
  framework: string;
  statesCovered: string[];
  tokensUsed: string[];
}

export interface IRunValidationStateCoverageArtifact {
  coveredCount: number;
  label: string;
  totalCount: number;
}

export interface IRunValidationArtifact {
  accessibilityScore: string;
  contractCompatibilityIssues: string[];
  hallucinationsCaught: string[];
  issuesFound: string[];
  stateCoverage: IRunValidationStateCoverageArtifact;
  tokenCompliance: boolean;
}

export interface IRunArtifacts {
  componentInterfaces: IRunComponentInterfacesArtifact | null;
  generatedCode: IRunGeneratedCodeArtifact | null;
  gapAnalysis: IRunGapAnalysisArtifact | null;
  e2eTests: IRunE2eTestsArtifact | null;
  parsing: IParsingStepOutput | null;
  resolvingGaps: IRunResolvingGapsArtifact | null;
  unitTests: IRunUnitTestsArtifact | null;
  userFlows: IRunUserFlowsArtifact | null;
  validation: IRunValidationArtifact | null;
}

export interface IRunResultComponent {
  business_context: string;
  name: string;
  type: RUN_FINAL_COMPONENT_TYPE;
}

export interface IRunResultExtraction {
  constraints: string[];
  specified_states: string[];
  tokens_referenced: string[];
}

export interface IRunResultGapAnalysis {
  accessibility_gaps: string[];
  missing_states: string[];
  recommendations: string[];
  responsive_gaps: string[];
}

export interface IRunResultGeneratedCodeFile {
  content: string;
  filename: string;
}

export interface IRunResultGeneratedCode {
  files: IRunResultGeneratedCodeFile[];
  framework: string;
  states_covered: string[];
  tokens_used: string[];
}

export interface IRunResultValidation {
  accessibility_score: string;
  hallucinations_caught: string[];
  issues_found: string[];
  states_coverage: string;
  token_compliance: boolean;
}

export interface IRunResult {
  component: IRunResultComponent;
  extraction: IRunResultExtraction;
  gap_analysis: IRunResultGapAnalysis;
  generated_code: IRunResultGeneratedCode;
  validation: IRunResultValidation;
}

export interface IRunDerivedData {
  constraintDescriptions: string[];
  extractionConstraints: IParsedConstraint[];
  extractionSpecifiedStates: IParsedComponentState[];
  extractionTokenReferences: IParsedTokenReference[];
  referencedTokenNames: string[];
  rootComponent: IParsedComponent | null;
  rootComponentName: string | null;
  rootComponentType: RUN_FINAL_COMPONENT_TYPE | null;
  specifiedStateNames: string[];
}

export interface IRun {
  artifacts: IRunArtifacts;
  completedAt: Date | null;
  createdAt: Date;
  derivedData: IRunDerivedData;
  errorDetails: string | null;
  errorMessage: string | null;
  id: string;
  input: IRunInput;
  result: IRunResult | null;
  startedAt: Date | null;
  status: RUN_STATUS;
  steps: IRunStepReport[];
  tokenUsageTotals: IRunTokenUsageTotals;
  updatedAt: Date;
}

export interface ICreateRunRepositoryRequest {
  input: IRunInput;
}

export interface IUpdateRunByIdRepositoryRequest {
  artifacts?: IRunArtifacts;
  completedAt?: Date | null;
  derivedData?: IRunDerivedData;
  errorDetails?: string | null;
  errorMessage?: string | null;
  id: string;
  result?: IRunResult | null;
  startedAt?: Date | null;
  status?: RUN_STATUS;
  steps?: IRunStepReport[];
  tokenUsageTotals?: IRunTokenUsageTotals;
}
