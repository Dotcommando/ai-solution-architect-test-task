import { Module } from '@nestjs/common';
import { ComponentGenerationModule } from '../component-generation/component-generation.module';
import { ComponentInterfacesModule } from '../component-interfaces/component-interfaces.module';
import { E2eTestsModule } from '../e2e-tests/e2e-tests.module';
import { GapAnalysisModule } from '../gap-analysis/gap-analysis.module';
import { ParsingModule } from '../parsing/parsing.module';
import { ResolvingGapsModule } from '../resolving-gaps/resolving-gaps.module';
import { RunModule } from '../run/run.module';
import { UnitTestsModule } from '../unit-tests/unit-tests.module';
import { UserFlowsModule } from '../user-flows/user-flows.module';
import { ValidationModule } from '../validation/validation.module';
import { RunOrchestratorUseCase } from './use-cases/run-orchestrator.use-case';

@Module({
  exports: [RunOrchestratorUseCase],
  imports: [
    ComponentGenerationModule,
    ComponentInterfacesModule,
    E2eTestsModule,
    GapAnalysisModule,
    ParsingModule,
    ResolvingGapsModule,
    RunModule,
    UnitTestsModule,
    UserFlowsModule,
    ValidationModule,
  ],
  providers: [RunOrchestratorUseCase],
})
export class OrchestratorModule {}
