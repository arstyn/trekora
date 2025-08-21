import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingPassenger } from './booking-passenger.entity';
import { Employee } from './employee.entity';
import { Organization } from './organization.entity';
import { Package } from './package-related/package.entity';

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

  @Column()
  status: string;

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

  @ManyToMany(() => BookingPassenger, { cascade: true })
  @JoinTable({
    name: 'batch_passengers',
    joinColumn: { name: 'batchId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'passengerId', referencedColumnName: 'id' },
  })
  passengers: BookingPassenger[];
}
