import { Test, TestingModule } from '@nestjs/testing';
import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';
import { CarCategory } from '@prisma/client';

describe('CarsController', () => {
  let controller: CarsController;

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

  const mockCarsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarsController],
      providers: [{ provide: CarsService, useValue: mockCarsService }],
    }).compile();

    controller = module.get<CarsController>(CarsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all active cars', async () => {
      mockCarsService.findAll.mockResolvedValue([mockCar]);

      const result = await controller.findAll();

      expect(result).toEqual([mockCar]);
      expect(mockCarsService.findAll).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should return a car by id', async () => {
      mockCarsService.findOne.mockResolvedValue(mockCar);

      const result = await controller.findOne('car-id');

      expect(result).toEqual(mockCar);
      expect(mockCarsService.findOne).toHaveBeenCalledWith('car-id');
    });
  });
});
