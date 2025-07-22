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
import { Branch } from '../../database/entity/branch.entity';
import { BranchService } from './branch.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { IBranchCreateDTO } from 'src/dto/create-branch.dto';
import { IBranchUpdateDTO } from 'src/dto/update-branch.dto';

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
    return this.branchService.findAll(req.user.organizationId);
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
