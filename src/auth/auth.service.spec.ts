import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  InvalidCredentialsException,
  UserAlreadyExistsException,
} from '../common/exceptions';
import { Role as PrismaRole } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerCustomer', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should register a new customer and return access token', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-id',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: PrismaRole.customer,
      });

      const result = await service.registerCustomer(registerDto);

      expect(result).toEqual({ accessToken: 'mock-jwt-token' });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw UserAlreadyExistsException if email exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: registerDto.email,
      });

      await expect(service.registerCustomer(registerDto)).rejects.toThrow(
        UserAlreadyExistsException,
      );
    });
  });

  describe('loginCustomer', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login customer and return access token', async () => {
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: loginDto.email,
        password: hashedPassword,
        role: PrismaRole.customer,
      });

      const result = await service.loginCustomer(loginDto);

      expect(result).toEqual({ accessToken: 'mock-jwt-token' });
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.loginCustomer(loginDto)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });

    it('should throw InvalidCredentialsException if password is wrong', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: loginDto.email,
        password: 'wrong-hash',
        role: PrismaRole.customer,
      });

      await expect(service.loginCustomer(loginDto)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });
  });

  describe('loginEmployee', () => {
    const loginDto = {
      email: 'admin@example.com',
      password: 'password123',
    };

    it('should login employee and return access token', async () => {
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'employee-id',
        email: loginDto.email,
        password: hashedPassword,
        role: PrismaRole.employee,
      });

      const result = await service.loginEmployee(loginDto);

      expect(result).toEqual({ accessToken: 'mock-jwt-token' });
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsException if employee not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.loginEmployee(loginDto)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });
  });
});
