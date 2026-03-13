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
import { PermissionSet } from './permission-set.entity';
import { User } from './user.entity';

@Entity('user_permission_set')
export class UserPermissionSet {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'uuid', name: 'permission_set_id' })
  permissionSetId: string;

  @ManyToOne(
    () => PermissionSet,
    (permissionSet) => permissionSet.userPermissionSets,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'permission_set_id' })
  permissionSet: PermissionSet;

  // User can be either User or Employee
  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'uuid', nullable: true, name: 'employee_id' })
  employeeId?: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'employee_id' })
  employee?: Employee;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
