import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from '../../database/entity/package.entity';
import { PackageFormData } from '@repo/validation';

@Injectable()
export class PackageService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
  ) {}

  async create(createPackageDto: PackageFormData): Promise<Package> {
    const pkg = this.packageRepository.create({ ...createPackageDto });
    return this.packageRepository.save(pkg);
  }

  async findAll(): Promise<Package[]> {
    return this.packageRepository.find();
  }

  async findOne(id: string): Promise<Package> {
    const pkg = await this.packageRepository.findOneBy({ id });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async update(
    id: string,
    updatePackageDto: PackageFormData,
  ): Promise<Package> {
    await this.packageRepository.update(id, updatePackageDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.packageRepository.delete(id);
  }
}
