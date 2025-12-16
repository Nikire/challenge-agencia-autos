import { Test, TestingModule } from '@nestjs/testing';
import { AdminReservationsController } from './admin-reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReservationStatus } from '@prisma/client';

describe('AdminReservationsController', () => {
  let controller: AdminReservationsController;

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
    user: {
      id: 'customer-id',
      email: 'juan.perez@email.com',
      firstName: 'Juan',
      lastName: 'Perez',
    },
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
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminReservationsController],
      providers: [
        { provide: ReservationsService, useValue: mockReservationsService },
      ],
    }).compile();

    controller = module.get<AdminReservationsController>(
      AdminReservationsController,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all reservations', async () => {
      mockReservationsService.findAll.mockResolvedValue([mockReservation]);

      const result = await controller.findAll();

      expect(result).toEqual([mockReservation]);
    });
  });

  describe('findOne', () => {
    it('should return a reservation by id', async () => {
      mockReservationsService.findOne.mockResolvedValue(mockReservation);

      const result = await controller.findOne('reservation-id');

      expect(result).toEqual(mockReservation);
    });
  });

  describe('updateStatus', () => {
    it('should update reservation status', async () => {
      const updatedReservation = {
        ...mockReservation,
        status: ReservationStatus.confirmed,
      };

      mockReservationsService.updateStatus.mockResolvedValue(
        updatedReservation,
      );

      const result = await controller.updateStatus('reservation-id', {
        status: ReservationStatus.confirmed,
      });

      expect(result.status).toBe(ReservationStatus.confirmed);
    });
  });
});
