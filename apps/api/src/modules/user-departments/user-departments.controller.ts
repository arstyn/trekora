import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserDepartmentsService } from './user-departments.service';
import { UserDepartments } from './entity/user-departments.entity';
import { AuthGuard } from '../auth/guard/auth.guard';

@UseGuards(AuthGuard)
@Controller('api/user-departments')
export class UserDepartmentsController {
  constructor(
    private readonly userDepartmentsService: UserDepartmentsService,
  ) {}

  @Post()
  async create(@Body() data: Partial<UserDepartments>) {
    return this.userDepartmentsService.create(data);
  }

  @Get()
  async findAll() {
    return this.userDepartmentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userDepartmentsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<UserDepartments>,
  ) {
    return this.userDepartmentsService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.userDepartmentsService.remove(id);
    return { message: 'Deleted successfully' };
  }
}
