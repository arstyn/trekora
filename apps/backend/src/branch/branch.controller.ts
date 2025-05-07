import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { BranchService } from './branch.service';
import { Branch } from './entity/branch.entity';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  // Create a new branch
  @Post()
  async create(@Body() branchData: Partial<Branch>): Promise<Branch> {
    return await this.branchService.create(branchData);
  }

  // Get all branches
  @Get()
  async findAll(): Promise<Branch[]> {
    return await this.branchService.findAll();
  }

  // Get a branch by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Branch | null> {
    return await this.branchService.findOne(id);
  }

  // Update a branch by ID
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Branch>,
  ): Promise<Branch | null> {
    return await this.branchService.update(id, updateData);
  }

  // Delete a branch by ID
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.branchService.remove(id);
  }
}
