import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
