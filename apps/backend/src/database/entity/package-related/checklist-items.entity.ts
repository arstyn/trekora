import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Package } from './package.entity';

@Entity('checklist_items')
export class ChecklistItem {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ nullable: true })
  task: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['documents', 'booking', 'preparation', 'communication'],
    nullable: true,
  })
  category: string;

  @Column({ nullable: true })
  dueDate: string;

  @Column({ nullable: true })
  packageId: string;

  @ManyToOne(() => Package, (pkg) => pkg.preTripChecklist, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  package: Package;
}
