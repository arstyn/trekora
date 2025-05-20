import { Department } from 'src/modules/department/entity/department.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Employee } from 'src/modules/employee/entity/employee.entity'; // Add this import
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_departments')
export class UserDepartments {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true }) // Make nullable
  userId: string | null;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
    nullable: true, // Make nullable
  })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ type: 'uuid', name: 'employee_id', nullable: true }) // Add employeeId
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
