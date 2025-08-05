import type { IBooking } from '@/types/booking.types';

export interface InvoiceData {
  booking: IBooking;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
}

export class InvoiceService {
  // Generate invoice number based on booking
  static generateInvoiceNumber(booking: IBooking): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `INV-${year}${month}-${booking.bookingNumber}`;
  }

  // Check if booking has completed payments
  static hasCompletedPayments(booking: IBooking): boolean {
    return booking.payments?.some(payment => payment.status === 'completed') ?? false;
  }

  // Get completed payments only
  static getCompletedPayments(booking: IBooking) {
    return booking.payments?.filter(payment => payment.status === 'completed') ?? [];
  }

  // Calculate total paid amount from completed payments
  static getTotalPaidAmount(booking: IBooking): number {
    return this.getCompletedPayments(booking)
      .reduce((total, payment) => total + payment.amount, 0);
  }

  // Generate HTML content for invoice
  static generateInvoiceHTML(invoiceData: InvoiceData): string {
    const { booking } = invoiceData;
    const completedPayments = this.getCompletedPayments(booking);
    const totalPaid = this.getTotalPaidAmount(booking);

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoiceData.invoiceNumber}</title>
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
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          
          .company-info h1 {
            color: #2563eb;
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
            color: #2563eb;
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
            color: #2563eb;
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
            background-color: #2563eb;
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
            border-top: 2px solid #2563eb;
            padding-top: 15px;
            margin-top: 15px;
            font-weight: bold;
            font-size: 16px;
            color: #2563eb;
          }
          
          .payment-history {
            margin-top: 40px;
          }
          
          .payment-history h3 {
            color: #2563eb;
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
              <h1>Trekora</h1>
              <p>Travel Management Platform</p>
              <p>Your trusted travel partner</p>
            </div>
            <div class="invoice-details">
              <h2>INVOICE</h2>
              <p><strong>Invoice #:</strong> ${invoiceData.invoiceNumber}</p>
              <p><strong>Date:</strong> ${new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
              <p><strong>Booking #:</strong> ${booking.bookingNumber}</p>
            </div>
          </div>

          <!-- Billing Information -->
          <div class="billing-info">
            <div class="billing-section">
              <h3>Bill To:</h3>
              <p><strong>${booking.customer.name}</strong></p>
              <p>${booking.customer.email}</p>
              <p>${booking.customer.phone}</p>
              ${booking.customer.address ? `<p>${booking.customer.address}</p>` : ''}
            </div>
            <div class="billing-section">
              <h3>Trip Details:</h3>
              <p><strong>Package:</strong> ${booking.package.name}</p>
              ${booking.package.destination ? `<p><strong>Destination:</strong> ${booking.package.destination}</p>` : ''}
              <p><strong>Travel Dates:</strong> ${new Date(booking.batch.startDate).toLocaleDateString()} - ${new Date(booking.batch.endDate).toLocaleDateString()}</p>
              <p><strong>Passengers:</strong> ${booking.numberOfPassengers}</p>
              <p><strong>Status:</strong> <span class="status-badge status-completed">${booking.status}</span></p>
            </div>
          </div>

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
                  <small>${booking.package.description || 'Travel package'}</small>
                </td>
                <td>${booking.numberOfPassengers}</td>
                <td class="amount">$${booking.package.price.toLocaleString()}</td>
                <td class="amount">$${booking.totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <!-- Totals Section -->
          <div class="totals-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${booking.totalAmount.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span>Tax:</span>
              <span>$0.00</span>
            </div>
            <div class="total-row final">
              <span>Total:</span>
              <span>$${booking.totalAmount.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span>Amount Paid:</span>
              <span style="color: #059669;">$${totalPaid.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span>Balance Due:</span>
              <span style="color: ${booking.balanceAmount > 0 ? '#dc2626' : '#059669'};">$${booking.balanceAmount.toLocaleString()}</span>
            </div>
          </div>

          <!-- Payment History -->
          ${completedPayments.length > 0 ? `
          <div class="payment-history">
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
                ${completedPayments.map(payment => `
                <tr>
                  <td>${payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}</td>
                  <td>${payment.paymentMethod.replace('_', ' ').toUpperCase()}</td>
                  <td>${payment.paymentReference || 'N/A'}</td>
                  <td class="amount">$${payment.amount.toLocaleString()}</td>
                  <td><span class="status-badge status-completed">${payment.status}</span></td>
                </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <!-- Footer -->
          <div class="footer">
            <p>Thank you for choosing Trekora for your travel needs!</p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate and download invoice
  static async generateAndDownloadInvoice(booking: IBooking): Promise<void> {
    if (!this.hasCompletedPayments(booking)) {
      throw new Error('No completed payments found for this booking');
    }

    const invoiceData: InvoiceData = {
      booking,
      invoiceNumber: this.generateInvoiceNumber(booking),
      invoiceDate: new Date().toISOString(),
    };

    const htmlContent = this.generateInvoiceHTML(invoiceData);
    
    // Create a new window for printing/downloading
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        // Close the window after printing (optional)
        // printWindow.close();
      }, 500);
    };
  }

  // Alternative method using HTML5 download (saves as HTML file)
  static downloadInvoiceAsHTML(booking: IBooking): void {
    if (!this.hasCompletedPayments(booking)) {
      throw new Error('No completed payments found for this booking');
    }

    const invoiceData: InvoiceData = {
      booking,
      invoiceNumber: this.generateInvoiceNumber(booking),
      invoiceDate: new Date().toISOString(),
    };

    const htmlContent = this.generateInvoiceHTML(invoiceData);
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceData.invoiceNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
} 