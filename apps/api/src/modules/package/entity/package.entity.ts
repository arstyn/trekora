
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum IPackageStatus{
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DRAFT = 'draft'
}
export enum PackageType{
    FLIGHT = 'flight',
    TRAIN = 'train'
}

@Entity('package')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organization_id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum : IPackageStatus,
    default :IPackageStatus.ACTIVE
  })
  status: IPackageStatus; // draft, active, in-active

  @Column('text')
  location: string;

  @Column({
    type: 'enum',
    enum : PackageType
  })
  type: PackageType; // flight, train, vehicle

  @Column('int')
  default_slot_limit: number;

  @Column({ type: 'date' })
  ticket_deadline: Date;

  @Column('decimal')
  profit_margin: number;

  @Column()
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'date' })
  from_date: Date;

  @Column({ type: 'date' })
  to_date: Date;

  @Column('int')
  number_of_days: number;

  @Column('int')
  number_of_nights: number;
}
