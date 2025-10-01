import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Booking } from './booking.entity';
import { BookingPassenger } from './booking-passenger.entity';

export enum ChecklistType {
  GROUP = 'group',
  INDIVIDUAL = 'individual',
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

  @Column({ type: 'uuid' })
  bookingId: string;

  @Column({ type: 'uuid', nullable: true })
  passengerId: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Booking, (booking) => booking.checklists, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @ManyToOne(() => BookingPassenger, (passenger) => passenger.additionalInfo, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'passengerId' })
  passenger: BookingPassenger;
}
