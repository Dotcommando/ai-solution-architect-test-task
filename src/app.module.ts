import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StepModule } from './step/step.module';

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGODB_URI ?? ''), StepModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
