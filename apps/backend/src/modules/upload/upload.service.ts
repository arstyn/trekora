import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { uploadFile } from '@uploadcare/upload-client';
import * as fs from 'fs';
import { extname } from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadMechanism: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadMechanism =
      this.configService.get<string>('UPLOAD_MECHANISM') ||
      this.configService.get<string>('upload.mechanism') ||
      'local';
    this.logger.log(`Using upload mechanism: ${this.uploadMechanism}`);
  }

  async uploadMultiple(
    files: Array<Express.Multer.File>,
    folderType: string = 'general',
  ): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const url = await this.uploadSingle(file, folderType);
      urls.push(url);
    }
    return urls;
  }

  async uploadSingle(
    file: Express.Multer.File,
    folderType: string = 'general',
  ): Promise<string> {
    try {
      if (this.uploadMechanism === 'uploadcare') {
        return await this.uploadToUploadcare(file);
      } else if (this.uploadMechanism === 's3') {
        return await this.uploadToS3(file, folderType);
      } else {
        return await this.uploadToLocal(file, folderType);
      }
    } catch (error: any) {
      this.logger.error(`Upload failed: ${error.message}`);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  private async uploadToLocal(
    file: Express.Multer.File,
    folderType: string,
  ): Promise<string> {
    const uploadDir = `./uploads/${folderType}`;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const ext = extname(file.originalname);
    const filename = `${folderType}-${timestamp}${ext}`;
    const filePath = `${uploadDir}/${filename}`;

    await fs.promises.writeFile(filePath, file.buffer);

    // Assuming backend is running on process.env.BACKEND_URL or we just return a relative path that frontend constructs.
    // The user requested: "create a url to access the file from uploads folder. use that in the frontend."
    // Let's use BACKEND_URL from env, fallback to localhost:3000
    const backendUrl =
      this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000';
    return `${backendUrl}/uploads/${folderType}/${filename}`;
  }

  private async uploadToUploadcare(file: Express.Multer.File): Promise<string> {
    const publicKey =
      this.configService.get<string>('UPLOADCARE_PUBLIC_KEY') ||
      this.configService.get<string>('uploadcare.publicKey');
    if (!publicKey) {
      throw new Error('Uploadcare public key not configured');
    }

    const result = await uploadFile(file.buffer, {
      publicKey,
      fileName: file.originalname,
    });

    const CDN_BASE = process.env.UPLOADCARE_CDN_BASE;

    return `${CDN_BASE}/${result.uuid}/${result.name}`;
  }

  private async uploadToS3(
    file: Express.Multer.File,
    folderType: string,
  ): Promise<string> {
    this.logger.warn('S3 upload mechanism requested but not fully implemented');
    return this.uploadToLocal(file, folderType);
  }
}

