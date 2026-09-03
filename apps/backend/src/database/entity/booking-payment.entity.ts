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
import { Booking } from './booking.entity';
import { User } from './user.entity';
import { Customer } from './customer.entity';
import { BookingPaymentAllocation } from './booking-payment-allocation.entity';
import { BookingPaymentLog } from './booking-payment-log.entity';

export enum PaymentType {
  ADVANCE = 'advance',
  BALANCE = 'balance',
  PARTIAL = 'partial',
  REFUND = 'refund',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CASH = 'cash',
  UPI = 'upi',
  OTHER = 'other',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  ARCHIVED = 'archived',
}

@Entity('booking_payments')
export class BookingPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'payment_number' })
  paymentNumber: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.ADVANCE,
    name: 'payment_type',
  })
  paymentType: PaymentType;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ nullable: true, name: 'payment_reference' })
  paymentReference: string;

  @Column({ nullable: true, name: 'transaction_id' })
  transactionId: string;

  @Column({ type: 'date', nullable: true, name: 'payment_date' })
  paymentDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true, name: 'receipt_file_path' })
  receiptFilePath: string;

  @Column({ type: 'jsonb', nullable: true, name: 'payment_details' })
  paymentDetails: Record<string, any>;

  @Column({ name: 'is_passenger_split', default: false })
  isPassengerSplit: boolean;

  @Column({ nullable: true, name: 'payer_name' })
  payerName: string;

  @Column({ type: 'uuid', nullable: true, name: 'payer_customer_id' })
  payerCustomerId: string;

  @ManyToOne(() => Customer, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'payer_customer_id' })
  payerCustomer: Customer;

  @OneToMany(() => BookingPaymentAllocation, (allocation) => allocation.payment, {
    cascade: true,
    eager: true,
  })
  allocations: BookingPaymentAllocation[];

  @Column({ type: 'uuid', name: 'booking_id' })
  bookingId: string;

  @ManyToOne(() => Booking, (booking) => booking.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'uuid', name: 'recorded_by_id' })
  recordedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recorded_by_id' })
  recordedBy: User;

  @Column({ type: 'uuid', nullable: true, name: 'verified_by_id' })
  verifiedById?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'verified_by_id' })
  verifiedBy?: User;

  @Column({ type: 'timestamp', nullable: true, name: 'verified_at' })
  verifiedAt?: Date;

  @OneToMany(() => BookingPaymentLog, (log) => log.payment)
  logs: BookingPaymentLog[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

