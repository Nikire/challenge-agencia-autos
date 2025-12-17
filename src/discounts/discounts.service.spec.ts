import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

describe('DiscountsService', () => {
  let service: DiscountsService;

  const mockCustomer = {
    id: 'customer-id',
    email: 'juan.perez@email.com',
    firstName: 'Juan',
    lastName: 'Perez',
    role: Role.customer,
  };

  const mockEmployee = {
    id: 'employee-id',
    email: 'admin@agencia.com',
    firstName: 'Admin',
    lastName: 'User',
    role: Role.employee,
  };

  const mockDiscount = {
    id: 'discount-id',
    userId: 'customer-id',
    percentage: { toNumber: () => 15, toString: () => '15' },
    description: 'Loyal customer discount',
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-12-31'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'customer-id',
      email: 'juan.perez@email.com',
      firstName: 'Juan',
      lastName: 'Perez',
    },
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    discount: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscountsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DiscountsService>(DiscountsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      userId: 'customer-id',
      percentage: 15,
      description: 'Loyal customer discount',
      validFrom: '2024-01-01T00:00:00.000Z',
      validUntil: '2024-12-31T23:59:59.000Z',
    };

    it('should create a discount', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.discount.create.mockResolvedValue(mockDiscount);

      const result = await service.create(createDto);

      expect(result).toEqual(mockDiscount);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if user is not a customer', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockEmployee);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if validUntil is before validFrom', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockCustomer);

      const invalidDto = {
        ...createDto,
        validFrom: '2024-12-31T00:00:00.000Z',
        validUntil: '2024-01-01T00:00:00.000Z',
      };

      await expect(service.create(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all discounts', async () => {
      mockPrismaService.discount.findMany.mockResolvedValue([mockDiscount]);

      const result = await service.findAll();

      expect(result).toEqual([mockDiscount]);
    });
  });

  describe('findOne', () => {
    it('should return a discount by id', async () => {
      mockPrismaService.discount.findUnique.mockResolvedValue(mockDiscount);

      const result = await service.findOne('discount-id');

      expect(result).toEqual(mockDiscount);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.discount.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUser', () => {
    it('should return discounts for a user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.discount.findMany.mockResolvedValue([mockDiscount]);

      const result = await service.findByUser('customer-id');

      expect(result).toEqual([mockDiscount]);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findByUser('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBestActiveDiscount', () => {
    it('should return the best active discount', async () => {
      mockPrismaService.discount.findMany.mockResolvedValue([mockDiscount]);

      const result = await service.findBestActiveDiscount('customer-id');

      expect(result).toEqual(mockDiscount);
    });

    it('should return null if no active discount', async () => {
      mockPrismaService.discount.findMany.mockResolvedValue([]);

      const result = await service.findBestActiveDiscount('customer-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a discount', async () => {
      const updateDto = { percentage: 20 };
      const updatedDiscount = {
        ...mockDiscount,
        percentage: { toNumber: () => 20, toString: () => '20' },
      };

      mockPrismaService.discount.findUnique.mockResolvedValue(mockDiscount);
      mockPrismaService.discount.update.mockResolvedValue(updatedDiscount);

      const result = await service.update('discount-id', updateDto);

      expect(result).toEqual(updatedDiscount);
    });
  });

  describe('remove', () => {
    it('should delete a discount', async () => {
      mockPrismaService.discount.findUnique.mockResolvedValue(mockDiscount);
      mockPrismaService.discount.delete.mockResolvedValue(mockDiscount);

      await service.remove('discount-id');

      expect(mockPrismaService.discount.delete).toHaveBeenCalledWith({
        where: { id: 'discount-id' },
      });
    });
  });
});
