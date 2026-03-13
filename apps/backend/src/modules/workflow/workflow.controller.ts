import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import {
  CreateWorkflowDto,
  CreateWorkflowStepDto,
  UpdateWorkflowStepDto,
} from '../../dto/workflow.dto';
import { RequirePermission } from '../auth/decorator/require-permission.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { WorkflowService } from './workflow.service';

@Controller('api/workflow')
@UseGuards(AuthGuard, PermissionGuard)
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  @RequirePermission('workflow', 'create')
  async create(@Body() createWorkflowDto: CreateWorkflowDto, @Request() req) {
    return this.workflowService.createWorkflow(createWorkflowDto, req.user.id);
  }

  @Get('steps/assigned')
  async findAssignedSteps(@Request() req: ApiRequestJWT) {
    return this.workflowService.findAssignedSteps(req.user.userId);
  }

  @Get('steps/all')
  @RequirePermission('workflow', 'read')
  async findAllSteps(@Request() req: ApiRequestJWT) {
    return this.workflowService.findAllSteps(req.user.organizationId);
  }

  @Get('summary')
  @RequirePermission('workflow', 'read')
  async getSummary(@Request() req: ApiRequestJWT) {
    return this.workflowService.getSummary(req.user.organizationId);
  }

  @Get(':id')
  @RequirePermission('workflow', 'read')
  async findOne(@Param('id') id: string) {
    return this.workflowService.findOne(id);
  }

  @Post(':id/steps')
  @RequirePermission('workflow', 'update')
  async addStep(
    @Param('id') id: string,
    @Body() createStepDto: CreateWorkflowStepDto,
    @Request() req: ApiRequestJWT,
  ) {
    return this.workflowService.addStep(id, createStepDto, req.user.userId);
  }

  @Patch('steps/:stepId')
  @RequirePermission('workflow', 'update')
  async updateStep(
    @Param('stepId') stepId: string,
    @Body() updateStepDto: UpdateWorkflowStepDto,
    @Request() req: ApiRequestJWT,
  ) {
    return this.workflowService.updateStep(
      stepId,
      updateStepDto,
      req.user.userId,
    );
  }

  @Delete('steps/:stepId')
  @RequirePermission('workflow', 'update')
  async deleteStep(
    @Param('stepId') stepId: string,
    @Request() req: ApiRequestJWT,
  ) {
    return this.workflowService.deleteStep(stepId, req.user.userId);
  }

  @Get(':id/history')
  @RequirePermission('workflow', 'read')
  async getHistory(@Param('id') id: string) {
    return this.workflowService.getHistory(id);
  }

  @Get('steps/:stepId/history')
  @RequirePermission('workflow', 'read')
  async getStepHistory(@Param('stepId') stepId: string) {
    return this.workflowService.getStepHistory(stepId);
  }
}
