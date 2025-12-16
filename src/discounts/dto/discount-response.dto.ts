import { ApiProperty } from '@nestjs/swagger';
import { Discount } from '@prisma/client';

export class DiscountResponseDto {
  @ApiProperty({
    description: 'Discount ID',
    example: 'uuid-of-discount',
  })
  id: string;

  @ApiProperty({
    description: 'Customer user ID',
    example: 'uuid-of-customer',
  })
  userId: string;

  @ApiProperty({
    description: 'Discount percentage',
    example: 15,
  })
  percentage: Discount['percentage'];

  @ApiProperty({
    description: 'Reason for the discount',
    example: 'Loyal customer discount',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Discount validity start date',
    example: '2024-01-01T00:00:00.000Z',
  })
  validFrom: Date;

  @ApiProperty({
    description: 'Discount validity end date',
    example: '2024-12-31T23:59:59.000Z',
  })
  validUntil: Date;

  @ApiProperty({
    description: 'Whether the discount is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}

export class DiscountWithUserDto extends DiscountResponseDto {
  @ApiProperty({
    description: 'Customer information',
    example: {
      id: 'uuid-of-customer',
      email: 'juan.perez@email.com',
      firstName: 'Juan',
      lastName: 'Perez',
    },
  })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}
