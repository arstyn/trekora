import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Booking } from './booking.entity';
import { User } from './user.entity';

@Entity('booking_logs')
export class BookingLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'booking_id' })
  bookingId: string;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'uuid', name: 'changed_by_id' })
  changedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by_id' })
  changedBy: User;

  @Column()
  action: string; // 'create', 'delete', 'cancel', 'customer_removed', 'status_change', 'batch_change'

  @Column({ type: 'jsonb', nullable: true, name: 'previous_data' })
  previousData: any;

  @Column({ type: 'jsonb', nullable: true, name: 'new_data' })
  newData: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
