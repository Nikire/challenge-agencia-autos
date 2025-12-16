import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto';
import {
  InvalidCredentialsException,
  UserAlreadyExistsException,
} from '../common/exceptions';
import { Role } from '../common/decorators';
import { JwtPayload } from '../common/decorators/current-user.decorator';
import { Role as PrismaRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerCustomer(dto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.debug(`Registering customer: ${dto.email}`);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new UserAlreadyExistsException(dto.email);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: PrismaRole.customer,
      },
    });

    this.logger.log(`Customer registered: ${user.id}`);

    return this.generateToken(user.id, user.email, this.mapRole(user.role));
  }

  async loginCustomer(dto: LoginDto): Promise<AuthResponseDto> {
    this.logger.debug(`Customer login attempt: ${dto.email}`);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email, role: PrismaRole.customer },
    });

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    this.logger.log(`Customer logged in: ${user.id}`);

    return this.generateToken(user.id, user.email, this.mapRole(user.role));
  }

  async loginEmployee(dto: LoginDto): Promise<AuthResponseDto> {
    this.logger.debug(`Employee login attempt: ${dto.email}`);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email, role: PrismaRole.employee },
    });

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    this.logger.log(`Employee logged in: ${user.id}`);

    return this.generateToken(user.id, user.email, this.mapRole(user.role));
  }

  private generateToken(
    userId: string,
    email: string,
    role: Role,
  ): AuthResponseDto {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  private mapRole(prismaRole: PrismaRole): Role {
    return prismaRole === PrismaRole.customer ? Role.Customer : Role.Employee;
  }
}
