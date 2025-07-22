import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group';
import { UpdateGroupDto } from './dto/update-group';
import { AuthGuard } from '../auth/guard/auth.guard';
import { Group } from 'src/database/entity/group.entity';

@UseGuards(AuthGuard)
@Controller('api/groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  create(@Body() dto: CreateGroupDto): Promise<Group> {
    return this.groupService.create(dto);
  }

  @Get()
  findAll(): Promise<Group[]> {
    return this.groupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Group | null> {
    return this.groupService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateGroupDto,
  ): Promise<Group | null> {
    return this.groupService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.groupService.delete(id);
  }
}
