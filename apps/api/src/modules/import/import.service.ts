import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { readFileSync, unlinkSync } from 'fs';
import { Customer } from '../../database/entity/customer.entity';
import { Lead } from '../../database/entity/lead.entity';
import { Employee } from '../../database/entity/employee.entity';
import { Branch } from '../../database/entity/branch.entity';
import { ImportTemplate } from '../../database/entity/import-template.entity';
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
  entityType: 'customer' | 'lead' | 'employee' | 'branch';
  organizationId: string;
  userId: string;
  updateExisting?: boolean;
  columnMapping?: Record<string, string>; // Maps Excel column names to entity fields
}

export interface ColumnMapping {
  excelColumn: string;
  entityField: string;
  required: boolean;
  dataType: 'string' | 'email' | 'phone' | 'date' | 'number' | 'boolean';
  description?: string;
}

export interface EntitySchema {
  entityType: string;
  name: string;
  description: string;
  availableFields: ColumnMapping[];
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
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(ImportTemplate)
    private readonly importTemplateRepository: Repository<ImportTemplate>,
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
        const rowData = this.mapRowToObject(headers, row, options.columnMapping);
        
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
            case 'branch':
              await this.importBranch(rowData, options);
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

  private mapRowToObject(headers: string[], row: any[], columnMapping?: Record<string, string>): Record<string, any> {
    const obj: Record<string, any> = {};
    
    headers.forEach((header, index) => {
      if (header && row[index] !== undefined) {
        const cleanHeader = header.trim();
        const entityField = columnMapping?.[cleanHeader] || cleanHeader.toLowerCase();
        obj[entityField] = row[index];
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

  private async importBranch(data: Record<string, any>, options: ImportOptions): Promise<void> {
    const requiredFields = ['name', 'location'];
    this.validateRequiredFields(data, requiredFields);

    const existingBranch = await this.branchRepository.findOne({
      where: { 
        name: data.name,
        organizationId: options.organizationId,
      },
    });

    if (existingBranch && !options.updateExisting) {
      throw new Error(`Branch with name ${data.name} already exists`);
    }

    const branchData = {
      name: data.name,
      location: data.location,
      isActive: data.isActive !== undefined ? data.isActive : true,
      organizationId: options.organizationId,
    };

    if (existingBranch && options.updateExisting) {
      await this.branchRepository.update(existingBranch.id, branchData);
    } else {
      await this.branchRepository.save(branchData);
    }
  }

  private validateRequiredFields(data: Record<string, any>, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (!data[field] || data[field].toString().trim() === '') {
        throw new Error(`Required field '${field}' is missing or empty`);
      }
    }
  }

  async getEntitySchemas(): Promise<EntitySchema[]> {
    return [
      {
        entityType: 'customer',
        name: 'Customer',
        description: 'Import customer data with customizable field mapping',
        availableFields: [
          { excelColumn: 'Name', entityField: 'name', required: true, dataType: 'string', description: 'Customer full name' },
          { excelColumn: 'Email', entityField: 'email', required: true, dataType: 'email', description: 'Customer email address' },
          { excelColumn: 'Phone', entityField: 'phone', required: true, dataType: 'phone', description: 'Customer phone number' },
          { excelColumn: 'Address', entityField: 'address', required: false, dataType: 'string', description: 'Customer address' },
          { excelColumn: 'Status', entityField: 'status', required: false, dataType: 'string', description: 'Customer status (active, inactive, pending)' },
          { excelColumn: 'Notes', entityField: 'notes', required: false, dataType: 'string', description: 'Additional notes about the customer' },
        ],
      },
      {
        entityType: 'lead',
        name: 'Lead',
        description: 'Import lead data with customizable field mapping',
        availableFields: [
          { excelColumn: 'Name', entityField: 'name', required: true, dataType: 'string', description: 'Lead full name' },
          { excelColumn: 'Email', entityField: 'email', required: false, dataType: 'email', description: 'Lead email address' },
          { excelColumn: 'Phone', entityField: 'phone', required: false, dataType: 'phone', description: 'Lead phone number' },
          { excelColumn: 'Company', entityField: 'company', required: false, dataType: 'string', description: 'Company name' },
          { excelColumn: 'Status', entityField: 'status', required: false, dataType: 'string', description: 'Lead status (new, contacted, qualified, lost, converted)' },
          { excelColumn: 'Notes', entityField: 'notes', required: false, dataType: 'string', description: 'Additional notes about the lead' },
        ],
      },
      {
        entityType: 'employee',
        name: 'Employee',
        description: 'Import employee data with customizable field mapping',
        availableFields: [
          { excelColumn: 'Name', entityField: 'name', required: true, dataType: 'string', description: 'Employee full name' },
          { excelColumn: 'Email', entityField: 'email', required: true, dataType: 'email', description: 'Employee email address' },
          { excelColumn: 'Phone', entityField: 'phone', required: false, dataType: 'phone', description: 'Employee phone number' },
          { excelColumn: 'Role', entityField: 'role', required: false, dataType: 'string', description: 'Employee role (admin, manager, employee, user)' },
          { excelColumn: 'Address', entityField: 'address', required: false, dataType: 'string', description: 'Employee address' },
          { excelColumn: 'Gender', entityField: 'gender', required: false, dataType: 'string', description: 'Employee gender' },
          { excelColumn: 'Nationality', entityField: 'nationality', required: false, dataType: 'string', description: 'Employee nationality' },
          { excelColumn: 'Join Date', entityField: 'joinDate', required: false, dataType: 'date', description: 'Employee join date (YYYY-MM-DD)' },
          { excelColumn: 'Date of Birth', entityField: 'dateOfBirth', required: false, dataType: 'date', description: 'Employee date of birth (YYYY-MM-DD)' },
          { excelColumn: 'Status', entityField: 'status', required: false, dataType: 'string', description: 'Employee status (active, inactive, suspended, terminated)' },
        ],
      },
      {
        entityType: 'branch',
        name: 'Branch',
        description: 'Import branch data with customizable field mapping',
        availableFields: [
          { excelColumn: 'Name', entityField: 'name', required: true, dataType: 'string', description: 'Branch name' },
          { excelColumn: 'Location', entityField: 'location', required: true, dataType: 'string', description: 'Branch location/address' },
          { excelColumn: 'Is Active', entityField: 'isActive', required: false, dataType: 'boolean', description: 'Branch active status (true/false)' },
        ],
      },
    ];
  }

  async generateCustomTemplate(entityType: string, columnMapping: Record<string, string>): Promise<any> {
    const schemas = await this.getEntitySchemas();
    const schema = schemas.find(s => s.entityType === entityType);
    
    if (!schema) {
      throw new BadRequestException(`Entity type ${entityType} not found`);
    }

    // Create headers based on the column mapping
    const headers = Object.keys(columnMapping);
    
    // Generate sample data
    const sampleData = [
      ['John Doe', 'john@example.com', '+1234567890', '123 Main St', 'active', 'VIP customer'],
      ['Jane Smith', 'jane@example.com', '+0987654321', '456 Oak Ave', 'pending', 'New customer'],
    ];

    return {
      headers,
      sampleData,
      entityType,
      columnMapping,
      schema,
    };
  }

  async validateColumnMapping(entityType: string, columnMapping: Record<string, string>): Promise<{ valid: boolean; errors: string[] }> {
    const schemas = await this.getEntitySchemas();
    const schema = schemas.find(s => s.entityType === entityType);
    
    if (!schema) {
      return { valid: false, errors: [`Entity type ${entityType} not found`] };
    }

    const errors: string[] = [];
    const requiredFields = schema.availableFields.filter(field => field.required);
    
    // Check if all required fields are mapped
    for (const field of requiredFields) {
      const isMapped = Object.values(columnMapping).includes(field.entityField);
      if (!isMapped) {
        errors.push(`Required field '${field.entityField}' is not mapped`);
      }
    }

    // Check if mapped fields exist in schema
    for (const [excelColumn, entityField] of Object.entries(columnMapping)) {
      const fieldExists = schema.availableFields.some(field => field.entityField === entityField);
      if (!fieldExists) {
        errors.push(`Field '${entityField}' is not valid for entity type '${entityType}'`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Template Management Methods
  async getTemplates(organizationId: string): Promise<any[]> {
    return await this.importTemplateRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async createTemplate(templateData: any): Promise<any> {
    const template = this.importTemplateRepository.create(templateData);
    return await this.importTemplateRepository.save(template);
  }

  async getTemplateById(id: string, organizationId: string): Promise<any> {
    const template = await this.importTemplateRepository.findOne({
      where: { id, organizationId },
    });
    
    if (!template) {
      throw new BadRequestException(`Template with id ${id} not found`);
    }
    
    return template;
  }

  async updateTemplate(id: string, templateData: any): Promise<any> {
    const template = await this.getTemplateById(id, templateData.organizationId);
    Object.assign(template, templateData);
    return await this.importTemplateRepository.save(template);
  }

  async deleteTemplate(id: string, organizationId: string): Promise<void> {
    const template = await this.getTemplateById(id, organizationId);
    await this.importTemplateRepository.remove(template);
  }

  async generateTemplateExcel(template: any): Promise<Buffer> {
    // Generate Excel file based on template configuration
    const headers = template.columns
      .filter((col: any) => col.isVisible)
      .sort((a: any, b: any) => a.order - b.order)
      .map((col: any) => col.excelColumnName);

    const sampleData = [
      ['John Doe', 'john@example.com', '+1234567890', '123 Main St', 'active', 'VIP customer'],
      ['Jane Smith', 'jane@example.com', '+0987654321', '456 Oak Ave', 'pending', 'New customer'],
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
} 