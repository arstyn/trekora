import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Package } from './package.entity';

@Entity('meals_breakdowns')
export class MealsBreakdown {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('simple-array', { nullable: true })
  breakfast: string[];

  @Column('simple-array', { nullable: true })
  lunch: string[];

  @Column('simple-array', { nullable: true })
  dinner: string[];

  @Column({ type: 'uuid', nullable: true })
  packageId: string;

  @OneToOne(() => Package, (pkg) => pkg.mealsBreakdown, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  package: Package;
}
