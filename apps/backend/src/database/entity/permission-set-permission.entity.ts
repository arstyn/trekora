import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { PermissionSet } from './permission-set.entity';

@Entity('permission_set_permission')
export class PermissionSetPermission {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'uuid', name: 'permission_set_id' })
  permissionSetId: string;

  @ManyToOne(
    () => PermissionSet,
    (permissionSet) => permissionSet.permissionSetPermissions,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'permission_set_id' })
  permissionSet: PermissionSet;

  @Column({ type: 'uuid', name: 'permission_id' })
  permissionId: string;

  @ManyToOne(
    () => Permission,
    (permission) => permission.permissionSetPermissions,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
