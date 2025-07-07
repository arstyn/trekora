import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Package } from './package.entity';

@Entity('itinerary_days')
export class ItineraryDay {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  day: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('simple-array')
  activities: string[];

  @Column('simple-array')
  meals: string[];

  @Column()
  accommodation: string;

  @Column('simple-array')
  images: string[];

  @Column()
  packageId: string;

  @ManyToOne(() => Package, (pkg) => pkg.itinerary, { onDelete: 'CASCADE' })
  package: Package;
}
