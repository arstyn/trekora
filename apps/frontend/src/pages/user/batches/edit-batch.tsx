import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/lib/axios";
import type { IEmployee } from "@/types/employee.types";
import type { IPackages } from "@/types/package.schema";
import { Save, X } from "lucide-react";
import type React from "react";
import { useLayoutEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function EditBatchPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [packages, setPackages] = useState<IPackages[]>([]);
    const [employees, setEmployees] = useState<IEmployee[]>([]);

    const [formData, setFormData] = useState({
        packageId: "",
        startDate: "",
        endDate: "",
        totalSeats: "",
        coordinators: [] as IEmployee[],
    });
    const toggleCoordinator = (employee: IEmployee) => {
        setFormData((prev) => {
            const alreadySelected = prev.coordinators.some(
                (c) => c.id === employee.id,
            );
            return {
                ...prev,
                coordinators: alreadySelected
                    ? prev.coordinators.filter((c) => c.id !== employee.id)
                    : [...prev.coordinators, employee],
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                coordinators: formData.coordinators.map((c) => c.id),
            };
            await axiosInstance.patch(`/batches/${id}`, payload);
            toast.success("Batch updated successfully", {
                action: (
                    <Button
                        onClick={() => {
                            navigate(`/batches/${id}`);
                        }}
                    >
                        View Batch
                    </Button>
                ),
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to load batches");
            }
        }
    };

    const removeCoordinator = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            coordinators: prev.coordinators.filter((_, i) => i !== index),
        }));
    };

    useLayoutEffect(() => {
        const getData = async () => {
            try {
                const [batchRes, packagesRes, employeesRes] = await Promise.all(
                    [
                        axiosInstance.get(`/batches/${id}`),
                        axiosInstance.get(`/packages?status=published`),
                        axiosInstance.get(`/employee`),
                    ],
                );

                setFormData(batchRes.data);
                setPackages(packagesRes.data);
                setEmployees(employeesRes.data);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    toast.error(error.message);
                } else {
                    toast.error("Failed to load data");
                }
            }
        };

        getData();
    }, [id]);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Edit Batch</h1>
                    <p className="text-muted-foreground">
                        Update batch information and coordinators
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="package">Tour Package</Label>
                            <Select
                                value={formData.packageId}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        packageId: value,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a package" />
                                </SelectTrigger>
                                <SelectContent>
                                    {packages &&
                                        packages.length > 0 &&
                                        packages.map((pkg) => (
                                            <SelectItem value={pkg.id}>
                                                {pkg.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            startDate: e.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            endDate: e.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="totalSeats">Total Seats</Label>
                            <Input
                                id="totalSeats"
                                type="number"
                                min="1"
                                value={formData.totalSeats}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        totalSeats: e.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Coordinators */}
                <Card>
                    <CardHeader>
                        <CardTitle>Batch Coordinators</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Existing Coordinators */}
                        {formData.coordinators.length > 0 && (
                            <div className="space-y-2">
                                <Label>Current Coordinators</Label>
                                {formData.coordinators.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.coordinators.map(
                                            (coordinator, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 border rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <p className="font-medium">
                                                                {
                                                                    coordinator.name
                                                                }
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    coordinator.phone
                                                                }{" "}
                                                                •{" "}
                                                                {
                                                                    coordinator.email
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeCoordinator(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Add New Coordinator */}
                        <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                            <Label>Add New Coordinator</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between"
                                    >
                                        {formData.coordinators.length > 0
                                            ? `${formData.coordinators.length} selected`
                                            : "Select coordinators"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full max-h-60 overflow-y-auto">
                                    <div className="space-y-2 w-full">
                                        {employees.map((emp) => (
                                            <div
                                                key={emp.id}
                                                className="flex items-center space-x-2 cursor-pointer"
                                                onClick={() =>
                                                    toggleCoordinator(emp)
                                                }
                                            >
                                                <Checkbox
                                                    checked={formData.coordinators.some(
                                                        (c) => c.id === emp.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleCoordinator(emp)
                                                    }
                                                />
                                                <span>{emp.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <NavLink to={`/batches/${id}`}>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </NavLink>
                    <Button type="submit">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
