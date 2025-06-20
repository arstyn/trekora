import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id, { eager: false })
  user: User;

  @Column()
  userId: string;

  @Column()
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  reminderId?: string;

  @CreateDateColumn()
  createdAt: Date;
}
