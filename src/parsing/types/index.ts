import { IParsingStepOutput } from '../../types';

export interface IRunParsingStepUseCaseRequest {
  componentDescription: string;
  figmaUrl?: string | null;
  screenshotUrl?: string | null;
}

export interface IRunParsingStepUseCaseResponse {
  attempts: number;
  output: IParsingStepOutput;
  rawOutput: string;
}
