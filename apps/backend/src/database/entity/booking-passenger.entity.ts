import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Booking } from './booking.entity';

@Entity('booking_passengers')
export class BookingPassenger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'emergency_contact' })
  emergencyContact: string;

  @Column({ type: 'text', nullable: true, name: 'special_requirements' })
  specialRequirements: string;

  @Column({ type: 'jsonb', nullable: true, name: 'additional_info' })
  additionalInfo: Record<string, any>;

  @Column({ type: 'uuid', name: 'booking_id' })
  bookingId: string;

  @ManyToOne(() => Booking, (booking) => booking.passengers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;
} 