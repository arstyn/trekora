import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FileManager,
  RelatedType,
} from '../../database/entity/file-manager.entity';
import * as fs from 'fs';
import { extname } from 'path';

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

  async upload(
    data: Partial<FileManager>,
    files: Array<Express.Multer.File>,
  ): Promise<FileManager[]> {
    let filesData: Array<any> = [];

    // Create upload directory for this related type
    const uploadDir = `./uploads/${data.relatedType}`;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (const file of files) {
      try {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const ext = extname(file.originalname);
        const filename = `${data.relatedType}-${data.relatedId}-${timestamp}${ext}`;
        const filePath = `${uploadDir}/${filename}`;

        // Save file to filesystem
        await fs.promises.writeFile(filePath, file.buffer);

        // Create database record
        const fileData = this.fileManagerRepository.create({
          filename: file.originalname, // Store original filename for display
          relatedId: data.relatedId,
          relatedType: data.relatedType,
          url: filePath, // Store actual file path
        });

        const savedFile = await this.fileManagerRepository.save(fileData);

        // Return file with HTTP URL for frontend access
        const fileWithHttpUrl = {
          ...savedFile,
          url: `/file-manager/serve/${savedFile.id}`,
        };

        filesData.push(fileWithHttpUrl);
      } catch (error: any) {
        throw new Error(`Local file save failed: ${error.message}`);
      }
    }
    return filesData;
  }

  async uploadOneFile(data: Partial<FileManager>, file: Express.Multer.File) {
    // Create upload directory for this related type
    const uploadDir = `./uploads/${data.relatedType}`;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const ext = extname(file.originalname);
      const filename = `${data.relatedType}-${data.relatedId}-${timestamp}${ext}`;
      const filePath = `${uploadDir}/${filename}`;

      // Save file to filesystem
      await fs.promises.writeFile(filePath, file.buffer);

      // Create database record
      const fileData = this.fileManagerRepository.create({
        filename: file.originalname, // Store original filename for display
        relatedId: data.relatedId,
        relatedType: data.relatedType,
        url: filePath, // Store actual file path
      });

      const savedFile = await this.fileManagerRepository.save(fileData);

      // Return file with HTTP URL for frontend access
      const fileWithHttpUrl = {
        ...savedFile,
        url: `/file-manager/serve/${savedFile.id}`,
      };

      return fileWithHttpUrl;
    } catch (error: any) {
      throw new Error(`Local file save failed: ${error.message}`);
    }
  }

  findAll() {
    return this.fileManagerRepository.find();
  }

  async findByRelatedEntity(relatedId: string, relatedType: RelatedType) {
    const files = await this.fileManagerRepository.find({
      where: { relatedId, relatedType },
      order: { createdAt: 'DESC' },
    });

    // Convert file paths to HTTP URLs for frontend access
    return files.map((file) => ({
      ...file,
      url: `/file-manager/serve/${file.id}`,
    }));
  }

  async findOne(id: string) {
    const file = await this.fileManagerRepository.findOne({ where: { id } });
    if (file) {
      // For frontend access, return HTTP URL
      return {
        ...file,
        url: `/file-manager/serve/${file.id}`,
      };
    }
    return file;
  }

  // Internal method to get file with actual file path (for file serving)
  async findOneWithPath(id: string) {
    return this.fileManagerRepository.findOne({ where: { id } });
  }

  findWithRelatedId(id: string) {
    return this.fileManagerRepository.find({ where: { relatedId: id } });
  }

  update(id: string, data: Partial<FileManager>) {
    return this.fileManagerRepository.update(id, data);
  }

  async remove(id: string) {
    // Get file record to get file path (use internal method with actual path)
    const fileRecord = await this.fileManagerRepository.findOne({
      where: { id },
    });

    if (fileRecord) {
      // Delete physical file if it exists
      if (fs.existsSync(fileRecord.url)) {
        try {
          await fs.promises.unlink(fileRecord.url);
        } catch (error) {
          console.warn(
            `Failed to delete physical file: ${fileRecord.url}`,
            error,
          );
          // Continue with database deletion even if file deletion fails
        }
      }

      // Delete database record
      await this.fileManagerRepository.delete(id);
    }

    return { deleted: true };
  }
}
