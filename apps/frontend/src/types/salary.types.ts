import type { IEmployee } from "./employee.types";
import type { IOrganization } from "./organization.types";

export type SalaryStatus = "draft" | "processed" | "paid";

export interface ISalarySlipFieldsConfig {
    companyHeaderText?: string;
    companyAddressText?: string;
    customFooterText?: string;
    showLogo: boolean;
    showSeal: boolean;
    showBankDetails: boolean;
    showStatutoryDetails: boolean;
    showAttendanceSummary: boolean;
    showNetInWords: boolean;
    showFooter: boolean;
    sealAlign?: "left" | "center" | "right";
    layoutOrder?: string[];
    casualLeaveQuota?: number;
    sickLeaveQuota?: number;
    paidLeaveQuota?: number;
}

export interface IEmployeeSalaryStructure {
    id: string;
    employeeId: string;
    organizationId: string;
    basicSalary: number;
    hra: number;
    da: number;
    conveyanceAllowance: number;
    medicalAllowance: number;
    specialAllowance: number;
    pfEmployee: number;
    pfEmployer: number;
    esi: number;
    professionalTax: number;
    tds: number;
    panNumber?: string;
    uanNumber?: string;
    pfNumber?: string;
    esiNumber?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    casualLeaveQuota?: number | null;
    sickLeaveQuota?: number | null;
    paidLeaveQuota?: number | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IEmployeeSalary {
    id: string;
    slipNumber: string;
    employeeId: string;
    employee?: IEmployee;
    organizationId: string;
    organization?: IOrganization;
    salaryStructure?: IEmployeeSalaryStructure | null;
    month: number;
    year: number;
    totalWorkingDays: number;
    daysWorked: number;
    paidLeaves: number;
    unpaidLeaves: number;
    payableDays: number;
    basicSalary: number;
    hra: number;
    da: number;
    conveyanceAllowance: number;
    medicalAllowance: number;
    specialAllowance: number;
    additionalIncentive: number;
    incentiveNote?: string;
    otherEarnings: number;
    grossEarnings: number;
    pfDeduction: number;
    esiDeduction: number;
    professionalTax: number;
    tdsDeduction: number;
    lopDeduction: number;
    otherDeductions: number;
    totalDeductions: number;
    netSalary: number;
    status: SalaryStatus;
    paymentDate?: string | null;
    paymentMethod?: string | null;
    paymentReference?: string | null;
    emailSentAt?: string | null;
    emailSentCount: number;
    remarks?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ISalaryListSummary {
    totalRecords: number;
    totalPayroll: number;
    totalGross: number;
    totalIncentives: number;
    paidCount: number;
    processedCount: number;
    draftCount: number;
    emailSentCount: number;
}

