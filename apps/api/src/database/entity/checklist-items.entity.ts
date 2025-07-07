import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Package } from './package.entity';

@Entity('checklist_items')
export class ChecklistItem {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  task: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ['documents', 'booking', 'preparation', 'communication'],
  })
  category: string;

  @Column()
  dueDate: string;

  @Column({ default: false })
  completed: boolean;

  @Column()
  packageId: string;

  @ManyToOne(() => Package, (pkg) => pkg.preTripChecklist, {
    onDelete: 'CASCADE',
  })
  package: Package;
}
