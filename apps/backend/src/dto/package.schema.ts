import { z } from 'zod';

export interface IPackages {
  id: string;
  name?: string;
  destination?: string;
  days?: number;
  nights?: number;
  description?: string;
  maxGuests?: number;
  category?: 'documents' | 'booking' | 'preparation' | 'communication';
  status?: 'draft' | 'published';
  packageSetup?: 'normal' | 'advanced';
  thumbnail?: string;
  createdById: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const paymentMilestoneSchema = z.object({
  name: z.string().optional(),
  amount: z.number().min(0).optional(),
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
  amount: z.number().min(0).optional(),
  description: z.string().optional(),
});

export const mealsBreakdownSchema = z.object({
  breakfast: z.array(z.string()).optional(),
  lunch: z.array(z.string()).optional(),
  dinner: z.array(z.string()).optional(),
  mealsCost: z.number().min(0).optional(),
});

export const transportationSegmentSchema = z.object({
  mode: z.enum(['flight', 'train', 'bus']).optional(),
  number: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  departureTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  coachType: z.enum(['1AC', '2AC', '3AC', 'SL', 'CC', 'EC', 'none']).optional(),
});

export const transportationSchema = z.array(
  z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    segments: z.array(transportationSegmentSchema).optional(),
    cost: z.number().min(0).optional(),
  })
);

export const itineraryDaySchema = z.object({
  day: z.number().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  activitiesCostType: z.enum(['per_day', 'per_activity', 'no_cost']).optional(),
  activitiesTotalCost: z.number().min(0).optional(),
  activities: z.array(z.object({ name: z.string().optional(), cost: z.number().optional() })).optional(),
  meals: z.array(z.string()).optional(),
  accommodation: z.string().optional(),
  accommodationCost: z.number().min(0).optional(),
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
  type: z.enum(['individual', 'common']).optional(),
  dueDate: z.string().optional(),
});

export const packageLocationSchema = z.object({
  type: z.enum(['international', 'local']).optional(),
  countries: z.array(z.string()).optional(),
  states: z.array(z.string()).optional(),
  cities: z.array(z.string()).optional(),
});

export const additionalCostSchema = z.object({
  name: z.string().optional(),
  cost: z.number().min(0).optional(),
});

export const packageTierSchema = z.object({
  name: z.string().optional(),
  adultCost: z.number().min(0).optional(),
  childCostType: z.enum(['flat', 'percentage']).optional(),
  childCostValue: z.number().min(0).optional(),
  infantCostType: z.enum(['flat', 'percentage']).optional(),
  infantCostValue: z.number().min(0).optional(),
  transportationId: z.string().optional(),
});

export const packageFormSchema = z.object({
  name: z.string().optional(),
  destination: z.string().optional(),
  days: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
  nights: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
  description: z.string().optional(),
  maxGuests: z.number().optional(),
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
  packageSetup: z.enum(['normal', 'advanced']).optional(),
  thumbnail: z.string().optional(),
  inclusions: z.string().optional(),
  exclusions: z.string().optional(),
  itinerary: z.string().optional(),
  paymentStructure: z.string().optional(),
  cancellationStructure: z.string().optional(),
  mealsBreakdown: z.string().optional(),
  transportation: z.string().optional(),
  documentRequirements: z.string().optional(),
  preTripChecklist: z.string().optional(),
  packageLocation: z.string().optional(),
  cancellationPolicy: z.string().optional(),
  additionalCosts: z.string().optional(),
  groundTransportationCost: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
  packageTiers: z.string().optional(),
});

export type PackageFormData = z.infer<typeof packageFormSchema>;
export type PaymentMilestone = z.infer<typeof paymentMilestoneSchema>;
export type CancellationTier = z.infer<typeof cancellationTierSchema>;
export type MealsBreakdown = z.infer<typeof mealsBreakdownSchema>;
export type ITransportation = z.infer<typeof transportationSchema>;
export type ItineraryDay = z.infer<typeof itineraryDaySchema>;
export type DocumentRequirement = z.infer<typeof documentRequirementSchema>;
export type PackageLocation = z.infer<typeof packageLocationSchema>;
export type ChecklistItem = z.infer<typeof checklistItemSchema>;
