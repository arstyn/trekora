import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AgentStatus } from 'src/database/entity/agent.entity';
import { AgentPayoutStatus } from 'src/database/entity/booking.entity';
import { CreateAgentDto, UpdateAgentDto } from 'src/dto/agent.dto';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { AuthGuard } from '../auth/guard/auth.guard';
import { AgentsService } from './agents.service';

@UseGuards(AuthGuard)
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  async create(
    @Request() req: ApiRequestJWT,
    @Body() createAgentDto: CreateAgentDto,
  ) {
    return this.agentsService.create(createAgentDto, req.user.organizationId);
  }

  @Get()
  async findAll(
    @Request() req: ApiRequestJWT,
    @Query('search') search?: string,
    @Query('status') status?: AgentStatus,
  ) {
    return this.agentsService.findAll(
      req.user.organizationId,
      search,
      status,
    );
  }

  @Get(':id')
  async findOne(@Request() req: ApiRequestJWT, @Param('id') id: string) {
    return this.agentsService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  async update(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
    @Body() updateAgentDto: UpdateAgentDto,
  ) {
    return this.agentsService.update(
      id,
      updateAgentDto,
      req.user.organizationId,
    );
  }

  @Delete(':id')
  async remove(@Request() req: ApiRequestJWT, @Param('id') id: string) {
    return this.agentsService.remove(id, req.user.organizationId);
  }

  @Patch('payout/:bookingId')
  async updatePayoutStatus(
    @Request() req: ApiRequestJWT,
    @Param('bookingId') bookingId: string,
    @Body('payoutStatus') payoutStatus: AgentPayoutStatus,
  ) {
    return this.agentsService.updatePayoutStatus(
      bookingId,
      payoutStatus,
      req.user.organizationId,
    );
  }
}
