import { Test, TestingModule } from '@nestjs/testing';
import { DiscountsController } from './discounts.controller';
import { DiscountsService } from './discounts.service';

describe('DiscountsController', () => {
  let controller: DiscountsController;

  const mockUser = {
    id: 'customer-id',
    email: 'juan.perez@email.com',
    firstName: 'Juan',
    lastName: 'Perez',
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
    user: mockUser,
  };

  const mockDiscountsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUser: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountsController],
      providers: [
        { provide: DiscountsService, useValue: mockDiscountsService },
      ],
    }).compile();

    controller = module.get<DiscountsController>(DiscountsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a discount', async () => {
      const createDto = {
        userId: 'customer-id',
        percentage: 15,
        description: 'Loyal customer discount',
        validFrom: '2024-01-01T00:00:00.000Z',
        validUntil: '2024-12-31T23:59:59.000Z',
      };

      mockDiscountsService.create.mockResolvedValue(mockDiscount);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockDiscount);
      expect(mockDiscountsService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all discounts', async () => {
      mockDiscountsService.findAll.mockResolvedValue([mockDiscount]);

      const result = await controller.findAll();

      expect(result).toEqual([mockDiscount]);
    });
  });

  describe('findByUser', () => {
    it('should return discounts for a user', async () => {
      mockDiscountsService.findByUser.mockResolvedValue([mockDiscount]);

      const result = await controller.findByUser('customer-id');

      expect(result).toEqual([mockDiscount]);
      expect(mockDiscountsService.findByUser).toHaveBeenCalledWith(
        'customer-id',
      );
    });
  });

  describe('findOne', () => {
    it('should return a discount by id', async () => {
      mockDiscountsService.findOne.mockResolvedValue(mockDiscount);

      const result = await controller.findOne('discount-id');

      expect(result).toEqual(mockDiscount);
    });
  });

  describe('update', () => {
    it('should update a discount', async () => {
      const updateDto = { percentage: 20 };
      const updatedDiscount = {
        ...mockDiscount,
        percentage: { toNumber: () => 20, toString: () => '20' },
      };

      mockDiscountsService.update.mockResolvedValue(updatedDiscount);

      const result = await controller.update('discount-id', updateDto);

      expect(result).toEqual(updatedDiscount);
    });
  });

  describe('remove', () => {
    it('should delete a discount', async () => {
      mockDiscountsService.remove.mockResolvedValue(undefined);

      await controller.remove('discount-id');

      expect(mockDiscountsService.remove).toHaveBeenCalledWith('discount-id');
    });
  });
});
