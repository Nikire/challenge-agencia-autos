import { SetMetadata } from '@nestjs/common';

export enum Role {
  Customer = 'customer',
  Employee = 'employee',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
