import { Module } from '@nestjs/common';
import { ComponentInterfacesModule } from '../component-interfaces/component-interfaces.module';
import { GapAnalysisModule } from '../gap-analysis/gap-analysis.module';
import { ParsingModule } from '../parsing/parsing.module';
import { ResolvingGapsModule } from '../resolving-gaps/resolving-gaps.module';
import { RunModule } from '../run/run.module';
import { UserFlowsModule } from '../user-flows/user-flows.module';
import { RunOrchestratorUseCase } from './use-cases/run-orchestrator.use-case';

@Module({
  exports: [RunOrchestratorUseCase],
  imports: [
    ComponentInterfacesModule,
    GapAnalysisModule,
    ParsingModule,
    ResolvingGapsModule,
    RunModule,
    UserFlowsModule,
  ],
  providers: [RunOrchestratorUseCase],
})
export class OrchestratorModule {}
