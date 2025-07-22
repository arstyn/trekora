import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Package } from './package.entity';

@Entity('payment_milestones')
export class PaymentMilestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  percentage: number;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  dueDate: string;

  @Column({ type: 'uuid', nullable: true })
  packageId: string;

  @ManyToOne(() => Package, (pkg) => pkg.paymentStructure, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  package: Package;
}
