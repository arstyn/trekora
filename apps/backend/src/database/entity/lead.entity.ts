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

  @Column({ default: 'individual', name: 'lead_type' })
  leadType: 'individual' | 'company';

  @Column({ nullable: true, name: 'email' })
  email: string;

  @Column({ nullable: true, name: 'phone' })
  phone: string;

  @Column({ nullable: true, name: 'company' })
  company: string;

  @Column({ nullable: true, name: 'company_website' })
  companyWebsite: string;

  @Column({ nullable: true, name: 'company_industry' })
  companyIndustry: string;

  @Column({ nullable: true, name: 'contact_designation' })
  contactDesignation: string;

  @Column({ nullable: true, name: 'company_size' })
  companySize: string;

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

  @Column({ default: false, name: 'is_custom_package' })
  isCustomPackage: boolean;

  @Column({ nullable: true, name: 'custom_package_name' })
  customPackageName: string;

  @Column({ nullable: true, name: 'custom_package_destination' })
  customPackageDestination: string;

  @Column({ nullable: true, name: 'custom_package_days', type: 'integer' })
  customPackageDays: number;

  @Column({ nullable: true, name: 'custom_package_nights', type: 'integer' })
  customPackageNights: number;

  @Column({ nullable: true, name: 'custom_package_price', type: 'decimal', transformer: {
    to: (value: number) => value,
    from: (value: string) => value ? parseFloat(value) : null
  } })
  customPackagePrice: number;

  @Column({ nullable: true, name: 'custom_package_description', type: 'text' })
  customPackageDescription: string;

  @Column({ nullable: true, name: 'budget', type: 'decimal', transformer: {
    to: (value: number) => value,
    from: (value: string) => value ? parseFloat(value) : null
  } })
  budget: number;

  // Number of passengers
  @Column({ name: 'number_of_passengers', default: 1 })
  numberOfPassengers: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
