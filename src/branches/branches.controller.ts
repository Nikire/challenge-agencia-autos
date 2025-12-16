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
import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto, BranchResponseDto } from './dto';
import { Roles, Role } from '../common/decorators';

@ApiTags('Admin Branches')
@ApiBearerAuth()
@Controller('admin/branches')
@Roles(Role.Employee)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new branch' })
  @ApiCreatedResponse({
    description: 'Branch created successfully',
    type: BranchResponseDto,
  })
  async create(@Body() dto: CreateBranchDto): Promise<BranchResponseDto> {
    return this.branchesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all branches' })
  @ApiOkResponse({
    description: 'List of branches',
    type: [BranchResponseDto],
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive branches',
  })
  async findAll(
    @Query('includeInactive') includeInactive?: string,
  ): Promise<BranchResponseDto[]> {
    return this.branchesService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a branch by ID' })
  @ApiOkResponse({
    description: 'Branch found',
    type: BranchResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Branch not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BranchResponseDto> {
    return this.branchesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a branch' })
  @ApiOkResponse({
    description: 'Branch updated successfully',
    type: BranchResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Branch not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBranchDto,
  ): Promise<BranchResponseDto> {
    return this.branchesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a branch' })
  @ApiNoContentResponse({ description: 'Branch deactivated successfully' })
  @ApiNotFoundResponse({ description: 'Branch not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.branchesService.remove(id);
  }
}
