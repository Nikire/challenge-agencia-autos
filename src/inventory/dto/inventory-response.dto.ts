import { ApiProperty } from '@nestjs/swagger';
import { BranchResponseDto } from '../../branches/dto';
import { CarResponseDto } from '../../cars/dto';

export class InventoryResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  branchId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  carId: string;

  @ApiProperty({ example: 5 })
  quantity: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class InventoryWithDetailsDto extends InventoryResponseDto {
  @ApiProperty({ type: BranchResponseDto })
  branch: BranchResponseDto;

  @ApiProperty({ type: CarResponseDto })
  car: CarResponseDto;
}
