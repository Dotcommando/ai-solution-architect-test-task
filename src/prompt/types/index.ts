export interface IPrompt {
  v: number;
  code: string;
  stepCode: string;
  variant: string;
  system: string;
  userTemplate: string;
  isActive: boolean;
}
