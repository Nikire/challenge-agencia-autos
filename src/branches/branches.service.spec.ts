import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BranchesService', () => {
  let service: BranchesService;

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

  const mockPrismaService = {
    branch: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BranchesService>(BranchesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a branch', async () => {
      const createDto = {
        name: 'Sucursal Centro',
        address: 'Av. Corrientes 1234',
        city: 'Buenos Aires',
        phone: '+54 11 4567-8900',
      };

      mockPrismaService.branch.create.mockResolvedValue(mockBranch);

      const result = await service.create(createDto);

      expect(result).toEqual(mockBranch);
      expect(mockPrismaService.branch.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return active branches by default', async () => {
      mockPrismaService.branch.findMany.mockResolvedValue([mockBranch]);

      const result = await service.findAll();

      expect(result).toEqual([mockBranch]);
      expect(mockPrismaService.branch.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
    });

    it('should return all branches when includeInactive is true', async () => {
      mockPrismaService.branch.findMany.mockResolvedValue([mockBranch]);

      const result = await service.findAll(true);

      expect(result).toEqual([mockBranch]);
      expect(mockPrismaService.branch.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a branch by id', async () => {
      mockPrismaService.branch.findUnique.mockResolvedValue(mockBranch);

      const result = await service.findOne('branch-id');

      expect(result).toEqual(mockBranch);
    });

    it('should throw NotFoundException if branch not found', async () => {
      mockPrismaService.branch.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a branch', async () => {
      const updateDto = { name: 'Sucursal Centro Actualizada' };
      const updatedBranch = { ...mockBranch, ...updateDto };

      mockPrismaService.branch.findUnique.mockResolvedValue(mockBranch);
      mockPrismaService.branch.update.mockResolvedValue(updatedBranch);

      const result = await service.update('branch-id', updateDto);

      expect(result).toEqual(updatedBranch);
    });
  });

  describe('remove', () => {
    it('should deactivate a branch', async () => {
      mockPrismaService.branch.findUnique.mockResolvedValue(mockBranch);
      mockPrismaService.branch.update.mockResolvedValue({
        ...mockBranch,
        isActive: false,
      });

      await service.remove('branch-id');

      expect(mockPrismaService.branch.update).toHaveBeenCalledWith({
        where: { id: 'branch-id' },
        data: { isActive: false },
      });
    });
  });
});
