import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Employee } from './employee.entity';
import { Organization } from './organization.entity';
import { Package } from './package-related/package.entity';
import { BookingChecklist } from './booking-checklist.entity';

export enum BatchStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Entity()
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date;

  @Column({ name: 'total_seats' })
  totalSeats: number;

  @Column({ name: 'booked_seats', nullable: true, default: 0 })
  bookedSeats: number;

  @Column({
    type: 'enum',
    enum: BatchStatus,
    default: BatchStatus.UPCOMING,
  })
  status: BatchStatus;

  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.id, {
    eager: false,
    nullable: false,
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'uuid', name: 'package_id' })
  packageId: string;

  @ManyToOne(() => Package, (pkg) => pkg.id)
  @JoinColumn({ name: 'package_id' }) // link both
  package: Package;

  @ManyToMany(() => Employee)
  @JoinTable({
    name: 'batch_coordinators',
    joinColumn: { name: 'batchId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'employeeId', referencedColumnName: 'id' },
  })
  coordinators: Employee[];

  @ManyToMany(() => Customer, { cascade: true })
  @JoinTable({
    name: 'batch_customers',
    joinColumn: { name: 'batchId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'customerId', referencedColumnName: 'id' },
  })
  customers: Customer[];

  @OneToMany(() => BookingChecklist, (checklist) => checklist.batch, {
    cascade: true,
  })
  checklists: BookingChecklist[];
}
