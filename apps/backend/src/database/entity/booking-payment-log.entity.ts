import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingPayment } from './booking-payment.entity';
import { User } from './user.entity';

@Entity('booking_payment_logs')
export class BookingPaymentLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'payment_id' })
  paymentId: string;

  @ManyToOne(() => BookingPayment, (payment) => payment.logs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_id' })
  payment: BookingPayment;

  @Column({ type: 'uuid', name: 'changed_by_id' })
  changedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by_id' })
  changedBy: User;

  @Column()
  action: string; // 'created', 'verified', 'failed', 'refunded', 'archived', 'updated', 'receipt_uploaded'

  @Column({ type: 'jsonb', nullable: true, name: 'previous_data' })
  previousData: any;

  @Column({ type: 'jsonb', nullable: true, name: 'new_data' })
  newData: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
