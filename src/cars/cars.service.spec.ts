import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CarsService } from './cars.service';
import { PrismaService } from '../prisma/prisma.service';
import { CarCategory } from '@prisma/client';

describe('CarsService', () => {
  let service: CarsService;

  const mockCar = {
    id: 'car-id',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2024,
    category: CarCategory.sedan,
    dailyPrice: { toNumber: () => 45.99, toString: () => '45.99' },
    description: 'Sedan compacto ideal para ciudad',
    imageUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    car: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CarsService>(CarsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a car', async () => {
      const createDto = {
        brand: 'Toyota',
        model: 'Corolla',
        year: 2024,
        category: CarCategory.sedan,
        dailyPrice: 45.99,
        description: 'Sedan compacto ideal para ciudad',
      };

      mockPrismaService.car.create.mockResolvedValue(mockCar);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCar);
      expect(mockPrismaService.car.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return active cars by default', async () => {
      mockPrismaService.car.findMany.mockResolvedValue([mockCar]);

      const result = await service.findAll();

      expect(result).toEqual([mockCar]);
      expect(mockPrismaService.car.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [{ brand: 'asc' }, { model: 'asc' }],
      });
    });

    it('should return all cars when includeInactive is true', async () => {
      mockPrismaService.car.findMany.mockResolvedValue([mockCar]);

      const result = await service.findAll(true);

      expect(result).toEqual([mockCar]);
      expect(mockPrismaService.car.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ brand: 'asc' }, { model: 'asc' }],
      });
    });
  });

  describe('findOne', () => {
    it('should return a car by id', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);

      const result = await service.findOne('car-id');

      expect(result).toEqual(mockCar);
    });

    it('should throw NotFoundException if car not found', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a car', async () => {
      const updateDto = { dailyPrice: 49.99 };
      const updatedCar = {
        ...mockCar,
        dailyPrice: { toNumber: () => 49.99, toString: () => '49.99' },
      };

      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.car.update.mockResolvedValue(updatedCar);

      const result = await service.update('car-id', updateDto);

      expect(result).toEqual(updatedCar);
    });
  });

  describe('remove', () => {
    it('should deactivate a car', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.car.update.mockResolvedValue({
        ...mockCar,
        isActive: false,
      });

      await service.remove('car-id');

      expect(mockPrismaService.car.update).toHaveBeenCalledWith({
        where: { id: 'car-id' },
        data: { isActive: false },
      });
    });
  });
});
