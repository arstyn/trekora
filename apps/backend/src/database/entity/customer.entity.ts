import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

@Entity('customer')
export class Customer {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ unique: true, name: 'email' })
  email: string;

  @Column({ name: 'phone' })
  phone: string;

  @Column({ name: 'address' })
  address: string;

  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.PENDING,
    name: 'status',
  })
  status: CustomerStatus;

  @Column({ nullable: true, name: 'notes' })
  notes?: string;
}
