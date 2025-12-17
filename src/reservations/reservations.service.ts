import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DiscountsService } from '../discounts/discounts.service';
import { CreateReservationDto, UpdateReservationStatusDto } from './dto';
import { Reservation, ReservationStatus, Role } from '@prisma/client';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly discountsService: DiscountsService,
  ) {}

  async create(
    userId: string,
    dto: CreateReservationDto,
  ): Promise<Reservation> {
    this.logger.debug(`Creating reservation for user: ${userId}`);

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    // Validate dates
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const now = new Date();
    if (startDate < now) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    // Validate car exists and is active
    const car = await this.prisma.car.findUnique({
      where: { id: dto.carId },
    });
    if (!car || !car.isActive) {
      throw new NotFoundException(
        `Car with ID ${dto.carId} not found or inactive`,
      );
    }

    // Validate branch exists and is active
    const branch = await this.prisma.branch.findUnique({
      where: { id: dto.branchId },
    });
    if (!branch || !branch.isActive) {
      throw new NotFoundException(
        `Branch with ID ${dto.branchId} not found or inactive`,
      );
    }

    // Check inventory availability
    const inventory = await this.prisma.inventory.findUnique({
      where: {
        branchId_carId: {
          branchId: dto.branchId,
          carId: dto.carId,
        },
      },
    });

    if (!inventory || inventory.quantity <= 0) {
      throw new BadRequestException(
        'This car is not available at the selected branch',
      );
    }

    // Check for overlapping reservations
    const overlappingReservations = await this.prisma.reservation.count({
      where: {
        carId: dto.carId,
        branchId: dto.branchId,
        status: {
          in: [ReservationStatus.pending, ReservationStatus.confirmed],
        },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (overlappingReservations >= inventory.quantity) {
      throw new BadRequestException(
        'No availability for this car at the selected branch during the requested dates',
      );
    }

    // Calculate rental days
    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Find best active discount for the customer
    const bestDiscount =
      await this.discountsService.findBestActiveDiscount(userId);

    const discountPercentageValue = bestDiscount
      ? Number(bestDiscount.percentage)
      : 0;

    // Calculate total price
    const dailyPriceNum = Number(car.dailyPrice);
    const subtotal = dailyPriceNum * days;
    const discountAmount = (subtotal * discountPercentageValue) / 100;
    const totalPriceNum = subtotal - discountAmount;

    // Create reservation
    const reservation = await this.prisma.reservation.create({
      data: {
        userId,
        carId: dto.carId,
        branchId: dto.branchId,
        startDate,
        endDate,
        discountId: bestDiscount?.id || null,
        discountPercentage: discountPercentageValue,
        dailyPrice: dailyPriceNum,
        totalPrice: totalPriceNum,
        status: ReservationStatus.pending,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        car: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            category: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
      },
    });

    this.logger.log(
      `Reservation created: ${reservation.id} for user ${userId}, total: ${totalPriceNum.toFixed(2)}`,
    );
    return reservation;
  }

  async findAll(): Promise<Reservation[]> {
    this.logger.debug('Finding all reservations');

    return this.prisma.reservation.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        car: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            category: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: string): Promise<Reservation[]> {
    this.logger.debug(`Finding reservations for user: ${userId}`);

    return this.prisma.reservation.findMany({
      where: { userId },
      include: {
        car: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            category: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Reservation> {
    this.logger.debug(`Finding reservation: ${id}`);

    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        car: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            category: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return reservation;
  }

  async updateStatus(
    id: string,
    dto: UpdateReservationStatusDto,
  ): Promise<Reservation> {
    this.logger.debug(`Updating reservation status: ${id} to ${dto.status}`);

    const reservation = await this.findOne(id);

    // Validate status transitions
    const validTransitions: Record<ReservationStatus, ReservationStatus[]> = {
      [ReservationStatus.pending]: [
        ReservationStatus.confirmed,
        ReservationStatus.cancelled,
      ],
      [ReservationStatus.confirmed]: [
        ReservationStatus.completed,
        ReservationStatus.cancelled,
      ],
      [ReservationStatus.cancelled]: [],
      [ReservationStatus.completed]: [],
    };

    if (!validTransitions[reservation.status].includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${reservation.status} to ${dto.status}`,
      );
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status: dto.status },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        car: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            category: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
      },
    });

    this.logger.log(`Reservation ${id} status updated to ${dto.status}`);
    return updated;
  }

  async cancelByCustomer(
    id: string,
    userId: string,
    userRole: Role,
  ): Promise<Reservation> {
    this.logger.debug(`Customer ${userId} cancelling reservation: ${id}`);

    const reservation = await this.findOne(id);

    // Customers can only cancel their own reservations
    if (userRole === Role.customer && reservation.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own reservations');
    }

    // Can only cancel pending reservations
    if (reservation.status !== ReservationStatus.pending) {
      throw new BadRequestException(
        'Only pending reservations can be cancelled',
      );
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.cancelled },
      include: {
        car: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            category: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
      },
    });

    this.logger.log(`Reservation ${id} cancelled by user ${userId}`);
    return updated;
  }
}
