import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Package } from './package.entity';
import { User } from '../user.entity';

@Entity('package_activities')
export class PackageActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'package_id' })
  packageId: string;

  @ManyToOne(() => Package, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package: Package;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  action: string; // 'create', 'update', 'publish', 'archive', 'delete', 'unpublish'

  @Column('jsonb', { nullable: true })
  details: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
