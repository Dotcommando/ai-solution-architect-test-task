import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RunRepository } from './repositories/run.repository';
import { RunDocument, RunSchema } from './schemas';

@Module({
  exports: [RunRepository],
  imports: [
    MongooseModule.forFeature([
      {
        name: RunDocument.name,
        schema: RunSchema,
      },
    ]),
  ],
  providers: [RunRepository],
})
export class RunModule {}
