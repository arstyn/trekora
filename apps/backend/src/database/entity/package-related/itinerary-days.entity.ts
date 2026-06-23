import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Package } from './package.entity';

@Entity('itinerary_days')
export class ItineraryDay {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ nullable: true })
  day: number;

  @Column({ nullable: true })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  activities: any;

  @Column({ type: 'varchar', nullable: true })
  activitiesCostType: 'per_day' | 'per_activity' | 'no_cost';

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  activitiesTotalCost: number;

  @Column('simple-array', { nullable: true })
  meals: string[];

  @Column({ nullable: true })
  accommodation: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  accommodationCost: number;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  packageId: string;

  @ManyToOne(() => Package, (pkg) => pkg.itinerary, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  package: Package;
}
