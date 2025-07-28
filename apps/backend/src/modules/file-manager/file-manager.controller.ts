import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  FileManager,
  RelatedType,
} from '../../database/entity/file-manager.entity';
import { FileManagerService } from './file-manager.service';

class CreateFileManagerDto {
  filename: string;
  relatedId: string;
  relatedType: FileManager['relatedType'];
  url: string;
}

class UpdateFileManagerDto {
  filename?: string;
  relatedId?: string;
  relatedType?: FileManager['relatedType'];
  url?: string;
}

@Controller('file-manager')
export class FileManagerController {
  constructor(private readonly fileManagerService: FileManagerService) {}

  @Post()
  create(@Body() dto: CreateFileManagerDto) {
    return this.fileManagerService.create(dto);
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: { relatedId: string; relatedType: RelatedType },
  ) {
    // Save file metadata to DB
    return this.fileManagerService.upload(body, files);
  }

  @Get()
  findAll() {
    return this.fileManagerService.findAll();
  }

  @Get('related-id/:id')
  findWithRelatedId(@Param('id') id: string) {
    return this.fileManagerService.findWithRelatedId(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileManagerService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFileManagerDto) {
    return this.fileManagerService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileManagerService.remove(id);
  }
}
