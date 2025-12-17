import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    registerCustomer: jest.fn(),
    loginCustomer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new customer', async () => {
      const registerDto = {
        email: 'pedro.martinez@email.com',
        password: 'customer123',
        firstName: 'Pedro',
        lastName: 'Martinez',
      };
      const expectedResult = { accessToken: 'mock-token' };

      mockAuthService.registerCustomer.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.registerCustomer).toHaveBeenCalledWith(
        registerDto,
      );
    });
  });

  describe('login', () => {
    it('should login a customer', async () => {
      const loginDto = {
        email: 'juan.perez@email.com',
        password: 'customer123',
      };
      const expectedResult = { accessToken: 'mock-token' };

      mockAuthService.loginCustomer.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.loginCustomer).toHaveBeenCalledWith(loginDto);
    });
  });
});
