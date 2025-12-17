import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { CarCategory } from '@prisma/client';

export class CreateCarDto {
  @ApiProperty({ example: 'Toyota' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ example: 2024 })
  @IsInt()
  @Min(1990)
  @Max(2030)
  year: number;

  @ApiProperty({ enum: CarCategory, example: CarCategory.sedan })
  @IsEnum(CarCategory)
  category: CarCategory;

  @ApiProperty({ example: 45.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  dailyPrice: number;

  @ApiPropertyOptional({ example: 'Sedan compacto ideal para ciudad' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/images/corolla.jpg' })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
