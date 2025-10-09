import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Booking } from './booking.entity';
import { Batch } from './batch.entity';
import { Customer } from './customer.entity';
import { User } from './user.entity';

export enum ChecklistType {
  INDIVIDUAL = 'individual',
  PACKAGE = 'package',
  USER = 'user',
}

@Entity('booking_checklists')
export class BookingChecklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  item: string;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'boolean', default: false })
  mandatory: boolean;

  @Column({
    type: 'enum',
    enum: ChecklistType,
  })
  type: ChecklistType;

  @Column({ type: 'uuid', nullable: true })
  bookingId: string;

  @Column({ type: 'uuid', nullable: true })
  batchId: string;

  @Column({ type: 'uuid', nullable: true })
  customerId: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Booking, (booking) => booking.checklists, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @ManyToOne(() => Batch, (batch) => batch.checklists, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'batchId' })
  batch: Batch;

  @ManyToOne(() => Customer, (customer) => customer.id, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'uuid', name: 'created_by_id' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;
}
