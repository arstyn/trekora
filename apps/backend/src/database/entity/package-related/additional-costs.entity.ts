import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Package } from './package.entity';

@Entity('additional_costs')
export class AdditionalCost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ type: 'uuid', nullable: true })
  packageId: string;

  @ManyToOne(() => Package, (pkg) => pkg.additionalCosts, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  package: Package;
}
