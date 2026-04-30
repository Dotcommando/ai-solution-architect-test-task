import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromptDocument, PromptSchema } from '../prompt/schemas';
import { StepDocument, StepSchema } from '../step/schemas';
import { BootstrapDumpSeedService } from './services/bootstrap-dump-seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PromptDocument.name,
        schema: PromptSchema,
      },
      {
        name: StepDocument.name,
        schema: StepSchema,
      },
    ]),
  ],
  providers: [BootstrapDumpSeedService],
})
export class SeedModule {}
