import { Module } from '@nestjs/common';
import { GapAnalysisModule } from '../gap-analysis/gap-analysis.module';
import { ParsingModule } from '../parsing/parsing.module';
import { RunModule } from '../run/run.module';
import { RunOrchestratorUseCase } from './use-cases/run-orchestrator.use-case';

@Module({
  exports: [RunOrchestratorUseCase],
  imports: [GapAnalysisModule, ParsingModule, RunModule],
  providers: [RunOrchestratorUseCase],
})
export class OrchestratorModule {}
