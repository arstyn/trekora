
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phoneNumber: string;

  @Column({})
  address: string;

  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.PENDING,
  })
  status: CustomerStatus;

  @Column({ nullable: true })
  notes?: string;
}