import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('group')
export class Group {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ nullable: true, name: 'description' })
  description?: string;
}
