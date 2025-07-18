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

  @Column('json', { nullable: true })
  toDestination: {
    mode: string;
    details: string;
    included: boolean;
  };

  @Column('json', { nullable: true })
  fromDestination: {
    mode: string;
    details: string;
    included: boolean;
  };

  @Column('json', { nullable: true })
  duringTrip: {
    mode: string;
    details: string;
    included: boolean;
  };

  @Column({ type: 'uuid', nullable: true })
  packageId: string;

  @OneToOne(() => Package, (pkg) => pkg.transportation, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  package: Package;
}
