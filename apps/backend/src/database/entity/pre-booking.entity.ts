import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { Lead } from './lead.entity';
import { Package } from './package-related/package.entity';
import { Customer } from './customer.entity';
import { Booking } from './booking.entity';

export enum PreBookingStatus {
  PENDING = 'pending', // Initial state when lead is converted
  CUSTOMER_DETAILS_PENDING = 'customer_details_pending', // Package and dates selected, waiting for customer details
  CUSTOMER_CREATED = 'customer_created', // Customer details saved
  CONVERTED_TO_BOOKING = 'converted_to_booking', // Converted to actual booking
  CANCELLED = 'cancelled', // Pre-booking cancelled
}

@Entity('pre_bookings')
export class PreBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'pre_booking_number' })
  preBookingNumber: string;

  // Lead reference
  @Column({ type: 'uuid', name: 'lead_id', nullable: true })
  leadId: string;

  @ManyToOne(() => Lead, { eager: true, nullable: true })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  // Package selection
  @Column({ type: 'uuid', name: 'package_id', nullable: true })
  packageId: string;

  @ManyToOne(() => Package, { eager: true, nullable: true })
  @JoinColumn({ name: 'package_id' })
  package: Package;

  // Preferred dates
  @Column({ type: 'date', nullable: true, name: 'preferred_start_date' })
  preferredStartDate: Date;

  @Column({ type: 'date', nullable: true, name: 'preferred_end_date' })
  preferredEndDate: Date;

  // Number of travelers
  @Column({ name: 'number_of_travelers', default: 1 })
  numberOfTravelers: number;

  // Temporary customer details (before full customer creation)
  @Column({ type: 'jsonb', nullable: true, name: 'temporary_customer_details' })
  temporaryCustomerDetails: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    notes?: string;
  };

  // Customer reference (once created)
  @Column({ type: 'uuid', name: 'customer_id', nullable: true })
  customerId: string;

  @ManyToOne(() => Customer, { eager: true, nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  // Booking reference (once converted)
  @Column({ type: 'uuid', name: 'booking_id', nullable: true })
  bookingId: string;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  // Status
  @Column({
    type: 'enum',
    enum: PreBookingStatus,
    default: PreBookingStatus.PENDING,
  })
  status: PreBookingStatus;

  // Additional details
  @Column({ type: 'text', nullable: true, name: 'special_requests' })
  specialRequests: string;

  @Column({ type: 'text', nullable: true, name: 'notes' })
  notes: string;

  @Column({ type: 'jsonb', nullable: true, name: 'additional_details' })
  additionalDetails: Record<string, any>;

  // Estimated amount (before final booking)
  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'estimated_amount',
  })
  estimatedAmount: number;

  // System fields
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
