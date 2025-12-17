import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuthController } from './admin-auth.controller';
import { AuthService } from './auth.service';

describe('AdminAuthController', () => {
  let controller: AdminAuthController;

  const mockAuthService = {
    loginEmployee: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AdminAuthController>(AdminAuthController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login an employee', async () => {
      const loginDto = {
        email: 'admin@agencia.com',
        password: 'admin123',
      };
      const expectedResult = { accessToken: 'mock-token' };

      mockAuthService.loginEmployee.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.loginEmployee).toHaveBeenCalledWith(loginDto);
    });
  });
});
