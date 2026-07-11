import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import BookingService from "@/services/booking.service";
import type { IBatches } from "@/types/batches.types";
import { useState } from "react";
import { toast } from "sonner";

interface BatchReportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    batch: IBatches;
}

export function BatchReportModal({
    open,
    onOpenChange,
    batch,
}: BatchReportModalProps) {
    const [downloadOptions, setDownloadOptions] = useState({
        includeOverview: true,
        includeCoordinators: true,
        includeFinancials: true,
        includeActiveBookings: true,
        includeCancelledBookings: true,
        includeTravelers: true,
        includeWorkflow: true,
        includeBookingPayments: true,
    });

    if (!batch) return null;

    const activeBookings = batch.bookings?.filter((b) => b.status !== "cancelled") || [];
    const cancelledBookings = batch.bookings?.filter((b) => b.status === "cancelled") || [];

    const totalBatchExpected = activeBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const totalBatchPaid = activeBookings.reduce((sum, b) => sum + (Number(b.advancePaid) || 0), 0);
    const totalBatchRemaining = activeBookings.reduce((sum, b) => sum + (Number(b.balanceAmount) || 0), 0);

    const toggleOption = (key: keyof typeof downloadOptions) => {
        setDownloadOptions((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            if (key === "includeActiveBookings" || key === "includeCancelledBookings") {
                const anyBookingsEnabled = next.includeActiveBookings || next.includeCancelledBookings;
                if (!anyBookingsEnabled) {
                    next.includeTravelers = false;
                    next.includeBookingPayments = false;
                }
                if (!next.includeActiveBookings) {
                    next.includeWorkflow = false;
                }
            }
            return next;
        });
    };

    const handleGenerateReport = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Popup blocked. Please allow popups for this site.");
            return;
        }

        let htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Batch Report - ${batch.package?.name || "Details"}</title>
            <style>
                body {
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    line-height: 1.5;
                    color: #1f2937;
                    padding: 20px;
                    margin: 0;
                }
                h1, h2, h3, h4 {
                    margin-top: 0;
                    color: #111827;
                }
                h1 {
                    border-bottom: 2px solid #2563eb;
                    padding-bottom: 10px;
                    font-size: 24px;
                }
                h2 {
                    font-size: 16px;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 6px;
                    margin-top: 24px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #374151;
                }
                .grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                    margin-bottom: 20px;
                }
                .financial-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    background-color: #f9fafb;
                    padding: 16px;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                    margin-bottom: 20px;
                }
                .card {
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 16px;
                    background-color: #ffffff;
                }
                .label {
                    font-size: 11px;
                    color: #6b7280;
                    text-transform: uppercase;
                    font-weight: 600;
                }
                .value {
                    font-weight: 500;
                    font-size: 13px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #e5e7eb;
                    padding: 10px;
                    font-size: 12px;
                    text-align: left;
                }
                th {
                    background-color: #f3f4f6;
                    font-weight: 600;
                }
                .badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 9999px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .badge-success { background-color: #d1fae5; color: #065f46; }
                .badge-warning { background-color: #fef3c7; color: #92400e; }
                .badge-danger { background-color: #fee2e2; color: #991b1b; }
                .badge-info { background-color: #dbeafe; color: #1e40af; }
                
                .traveler-chip {
                    display: inline-block;
                    background-color: #f3f4f6;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    padding: 2px 6px;
                    margin-right: 4px;
                    margin-bottom: 4px;
                    font-size: 10px;
                }
                .workflow-chip {
                    display: inline-block;
                    border-radius: 4px;
                    padding: 2px 6px;
                    margin-right: 4px;
                    margin-bottom: 4px;
                    font-size: 10px;
                    font-weight: 500;
                }
                @media print {
                    body {
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            <h1>Batch Report: ${batch.package?.name || "Batch Details"}</h1>
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 20px;">
                Generated on: ${new Date().toLocaleString()} | Trip Dates: ${new Date(batch.startDate).toLocaleDateString()} - ${new Date(batch.endDate).toLocaleDateString()}
            </div>
        `;

        if (downloadOptions.includeOverview) {
            htmlContent += `
            <h2>1. Batch & Package Overview</h2>
            <div class="grid">
                <div>
                    <div class="label">Start Date</div>
                    <div class="value">${new Date(batch.startDate).toLocaleDateString()}</div>
                </div>
                <div>
                    <div class="label">End Date</div>
                    <div class="value">${new Date(batch.endDate).toLocaleDateString()}</div>
                </div>
                <div>
                    <div class="label">Capacity & Load</div>
                    <div class="value">${batch.bookedSeats} / ${batch.totalSeats} seats booked</div>
                </div>
                <div>
                    <div class="label">Batch Status</div>
                    <div class="value" style="text-transform: uppercase;">${batch.status}</div>
                </div>
            </div>
            <div class="card">
                <div class="label">Package Description</div>
                <div class="value" style="margin-top: 4px;">${batch.package?.description || "No description available"}</div>
                
                <div class="label" style="margin-top: 12px;">Destinations</div>
                <div class="value" style="margin-top: 4px;">${batch.package?.destination || "N/A"}</div>
            </div>
            `;
        }

        if (downloadOptions.includeCoordinators && batch.coordinators && batch.coordinators.length > 0) {
            htmlContent += `
            <h2>2. Batch Coordinators</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Specialization</th>
                        <th>Phone</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    ${batch.coordinators.map(c => `
                        <tr>
                            <td><strong>${c.name || "N/A"}</strong></td>
                            <td>${c.specialization || "N/A"}</td>
                            <td>${c.phone || "N/A"}</td>
                            <td>${c.email || "N/A"}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
            `;
        }

        if (downloadOptions.includeFinancials) {
            const progress = totalBatchExpected > 0 ? Math.round((totalBatchPaid / totalBatchExpected) * 100) : 0;
            htmlContent += `
            <h2>3. Batch Financial Summary</h2>
            <div class="financial-grid">
                <div>
                    <div class="label">Total Expected Revenue</div>
                    <div class="value" style="font-size: 16px; font-weight: bold; margin-top: 4px;">
                        ${BookingService.formatCurrency(totalBatchExpected)}
                    </div>
                </div>
                <div>
                    <div class="label">Total Collected</div>
                    <div class="value" style="font-size: 16px; font-weight: bold; color: #059669; margin-top: 4px;">
                        ${BookingService.formatCurrency(totalBatchPaid)}
                    </div>
                </div>
                <div>
                    <div class="label">Total Pending</div>
                    <div class="value" style="font-size: 16px; font-weight: bold; color: #dc2626; margin-top: 4px;">
                        ${BookingService.formatCurrency(totalBatchRemaining)}
                    </div>
                </div>
            </div>
            <div style="margin-bottom: 20px;">
                <div class="label" style="margin-bottom: 4px;">Collection Progress (${progress}%)</div>
                <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 9999px; overflow: hidden;">
                    <div style="width: ${progress}%; height: 100%; background-color: #10b981;"></div>
                </div>
            </div>
            `;
        }

        if (downloadOptions.includeActiveBookings && activeBookings.length > 0) {
            htmlContent += `
            <h2>4. Active Bookings</h2>
            <table>
                <thead>
                    <tr>
                        <th>Booking #</th>
                        <th>Primary Customer</th>
                        <th>Status</th>
                        ${downloadOptions.includeTravelers ? `<th>Travelers</th>` : ""}
                        ${downloadOptions.includeWorkflow ? `<th>Workflow Status</th>` : ""}
                        ${downloadOptions.includeBookingPayments ? `<th>Payments</th>` : ""}
                    </tr>
                </thead>
                <tbody>
                    ${activeBookings.map(b => {
                const statusClass = b.status === "confirmed" ? "badge-success" : b.status === "pending" ? "badge-warning" : "badge-info";
                const travelersList = (b.customers || []).filter(c => c.id !== b.primaryCustomer?.id);
                return `
                        <tr>
                            <td><strong>#${b.bookingNumber}</strong></td>
                            <td>
                                <strong>${b.primaryCustomer?.firstName} ${b.primaryCustomer?.lastName || ""}</strong><br>
                                <span style="font-size: 10px; color: #6b7280;">${b.primaryCustomer?.email || ""}<br>${b.primaryCustomer?.phone || ""}</span>
                            </td>
                            <td>
                                <span class="badge ${statusClass}">${b.status}</span>
                            </td>
                            ${downloadOptions.includeTravelers ? `
                            <td>
                                ${travelersList.map(c => `
                                    <span class="traveler-chip">${c.firstName} ${c.lastName?.[0] || ""}</span>
                                `).join("")}
                                ${travelersList.length === 0 ? `<span style="color: #9ca3af; font-style: italic; font-size: 10px;">None</span>` : ""}
                            </td>
                            ` : ""}
                            ${downloadOptions.includeWorkflow ? `
                            <td>
                                ${(b.currentWorkflow?.steps || []).map(s => `
                                    <span class="workflow-chip" style="background-color: ${s.status === 'completed' ? '#d1fae5; color: #065f46;' : '#f3f4f6; color: #4b5563;'}">
                                        ${s.label}
                                    </span>
                                `).join("")}
                                ${(!b.currentWorkflow?.steps || b.currentWorkflow.steps.length === 0) ? `<span style="color: #9ca3af; font-style: italic; font-size: 10px;">No workflow</span>` : ""}
                            </td>
                            ` : ""}
                            ${downloadOptions.includeBookingPayments ? `
                            <td>
                                <span style="font-size: 10px; color: #4b5563;">
                                    Total: <strong>${BookingService.formatCurrency(b.totalAmount)}</strong><br>
                                    Paid: <strong style="color: #059669;">${BookingService.formatCurrency(b.advancePaid)}</strong><br>
                                    Remaining: <strong style="color: ${b.balanceAmount > 0 ? '#dc2626' : '#059669'}">${BookingService.formatCurrency(b.balanceAmount)}</strong>
                                </span>
                            </td>
                            ` : ""}
                        </tr>
                        `;
            }).join("")}
                </tbody>
            </table>
            `;
        }

        if (downloadOptions.includeCancelledBookings && cancelledBookings.length > 0) {
            htmlContent += `
            <h2>5. Cancelled Bookings</h2>
            <table>
                <thead>
                    <tr>
                        <th>Booking #</th>
                        <th>Primary Customer</th>
                        <th>Status</th>
                        ${downloadOptions.includeTravelers ? `<th>Travelers</th>` : ""}
                        ${downloadOptions.includeBookingPayments ? `<th>Payments</th>` : ""}
                    </tr>
                </thead>
                <tbody>
                    ${cancelledBookings.map(b => {
                const travelersList = (b.customers || []).filter(c => c.id !== b.primaryCustomer?.id);
                return `
                        <tr>
                            <td><strong style="text-decoration: line-through; color: #9ca3af;">#${b.bookingNumber}</strong></td>
                            <td>
                                <strong style="text-decoration: line-through; color: #9ca3af;">${b.primaryCustomer?.firstName} ${b.primaryCustomer?.lastName || ""}</strong><br>
                                <span style="font-size: 10px; color: #9ca3af;">${b.primaryCustomer?.email || ""}<br>${b.primaryCustomer?.phone || ""}</span>
                            </td>
                            <td>
                                <span class="badge badge-danger">${b.status}</span>
                            </td>
                            ${downloadOptions.includeTravelers ? `
                            <td>
                                ${travelersList.map(c => `
                                    <span class="traveler-chip" style="text-decoration: line-through; color: #9ca3af;">${c.firstName} ${c.lastName?.[0] || ""}</span>
                                `).join("")}
                                ${travelersList.length === 0 ? `<span style="color: #9ca3af; font-style: italic; font-size: 10px;">None</span>` : ""}
                            </td>
                            ` : ""}
                            ${downloadOptions.includeBookingPayments ? `
                            <td>
                                <span style="font-size: 10px; color: #9ca3af;">
                                    Total: <strong>${BookingService.formatCurrency(b.totalAmount)}</strong><br>
                                    Paid: <strong>${BookingService.formatCurrency(b.advancePaid)}</strong><br>
                                    Remaining: <strong>${BookingService.formatCurrency(b.balanceAmount)}</strong>
                                </span>
                            </td>
                            ` : ""}
                        </tr>
                        `;
            }).join("")}
                </tbody>
            </table>
            `;
        }

        htmlContent += `
            <div style="margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 10px; color: #9ca3af; text-align: center;">
                Generated from Trekora Booking Platform. Confidential document for internal use only.
            </div>
        </body>
        </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();

        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                onOpenChange(false);
            }, 500);
        };
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Generate Batch PDF Report</DialogTitle>
                    <DialogDescription>
                        Configure the sections you want to include in the printable PDF report.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-3">
                        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">General Information</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="includeOverview"
                                    checked={downloadOptions.includeOverview}
                                    onCheckedChange={() => toggleOption('includeOverview')}
                                />
                                <Label htmlFor="includeOverview" className="cursor-pointer text-sm font-medium">
                                    Batch Overview & Package Details
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="includeCoordinators"
                                    checked={downloadOptions.includeCoordinators}
                                    onCheckedChange={() => toggleOption('includeCoordinators')}
                                />
                                <Label htmlFor="includeCoordinators" className="cursor-pointer text-sm font-medium">
                                    Coordinators List
                                </Label>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Financials</h4>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="includeFinancials"
                                checked={downloadOptions.includeFinancials}
                                onCheckedChange={() => toggleOption('includeFinancials')}
                            />
                            <Label htmlFor="includeFinancials" className="cursor-pointer text-sm font-medium">
                                Batch Financial Summary
                            </Label>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Bookings & Details</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="includeActiveBookings"
                                    checked={downloadOptions.includeActiveBookings}
                                    onCheckedChange={() => toggleOption('includeActiveBookings')}
                                />
                                <Label htmlFor="includeActiveBookings" className="cursor-pointer text-sm font-medium">
                                    Active Bookings
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="includeCancelledBookings"
                                    checked={downloadOptions.includeCancelledBookings}
                                    onCheckedChange={() => toggleOption('includeCancelledBookings')}
                                />
                                <Label htmlFor="includeCancelledBookings" className="cursor-pointer text-sm font-medium">
                                    Cancelled Bookings
                                </Label>
                            </div>
                            <div className="flex items-center gap-2 pl-6">
                                <Checkbox
                                    id="includeTravelers"
                                    checked={downloadOptions.includeTravelers}
                                    disabled={!downloadOptions.includeActiveBookings && !downloadOptions.includeCancelledBookings}
                                    onCheckedChange={() => toggleOption('includeTravelers')}
                                />
                                <Label htmlFor="includeTravelers" className="cursor-pointer text-sm font-medium opacity-80">
                                    Include Traveler Names
                                </Label>
                            </div>
                            <div className="flex items-center gap-2 pl-6">
                                <Checkbox
                                    id="includeWorkflow"
                                    checked={downloadOptions.includeWorkflow}
                                    disabled={!downloadOptions.includeActiveBookings}
                                    onCheckedChange={() => toggleOption('includeWorkflow')}
                                />
                                <Label htmlFor="includeWorkflow" className="cursor-pointer text-sm font-medium opacity-80">
                                    Include Workflow Status
                                </Label>
                            </div>
                            <div className="flex items-center gap-2 pl-6">
                                <Checkbox
                                    id="includeBookingPayments"
                                    checked={downloadOptions.includeBookingPayments}
                                    disabled={!downloadOptions.includeActiveBookings && !downloadOptions.includeCancelledBookings}
                                    onCheckedChange={() => toggleOption('includeBookingPayments')}
                                />
                                <Label htmlFor="includeBookingPayments" className="cursor-pointer text-sm font-medium opacity-80">
                                    Include Booking Payments
                                </Label>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleGenerateReport}>
                        Generate & Print PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
