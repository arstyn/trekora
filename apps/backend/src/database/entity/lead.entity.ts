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
import { Package } from './package-related/package.entity';

@Entity('lead')
export class Lead {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ nullable: true, name: 'email' })
  email: string;

  @Column({ nullable: true, name: 'phone' })
  phone: string;

  @Column({ nullable: true, name: 'company' })
  company: string;

  @Column({ type: 'uuid', name: 'created_by_id', nullable: true })
  createdById: string;

  @ManyToOne(() => User, (createdBy) => createdBy.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'text', nullable: true, name: 'notes' })
  notes: string;

  @Column({ default: 'new', name: 'status' })
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'converted';

  // Package preferences
  @Column({ type: 'uuid', name: 'preferred_package_id', nullable: true })
  preferredPackageId: string;

  @ManyToOne(() => Package, { nullable: true })
  @JoinColumn({ name: 'preferred_package_id' })
  preferredPackage: Package;

  @Column({ type: 'json', nullable: true, name: 'considered_package_ids' })
  consideredPackageIds: string[];

  // Number of passengers
  @Column({ name: 'number_of_passengers', default: 1 })
  numberOfPassengers: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
