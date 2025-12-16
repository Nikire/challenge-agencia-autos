import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class InvalidCredentialsException extends BaseException {
  constructor() {
    super(
      'Invalid credentials',
      HttpStatus.UNAUTHORIZED,
      'INVALID_CREDENTIALS',
    );
  }
}

export class UserAlreadyExistsException extends BaseException {
  constructor(email: string) {
    super(
      `User with email ${email} already exists`,
      HttpStatus.CONFLICT,
      'USER_ALREADY_EXISTS',
    );
  }
}
