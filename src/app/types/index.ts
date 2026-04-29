import { IRunResult } from '../../run/types';

export interface ICreateComponentRequest {
  componentDescription: string;
  figmaUrl?: string | null;
  screenshotUrl?: string | null;
}

export interface ICreateComponentResponseInput {
  componentDescription: string;
  figmaUrl: string | null;
  screenshotUrl: string | null;
}

export type ICreateComponentResponse = IRunResult;
