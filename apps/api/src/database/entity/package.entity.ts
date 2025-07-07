import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChecklistItem } from './checklist-items.entity';
import { DocumentRequirement } from './document-requirements.entity';
import { ItineraryDay } from './itinerary-days.entity';
import { Organization } from './organization.entity';
import { User } from './user.entity';

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  name: string;

  @Column()
  destination: string;

  @Column()
  duration: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('text')
  description: string;

  @Column()
  maxGuests: number;

  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ['easy', 'moderate', 'challenging', 'extreme'],
  })
  difficulty: string;

  @Column({
    type: 'enum',
    enum: [
      'adventure',
      'cultural',
      'relaxation',
      'wildlife',
      'luxury',
      'budget',
    ],
  })
  category: string;

  @Column('simple-array')
  inclusions: string[];

  @Column('simple-array')
  exclusions: string[];

  @Column({
    type: 'enum',
    enum: ['draft', 'published'],
    default: 'draft',
  })
  status: string;

  @Column({ nullable: true })
  thumbnail: string;

  @Column('json')
  paymentStructure: PaymentMilestone[];

  @Column('json')
  cancellationStructure: CancellationTier[];

  @Column('simple-array')
  cancellationPolicy: string[];

  @Column('json')
  mealsBreakdown: MealsBreakdown;

  @Column('json')
  transportation: Transportation;

  @Column('json')
  packageLocation: PackageLocation;

  @OneToMany(() => ItineraryDay, (itinerary) => itinerary.package, {
    cascade: true,
  })
  itinerary: ItineraryDay[];

  @OneToMany(() => DocumentRequirement, (doc) => doc.package, { cascade: true })
  documentRequirements: DocumentRequirement[];

  @OneToMany(() => ChecklistItem, (item) => item.package, { cascade: true })
  preTripChecklist: ChecklistItem[];

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, (createdBy) => createdBy.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  createdBy: User;

  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  organization: Organization;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Type definitions for JSON columns
interface PaymentMilestone {
  id: string;
  name: string;
  percentage: number;
  description: string;
  dueDate: string;
}

interface CancellationTier {
  id: string;
  timeframe: string;
  percentage: number;
  description: string;
}

interface MealsBreakdown {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
}

interface Transportation {
  toDestination: {
    mode: string;
    details: string;
    included: boolean;
  };
  fromDestination: {
    mode: string;
    details: string;
    included: boolean;
  };
  duringTrip: {
    mode: string;
    details: string;
    included: boolean;
  };
}

interface PackageLocation {
  type: 'international' | 'local';
  country: string;
  state?: string;
}
