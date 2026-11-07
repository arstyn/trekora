import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SalarySlipService } from "@/services/salary-slip.service";
import { SalaryService } from "@/services/salary.service";
import type { IEmployeeSalaryStructure } from "@/types/salary.types";
import { Banknote, Building, Loader2, ShieldCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface SalaryStructureModalProps {
    employeeId: string;
    employeeName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (structure: IEmployeeSalaryStructure) => void;
}

export function SalaryStructureModal({
    employeeId,
    employeeName,
    open,
    onOpenChange,
    onSuccess,
}: SalaryStructureModalProps) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Earnings
    const [basicSalary, setBasicSalary] = useState<number>(0);
    const [hra, setHra] = useState<number>(0);
    const [da, setDa] = useState<number>(0);
    const [conveyanceAllowance, setConveyanceAllowance] = useState<number>(0);
    const [medicalAllowance, setMedicalAllowance] = useState<number>(0);
    const [specialAllowance, setSpecialAllowance] = useState<number>(0);

    // Deductions
    const [pfEmployee, setPfEmployee] = useState<number>(0);
    const [esi, setEsi] = useState<number>(0);
    const [professionalTax, setProfessionalTax] = useState<number>(0);
    const [tds, setTds] = useState<number>(0);

    // Bank & Statutory
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [ifscCode, setIfscCode] = useState("");
    const [panNumber, setPanNumber] = useState("");
    const [uanNumber, setUanNumber] = useState("");
    const [pfNumber, setPfNumber] = useState("");
    const [esiNumber, setEsiNumber] = useState("");

    useEffect(() => {
        if (open && employeeId) {
            setLoading(true);
            SalaryService.getStructure(employeeId)
                .then((s) => {
                    setBasicSalary(Number(s?.basicSalary || 0));
                    setHra(Number(s?.hra || 0));
                    setDa(Number(s?.da || 0));
                    setConveyanceAllowance(Number(s?.conveyanceAllowance || 0));
                    setMedicalAllowance(Number(s?.medicalAllowance || 0));
                    setSpecialAllowance(Number(s?.specialAllowance || 0));
                    setPfEmployee(Number(s?.pfEmployee || 0));
                    setEsi(Number(s?.esi || 0));
                    setProfessionalTax(Number(s?.professionalTax || 0));
                    setTds(Number(s?.tds || 0));
                    setBankName(s?.bankName || "");
                    setAccountNumber(s?.accountNumber || "");
                    setIfscCode(s?.ifscCode || "");
                    setPanNumber(s?.panNumber || "");
                    setUanNumber(s?.uanNumber || "");
                    setPfNumber(s?.pfNumber || "");
                    setEsiNumber(s?.esiNumber || "");
                })
                .catch(() => {})
                .finally(() => setLoading(false));
        }
    }, [open, employeeId]);

    const grossMonthly =
        Number(basicSalary || 0) +
        Number(hra || 0) +
        Number(da || 0) +
        Number(conveyanceAllowance || 0) +
        Number(medicalAllowance || 0) +
        Number(specialAllowance || 0);

    const totalBaseDeductions =
        Number(pfEmployee || 0) +
        Number(esi || 0) +
        Number(professionalTax || 0) +
        Number(tds || 0);

    const netBaseMonthly = Math.max(0, grossMonthly - totalBaseDeductions);

    const handleAutoFillIndianStandard = () => {
        if (!basicSalary || basicSalary <= 0) {
            toast.error(
                "Enter Basic Salary first to auto-calculate standard Indian HRA & EPF"
            );
            return;
        }
        setHra(Math.round(basicSalary * 0.4));
        setConveyanceAllowance(1600);
        setMedicalAllowance(1250);
        setPfEmployee(Math.min(1800, Math.round(basicSalary * 0.12)));
        setProfessionalTax(200);
        toast.success("Filled standard Indian HRA (40%), EPF (12%), and PT (₹200)");
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await SalaryService.upsertStructure(employeeId, {
                basicSalary,
                hra,
                da,
                conveyanceAllowance,
                medicalAllowance,
                specialAllowance,
                pfEmployee,
                esi,
                professionalTax,
                tds,
                bankName: bankName.trim() || undefined,
                accountNumber: accountNumber.trim() || undefined,
                ifscCode: ifscCode.trim().toUpperCase() || undefined,
                panNumber: panNumber.trim().toUpperCase() || undefined,
                uanNumber: uanNumber.trim() || undefined,
                pfNumber: pfNumber.trim() || undefined,
                esiNumber: esiNumber.trim() || undefined,
            });
            toast.success(`Salary structure saved for ${employeeName}`);
            onOpenChange(false);
            onSuccess?.(res);
        } catch (err: any) {
            toast.error(
                err.response?.data?.message ||
                    "Failed to save salary structure"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-primary" />
                        Indian Salary Structure — {employeeName}
                    </DialogTitle>
                    <DialogDescription>
                        Configure base monthly earnings, statutory deductions (EPF, ESI, PT, TDS), and bank/statutory identifiers.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-5">
                        {/* Earnings Section */}
                        <div className="space-y-3 p-4 rounded-lg border bg-muted/20">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase text-primary">
                                    1. Monthly Base Earnings (₹)
                                </h4>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAutoFillIndianStandard}
                                    className="h-7 text-xs cursor-pointer"
                                >
                                    Auto-Calculate HRA (40%) & EPF (12%)
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                                        HRA (House Rent Allowance)
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
                        </div>

                        {/* Deductions Section */}
                        <div className="space-y-3 p-4 rounded-lg border bg-muted/20">
                            <h4 className="text-xs font-bold uppercase text-rose-600 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                2. Monthly Statutory Deductions (₹)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Provident Fund (EPF)
                                    </Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={pfEmployee}
                                        onChange={(e) =>
                                            setPfEmployee(
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        ESI Deduction
                                    </Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={esi}
                                        onChange={(e) =>
                                            setEsi(Number(e.target.value))
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
                                        value={tds}
                                        onChange={(e) =>
                                            setTds(Number(e.target.value))
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bank & Statutory Details */}
                        <div className="space-y-3 p-4 rounded-lg border bg-muted/20">
                            <h4 className="text-xs font-bold uppercase text-foreground flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-primary" />
                                3. Bank & Indian Statutory Identifiers
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                                        placeholder="e.g., 5010029384712"
                                        value={accountNumber}
                                        onChange={(e) =>
                                            setAccountNumber(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">IFSC Code</Label>
                                    <Input
                                        placeholder="e.g., HDFC0001234"
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
                                        placeholder="e.g., ABCDE1234F"
                                        value={panNumber}
                                        onChange={(e) =>
                                            setPanNumber(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        UAN (EPF Number)
                                    </Label>
                                    <Input
                                        placeholder="12-digit UAN"
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
                                        placeholder="PF or ESI Code"
                                        value={pfNumber}
                                        onChange={(e) =>
                                            setPfNumber(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Live Base Summary */}
                        <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 flex flex-wrap items-center justify-between gap-4 text-xs">
                            <div>
                                <span className="text-muted-foreground">
                                    Gross Monthly Base:{" "}
                                </span>
                                <strong className="font-mono text-sm">
                                    {SalarySlipService.formatCurrency(
                                        grossMonthly
                                    )}
                                </strong>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Base Deductions:{" "}
                                </span>
                                <strong className="font-mono text-sm text-rose-600">
                                    {SalarySlipService.formatCurrency(
                                        totalBaseDeductions
                                    )}
                                </strong>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Net Monthly Take-Home:{" "}
                                </span>
                                <strong className="font-mono text-base text-emerald-600">
                                    {SalarySlipService.formatCurrency(
                                        netBaseMonthly
                                    )}
                                </strong>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={saving}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="cursor-pointer"
                            >
                                {saving && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                Save Salary Structure
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

