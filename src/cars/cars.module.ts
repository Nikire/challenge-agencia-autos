import { Module } from '@nestjs/common';
import { CarsController } from './cars.controller';
import { AdminCarsController } from './admin-cars.controller';
import { CarsService } from './cars.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CarsController, AdminCarsController],
  providers: [CarsService],
  exports: [CarsService],
})
export class CarsModule {}
