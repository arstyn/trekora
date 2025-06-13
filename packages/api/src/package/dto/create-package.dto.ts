export enum IPackageStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft'
}
export enum IPackageType {
  FLIGHT = 'flight',
  TRAIN = 'train'
}


export class ICreatePackageDto {
  organizationId: string;
  title: string;
  description: string;
  status: IPackageStatus;
  location: string;
  type: IPackageType;
  default_slot_limit: number;
  ticket_deadline: Date;
  profit_margin: number;
  created_by: string;
  from_date: Date;
  to_date: Date;
  number_of_days: number;
  number_of_nights: number;
}