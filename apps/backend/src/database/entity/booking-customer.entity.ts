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
import { Customer } from './customer.entity';
import { PackageTier } from './package-related/package-tiers.entity';

@Entity('booking_customers')
export class BookingCustomer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'booking_id' })
  bookingId: string;

  @ManyToOne(() => Booking, (booking) => booking.bookingCustomers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Customer, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'uuid', name: 'package_tier_id', nullable: true })
  packageTierId: string;

  @ManyToOne(() => PackageTier, { nullable: true, eager: true })
  @JoinColumn({ name: 'package_tier_id' })
  packageTier: PackageTier;

  @Column({
    type: 'enum',
    enum: ['adult', 'child', 'infant'],
    default: 'adult',
    name: 'age_category'
  })
  ageCategory: 'adult' | 'child' | 'infant';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
