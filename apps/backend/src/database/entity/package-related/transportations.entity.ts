import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Package } from './package.entity';

@Entity('transportations')
export class Transportation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  toMode: string;

  @Column({ type: 'varchar', nullable: true })
  toDetails: string;

  @Column({ type: 'boolean', default: false })
  toIncluded: boolean;

  @Column({ type: 'varchar', nullable: true })
  fromMode: string;

  @Column({ type: 'varchar', nullable: true })
  fromDetails: string;

  @Column({ type: 'boolean', default: false })
  fromIncluded: boolean;

  @Column({ type: 'varchar', nullable: true })
  duringMode: string;

  @Column({ type: 'varchar', nullable: true })
  duringDetails: string;

  @Column({ type: 'boolean', default: false })
  duringIncluded: boolean;

  @Column({ type: 'uuid', nullable: true })
  packageId: string;

  @OneToOne(() => Package, (pkg) => pkg.transportation, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  package: Package;
}
