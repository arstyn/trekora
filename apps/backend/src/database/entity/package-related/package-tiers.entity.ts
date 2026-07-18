import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Package } from './package.entity';

@Entity('package_tiers')
export class PackageTier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  adultCost: number;

  @Column({ type: 'varchar', nullable: true })
  childCostType: 'flat' | 'percentage';

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  childCostValue: number;

  @Column({ type: 'varchar', nullable: true })
  infantCostType: 'flat' | 'percentage';

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  infantCostValue: number;

  @Column({ type: 'varchar', nullable: true })
  transportationId: string;

  @Column({ type: 'uuid', nullable: true })
  packageId: string;

  @ManyToOne(() => Package, (pkg) => pkg.packageTiers, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  package: Package;
}
