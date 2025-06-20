import { Branch } from 'src/modules/branch/entity/branch.entity';
import { Organization } from 'src/modules/organization/entity/organization.entity';
import { Role } from 'src/modules/role/entity/role.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // @Column('uuid', { nullable: true, name: 'branchId' })
  // branchId?: string;

  @Column('uuid', { nullable: true, name: 'organizationId' })
  organizationId?: string;

  // @ManyToOne(() => Branch, { nullable: true, onDelete: 'SET NULL' })
  // @JoinColumn({ name: 'branchId' })
  // branch?: Branch;

  @ManyToOne(() => Organization, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  password: string;

  @ManyToOne(() => Role, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'roleId' })
  role?: Role;

  @Column('uuid', { nullable: true })
  roleId?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;
}
