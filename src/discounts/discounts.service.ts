import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountDto, UpdateDiscountDto } from './dto';
import { Discount, Role } from '@prisma/client';

@Injectable()
export class DiscountsService {
  private readonly logger = new Logger(DiscountsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDiscountDto): Promise<Discount> {
    this.logger.debug(`Creating discount for user: ${dto.userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    if (user.role !== Role.customer) {
      throw new BadRequestException(
        'Discounts can only be assigned to customers',
      );
    }

    const validFrom = new Date(dto.validFrom);
    const validUntil = new Date(dto.validUntil);

    if (validUntil <= validFrom) {
      throw new BadRequestException('validUntil must be after validFrom');
    }

    const discount = await this.prisma.discount.create({
      data: {
        userId: dto.userId,
        percentage: dto.percentage,
        description: dto.description,
        validFrom,
        validUntil,
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
      },
    });

    this.logger.log(`Discount created: ${discount.id} for user ${dto.userId}`);
    return discount;
  }

  async findAll(): Promise<Discount[]> {
    this.logger.debug('Finding all discounts');

    return this.prisma.discount.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Discount> {
    this.logger.debug(`Finding discount: ${id}`);

    const discount = await this.prisma.discount.findUnique({
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
      },
    });

    if (!discount) {
      throw new NotFoundException(`Discount with ID ${id} not found`);
    }

    return discount;
  }

  async findByUser(userId: string): Promise<Discount[]> {
    this.logger.debug(`Finding discounts for user: ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.discount.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBestActiveDiscount(userId: string): Promise<Discount | null> {
    this.logger.debug(`Finding best active discount for user: ${userId}`);

    const now = new Date();

    const discounts = await this.prisma.discount.findMany({
      where: {
        userId,
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
      },
      orderBy: { percentage: 'desc' },
      take: 1,
    });

    return discounts[0] || null;
  }

  async update(id: string, dto: UpdateDiscountDto): Promise<Discount> {
    this.logger.debug(`Updating discount: ${id}`);

    await this.findOne(id);

    const updateData: Record<string, unknown> = {};

    if (dto.percentage !== undefined) {
      updateData.percentage = dto.percentage;
    }
    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }
    if (dto.validFrom !== undefined) {
      updateData.validFrom = new Date(dto.validFrom);
    }
    if (dto.validUntil !== undefined) {
      updateData.validUntil = new Date(dto.validUntil);
    }
    if (dto.isActive !== undefined) {
      updateData.isActive = dto.isActive;
    }

    const discount = await this.prisma.discount.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    this.logger.log(`Discount updated: ${discount.id}`);
    return discount;
  }

  async remove(id: string): Promise<void> {
    this.logger.debug(`Removing discount: ${id}`);

    await this.findOne(id);

    await this.prisma.discount.delete({
      where: { id },
    });

    this.logger.log(`Discount removed: ${id}`);
  }
}
