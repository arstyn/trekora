import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Workflow,
  WorkflowType,
} from '../../database/entity/workflow/workflow.entity';
import {
  WorkflowStep,
  WorkflowStepStatus,
} from '../../database/entity/workflow/workflow-step.entity';
import { WorkflowLog } from '../../database/entity/workflow/workflow-log.entity';
import {
  CreateWorkflowDto,
  CreateWorkflowStepDto,
  UpdateWorkflowStepDto,
} from '../../dto/workflow.dto';
import { Booking, BookingStatus } from '../../database/entity/booking.entity';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
    @InjectRepository(WorkflowStep)
    private stepRepository: Repository<WorkflowStep>,
    @InjectRepository(WorkflowLog)
    private logRepository: Repository<WorkflowLog>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async createWorkflow(
    dto: CreateWorkflowDto,
    userId: string,
  ): Promise<Workflow> {
    const workflow = this.workflowRepository.create({
      ...dto,
      createdById: userId,
    });
    return this.workflowRepository.save(workflow);
  }

  async findOne(id: string): Promise<Workflow> {
    const workflow = await this.workflowRepository.findOne({
      where: { id },
      relations: ['steps', 'steps.assignedTo', 'steps.completedBy'],
      order: {
        steps: {
          sortOrder: 'ASC',
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return workflow;
  }

  async addStep(
    workflowId: string,
    dto: CreateWorkflowStepDto,
    userId: string,
  ): Promise<WorkflowStep> {
    const workflow = await this.findOne(workflowId);

    // Auto-increment sortOrder if not provided
    const maxOrder =
      workflow.steps.length > 0
        ? Math.max(...workflow.steps.map((s) => s.sortOrder))
        : -1;

    const step = this.stepRepository.create({
      ...dto,
      workflowId,
      sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : maxOrder + 1,
    });

    const savedStep = await this.stepRepository.save(step);

    await this.logAction(
      workflowId,
      savedStep.id,
      userId,
      'create',
      null,
      savedStep,
    );

    return savedStep;
  }

  async updateStep(
    stepId: string,
    dto: UpdateWorkflowStepDto,
    userId: string,
  ): Promise<WorkflowStep> {
    const step = await this.stepRepository.findOne({ where: { id: stepId } });
    if (!step) {
      throw new NotFoundException('Workflow step not found');
    }

    const previousData = { ...step };

    // Handle status change specifically for completion details
    if (
      dto.status === WorkflowStepStatus.COMPLETED &&
      step.status !== WorkflowStepStatus.COMPLETED
    ) {
      step.completedById = userId;
      step.completedAt = new Date();
    } else if (dto.status && dto.status !== WorkflowStepStatus.COMPLETED) {
      step.completedById = null;
      step.completedAt = null;
    }

    Object.assign(step, dto);

    // If it's an individual step and completions were updated, check for overall completion
    if (step.type === 'individual' && step.config?.completions) {
      const allCompleted = step.config.completions.every(
        (c: any) => c.completed,
      );
      if (allCompleted) {
        if (step.status !== WorkflowStepStatus.COMPLETED) {
          step.status = WorkflowStepStatus.COMPLETED;
          step.completedById = userId;
          step.completedAt = new Date();
        }
      } else {
        // If not all completed, it should be PENDING
        if (step.status === WorkflowStepStatus.COMPLETED) {
          step.status = WorkflowStepStatus.PENDING;
          step.completedById = null;
          step.completedAt = null;
        }
      }
    }

    const updatedStep = await this.stepRepository.save(step);

    await this.logAction(
      step.workflowId,
      step.id,
      userId,
      'update',
      previousData,
      updatedStep,
    );

    // Check if all steps are completed to update booking status
    if (
      updatedStep.status === WorkflowStepStatus.COMPLETED ||
      updatedStep.status === WorkflowStepStatus.SKIPPED
    ) {
      await this.checkAndUpdateBookingStatus(updatedStep.workflowId);
    }

    return updatedStep;
  }

  private async checkAndUpdateBookingStatus(workflowId: string): Promise<void> {
    const workflow = await this.workflowRepository.findOne({
      where: { id: workflowId },
      relations: ['steps'],
    });

    if (
      workflow &&
      workflow.type === WorkflowType.BOOKING &&
      workflow.referenceId
    ) {
      const allCompleted =
        workflow.steps.length > 0 &&
        workflow.steps.every(
          (s) =>
            s.status === WorkflowStepStatus.COMPLETED ||
            s.status === WorkflowStepStatus.SKIPPED,
        );

      if (allCompleted) {
        // Only update if current status is PENDING
        const booking = await this.bookingRepository.findOne({
          where: { id: workflow.referenceId },
        });

        if (booking && booking.status === BookingStatus.PENDING) {
          await this.bookingRepository.update(workflow.referenceId, {
            status: BookingStatus.CONFIRMED,
          });
        }
      }
    }
  }

  async deleteStep(stepId: string, userId: string): Promise<void> {
    const step = await this.stepRepository.findOne({ where: { id: stepId } });
    if (!step) {
      throw new NotFoundException('Workflow step not found');
    }

    await this.logAction(
      step.workflowId,
      step.id,
      userId,
      'delete',
      step,
      null,
    );
    await this.stepRepository.delete(stepId);

    // Check if the remaining steps are all completed to update booking status
    await this.checkAndUpdateBookingStatus(step.workflowId);
  }

  async getHistory(workflowId: string): Promise<WorkflowLog[]> {
    return this.logRepository.find({
      where: { workflowId },
      relations: ['changedBy', 'step', 'step.workflow'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStepHistory(stepId: string): Promise<WorkflowLog[]> {
    return this.logRepository.find({
      where: { stepId },
      relations: ['changedBy', 'step', 'step.workflow'],
      order: { createdAt: 'DESC' },
    });
  }

  private async logAction(
    workflowId: string,
    stepId: string,
    userId: string,
    action: string,
    previousData: any,
    newData: any,
  ): Promise<void> {
    const log = this.logRepository.create({
      workflowId,
      stepId,
      changedById: userId,
      action,
      previousData,
      newData,
    });
    await this.logRepository.save(log);
  }

  // Helper to clone a template workflow for a specific booking
  async applyTemplate(
    templateId: string,
    targetId: string,
    type: WorkflowType,
    userId: string,
  ): Promise<Workflow> {
    const template = await this.findOne(templateId);

    const newWorkflow = await this.createWorkflow(
      {
        name: `${template.name} - ${targetId}`,
        type,
        referenceId: targetId,
        organizationId: template.organizationId,
      },
      userId,
    );

    for (const stepTemplate of template.steps) {
      await this.addStep(
        newWorkflow.id,
        {
          label: stepTemplate.label,
          description: stepTemplate.description,
          isMandatory: stepTemplate.isMandatory,
          sortOrder: stepTemplate.sortOrder,
        },
        userId,
      );
    }

    return this.findOne(newWorkflow.id);
  }

  async findAssignedSteps(userId: string): Promise<WorkflowStep[]> {
    return this.stepRepository.find({
      where: { assignedToId: userId },
      relations: ['workflow', 'assignedTo', 'completedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllSteps(organizationId: string): Promise<WorkflowStep[]> {
    return this.stepRepository.find({
      where: { workflow: { organizationId } },
      relations: ['workflow', 'assignedTo', 'completedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSummary(organizationId: string): Promise<any> {
    const steps = await this.findAllSteps(organizationId);

    const summary = {
      total: steps.length,
      pending: steps.filter((s) => s.status === WorkflowStepStatus.PENDING)
        .length,
      completed: steps.filter((s) => s.status === WorkflowStepStatus.COMPLETED)
        .length,
      skipped: steps.filter((s) => s.status === WorkflowStepStatus.SKIPPED)
        .length,
      byAssignee: [] as { name: string; total: number; completed: number }[],
      byType: {
        booking: 0,
        package: 0,
        customer: 0,
      },
    };

    const assigneeMap = new Map<string, { total: number; completed: number }>();

    steps.forEach((step) => {
      const assigneeName = step.assignedTo
        ? step.assignedTo.name || 'Unknown'
        : 'Unassigned';

      const current = assigneeMap.get(assigneeName) || {
        total: 0,
        completed: 0,
      };
      current.total++;
      if (step.status === WorkflowStepStatus.COMPLETED) {
        current.completed++;
      }
      assigneeMap.set(assigneeName, current);

      if (step.workflow) {
        summary.byType[step.workflow.type]++;
      }
    });

    summary.byAssignee = Array.from(assigneeMap.entries()).map(
      ([name, stats]) => ({
        name,
        ...stats,
      }),
    );

    return summary;
  }
}
