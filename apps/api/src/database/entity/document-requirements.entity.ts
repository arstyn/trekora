import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Package } from './package.entity';

@Entity('document_requirements')
export class DocumentRequirement {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ default: true })
  mandatory: boolean;

  @Column({
    type: 'enum',
    enum: ['adults', 'children', 'all'],
  })
  applicableFor: string;

  @Column()
  packageId: string;

  @ManyToOne(() => Package, (pkg) => pkg.documentRequirements, {
    onDelete: 'CASCADE',
  })
  package: Package;
}
