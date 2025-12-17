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
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DiscountsService } from './discounts.service';
import {
  CreateDiscountDto,
  UpdateDiscountDto,
  DiscountWithUserDto,
} from './dto';
import { Roles, Role } from '../common/decorators';

@ApiTags('Admin Discounts')
@ApiBearerAuth()
@Controller('admin/discounts')
@Roles(Role.Employee)
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a discount for a customer' })
  @ApiCreatedResponse({
    description: 'Discount created successfully',
    type: DiscountWithUserDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({
    description: 'Invalid data or user is not a customer',
  })
  async create(@Body() dto: CreateDiscountDto): Promise<DiscountWithUserDto> {
    return this.discountsService.create(dto) as Promise<DiscountWithUserDto>;
  }

  @Get()
  @ApiOperation({ summary: 'Get all discounts' })
  @ApiOkResponse({
    description: 'List of all discounts',
    type: [DiscountWithUserDto],
  })
  async findAll(): Promise<DiscountWithUserDto[]> {
    return this.discountsService.findAll() as Promise<DiscountWithUserDto[]>;
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all discounts for a specific user' })
  @ApiOkResponse({
    description: 'List of discounts for the user',
    type: [DiscountWithUserDto],
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<DiscountWithUserDto[]> {
    return this.discountsService.findByUser(userId) as Promise<
      DiscountWithUserDto[]
    >;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get discount by ID' })
  @ApiOkResponse({
    description: 'Discount found',
    type: DiscountWithUserDto,
  })
  @ApiNotFoundResponse({ description: 'Discount not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DiscountWithUserDto> {
    return this.discountsService.findOne(id) as Promise<DiscountWithUserDto>;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a discount' })
  @ApiOkResponse({
    description: 'Discount updated successfully',
    type: DiscountWithUserDto,
  })
  @ApiNotFoundResponse({ description: 'Discount not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDiscountDto,
  ): Promise<DiscountWithUserDto> {
    return this.discountsService.update(
      id,
      dto,
    ) as Promise<DiscountWithUserDto>;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a discount' })
  @ApiNoContentResponse({ description: 'Discount deleted successfully' })
  @ApiNotFoundResponse({ description: 'Discount not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.discountsService.remove(id);
  }
}
