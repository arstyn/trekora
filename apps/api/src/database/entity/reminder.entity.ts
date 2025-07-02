import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';

export enum ReminderRepeat {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

@Entity('reminder')
export class Reminder {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', length: 50, name: 'type' })
  type: string; // e.g., 'email', 'call', 'meeting', etc.

  // Polymorphic relation fields
  @Column({ type: 'varchar', length: 50, name: 'entity_type' })
  @Index()
  entityType: string; // e.g., 'lead', 'customer', etc.

  @Column({ type: 'uuid', name: 'entity_id' })
  @Index()
  entityId: string; // ID of the related entity

  @Column({ type: 'uuid', name: 'created_by_id' })
  createdById: string;

  @ManyToOne(() => User, (createdBy) => createdBy.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'text', nullable: true, name: 'note' })
  note?: string;

  @Column({ type: 'timestamp', nullable: false, name: 'remind_at' })
  remindAt: Date;

  @Column({
    type: 'enum',
    enum: ReminderRepeat,
    default: ReminderRepeat.NONE,
    name: 'repeat',
  })
  repeat: ReminderRepeat;

  @Column({ type: 'jsonb', nullable: true, name: 'repeat_options' })
  repeatOptions?: Record<string, any>; // For custom repeat patterns

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
