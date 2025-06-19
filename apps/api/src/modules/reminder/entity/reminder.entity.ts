import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // e.g., 'email', 'call', 'meeting', etc.

  // Polymorphic relation fields
  @Column({ type: 'varchar', length: 50 })
  @Index()
  entityType: string; // e.g., 'lead', 'customer', etc.

  @Column({ type: 'uuid' })
  @Index()
  entityId: string; // ID of the related entity

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ type: 'timestamp', nullable: false })
  remindAt: Date;

  @Column({
    type: 'enum',
    enum: ReminderRepeat,
    default: ReminderRepeat.NONE,
  })
  repeat: ReminderRepeat;

  @Column({ type: 'jsonb', nullable: true })
  repeatOptions?: Record<string, any>; // For custom repeat patterns

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
