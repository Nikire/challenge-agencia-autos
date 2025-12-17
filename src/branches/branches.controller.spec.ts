import { Test, TestingModule } from '@nestjs/testing';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';

describe('BranchesController', () => {
  let controller: BranchesController;

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

  const mockBranchesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BranchesController],
      providers: [{ provide: BranchesService, useValue: mockBranchesService }],
    }).compile();

    controller = module.get<BranchesController>(BranchesController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a branch', async () => {
      const createDto = {
        name: 'Sucursal Centro',
        address: 'Av. Corrientes 1234',
        city: 'Buenos Aires',
        phone: '+54 11 4567-8900',
      };

      mockBranchesService.create.mockResolvedValue(mockBranch);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockBranch);
      expect(mockBranchesService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all branches', async () => {
      mockBranchesService.findAll.mockResolvedValue([mockBranch]);

      const result = await controller.findAll();

      expect(result).toEqual([mockBranch]);
      expect(mockBranchesService.findAll).toHaveBeenCalledWith(false);
    });

    it('should include inactive branches when requested', async () => {
      mockBranchesService.findAll.mockResolvedValue([mockBranch]);

      const result = await controller.findAll('true');

      expect(result).toEqual([mockBranch]);
      expect(mockBranchesService.findAll).toHaveBeenCalledWith(true);
    });
  });

  describe('findOne', () => {
    it('should return a branch by id', async () => {
      mockBranchesService.findOne.mockResolvedValue(mockBranch);

      const result = await controller.findOne('branch-id');

      expect(result).toEqual(mockBranch);
      expect(mockBranchesService.findOne).toHaveBeenCalledWith('branch-id');
    });
  });

  describe('update', () => {
    it('should update a branch', async () => {
      const updateDto = { name: 'Sucursal Centro Actualizada' };
      const updatedBranch = { ...mockBranch, ...updateDto };

      mockBranchesService.update.mockResolvedValue(updatedBranch);

      const result = await controller.update('branch-id', updateDto);

      expect(result).toEqual(updatedBranch);
      expect(mockBranchesService.update).toHaveBeenCalledWith(
        'branch-id',
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should deactivate a branch', async () => {
      mockBranchesService.remove.mockResolvedValue(undefined);

      await controller.remove('branch-id');

      expect(mockBranchesService.remove).toHaveBeenCalledWith('branch-id');
    });
  });
});
