import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { AdminReservationsController } from './admin-reservations.controller';
import { ReservationsService } from './reservations.service';
import { PrismaModule } from '../prisma/prisma.module';
import { DiscountsModule } from '../discounts/discounts.module';

@Module({
  imports: [PrismaModule, DiscountsModule],
  controllers: [ReservationsController, AdminReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
