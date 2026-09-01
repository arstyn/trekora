import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Batch } from './batch.entity';
import { Organization } from './organization.entity';
import { User } from './user.entity';

export enum OfferDiscountType {
  PERCENTAGE = 'percentage',
  FLAT = 'flat',
}

export enum OfferDiscountMode {
  FIXED = 'fixed',
  RANGE = 'range',
}

export enum OfferDiscountScope {
  PASSENGER = 'passenger',
  BOOKING = 'booking',
}

@Entity('batch_offers')
export class BatchOffer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'batch_id' })
  batchId: string;

  @ManyToOne(() => Batch, (batch) => batch.offers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batch_id' })
  batch: Batch;

  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: OfferDiscountType,
    default: OfferDiscountType.FLAT,
    name: 'discount_type',
  })
  discountType: OfferDiscountType;

  @Column({
    type: 'enum',
    enum: OfferDiscountMode,
    default: OfferDiscountMode.FIXED,
    name: 'discount_mode',
  })
  discountMode: OfferDiscountMode;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    name: 'discount_value',
    default: 0,
  })
  discountValue: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'min_discount_value',
  })
  minDiscountValue: number | null;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'max_discount_value',
  })
  maxDiscountValue: number | null;

  @Column({
    type: 'enum',
    enum: OfferDiscountScope,
    default: OfferDiscountScope.PASSENGER,
    name: 'discount_scope',
  })
  discountScope: OfferDiscountScope;

  @Column({ type: 'int', default: 1, name: 'min_travelers' })
  minTravelers: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'max_discount_cap',
  })
  maxDiscountCap: number | null;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'valid_from' })
  validFrom: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'valid_until' })
  validUntil: Date | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'uuid', nullable: true, name: 'created_by_id' })
  createdById: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
