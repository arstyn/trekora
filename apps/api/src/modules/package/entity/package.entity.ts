
import { IPackageStatus, IPackageType } from '@repo/api/package/dto/create-package.dto';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';



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
    enum : IPackageType
  })
  type: IPackageType; // flight, train, vehicle

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
