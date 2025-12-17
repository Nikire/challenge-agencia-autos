import { ApiProperty } from '@nestjs/swagger';

export class BranchResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Sucursal Centro' })
  name: string;

  @ApiProperty({ example: 'Av. Corrientes 1234' })
  address: string;

  @ApiProperty({ example: 'Buenos Aires' })
  city: string;

  @ApiProperty({ example: '+54 11 4567-8900' })
  phone: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
