import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { BranchResponseDto } from './dto';
import { Public } from '../common/decorators';

@ApiTags('Branches')
@Controller('branches')
export class PublicBranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all active branches' })
  @ApiOkResponse({
    description: 'List of active branches',
    type: [BranchResponseDto],
  })
  async findAll(): Promise<BranchResponseDto[]> {
    return this.branchesService.findAll(false);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get branch details by ID' })
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
}
