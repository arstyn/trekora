import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';

@Entity('import_history')
export class ImportHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  success: boolean;

  @Column()
  totalRows: number;

  @Column()
  importedRows: number;

  @Column()
  failedRows: number;

  @Column({ type: 'json' })
  errors: string[];

  @Column({ type: 'text' })
  message: string;

  @Column()
  entityType: string;

  @Column({ nullable: true })
  fileName: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;
} 