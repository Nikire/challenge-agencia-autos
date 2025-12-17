import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReservationStatus, Role } from '@prisma/client';

describe('ReservationsController', () => {
  let controller: ReservationsController;

  const mockUser = {
    id: 'customer-id',
    email: 'juan.perez@email.com',
    role: Role.customer,
  };

  const mockReservation = {
    id: 'reservation-id',
    userId: 'customer-id',
    carId: 'car-id',
    branchId: 'branch-id',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-05'),
    discountId: 'discount-id',
    discountPercentage: { toNumber: () => 15, toString: () => '15' },
    dailyPrice: { toNumber: () => 45.99, toString: () => '45.99' },
    totalPrice: { toNumber: () => 156.37, toString: () => '156.37' },
    status: ReservationStatus.pending,
    createdAt: new Date(),
    updatedAt: new Date(),
    car: {
      id: 'car-id',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2024,
      category: 'sedan',
    },
    branch: {
      id: 'branch-id',
      name: 'Sucursal Centro',
      address: 'Av. Corrientes 1234',
      city: 'Buenos Aires',
    },
  };

  const mockReservationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByUser: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
    cancelByCustomer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        { provide: ReservationsService, useValue: mockReservationsService },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a reservation', async () => {
      const createDto = {
        carId: 'car-id',
        branchId: 'branch-id',
        startDate: '2025-06-01T10:00:00.000Z',
        endDate: '2025-06-05T10:00:00.000Z',
      };

      mockReservationsService.create.mockResolvedValue(mockReservation);

      const result = await controller.create(mockUser, createDto);

      expect(result).toEqual(mockReservation);
      expect(mockReservationsService.create).toHaveBeenCalledWith(
        mockUser.id,
        createDto,
      );
    });
  });

  describe('findMyReservations', () => {
    it('should return user reservations', async () => {
      mockReservationsService.findByUser.mockResolvedValue([mockReservation]);

      const result = await controller.findMyReservations(mockUser);

      expect(result).toEqual([mockReservation]);
      expect(mockReservationsService.findByUser).toHaveBeenCalledWith(
        mockUser.id,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a reservation', async () => {
      mockReservationsService.cancelByCustomer.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.cancelled,
      });

      await controller.cancel(mockUser, 'reservation-id');

      expect(mockReservationsService.cancelByCustomer).toHaveBeenCalledWith(
        'reservation-id',
        mockUser.id,
        mockUser.role,
      );
    });
  });
});
