import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Package } from './package.entity';

@Entity('cancellation_policies')
export class CancellationPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { nullable: true })
  policy: string;

  @Column({ type: 'uuid', nullable: true })
  packageId: string;

  @ManyToOne(() => Package, (pkg) => pkg.cancellationPolicy, {
    onDelete: 'CASCADE',
  })
  package: Package;
}
