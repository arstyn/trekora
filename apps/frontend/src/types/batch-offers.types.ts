export type OfferDiscountType = 'percentage' | 'flat';
export type OfferDiscountMode = 'fixed' | 'range';
export type OfferDiscountScope = 'passenger' | 'booking';

export interface IBatchOffer {
  id: string;
  batchId: string;
  organizationId: string;
  name: string;
  description?: string | null;
  discountType: OfferDiscountType;
  discountMode: OfferDiscountMode;
  discountValue: number;
  minDiscountValue?: number | null;
  maxDiscountValue?: number | null;
  discountScope: OfferDiscountScope;
  minTravelers: number;
  maxDiscountCap?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  isActive: boolean;
  createdById?: string | null;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateBatchOffer {
  name: string;
  description?: string;
  discountType: OfferDiscountType;
  discountMode?: OfferDiscountMode;
  discountValue: number;
  minDiscountValue?: number | null;
  maxDiscountValue?: number | null;
  discountScope?: OfferDiscountScope;
  minTravelers?: number;
  maxDiscountCap?: number;
  validFrom?: string | null;
  validUntil?: string | null;
  isActive?: boolean;
}

export interface IUpdateBatchOffer extends Partial<ICreateBatchOffer> {}
