import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axios";
import {
    MONTH_NAMES,
    SalarySlipService,
} from "@/services/salary-slip.service";
import { SalaryService } from "@/services/salary.service";
import type { IEmployee } from "@/types/employee.types";
import type { SalaryStatus } from "@/types/salary.types";
import {
    ArrowLeft,
    Banknote,
    Building,
    Calculator,
    Calendar,
    Loader2,
    Save,
    Sparkles,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function CreateSalaryPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedEmpId = searchParams.get("employeeId") || "";

    const now = new Date();
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [employeeId, setEmployeeId] = useState<string>(preselectedEmpId);
    const [month, setMonth] = useState<number>(now.getMonth() + 1);
    const [year, setYear] = useState<number>(now.getFullYear());

    // Working Days & Leaves
    const [totalWorkingDays, setTotalWorkingDays] = useState<number>(30);
    const [paidLeaves, setPaidLeaves] = useState<number>(0);
    const [unpaidLeaves, setUnpaidLeaves] = useState<number>(0);
    const [autoLop, setAutoLop] = useState<boolean>(true);

    // Indian Earnings
    const [basicSalary, setBasicSalary] = useState<number>(0);
    const [hra, setHra] = useState<number>(0);
    const [da, setDa] = useState<number>(0);
    const [conveyanceAllowance, setConveyanceAllowance] = useState<number>(0);
    const [medicalAllowance, setMedicalAllowance] = useState<number>(0);
    const [specialAllowance, setSpecialAllowance] = useState<number>(0);
    const [additionalIncentive, setAdditionalIncentive] = useState<number>(0);
    const [incentiveNote, setIncentiveNote] = useState<string>("");
    const [otherEarnings] = useState<number>(0);

    // Indian Deductions
    const [pfDeduction, setPfDeduction] = useState<number>(0);
    const [esiDeduction, setEsiDeduction] = useState<number>(0);
    const [professionalTax, setProfessionalTax] = useState<number>(0);
    const [tdsDeduction, setTdsDeduction] = useState<number>(0);
    const [lopDeduction, setLopDeduction] = useState<number>(0);
    const [otherDeductions, setOtherDeductions] = useState<number>(0);

    // Statutory & Bank
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [ifscCode, setIfscCode] = useState("");
    const [panNumber, setPanNumber] = useState("");
    const [uanNumber, setUanNumber] = useState("");
    const [pfNumber, setPfNumber] = useState("");
    const [saveToStructure, setSaveToStructure] = useState<boolean>(true);

    // Status & Payment info
    const [status, setStatus] = useState<SalaryStatus>("processed");
    const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer");
    const [paymentReference, setPaymentReference] = useState<string>("");
    const [paymentDate, setPaymentDate] = useState<string>(
        now.toISOString().split("T")[0]
    );
    const [remarks, setRemarks] = useState<string>("");

    const [loadingPreview, setLoadingPreview] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        axiosInstance
            .get<IEmployee[]>("/employee")
            .then((r) => setEmployees(r.data || []))
            .catch(() => {});
    }, []);

    const loadPreviewForEmployee = useCallback(
        async (empId: string, m: number, y: number, workDays: number) => {
            if (!empId) return;
            setLoadingPreview(true);
            try {
                const res = await SalaryService.calculatePreview({
                    employeeId: empId,
                    month: m,
                    year: y,
                    totalWorkingDays: workDays,
                });
                const p = res.preview;
                const s = res.structure;
                setPaidLeaves(Number(p.paidLeaves || 0));
                setUnpaidLeaves(Number(p.unpaidLeaves || 0));
                setBasicSalary(Number(p.basicSalary || 0));
                setHra(Number(p.hra || 0));
                setDa(Number(p.da || 0));
                setConveyanceAllowance(Number(p.conveyanceAllowance || 0));
                setMedicalAllowance(Number(p.medicalAllowance || 0));
                setSpecialAllowance(Number(p.specialAllowance || 0));
                setPfDeduction(Number(p.pfDeduction || 0));
                setEsiDeduction(Number(p.esiDeduction || 0));
                setProfessionalTax(Number(p.professionalTax || 0));
                setTdsDeduction(Number(p.tdsDeduction || 0));
                setLopDeduction(Number(p.lopDeduction || 0));

                setBankName(s?.bankName || "");
                setAccountNumber(s?.accountNumber || "");
                setIfscCode(s?.ifscCode || "");
                setPanNumber(s?.panNumber || "");
                setUanNumber(s?.uanNumber || "");
                setPfNumber(s?.pfNumber || "");
            } catch (err) {
                console.error("Failed to load salary preview:", err);
            } finally {
                setLoadingPreview(false);
            }
        },
        []
    );

    useEffect(() => {
        if (employeeId) {
            loadPreviewForEmployee(employeeId, month, year, totalWorkingDays);
        }
    }, [employeeId, month, year]);

    const baseFixedGross =
        Number(basicSalary || 0) +
        Number(hra || 0) +
        Number(da || 0) +
        Number(conveyanceAllowance || 0) +
        Number(medicalAllowance || 0) +
        Number(specialAllowance || 0);

    // Auto-recompute LOP when autoLop is enabled
    useEffect(() => {
        if (autoLop) {
            const calcLop =
                totalWorkingDays > 0 && unpaidLeaves > 0
                    ? Math.round(
                          (baseFixedGross / totalWorkingDays) *
                              unpaidLeaves *
                              100
                      ) / 100
                    : 0;
            setLopDeduction(calcLop);
        }
    }, [autoLop, baseFixedGross, totalWorkingDays, unpaidLeaves]);

    const payableDays = Math.max(0, totalWorkingDays - unpaidLeaves);
    const daysWorked = Math.max(0, payableDays - paidLeaves);
    const grossEarnings =
        baseFixedGross +
        Number(additionalIncentive || 0) +
        Number(otherEarnings || 0);
    const totalDeductions =
        Number(pfDeduction || 0) +
        Number(esiDeduction || 0) +
        Number(professionalTax || 0) +
        Number(tdsDeduction || 0) +
        Number(lopDeduction || 0) +
        Number(otherDeductions || 0);
    const netSalary = Math.max(0, grossEarnings - totalDeductions);

    const handleAutoFillIndianDefaults = () => {
        if (!basicSalary || basicSalary <= 0) {
            toast.error("Enter Basic Salary first to auto-calculate HRA & EPF");
            return;
        }
        setHra(Math.round(basicSalary * 0.4));
        setConveyanceAllowance(1600);
        setMedicalAllowance(1250);
        setPfDeduction(Math.min(1800, Math.round(basicSalary * 0.12)));
        setProfessionalTax(200);
        toast.success("Filled Indian standard HRA (40%), EPF (12%), and PT (₹200)");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeId) {
            toast.error("Please select an employee");
            return;
        }
        setSubmitting(true);
        try {
            const created = await SalaryService.createSalary({
                employeeId,
                month,
                year,
                totalWorkingDays,
                daysWorked,
                paidLeaves,
                unpaidLeaves,
                payableDays,
                basicSalary,
                hra,
                da,
                conveyanceAllowance,
                medicalAllowance,
                specialAllowance,
                additionalIncentive,
                incentiveNote: incentiveNote.trim() || undefined,
                otherEarnings,
                pfDeduction,
                esiDeduction,
                professionalTax,
                tdsDeduction,
                lopDeduction,
                otherDeductions,
                status,
                paymentMethod: paymentMethod || undefined,
                paymentReference: paymentReference.trim() || undefined,
                paymentDate: status === "paid" ? paymentDate : undefined,
                remarks: remarks.trim() || undefined,
                saveToStructure,
                bankName: bankName.trim() || undefined,
                accountNumber: accountNumber.trim() || undefined,
                ifscCode: ifscCode.trim().toUpperCase() || undefined,
                panNumber: panNumber.trim().toUpperCase() || undefined,
                uanNumber: uanNumber.trim() || undefined,
                pfNumber: pfNumber.trim() || undefined,
            });
            toast.success("Salary slip generated successfully");
            navigate(`/salaries/${created.id}`);
        } catch (err: any) {
            toast.error(
                err.response?.data?.message || "Failed to generate salary slip"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const fmt = (v: any) => SalarySlipService.formatCurrency(v);

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link
                                to="/salaries"
                                className="flex items-center gap-1.5"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Salaries
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Generate Salary Slip</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                        <Banknote className="w-7 h-7 text-primary" />
                        Generate Monthly Salary Slip
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                        Select an employee and payroll period. Approved leaves and saved salary structure will auto-populate.
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
            >
                {/* Left 2 Columns */}
                <div className="lg:col-span-2 space-y-6">
                    {/* 1. Employee & Period */}
                    <Card className="border border-border/60 shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    1. Employee & Payroll Period
                                </span>
                                {loadingPreview && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-normal">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Loading structure & leaves...
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    Select Employee *
                                </Label>
                                <Select
                                    value={employeeId}
                                    onValueChange={setEmployeeId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((emp) => (
                                            <SelectItem
                                                key={emp.id}
                                                value={emp.id}
                                            >
                                                {emp.name}{" "}
                                                {emp.designation
                                                    ? `(${emp.designation})`
                                                    : ""}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    Payroll Month *
                                </Label>
                                <Select
                                    value={String(month)}
                                    onValueChange={(v) => setMonth(Number(v))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MONTH_NAMES.map((m, idx) => (
                                            <SelectItem
                                                key={m}
                                                value={String(idx + 1)}
                                            >
                                                {m}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    Payroll Year *
                                </Label>
                                <Select
                                    value={String(year)}
                                    onValueChange={(v) => setYear(Number(v))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[
                                            now.getFullYear() - 1,
                                            now.getFullYear(),
                                            now.getFullYear() + 1,
                                        ].map((yr) => (
                                            <SelectItem
                                                key={yr}
                                                value={String(yr)}
                                            >
                                                {yr}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Working Days & Leaves */}
                    <Card className="border border-border/60 shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-primary" />
                                2. Working Days, Paid Leaves & LOP
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Approved leaves from Leave Management are automatically populated for the selected month.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Working Days
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.5"
                                        min={1}
                                        max={31}
                                        value={totalWorkingDays}
                                        onChange={(e) =>
                                            setTotalWorkingDays(
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-emerald-700">
                                        Paid Leaves
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.5"
                                        min={0}
                                        value={paidLeaves}
                                        onChange={(e) =>
                                            setPaidLeaves(
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-rose-600">
                                        Unpaid / LOP Days
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.5"
                                        min={0}
                                        value={unpaidLeaves}
                                        onChange={(e) =>
                                            setUnpaidLeaves(
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Days Worked
                                    </Label>
                                    <Input
                                        type="number"
                                        value={daysWorked}
                                        disabled
                                        className="bg-muted font-mono"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-primary">
                                        Payable Days
                                    </Label>
                                    <Input
                                        type="number"
                                        value={payableDays}
                                        disabled
                                        className="bg-primary/5 border-primary/30 font-mono font-bold text-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                                <div>
                                    <div className="text-xs font-semibold">
                                        Auto-calculate Loss of Pay (LOP) Deduction
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        Deducts (Fixed Gross ÷ Working Days) × Unpaid Leaves automatically.
                                    </div>
                                </div>
                                <Switch
                                    checked={autoLop}
                                    onCheckedChange={setAutoLop}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Indian Earnings & Additional Incentive */}
                    <Card className="border border-border/60 shadow-xs">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-emerald-600" />
                                    3. Earnings & Additional Incentive (₹)
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Standard Indian salary components plus monthly performance incentive or bonus.
                                </CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAutoFillIndianDefaults}
                                className="h-7 text-xs cursor-pointer"
                            >
                                Auto-Fill HRA (40%) & EPF
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Basic Salary (₹)
                                    </Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={basicSalary}
                                        onChange={(e) =>
                                            setBasicSalary(
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        House Rent Allowance (HRA)
                                    </Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={hra}
                                        onChange={(e) =>
                                            setHra(Number(e.target.value))
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Dearness Allowance (DA)
                                    </Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={da}
                                        onChange={(e) =>
                                            setDa(Number(e.target.value))
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Conveyance Allowance
                                    </Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={conveyanceAllowance}
                                        onChange={(e) =>
                                            setConveyanceAllowance(
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Medical Allowance
                                    </Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={medicalAllowance}
                                        onChange={(e) =>
                                            setMedicalAllowance(
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Special Allowance
                                    </Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={specialAllowance}
                                        onChange={(e) =>
                                            setSpecialAllowance(
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* Highlighted Additional Incentive Box */}
                            <div className="p-4 rounded-lg border-2 border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                        Additional Incentive / Bonus (₹)
                                    </Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={additionalIncentive}
                                        onChange={(e) =>
                                            setAdditionalIncentive(
                                                Number(e.target.value)
                                            )
                                        }
                                        className="border-emerald-300 font-mono font-bold"
                                    />
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <Label className="text-xs font-semibold">
                                        Incentive Description / Note (Optional)
                                    </Label>
                                    <Input
                                        placeholder="e.g., Sales Target Achievement / Festival Bonus"
                                        value={incentiveNote}
                                        onChange={(e) =>
                                            setIncentiveNote(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. Deductions */}
                    <Card className="border border-border/60 shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold text-rose-600">
                                4. Statutory & Other Deductions (₹)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs">
                                    Provident Fund (EPF)
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={pfDeduction}
                                    onChange={(e) =>
                                        setPfDeduction(Number(e.target.value))
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">
                                    Employee State Insurance (ESI)
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={esiDeduction}
                                    onChange={(e) =>
                                        setEsiDeduction(Number(e.target.value))
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">
                                    Professional Tax (PT)
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={professionalTax}
                                    onChange={(e) =>
                                        setProfessionalTax(
                                            Number(e.target.value)
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">
                                    Income Tax (TDS)
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={tdsDeduction}
                                    onChange={(e) =>
                                        setTdsDeduction(Number(e.target.value))
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-rose-600 font-semibold">
                                    Loss of Pay (LOP) Deduction
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={lopDeduction}
                                    onChange={(e) => {
                                        setAutoLop(false);
                                        setLopDeduction(Number(e.target.value));
                                    }}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">
                                    Other Deductions / Advance
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={otherDeductions}
                                    onChange={(e) =>
                                        setOtherDeductions(
                                            Number(e.target.value)
                                        )
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 5. Bank & Statutory Identifiers */}
                    <Card className="border border-border/60 shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Building className="w-4 h-4 text-primary" />
                                5. Bank & Statutory Identifiers (Printed on Payslip)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">Bank Name</Label>
                                    <Input
                                        placeholder="e.g., HDFC Bank"
                                        value={bankName}
                                        onChange={(e) =>
                                            setBankName(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Account Number
                                    </Label>
                                    <Input
                                        placeholder="Account Number"
                                        value={accountNumber}
                                        onChange={(e) =>
                                            setAccountNumber(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">IFSC Code</Label>
                                    <Input
                                        placeholder="IFSC Code"
                                        value={ifscCode}
                                        onChange={(e) =>
                                            setIfscCode(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        PAN Number
                                    </Label>
                                    <Input
                                        placeholder="ABCDE1234F"
                                        value={panNumber}
                                        onChange={(e) =>
                                            setPanNumber(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        UAN (EPF)
                                    </Label>
                                    <Input
                                        placeholder="UAN Number"
                                        value={uanNumber}
                                        onChange={(e) =>
                                            setUanNumber(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        PF / ESI Number
                                    </Label>
                                    <Input
                                        placeholder="PF / ESI Number"
                                        value={pfNumber}
                                        onChange={(e) =>
                                            setPfNumber(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                                <div>
                                    <div className="text-xs font-semibold">
                                        Save as Employee's Default Salary Structure
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        Updates this employee's permanent salary template for future months.
                                    </div>
                                </div>
                                <Switch
                                    checked={saveToStructure}
                                    onCheckedChange={setSaveToStructure}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Sticky Summary Column */}
                <div className="space-y-6 lg:sticky lg:top-6">
                    <Card className="border-2 border-primary/30 shadow-sm">
                        <CardHeader className="pb-3 bg-primary/5 border-b">
                            <CardTitle className="text-base font-bold">
                                Payroll Calculation Summary
                            </CardTitle>
                            <CardDescription className="text-xs">
                                {MONTH_NAMES[(month || 1) - 1]} {year} •{" "}
                                {payableDays}/{totalWorkingDays} Payable Days
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Base Fixed Earnings:
                                    </span>
                                    <span className="font-mono font-semibold">
                                        {fmt(baseFixedGross)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-emerald-600">
                                    <span>+ Additional Incentive:</span>
                                    <span className="font-mono font-semibold">
                                        {fmt(additionalIncentive)}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t pt-2 font-bold text-sm">
                                    <span>Gross Earnings:</span>
                                    <span className="font-mono">
                                        {fmt(grossEarnings)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-rose-600">
                                    <span>- Total Deductions:</span>
                                    <span className="font-mono font-semibold">
                                        -{fmt(totalDeductions)}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t-2 border-primary pt-3 text-base font-extrabold text-primary">
                                    <span>Net Salary Payable:</span>
                                    <span className="font-mono text-xl">
                                        {fmt(netSalary)}
                                    </span>
                                </div>
                                <p className="text-[11px] italic text-muted-foreground pt-1">
                                    {SalarySlipService.numberToIndianWords(
                                        netSalary
                                    )}
                                </p>
                            </div>

                            <div className="space-y-3 pt-3 border-t">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Salary Slip Status
                                    </Label>
                                    <Select
                                        value={status}
                                        onValueChange={(v) =>
                                            setStatus(v as SalaryStatus)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">
                                                Draft
                                            </SelectItem>
                                            <SelectItem value="processed">
                                                Processed (Ready for Dispersion)
                                            </SelectItem>
                                            <SelectItem value="paid">
                                                Paid (Disbursed)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Payment Mode
                                    </Label>
                                    <Select
                                        value={paymentMethod}
                                        onValueChange={setPaymentMethod}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bank_transfer">
                                                NEFT / IMPS / Bank Transfer
                                            </SelectItem>
                                            <SelectItem value="upi">
                                                UPI Transfer
                                            </SelectItem>
                                            <SelectItem value="cheque">
                                                Cheque
                                            </SelectItem>
                                            <SelectItem value="cash">
                                                Cash
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {status === "paid" && (
                                    <>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">
                                                Payment Date
                                            </Label>
                                            <Input
                                                type="date"
                                                value={paymentDate}
                                                onChange={(e) =>
                                                    setPaymentDate(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">
                                                UTR / Transaction Reference
                                            </Label>
                                            <Input
                                                placeholder="UTR / Reference ID"
                                                value={paymentReference}
                                                onChange={(e) =>
                                                    setPaymentReference(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Remarks (Optional)
                                    </Label>
                                    <Textarea
                                        rows={2}
                                        placeholder="Any payroll remarks..."
                                        value={remarks}
                                        onChange={(e) =>
                                            setRemarks(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full gap-2 cursor-pointer"
                            >
                                {submitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Generate Salary Slip
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}
