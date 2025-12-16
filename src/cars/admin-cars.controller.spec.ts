import { Test, TestingModule } from '@nestjs/testing';
import { AdminCarsController } from './admin-cars.controller';
import { CarsService } from './cars.service';
import { CarCategory } from '@prisma/client';

describe('AdminCarsController', () => {
  let controller: AdminCarsController;

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
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminCarsController],
      providers: [{ provide: CarsService, useValue: mockCarsService }],
    }).compile();

    controller = module.get<AdminCarsController>(AdminCarsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      mockCarsService.create.mockResolvedValue(mockCar);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockCar);
      expect(mockCarsService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all cars', async () => {
      mockCarsService.findAll.mockResolvedValue([mockCar]);

      const result = await controller.findAll();

      expect(result).toEqual([mockCar]);
      expect(mockCarsService.findAll).toHaveBeenCalledWith(false);
    });

    it('should include inactive cars when requested', async () => {
      mockCarsService.findAll.mockResolvedValue([mockCar]);

      const result = await controller.findAll('true');

      expect(result).toEqual([mockCar]);
      expect(mockCarsService.findAll).toHaveBeenCalledWith(true);
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

  describe('update', () => {
    it('should update a car', async () => {
      const updateDto = { dailyPrice: 49.99 };
      const updatedCar = {
        ...mockCar,
        dailyPrice: { toNumber: () => 49.99, toString: () => '49.99' },
      };

      mockCarsService.update.mockResolvedValue(updatedCar);

      const result = await controller.update('car-id', updateDto);

      expect(result).toEqual(updatedCar);
      expect(mockCarsService.update).toHaveBeenCalledWith('car-id', updateDto);
    });
  });

  describe('remove', () => {
    it('should deactivate a car', async () => {
      mockCarsService.remove.mockResolvedValue(undefined);

      await controller.remove('car-id');

      expect(mockCarsService.remove).toHaveBeenCalledWith('car-id');
    });
  });
});
