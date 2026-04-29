import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RunParsingStepUseCase } from './parsing/use-cases/run-parsing-step.use-case';
import { IParsingStepOutput } from './types';

describe('AppController', () => {
  let appController: AppController;
  let runParsingStepUseCase: Pick<RunParsingStepUseCase, 'execute'>;

  const createParsingOutput = (): IParsingStepOutput => {
    return {
      businessContext: 'merchant dashboard',
      components: [
        {
          code: 'payment_card',
          name: 'Payment card',
          parentCode: null,
          purpose: 'Display a saved payment method.',
          statePolicy: 'smart',
          type: 'card',
        },
      ],
      constraints: [],
      content: [],
      interactions: [],
      rootComponentCode: 'payment_card',
      specifiedStates: [],
      tokenReferences: [],
    };
  };

  beforeEach(async () => {
    runParsingStepUseCase = {
      execute: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: RunParsingStepUseCase,
          useValue: runParsingStepUseCase,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('createComponent', () => {
    it('normalizes the request and returns the parsing result', async () => {
      const parsingOutput = createParsingOutput();

      runParsingStepUseCase.execute = jest.fn().mockResolvedValue({
        attempts: 1,
        output: parsingOutput,
        rawOutput: '{"businessContext":"merchant dashboard"}',
      });

      await expect(
        appController.createComponent({
          componentDescription: '  Payment card component.  ',
          figmaUrl: ' ',
          screenshotUrl: 'https://example.com/screenshot.png',
        }),
      ).resolves.toEqual({
        attempts: 1,
        input: {
          componentDescription: 'Payment card component.',
          figmaUrl: null,
          screenshotUrl: 'https://example.com/screenshot.png',
        },
        parsing: parsingOutput,
        rawOutput: '{"businessContext":"merchant dashboard"}',
      });

      expect(runParsingStepUseCase.execute).toHaveBeenCalledWith({
        componentDescription: 'Payment card component.',
        figmaUrl: null,
        screenshotUrl: 'https://example.com/screenshot.png',
      });
    });

    it('throws when componentDescription is empty', async () => {
      await expect(
        appController.createComponent({
          componentDescription: '   ',
        }),
      ).rejects.toThrow('`componentDescription` must be a non-empty string');
    });
  });
});
