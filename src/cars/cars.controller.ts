import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CarsService } from './cars.service';
import { CarResponseDto } from './dto';
import { Public } from '../common/decorators';

@ApiTags('Cars')
@Controller('cars')
@Public()
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available cars' })
  @ApiOkResponse({
    description: 'List of available cars',
    type: [CarResponseDto],
  })
  async findAll(): Promise<CarResponseDto[]> {
    return this.carsService.findAll();
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
}
