import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookingPayment } from './booking-payment.entity';
import { BookingCustomer } from './booking-customer.entity';

@Entity('booking_payment_allocations')
export class BookingPaymentAllocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'payment_id' })
  paymentId: string;

  @ManyToOne(() => BookingPayment, (payment) => payment.allocations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_id' })
  payment: BookingPayment;

  @Column({ type: 'uuid', name: 'booking_customer_id' })
  bookingCustomerId: string;

  @ManyToOne(() => BookingCustomer, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_customer_id' })
  bookingCustomer: BookingCustomer;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
