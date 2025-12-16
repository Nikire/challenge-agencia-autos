import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class CreateDiscountDto {
  @ApiProperty({
    description: 'Customer user ID',
    example: 'uuid-of-customer',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Discount percentage (0-100)',
    example: 15,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @ApiProperty({
    description: 'Reason for the discount',
    example: 'Loyal customer discount',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Discount validity start date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  validFrom: string;

  @ApiProperty({
    description: 'Discount validity end date',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString()
  validUntil: string;
}
