import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Package } from './package.entity';

@Entity('transportation_options')
export class TransportationOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'jsonb', nullable: true })
  segments: any;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ type: 'uuid', nullable: true })
  packageId: string;

  @ManyToOne(() => Package, (pkg) => pkg.transportationOptions, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  package: Package;
}
