import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { CarCategory } from '@prisma/client';

export class UpdateCarDto {
  @ApiPropertyOptional({ example: 'Toyota' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ example: 'Corolla' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ example: 2024 })
  @IsInt()
  @Min(1990)
  @Max(2030)
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({ enum: CarCategory, example: CarCategory.sedan })
  @IsEnum(CarCategory)
  @IsOptional()
  category?: CarCategory;

  @ApiPropertyOptional({ example: 45.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  dailyPrice?: number;

  @ApiPropertyOptional({ example: 'Sedan compacto ideal para ciudad' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/images/corolla.jpg' })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
