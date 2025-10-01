import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from '../organization.entity';
import { User } from '../user.entity';
import { CancellationPolicy } from './cancellation-policies.entity';
import { CancellationTier } from './cancellation-tiers.entity';
import { ChecklistItem } from './checklist-items.entity';
import { DocumentRequirement } from './document-requirements.entity';
import { Exclusion } from './exclusions.entity';
import { Inclusion } from './inclusions.entity';
import { ItineraryDay } from './itinerary-days.entity';
import { MealsBreakdown } from './meals-breakdowns.entity';
import { PackageLocation } from './package-locations.entity';
import { PaymentMilestone } from './payment-milestones.entity';
import { Transportation } from './transportations.entity';
import { Booking } from '../booking.entity';

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  destination: string;

  @Column({ nullable: true })
  duration: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price: number;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  maxGuests: number;

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
    nullable: true,
  })
  category: string;

  @OneToMany(() => Inclusion, (i) => i.package, {
    cascade: true,
    nullable: true,
  })
  inclusions: Inclusion[];

  @OneToMany(() => Exclusion, (e) => e.package, {
    cascade: true,
    nullable: true,
  })
  exclusions: Exclusion[];

  @Column({
    type: 'enum',
    enum: ['draft', 'published'],
    default: 'draft',
    nullable: true,
  })
  status: string;

  @Column({ nullable: true })
  thumbnail: string;

  @OneToMany(() => PaymentMilestone, (milestone) => milestone.package, {
    cascade: true,
    nullable: true,
  })
  paymentStructure: PaymentMilestone[];

  @OneToMany(() => CancellationTier, (tier) => tier.package, {
    cascade: true,
    nullable: true,
  })
  cancellationStructure: CancellationTier[];

  @OneToMany(() => CancellationPolicy, (policy) => policy.package, {
    cascade: true,
    nullable: true,
  })
  cancellationPolicy: CancellationPolicy[];

  @OneToOne(() => MealsBreakdown, (meals) => meals.package, {
    cascade: true,
    nullable: true,
  })
  mealsBreakdown: MealsBreakdown;

  @OneToOne(() => Transportation, (t) => t.package, {
    cascade: true,
    nullable: true,
  })
  transportation: Transportation;

  @OneToOne(() => PackageLocation, (loc) => loc.package, {
    cascade: true,
    nullable: true,
  })
  packageLocation: PackageLocation;

  @OneToMany(() => ItineraryDay, (itinerary) => itinerary.package, {
    cascade: true,
    nullable: true,
  })
  itinerary: ItineraryDay[];

  @OneToMany(() => DocumentRequirement, (doc) => doc.package, {
    cascade: true,
    nullable: true,
  })
  documentRequirements: DocumentRequirement[];

  @OneToMany(() => ChecklistItem, (item) => item.package, {
    cascade: true,
    nullable: true,
  })
  preTripChecklist: ChecklistItem[];

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, (createdBy) => createdBy.id, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  createdBy: User;

  @Column({ type: 'uuid', nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.id, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  organization: Organization;

  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;

  @OneToMany(() => Booking, (booking) => booking.package)
  bookings: Booking[];
}
