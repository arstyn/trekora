import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Employee } from '../../employee/entity/employee.entity';

@Entity()
export class UserInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  token: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;

  @ManyToOne(() => Employee, { nullable: false })
  employee: Employee;

  @Column({ nullable: false })
  employeeId: string;

  @CreateDateColumn()
  createdAt: Date;
}
