import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileManager } from '../../database/entity/file-manager.entity';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class FileManagerService {
  constructor(
    @InjectRepository(FileManager)
    private readonly fileManagerRepository: Repository<FileManager>,
  ) {}

  create(data: Partial<FileManager>) {
    const file = this.fileManagerRepository.create(data);
    return this.fileManagerRepository.save(file);
  }

  async upload(data: Partial<FileManager>, files: Array<Express.Multer.File>) {
    let filesData: Array<FileManager> = [];
    for (const file of files) {
      const uploadPath = `/uploads/${data.relatedType}/${file.filename}`;

      try {
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        await fs.promises.writeFile(uploadPath, file.buffer);

        const fileData = this.fileManagerRepository.create({
          filename: file.filename,
          relatedId: data.relatedId,
          relatedType: data.relatedType,
          url: uploadPath,
        });
        filesData.push(fileData);
      } catch (error: any) {
        throw new Error(`Local file save failed: ${error.message}`);
      }
    }
    return filesData;
  }

  findAll() {
    return this.fileManagerRepository.find();
  }

  findOne(id: string) {
    return this.fileManagerRepository.findOne({ where: { id } });
  }

  findWithRelatedId(id: string) {
    return this.fileManagerRepository.find({ where: { relatedId: id } });
  }

  update(id: string, data: Partial<FileManager>) {
    return this.fileManagerRepository.update(id, data);
  }

  async remove(id: string) {
    await this.fileManagerRepository.delete(id);
    return { deleted: true };
  }
}
