import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Package } from './entity/package.entity';
import { Repository } from 'typeorm'
import { ICreatePackageDto } from '@repo/api/package/dto/create-package.dto'

@Injectable()
export class PackageService {
    constructor(
        @InjectRepository(Package)
        private packageRepo: Repository<Package>
    ) { }
    async create(data: ICreatePackageDto): Promise<Package> {
        try {
            const newPackage = await this.packageRepo.create(data)
            return await this.packageRepo.save(newPackage)
        } catch (error) {
            throw new InternalServerErrorException('Failed to create package');
        }
    }


    async findAll(): Promise<Package[]> {
        try {
          return await this.packageRepo.find();
        } catch (error) {
          throw new InternalServerErrorException('Failed to fetch packages');
        }
      }

      async findOne(id: string): Promise<Package> {
        try {
          const pkg = await this.packageRepo.findOne({ where: { id } });
          if (!pkg) {
            throw new NotFoundException('Package not found');
          }
          return pkg;
        } catch (error) {
          if (error instanceof NotFoundException) throw error;
          throw new InternalServerErrorException('Failed to fetch package');
        }
      }

      async update(id: string, data: ICreatePackageDto): Promise<Package> {
        try {
          const result = await this.packageRepo.update(id, data);
          if (result.affected === 0) {
            throw new NotFoundException('Package not found');
          }
          return await this.findOne(id);
        } catch (error) {
          if (error instanceof NotFoundException) throw error;
          throw new InternalServerErrorException('Failed to update package');
        }
      }


      async delete(id: string): Promise<void> {
        try {
          const result = await this.packageRepo.delete(id);
          if (result.affected === 0) {
            throw new NotFoundException('Package not found');
          }
        } catch (error) {
          if (error instanceof NotFoundException) throw error;
          throw new InternalServerErrorException('Failed to delete package');
        }
      }


}
