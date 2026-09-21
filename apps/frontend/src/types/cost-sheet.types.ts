export interface ICostSheetItem {
    id: string;
    title: string;
    cost: number;
    isMargin?: boolean;
}

export interface IAgeCategoryCostSheet {
    id: string;
    name: string; // e.g., "Adult", "Child (5-11 yrs)", "Infant (0-2 yrs)"
    categoryKey?: string;
    label?: string;
    ageDescription?: string;
    isDefault?: boolean;
    items: ICostSheetItem[];
    totalCost: number; // Sum of all items (expenses + margin)
}

export interface ICostSheetTier {
    id: string;
    name: string; // e.g., "Standard", "Deluxe", "Luxury", "Double Sharing"
    description?: string;
    isDefault?: boolean;
    ageCategories: IAgeCategoryCostSheet[];
}

export interface IBatchCostSheet {
    hasTiers: boolean;
    tiers: ICostSheetTier[];
    maxDiscountEnabled?: boolean;
    maxDiscountType?: "amount" | "percentage";
    maxDiscountScope?: "group" | "passenger";
    maxDiscountValue?: number;
    maxDiscountPercentage?: number;
}

export function generateId(): string {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function createDefaultMarginItem(cost = 0): ICostSheetItem {
    return {
        id: generateId(),
        title: "Operator Margin",
        cost,
        isMargin: true,
    };
}

export function calculateItemsTotal(items: ICostSheetItem[]): number {
    return (items || []).reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
}

export function createDefaultAgeCategory(
    name = "Adult",
    ageDescription = "12+ yrs",
    isDefault = true,
    initialItems: ICostSheetItem[] = [],
    marginCost = 0
): IAgeCategoryCostSheet {
    const items = initialItems.length > 0 ? [...initialItems] : [
        { id: generateId(), title: "Accommodation", cost: 0 },
        { id: generateId(), title: "Transportation", cost: 0 },
        { id: generateId(), title: "Activities & Sightseeing", cost: 0 },
        { id: generateId(), title: "Meals", cost: 0 },
    ];

    if (!items.some(it => it.isMargin)) {
        items.push(createDefaultMarginItem(marginCost));
    }

    return {
        id: generateId(),
        name,
        categoryKey: name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
        label: name,
        ageDescription,
        isDefault,
        items,
        totalCost: calculateItemsTotal(items),
    };
}

export function createDefaultTier(name = "Standard", isDefault = true): ICostSheetTier {
    return {
        id: generateId(),
        name,
        isDefault,
        ageCategories: [
            createDefaultAgeCategory("Adult", "12+ yrs", true),
        ],
    };
}

export function createDefaultCostSheet(): IBatchCostSheet {
    return {
        hasTiers: false,
        tiers: [createDefaultTier("Standard", true)],
        maxDiscountEnabled: false,
        maxDiscountType: "amount",
        maxDiscountScope: "group",
        maxDiscountValue: 0,
        maxDiscountPercentage: 0,
    };
}
