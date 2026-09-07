# Trekora Design Guidelines & UI Standards

This document establishes the UI/UX design patterns, component standards, and visual conventions across Trekora. All pages and components—especially **Details Pages** and **Activity Logs**—must adhere to these specifications to maintain visual harmony.

---

## 1. Details & View Page Architecture

All entity view/details pages (e.g., `view-booking.page.tsx`, `view-payment.page.tsx`, `view-customer.page.tsx`, and future modules) must follow a unified layout structure consisting of three primary layers:

```
+-----------------------------------------------------------------------------------+
| 1. Top Navigation & Breadcrumb Bar (Back Button + Breadcrumbs + Action Buttons)    |
+-----------------------------------------------------------------------------------+
| 2. Hero Summary Banner Card                                                       |
|    [Status Accent Top Border]                                                     |
|    #ID (Copyable) | Status Pill (Pulsing Dot) | Category Badge                    |
|    Primary Highlight (Large font-mono Currency/Name)                              |
|    Metadata Subtitle (Dates, relations, travelers)    | Quick Status State Badge  |
+----------------------------------------------------+------------------------------+
| 3. Main Content: 2-Column Responsive Grid (`grid-cols-1 lg:grid-cols-3`)           |
|                                                    |                              |
| [Left Column: 2 Cols (`lg:col-span-2`)]           | [Right Column: 1 Col]        |
| - Key Metric Card (Progress bar + 4-stat grid)    | - Assigned Stakeholder Card  |
| - Primary Entity Cards & Tables                   | - Quick Action Controls      |
| - Line items, travelers, breakdown                | - Audit & Activity Logs Card |
| - Operational workflows & document attachments    |                              |
+----------------------------------------------------+------------------------------+
```

### 1.1 Top Navigation & Action Header
- **Breadcrumb Navigation**:
  - Starts with an `<ArrowLeft className="w-3.5 h-3.5" />` link leading back to the main list page.
  - Formatted using `Breadcrumb`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbSeparator`, and `BreadcrumbPage`.
  - The current page displays the entity identifier in monospace font (e.g., `#{booking.bookingNumber}`).
- **Action Header Group**:
  - Positioned at the top right, aligned with the breadcrumb.
  - Groups primary and secondary action buttons (e.g., "Download Invoice", "Edit [Item]", or status triggers).
  - Use `size="sm"` buttons with relevant Lucide icons.

### 1.2 Hero Summary Banner Card
A prominent `Card` at the top of the details page provides instant context:
- **Status Accent Top Border**: A top strip `<div className="absolute top-0 left-0 right-0 h-1.5 ${statusConfig.borderAccent}" />` visually reinforcing current state.
- **Identifier Pill**: Monospace ID with a quick copy-to-clipboard button and tooltip/toast feedback.
- **Status Pill**: A soft-colored pill badge with an icon and a pulsing/static colored dot (`w-2 h-2 rounded-full`).
- **Primary Value Headline**: Large bold title in `font-mono text-3xl sm:text-4xl font-extrabold tracking-tight` (e.g., formatted total value `₹1,20,000`).
- **Context Subtitle**: Bullet-separated (`•`) metadata (e.g., package name, number of travelers, creation date).
- **Quick Status Visual**: Right-aligned status callout card (e.g., "Confirmed & Completed" in green or "₹15,000 Due" in amber).

### 1.3 Two-Column Responsive Layout (`grid grid-cols-1 lg:grid-cols-3 gap-6 items-start`)
- **Left Column (Primary Content, `lg:col-span-2 space-y-6`)**:
  - **Financial / Operational Progress Card**: A visual progress bar showing settlement percentage or completion progress, accompanied by a 4-column metric grid (Total Value, Total Paid, Remaining Due, Discounts/Refunds).
  - **Main Detail Sections**: Structured cards containing tables, itineraries, customer tables, or breakdown specifications.
  - **Workflow & Attachments**: Interactive tabs or accordions for document verification, invoices, and file managers.
- **Right Column (Sidebar, `space-y-6`)**:
  - **Stakeholder / Contact Cards**: Compact card showing assigned coordinator, customer, or agent with one-click copy for email/phone and avatar.
  - **Quick Action Card**: Modals or quick buttons to perform state mutations (mark completed, transfer batch, cancel, payout).
  - **Audit & Activity Logs Card**: Standard location for the entity's audit trail (see Section 2).

---

## 2. Audit & Activity Logs UI Standard

To maintain consistency across all modules (bookings, payments, packages, batches, leads, employees, etc.), activity logs must follow a standardized UI pattern.

### 2.1 Inline Detail Page Logs (`[Entity]LogsCard`)
When displayed inside a details page sidebar or bottom section, logs must be rendered as a vertical timeline card:

- **Card Header**:
  - Title: `<History className="w-4 h-4 text-primary" /> Audit & Activity Logs`.
  - Counter Badge: `<Badge variant="secondary" className="font-normal text-xs font-mono">{logs.length} entries</Badge>`.
- **Timeline Vertical Connector Line**:
  - Container class: `relative space-y-5 before:absolute before:top-3 before:bottom-3 before:left-[11px] before:w-[2px] before:bg-border/80`.
- **Timeline Node Marker**:
  - A 24x24 px circular marker centered directly over the line:
    `h-6 w-6 rounded-full shrink-0 z-10 border-2 border-background flex items-center justify-center text-white shadow-xs mt-0.5`.
  - Icon size: `w-3.5 h-3.5`.
  - **Color-coding by action category**:
    - **Creation / Verified**: Emerald (`bg-emerald-500`) with `CheckCircle2` or `UserCheck`.
    - **Status Changes**: Dynamic based on new status (Emerald for completed, Amber for on-hold/pending, Rose for cancelled, Blue for active).
    - **Updates & Edits**: Indigo / Blue (`bg-indigo-500` or `bg-blue-500`) with `Edit3` or `Activity`.
    - **Financial & Payments**: Emerald / Purple (`bg-emerald-600` or `bg-purple-500`) with `CreditCard` or `RotateCcw`.
    - **Deletion / Cancellation**: Rose (`bg-rose-500`) with `XCircle` or `Trash2`.
    - **Archival**: Slate / Gray (`bg-gray-500`) with `Archive`.
- **Log Entry Content Box**:
  - Box container: `bg-muted/30 hover:bg-muted/50 transition-colors p-3 rounded-lg border border-border/60 space-y-2`.
  - **Header Row**:
    - Action badge on the left using soft styling:
      `Badge variant="outline" className="font-semibold text-[11px] px-2 py-0.5 border ${meta.badgeColor}"`.
    - Exact timestamp on the right: `text-[11px] text-muted-foreground font-mono` formatted as `MMM d, yyyy • HH:mm`.
  - **Performer Attribution**:
    - "By [User]" with small avatar.
    - Hover preview: Wrap in `<HoverCard>` showing user avatar, full name, email, and a button linking to `/employees/:id`.
  - **Diff & Context Payload**:
    - Status transitions show badge comparison: `[Old Status] → [New Status]`.
    - If a reason was supplied, display it as an italicized quote: `<p className="text-[11px] text-muted-foreground italic">Note: "{reason}"</p>`.
    - Payment logs display formatted currency and method.

### 2.2 Standalone Full-Page Activity Logs (`/admin/logs`)
When viewing logs organization-wide as a dedicated page:
- Clean page header with title, subtitle, and search/action filter controls.
- Search input with debounced querying across name, email, and details.
- Action dropdown filter (e.g., "All Actions", "Invite Sent", "Reactivated", etc.).
- Responsive table with Performed By (avatar + email), Action Badge, Details, and Timestamp.
- Paginated using the standard `<DataTableFooter>`.

---

## 3. Semantic Status Badges & Color Palette

All entity statuses throughout the application must use consistent semantic color assignments:

| State Category | Color Palette | Tailwind Light Classes | Tailwind Dark Classes |
| :--- | :--- | :--- | :--- |
| **Completed / Paid / Active / Verified** | Emerald / Green | `bg-emerald-50 text-emerald-800 border-emerald-200` | `dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800` |
| **Pending / In Progress / On Hold** | Amber / Yellow | `bg-amber-50 text-amber-800 border-amber-200` | `dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800` |
| **Confirmed / Processing / Active** | Blue / Sky | `bg-blue-50 text-blue-800 border-blue-200` | `dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800` |
| **Cancelled / Failed / Blacklisted** | Rose / Red | `bg-rose-50 text-rose-800 border-rose-200` | `dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800` |
| **Archived / Inactive / Draft** | Gray / Slate | `bg-gray-100 text-gray-800 border-gray-200` | `dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700` |

### Status Pill Standard:
Pill badges should include an indicator dot:
```tsx
<div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.badgeClass}`}>
    <span className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`} />
    <StatusIcon className="w-3.5 h-3.5" />
    {statusConfig.label}
</div>
```

---

## 4. Typography & Data Formatting Standards

- **Monospace Usage (`font-mono`)**:
  - Always use `font-mono` for entity codes (e.g., `#BOK-1024`), IDs, phone numbers, monetary numbers, and precise timestamps.
- **Currency Formatting**:
  - All currency values must be formatted according to Indian Rupee (`INR`) standards:
    ```ts
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amount);
    ```
- **Date & Time Formatting (`date-fns`)**:
  - Display dates: `format(date, "MMM d, yyyy")` (e.g., "Sep 7, 2026").
  - Audit timestamps: `format(date, "MMM d, yyyy • HH:mm")` (e.g., "Sep 7, 2026 • 15:30").
  - Relative time: `formatDistanceToNow(date, { addSuffix: true })` (e.g., "2 hours ago").
- **Copy-to-Clipboard Elements**:
  - Provide a copy button beside codes, booking numbers, payment IDs, customer contact details, and invite links.
  - Temporarily swap the icon to `<Check className="w-3.5 h-3.5 text-emerald-600" />` on copy and fire a toast.

---

## 5. Loading States

### 5.1 Page & Table Loading (Skeleton Loader)
- The default loading style for full pages, data tables, and major content blocks is the **Skeleton Loader** (`<Skeleton>` component).
- Details pages should render skeleton placeholders matching the exact card and grid structure of the final view to minimize cumulative layout shift (CLS).

### 5.2 Actions & Button Clicks (Spinner)
- For button clicks, form submissions, and inline action verification, use `<Loader2 className="w-4 h-4 mr-2 animate-spin" />`.
- The button must enter a `disabled` state during execution to prevent duplicate requests.

---

## 6. Empty States

When a list, table, or section has no content to display:
- Display a descriptive **Icon** inside a soft-colored circular background (`bg-primary/10`).
- A prominent **Title** indicating what is missing (e.g., "No activity logs recorded").
- A short, helpful **Description** offering context or instructions.
- (Optional) A **Call to Action (CTA)** button if the user can create the missing item from that state.

---

## 7. Pagination (`<DataTableFooter>`)

All data tables and lists must use the shared `<DataTableFooter>` component:
- Shows total record count and range text ("Showing 1 to 10 of 25 results").
- Provides a rows-per-page dropdown selector ("Rows per page").
- Shows current page and total page count ("Page 1 of 3").
- Navigation control buttons (First, Previous, Next, Last) with automatic boundary disabling.
- Supports both:
  - **React Table Mode**: Pass the `@tanstack/react-table` instance directly via the `table` prop.
  - **Manual Mode**: Pass `page`, `limit`, `total`, `totalPages`, `onPageChange`, and `onLimitChange`.
