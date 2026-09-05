import type { IBooking } from "@/types/booking.types";

export interface InvoiceData {
    booking: IBooking;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate?: string;
    organizationName?: string;
    organizationDomain?: string;
    invoiceColor?: string;
    invoiceSeal?: string | null;
    invoiceFields?: {
        showLogo: boolean;
        showSeal: boolean;
        showBillingTo: boolean;
        showTripDetails: boolean;
        showPaymentHistory: boolean;
        showBalanceDue: boolean;
        showFooter: boolean;
        customTerms?: string;
        layoutOrder?: string[];
        sealAlign?: "left" | "center" | "right";
        sealOffset?: number;
    } | null;
}

export class InvoiceService {
    // Generate invoice number based on booking
    static generateInvoiceNumber(booking: IBooking): string {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        return `INV-${year}${month}-${booking.bookingNumber}`;
    }

    // Check if booking has completed payments
    static hasCompletedPayments(booking: IBooking): boolean {
        return (
            booking.payments?.some(
                (payment) => payment.status === "completed"
            ) ?? false
        );
    }

    // Get completed payments only
    static getCompletedPayments(booking: IBooking) {
        return (
            booking.payments?.filter(
                (payment) => payment.status === "completed"
            ) ?? []
        );
    }

    // Calculate total paid amount from completed payments (accounting for refunds)
    static getTotalPaidAmount(booking: IBooking): number {
        return this.getCompletedPayments(booking).reduce(
            (total, payment) =>
                payment.paymentType === "refund"
                    ? total - Number(payment.amount)
                    : total + Number(payment.amount),
            0
        );
    }

    // Generate HTML content for invoice
    static generateInvoiceHTML(invoiceData: InvoiceData): string {
        const { booking } = invoiceData;
        const completedPayments = this.getCompletedPayments(booking);
        const totalPaid = this.getTotalPaidAmount(booking);
        
        // Customizations
        const color = invoiceData.invoiceColor || "#2563eb";
        const fields = invoiceData.invoiceFields || {
            showLogo: true,
            showSeal: true,
            showBillingTo: true,
            showTripDetails: true,
            showPaymentHistory: true,
            showBalanceDue: true,
            showFooter: true,
            customTerms: ""
        };

        // Customer details for Bill To
        const primaryCustomer = (booking.primaryCustomer || booking.customers?.[0]) as any;
        const customerName = primaryCustomer ? `${primaryCustomer.firstName} ${primaryCustomer.lastName || ""}`.trim() : "N/A";
        const customerEmail = primaryCustomer?.email || "N/A";
        const customerPhone = primaryCustomer?.phone || "N/A";
        
        let customerAddress = "N/A";
        if (primaryCustomer && primaryCustomer.address) {
            const parts = [
                primaryCustomer.address,
                primaryCustomer.district,
                primaryCustomer.state,
                primaryCustomer.country
            ].filter(Boolean);
            customerAddress = parts.join(", ");
            if (primaryCustomer.pinCode) {
                customerAddress += ` - ${primaryCustomer.pinCode}`;
            }
        }

        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${customerName} - ${booking.package?.name || "Trip"} - Invoice ${invoiceData.invoiceNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
          }
          
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 3px solid ${color};
            padding-bottom: 20px;
          }
          
          .company-info h1 {
            color: ${color};
            font-size: 28px;
            margin-bottom: 5px;
          }
          
          .company-info p {
            color: #666;
            font-size: 14px;
          }
          
          .invoice-details {
            text-align: right;
          }
          
          .invoice-details h2 {
            color: ${color};
            font-size: 24px;
            margin-bottom: 10px;
          }
          
          .invoice-details p {
            margin-bottom: 5px;
            font-size: 14px;
          }
          
          .billing-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
          }
          
          .billing-section h3 {
            color: ${color};
            margin-bottom: 15px;
            font-size: 16px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          
          .billing-section p {
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .invoice-table th {
            background-color: ${color};
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          
          .invoice-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .invoice-table tr:nth-child(even) {
            background-color: #f9fafb;
          }
          
          .amount {
            text-align: right;
            font-weight: 600;
          }
          
          .totals-section {
            margin-left: auto;
            width: 300px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            background-color: #f9fafb;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
          }
          
          .total-row.final {
            border-top: 2px solid ${color};
            padding-top: 15px;
            margin-top: 15px;
            font-weight: bold;
            font-size: 16px;
            color: ${color};
          }
          
          .payment-history {
            margin-top: 40px;
          }
          
          .payment-history h3 {
            color: ${color};
            margin-bottom: 20px;
            font-size: 18px;
          }
          
          .payment-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          .payment-table th {
            background-color: #f3f4f6;
            padding: 10px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .payment-table td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .status-completed {
            background-color: #d1fae5;
            color: #065f46;
          }
          
          @media print {
            .invoice-container {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Invoice Header -->
          <div class="invoice-header">
            <div class="company-info">
              ${fields.showLogo !== false ? `
              <h1>${invoiceData.organizationName || "Travel Agency"}</h1>
              ${invoiceData.organizationDomain ? `<p>${invoiceData.organizationDomain}</p>` : `<p>Travel Management Partner</p>`}
              ` : ""}
            </div>
            <div class="invoice-details">
              <h2>INVOICE</h2>
              <p><strong>Invoice #:</strong> ${invoiceData.invoiceNumber}</p>
              <p><strong>Date:</strong> ${new Date(
                  invoiceData.invoiceDate
              ).toLocaleDateString()}</p>
              <p><strong>Booking #:</strong> ${booking.bookingNumber}</p>
            </div>
          </div>

          ${(() => {
              const defaultOrder = ["billing", "tripDetails", "itemsTable", "totals", "payments", "terms"];
              const order = fields.layoutOrder || defaultOrder;
              let renderedSectionsHtml = "";

              for (let i = 0; i < order.length; i++) {
                  const section = order[i];

                  if (section === "billing" && fields.showBillingTo !== false) {
                      renderedSectionsHtml += `
                      <div class="billing-section" style="margin-bottom: 30px;">
                        <h3>Bill To:</h3>
                        <p><strong>Name:</strong> ${customerName}</p>
                        <p><strong>Email:</strong> ${customerEmail}</p>
                        <p><strong>Phone:</strong> ${customerPhone}</p>
                        <p><strong>Address:</strong> ${customerAddress}</p>
                      </div>
                      `;
                  } else if (section === "tripDetails" && fields.showTripDetails !== false) {
                      renderedSectionsHtml += `
                      <div class="billing-section" style="margin-bottom: 30px;">
                        <h3>Trip Details:</h3>
                        <p><strong>Package:</strong> ${booking.package.name}</p>
                        ${
                            booking.package.destination
                                ? `<p><strong>Destination:</strong> ${booking.package.destination}</p>`
                                : ""
                        }
                        <p><strong>Travel Dates:</strong> ${new Date(
                            booking.batch.startDate
                        ).toLocaleDateString()} - ${new Date(
                          booking.batch.endDate
                      ).toLocaleDateString()}</p>
                        <p><strong>Passengers:</strong> ${booking.customers.length}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-completed">${
                            booking.status
                        }</span></p>
                      </div>
                      `;
                  } else if (section === "itemsTable") {
                      renderedSectionsHtml += `
                      <!-- Service Details Table -->
                      <table class="invoice-table">
                        <thead>
                          <tr>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <strong>${booking.package.name}</strong><br>
                              <small>${
                                  booking.package.description || "Travel package"
                              }</small>
                            </td>
                            <td>${booking.customers.length}</td>
                             <td class="amount">₹${(booking.totalAmount / (booking.customers.length || 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                             <td class="amount">₹${booking.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        </tbody>
                      </table>
                      `;
                  } else if (section === "seal" && fields.showSeal !== false && invoiceData.invoiceSeal) {
                      const align = fields.sealAlign || "right";
                      const offset = fields.sealOffset || 0;
                      const justify = 
                          align === "left" ? "flex-start" :
                          align === "center" ? "center" :
                          "flex-end";
                      const textAlign = align;
                      const marginStyle = 
                          align === "center" ? "0 auto" :
                          align === "right" ? "0 0 0 auto" :
                          "0 auto 0 0";

                      renderedSectionsHtml += `
                      <!-- Official Seal stamp -->
                      <div style="display: flex; justify-content: ${justify}; margin-top: ${offset}px; margin-bottom: 20px;">
                        <div style="text-align: ${textAlign}; width: 300px;">
                          <img src="${invoiceData.invoiceSeal}" alt="Authorized Seal" style="max-height: 60px; width: auto; mix-blend-multiply: multiply; display: block; margin: ${marginStyle};" />
                          <p style="font-size: 8px; color: #999; margin-top: 2px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Authorized Stamp</p>
                        </div>
                      </div>
                      `;
                  } else if (section === "totals") {
                      renderedSectionsHtml += `
                      <!-- Totals Section -->
                      <div class="totals-section" style="margin-bottom: 30px;">
                        <div class="total-row">
                          <span>Subtotal:</span>
                          <span>₹${booking.totalAmount.toLocaleString()}</span>
                        </div>
                        <div class="total-row">
                          <span>Tax:</span>
                          <span>₹0.00</span>
                        </div>
                        <div class="total-row final">
                          <span>Total:</span>
                          <span>₹${booking.totalAmount.toLocaleString()}</span>
                        </div>
                        <div class="total-row">
                          <span>Amount Paid:</span>
                          <span style="color: #059669;">₹${totalPaid.toLocaleString()}</span>
                        </div>
                        ${fields.showBalanceDue !== false ? `
                        <div class="total-row" style="border-top: 1px solid #e5e7eb; padding-top: 5px; font-weight: bold; margin-top: 5px;">
                          <span>Outstanding Balance:</span>
                          <span style="color: ${
                              booking.balanceAmount > 0 ? "#dc2626" : "#059669"
                          };">₹${booking.balanceAmount.toLocaleString()}</span>
                        </div>
                        ` : ""}
                      </div>
                      `;
                  } else if (section === "payments" && fields.showPaymentHistory !== false && completedPayments.length > 0) {
                      renderedSectionsHtml += `
                      <!-- Payment History -->
                      <div class="payment-history" style="margin-bottom: 30px;">
                        <h3>Payment History</h3>
                        <table class="payment-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Method</th>
                              <th>Reference</th>
                              <th>Amount</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${completedPayments
                                .map(
                                    (payment) => `
                            <tr>
                              <td>${
                                  payment.paymentDate
                                      ? new Date(payment.paymentDate).toLocaleDateString()
                                      : "N/A"
                              }</td>
                              <td>${payment.paymentMethod
                                  .replace("_", " ")
                                  .toUpperCase()}</td>
                              <td>${payment.paymentReference || "N/A"}</td>
                              <td class="amount">₹${payment.amount.toLocaleString()}</td>
                              <td><span class="status-badge status-completed">${
                                  payment.status
                              }</span></td>
                            </tr>
                            `
                                )
                                .join("")}
                          </tbody>
                        </table>
                      </div>
                      `;
                  } else if (section === "terms" && fields.showFooter !== false && fields.customTerms) {
                      renderedSectionsHtml += `
                      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; font-size: 11px; text-align: left; margin-bottom: 20px; color: #555; white-space: pre-line;">
                        <strong>Terms & Conditions / Payment Info:</strong><br>
                        ${fields.customTerms}
                      </div>
                      `;
                  }
              }

              return renderedSectionsHtml;
          })()}

          <!-- Footer -->
          <div class="footer">
            <p>Thank you for choosing us for your travel needs!</p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            const images = document.getElementsByTagName('img');
            let loadedCount = 0;
            const totalImages = images.length;
            
            if (totalImages === 0) {
              window.focus();
              window.print();
              return;
            }
            
            function imageLoaded() {
              loadedCount++;
              if (loadedCount === totalImages) {
                setTimeout(function() {
                  window.focus();
                  window.print();
                }, 300);
              }
            }
            
            for (let i = 0; i < totalImages; i++) {
              if (images[i].complete) {
                imageLoaded();
              } else {
                images[i].addEventListener('load', imageLoaded);
                images[i].addEventListener('error', imageLoaded);
              }
            }
          };
        </script>
      </body>
      </html>
    `;
    }

    // Generate and download invoice
    static async generateAndDownloadInvoice(
        booking: IBooking,
        organization?: any,
        orgDomainArg?: string
    ): Promise<void> {
        if (!this.hasCompletedPayments(booking)) {
            throw new Error("No completed payments found for this booking");
        }

        let orgName = "Travel Agency";
        let orgDomain = "Travel Management Partner";
        let invoiceColor = "#2563eb";
        let invoiceSeal: string | null = null;
        let invoiceFields: any = null;

        if (typeof organization === "object" && organization !== null) {
            orgName = organization.name || "Travel Agency";
            orgDomain = organization.domain || "";
            invoiceColor = organization.invoiceColor || "#2563eb";
            invoiceSeal = organization.invoiceSeal || null;
            invoiceFields = organization.invoiceFields;

            if (invoiceFields && typeof invoiceFields === "string") {
                try {
                    invoiceFields = JSON.parse(invoiceFields);
                } catch (e) {
                    console.error("Failed to parse invoiceFields JSON:", e);
                }
            }

            if (invoiceSeal && !invoiceSeal.startsWith("http://") && !invoiceSeal.startsWith("https://") && !invoiceSeal.startsWith("data:")) {
                const path = invoiceSeal.startsWith("/") ? invoiceSeal : `/${invoiceSeal}`;
                invoiceSeal = `${window.location.origin}${path}`;
            }
        } else {
            orgName = organization || "Travel Agency";
            orgDomain = orgDomainArg || "";
        }

        const invoiceData: InvoiceData = {
            booking,
            invoiceNumber: this.generateInvoiceNumber(booking),
            invoiceDate: new Date().toISOString(),
            organizationName: orgName,
            organizationDomain: orgDomain,
            invoiceColor,
            invoiceSeal,
            invoiceFields,
        };

        const htmlContent = this.generateInvoiceHTML(invoiceData);

        // Create a new window for printing/downloading
        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            throw new Error(
                "Popup blocked. Please allow popups for this site."
            );
        }

        const primaryCustomer = (booking.primaryCustomer || booking.customers?.[0]) as any;
        const customerName = primaryCustomer 
            ? `${primaryCustomer.firstName || ""} ${primaryCustomer.lastName || ""}`.trim() 
            : "Customer";
        const tripName = booking.package?.name || "Trip";

        printWindow.document.write(htmlContent);
        printWindow.document.title = `${customerName} - ${tripName} - Invoice ${invoiceData.invoiceNumber}`;
        printWindow.document.close();
    }

    // Alternative method using HTML5 download (saves as HTML file)
    static downloadInvoiceAsHTML(
        booking: IBooking,
        organization?: any,
        orgDomainArg?: string
    ): void {
        if (!this.hasCompletedPayments(booking)) {
            throw new Error("No completed payments found for this booking");
        }

        let orgName = "Travel Agency";
        let orgDomain = "Travel Management Partner";
        let invoiceColor = "#2563eb";
        let invoiceSeal: string | null = null;
        let invoiceFields: any = null;

        if (typeof organization === "object" && organization !== null) {
            orgName = organization.name || "Travel Agency";
            orgDomain = organization.domain || "";
            invoiceColor = organization.invoiceColor || "#2563eb";
            invoiceSeal = organization.invoiceSeal || null;
            invoiceFields = organization.invoiceFields;

            if (invoiceFields && typeof invoiceFields === "string") {
                try {
                    invoiceFields = JSON.parse(invoiceFields);
                } catch (e) {
                    console.error("Failed to parse invoiceFields JSON:", e);
                }
            }

            if (invoiceSeal && !invoiceSeal.startsWith("http://") && !invoiceSeal.startsWith("https://") && !invoiceSeal.startsWith("data:")) {
                const path = invoiceSeal.startsWith("/") ? invoiceSeal : `/${invoiceSeal}`;
                invoiceSeal = `${window.location.origin}${path}`;
            }
        } else {
            orgName = organization || "Travel Agency";
            orgDomain = orgDomainArg || "";
        }

        const invoiceData: InvoiceData = {
            booking,
            invoiceNumber: this.generateInvoiceNumber(booking),
            invoiceDate: new Date().toISOString(),
            organizationName: orgName,
            organizationDomain: orgDomain,
            invoiceColor,
            invoiceSeal,
            invoiceFields,
        };

        const htmlContent = this.generateInvoiceHTML(invoiceData);

        const primaryCustomer = (booking.primaryCustomer || booking.customers?.[0]) as any;
        const customerName = primaryCustomer 
            ? `${primaryCustomer.firstName || ""} ${primaryCustomer.lastName || ""}`.trim().replace(/\s+/g, "_") 
            : "Customer";
        const tripName = booking.package?.name 
            ? booking.package.name.replace(/\s+/g, "_") 
            : "Trip";

        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${customerName}_${tripName}_invoice_${invoiceData.invoiceNumber}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
