import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { AuthGuard } from '../auth/guard/auth.guard';

@UseGuards(AuthGuard)
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Create a new user
  @Post()
  async create(@Body() userData: Partial<User>): Promise<User> {
    return await this.userService.create(userData);
  }

  // Get all users
  @Get()
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  // Get a user by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    return await this.userService.findOne(id);
  }

  // Update a user by ID
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
  ): Promise<User | null> {
    return await this.userService.update(id, updateData);
  }

  // Delete a user by ID
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.userService.remove(id);
  }
}
