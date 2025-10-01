import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Customer } from 'src/database/entity/customer.entity';
import { RelatedType } from 'src/database/entity/file-manager.entity';
import { DataSource, ILike, Repository } from 'typeorm';
import { CreateCustomerDto } from '../../dto/create-customer';
import { FileManagerService } from '../file-manager/file-manager.service';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private readonly fileManagerService: FileManagerService,
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
      const fileData = await this.fileManagerService.uploadOneFile(
        { relatedId: customerId, relatedType: RelatedType.CUSTOMER },
        profilePhotoFile,
      );
      fileUploads.profilePhoto = fileData.id;
    }

    // Handle passport photos
    const passportPhotoFiles = files.filter((f) =>
      f.fieldname.startsWith('passportPhotos'),
    );
    if (passportPhotoFiles.length > 0) {
      const filesData = await this.fileManagerService.upload(
        { relatedId: customerId, relatedType: RelatedType.CUSTOMER },
        passportPhotoFiles,
      );
      fileUploads.passportPhotos = filesData.map((f) => f.id);
    }

    // Handle voter ID photos
    const voterIdPhotoFiles = files.filter((f) =>
      f.fieldname.startsWith('voterIdPhotos'),
    );
    if (voterIdPhotoFiles.length > 0) {
      const filesData = await this.fileManagerService.upload(
        { relatedId: customerId, relatedType: RelatedType.CUSTOMER },
        voterIdPhotoFiles,
      );
      fileUploads.voterIdPhotos = filesData.map((f) => f.id);
    }

    // Handle Aadhaar ID photos
    const aadhaarIdPhotoFiles = files.filter((f) =>
      f.fieldname.startsWith('aadhaarIdPhotos'),
    );
    if (aadhaarIdPhotoFiles.length > 0) {
      const filesData = await this.fileManagerService.upload(
        { relatedId: customerId, relatedType: RelatedType.CUSTOMER },
        aadhaarIdPhotoFiles,
      );
      fileUploads.aadhaarIdPhotos = filesData.map((f) => f.id);
    }

    return fileUploads;
  }
  async findAll(organizationId: string): Promise<Customer[]> {
    return this.customerRepository.find({
      where: {
        organizationId,
      },
    });
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

    // Get file URLs for all photo fields
    const files = await this.fileManagerService.findByRelatedEntity(
      id,
      RelatedType.CUSTOMER,
    );

    // Map file IDs to URLs
    const fileMap = new Map(files.map((f) => [f.id, f.url]));

    return {
      ...customer,
      profilePhoto: customer.profilePhoto
        ? fileMap.get(customer.profilePhoto)
        : undefined,
      passportPhotos:
        customer.passportPhotos?.map((id) => fileMap.get(id)).filter(Boolean) ||
        [],
      voterIdPhotos:
        customer.voterIdPhotos?.map((id) => fileMap.get(id)).filter(Boolean) ||
        [],
      aadhaarIdPhotos:
        customer.aadhaarIdPhotos
          ?.map((id) => fileMap.get(id))
          .filter(Boolean) || [],
    } as Customer;
  }

  async delete(id: string): Promise<void> {
    await this.customerRepository.delete(id);
  }

  async search(query: string): Promise<Customer[]> {
    return this.customerRepository.find({
      where: [
        { firstName: ILike(`%${query}%`) },
        { lastName: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
        { phone: ILike(`%${query}%`) },
        { passportNumber: ILike(`%${query}%`) },
      ],
    });
  }
}
