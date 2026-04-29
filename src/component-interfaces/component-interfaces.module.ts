import { Module } from '@nestjs/common';
import { PromptModule } from '../prompt/prompt.module';
import { StepModule } from '../step/step.module';
import { RunComponentInterfacesStepUseCase } from './use-cases/run-component-interfaces-step.use-case';

@Module({
  exports: [RunComponentInterfacesStepUseCase],
  imports: [PromptModule, StepModule],
  providers: [RunComponentInterfacesStepUseCase],
})
export class ComponentInterfacesModule {}
