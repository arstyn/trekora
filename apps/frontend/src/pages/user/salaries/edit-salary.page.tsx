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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
    MONTH_NAMES,
    SalarySlipService,
} from "@/services/salary-slip.service";
import { SalaryService } from "@/services/salary.service";
import type { IEmployeeSalary, SalaryStatus } from "@/types/salary.types";
import { ArrowLeft, Banknote, Loader2, Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function EditSalaryPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [salary, setSalary] = useState<IEmployeeSalary | null>(null);

    const [totalWorkingDays, setTotalWorkingDays] = useState<number>(30);
    const [paidLeaves, setPaidLeaves] = useState<number>(0);
    const [unpaidLeaves, setUnpaidLeaves] = useState<number>(0);

    const [basicSalary, setBasicSalary] = useState<number>(0);
    const [hra, setHra] = useState<number>(0);
    const [da, setDa] = useState<number>(0);
    const [conveyanceAllowance, setConveyanceAllowance] = useState<number>(0);
    const [medicalAllowance, setMedicalAllowance] = useState<number>(0);
    const [specialAllowance, setSpecialAllowance] = useState<number>(0);
    const [additionalIncentive, setAdditionalIncentive] = useState<number>(0);
    const [incentiveNote, setIncentiveNote] = useState<string>("");
    const [otherEarnings, setOtherEarnings] = useState<number>(0);

    const [pfDeduction, setPfDeduction] = useState<number>(0);
    const [esiDeduction, setEsiDeduction] = useState<number>(0);
    const [professionalTax, setProfessionalTax] = useState<number>(0);
    const [tdsDeduction, setTdsDeduction] = useState<number>(0);
    const [lopDeduction, setLopDeduction] = useState<number>(0);
    const [otherDeductions, setOtherDeductions] = useState<number>(0);

    const [status, setStatus] = useState<SalaryStatus>("processed");
    const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer");
    const [paymentReference, setPaymentReference] = useState<string>("");
    const [paymentDate, setPaymentDate] = useState<string>("");
    const [remarks, setRemarks] = useState<string>("");

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        SalaryService.getSalaryById(id)
            .then((s) => {
                setSalary(s);
                setTotalWorkingDays(Number(s.totalWorkingDays || 30));
                setPaidLeaves(Number(s.paidLeaves || 0));
                setUnpaidLeaves(Number(s.unpaidLeaves || 0));
                setBasicSalary(Number(s.basicSalary || 0));
                setHra(Number(s.hra || 0));
                setDa(Number(s.da || 0));
                setConveyanceAllowance(Number(s.conveyanceAllowance || 0));
                setMedicalAllowance(Number(s.medicalAllowance || 0));
                setSpecialAllowance(Number(s.specialAllowance || 0));
                setAdditionalIncentive(Number(s.additionalIncentive || 0));
                setIncentiveNote(s.incentiveNote || "");
                setOtherEarnings(Number(s.otherEarnings || 0));
                setPfDeduction(Number(s.pfDeduction || 0));
                setEsiDeduction(Number(s.esiDeduction || 0));
                setProfessionalTax(Number(s.professionalTax || 0));
                setTdsDeduction(Number(s.tdsDeduction || 0));
                setLopDeduction(Number(s.lopDeduction || 0));
                setOtherDeductions(Number(s.otherDeductions || 0));
                setStatus(s.status);
                setPaymentMethod(s.paymentMethod || "bank_transfer");
                setPaymentReference(s.paymentReference || "");
                setPaymentDate(
                    s.paymentDate
                        ? String(s.paymentDate).split("T")[0]
                        : new Date().toISOString().split("T")[0]
                );
                setRemarks(s.remarks || "");
            })
            .catch(() => {
                toast.error("Failed to load salary slip");
                navigate("/salaries");
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    if (loading || !salary) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    const payableDays = Math.max(0, totalWorkingDays - unpaidLeaves);
    const daysWorked = Math.max(0, payableDays - paidLeaves);
    const grossEarnings =
        Number(basicSalary || 0) +
        Number(hra || 0) +
        Number(da || 0) +
        Number(conveyanceAllowance || 0) +
        Number(medicalAllowance || 0) +
        Number(specialAllowance || 0) +
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
    const fmt = (v: any) => SalarySlipService.formatCurrency(v);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSubmitting(true);
        try {
            await SalaryService.updateSalary(id, {
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
                paymentMethod,
                paymentReference: paymentReference.trim() || null,
                paymentDate: status === "paid" ? paymentDate : null,
                remarks: remarks.trim() || null,
            });
            toast.success("Salary slip updated successfully");
            navigate(`/salaries/${id}`);
        } catch (err: any) {
            toast.error(
                err.response?.data?.message || "Failed to update salary slip"
            );
        } finally {
            setSubmitting(false);
        }
    };

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
                        <BreadcrumbLink asChild>
                            <Link
                                to={`/salaries/${salary.id}`}
                                className="font-mono"
                            >
                                #{salary.slipNumber}
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Edit</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div>
                <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
                    <Banknote className="w-6 h-6 text-primary" />
                    Edit Salary Slip — {salary.employee?.name} (
                    {MONTH_NAMES[(salary.month || 1) - 1]} {salary.year})
                </h1>
            </div>

            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
            >
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border border-border/60 shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold">
                                Working Days & Leaves
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Working Days</Label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    value={totalWorkingDays}
                                    onChange={(e) =>
                                        setTotalWorkingDays(
                                            Number(e.target.value)
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Paid Leaves</Label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    value={paidLeaves}
                                    onChange={(e) =>
                                        setPaidLeaves(Number(e.target.value))
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Unpaid / LOP</Label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    value={unpaidLeaves}
                                    onChange={(e) =>
                                        setUnpaidLeaves(Number(e.target.value))
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Days Worked</Label>
                                <Input
                                    type="number"
                                    value={daysWorked}
                                    disabled
                                    className="bg-muted"
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
                                    className="bg-primary/5 font-bold"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-border/60 shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold">
                                Earnings & Additional Incentive (₹)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Basic Salary
                                    </Label>
                                    <Input
                                        type="number"
                                        value={basicSalary}
                                        onChange={(e) =>
                                            setBasicSalary(
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">HRA</Label>
                                    <Input
                                        type="number"
                                        value={hra}
                                        onChange={(e) =>
                                            setHra(Number(e.target.value))
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">DA</Label>
                                    <Input
                                        type="number"
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
                                        value={specialAllowance}
                                        onChange={(e) =>
                                            setSpecialAllowance(
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-lg border-2 border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-emerald-700">
                                        Additional Incentive (₹)
                                    </Label>
                                    <Input
                                        type="number"
                                        value={additionalIncentive}
                                        onChange={(e) =>
                                            setAdditionalIncentive(
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <Label className="text-xs font-semibold">
                                        Incentive Note
                                    </Label>
                                    <Input
                                        value={incentiveNote}
                                        onChange={(e) =>
                                            setIncentiveNote(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-border/60 shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold text-rose-600">
                                Deductions (₹)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs">
                                    Provident Fund (EPF)
                                </Label>
                                <Input
                                    type="number"
                                    value={pfDeduction}
                                    onChange={(e) =>
                                        setPfDeduction(Number(e.target.value))
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">ESI</Label>
                                <Input
                                    type="number"
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
                                    value={tdsDeduction}
                                    onChange={(e) =>
                                        setTdsDeduction(Number(e.target.value))
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">
                                    Loss of Pay (LOP)
                                </Label>
                                <Input
                                    type="number"
                                    value={lopDeduction}
                                    onChange={(e) =>
                                        setLopDeduction(Number(e.target.value))
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">
                                    Other Deductions
                                </Label>
                                <Input
                                    type="number"
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
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <Card className="border-2 border-primary/30 shadow-sm">
                        <CardHeader className="pb-3 bg-primary/5 border-b">
                            <CardTitle className="text-base font-bold">
                                Updated Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span>Gross Earnings:</span>
                                    <span className="font-mono font-bold">
                                        {fmt(grossEarnings)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-rose-600">
                                    <span>Total Deductions:</span>
                                    <span className="font-mono font-bold">
                                        -{fmt(totalDeductions)}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t-2 border-primary pt-3 text-base font-extrabold text-primary">
                                    <span>Net Payable:</span>
                                    <span className="font-mono text-xl">
                                        {fmt(netSalary)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 pt-3 border-t">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Status
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
                                                Processed
                                            </SelectItem>
                                            <SelectItem value="paid">
                                                Paid
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
                                                Reference / UTR
                                            </Label>
                                            <Input
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
                                        Remarks
                                    </Label>
                                    <Textarea
                                        rows={2}
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
                                Save Changes
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}

