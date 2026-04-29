import { OpenAiLlmClientService } from './openai-llm-client.service';

interface IFetchResponseMock {
  json(): Promise<unknown>;
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

describe('OpenAiLlmClientService', () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalModel = process.env.OPENAI_MODEL;

  const createFetchResponseMock = (
    response: IFetchResponseMock,
  ): IFetchResponseMock => {
    return response;
  };

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-api-key';
    process.env.OPENAI_MODEL = 'gpt-5.2';
    Object.defineProperty(globalThis, 'fetch', {
      value: jest.fn(),
      writable: true,
    });
  });

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalApiKey;
    process.env.OPENAI_MODEL = originalModel;
    jest.resetAllMocks();
  });

  it('throws when OPENAI_API_KEY is missing', async () => {
    process.env.OPENAI_API_KEY = '';

    const service = new OpenAiLlmClientService();

    await expect(
      service.execute('system prompt', 'user prompt'),
    ).rejects.toThrow('OPENAI_API_KEY is not configured');
  });

  it('throws when OPENAI_MODEL is missing', async () => {
    process.env.OPENAI_MODEL = '';

    const service = new OpenAiLlmClientService();

    await expect(
      service.execute('system prompt', 'user prompt'),
    ).rejects.toThrow('OPENAI_MODEL is not configured');
  });

  it('calls the OpenAI Responses API and returns the first output_text text', async () => {
    const fetchMock = jest.fn<
      Promise<IFetchResponseMock>,
      [string, RequestInit]
    >();

    fetchMock.mockResolvedValueOnce(
      createFetchResponseMock({
        json: async () => {
          return {
            output: [
              {
                content: [
                  {
                    text: '{"status":"ok"}',
                    type: 'output_text',
                  },
                ],
                role: 'assistant',
                status: 'completed',
                type: 'message',
              },
            ],
          };
        },
        ok: true,
        status: 200,
        text: async () => {
          return '';
        },
      }),
    );

    Object.defineProperty(globalThis, 'fetch', {
      value: fetchMock,
      writable: true,
    });

    const service = new OpenAiLlmClientService();

    await expect(
      service.execute('system prompt', 'user prompt'),
    ).resolves.toBe('{"status":"ok"}');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.openai.com/v1/responses',
      expect.objectContaining({
        body: JSON.stringify({
          input: [
            {
              content: [
                {
                  text: 'system prompt',
                  type: 'input_text',
                },
              ],
              role: 'developer',
              type: 'message',
            },
            {
              content: [
                {
                  text: 'user prompt',
                  type: 'input_text',
                },
              ],
              role: 'user',
              type: 'message',
            },
          ],
          model: 'gpt-5.2',
        }),
        headers: {
          Authorization: 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }),
    );
  });

  it('throws with the API error details when the HTTP status is not successful', async () => {
    const fetchMock = jest.fn<
      Promise<IFetchResponseMock>,
      [string, RequestInit]
    >();

    fetchMock.mockResolvedValueOnce(
      createFetchResponseMock({
        json: async () => {
          return {};
        },
        ok: false,
        status: 401,
        text: async () => {
          return JSON.stringify({
            error: {
              message: 'Invalid API key',
            },
          });
        },
      }),
    );

    Object.defineProperty(globalThis, 'fetch', {
      value: fetchMock,
      writable: true,
    });

    const service = new OpenAiLlmClientService();

    await expect(
      service.execute('system prompt', 'user prompt'),
    ).rejects.toThrow('OpenAI request failed with status 401: Invalid API key');
  });

  it('throws when the response does not contain output_text content', async () => {
    const fetchMock = jest.fn<
      Promise<IFetchResponseMock>,
      [string, RequestInit]
    >();

    fetchMock.mockResolvedValueOnce(
      createFetchResponseMock({
        json: async () => {
          return {
            output: [
              {
                content: [
                  {
                    refusal: 'Cannot comply',
                    type: 'refusal',
                  },
                ],
                role: 'assistant',
                status: 'completed',
                type: 'message',
              },
            ],
          };
        },
        ok: true,
        status: 200,
        text: async () => {
          return '';
        },
      }),
    );

    Object.defineProperty(globalThis, 'fetch', {
      value: fetchMock,
      writable: true,
    });

    const service = new OpenAiLlmClientService();

    await expect(
      service.execute('system prompt', 'user prompt'),
    ).rejects.toThrow('OpenAI response does not contain output_text content');
  });
});
