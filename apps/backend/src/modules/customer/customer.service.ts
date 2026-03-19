import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Customer } from 'src/database/entity/customer.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateCustomerDto } from '../../dto/create-customer.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private readonly uploadService: UploadService,
    private readonly dataSource: DataSource,
  ) {}

  async createCustomer(
    data: CreateCustomerDto,
    userId: string,
    organizationId: string,
    files: Express.Multer.File[] = [],
  ): Promise<Customer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const customerId = randomUUID();

      // Handle file uploads
      const fileUploads = await this.handleFileUploads(customerId, files);

      // Create customer data with file IDs
      const customerData = {
        ...data,
        id: customerId,
        createdById: userId,
        organizationId: organizationId,
        profilePhoto: fileUploads.profilePhoto,
        passportPhotos: fileUploads.passportPhotos,
        voterIdPhotos: fileUploads.voterIdPhotos,
        aadhaarIdPhotos: fileUploads.aadhaarIdPhotos,
      };

      const customer = queryRunner.manager.create(Customer, customerData);
      const savedCustomer = await queryRunner.manager.save(customer);

      await queryRunner.commitTransaction();
      return savedCustomer;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async handleFileUploads(
    customerId: string,
    files: Express.Multer.File[],
  ) {
    const fileUploads = {
      profilePhoto: undefined as string | undefined,
      passportPhotos: [] as string[],
      voterIdPhotos: [] as string[],
      aadhaarIdPhotos: [] as string[],
    };

    // Handle profile photo
    const profilePhotoFile = files.find((f) => f.fieldname === 'profilePhoto');
    if (profilePhotoFile) {
      fileUploads.profilePhoto = await this.uploadService.uploadSingle(
        profilePhotoFile,
        'customer',
      );
    }

    // Handle passport photos
    const passportPhotoFiles = files.filter((f) =>
      f.fieldname.startsWith('passportPhotos'),
    );
    if (passportPhotoFiles.length > 0) {
      fileUploads.passportPhotos = await this.uploadService.uploadMultiple(
        passportPhotoFiles,
        'customer',
      );
    }

    // Handle voter ID photos
    const voterIdPhotoFiles = files.filter((f) =>
      f.fieldname.startsWith('voterIdPhotos'),
    );
    if (voterIdPhotoFiles.length > 0) {
      fileUploads.voterIdPhotos = await this.uploadService.uploadMultiple(
        voterIdPhotoFiles,
        'customer',
      );
    }

    // Handle Aadhaar ID photos
    const aadhaarIdPhotoFiles = files.filter((f) =>
      f.fieldname.startsWith('aadhaarIdPhotos'),
    );
    if (aadhaarIdPhotoFiles.length > 0) {
      fileUploads.aadhaarIdPhotos = await this.uploadService.uploadMultiple(
        aadhaarIdPhotoFiles,
        'customer',
      );
    }

    return fileUploads;
  }

  async findAll(
    organizationId: string,
    limit: number = 10,
    offset: number = 0,
    search?: string,
  ): Promise<{
    customers: Customer[];
    total: number;
    hasMore: boolean;
  }> {
    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.organizationId = :organizationId', { organizationId });

    if (search) {
      queryBuilder.andWhere(
        '(customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR customer.email ILIKE :search OR customer.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated results
    const customers = await queryBuilder
      .leftJoinAndSelect('customer.createdBy', 'createdBy')
      .orderBy('customer.createdAt', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    const hasMore = offset + limit < total;

    return {
      customers,
      total,
      hasMore,
    };
  }

  async findByManagerTeam(
    organizationId: string,
    teamUserIds: string[],
    limit: number = 10,
    offset: number = 0,
    search?: string,
  ): Promise<{
    customers: Customer[];
    total: number;
    hasMore: boolean;
  }> {
    if (teamUserIds.length === 0) {
      return {
        customers: [],
        total: 0,
        hasMore: false,
      };
    }

    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.organizationId = :organizationId', { organizationId })
      .andWhere('customer.createdById IN (:...teamUserIds)', { teamUserIds });

    if (search) {
      queryBuilder.andWhere(
        '(customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR customer.email ILIKE :search OR customer.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await queryBuilder.getCount();

    const customers = await queryBuilder
      .leftJoinAndSelect('customer.createdBy', 'createdBy')
      .orderBy('customer.createdAt', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    const hasMore = offset + limit < total;

    return {
      customers,
      total,
      hasMore,
    };
  }

  async findOne(id: string): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    updateData: Partial<CreateCustomerDto>,
    files: Express.Multer.File[] = [],
  ): Promise<Customer | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Handle file uploads
      const fileUploads = await this.handleFileUploads(id, files);

      // Update customer data with file IDs
      const customerData = {
        ...updateData,
        ...(fileUploads.profilePhoto && {
          profilePhoto: fileUploads.profilePhoto,
        }),
        ...(fileUploads.passportPhotos.length > 0 && {
          passportPhotos: fileUploads.passportPhotos,
        }),
        ...(fileUploads.voterIdPhotos.length > 0 && {
          voterIdPhotos: fileUploads.voterIdPhotos,
        }),
        ...(fileUploads.aadhaarIdPhotos.length > 0 && {
          aadhaarIdPhotos: fileUploads.aadhaarIdPhotos,
        }),
      };

      await queryRunner.manager.update(Customer, id, customerData);
      await queryRunner.commitTransaction();

      return this.findOneWithFiles(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOneWithFiles(id: string): Promise<Customer | null> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) return null;

    return customer;
  }

  async delete(id: string): Promise<void> {
    await this.customerRepository.delete(id);
  }

  async search(
    query: string,
    organizationId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{
    customers: Customer[];
    total: number;
    hasMore: boolean;
  }> {
    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.organizationId = :organizationId', { organizationId })
      .andWhere(
        '(customer.firstName ILIKE :query OR customer.lastName ILIKE :query OR customer.email ILIKE :query OR customer.phone ILIKE :query OR customer.passportNumber ILIKE :query)',
        { query: `%${query}%` },
      );

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated results
    const customers = await queryBuilder
      .orderBy('customer.createdAt', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    const hasMore = offset + limit < total;

    return {
      customers,
      total,
      hasMore,
    };
  }
}
