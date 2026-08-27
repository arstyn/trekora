import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Batch } from './batch.entity';
import { PackageTier } from './package-related/package-tiers.entity';

@Entity('batch_tiers')
export class BatchTier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  batchId: string;

  @ManyToOne(() => Batch, (batch) => batch.batchTiers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batchId' })
  batch: Batch;

  @Column({ type: 'uuid' })
  packageTierId: string;

  @ManyToOne(() => PackageTier, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'packageTierId' })
  packageTier: PackageTier;

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
}
