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
  ApiTags,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  InventoryWithDetailsDto,
  AvailabilityQueryDto,
  AvailabilityResponseDto,
} from './dto';
import { Roles, Role } from '../common/decorators';

@ApiTags('Admin Inventory')
@ApiBearerAuth()
@Controller('admin/inventory')
@Roles(Role.Employee)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update inventory stock' })
  @ApiCreatedResponse({
    description: 'Inventory created/updated successfully',
    type: InventoryWithDetailsDto,
  })
  @ApiNotFoundResponse({ description: 'Branch or Car not found' })
  async upsert(
    @Body() dto: CreateInventoryDto,
  ): Promise<InventoryWithDetailsDto> {
    return this.inventoryService.upsert(
      dto,
    ) as Promise<InventoryWithDetailsDto>;
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory' })
  @ApiOkResponse({
    description: 'List of inventory',
    type: [InventoryWithDetailsDto],
  })
  async findAll(): Promise<InventoryWithDetailsDto[]> {
    return this.inventoryService.findAll() as Promise<
      InventoryWithDetailsDto[]
    >;
  }

  @Get('availability')
  @ApiOperation({ summary: 'Check car availability' })
  @ApiOkResponse({
    description: 'Availability information',
    type: [AvailabilityResponseDto],
  })
  async checkAvailability(
    @Query() query: AvailabilityQueryDto,
  ): Promise<AvailabilityResponseDto[]> {
    return this.inventoryService.checkAvailability(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory by ID' })
  @ApiOkResponse({
    description: 'Inventory found',
    type: InventoryWithDetailsDto,
  })
  @ApiNotFoundResponse({ description: 'Inventory not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InventoryWithDetailsDto> {
    return this.inventoryService.findOne(
      id,
    ) as Promise<InventoryWithDetailsDto>;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update inventory quantity' })
  @ApiOkResponse({
    description: 'Inventory updated successfully',
    type: InventoryWithDetailsDto,
  })
  @ApiNotFoundResponse({ description: 'Inventory not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInventoryDto,
  ): Promise<InventoryWithDetailsDto> {
    return this.inventoryService.update(
      id,
      dto,
    ) as Promise<InventoryWithDetailsDto>;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete inventory entry' })
  @ApiNoContentResponse({ description: 'Inventory deleted successfully' })
  @ApiNotFoundResponse({ description: 'Inventory not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.inventoryService.remove(id);
  }
}
