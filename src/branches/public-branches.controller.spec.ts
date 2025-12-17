import { Test, TestingModule } from '@nestjs/testing';
import { PublicBranchesController } from './public-branches.controller';
import { BranchesService } from './branches.service';

describe('PublicBranchesController', () => {
  let controller: PublicBranchesController;

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
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicBranchesController],
      providers: [{ provide: BranchesService, useValue: mockBranchesService }],
    }).compile();

    controller = module.get<PublicBranchesController>(PublicBranchesController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all active branches', async () => {
      mockBranchesService.findAll.mockResolvedValue([mockBranch]);

      const result = await controller.findAll();

      expect(result).toEqual([mockBranch]);
      expect(mockBranchesService.findAll).toHaveBeenCalledWith(false);
    });
  });

  describe('findOne', () => {
    it('should return a branch by id', async () => {
      mockBranchesService.findOne.mockResolvedValue(mockBranch);

      const result = await controller.findOne('branch-id');

      expect(result).toEqual(mockBranch);
    });
  });
});
