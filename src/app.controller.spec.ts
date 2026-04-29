import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RunOrchestratorUseCase } from './orchestrator/use-cases/run-orchestrator.use-case';
import { IParsingStepOutput } from './types';

describe('AppController', () => {
  let appController: AppController;
  let runOrchestratorUseCase: Pick<RunOrchestratorUseCase, 'run'>;

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
    runOrchestratorUseCase = {
      run: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: RunOrchestratorUseCase,
          useValue: runOrchestratorUseCase,
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

      runOrchestratorUseCase.run = jest.fn().mockResolvedValue({
        attempts: 1,
        input: {
          componentDescription: 'Payment card component.',
          figmaUrl: null,
          screenshotUrl: 'https://example.com/screenshot.png',
        },
        parsing: parsingOutput,
        rawOutput: '{"businessContext":"merchant dashboard"}',
        runId: 'run-id-1',
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
        runId: 'run-id-1',
      });

      expect(runOrchestratorUseCase.run).toHaveBeenCalledWith({
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
