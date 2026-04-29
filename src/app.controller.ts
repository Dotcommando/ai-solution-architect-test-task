import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { RunParsingStepUseCase } from './parsing/use-cases/run-parsing-step.use-case';
import type {
  ICreateComponentRequest,
  ICreateComponentResponse,
  ICreateComponentResponseInput,
} from './app/types';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly runParsingStepUseCase: RunParsingStepUseCase,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('create-component')
  async createComponent(
    @Body() request: ICreateComponentRequest,
  ): Promise<ICreateComponentResponse> {
    const normalizedRequest = this.normalizeCreateComponentRequest(request);
    const result = await this.runParsingStepUseCase.execute(normalizedRequest);

    return {
      attempts: result.attempts,
      input: normalizedRequest,
      parsing: result.output,
      rawOutput: result.rawOutput,
    };
  }

  private normalizeCreateComponentRequest(
    request: ICreateComponentRequest,
  ): ICreateComponentResponseInput {
    if (typeof request.componentDescription !== 'string') {
      throw new BadRequestException(
        '`componentDescription` must be a non-empty string',
      );
    }

    const componentDescription = request.componentDescription.trim();

    if (componentDescription === '') {
      throw new BadRequestException(
        '`componentDescription` must be a non-empty string',
      );
    }

    return {
      componentDescription,
      figmaUrl: this.normalizeOptionalUrl(request.figmaUrl),
      screenshotUrl: this.normalizeOptionalUrl(request.screenshotUrl),
    };
  }

  private normalizeOptionalUrl(value: string | null | undefined): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const normalizedValue = value.trim();

    return normalizedValue === '' ? null : normalizedValue;
  }
}
