import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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
import { BookingPassenger } from './booking-passenger.entity';
import { BookingDocument } from './booking-document.entity';

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

  @Column({ name: 'number_of_passengers' })
  numberOfPassengers: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'advance_paid', default: 0 })
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

  @OneToMany(() => BookingPassenger, (passenger) => passenger.booking, {
    cascade: true,
    eager: true,
  })
  passengers: BookingPassenger[];

  @OneToMany(() => BookingPayment, (payment) => payment.booking, {
    cascade: true,
    eager: true,
  })
  payments: BookingPayment[];

  @OneToMany(() => BookingDocument, (document) => document.booking, {
    cascade: true,
  })
  documents: BookingDocument[];

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