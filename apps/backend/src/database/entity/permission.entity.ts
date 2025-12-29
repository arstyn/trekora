import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PermissionSetPermission } from './permission-set-permission.entity';

@Entity('permission')
export class Permission {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', unique: true, name: 'name' })
  name: string;

  @Column({ type: 'varchar', name: 'resource' })
  resource: string; // e.g., 'booking', 'lead', 'package', 'customer', 'employee'

  @Column({ type: 'varchar', name: 'action' })
  action: string; // e.g., 'create', 'read', 'update', 'delete', 'view', 'export'

  @Column({ type: 'text', nullable: true, name: 'description' })
  description?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(
    () => PermissionSetPermission,
    (permissionSetPermission) => permissionSetPermission.permission,
  )
  permissionSetPermissions: PermissionSetPermission[];
}
