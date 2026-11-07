import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserOrganization } from './user-organization.entity';

@Entity('organization')
export class Organization {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', nullable: true, name: 'name' })
  name?: string;

  @Column({ type: 'varchar', nullable: true, name: 'domain' })
  domain?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true, name: 'size' })
  size?: string;

  @Column({ type: 'varchar', nullable: true, name: 'industry' })
  industry?: string;

  @Column({ type: 'varchar', nullable: true, name: 'description' })
  description?: string;

  @Column({ type: 'int', default: 3, name: 'default_block_days' })
  defaultBlockDays: number;

  @Column({ type: 'varchar', default: '#2563eb', name: 'invoice_color' })
  invoiceColor: string;

  @Column({ type: 'varchar', nullable: true, name: 'invoice_seal' })
  invoiceSeal: string | null;

  @Column({ type: 'jsonb', nullable: true, name: 'invoice_fields' })
  invoiceFields: any | null;

  @Column({ type: 'varchar', default: '#2563eb', name: 'salary_slip_color' })
  salarySlipColor: string;

  @Column({ type: 'varchar', nullable: true, name: 'salary_slip_logo' })
  salarySlipLogo: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'salary_slip_seal' })
  salarySlipSeal: string | null;

  @Column({ type: 'jsonb', nullable: true, name: 'salary_slip_fields' })
  salarySlipFields: any | null;

  @OneToMany(() => UserOrganization, (userOrg) => userOrg.organization)
  userOrganizations: UserOrganization[];
}
