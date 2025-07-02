import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Department } from './department.entity';
import { Employee } from './employee.entity';
import { User } from './user.entity';

@Entity('user_departments')
export class UserDepartments {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
    nullable: true, // Make nullable
  })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ type: 'uuid', name: 'employee_id', nullable: true })
  employeeId: string | null;

  @ManyToOne(() => Employee, (employee) => employee.id, {
    onDelete: 'CASCADE',
    nullable: true, // Make nullable
  })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee | null;

  @Column({ type: 'uuid', name: 'department_id' })
  departmentId: string;

  @ManyToOne(() => Department, (department) => department.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
