import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InventoryService', () => {
  let service: InventoryService;

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

  const mockPrismaService = {
    branch: {
      findUnique: jest.fn(),
    },
    car: {
      findUnique: jest.fn(),
    },
    inventory: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      branchId: 'branch-id',
      carId: 'car-id',
      quantity: 5,
    };

    it('should create inventory', async () => {
      mockPrismaService.branch.findUnique.mockResolvedValue(mockBranch);
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.inventory.findUnique.mockResolvedValue(null);
      mockPrismaService.inventory.create.mockResolvedValue(mockInventory);

      const result = await service.create(createDto);

      expect(result).toEqual(mockInventory);
    });

    it('should throw NotFoundException if branch not found', async () => {
      mockPrismaService.branch.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if car not found', async () => {
      mockPrismaService.branch.findUnique.mockResolvedValue(mockBranch);
      mockPrismaService.car.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if inventory exists', async () => {
      mockPrismaService.branch.findUnique.mockResolvedValue(mockBranch);
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all inventory', async () => {
      mockPrismaService.inventory.findMany.mockResolvedValue([mockInventory]);

      const result = await service.findAll();

      expect(result).toEqual([mockInventory]);
    });
  });

  describe('findOne', () => {
    it('should return inventory by id', async () => {
      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);

      const result = await service.findOne('inventory-id');

      expect(result).toEqual(mockInventory);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.inventory.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update inventory', async () => {
      const updateDto = { quantity: 10 };
      const updatedInventory = { ...mockInventory, quantity: 10 };

      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);
      mockPrismaService.inventory.update.mockResolvedValue(updatedInventory);

      const result = await service.update('inventory-id', updateDto);

      expect(result).toEqual(updatedInventory);
    });
  });

  describe('upsert', () => {
    const upsertDto = {
      branchId: 'branch-id',
      carId: 'car-id',
      quantity: 5,
    };

    it('should upsert inventory', async () => {
      mockPrismaService.branch.findUnique.mockResolvedValue(mockBranch);
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.inventory.upsert.mockResolvedValue(mockInventory);

      const result = await service.upsert(upsertDto);

      expect(result).toEqual(mockInventory);
    });
  });

  describe('remove', () => {
    it('should delete inventory', async () => {
      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);
      mockPrismaService.inventory.delete.mockResolvedValue(mockInventory);

      await service.remove('inventory-id');

      expect(mockPrismaService.inventory.delete).toHaveBeenCalledWith({
        where: { id: 'inventory-id' },
      });
    });
  });

  describe('checkAvailability', () => {
    it('should return availability', async () => {
      mockPrismaService.inventory.findMany.mockResolvedValue([mockInventory]);

      const result = await service.checkAvailability({});

      expect(result).toHaveLength(1);
      expect(result[0].totalStock).toBe(5);
      expect(result[0].availableStock).toBe(5);
    });
  });
});
