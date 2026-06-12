import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { UserOrganization } from './user-organization.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', nullable: true, name: 'name' })
  name: string;

  @Column({ nullable: true, name: 'profile_photo' })
  profilePhoto?: string;

  // @Column('uuid', { nullable: true, name: 'branch_id' })
  // branchId?: string;

  @Column('uuid', { nullable: true, name: 'last_accessed_organization_id' })
  lastAccessedOrganizationId?: string;

  // @ManyToOne(() => Branch, { nullable: true, onDelete: 'SET NULL' })
  // @JoinColumn({ name: 'branch_id' })
  // branch?: Branch;

  @OneToMany(() => UserOrganization, (userOrg) => userOrg.user)
  userOrganizations: UserOrganization[];

  @Column({ unique: true, name: 'email' })
  email: string;

  @Column({ nullable: true, name: 'phone' })
  phone?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ default: true, name: 'is_onboarded' })
  isOnboarded: boolean;

  @Column({ default: false, name: 'notifications_enabled' })
  notificationsEnabled: boolean;

  @Column({ default: false, name: 'newsletter_subscribed' })
  newsletterSubscribed: boolean;
}
