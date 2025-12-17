import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto, UpdateBranchDto } from './dto';
import { Branch } from '@prisma/client';

@Injectable()
export class BranchesService {
  private readonly logger = new Logger(BranchesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBranchDto): Promise<Branch> {
    this.logger.debug(`Creating branch: ${dto.name}`);

    const branch = await this.prisma.branch.create({
      data: dto,
    });

    this.logger.log(`Branch created: ${branch.id}`);
    return branch;
  }

  async findAll(includeInactive = false): Promise<Branch[]> {
    this.logger.debug('Finding all branches');

    return this.prisma.branch.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string): Promise<Branch> {
    this.logger.debug(`Finding branch: ${id}`);

    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return branch;
  }

  async update(id: string, dto: UpdateBranchDto): Promise<Branch> {
    this.logger.debug(`Updating branch: ${id}`);

    await this.findOne(id);

    const branch = await this.prisma.branch.update({
      where: { id },
      data: dto,
    });

    this.logger.log(`Branch updated: ${branch.id}`);
    return branch;
  }

  async remove(id: string): Promise<void> {
    this.logger.debug(`Deactivating branch: ${id}`);

    await this.findOne(id);

    await this.prisma.branch.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Branch deactivated: ${id}`);
  }
}
