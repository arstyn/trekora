import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RelatedType {
  NA = 'na',
  PACKAGE = 'package',
  CUSTOMER = 'customer',
  EMPLOYEE = 'employee',
  DEPARTMENT = 'department',
  ORGANIZATION = 'organization',
  USER = 'user',
  ITINERARY = 'itinerary',
  LEAD = 'lead',
  LEAD_UPDATES = 'lead-updates',
}

@Entity({ name: 'file_manager' })
export class FileManager extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column({ name: 'related_id' })
  relatedId: string;

  @Column({
    type: 'enum',
    enum: RelatedType,
    default: RelatedType.NA,
    name: 'related_id',
  })
  relatedType: RelatedType;

  @Column()
  url: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
