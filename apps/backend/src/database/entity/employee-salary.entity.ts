import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { Organization } from './organization.entity';
import { User } from './user.entity';

export enum SalaryStatus {
  DRAFT = 'draft',
  PROCESSED = 'processed',
  PAID = 'paid',
}

@Entity('employee_salary')
export class EmployeeSalary {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', unique: true, name: 'slip_number' })
  slipNumber: string;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'int', name: 'month' })
  month: number; // 1 - 12

  @Column({ type: 'int', name: 'year' })
  year: number;

  // Working Days & Leaves Snapshot
  @Column({ type: 'numeric', precision: 5, scale: 1, default: 30, name: 'total_working_days' })
  totalWorkingDays: number;

  @Column({ type: 'numeric', precision: 5, scale: 1, default: 30, name: 'days_worked' })
  daysWorked: number;

  @Column({ type: 'numeric', precision: 5, scale: 1, default: 0, name: 'paid_leaves' })
  paidLeaves: number;

  @Column({ type: 'numeric', precision: 5, scale: 1, default: 0, name: 'unpaid_leaves' })
  unpaidLeaves: number;

  @Column({ type: 'numeric', precision: 5, scale: 1, default: 30, name: 'payable_days' })
  payableDays: number;

  // Earnings Snapshot (₹)
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

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'additional_incentive' })
  additionalIncentive: number;

  @Column({ type: 'varchar', nullable: true, name: 'incentive_note' })
  incentiveNote?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'other_earnings' })
  otherEarnings: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'gross_earnings' })
  grossEarnings: number;

  // Deductions Snapshot (₹)
  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'pf_deduction' })
  pfDeduction: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'esi_deduction' })
  esiDeduction: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'professional_tax' })
  professionalTax: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'tds_deduction' })
  tdsDeduction: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'lop_deduction' })
  lopDeduction: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'other_deductions' })
  otherDeductions: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'total_deductions' })
  totalDeductions: number;

  // Net Salary & Payment Info
  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, name: 'net_salary' })
  netSalary: number;

  @Column({
    type: 'enum',
    enum: SalaryStatus,
    default: SalaryStatus.DRAFT,
    name: 'status',
  })
  status: SalaryStatus;

  @Column({ type: 'date', nullable: true, name: 'payment_date' })
  paymentDate?: Date | string | null;

  @Column({ type: 'varchar', nullable: true, name: 'payment_method' })
  paymentMethod?: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'payment_reference' })
  paymentReference?: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'email_sent_at' })
  emailSentAt?: Date | null;

  @Column({ type: 'int', default: 0, name: 'email_sent_count' })
  emailSentCount: number;

  @Column({ type: 'text', nullable: true, name: 'remarks' })
  remarks?: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'created_by_id' })
  createdById?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: User;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}

