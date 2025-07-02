import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('notification')
export class Notification {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @ManyToOne(() => User, (user) => user.id, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'message' })
  message: string;

  @Column({ default: false, name: 'is_read' })
  isRead: boolean;

  @Column({ nullable: true, name: 'reminder_id' })
  reminderId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
