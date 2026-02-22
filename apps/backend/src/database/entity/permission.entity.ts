import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { PermissionSetPermission } from './permission-set-permission.entity';

@Entity('permission')
@Unique(['name', 'organizationId'])
export class Permission {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'varchar', name: 'resource' })
  resource: string; // e.g., 'booking', 'lead', 'package', 'customer', 'employee'

  @Column({ type: 'varchar', name: 'action' })
  action: string; // e.g., 'create', 'read', 'update', 'delete', 'view', 'export'

  @Column({ type: 'text', nullable: true, name: 'description' })
  description?: string;

  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

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
