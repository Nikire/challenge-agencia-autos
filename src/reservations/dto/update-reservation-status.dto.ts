import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ReservationStatus } from '@prisma/client';

export class UpdateReservationStatusDto {
  @ApiProperty({
    description: 'New reservation status',
    enum: ReservationStatus,
    example: 'confirmed',
  })
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
}
