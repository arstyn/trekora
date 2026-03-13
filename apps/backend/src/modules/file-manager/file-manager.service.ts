import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FileManager,
  RelatedType,
} from '../../database/entity/file-manager.entity';
import * as fs from 'fs';
import { extname } from 'path';
import { ConfigService } from '@nestjs/config';
import { uploadFile } from '@uploadcare/upload-client';

@Injectable()
export class FileManagerService {
  private readonly logger = new Logger(FileManagerService.name);
  private readonly uploadMechanism: string;

  constructor(
    @InjectRepository(FileManager)
    private readonly fileManagerRepository: Repository<FileManager>,
    private readonly configService: ConfigService,
  ) {
    this.uploadMechanism =
      this.configService.get<string>('upload.mechanism') || 'local';
    this.logger.log(`Using upload mechanism: ${this.uploadMechanism}`);
  }

  create(data: Partial<FileManager>) {
    const file = this.fileManagerRepository.create(data);
    return this.fileManagerRepository.save(file);
  }

  async upload(
    data: Partial<FileManager>,
    files: Array<Express.Multer.File>,
  ): Promise<FileManager[]> {
    const filesData: Array<FileManager> = [];

    for (const file of files) {
      try {
        let savedFile: FileManager;

        if (this.uploadMechanism === 'uploadcare') {
          savedFile = await this.uploadToUploadcare(file, data);
        } else if (this.uploadMechanism === 's3') {
          savedFile = await this.uploadToS3(file, data);
        } else {
          savedFile = await this.uploadToLocal(file, data);
        }

        filesData.push(this.formatFileUrl(savedFile));
      } catch (error: any) {
        this.logger.error(`Upload failed: ${error.message}`);
        throw new Error(`Upload failed: ${error.message}`);
      }
    }
    return filesData;
  }

  async uploadOneFile(data: Partial<FileManager>, file: Express.Multer.File) {
    try {
      let savedFile: FileManager;

      if (this.uploadMechanism === 'uploadcare') {
        savedFile = await this.uploadToUploadcare(file, data);
      } else if (this.uploadMechanism === 's3') {
        savedFile = await this.uploadToS3(file, data);
      } else {
        savedFile = await this.uploadToLocal(file, data);
      }

      return this.formatFileUrl(savedFile);
    } catch (error: any) {
      this.logger.error(`Upload failed: ${error.message}`);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  private async uploadToLocal(
    file: Express.Multer.File,
    data: Partial<FileManager>,
  ): Promise<FileManager> {
    const uploadDir = `./uploads/${data.relatedType}`;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const ext = extname(file.originalname);
    const filename = `${data.relatedType}-${data.relatedId}-${timestamp}${ext}`;
    const filePath = `${uploadDir}/${filename}`;

    await fs.promises.writeFile(filePath, file.buffer);

    const fileData = this.fileManagerRepository.create({
      filename: file.originalname,
      relatedId: data.relatedId,
      relatedType: data.relatedType,
      url: filePath,
    });

    return this.fileManagerRepository.save(fileData);
  }

  private async uploadToUploadcare(
    file: Express.Multer.File,
    data: Partial<FileManager>,
  ): Promise<FileManager> {
    const publicKey = this.configService.get<string>('uploadcare.publicKey');
    if (!publicKey) {
      throw new Error('Uploadcare public key not configured');
    }

    const result = await uploadFile(file.buffer, {
      publicKey,
      fileName: file.originalname,
    });

    const fileData = this.fileManagerRepository.create({
      filename: file.originalname,
      relatedId: data.relatedId,
      relatedType: data.relatedType,
      url: result.cdnUrl as string,
    });

    return this.fileManagerRepository.save(fileData);
  }

  private async uploadToS3(
    file: Express.Multer.File,
    data: Partial<FileManager>,
  ): Promise<FileManager> {
    this.logger.warn('S3 upload mechanism requested but not fully implemented');
    return this.uploadToLocal(file, data);
  }

  private formatFileUrl(file: FileManager): FileManager {
    if (file.url && file.url.startsWith('http')) {
      return file;
    }
    return {
      ...file,
      url: `/file-manager/serve/${file.id}`,
    } as FileManager;
  }

  findAll() {
    return this.fileManagerRepository.find();
  }

  async findByRelatedEntity(relatedId: string, relatedType: RelatedType) {
    const files = await this.fileManagerRepository.find({
      where: { relatedId, relatedType },
      order: { createdAt: 'DESC' },
    });

    return files.map((file) => this.formatFileUrl(file));
  }

  async findOne(id: string) {
    const file = await this.fileManagerRepository.findOne({ where: { id } });
    if (file) {
      return this.formatFileUrl(file);
    }
    return file;
  }

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
    const fileRecord = await this.fileManagerRepository.findOne({
      where: { id },
    });

    if (fileRecord) {
      if (
        fileRecord.url &&
        !fileRecord.url.startsWith('http') &&
        fs.existsSync(fileRecord.url)
      ) {
        try {
          await fs.promises.unlink(fileRecord.url);
        } catch (error) {
          this.logger.warn(
            `Failed to delete physical file: ${fileRecord.url}`,
            error,
          );
        }
      }

      await this.fileManagerRepository.delete(id);
    }

    return { deleted: true };
  }
}
