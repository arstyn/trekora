import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Branch } from './entity/branch.entity';
import { IBranchCreateDTO } from '@repo/api/branch/dto/create-branch.dto';
import { IBranchUpdateDTO } from '@repo/api/branch/dto/update-branch.dto';
import { BranchService } from './branch.service';
import { ApiRequestJWT } from '@repo/api/auth/dto/api-request-jwt.types';
import { AuthGuard } from '../auth/guard/auth.guard';

@UseGuards(AuthGuard)
@Controller('api/branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  async create(
    @Request() req: ApiRequestJWT,
    @Body() branchData: IBranchCreateDTO,
  ): Promise<Branch> {
    return this.branchService.create({
      ...branchData,
      organizationId: req.user.organizationId,
    });
  }

  @Get()
  async get(@Request() req: ApiRequestJWT): Promise<Branch[]> {
    return this.branchService.findAll();
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: IBranchUpdateDTO,
  ): Promise<Branch | null> {
    return this.branchService.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Branch> {
    return this.branchService.remove(id);
  }
}
