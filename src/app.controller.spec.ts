import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RunOrchestratorUseCase } from './orchestrator/use-cases/run-orchestrator.use-case';
import { IRunResult } from './run/types';

describe('AppController', () => {
  let appController: AppController;
  let runOrchestratorUseCase: Pick<RunOrchestratorUseCase, 'run'>;

  const createRunResult = (): IRunResult => {
    return {
      component: {
        business_context: 'merchant dashboard',
        name: 'Payment card',
        type: 'card',
      },
      extraction: {
        constraints: [],
        specified_states: ['selected'],
        tokens_referenced: ['--color-text-primary'],
      },
      gap_analysis: {
        accessibility_gaps: ['Keyboard navigation needs explicit coverage.'],
        missing_states: ['error'],
        recommendations: ['Define the error state.'],
        responsive_gaps: ['Narrow layout action placement is undefined.'],
      },
      generated_code: {
        files: [
          {
            content: 'export function PaymentCard() { return null; }',
            filename:
              '/workspace/generated/frontend/src/components/PaymentCard/PaymentCard.tsx',
          },
        ],
        framework: 'React',
        states_covered: ['selected'],
        tokens_used: ['--color-text-primary'],
      },
      validation: {
        accessibility_score: 'needs_attention',
        hallucinations_caught: [],
        issues_found: ['Missing required states: error'],
        states_coverage: '1/2',
        token_compliance: true,
      },
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
    it('normalizes the request and returns the exact expected output shape', async () => {
      const runResult = createRunResult();

      runOrchestratorUseCase.run = jest.fn().mockResolvedValue(runResult);

      await expect(
        appController.createComponent({
          componentDescription: '  Payment card component.  ',
          figmaUrl: ' ',
          screenshotUrl: 'https://example.com/screenshot.png',
        }),
      ).resolves.toEqual(runResult);

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
