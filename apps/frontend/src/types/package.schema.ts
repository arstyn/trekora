import { z } from "zod";

export interface IThumbnail {
    id: string;
    filename: string;
    relatedId: string;
    relatedType: string;
    url: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IItinerary {
    day?: number;
    title?: string;
    description?: string;
    activities?: string[];
    meals?: string[];
    accommodation?: string;
    images?: string[];
}

export interface ICancellationStructure {
    id: string;
    timeframe?: string;
    amount?: number;
    description?: string;
    packageId?: string;
}

export interface ICancellationPolicy {
    id: string;
    text?: string;
    packageId?: string;
}

export interface IPaymentStructure {
    name?: string;
    amount?: number;
    description?: string;
    dueDate:
        | "30_days_before"
        | "2_weeks_before"
        | "1_week_before"
        | "booking"
        | "departure";
}

export interface IPackages {
    id: string;
    name?: string;
    destination?: string;
    duration?: string;
    price?: string;
    description?: string;
    maxGuests?: number;
    category?:
        | "adventure"
        | "cultural"
        | "relaxation"
        | "wildlife"
        | "luxury"
        | "budget";
    status?: "draft" | "published" | "edited" | "archived";
    draftContent?: any;
    thumbnail?: string;
    cancellationPolicy?: ICancellationPolicy[];
    inclusions?: string[];
    exclusions?: string[];
    createdById: string;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
    packageLocation?: PackageLocation;
    itinerary?: IItinerary[];
    paymentStructure?: IPaymentStructure[];
    cancellationStructure?: ICancellationStructure[];
    documentRequirements?: DocumentRequirement[];
    preTripChecklist?: IChecklistItem[];
    mealsBreakdown?: MealsBreakdown;
    transportation?: Transportation;
}

export const paymentMilestoneSchema = z.object({
    name: z.string().optional(),
    amount: z.number().min(0).optional(),
    description: z.string().optional(),
    dueDate: z
        .enum([
            "booking",
            "30_days_before",
            "2_weeks_before",
            "1_week_before",
            "departure",
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
});

export const transportationSchema = z.object({
    toDestination: z
        .object({
            mode: z.string().optional(),
            details: z.string().optional(),
            included: z.boolean().optional(),
        })
        .optional(),
    fromDestination: z
        .object({
            mode: z.string().optional(),
            details: z.string().optional(),
            included: z.boolean().optional(),
        })
        .optional(),
    duringTrip: z
        .object({
            mode: z.string().optional(),
            details: z.string().optional(),
            included: z.boolean().optional(),
        })
        .optional(),
});

export const itineraryDaySchema = z.object({
    day: z.number().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    activities: z.array(z.string()).optional(),
    meals: z.array(z.string()).optional(),
    accommodation: z.string().optional(),
    images: z.array(z.file()).optional(),
});

export const documentRequirementSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    mandatory: z.boolean().optional(),
    applicableFor: z.enum(["adults", "children", "all"]).optional(),
});

export const checklistItemSchema = z.object({
    task: z.string().optional(),
    description: z.string().optional(),
    category: z
        .enum(["documents", "booking", "preparation", "communication"])
        .optional(),
    type: z.enum(["individual", "common"]).optional(),
    dueDate: z.string().optional(),
});

export const packageLocationSchema = z.object({
    type: z.enum(["international", "local"]).optional(),
    country: z.string().optional(),
    state: z.string().optional(),
});

export const packageFormSchema = z
    .object({
        name: z.string().optional(),
        destination: z.string().optional(),
        duration: z.string().optional(),
        price: z.number().optional(),
        description: z.string().optional(),
        maxGuests: z.number().optional(),
        category: z
            .enum([
                "adventure",
                "cultural",
                "relaxation",
                "wildlife",
                "luxury",
                "budget",
            ])
            .optional(),
        status: z.enum(["draft", "published", "edited", "archived"]).optional(),
        thumbnail: z.file().optional(),
        inclusions: z.array(z.string()).optional(),
        exclusions: z.array(z.string()).optional(),
        itinerary: z.array(itineraryDaySchema).optional(),
        paymentStructure: z.array(paymentMilestoneSchema).optional(),
        cancellationStructure: z.array(cancellationTierSchema).optional(),
        mealsBreakdown: mealsBreakdownSchema.optional(),
        transportation: transportationSchema.optional(),
        documentRequirements: z.array(documentRequirementSchema).optional(),
        preTripChecklist: z.array(checklistItemSchema).optional(),
        packageLocation: packageLocationSchema.optional(),
        cancellationPolicy: z.array(z.string()).optional(),
    })
    .refine(
        (data) => {
            if (!data.paymentStructure || !data.price) return true;
            const totalAmount = data.paymentStructure.reduce(
                (sum, milestone) => sum + (milestone.amount ?? 0),
                0,
            );
            return totalAmount === data.price;
        },
        {
            message:
                "Payment structure amounts must total exactly the package price",
            path: ["paymentStructure"],
        },
    );

export type PackageFormData = z.infer<typeof packageFormSchema>;
export type PaymentMilestone = z.infer<typeof paymentMilestoneSchema>;
export type CancellationTier = z.infer<typeof cancellationTierSchema>;
export type MealsBreakdown = z.infer<typeof mealsBreakdownSchema>;
export type Transportation = z.infer<typeof transportationSchema>;
export type ItineraryDay = z.infer<typeof itineraryDaySchema>;
export type DocumentRequirement = z.infer<typeof documentRequirementSchema>;
export type IChecklistItem = z.infer<typeof checklistItemSchema>;
export type PackageLocation = z.infer<typeof packageLocationSchema>;
