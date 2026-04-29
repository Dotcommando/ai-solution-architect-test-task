import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicationExceptionFilter } from './common/filters/application-exception.filter';
import { ParsingModule } from './parsing/parsing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          uri: configService.getOrThrow<string>('MONGODB_URI').trim(),
        };
      },
    }),
    ParsingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: ApplicationExceptionFilter,
    },
  ],
})
export class AppModule {}
