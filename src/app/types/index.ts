import { IParsingStepOutput } from '../../types';

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

export interface ICreateComponentResponse {
  attempts: number;
  input: ICreateComponentResponseInput;
  parsing: IParsingStepOutput;
  rawOutput: string;
}
