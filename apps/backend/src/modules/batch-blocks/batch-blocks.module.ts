import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { BatchBlock } from 'src/database/entity/batch-block.entity';
import { BatchLog } from 'src/database/entity/batch-log.entity';
import { Batch } from 'src/database/entity/batch.entity';
import { Organization } from 'src/database/entity/organization.entity';
import { BatchBlocksController } from './batch-blocks.controller';
import { BatchBlocksService } from './batch-blocks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BatchBlock, Batch, Organization, BatchLog]),
    JwtModule.register({}),
  ],
  controllers: [BatchBlocksController],
  providers: [BatchBlocksService],
  exports: [BatchBlocksService],
})
export class BatchBlocksModule { }
