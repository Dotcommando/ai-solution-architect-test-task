import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromptRepository } from './repositories/prompt.repository';
import { PromptDocument, PromptSchema } from './schemas';

@Module({
  exports: [PromptRepository],
  imports: [
    MongooseModule.forFeature([
      {
        name: PromptDocument.name,
        schema: PromptSchema,
      },
    ]),
  ],
  providers: [PromptRepository],
})
export class PromptModule {}
