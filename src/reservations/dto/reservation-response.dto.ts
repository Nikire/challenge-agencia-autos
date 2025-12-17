import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus, Reservation } from '@prisma/client';

export class ReservationResponseDto {
  @ApiProperty({
    description: 'Reservation ID',
    example: 'uuid-of-reservation',
  })
  id: string;

  @ApiProperty({
    description: 'Customer user ID',
    example: 'uuid-of-customer',
  })
  userId: string;

  @ApiProperty({
    description: 'Car ID',
    example: 'uuid-of-car',
  })
  carId: string;

  @ApiProperty({
    description: 'Branch ID',
    example: 'uuid-of-branch',
  })
  branchId: string;

  @ApiProperty({
    description: 'Reservation start date',
    example: '2024-06-01T10:00:00.000Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Reservation end date',
    example: '2024-06-05T10:00:00.000Z',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Applied discount ID (if any)',
    example: 'uuid-of-discount',
    nullable: true,
  })
  discountId: string | null;

  @ApiProperty({
    description: 'Discount percentage applied',
    example: 15,
  })
  discountPercentage: Reservation['discountPercentage'];

  @ApiProperty({
    description: 'Daily price at time of reservation',
    example: 45.99,
  })
  dailyPrice: Reservation['dailyPrice'];

  @ApiProperty({
    description: 'Total price after discount',
    example: 156.37,
  })
  totalPrice: Reservation['totalPrice'];

  @ApiProperty({
    description: 'Reservation status',
    enum: ReservationStatus,
    example: 'pending',
  })
  status: ReservationStatus;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}

export class ReservationWithDetailsDto extends ReservationResponseDto {
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

  @ApiProperty({
    description: 'Car information',
    example: {
      id: 'uuid-of-car',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2024,
      category: 'sedan',
    },
  })
  car: {
    id: string;
    brand: string;
    model: string;
    year: number;
    category: string;
  };

  @ApiProperty({
    description: 'Branch information',
    example: {
      id: 'uuid-of-branch',
      name: 'Sucursal Centro',
      address: 'Av. Corrientes 1234',
      city: 'Buenos Aires',
    },
  })
  branch: {
    id: string;
    name: string;
    address: string;
    city: string;
  };
}
