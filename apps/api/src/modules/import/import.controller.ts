import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Req,
  BadRequestException,
  Res,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ImportService, ImportResult } from './import.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import * as XLSX from 'xlsx';

interface ImportRequestDto {
  entityType: 'customer' | 'lead' | 'employee';
  updateExisting?: boolean;
}

@Controller('api/import')
@UseGuards(AuthGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAndImport(
    @UploadedFile() file: Express.Multer.File,
    @Body() importRequest: ImportRequestDto,
    @Req() req: any,
  ): Promise<ImportResult> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!importRequest.entityType) {
      throw new BadRequestException('Entity type is required');
    }

    const options = {
      entityType: importRequest.entityType,
      organizationId: req.user.organizationId,
      userId: req.user.userId,
      updateExisting: importRequest.updateExisting || false,
    };

    return await this.importService.processExcelFile(file.path, options);
  }

  @Get('template/:entityType')
  async getTemplate(
    @Param('entityType') entityType: string,
    @Res() res: Response,
  ): Promise<void> {
    const template = await this.importService.getImportTemplate(entityType);
    
    if (!template) {
      throw new BadRequestException(`Template not found for entity type: ${entityType}`);
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      template.headers,
      ...template.sampleData,
    ]);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${entityType}_import_template.xlsx"`);
    
    // Send file
    res.send(buffer);
  }

  @Get('templates')
  async getAvailableTemplates(): Promise<any> {
    return {
      templates: [
        {
          entityType: 'customer',
          name: 'Customer Import',
          description: 'Import customer data with fields: Name, Email, Phone, Address, Status, Notes',
          requiredFields: ['Name', 'Email', 'Phone'],
        },
        {
          entityType: 'lead',
          name: 'Lead Import',
          description: 'Import lead data with fields: Name, Email, Phone, Company, Status, Notes',
          requiredFields: ['Name'],
        },
        {
          entityType: 'employee',
          name: 'Employee Import',
          description: 'Import employee data with fields: Name, Email, Phone, Role, Address, Gender, Nationality, Join Date',
          requiredFields: ['Name', 'Email'],
        },
      ],
    };
  }
} 