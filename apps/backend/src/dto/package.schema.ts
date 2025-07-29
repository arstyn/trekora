import { z } from 'zod';

export interface IPackages {
  id: string;
  name?: string;
  destination?: string;
  duration?: string;
  price?: string;
  description?: string;
  maxGuests?: number;
  startDate?: Date;
  endDate?: Date;
  difficulty?: 'easy' | 'moderate' | 'challenging' | 'extreme';
  category?: 'documents' | 'booking' | 'preparation' | 'communication';
  status?: 'draft' | 'published';
  thumbnail?: string;
  preTripChecklist?: [];
  createdById: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const paymentMilestoneSchema = z.object({
  name: z.string().optional(),
  percentage: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
  dueDate: z
    .enum([
      'booking',
      '30_days_before',
      '2_weeks_before',
      '1_week_before',
      'departure',
    ])
    .optional(),
});

export const cancellationTierSchema = z.object({
  timeframe: z.string().optional(),
  percentage: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
});

export const mealsBreakdownSchema = z.object({
  breakfast: z.array(z.string()).optional(),
  lunch: z.array(z.string()).optional(),
  dinner: z.array(z.string()).optional(),
});

export const transportationSchema = z.object({
  toMode: z.string().nullable().optional(),
  toDetails: z.string().nullable().optional(),
  toIncluded: z.boolean().optional(),
  fromMode: z.string().nullable().optional(),
  fromDetails: z.string().nullable().optional(),
  fromIncluded: z.boolean().optional(),
  duringMode: z.string().nullable().optional(),
  duringDetails: z.string().nullable().optional(),
  duringIncluded: z.boolean().optional(),
  packageId: z.string(),
});

export const itineraryDaySchema = z.object({
  day: z.number().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  activities: z.array(z.string()).optional(),
  meals: z.array(z.string()).optional(),
  accommodation: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export const documentRequirementSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  mandatory: z.boolean().optional(),
  applicableFor: z.enum(['adults', 'children', 'all']).optional(),
});

export const checklistItemSchema = z.object({
  task: z.string().optional(),
  description: z.string().optional(),
  category: z
    .enum(['documents', 'booking', 'preparation', 'communication'])
    .optional(),
  dueDate: z.string().optional(),
  completed: z.boolean().optional(),
});

export const packageLocationSchema = z.object({
  type: z.enum(['international', 'local']).optional(),
  country: z.string().optional(),
  state: z.string().optional(),
});

export const packageFormSchema = z.object({
  name: z.string().optional(),
  destination: z.string().optional(),
  duration: z.string().optional(),
  price: z.number().optional(),
  description: z.string().optional(),
  maxGuests: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  difficulty: z.enum(['easy', 'moderate', 'challenging', 'extreme']).optional(),
  category: z
    .enum([
      'adventure',
      'cultural',
      'relaxation',
      'wildlife',
      'luxury',
      'budget',
    ])
    .optional(),
  status: z.enum(['draft', 'published']).optional(),
  thumbnail: z.string().optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  itinerary: z.array(itineraryDaySchema).optional(),
  paymentStructure: z
    .array(paymentMilestoneSchema)
    .optional()
    .refine(
      (milestones) =>
        !milestones ||
        milestones.reduce((sum, m) => sum + (m.percentage ?? 0), 0) === 100,
      {
        message: 'Payment structure must total exactly 100%',
      },
    ),
  cancellationStructure: z.array(cancellationTierSchema).optional(),
  mealsBreakdown: mealsBreakdownSchema.optional(),
  transportation: transportationSchema.optional(),
  documentRequirements: z.array(documentRequirementSchema).optional(),
  preTripChecklist: z.array(checklistItemSchema).optional(),
  packageLocation: packageLocationSchema.optional(),
  cancellationPolicy: z.array(z.string()).optional(),
});

export type PackageFormData = z.infer<typeof packageFormSchema>;
export type PaymentMilestone = z.infer<typeof paymentMilestoneSchema>;
export type CancellationTier = z.infer<typeof cancellationTierSchema>;
export type MealsBreakdown = z.infer<typeof mealsBreakdownSchema>;
export type Transportation = z.infer<typeof transportationSchema>;
export type ItineraryDay = z.infer<typeof itineraryDaySchema>;
export type DocumentRequirement = z.infer<typeof documentRequirementSchema>;
export type ChecklistItem = z.infer<typeof checklistItemSchema>;
export type PackageLocation = z.infer<typeof packageLocationSchema>;
