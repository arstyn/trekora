import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileManagerService } from './file-manager.service';
import { FileManagerController } from './file-manager.controller';
import { FileManager } from '../../database/entity/file-manager.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileManager])],
  providers: [FileManagerService],
  controllers: [FileManagerController],
  exports: [FileManagerService],
})
export class FileManagerModule {}
