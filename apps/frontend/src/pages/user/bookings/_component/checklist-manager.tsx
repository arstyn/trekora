import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import BookingService from "@/services/booking.service";
import { Check, ListChecks, Plus, Trash, User as UserIcon } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { ICreateBookingFormData } from "./create-booking-dialog";
import axiosInstance from "@/lib/axios";
import type { IEmployee } from "@/types/employee.types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function ChecklistManager({
    customerIndex,
    formData,
    setFormData,
    createdBookingId,
}: {
    customerIndex: number;
    formData: ICreateBookingFormData;
    setFormData: React.Dispatch<React.SetStateAction<ICreateBookingFormData>>;
    createdBookingId?: string;
}) {
    const [newItem, setNewItem] = useState("");
    const [newItemNotes, setNewItemNotes] = useState("");
    const [newItemMandatory, setNewItemMandatory] = useState(false);
    const [newItemAssignedToId, setNewItemAssignedToId] =
        useState<string>("unassigned");
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editNotes, setEditNotes] = useState("");
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const customer = formData.customers[customerIndex];

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await axiosInstance.get<IEmployee[]>("/employee");
                setEmployees(res.data);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };
        fetchEmployees();
    }, []);

    const handleAddItem = () => {
        if (newItem.trim()) {
            const assignedTo =
                newItemAssignedToId === "unassigned"
                    ? undefined
                    : employees.find((e) => e.id === newItemAssignedToId);

            const newChecklistItem = {
                id: `temp-${Date.now()}`,
                item: newItem.trim(),
                completed: false,
                mandatory: newItemMandatory,
                assignedToId:
                    newItemAssignedToId === "unassigned"
                        ? undefined
                        : newItemAssignedToId,
                assignedTo: assignedTo
                    ? {
                          id: assignedTo.id,
                          name: assignedTo.name,
                          email: assignedTo.email,
                      }
                    : undefined,
                notes: newItemNotes.trim() || undefined,
            };

            setFormData((prev) => ({
                ...prev,
                customers: prev.customers.map((c, idx) =>
                    idx === customerIndex
                        ? {
                              ...c,
                              checklist: [...c.checklist, newChecklistItem],
                          }
                        : c,
                ),
            }));

            setNewItem("");
            setNewItemNotes("");
            setNewItemMandatory(false);
            setNewItemAssignedToId("unassigned");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAddItem();
        }
    };

    const toggleMandatory = (itemId: string) => {
        setFormData((prev) => ({
            ...prev,
            customers: prev.customers.map((c, idx) =>
                idx === customerIndex
                    ? {
                          ...c,
                          checklist: c.checklist.map((item) =>
                              item.id === itemId
                                  ? { ...item, mandatory: !item.mandatory }
                                  : item,
                          ),
                      }
                    : c,
            ),
        }));
    };

    const updateNotes = (itemId: string, notes: string) => {
        setFormData((prev) => ({
            ...prev,
            customers: prev.customers.map((c, idx) =>
                idx === customerIndex
                    ? {
                          ...c,
                          checklist: c.checklist.map((item) =>
                              item.id === itemId
                                  ? {
                                        ...item,
                                        notes: notes.trim() || undefined,
                                    }
                                  : item,
                          ),
                      }
                    : c,
            ),
        }));
        setEditingItemId(null);
        setEditNotes("");
    };

    const removeChecklistItem = async (
        customerIndex: number,
        itemId: string,
    ) => {
        if (createdBookingId && !itemId.startsWith("temp-")) {
            try {
                await BookingService.deleteChecklistItem(itemId);
                toast.success("Checklist item removed");
            } catch (error) {
                console.error("Error removing checklist item:", error);
                toast.error("Failed to remove checklist item");
                return;
            }
        }

        const newCustomers = [...formData.customers];
        newCustomers[customerIndex] = {
            ...newCustomers[customerIndex],
            checklist: newCustomers[customerIndex].checklist.filter(
                (item) => item.id !== itemId,
            ),
        };

        setFormData((prev) => ({ ...prev, customers: newCustomers }));
    };

    const toggleChecklistItem = async (
        customerIndex: number,
        itemId: string,
    ) => {
        if (createdBookingId && !itemId.startsWith("temp-")) {
            try {
                const updatedItem =
                    await BookingService.toggleChecklistItem(itemId);

                const newCustomers = [...formData.customers];
                newCustomers[customerIndex] = {
                    ...newCustomers[customerIndex],
                    checklist: newCustomers[customerIndex].checklist.map(
                        (item) =>
                            item.id === itemId
                                ? {
                                      ...item,
                                      completed: updatedItem.completed,
                                      updatedBy: updatedItem.updatedBy,
                                  }
                                : item,
                    ),
                };

                setFormData((prev) => ({ ...prev, customers: newCustomers }));
            } catch (error) {
                console.error("Error toggling checklist item:", error);
                toast.error("Failed to update checklist item");
            }
        } else {
            const newCustomers = [...formData.customers];
            newCustomers[customerIndex] = {
                ...newCustomers[customerIndex],
                checklist: newCustomers[customerIndex].checklist.map((item) =>
                    item.id === itemId
                        ? { ...item, completed: !item.completed }
                        : item,
                ),
            };

            setFormData((prev) => ({ ...prev, customers: newCustomers }));
        }
    };

    const completedCount = customer.checklist.filter(
        (item) => item.completed,
    ).length;
    const totalCount = customer.checklist.length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                    Individual Travel Checklist
                </Label>
                {totalCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                        {completedCount}/{totalCount} Complete
                    </Badge>
                )}
            </div>

            {/* Add new item */}
            <Card className="p-0">
                <CardContent className="p-4 space-y-3">
                    <Input
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Add checklist item (e.g., Passport, Visa, Insurance...)"
                        onKeyPress={handleKeyPress}
                    />
                    <Textarea
                        value={newItemNotes}
                        onChange={(e) => setNewItemNotes(e.target.value)}
                        placeholder="Add notes (optional)"
                        className="min-h-[60px] resize-none"
                        onKeyPress={handleKeyPress}
                    />
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id={`new-mandatory-${customerIndex}`}
                                    checked={newItemMandatory}
                                    onCheckedChange={(checked) =>
                                        setNewItemMandatory(checked as boolean)
                                    }
                                />
                                <Label
                                    htmlFor={`new-mandatory-${customerIndex}`}
                                    className="text-sm font-normal cursor-pointer text-muted-foreground"
                                >
                                    Mandatory
                                </Label>
                            </div>
                            <div className="w-48">
                                <Select
                                    value={newItemAssignedToId}
                                    onValueChange={setNewItemAssignedToId}
                                >
                                    <SelectTrigger className="h-8 text-[11px]">
                                        <SelectValue placeholder="Assign To" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned text-muted-foreground">
                                            Unassigned
                                        </SelectItem>
                                        {employees.map((emp) => (
                                            <SelectItem
                                                key={emp.id}
                                                value={emp.id}
                                            >
                                                {emp.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button
                            type="button"
                            onClick={handleAddItem}
                            size="sm"
                            disabled={!newItem.trim()}
                            className="h-8"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Checklist items */}
            {customer.checklist.length > 0 ? (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {customer.checklist.map((item: any) => (
                        <Card
                            key={item.id}
                            className={`transition-all p-0 ${
                                item.completed
                                    ? "bg-muted/30 border-muted"
                                    : "hover:border-primary/30"
                            }`}
                        >
                            <CardContent className="p-3 space-y-2">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id={`checklist-${customerIndex}-${item.id}`}
                                        checked={item.completed}
                                        onCheckedChange={() =>
                                            toggleChecklistItem(
                                                customerIndex,
                                                item.id,
                                            )
                                        }
                                        className="mt-0.5"
                                    />
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <label
                                            htmlFor={`checklist-${customerIndex}-${item.id}`}
                                            className={`text-sm font-medium cursor-pointer block ${
                                                item.completed
                                                    ? "line-through text-muted-foreground"
                                                    : "text-foreground"
                                            }`}
                                        >
                                            {item.item}
                                        </label>
                                        {item.notes &&
                                            editingItemId !== item.id && (
                                                <p className="text-xs text-muted-foreground">
                                                    {item.notes}
                                                </p>
                                            )}
                                        {editingItemId === item.id && (
                                            <div className="space-y-2 pt-1">
                                                <Textarea
                                                    value={editNotes}
                                                    onChange={(e) =>
                                                        setEditNotes(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Add notes..."
                                                    className="min-h-[60px] text-xs"
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() =>
                                                            updateNotes(
                                                                item.id,
                                                                editNotes,
                                                            )
                                                        }
                                                    >
                                                        <Check className="w-3 h-3 mr-1" />
                                                        Save
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingItemId(
                                                                null,
                                                            );
                                                            setEditNotes("");
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 flex-wrap pt-1">
                                            {item.mandatory && (
                                                <Badge
                                                    variant="destructive"
                                                    className="text-[10px] h-4"
                                                >
                                                    Required
                                                </Badge>
                                            )}
                                            {item.assignedTo && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] h-4 flex items-center gap-1 font-normal"
                                                >
                                                    <UserIcon className="h-2.5 w-2.5" />
                                                    {item.assignedTo.name}
                                                </Badge>
                                            )}
                                            {item.updatedBy && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-[9px] h-4 cursor-help font-normal"
                                                            >
                                                                Updated by{" "}
                                                                {
                                                                    item
                                                                        .updatedBy
                                                                        .name
                                                                }
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="text-[10px]">
                                                                Last update by{" "}
                                                                {
                                                                    item
                                                                        .updatedBy
                                                                        .name
                                                                }
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    toggleMandatory(item.id)
                                                }
                                                className="h-5 px-1.5 text-[10px] font-normal"
                                            >
                                                {item.mandatory
                                                    ? "Make Optional"
                                                    : "Make Required"}
                                            </Button>
                                            {editingItemId !== item.id && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingItemId(
                                                            item.id,
                                                        );
                                                        setEditNotes(
                                                            item.notes || "",
                                                        );
                                                    }}
                                                    className="h-5 px-1.5 text-[10px] font-normal"
                                                >
                                                    {item.notes
                                                        ? "Edit Note"
                                                        : "Add Note"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            removeChecklistItem(
                                                customerIndex,
                                                item.id,
                                            )
                                        }
                                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-6 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="rounded-full bg-muted p-3">
                                <ListChecks className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">
                                No checklist items yet
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Add items to track personal travel preparations
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
