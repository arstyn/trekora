import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { PermissionSetPermission } from './permission-set-permission.entity';
import { UserPermissionSet } from './user-permission-set.entity';

@Entity('permission_set')
export class PermissionSet {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description?: string;

  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @OneToMany(
    () => PermissionSetPermission,
    (permissionSetPermission) => permissionSetPermission.permissionSet,
    { cascade: true },
  )
  permissionSetPermissions: PermissionSetPermission[];

  @OneToMany(
    () => UserPermissionSet,
    (userPermissionSet) => userPermissionSet.permissionSet,
  )
  userPermissionSets: UserPermissionSet[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
