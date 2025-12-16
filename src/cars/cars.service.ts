import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarDto, UpdateCarDto } from './dto';
import { Car } from '@prisma/client';

@Injectable()
export class CarsService {
  private readonly logger = new Logger(CarsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCarDto): Promise<Car> {
    this.logger.debug(`Creating car: ${dto.brand} ${dto.model}`);

    const car = await this.prisma.car.create({
      data: dto,
    });

    this.logger.log(`Car created: ${car.id}`);
    return car;
  }

  async findAll(includeInactive = false): Promise<Car[]> {
    this.logger.debug('Finding all cars');

    return this.prisma.car.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [{ brand: 'asc' }, { model: 'asc' }],
    });
  }

  async findOne(id: string): Promise<Car> {
    this.logger.debug(`Finding car: ${id}`);

    const car = await this.prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return car;
  }

  async update(id: string, dto: UpdateCarDto): Promise<Car> {
    this.logger.debug(`Updating car: ${id}`);

    await this.findOne(id);

    const car = await this.prisma.car.update({
      where: { id },
      data: dto,
    });

    this.logger.log(`Car updated: ${car.id}`);
    return car;
  }

  async remove(id: string): Promise<void> {
    this.logger.debug(`Deactivating car: ${id}`);

    await this.findOne(id);

    await this.prisma.car.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Car deactivated: ${id}`);
  }
}
