import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  AvailabilityQueryDto,
  AvailabilityResponseDto,
} from './dto';
import { Inventory } from '@prisma/client';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInventoryDto): Promise<Inventory> {
    this.logger.debug(
      `Creating inventory: branch ${dto.branchId}, car ${dto.carId}`,
    );

    const branch = await this.prisma.branch.findUnique({
      where: { id: dto.branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${dto.branchId} not found`);
    }

    const car = await this.prisma.car.findUnique({
      where: { id: dto.carId },
    });
    if (!car) {
      throw new NotFoundException(`Car with ID ${dto.carId} not found`);
    }

    const existing = await this.prisma.inventory.findUnique({
      where: {
        branchId_carId: {
          branchId: dto.branchId,
          carId: dto.carId,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        `Inventory for this car at this branch already exists. Use update instead.`,
      );
    }

    const inventory = await this.prisma.inventory.create({
      data: dto,
    });

    this.logger.log(`Inventory created: ${inventory.id}`);
    return inventory;
  }

  async findAll(): Promise<Inventory[]> {
    this.logger.debug('Finding all inventory');

    return this.prisma.inventory.findMany({
      include: {
        branch: true,
        car: true,
      },
      orderBy: [{ branch: { name: 'asc' } }, { car: { brand: 'asc' } }],
    });
  }

  async findOne(id: string): Promise<Inventory> {
    this.logger.debug(`Finding inventory: ${id}`);

    const inventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: {
        branch: true,
        car: true,
      },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    return inventory;
  }

  async findByBranchAndCar(
    branchId: string,
    carId: string,
  ): Promise<Inventory | null> {
    return this.prisma.inventory.findUnique({
      where: {
        branchId_carId: {
          branchId,
          carId,
        },
      },
    });
  }

  async update(id: string, dto: UpdateInventoryDto): Promise<Inventory> {
    this.logger.debug(`Updating inventory: ${id}`);

    await this.findOne(id);

    const inventory = await this.prisma.inventory.update({
      where: { id },
      data: dto,
      include: {
        branch: true,
        car: true,
      },
    });

    this.logger.log(`Inventory updated: ${inventory.id}`);
    return inventory;
  }

  async upsert(dto: CreateInventoryDto): Promise<Inventory> {
    this.logger.debug(
      `Upserting inventory: branch ${dto.branchId}, car ${dto.carId}`,
    );

    const branch = await this.prisma.branch.findUnique({
      where: { id: dto.branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${dto.branchId} not found`);
    }

    const car = await this.prisma.car.findUnique({
      where: { id: dto.carId },
    });
    if (!car) {
      throw new NotFoundException(`Car with ID ${dto.carId} not found`);
    }

    const inventory = await this.prisma.inventory.upsert({
      where: {
        branchId_carId: {
          branchId: dto.branchId,
          carId: dto.carId,
        },
      },
      update: { quantity: dto.quantity },
      create: dto,
      include: {
        branch: true,
        car: true,
      },
    });

    this.logger.log(`Inventory upserted: ${inventory.id}`);
    return inventory;
  }

  async remove(id: string): Promise<void> {
    this.logger.debug(`Removing inventory: ${id}`);

    await this.findOne(id);

    await this.prisma.inventory.delete({
      where: { id },
    });

    this.logger.log(`Inventory removed: ${id}`);
  }

  async checkAvailability(
    query: AvailabilityQueryDto,
  ): Promise<AvailabilityResponseDto[]> {
    this.logger.debug('Checking availability');

    const where: Record<string, unknown> = {};
    if (query.branchId) {
      where.branchId = query.branchId;
    }
    if (query.carId) {
      where.carId = query.carId;
    }

    const inventoryList = await this.prisma.inventory.findMany({
      where,
      include: {
        branch: true,
        car: true,
      },
    });

    const results: AvailabilityResponseDto[] = inventoryList.map((inv) => ({
      branchId: inv.branchId,
      branchName: inv.branch.name,
      car: inv.car,
      totalStock: inv.quantity,
      availableStock: inv.quantity,
    }));

    return results;
  }
}
