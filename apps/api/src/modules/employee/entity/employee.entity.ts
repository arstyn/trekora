import { Branch } from 'src/modules/branch/entity/branch.entity';
import { Organization } from 'src/modules/organization/entity/organization.entity';
import { User } from 'src/modules/user/entity/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
}

@Entity('employee')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @ManyToOne(() => User, (user) => user.id, { eager: false, nullable: true })
  user?: User;

  @Column({ type: 'uuid', nullable: true })
  branchId?: string;

  @ManyToOne(() => Branch, (branch) => branch.id, {
    eager: false,
    nullable: true,
  })
  branch?: Branch;

  //   @Column({ type: 'uuid' })
  //   designationId: string;

  //   @ManyToOne(() => Designation, (designation) => designation.id, {
  //     eager: false,
  //   })
  //   designation: Designation;

  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.id, {
    eager: false,
  })
  organization: Organization;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  address?: string;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', nullable: true })
  email?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ type: 'varchar', nullable: true })
  gender?: string;

  @Column({ type: 'varchar', nullable: true })
  nationality?: string;

  @Column({ type: 'varchar', nullable: true })
  maritalStatus?: string;

  @Column({ type: 'date', nullable: true })
  joinDate?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  status: EmployeeStatus;
}
