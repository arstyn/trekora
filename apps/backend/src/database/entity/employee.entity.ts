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
import { Branch } from './branch.entity';
import { Organization } from './organization.entity';
import { Role } from './role.entity';
import { UserDepartments } from './user-departments.entity';
import { User } from './user.entity';

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
}

@Entity('employee')
export class Employee {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId?: string;

  @ManyToOne(() => User, (user) => user.id, { eager: false, nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'uuid', nullable: true, name: 'branch_id' })
  branchId?: string;

  @ManyToOne(() => Branch, (branch) => branch.id, {
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'branch_id' })
  branch?: Branch;

  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.id, {
    eager: false,
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => Role, (role) => role.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column('uuid', { nullable: true, name: 'role_id' })
  roleId?: string;

  @OneToMany(() => UserDepartments, (ud) => ud.employee)
  employeeDepartments: UserDepartments[];

  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'varchar', nullable: true, name: 'address' })
  address?: string;

  @Column({ type: 'varchar', nullable: true, name: 'phone' })
  phone?: string;

  @Column({ type: 'varchar', nullable: true, name: 'experience' })
  experience?: string;

  @Column({ type: 'varchar', nullable: true, name: 'specialization' })
  specialization?: string;

  @Column({ type: 'varchar', nullable: true, name: 'additional_info' })
  additional_info?: string;

  @Column({ type: 'varchar', nullable: true, name: 'email' })
  email?: string;

  @Column({ type: 'date', nullable: true, name: 'date_of_birth' })
  dateOfBirth?: Date;

  @Column({ type: 'varchar', nullable: true, name: 'gender' })
  gender?: string;

  @Column({ type: 'varchar', nullable: true, name: 'nationality' })
  nationality?: string;

  @Column({ type: 'varchar', nullable: true, name: 'marital_status' })
  maritalStatus?: string;

  @Column({ type: 'date', nullable: true, name: 'join_date' })
  joinDate?: Date;

  @Column({ nullable: true, name: 'profile_photo' })
  profilePhoto?: string;

  @Column({ nullable: true, name: 'verification_document' })
  verificationDocument?: string;

  @Column({ nullable: true, name: 'verification_document_type' })
  verificationDocumentType?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdById?: string;

  @ManyToOne(() => User, (createdBy) => createdBy.id, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  createdBy?: User;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
    name: 'status',
  })
  status: EmployeeStatus;
}
