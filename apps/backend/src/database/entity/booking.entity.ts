import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Batch } from './batch.entity';
import { Customer } from './customer.entity';
import { Organization } from './organization.entity';
import { Package } from './package-related/package.entity';
import { User } from './user.entity';
import { BookingPayment } from './booking-payment.entity';
import { BookingDocument } from './booking-document.entity';
import { BookingChecklist } from './booking-checklist.entity';
import { Workflow } from './workflow/workflow.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'booking_number' })
  bookingNumber: string;

  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Customer, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'uuid', name: 'package_id' })
  packageId: string;

  @ManyToOne(() => Package, { eager: true })
  @JoinColumn({ name: 'package_id' })
  package: Package;

  @Column({ type: 'uuid', name: 'batch_id' })
  batchId: string;

  @ManyToOne(() => Batch, { eager: true })
  @JoinColumn({ name: 'batch_id' })
  batch: Batch;

  @Column({ name: 'number_of_customers' })
  numberOfCustomers: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    name: 'advance_paid',
    default: 0,
  })
  advancePaid: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'balance_amount' })
  balanceAmount: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ type: 'text', nullable: true, name: 'special_requests' })
  specialRequests: string;

  @Column({ type: 'jsonb', nullable: true, name: 'additional_details' })
  additionalDetails: Record<string, any>;

  @ManyToMany(() => Customer, { cascade: true, eager: true })
  @JoinTable({
    name: 'booking_customers',
    joinColumn: { name: 'bookingId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'customerId', referencedColumnName: 'id' },
  })
  customers: Customer[];

  @OneToMany(() => BookingPayment, (payment) => payment.booking, {
    cascade: true,
    eager: true,
  })
  payments: BookingPayment[];

  @OneToMany(() => BookingDocument, (document) => document.booking, {
    cascade: true,
  })
  documents: BookingDocument[];

  @OneToMany(() => BookingChecklist, (checklist) => checklist.booking, {
    cascade: true,
  })
  checklists: BookingChecklist[];

  @Column({ type: 'uuid', name: 'current_workflow_id', nullable: true })
  currentWorkflowId: string;

  @ManyToOne(() => Workflow, { nullable: true })
  @JoinColumn({ name: 'current_workflow_id' })
  currentWorkflow: Workflow;

  @Column({ type: 'uuid', name: 'created_by_id' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
