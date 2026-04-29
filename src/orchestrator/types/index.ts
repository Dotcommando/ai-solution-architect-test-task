import { ICreateComponentResponseInput } from '../../app/types';
import { IParsingStepOutput } from '../../types';

export interface IRunOrchestratorRequest {
  componentDescription: string;
  figmaUrl: string | null;
  screenshotUrl: string | null;
}

export interface IRunOrchestratorResponse {
  attempts: number;
  input: ICreateComponentResponseInput;
  parsing: IParsingStepOutput;
  rawOutput: string;
  runId: string;
}
