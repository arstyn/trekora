import { EntityManager } from 'typeorm';
import { PaymentStructureTemplate } from '../../database/entity/payment-structure-template.entity';
import { CancellationTierTemplate } from '../../database/entity/cancellation-tier-template.entity';

export async function seedDefaultTemplates(
  entityManager: EntityManager,
  organizationId: string,
  createdById: string,
): Promise<void> {
  // Create default Payment Structure Template
  const paymentTemplate = entityManager.create(PaymentStructureTemplate, {
    name: 'Standard Payment Plan',
    description: '50% advance and 50% two weeks before',
    organizationId,
    createdById,
    milestones: [
      {
        name: 'Advance Payment',
        amount: 50,
        description: 'Initial advance payment',
        dueDate: 'booking',
        order: 1,
      },
      {
        name: 'Final Payment',
        amount: 50,
        description: 'Balance payment',
        dueDate: '2_weeks_before',
        order: 2,
      },
    ],
  });
  await entityManager.save(PaymentStructureTemplate, paymentTemplate);

  // Create default Cancellation Tier Template
  const cancellationTemplate = entityManager.create(CancellationTierTemplate, {
    name: 'Standard Cancellation Policy',
    description: 'Standard staggered cancellation charges',
    organizationId,
    createdById,
    tiers: [
      {
        timeframe: '30_days_before',
        amount: 20,
        description: '20% - 30 days before',
      },
      {
        timeframe: '2_weeks_before',
        amount: 40,
        description: '40% - 15-30 days',
      },
      {
        timeframe: '1_week_before',
        amount: 80,
        description: '80% - 7-14 days',
      },
      {
        timeframe: 'departure',
        amount: 100,
        description: '100% - 0-7 days',
      },
    ],
  });
  await entityManager.save(CancellationTierTemplate, cancellationTemplate);
}
