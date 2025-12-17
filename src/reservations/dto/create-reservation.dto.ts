import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({
    description: 'Car ID to reserve',
    example: 'uuid-of-car',
  })
  @IsUUID()
  carId: string;

  @ApiProperty({
    description: 'Branch ID for pickup/return',
    example: 'uuid-of-branch',
  })
  @IsUUID()
  branchId: string;

  @ApiProperty({
    description: 'Reservation start date',
    example: '2024-06-01T10:00:00.000Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Reservation end date',
    example: '2024-06-05T10:00:00.000Z',
  })
  @IsDateString()
  endDate: string;
}
