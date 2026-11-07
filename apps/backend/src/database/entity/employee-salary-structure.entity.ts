import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { Organization } from './organization.entity';
import { User } from './user.entity';

@Entity('employee_salary_structure')
export class EmployeeSalaryStructure {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'uuid', unique: true, name: 'employee_id' })
  employeeId: string;

  @OneToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  // Earnings (Monthly ₹)
  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'basic_salary' })
  basicSalary: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'hra' })
  hra: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'da' })
  da: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'conveyance_allowance' })
  conveyanceAllowance: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'medical_allowance' })
  medicalAllowance: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'special_allowance' })
  specialAllowance: number;

  // Deductions (Monthly ₹)
  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'pf_employee' })
  pfEmployee: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'pf_employer' })
  pfEmployer: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'esi' })
  esi: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'professional_tax' })
  professionalTax: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'tds' })
  tds: number;

  // Statutory & Bank Details
  @Column({ type: 'varchar', nullable: true, name: 'pan_number' })
  panNumber?: string;

  @Column({ type: 'varchar', nullable: true, name: 'uan_number' })
  uanNumber?: string;

  @Column({ type: 'varchar', nullable: true, name: 'pf_number' })
  pfNumber?: string;

  @Column({ type: 'varchar', nullable: true, name: 'esi_number' })
  esiNumber?: string;

  @Column({ type: 'varchar', nullable: true, name: 'bank_name' })
  bankName?: string;

  @Column({ type: 'varchar', nullable: true, name: 'account_number' })
  accountNumber?: string;

  @Column({ type: 'varchar', nullable: true, name: 'ifsc_code' })
  ifscCode?: string;

  // Optional custom leave quotas per employee (overrides org defaults if set)
  @Column({ type: 'int', nullable: true, name: 'casual_leave_quota' })
  casualLeaveQuota?: number | null;

  @Column({ type: 'int', nullable: true, name: 'sick_leave_quota' })
  sickLeaveQuota?: number | null;

  @Column({ type: 'int', nullable: true, name: 'paid_leave_quota' })
  paidLeaveQuota?: number | null;

  @Column({ type: 'uuid', nullable: true, name: 'updated_by_id' })
  updatedById?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy?: User;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}

