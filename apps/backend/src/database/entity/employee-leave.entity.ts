import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { Organization } from './organization.entity';
import { User } from './user.entity';

export enum LeaveType {
  CASUAL = 'casual',
  SICK = 'sick',
  PAID = 'paid',
  UNPAID = 'unpaid',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('employee_leave')
export class EmployeeLeave {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', unique: true, name: 'leave_number' })
  leaveNumber: string;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({
    type: 'enum',
    enum: LeaveType,
    default: LeaveType.CASUAL,
    name: 'leave_type',
  })
  leaveType: LeaveType;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date | string;

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date | string;

  @Column({ type: 'boolean', default: false, name: 'is_half_day' })
  isHalfDay: boolean;

  @Column({ type: 'numeric', precision: 4, scale: 1, default: 1, name: 'total_days' })
  totalDays: number;

  @Column({ type: 'text', name: 'reason' })
  reason: string;

  @Column({
    type: 'enum',
    enum: LeaveStatus,
    default: LeaveStatus.PENDING,
    name: 'status',
  })
  status: LeaveStatus;

  @Column({ type: 'uuid', nullable: true, name: 'reviewed_by_id' })
  reviewedById?: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy?: User | null;

  @Column({ type: 'timestamp', nullable: true, name: 'reviewed_at' })
  reviewedAt?: Date | null;

  @Column({ type: 'text', nullable: true, name: 'review_note' })
  reviewNote?: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'created_by_id' })
  createdById?: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: User | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}

