import { Module } from '@nestjs/common';
import { BranchesController } from './branches.controller';
import { PublicBranchesController } from './public-branches.controller';
import { BranchesService } from './branches.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BranchesController, PublicBranchesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}
