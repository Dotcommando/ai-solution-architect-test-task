import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StepModule } from './step/step.module';

@Module({
  imports: [StepModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
