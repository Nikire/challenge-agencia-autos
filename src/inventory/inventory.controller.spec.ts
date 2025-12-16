import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

describe('InventoryController', () => {
  let controller: InventoryController;

  const mockBranch = {
    id: 'branch-id',
    name: 'Sucursal Centro',
    address: 'Av. Corrientes 1234',
    city: 'Buenos Aires',
    phone: '+54 11 4567-8900',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCar = {
    id: 'car-id',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2024,
    category: 'sedan',
    dailyPrice: { toNumber: () => 45.99, toString: () => '45.99' },
    description: 'Sedan compacto',
    imageUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockInventory = {
    id: 'inventory-id',
    branchId: 'branch-id',
    carId: 'car-id',
    quantity: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    branch: mockBranch,
    car: mockCar,
  };

  const mockInventoryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    remove: jest.fn(),
    checkAvailability: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        { provide: InventoryService, useValue: mockInventoryService },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upsert', () => {
    it('should create/update inventory', async () => {
      const createDto = {
        branchId: 'branch-id',
        carId: 'car-id',
        quantity: 5,
      };

      mockInventoryService.upsert.mockResolvedValue(mockInventory);

      const result = await controller.upsert(createDto);

      expect(result).toEqual(mockInventory);
      expect(mockInventoryService.upsert).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all inventory', async () => {
      mockInventoryService.findAll.mockResolvedValue([mockInventory]);

      const result = await controller.findAll();

      expect(result).toEqual([mockInventory]);
    });
  });

  describe('checkAvailability', () => {
    it('should return availability', async () => {
      const availabilityResult = [
        {
          branchId: 'branch-id',
          branchName: 'Sucursal Centro',
          car: mockCar,
          totalStock: 5,
          availableStock: 5,
        },
      ];

      mockInventoryService.checkAvailability.mockResolvedValue(
        availabilityResult,
      );

      const result = await controller.checkAvailability({});

      expect(result).toEqual(availabilityResult);
    });
  });

  describe('findOne', () => {
    it('should return inventory by id', async () => {
      mockInventoryService.findOne.mockResolvedValue(mockInventory);

      const result = await controller.findOne('inventory-id');

      expect(result).toEqual(mockInventory);
    });
  });

  describe('update', () => {
    it('should update inventory', async () => {
      const updateDto = { quantity: 10 };
      const updatedInventory = { ...mockInventory, quantity: 10 };

      mockInventoryService.update.mockResolvedValue(updatedInventory);

      const result = await controller.update('inventory-id', updateDto);

      expect(result).toEqual(updatedInventory);
    });
  });

  describe('remove', () => {
    it('should delete inventory', async () => {
      mockInventoryService.remove.mockResolvedValue(undefined);

      await controller.remove('inventory-id');

      expect(mockInventoryService.remove).toHaveBeenCalledWith('inventory-id');
    });
  });
});
