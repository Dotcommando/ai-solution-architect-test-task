import { IRunResult } from '../../run/types';

export interface IRunOrchestratorRequest {
  componentDescription: string;
  figmaUrl: string | null;
  screenshotUrl: string | null;
}

export type IRunOrchestratorResponse = IRunResult;
