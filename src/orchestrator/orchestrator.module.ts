import { Module } from '@nestjs/common';
import { ParsingModule } from '../parsing/parsing.module';
import { RunModule } from '../run/run.module';
import { RunOrchestratorUseCase } from './use-cases/run-orchestrator.use-case';

@Module({
  exports: [RunOrchestratorUseCase],
  imports: [ParsingModule, RunModule],
  providers: [RunOrchestratorUseCase],
})
export class OrchestratorModule {}
