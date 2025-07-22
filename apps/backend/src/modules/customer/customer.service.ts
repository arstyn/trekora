import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/database/entity/customer.entity';
import { Repository } from 'typeorm';
import { CreateCustomerDto } from '../../dto/create-customer';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepository.create(data);
    return this.customerRepository.save(customer);
  }
  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find();
  }
  async findOne(id: number): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { id } });
  }
  async update(
    id: number,
    updateData: Partial<Customer>,
  ): Promise<Customer | null> {
    await this.customerRepository.update(id, updateData);
    return this.findOne(id);
  }
  async delete(id: number): Promise<void> {
    await this.customerRepository.delete(id);
  }
}
