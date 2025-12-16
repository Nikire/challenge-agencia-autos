import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Car, CarCategory } from '@prisma/client';

export class CarResponseDto implements Car {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Toyota' })
  brand: string;

  @ApiProperty({ example: 'Corolla' })
  model: string;

  @ApiProperty({ example: 2024 })
  year: number;

  @ApiProperty({ enum: CarCategory, example: CarCategory.sedan })
  category: CarCategory;

  @ApiProperty({ example: 45.99, type: 'number' })
  dailyPrice: Car['dailyPrice'];

  @ApiPropertyOptional({ example: 'Sedan compacto ideal para ciudad' })
  description: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/images/corolla.jpg' })
  imageUrl: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
