import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/database/entity/customer.entity';
import { ILike, Repository } from 'typeorm';
import { CreateCustomerDto } from '../../dto/create-customer';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async createCustomer(
    data: CreateCustomerDto,
    userId: string,
    organizationId: string,
  ): Promise<Customer> {
    const customer = this.customerRepository.create({
      ...data,
      createdById: userId,
      organizationId: organizationId,
    });
    return this.customerRepository.save(customer);
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
    updateData: Partial<Customer>,
  ): Promise<Customer | null> {
    await this.customerRepository.update(id, updateData);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.customerRepository.delete(id);
  }

  async search(query: string): Promise<Customer[]> {
    return this.customerRepository.find({
      where: [
        { name: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
        { phone: ILike(`%${query}%`) },
      ],
    });
  }
}
