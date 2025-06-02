export interface Customer{
    id: string,
    name: string,
    phone: string,
    address?: string,
    notes?:string,
}
export interface Itineray{
    id:string,
    customerId:string,
    destination:string,
    startDate:string,
    endDate:string,
    description?:string,
    status:string,
    totalCost:number
}
export interface Group{
id:string,
name:string,
type:string,
memberIds:string[],
}