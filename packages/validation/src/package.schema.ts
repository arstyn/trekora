import { z } from 'zod';

export const paymentMilestoneSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Milestone name is required'),
  percentage: z.number().min(0).max(100),
  description: z.string(),
  dueDate: z.enum([
    'booking',
    '30_days_before',
    '2_weeks_before',
    '1_week_before',
    'departure',
  ]),
});

export const cancellationTierSchema = z.object({
  id: z.string(),
  timeframe: z.string().min(1, 'Timeframe is required'),
  percentage: z.number().min(0).max(100),
  description: z.string(),
});

export const mealsBreakdownSchema = z.object({
  breakfast: z.array(z.string()),
  lunch: z.array(z.string()),
  dinner: z.array(z.string()),
});

export const transportationSchema = z.object({
  toDestination: z.object({
    mode: z.string(),
    details: z.string(),
    included: z.boolean(),
  }),
  fromDestination: z.object({
    mode: z.string(),
    details: z.string(),
    included: z.boolean(),
  }),
  duringTrip: z.object({
    mode: z.string(),
    details: z.string(),
    included: z.boolean(),
  }),
});

export const itineraryDaySchema = z.object({
  day: z.number(),
  title: z.string().min(1, 'Day title is required'),
  description: z.string(),
  activities: z.array(z.string()),
  meals: z.array(z.string()),
  accommodation: z.string(),
  images: z.array(z.string()),
});

export const documentRequirementSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Document name is required'),
  description: z.string(),
  mandatory: z.boolean(),
  applicableFor: z.enum(['adults', 'children', 'all']),
});

export const checklistItemSchema = z.object({
  id: z.string(),
  task: z.string().min(1, 'Task is required'),
  description: z.string(),
  category: z.enum(['documents', 'booking', 'preparation', 'communication']),
  dueDate: z.string(),
  completed: z.boolean(),
});

export const packageLocationSchema = z.object({
  type: z.enum(['international', 'local']),
  country: z.string().min(1, 'Country is required'),
  state: z.string().optional(),
});

export const packageFormSchema = z.object({
  name: z.string().min(1, 'Package name is required'),
  destination: z.string().min(1, 'Destination is required'),
  duration: z.string().min(1, 'Duration is required'),
  price: z.number().min(1, 'Price is required'),
  description: z.string().min(1, 'Description is required'),
  maxGuests: z.number().min(1, 'Max guests is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  difficulty: z.enum(['easy', 'moderate', 'challenging', 'extreme']),
  category: z.enum([
    'adventure',
    'cultural',
    'relaxation',
    'wildlife',
    'luxury',
    'budget',
  ]),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  status: z.enum(['draft', 'published']),
  thumbnail: z.string().optional(),
  itinerary: z.array(itineraryDaySchema),
  paymentStructure: z
    .array(paymentMilestoneSchema)
    .refine(
      (milestones) =>
        milestones.reduce((sum, m) => sum + m.percentage, 0) === 100,
      {
        message: 'Payment structure must total exactly 100%',
      },
    ),
  cancellationStructure: z.array(cancellationTierSchema),
  mealsBreakdown: mealsBreakdownSchema,
  transportation: transportationSchema,
  documentRequirements: z.array(documentRequirementSchema),
  preTripChecklist: z.array(checklistItemSchema),
  packageLocation: packageLocationSchema,
  cancellationPolicy: z.array(z.string()),
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
