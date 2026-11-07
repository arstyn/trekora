import { getFileUrl } from "@/lib/utils";
import type { IOrganization } from "@/types/organization.types";
import type {
    IEmployeeSalary,
    ISalarySlipFieldsConfig,
} from "@/types/salary.types";

export const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export class SalarySlipService {
    static numberToIndianWords(amount: number): string {
        const num = Math.round(Math.max(0, Number(amount) || 0));
        if (num === 0) return "Zero Rupees Only";

        const ones = [
            "",
            "One",
            "Two",
            "Three",
            "Four",
            "Five",
            "Six",
            "Seven",
            "Eight",
            "Nine",
            "Ten",
            "Eleven",
            "Twelve",
            "Thirteen",
            "Fourteen",
            "Fifteen",
            "Sixteen",
            "十七",
            "Eighteen",
            "Nineteen",
        ];
        ones[17] = "Seventeen";

        const tens = [
            "",
            "",
            "Twenty",
            "Thirty",
            "Forty",
            "Fifty",
            "Sixty",
            "Seventy",
            "Eighty",
            "Ninety",
        ];

        const twoDigits = (n: number): string => {
            if (n < 20) return ones[n];
            return `${tens[Math.floor(n / 10)]}${n % 10 !== 0 ? " " + ones[n % 10] : ""}`;
        };

        const threeDigits = (n: number): string => {
            if (n < 100) return twoDigits(n);
            return `${ones[Math.floor(n / 100)]} Hundred${n % 100 !== 0 ? " and " + twoDigits(n % 100) : ""}`;
        };

        let remainder = num;
        const parts: string[] = [];

        const crore = Math.floor(remainder / 10000000);
        remainder %= 10000000;
        if (crore > 0) parts.push(`${threeDigits(crore)} Crore`);

        const lakh = Math.floor(remainder / 100000);
        remainder %= 100000;
        if (lakh > 0) parts.push(`${twoDigits(lakh)} Lakh`);

        const thousand = Math.floor(remainder / 1000);
        remainder %= 1000;
        if (thousand > 0) parts.push(`${twoDigits(thousand)} Thousand`);

        if (remainder > 0) parts.push(threeDigits(remainder));

        return `Rupees ${parts.join(" ")} Only`;
    }

    static formatCurrency(amount: number | string | undefined): string {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(Number(amount || 0));
    }

    static resolveAssetUrl(rawUrl?: string | null): string | null {
        if (!rawUrl) return null;
        if (
            rawUrl.startsWith("http://") ||
            rawUrl.startsWith("https://") ||
            rawUrl.startsWith("data:") ||
            rawUrl.startsWith("blob:")
        ) {
            return rawUrl;
        }
        return getFileUrl(rawUrl);
    }

    static parseFields(organization?: IOrganization | null): ISalarySlipFieldsConfig {
        const raw = organization?.salarySlipFields;
        let parsed: any = {};
        if (raw && typeof raw === "string") {
            try {
                parsed = JSON.parse(raw);
            } catch {
                parsed = {};
            }
        } else if (raw && typeof raw === "object") {
            parsed = raw;
        }

        return {
            companyHeaderText:
                parsed.companyHeaderText || organization?.name || "Trekora Travel Pvt. Ltd.",
            companyAddressText:
                parsed.companyAddressText ||
                organization?.domain ||
                "Registered Corporate Office • India",
            customFooterText:
                parsed.customFooterText ||
                "This is a computer-generated salary slip and does not require a physical signature.",
            showLogo: parsed.showLogo !== false,
            showSeal: parsed.showSeal !== false,
            showBankDetails: parsed.showBankDetails !== false,
            showStatutoryDetails: parsed.showStatutoryDetails !== false,
            showAttendanceSummary: parsed.showAttendanceSummary !== false,
            showNetInWords: parsed.showNetInWords !== false,
            showFooter: parsed.showFooter !== false,
            sealAlign: parsed.sealAlign || "right",
            layoutOrder: parsed.layoutOrder || [
                "employeeInfo",
                "attendance",
                "earningsDeductions",
                "netPay",
                "seal",
                "footer",
            ],
            casualLeaveQuota: parsed.casualLeaveQuota ?? 12,
            sickLeaveQuota: parsed.sickLeaveQuota ?? 10,
            paidLeaveQuota: parsed.paidLeaveQuota ?? 15,
        };
    }

    static generateSalarySlipHTML(
        salary: IEmployeeSalary,
        organization?: IOrganization | null
    ): string {
        const org = organization || salary.organization;
        const color = org?.salarySlipColor || "#2563eb";
        const fields = this.parseFields(org);
        const logoUrl = this.resolveAssetUrl(org?.salarySlipLogo);
        const sealUrl = this.resolveAssetUrl(
            org?.salarySlipSeal || org?.invoiceSeal
        );

        const employee = salary.employee;
        const structure = salary.salaryStructure;
        const monthName = MONTH_NAMES[(salary.month || 1) - 1] || "Month";
        const periodLabel = `${monthName} ${salary.year}`;

        const layoutOrder = fields.layoutOrder || [
            "employeeInfo",
            "attendance",
            "earningsDeductions",
            "netPay",
            "seal",
            "footer",
        ];

        const renderSection = (sectionId: string): string => {
            if (sectionId === "employeeInfo") {
                return `
                <div class="section-box">
                  <div class="info-grid">
                    <div>
                      <div class="info-row"><span class="label">Employee Name:</span><span class="value">${employee?.name || "N/A"}</span></div>
                      <div class="info-row"><span class="label">Designation:</span><span class="value">${employee?.designation || "N/A"}</span></div>
                      <div class="info-row"><span class="label">Email:</span><span class="value">${employee?.email || "N/A"}</span></div>
                      <div class="info-row"><span class="label">Join Date:</span><span class="value">${employee?.joinDate ? new Date(employee.joinDate).toLocaleDateString("en-IN") : "N/A"}</span></div>
                    </div>
                    <div>
                      ${
                          fields.showBankDetails
                              ? `
                        <div class="info-row"><span class="label">Bank Name:</span><span class="value">${structure?.bankName || "N/A"}</span></div>
                        <div class="info-row"><span class="label">Account No:</span><span class="value mono">${structure?.accountNumber || "N/A"}</span></div>
                        <div class="info-row"><span class="label">IFSC Code:</span><span class="value mono">${structure?.ifscCode || "N/A"}</span></div>
                      `
                              : ""
                      }
                      ${
                          fields.showStatutoryDetails
                              ? `
                        <div class="info-row"><span class="label">PAN / UAN:</span><span class="value mono">${structure?.panNumber || "N/A"} / ${structure?.uanNumber || "N/A"}</span></div>
                        <div class="info-row"><span class="label">PF / ESI No:</span><span class="value mono">${structure?.pfNumber || "N/A"} / ${structure?.esiNumber || "N/A"}</span></div>
                      `
                              : ""
                      }
                    </div>
                  </div>
                </div>
                `;
            }

            if (sectionId === "attendance" && fields.showAttendanceSummary) {
                return `
                <div class="attendance-grid">
                  <div class="att-card">
                    <div class="att-label">Total Working Days</div>
                    <div class="att-value">${salary.totalWorkingDays}</div>
                  </div>
                  <div class="att-card">
                    <div class="att-label">Days Worked</div>
                    <div class="att-value">${salary.daysWorked}</div>
                  </div>
                  <div class="att-card">
                    <div class="att-label">Paid Leaves</div>
                    <div class="att-value" style="color: #059669;">${salary.paidLeaves}</div>
                  </div>
                  <div class="att-card">
                    <div class="att-label">Unpaid / LOP Leaves</div>
                    <div class="att-value" style="color: #e11d48;">${salary.unpaidLeaves}</div>
                  </div>
                  <div class="att-card" style="background: #eff6ff; border-color: ${color};">
                    <div class="att-label" style="color: ${color};">Net Payable Days</div>
                    <div class="att-value" style="color: ${color};">${salary.payableDays}</div>
                  </div>
                </div>
                `;
            }

            if (sectionId === "earningsDeductions") {
                return `
                <table class="salary-table">
                  <thead>
                    <tr>
                      <th style="width: 34%;">Earnings</th>
                      <th style="width: 16%; text-align: right;">Amount (₹)</th>
                      <th style="width: 34%;">Deductions</th>
                      <th style="width: 16%; text-align: right;">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Basic Salary</td>
                      <td class="amt">${this.formatCurrency(salary.basicSalary)}</td>
                      <td>Provident Fund (EPF)</td>
                      <td class="amt">${this.formatCurrency(salary.pfDeduction)}</td>
                    </tr>
                    <tr>
                      <td>House Rent Allowance (HRA)</td>
                      <td class="amt">${this.formatCurrency(salary.hra)}</td>
                      <td>Employee State Insurance (ESI)</td>
                      <td class="amt">${this.formatCurrency(salary.esiDeduction)}</td>
                    </tr>
                    <tr>
                      <td>Dearness Allowance (DA)</td>
                      <td class="amt">${this.formatCurrency(salary.da)}</td>
                      <td>Professional Tax (PT)</td>
                      <td class="amt">${this.formatCurrency(salary.professionalTax)}</td>
                    </tr>
                    <tr>
                      <td>Conveyance Allowance</td>
                      <td class="amt">${this.formatCurrency(salary.conveyanceAllowance)}</td>
                      <td>Income Tax (TDS)</td>
                      <td class="amt">${this.formatCurrency(salary.tdsDeduction)}</td>
                    </tr>
                    <tr>
                      <td>Medical Allowance</td>
                      <td class="amt">${this.formatCurrency(salary.medicalAllowance)}</td>
                      <td>Loss of Pay (LOP) Deduction</td>
                      <td class="amt">${this.formatCurrency(salary.lopDeduction)}</td>
                    </tr>
                    <tr>
                      <td>Special Allowance</td>
                      <td class="amt">${this.formatCurrency(salary.specialAllowance)}</td>
                      <td>Other Deductions / Advance</td>
                      <td class="amt">${this.formatCurrency(salary.otherDeductions)}</td>
                    </tr>
                    <tr>
                      <td style="color: #059669; font-weight: 600;">
                        Additional Incentive ${salary.incentiveNote ? `<span style="font-size: 11px; color: #6b7280; font-weight: 400;">(${salary.incentiveNote})</span>` : ""}
                      </td>
                      <td class="amt" style="color: #059669;">${this.formatCurrency(salary.additionalIncentive)}</td>
                      <td></td>
                      <td></td>
                    </tr>
                    ${
                        Number(salary.otherEarnings) > 0
                            ? `
                    <tr>
                      <td>Other Earnings</td>
                      <td class="amt">${this.formatCurrency(salary.otherEarnings)}</td>
                      <td></td>
                      <td></td>
                    </tr>`
                            : ""
                    }
                    <tr class="totals-row">
                      <td>Gross Earnings</td>
                      <td class="amt">${this.formatCurrency(salary.grossEarnings)}</td>
                      <td>Total Deductions</td>
                      <td class="amt" style="color: #e11d48;">${this.formatCurrency(salary.totalDeductions)}</td>
                    </tr>
                  </tbody>
                </table>
                `;
            }

            if (sectionId === "netPay") {
                return `
                <div class="net-pay-banner">
                  <div>
                    <div class="net-title">Net Salary Payable (${periodLabel})</div>
                    ${
                        fields.showNetInWords
                            ? `<div class="net-words">${this.numberToIndianWords(Number(salary.netSalary))}</div>`
                            : ""
                    }
                    ${
                        salary.paymentMethod || salary.paymentReference
                            ? `<div style="font-size: 11px; color: #4b5563; margin-top: 4px;">
                                Paid via ${(salary.paymentMethod || "Bank Transfer").replace("_", " ").toUpperCase()}
                                ${salary.paymentReference ? ` • Ref: ${salary.paymentReference}` : ""}
                                ${salary.paymentDate ? ` • Date: ${new Date(salary.paymentDate).toLocaleDateString("en-IN")}` : ""}
                               </div>`
                            : ""
                    }
                  </div>
                  <div class="net-amount">${this.formatCurrency(salary.netSalary)}</div>
                </div>
                `;
            }

            if (sectionId === "seal" && fields.showSeal && sealUrl) {
                const align = fields.sealAlign || "right";
                return `
                <div style="text-align: ${align}; margin: 22px 0;">
                  <div style="display: inline-block; text-align: center;">
                    <img src="${sealUrl}" alt="Authorised Signatory" style="max-height: 75px; max-width: 170px; object-fit: contain;" />
                    <div style="font-size: 11px; font-weight: 600; color: #4b5563; border-top: 1px solid #d1d5db; padding-top: 4px; margin-top: 4px;">
                      Authorised Signatory
                    </div>
                  </div>
                </div>
                `;
            }

            if (sectionId === "footer" && fields.showFooter && fields.customFooterText) {
                return `
                <div class="slip-footer">
                  ${fields.customFooterText}
                </div>
                `;
            }

            return "";
        };

        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${employee?.name || "Employee"} - Payslip ${periodLabel} (${salary.slipNumber})</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1f2937;
            background: #ffffff;
            line-height: 1.5;
            padding: 24px;
          }
          .slip-container {
            max-width: 820px;
            margin: 0 auto;
            border: 1px solid #d1d5db;
            border-radius: 10px;
            padding: 28px;
          }
          .slip-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid ${color};
            padding-bottom: 18px;
            margin-bottom: 20px;
          }
          .brand-left {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .brand-logo {
            max-height: 56px;
            max-width: 140px;
            object-fit: contain;
          }
          .company-title {
            font-size: 22px;
            font-weight: 800;
            color: ${color};
          }
          .company-address {
            font-size: 12px;
            color: #6b7280;
            white-space: pre-line;
          }
          .slip-meta {
            text-align: right;
          }
          .slip-badge {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #6b7280;
          }
          .slip-period {
            font-size: 18px;
            font-weight: 800;
            color: ${color};
          }
          .slip-number {
            font-family: monospace;
            font-size: 12px;
            color: #4b5563;
          }
          .section-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 14px 18px;
            margin-bottom: 18px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 12.5px;
            padding: 3px 0;
          }
          .info-row .label { color: #6b7280; }
          .info-row .value { font-weight: 600; color: #111827; }
          .mono { font-family: monospace; }
          .attendance-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            margin-bottom: 18px;
          }
          .att-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 10px;
            text-align: center;
            background: #ffffff;
          }
          .att-label {
            font-size: 10.5px;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: 600;
          }
          .att-value {
            font-size: 16px;
            font-weight: 800;
            margin-top: 2px;
            font-family: monospace;
          }
          .salary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
            border: 1px solid #e5e7eb;
          }
          .salary-table th {
            background: ${color};
            color: #ffffff;
            font-size: 12px;
            text-transform: uppercase;
            padding: 10px 12px;
            text-align: left;
          }
          .salary-table td {
            padding: 9px 12px;
            font-size: 12.5px;
            border-bottom: 1px solid #e5e7eb;
          }
          .salary-table td:nth-child(2) {
            border-right: 1px solid #e5e7eb;
          }
          .salary-table tr:nth-child(even) {
            background: #f9fafb;
          }
          .amt {
            text-align: right;
            font-family: monospace;
            font-weight: 600;
          }
          .totals-row {
            background: #f3f4f6 !important;
            font-weight: 800;
          }
          .net-pay-banner {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 2px solid ${color};
            background: #f8fafc;
            border-radius: 10px;
            padding: 16px 20px;
            margin-bottom: 18px;
          }
          .net-title {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            color: #4b5563;
          }
          .net-words {
            font-size: 12px;
            font-style: italic;
            color: #374151;
            margin-top: 2px;
          }
          .net-amount {
            font-size: 24px;
            font-weight: 800;
            color: ${color};
            font-family: monospace;
          }
          .slip-footer {
            border-top: 1px solid #e5e7eb;
            padding-top: 12px;
            margin-top: 14px;
            text-align: center;
            font-size: 11px;
            color: #6b7280;
            white-space: pre-line;
          }
          @media print {
            body { padding: 0; }
            .slip-container { border: 1px solid #ccc; }
          }
        </style>
      </head>
      <body>
        <div class="slip-container">
          <div class="slip-header">
            <div class="brand-left">
              ${fields.showLogo && logoUrl ? `<img src="${logoUrl}" class="brand-logo" alt="Logo" />` : ""}
              <div>
                <div class="company-title">${fields.companyHeaderText}</div>
                <div class="company-address">${fields.companyAddressText}</div>
              </div>
            </div>
            <div class="slip-meta">
              <div class="slip-badge">Salary Slip</div>
              <div class="slip-period">${periodLabel}</div>
              <div class="slip-number">#${salary.slipNumber}</div>
            </div>
          </div>

          ${layoutOrder.map((sec) => renderSection(sec)).join("")}
        </div>
        <script>
          window.onload = function() {
            const images = document.getElementsByTagName('img');
            let loaded = 0;
            if (images.length === 0) {
              window.focus();
              window.print();
              return;
            }
            const done = () => {
              loaded++;
              if (loaded >= images.length) {
                setTimeout(() => { window.focus(); window.print(); }, 250);
              }
            };
            for (let i = 0; i < images.length; i++) {
              if (images[i].complete) done();
              else {
                images[i].addEventListener('load', done);
                images[i].addEventListener('error', done);
              }
            }
          };
        </script>
      </body>
      </html>
        `;
    }

    static openAndPrintSalarySlip(
        salary: IEmployeeSalary,
        organization?: IOrganization | null
    ): void {
        const html = this.generateSalarySlipHTML(salary, organization);
        const win = window.open("", "_blank");
        if (!win) {
            throw new Error("Popup blocked. Please allow popups to view/print the PDF.");
        }
        win.document.write(html);
        win.document.close();
    }

    static downloadSalarySlipHTML(
        salary: IEmployeeSalary,
        organization?: IOrganization | null
    ): void {
        const html = this.generateSalarySlipHTML(salary, organization);
        const empName = (salary.employee?.name || "Employee").replace(/\s+/g, "_");
        const monthName = MONTH_NAMES[(salary.month || 1) - 1] || "Month";
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${empName}_Payslip_${monthName}_${salary.year}_${salary.slipNumber}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
