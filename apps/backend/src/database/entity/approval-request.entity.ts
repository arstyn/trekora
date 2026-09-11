import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum ApprovalAction {
  BOOKING_CANCEL = 'booking_cancel',
  BOOKING_DISCOUNT = 'booking_discount',
  PAYMENT_REFUND = 'payment_refund',
  PAYMENT_DELETE = 'payment_delete',
  AGENT_PAYOUT = 'agent_payout',
  CUSTOMER_DELETE = 'customer_delete',
  BATCH_CANCEL = 'batch_cancel',
}

@Entity('approval_requests')
export class ApprovalRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({
    type: 'enum',
    enum: ApprovalAction,
  })
  action: ApprovalAction;

  @Column({ type: 'varchar', length: 50 })
  resource: string; // 'booking' | 'payment' | 'agent' | 'batch' | 'customer'

  @Column({ type: 'uuid', name: 'entity_id' })
  entityId: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'entity_reference',
  })
  entityReference: string; // e.g., "BK-2026-0042", "PAY-9042", "Agent John"

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'jsonb', default: {} })
  payload: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  snapshot: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @Column({ type: 'uuid', name: 'requested_by_id' })
  requestedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requested_by_id' })
  requestedBy: User;

  @Column({ type: 'uuid', name: 'reviewed_by_id', nullable: true })
  reviewedById: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy: User | null;

  @Column({ type: 'timestamp', name: 'reviewed_at', nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'text', nullable: true, name: 'review_notes' })
  reviewNotes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
