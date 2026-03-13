import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Workflow } from './workflow.entity';
import { WorkflowStep } from './workflow-step.entity';
import { User } from '../user.entity';

@Entity('workflow_logs')
export class WorkflowLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'workflow_id' })
  workflowId: string;

  @ManyToOne(() => Workflow)
  @JoinColumn({ name: 'workflow_id' })
  workflow: Workflow;

  @Column({ type: 'uuid', name: 'step_id', nullable: true })
  stepId: string;

  @ManyToOne(() => WorkflowStep)
  @JoinColumn({ name: 'step_id' })
  step: WorkflowStep;

  @Column({ type: 'uuid', name: 'changed_by_id' })
  changedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by_id' })
  changedBy: User;

  @Column()
  action: string; // 'create', 'update', 'status_change', 'assigned', 'deleted', 'reordered'

  @Column({ type: 'jsonb', nullable: true, name: 'previous_data' })
  previousData: any;

  @Column({ type: 'jsonb', nullable: true, name: 'new_data' })
  newData: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
