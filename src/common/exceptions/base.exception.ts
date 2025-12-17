import { HttpException, HttpStatus } from '@nestjs/common';

export interface ExceptionResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path?: string;
}

export class BaseException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly errorCode?: string,
  ) {
    super(message, statusCode);
  }
}
