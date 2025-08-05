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
  Res,
  StreamableFile,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
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

  @Get('serve/:id')
  async serveFile(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const fileRecord = await this.fileManagerService.findOneWithPath(id);
    if (!fileRecord) {
      throw new NotFoundException('File not found');
    }

    const filePath = join(process.cwd(), fileRecord.url);
    
    try {
      const file = createReadStream(filePath);
      
      // Set proper content type and headers
      const extension = fileRecord.filename.split('.').pop()?.toLowerCase();
      const contentType = this.getContentType(extension);
      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileRecord.filename}"`,
      });
      
      return new StreamableFile(file);
    } catch (error) {
      throw new NotFoundException('File not found on disk');
    }
  }

  private getContentType(extension?: string): string {
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      default:
        return 'application/octet-stream';
    }
  }
}
