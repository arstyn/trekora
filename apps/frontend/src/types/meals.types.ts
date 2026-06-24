import { z } from "zod";

export const mealItemSchema = z.object({
    name: z.string().min(1, "Item name is required"),
    curry: z.string().optional(),
    price: z.number().min(0).or(z.string().transform((v) => v === "" ? 0 : Number(v))).optional(),
});

export const mealFormSchema = z.object({
    name: z.string().min(3, "Meal plan name must be at least 3 characters"),
    type: z.enum(["veg", "non-veg", "all"]),
    breakfast: z.array(mealItemSchema).default([]),
    lunch: z.array(mealItemSchema).default([]),
    dinner: z.array(mealItemSchema).default([]),
});

export type MealFormData = z.infer<typeof mealFormSchema>;

export interface MealItem {
    name: string;
    curry?: string;
    price?: number;
}

export interface IMeal {
    id: string;
    name: string;
    type: "veg" | "non-veg" | "all";
    createdById: string;
    organizationId: string;
    breakfast?: MealItem[];
    lunch?: MealItem[];
    dinner?: MealItem[];
    createdAt: string;
    updatedAt: string;
    createdBy?: {
        id: string;
        name: string;
    };
}

export interface IMealCreateInput {
    name: string;
    type: "veg" | "non-veg" | "all";
    breakfast?: MealItem[];
    lunch?: MealItem[];
    dinner?: MealItem[];
}

export interface IMealUpdateInput {
    name?: string;
    type?: "veg" | "non-veg" | "all";
    breakfast?: MealItem[];
    lunch?: MealItem[];
    dinner?: MealItem[];
}
