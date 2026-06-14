import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Package } from './package.entity';

@Entity('package_locations')
export class PackageLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  type: 'international' | 'local';

  @Column('simple-array', { nullable: true })
  countries: string[];

  @Column('simple-array', { nullable: true })
  states: string[];

  @Column('simple-array', { nullable: true })
  cities: string[];

  @Column({ type: 'uuid', nullable: true })
  packageId: string;

  @OneToOne(() => Package, (pkg) => pkg.packageLocation, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  package: Package;
}
