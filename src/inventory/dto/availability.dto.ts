import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { CarResponseDto } from '../../cars/dto';

export class AvailabilityQueryDto {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  @IsOptional()
  carId?: string;

  @ApiPropertyOptional({ example: '2024-12-20' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-25' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class AvailabilityResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  branchId: string;

  @ApiProperty({ example: 'Sucursal Centro' })
  branchName: string;

  @ApiProperty({ type: CarResponseDto })
  car: CarResponseDto;

  @ApiProperty({ example: 5 })
  totalStock: number;

  @ApiProperty({ example: 3 })
  availableStock: number;
}
