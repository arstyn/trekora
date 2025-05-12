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
  user_id?: string;

  @ManyToOne(() => User, (user) => user.id, { eager: false, nullable: true })
  user?: User;

  @Column({ type: 'uuid', nullable: true })
  branch_id?: string;

  @ManyToOne(() => Branch, (branch) => branch.id, {
    eager: false,
    nullable: true,
  })
  branch?: Branch;

  //   @Column({ type: 'uuid' })
  //   designation_id: string;

  //   @ManyToOne(() => Designation, (designation) => designation.id, {
  //     eager: false,
  //   })
  //   designation: Designation;

  @Column({ type: 'uuid' })
  organization_id: string;

  @ManyToOne(() => Organization, (organization) => organization.id, {
    eager: false,
  })
  organization: Organization;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  address?: string;

  @Column({ type: 'varchar', nullable: true })
  phone_number?: string;

  @Column({ type: 'varchar', nullable: true })
  email?: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth?: Date;

  @Column({ type: 'varchar', nullable: true })
  gender?: string;

  @Column({ type: 'varchar', nullable: true })
  nationality?: string;

  @Column({ type: 'varchar', nullable: true })
  marital_status?: string;

  @Column({ type: 'date', nullable: true })
  hire_date?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  status: EmployeeStatus;
}
