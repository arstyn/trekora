import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Package } from './package.entity';

@Entity('document_requirements')
export class DocumentRequirement {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: true })
  mandatory: boolean;

  @Column({
    type: 'enum',
    enum: ['adults', 'children', 'all'],
  })
  applicableFor: string;

  @Column({ nullable: true })
  packageId: string;

  @ManyToOne(() => Package, (pkg) => pkg.documentRequirements, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  package: Package;
}
