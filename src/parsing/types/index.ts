import { IParsingStepOutput } from '../../types';
import { IStepTokenUsage } from '../../step/types';

export interface IRunParsingStepUseCaseRequest {
  componentDescription: string;
  figmaUrl?: string | null;
  screenshotUrl?: string | null;
}

export interface IRunParsingStepUseCaseResponse {
  attempts: number;
  output: IParsingStepOutput;
  rawOutput: string;
  tokenUsage: IStepTokenUsage;
}
