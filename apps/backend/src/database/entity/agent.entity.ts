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
import { Organization } from './organization.entity';
import { Booking } from './booking.entity';

export enum CommissionType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true, name: 'agency_name' })
  agencyName?: string;

  @Column({ type: 'varchar', nullable: true })
  email?: string;

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({
    type: 'enum',
    enum: CommissionType,
    default: CommissionType.PERCENTAGE,
    name: 'commission_type',
  })
  commissionType: CommissionType;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    name: 'commission_value',
  })
  commissionValue: number;

  @Column({
    type: 'enum',
    enum: AgentStatus,
    default: AgentStatus.ACTIVE,
  })
  status: AgentStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @OneToMany(() => Booking, (booking) => booking.agent)
  bookings: Booking[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
