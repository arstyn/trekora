import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('organization')
export class Organization {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', nullable: true, name: 'name' })
  name?: string;

  @Column({ type: 'varchar', nullable: true, name: 'domain' })
  domain?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true, name: 'size' })
  size?: string;

  @Column({ type: 'varchar', nullable: true, name: 'industry' })
  industry?: string;

  @Column({ type: 'varchar', nullable: true, name: 'description' })
  description?: string;
}
