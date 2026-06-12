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

@Entity('profile_permission_set')
export class ProfilePermissionSet {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'uuid', name: 'permission_set_id' })
  permissionSetId: string;

  @ManyToOne(
    () => PermissionSet,
    (permissionSet) => permissionSet.profilePermissionSets,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'permission_set_id' })
  permissionSet: PermissionSet;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string;

  @ManyToOne(() => Employee, (employee) => employee.profilePermissionSets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
