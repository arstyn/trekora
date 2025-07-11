import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Package } from './package.entity';

@Entity('exclusions')
export class Exclusion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { nullable: true })
  item: string;

  @Column({ type: 'uuid', nullable: true })
  packageId: string;

  @ManyToOne(() => Package, (pkg) => pkg.exclusions, { onDelete: 'CASCADE' })
  package: Package;
}
