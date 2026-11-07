import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    MONTH_NAMES,
    SalarySlipService,
} from "@/services/salary-slip.service";
import type { IOrganization } from "@/types/organization.types";
import type { IEmployeeSalary } from "@/types/salary.types";
import { Download, FileText, Printer } from "lucide-react";
import { toast } from "sonner";

interface SalarySlipPreviewModalProps {
    salary: IEmployeeSalary | null;
    organization?: IOrganization | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SalarySlipPreviewModal({
    salary,
    organization,
    open,
    onOpenChange,
}: SalarySlipPreviewModalProps) {
    if (!salary) return null;

    const org = organization || salary.organization;
    const color = org?.salarySlipColor || "#2563eb";
    const fields = SalarySlipService.parseFields(org);
    const logoUrl = SalarySlipService.resolveAssetUrl(org?.salarySlipLogo);
    const sealUrl = SalarySlipService.resolveAssetUrl(
        org?.salarySlipSeal || org?.invoiceSeal
    );

    const monthName = MONTH_NAMES[(salary.month || 1) - 1] || "Month";
    const periodLabel = `${monthName} ${salary.year}`;
    const fmt = (v: any) => SalarySlipService.formatCurrency(v);

    const handlePrintPDF = () => {
        try {
            SalarySlipService.openAndPrintSalarySlip(salary, org);
        } catch (err: any) {
            toast.error(err.message || "Failed to open PDF print view");
        }
    };

    const handleDownloadHTML = () => {
        try {
            SalarySlipService.downloadSalarySlipHTML(salary, org);
            toast.success("Downloaded salary slip file");
        } catch (err: any) {
            toast.error("Failed to download salary slip");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[820px] max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between pr-6">
                        <span className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Salary Slip Preview — {salary.employee?.name} (
                            {periodLabel})
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        Review the formatted salary slip below or click "Print / Save as PDF" to download as a PDF document.
                    </DialogDescription>
                </DialogHeader>

                {/* Printable Slip Card */}
                <div className="bg-white text-slate-900 border border-slate-300 rounded-lg p-6 space-y-4 text-xs shadow-xs">
                    {/* Header */}
                    <div
                        className="flex items-start justify-between pb-4 border-b-2"
                        style={{ borderBottomColor: color }}
                    >
                        <div className="flex items-center gap-3">
                            {fields.showLogo && logoUrl && (
                                <img
                                    src={logoUrl}
                                    alt="Logo"
                                    className="h-12 max-w-[130px] object-contain"
                                />
                            )}
                            <div>
                                <h2
                                    className="text-lg font-extrabold"
                                    style={{ color }}
                                >
                                    {fields.companyHeaderText}
                                </h2>
                                <p className="text-[11px] text-slate-500 whitespace-pre-line">
                                    {fields.companyAddressText}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Salary Slip
                            </div>
                            <div
                                className="text-base font-extrabold"
                                style={{ color }}
                            >
                                {periodLabel}
                            </div>
                            <div className="font-mono text-xs text-slate-600">
                                #{salary.slipNumber}
                            </div>
                        </div>
                    </div>

                    {/* Employee & Statutory Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-500">
                                    Employee Name:
                                </span>
                                <span className="font-semibold">
                                    {salary.employee?.name || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">
                                    Designation:
                                </span>
                                <span className="font-semibold">
                                    {salary.employee?.designation || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Email:</span>
                                <span>{salary.employee?.email || "N/A"}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            {fields.showBankDetails && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">
                                            Bank Name:
                                        </span>
                                        <span className="font-semibold">
                                            {salary.salaryStructure?.bankName ||
                                                "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">
                                            Account / IFSC:
                                        </span>
                                        <span className="font-mono font-semibold">
                                            {salary.salaryStructure
                                                ?.accountNumber || "N/A"}{" "}
                                            {salary.salaryStructure?.ifscCode
                                                ? `(${salary.salaryStructure.ifscCode})`
                                                : ""}
                                        </span>
                                    </div>
                                </>
                            )}
                            {fields.showStatutoryDetails && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        PAN / UAN:
                                    </span>
                                    <span className="font-mono font-semibold">
                                        {salary.salaryStructure?.panNumber ||
                                            "N/A"}{" "}
                                        /{" "}
                                        {salary.salaryStructure?.uanNumber ||
                                            "N/A"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Attendance Summary */}
                    {fields.showAttendanceSummary && (
                        <div className="grid grid-cols-5 gap-2 text-center">
                            <div className="border border-slate-200 rounded p-2">
                                <div className="text-[10px] uppercase text-slate-500 font-semibold">
                                    Working Days
                                </div>
                                <div className="font-mono font-bold text-sm">
                                    {salary.totalWorkingDays}
                                </div>
                            </div>
                            <div className="border border-slate-200 rounded p-2">
                                <div className="text-[10px] uppercase text-slate-500 font-semibold">
                                    Days Worked
                                </div>
                                <div className="font-mono font-bold text-sm">
                                    {salary.daysWorked}
                                </div>
                            </div>
                            <div className="border border-slate-200 rounded p-2">
                                <div className="text-[10px] uppercase text-slate-500 font-semibold">
                                    Paid Leaves
                                </div>
                                <div className="font-mono font-bold text-sm text-emerald-600">
                                    {salary.paidLeaves}
                                </div>
                            </div>
                            <div className="border border-slate-200 rounded p-2">
                                <div className="text-[10px] uppercase text-slate-500 font-semibold">
                                    LOP / Unpaid
                                </div>
                                <div className="font-mono font-bold text-sm text-rose-600">
                                    {salary.unpaidLeaves}
                                </div>
                            </div>
                            <div
                                className="border rounded p-2 bg-slate-50"
                                style={{ borderColor: color }}
                            >
                                <div
                                    className="text-[10px] uppercase font-semibold"
                                    style={{ color }}
                                >
                                    Payable Days
                                </div>
                                <div
                                    className="font-mono font-bold text-sm"
                                    style={{ color }}
                                >
                                    {salary.payableDays}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Earnings & Deductions Table */}
                    <div className="border border-slate-200 rounded overflow-hidden">
                        <div
                            className="grid grid-cols-4 text-white font-bold text-[11px] uppercase px-3 py-2"
                            style={{ backgroundColor: color }}
                        >
                            <span>Earnings</span>
                            <span className="text-right pr-3">Amount</span>
                            <span className="pl-3">Deductions</span>
                            <span className="text-right">Amount</span>
                        </div>
                        <div className="divide-y divide-slate-200 text-xs">
                            <div className="grid grid-cols-4 px-3 py-2">
                                <span>Basic Salary</span>
                                <span className="text-right font-mono pr-3 border-r border-slate-200">
                                    {fmt(salary.basicSalary)}
                                </span>
                                <span className="pl-3">
                                    Provident Fund (EPF)
                                </span>
                                <span className="text-right font-mono">
                                    {fmt(salary.pfDeduction)}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 px-3 py-2 bg-slate-50">
                                <span>House Rent Allowance (HRA)</span>
                                <span className="text-right font-mono pr-3 border-r border-slate-200">
                                    {fmt(salary.hra)}
                                </span>
                                <span className="pl-3">
                                    Employee State Insurance (ESI)
                                </span>
                                <span className="text-right font-mono">
                                    {fmt(salary.esiDeduction)}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 px-3 py-2">
                                <span>Dearness Allowance (DA)</span>
                                <span className="text-right font-mono pr-3 border-r border-slate-200">
                                    {fmt(salary.da)}
                                </span>
                                <span className="pl-3">
                                    Professional Tax (PT)
                                </span>
                                <span className="text-right font-mono">
                                    {fmt(salary.professionalTax)}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 px-3 py-2 bg-slate-50">
                                <span>Conveyance Allowance</span>
                                <span className="text-right font-mono pr-3 border-r border-slate-200">
                                    {fmt(salary.conveyanceAllowance)}
                                </span>
                                <span className="pl-3">Income Tax (TDS)</span>
                                <span className="text-right font-mono">
                                    {fmt(salary.tdsDeduction)}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 px-3 py-2">
                                <span>Medical Allowance</span>
                                <span className="text-right font-mono pr-3 border-r border-slate-200">
                                    {fmt(salary.medicalAllowance)}
                                </span>
                                <span className="pl-3">Loss of Pay (LOP)</span>
                                <span className="text-right font-mono">
                                    {fmt(salary.lopDeduction)}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 px-3 py-2 bg-slate-50">
                                <span>Special Allowance</span>
                                <span className="text-right font-mono pr-3 border-r border-slate-200">
                                    {fmt(salary.specialAllowance)}
                                </span>
                                <span className="pl-3">Other Deductions</span>
                                <span className="text-right font-mono">
                                    {fmt(salary.otherDeductions)}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 px-3 py-2 bg-emerald-50/60">
                                <span className="text-emerald-700 font-semibold">
                                    Additional Incentive{" "}
                                    {salary.incentiveNote
                                        ? `(${salary.incentiveNote})`
                                        : ""}
                                </span>
                                <span className="text-right font-mono font-bold text-emerald-700 pr-3 border-r border-slate-200">
                                    {fmt(salary.additionalIncentive)}
                                </span>
                                <span className="pl-3"></span>
                                <span></span>
                            </div>
                            <div className="grid grid-cols-4 px-3 py-2.5 bg-slate-100 font-bold">
                                <span>Gross Earnings</span>
                                <span className="text-right font-mono pr-3 border-r border-slate-200">
                                    {fmt(salary.grossEarnings)}
                                </span>
                                <span className="pl-3">Total Deductions</span>
                                <span className="text-right font-mono text-rose-600">
                                    {fmt(salary.totalDeductions)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Net Payable */}
                    <div
                        className="flex items-center justify-between p-4 rounded-lg border-2 bg-slate-50"
                        style={{ borderColor: color }}
                    >
                        <div>
                            <div className="text-[11px] uppercase font-bold text-slate-500">
                                Net Salary Payable ({periodLabel})
                            </div>
                            {fields.showNetInWords && (
                                <div className="text-xs italic text-slate-600 mt-0.5">
                                    {SalarySlipService.numberToIndianWords(
                                        Number(salary.netSalary)
                                    )}
                                </div>
                            )}
                        </div>
                        <div
                            className="text-2xl font-extrabold font-mono"
                            style={{ color }}
                        >
                            {fmt(salary.netSalary)}
                        </div>
                    </div>

                    {/* Seal */}
                    {fields.showSeal && sealUrl && (
                        <div
                            style={{ textAlign: fields.sealAlign || "right" }}
                            className="pt-2"
                        >
                            <div className="inline-block text-center">
                                <img
                                    src={sealUrl}
                                    alt="Seal"
                                    className="h-14 max-w-[140px] object-contain mx-auto"
                                />
                                <div className="text-[10px] font-semibold text-slate-500 border-t border-slate-300 pt-1 mt-1">
                                    Authorised Signatory
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    {fields.showFooter && fields.customFooterText && (
                        <div className="text-center text-[11px] text-slate-500 border-t border-slate-200 pt-3 whitespace-pre-line">
                            {fields.customFooterText}
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={handleDownloadHTML}
                        className="gap-1.5 cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        Download Slip File
                    </Button>
                    <Button
                        onClick={handlePrintPDF}
                        className="gap-1.5 cursor-pointer"
                    >
                        <Printer className="w-4 h-4" />
                        Print / Save as PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

