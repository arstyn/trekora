import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Create a new user
  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return await this.userRepository.save(newUser);
  }

  // Find all users
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  // Find all users
  async findOneWithEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  // Find a user by ID
  async findOne(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }



  // Update a user by ID
  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, updateData);
    return await this.findOne(id);
  }

  // Delete a user by ID
  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
