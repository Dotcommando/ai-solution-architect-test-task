import { ArgumentsHost } from '@nestjs/common';
import { ApplicationExceptionFilter } from './application-exception.filter';
import { StepExecutionError } from '../../step/services/step-executor.service';

interface IHttpArgumentsHostMock {
  getRequest(): {
    url: string;
  };
  getResponse(): {
    json: jest.Mock<void, [unknown]>;
    status: jest.Mock<unknown, [number]>;
  };
}

describe('ApplicationExceptionFilter', () => {
  const createArgumentsHostMock = (): {
    argumentsHost: ArgumentsHost;
    httpArgumentsHost: IHttpArgumentsHostMock;
  } => {
    const httpArgumentsHost: IHttpArgumentsHostMock = {
      getRequest: () => {
        return {
          url: '/create-component',
        };
      },
      getResponse: () => {
        return response;
      },
    };

    const argumentsHost = {
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      switchToHttp: () => {
        return httpArgumentsHost;
      },
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as ArgumentsHost;

    const response = {
      json: jest.fn<void, [unknown]>(),
      status: jest.fn().mockReturnThis(),
    };

    return {
      argumentsHost,
      httpArgumentsHost,
    };
  };

  it('returns a structured 500 response when step execution fails with a nested cause', () => {
    const filter = new ApplicationExceptionFilter();
    const { argumentsHost, httpArgumentsHost } = createArgumentsHostMock();

    filter.catch(
      new StepExecutionError('Step execution failed', {
        cause: new StepExecutionError(
          "Output schema validation failed: /components/0 must have required property 'name'",
        ),
      }),
      argumentsHost,
    );

    const response = httpArgumentsHost.getResponse();

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      details:
        "Output schema validation failed: /components/0 must have required property 'name'",
      error: 'Internal Server Error',
      message: 'Step execution failed',
      path: '/create-component',
      statusCode: 500,
    });
  });
});
