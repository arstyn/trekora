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
import { Role } from './role.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', nullable: true, name: 'name' })
  name: string;

  // @Column('uuid', { nullable: true, name: 'branch_id' })
  // branchId?: string;

  @Column('uuid', { nullable: true, name: 'organization_id' })
  organizationId?: string;

  // @ManyToOne(() => Branch, { nullable: true, onDelete: 'SET NULL' })
  // @JoinColumn({ name: 'branch_id' })
  // branch?: Branch;

  @ManyToOne(() => Organization, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization;

  @Column({ unique: true, name: 'email' })
  email: string;

  @Column({ nullable: true, name: 'phone' })
  phone?: string;

  @Column({ nullable: true, name: 'password' })
  password?: string;

  @ManyToOne(() => Role, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'role_id' })
  role?: Role;

  @Column('uuid', { nullable: true, name: 'role_id' })
  roleId?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ default: false, name: 'notifications_enabled' })
  notificationsEnabled: boolean;

  @Column({ default: false, name: 'newsletter_subscribed' })
  newsletterSubscribed: boolean;
}
