import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export interface Relative {
  name: string;
  relation: string;
  phone: string;
  address: string;
}

@Entity('customer')
export class Customer {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  // Personal Details
  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ nullable: true, name: 'middle_name' })
  middleName?: string;

  @Column({ type: 'date', name: 'date_of_birth' })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    name: 'gender',
  })
  gender: Gender;

  @Column({ nullable: true, name: 'profile_photo' })
  profilePhoto?: string;

  // Contact Information
  @Column({ unique: true, name: 'email' })
  email: string;

  @Column({ name: 'phone' })
  phone: string;

  @Column({ nullable: true, name: 'alternative_phone' })
  alternativePhone?: string;

  @Column({ name: 'address' })
  address: string;

  // Emergency Contact
  @Column({ nullable: true, name: 'emergency_contact_name' })
  emergencyContactName?: string;

  @Column({ nullable: true, name: 'emergency_contact_phone' })
  emergencyContactPhone?: string;

  @Column({ nullable: true, name: 'emergency_contact_relation' })
  emergencyContactRelation?: string;

  // Passport Details
  @Column({ nullable: true, name: 'passport_number' })
  passportNumber?: string;

  @Column({ type: 'date', nullable: true, name: 'passport_expiry_date' })
  passportExpiryDate?: Date;

  @Column({ type: 'date', nullable: true, name: 'passport_issue_date' })
  passportIssueDate?: Date;

  @Column({ nullable: true, name: 'passport_country' })
  passportCountry?: string;

  @Column({ type: 'json', nullable: true, name: 'passport_photos' })
  passportPhotos?: string[];

  // ID Documents
  @Column({ nullable: true, name: 'voter_id' })
  voterId?: string;

  @Column({ type: 'json', nullable: true, name: 'voter_id_photos' })
  voterIdPhotos?: string[];

  @Column({ nullable: true, name: 'aadhaar_id' })
  aadhaarId?: string;

  @Column({ type: 'json', nullable: true, name: 'aadhaar_id_photos' })
  aadhaarIdPhotos?: string[];

  // Relatives Information
  @Column({ type: 'json', nullable: true, name: 'relatives' })
  relatives?: Relative[];

  // Travel Preferences
  @Column({ type: 'text', nullable: true, name: 'dietary_restrictions' })
  dietaryRestrictions?: string;

  @Column({ type: 'text', nullable: true, name: 'medical_conditions' })
  medicalConditions?: string;

  @Column({ type: 'text', nullable: true, name: 'special_requests' })
  specialRequests?: string;

  // Additional Information
  @Column({ type: 'text', nullable: true, name: 'notes' })
  notes?: string;

  // System Fields
  @Column({ type: 'uuid', name: 'created_by_id', nullable: true })
  createdById?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: User;

  @Column({ type: 'uuid', name: 'organization_id', nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt?: Date;
}
