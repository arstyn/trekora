import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { readFileSync, unlinkSync } from 'fs';
import { Customer } from '../../database/entity/customer.entity';
import { Lead } from '../../database/entity/lead.entity';
import { Employee } from '../../database/entity/employee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../database/entity/role.entity';

export interface ImportResult {
  success: boolean;
  totalRows: number;
  importedRows: number;
  failedRows: number;
  errors: string[];
  message: string;
}

export interface ImportOptions {
  entityType: 'customer' | 'lead' | 'employee';
  organizationId: string;
  userId: string;
  updateExisting?: boolean;
}

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async processExcelFile(filePath: string, options: ImportOptions): Promise<ImportResult> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (data.length < 2) {
        throw new BadRequestException('Excel file must have at least a header row and one data row');
      }

      const headers = data[0] as string[];
      const rows = data.slice(1) as any[][];

      this.logger.log(`Processing ${rows.length} rows for ${options.entityType}`);

      let importedRows = 0;
      let failedRows = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowData = this.mapRowToObject(headers, row);
        
        try {
          switch (options.entityType) {
            case 'customer':
              await this.importCustomer(rowData, options);
              break;
            case 'lead':
              await this.importLead(rowData, options);
              break;
            case 'employee':
              await this.importEmployee(rowData, options);
              break;
            default:
              throw new BadRequestException(`Unsupported entity type: ${options.entityType}`);
          }
          importedRows++;
        } catch (error) {
          failedRows++;
          errors.push(`Row ${i + 2}: ${(error as any)?.message}`);
          this.logger.error(`Failed to import row ${i + 2}:`, (error as any)?.message);
        }
      }

      // Clean up the uploaded file
      try {
        unlinkSync(filePath);
      } catch (error) {
        this.logger.warn(`Failed to delete uploaded file: ${filePath}`);
      }

      return {
        success: failedRows === 0,
        totalRows: rows.length,
        importedRows,
        failedRows,
        errors,
        message: `Successfully imported ${importedRows} out of ${rows.length} rows`,
      };
    } catch (error) {
      this.logger.error('Error processing Excel file:', error);
      throw new BadRequestException(`Failed to process Excel file: ${(error as any)?.message}`);
    }
  }

  private mapRowToObject(headers: string[], row: any[]): Record<string, any> {
    const obj: Record<string, any> = {};
    headers.forEach((header, index) => {
      if (header && row[index] !== undefined) {
        obj[header.trim().toLowerCase()] = row[index];
      }
    });
    return obj;
  }

  private async importCustomer(data: Record<string, any>, options: ImportOptions): Promise<void> {
    const requiredFields = ['name', 'email', 'phone'];
    this.validateRequiredFields(data, requiredFields);

    const existingCustomer = await this.customerRepository.findOne({
      where: { email: data.email },
    });

    if (existingCustomer && !options.updateExisting) {
      throw new Error(`Customer with email ${data.email} already exists`);
    }

    const customerData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address || '',
      status: data.status || 'pending',
      notes: data.notes || '',
    };

    if (existingCustomer && options.updateExisting) {
      await this.customerRepository.update(existingCustomer.id, customerData);
    } else {
      await this.customerRepository.save(customerData);
    }
  }

  private async importLead(data: Record<string, any>, options: ImportOptions): Promise<void> {
    const requiredFields = ['name'];
    this.validateRequiredFields(data, requiredFields);

    const existingLead = await this.leadRepository.findOne({
      where: { 
        name: data.name,
        organizationId: options.organizationId,
      },
    });

    if (existingLead && !options.updateExisting) {
      throw new Error(`Lead with name ${data.name} already exists`);
    }

    const leadData = {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      notes: data.notes || null,
      status: data.status || 'new',
      createdById: options.userId,
      organizationId: options.organizationId,
    };

    if (existingLead && options.updateExisting) {
      await this.leadRepository.update(existingLead.id, leadData);
    } else {
      await this.leadRepository.save(leadData);
    }
  }

  private async importEmployee(data: Record<string, any>, options: ImportOptions): Promise<void> {
    const requiredFields = ['name', 'email'];
    this.validateRequiredFields(data, requiredFields);

    const existingEmployee = await this.employeeRepository.findOne({
      where: { 
        email: data.email,
        organizationId: options.organizationId,
      },
    });

    if (existingEmployee && !options.updateExisting) {
      throw new Error(`Employee with email ${data.email} already exists`);
    }

    let roleId = null;
    if (data.role) {
      const role = await this.roleRepository.findOne({
        where: { name: data.role },
      });
      if (role) {
        roleId = role.id;
      }
    }

    const employeeData = {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      address: data.address || null,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      gender: data.gender || null,
      nationality: data.nationality || null,
      maritalStatus: data.maritalStatus || null,
      joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
      status: data.status || 'active',
      organizationId: options.organizationId,
      roleId,
    };

    if (existingEmployee && options.updateExisting) {
      await this.employeeRepository.update(existingEmployee.id, employeeData);
    } else {
      await this.employeeRepository.save(employeeData);
    }
  }

  private validateRequiredFields(data: Record<string, any>, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (!data[field] || data[field].toString().trim() === '') {
        throw new Error(`Required field '${field}' is missing or empty`);
      }
    }
  }

  async getImportTemplate(entityType: string): Promise<any> {
    const templates = {
      customer: {
        headers: ['Name', 'Email', 'Phone', 'Address', 'Status', 'Notes'],
        sampleData: [
          ['John Doe', 'john@example.com', '+1234567890', '123 Main St', 'active', 'VIP customer'],
          ['Jane Smith', 'jane@example.com', '+0987654321', '456 Oak Ave', 'pending', 'New customer'],
        ],
      },
      lead: {
        headers: ['Name', 'Email', 'Phone', 'Company', 'Status', 'Notes'],
        sampleData: [
          ['John Doe', 'john@example.com', '+1234567890', 'ABC Corp', 'new', 'Interested in package'],
          ['Jane Smith', 'jane@example.com', '+0987654321', 'XYZ Inc', 'contacted', 'Follow up needed'],
        ],
      },
      employee: {
        headers: ['Name', 'Email', 'Phone', 'Role', 'Address', 'Gender', 'Nationality', 'Join Date'],
        sampleData: [
          ['John Doe', 'john@example.com', '+1234567890', 'manager', '123 Main St', 'male', 'US', '2024-01-01'],
          ['Jane Smith', 'jane@example.com', '+0987654321', 'employee', '456 Oak Ave', 'female', 'UK', '2024-02-01'],
        ],
      },
    };

    return templates[entityType] || null;
  }
} 