import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  IStepExecutorLlmClient,
  IStepExecutorLlmResponse,
  IStepTokenUsage,
} from '../types';

interface IOpenAiResponseOutputContent {
  text?: string;
  type?: string;
}

interface IOpenAiResponseOutputItem {
  content?: IOpenAiResponseOutputContent[];
  type?: string;
}

interface IOpenAiResponsePayload {
  output?: IOpenAiResponseOutputItem[];
  usage?: {
    input_tokens?: number;
    input_tokens_details?: {
      cached_tokens?: number;
    };
    output_tokens?: number;
    output_tokens_details?: {
      reasoning_tokens?: number;
    };
    total_tokens?: number;
  };
}

@Injectable()
export class OpenAiLlmClientService implements IStepExecutorLlmClient {
  private static readonly RESPONSES_API_URL =
    'https://api.openai.com/v1/responses';

  constructor(private readonly configService: ConfigService) {}

  async execute(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<IStepExecutorLlmResponse> {
    const apiKey = this.getRequiredEnvValue('OPENAI_API_KEY');
    const model = this.getRequiredEnvValue('OPENAI_MODEL');
    const response = await fetch(OpenAiLlmClientService.RESPONSES_API_URL, {
      body: JSON.stringify({
        input: [
          {
            content: [
              {
                text: systemPrompt,
                type: 'input_text',
              },
            ],
            role: 'developer',
            type: 'message',
          },
          {
            content: [
              {
                text: userPrompt,
                type: 'input_text',
              },
            ],
            role: 'user',
            type: 'message',
          },
        ],
        model,
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      const errorMessage = await this.extractErrorMessage(response);

      throw new Error(
        `OpenAI request failed with status ${response.status}: ${errorMessage}`,
      );
    }

    const payload: unknown = await response.json();
    const outputText = this.extractOutputText(payload);

    if (outputText === null) {
      throw new Error('OpenAI response does not contain output_text content');
    }

    return {
      rawOutput: outputText,
      tokenUsage: this.extractTokenUsage(payload),
    };
  }

  private async extractErrorMessage(response: Response): Promise<string> {
    const rawBody = await response.text();

    if (rawBody.trim() === '') {
      return 'Empty error response';
    }

    try {
      const parsedBody = JSON.parse(rawBody) as unknown;

      if (!this.isRecord(parsedBody)) {
        return rawBody;
      }

      const errorValue = parsedBody.error;

      if (!this.isRecord(errorValue)) {
        return rawBody;
      }

      const messageValue = errorValue.message;

      if (typeof messageValue !== 'string' || messageValue.trim() === '') {
        return rawBody;
      }

      return messageValue;
    } catch {
      return rawBody;
    }
  }

  private extractOutputText(payload: unknown): string | null {
    if (!this.isOpenAiResponsePayload(payload)) {
      return null;
    }

    const output = payload.output;

    if (output === undefined) {
      return null;
    }

    for (const outputItem of output) {
      if (!Array.isArray(outputItem.content)) {
        continue;
      }

      for (const contentItem of outputItem.content) {
        if (
          contentItem.type === 'output_text' &&
          typeof contentItem.text === 'string'
        ) {
          return contentItem.text;
        }
      }
    }

    return null;
  }

  private extractTokenUsage(payload: unknown): IStepTokenUsage {
    if (!this.isOpenAiResponsePayload(payload)) {
      return this.buildEmptyTokenUsage();
    }

    const usage = payload.usage;

    if (usage === undefined) {
      return this.buildEmptyTokenUsage();
    }

    return {
      cachedInputTokens: usage.input_tokens_details?.cached_tokens ?? 0,
      inputTokens: usage.input_tokens ?? null,
      outputTokens: usage.output_tokens ?? null,
      reasoningTokens: usage.output_tokens_details?.reasoning_tokens ?? 0,
      totalTokens: usage.total_tokens ?? null,
    };
  }

  private getRequiredEnvValue(name: string): string {
    const value = this.configService.getOrThrow<string>(name).trim();

    if (value === '') {
      throw new Error(`${name} is not configured`);
    }

    return value;
  }

  private isOpenAiResponsePayload(
    value: unknown,
  ): value is IOpenAiResponsePayload {
    if (!this.isRecord(value)) {
      return false;
    }

    return Array.isArray(value.output);
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object';
  }

  private buildEmptyTokenUsage(): IStepTokenUsage {
    return {
      cachedInputTokens: null,
      inputTokens: null,
      outputTokens: null,
      reasoningTokens: null,
      totalTokens: null,
    };
  }
}
