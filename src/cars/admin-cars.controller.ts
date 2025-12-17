import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CarsService } from './cars.service';
import { CreateCarDto, UpdateCarDto, CarResponseDto } from './dto';
import { Roles, Role } from '../common/decorators';

@ApiTags('Admin Cars')
@ApiBearerAuth()
@Controller('admin/cars')
@Roles(Role.Employee)
export class AdminCarsController {
  constructor(private readonly carsService: CarsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new car model' })
  @ApiCreatedResponse({
    description: 'Car created successfully',
    type: CarResponseDto,
  })
  async create(@Body() dto: CreateCarDto): Promise<CarResponseDto> {
    return this.carsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cars (including inactive)' })
  @ApiOkResponse({
    description: 'List of cars',
    type: [CarResponseDto],
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive cars',
  })
  async findAll(
    @Query('includeInactive') includeInactive?: string,
  ): Promise<CarResponseDto[]> {
    return this.carsService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a car by ID' })
  @ApiOkResponse({
    description: 'Car found',
    type: CarResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Car not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CarResponseDto> {
    return this.carsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a car model' })
  @ApiOkResponse({
    description: 'Car updated successfully',
    type: CarResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Car not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCarDto,
  ): Promise<CarResponseDto> {
    return this.carsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a car model' })
  @ApiNoContentResponse({ description: 'Car deactivated successfully' })
  @ApiNotFoundResponse({ description: 'Car not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.carsService.remove(id);
  }
}
