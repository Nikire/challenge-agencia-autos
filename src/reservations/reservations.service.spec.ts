import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';
import { DiscountsService } from '../discounts/discounts.service';
import { ReservationStatus, Role } from '@prisma/client';

describe('ReservationsService', () => {
  let service: ReservationsService;

  const mockCar = {
    id: 'car-id',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2024,
    category: 'sedan',
    dailyPrice: {
      toNumber: () => 45.99,
      mul: jest.fn(),
      toString: () => '45.99',
    },
    isActive: true,
  };

  const mockBranch = {
    id: 'branch-id',
    name: 'Sucursal Centro',
    address: 'Av. Corrientes 1234',
    city: 'Buenos Aires',
    isActive: true,
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
    user: {
      id: 'customer-id',
      email: 'juan.perez@email.com',
      firstName: 'Juan',
      lastName: 'Perez',
    },
    car: mockCar,
    branch: mockBranch,
  };

  const mockPrismaService = {
    car: {
      findUnique: jest.fn(),
    },
    branch: {
      findUnique: jest.fn(),
    },
    inventory: {
      findUnique: jest.fn(),
    },
    reservation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockDiscountsService = {
    findBestActiveDiscount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: DiscountsService, useValue: mockDiscountsService },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);
    const futureEndDate = new Date(futureDate);
    futureEndDate.setDate(futureEndDate.getDate() + 4);

    const createDto = {
      carId: 'car-id',
      branchId: 'branch-id',
      startDate: futureDate.toISOString(),
      endDate: futureEndDate.toISOString(),
    };

    it('should throw BadRequestException if end date is before start date', async () => {
      const invalidDto = {
        ...createDto,
        startDate: futureEndDate.toISOString(),
        endDate: futureDate.toISOString(),
      };

      await expect(service.create('customer-id', invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if car not found', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(null);

      await expect(service.create('customer-id', createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if branch not found', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.branch.findUnique.mockResolvedValue(null);

      await expect(service.create('customer-id', createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if no inventory', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.branch.findUnique.mockResolvedValue(mockBranch);
      mockPrismaService.inventory.findUnique.mockResolvedValue(null);

      await expect(service.create('customer-id', createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all reservations', async () => {
      mockPrismaService.reservation.findMany.mockResolvedValue([
        mockReservation,
      ]);

      const result = await service.findAll();

      expect(result).toEqual([mockReservation]);
    });
  });

  describe('findOne', () => {
    it('should return a reservation by id', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue(
        mockReservation,
      );

      const result = await service.findOne('reservation-id');

      expect(result).toEqual(mockReservation);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUser', () => {
    it('should return reservations for a user', async () => {
      mockPrismaService.reservation.findMany.mockResolvedValue([
        mockReservation,
      ]);

      const result = await service.findByUser('customer-id');

      expect(result).toEqual([mockReservation]);
    });
  });

  describe('updateStatus', () => {
    it('should update reservation status', async () => {
      const updatedReservation = {
        ...mockReservation,
        status: ReservationStatus.confirmed,
      };

      mockPrismaService.reservation.findUnique.mockResolvedValue(
        mockReservation,
      );
      mockPrismaService.reservation.update.mockResolvedValue(
        updatedReservation,
      );

      const result = await service.updateStatus('reservation-id', {
        status: ReservationStatus.confirmed,
      });

      expect(result.status).toBe(ReservationStatus.confirmed);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const completedReservation = {
        ...mockReservation,
        status: ReservationStatus.completed,
      };

      mockPrismaService.reservation.findUnique.mockResolvedValue(
        completedReservation,
      );

      await expect(
        service.updateStatus('reservation-id', {
          status: ReservationStatus.pending,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelByCustomer', () => {
    it('should cancel a pending reservation', async () => {
      const cancelledReservation = {
        ...mockReservation,
        status: ReservationStatus.cancelled,
      };

      mockPrismaService.reservation.findUnique.mockResolvedValue(
        mockReservation,
      );
      mockPrismaService.reservation.update.mockResolvedValue(
        cancelledReservation,
      );

      const result = await service.cancelByCustomer(
        'reservation-id',
        'customer-id',
        Role.customer,
      );

      expect(result.status).toBe(ReservationStatus.cancelled);
    });

    it('should throw ForbiddenException if not own reservation', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue(
        mockReservation,
      );

      await expect(
        service.cancelByCustomer(
          'reservation-id',
          'other-user-id',
          Role.customer,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if reservation is not pending', async () => {
      const confirmedReservation = {
        ...mockReservation,
        status: ReservationStatus.confirmed,
      };

      mockPrismaService.reservation.findUnique.mockResolvedValue(
        confirmedReservation,
      );

      await expect(
        service.cancelByCustomer(
          'reservation-id',
          'customer-id',
          Role.customer,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
