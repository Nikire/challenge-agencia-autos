import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto, ReservationWithDetailsDto } from './dto';
import { CurrentUser, Roles, Role } from '../common/decorators';
import { Role as PrismaRole } from '@prisma/client';

interface JwtUser {
  id: string;
  email: string;
  role: PrismaRole;
}

@ApiTags('Reservations')
@ApiBearerAuth()
@Controller('reservations')
@Roles(Role.Customer)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reservation' })
  @ApiCreatedResponse({
    description: 'Reservation created successfully',
    type: ReservationWithDetailsDto,
  })
  @ApiNotFoundResponse({ description: 'Car or Branch not found' })
  @ApiBadRequestResponse({ description: 'Invalid dates or no availability' })
  async create(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateReservationDto,
  ): Promise<ReservationWithDetailsDto> {
    return this.reservationsService.create(
      user.id,
      dto,
    ) as Promise<ReservationWithDetailsDto>;
  }

  @Get()
  @ApiOperation({ summary: 'Get my reservations' })
  @ApiOkResponse({
    description: 'List of my reservations',
    type: [ReservationWithDetailsDto],
  })
  async findMyReservations(
    @CurrentUser() user: JwtUser,
  ): Promise<ReservationWithDetailsDto[]> {
    return this.reservationsService.findByUser(user.id) as Promise<
      ReservationWithDetailsDto[]
    >;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reservation by ID' })
  @ApiOkResponse({
    description: 'Reservation found',
    type: ReservationWithDetailsDto,
  })
  @ApiNotFoundResponse({ description: 'Reservation not found' })
  @ApiForbiddenResponse({ description: 'Not your reservation' })
  async findOne(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ReservationWithDetailsDto> {
    const reservation = await this.reservationsService.findOne(id);

    // Customers can only view their own reservations
    if (reservation.userId !== user.id) {
      throw new ForbiddenException('You can only view your own reservations');
    }

    return reservation as ReservationWithDetailsDto;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel my reservation' })
  @ApiNoContentResponse({ description: 'Reservation cancelled successfully' })
  @ApiNotFoundResponse({ description: 'Reservation not found' })
  @ApiForbiddenResponse({ description: 'Not your reservation' })
  @ApiBadRequestResponse({
    description: 'Only pending reservations can be cancelled',
  })
  async cancel(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.reservationsService.cancelByCustomer(id, user.id, user.role);
  }
}
