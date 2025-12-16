import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { UpdateReservationStatusDto, ReservationWithDetailsDto } from './dto';
import { Roles, Role } from '../common/decorators';

@ApiTags('Admin Reservations')
@ApiBearerAuth()
@Controller('admin/reservations')
@Roles(Role.Employee)
export class AdminReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reservations' })
  @ApiOkResponse({
    description: 'List of all reservations',
    type: [ReservationWithDetailsDto],
  })
  async findAll(): Promise<ReservationWithDetailsDto[]> {
    return this.reservationsService.findAll() as Promise<
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
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ReservationWithDetailsDto> {
    return this.reservationsService.findOne(
      id,
    ) as Promise<ReservationWithDetailsDto>;
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update reservation status' })
  @ApiOkResponse({
    description: 'Reservation status updated',
    type: ReservationWithDetailsDto,
  })
  @ApiNotFoundResponse({ description: 'Reservation not found' })
  @ApiBadRequestResponse({ description: 'Invalid status transition' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReservationStatusDto,
  ): Promise<ReservationWithDetailsDto> {
    return this.reservationsService.updateStatus(
      id,
      dto,
    ) as Promise<ReservationWithDetailsDto>;
  }
}
