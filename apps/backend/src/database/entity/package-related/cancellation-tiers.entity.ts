import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Package } from './package.entity';

@Entity('cancellation_tiers')
export class CancellationTier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  timeframe: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  amount: number;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  packageId: string;

  @ManyToOne(() => Package, (pkg) => pkg.cancellationStructure, {
    onDelete: 'CASCADE',
  })
  package: Package;
}
