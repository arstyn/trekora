Unless specifically asked Do not test the app in agent mode, Testing will be done by me. 

# Trekora Agent Guidelines & Application Standards

This document establishes the architecture, directory standards, naming conventions, and development practices across the Trekora codebase. All AI agents and developers must strictly adhere to these rules.

---

## 1. Monorepo Overview & Architecture

Trekora is a multi-tenant SaaS travel management platform structured as a monorepo:

- **`apps/frontend`**: Client single-page application (SPA).
  - **Framework**: React 19 + Vite 3+
  - **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) + `tw-animate-css`
  - **UI Component Library**: Radix UI primitives (`@radix-ui/*`) styled in the shadcn/ui design pattern
  - **Routing**: React Router v7 (`react-router-dom`)
  - **State & Tables**: `@tanstack/react-table`, React Context (`AuthContext`)
  - **Icons**: `lucide-react`
  - **Feedback & Notifications**: `sonner` (`toast.success`, `toast.error`) & custom `useToast`
  - **Forms & Validation**: `react-hook-form` + `zod`
  - **Dates & Utility**: `date-fns`, `clsx`, `tailwind-merge`

- **`apps/backend`**: Server API application.
  - **Framework**: NestJS
  - **Language**: TypeScript
  - **Database & ORM**: PostgreSQL + TypeORM
  - **Realtime**: Socket.IO (`socket.io`)
  - **Authentication**: JWT, bcrypt, role/permission-based access control guards

---

## 2. Frontend Standards (`apps/frontend/src`)

### 2.1 Directory Organization

The frontend codebase is organized under `apps/frontend/src`:

```
apps/frontend/src/
├── components/          # Shared, reusable UI components
│   ├── ui/              # Primitive design system components (Button, Badge, Card, Dialog, etc.)
│   ├── sidebar/         # AppSidebar and sidebar navigation items
│   ├── data-table-footer.tsx # Standard table pagination component
│   └── site-header.tsx  # Top global navigation header
├── context/             # Global React Contexts (authContext, theme-provider)
├── hooks/               # Custom hooks (use-permissions, use-toast, use-mobile)
├── lib/                 # Utility helpers (axiosInstance, utils.ts, getFileUrl)
├── pages/
│   ├── auth/            # Authentication & onboarding pages (login, signup, etc.)
│   ├── general/         # Public marketing & error pages (home, about, not-found, server-error)
│   └── user/            # Authenticated application feature pages (Core CRM & ERP)
├── services/            # Client-side API service classes/objects (BookingService, PaymentService, etc.)
└── types/               # TypeScript interfaces, schemas, and enums
```

---

### 2.2 Feature Directory & File Naming Conventions (`pages/user`)

When creating or modifying features inside `apps/frontend/src/pages/user`, **STRICTLY** follow this structure:

1. **Feature Directories**:
   - Always use **plural names** in kebab-case for feature directories.
   - Examples: `bookings`, `payments`, `packages`, `batches`, `customers`, `employees`, `agents`, `branches`, `leads`, `meals`, `cancellation-tiers`, `payment-structures`, `permissions`, `settings`, `todos`.

2. **Internal Component Folders**:
   - Feature-specific internal sub-components must reside inside a folder named **`_components`**.
   - Examples:
     - `pages/user/bookings/_components/booking-logs-card.tsx`
     - `pages/user/bookings/_components/cancel-booking-dialog.tsx`
     - `pages/user/payments/_components/payment-logs-card.tsx`
     - `pages/user/agents/_components/payout-dialog.tsx`

3. **Route-Level Page Files**:
   - All route-level page files **must** end with `.page.tsx`.
   - **Main feature list page**: `[feature-plural].page.tsx` (e.g., `bookings.page.tsx`, `payments.page.tsx`, `packages.page.tsx`)
   - **Create page**: `create-[feature-singular].page.tsx` (e.g., `create-package.page.tsx`, `create-agent.page.tsx`)
   - **Edit page**: `edit-[feature-singular].page.tsx` (e.g., `edit-booking.page.tsx`, `edit-batch.page.tsx`)
   - **View / Details page**: `view-[feature-singular].page.tsx` (e.g., `view-booking.page.tsx`, `view-payment.page.tsx`, `view-customer.page.tsx`)

---

### 2.3 Page Architecture Patterns

All new pages must adhere to standardized architecture blueprints:

#### A. List Pages (`[feature-plural].page.tsx`)
- Standard top header with page title, descriptive subtitle, search bar, filter controls, and a primary CTA (e.g., "+ Add [Item]").
- Data display using `@tanstack/react-table` or responsive table.
- Standard loading state via `Skeleton`.
- Standard empty state with icon, title, description, and CTA when 0 records exist.
- Standard pagination using `<DataTableFooter>` at the bottom of the table.

#### B. Details / View Pages (`view-[feature-singular].page.tsx`)
- Follow the uniform Details Page layout detailed in `design.md`:
  1. Top breadcrumb navigation with back button + contextual action buttons (Edit, Download/Invoice, Status dropdown).
  2. Hero summary card with colored top status accent line, copyable identifier pill, status badge, primary monetary/name metric, and quick-status badge.
  3. 2-column responsive layout (`lg:grid-cols-3`):
     - Primary 2-column content: Key metric progress cards, main entities, line-item tables, sub-workflows.
     - 1-column sidebar: Stakeholder cards, quick actions, and the **Audit & Activity Logs Card**.

#### C. Audit & Activity Logs UI
- Every detail page must feature an activity/audit log tracking updates, status transitions, and actions.
- Use the standard vertical timeline UI (`[Entity]LogsCard`) located in `_components/` following the visual pattern described in `design.md`.

---

## 3. Backend Standards (`apps/backend/src`)

### 3.1 Modular Structure

The backend follows NestJS modular architecture located in `apps/backend/src/modules/`:

```
apps/backend/src/modules/[feature]/
├── [feature].module.ts        # Module declaration importing entities and registering providers
├── [feature].controller.ts    # REST endpoints with route decorators, DTO validation, and auth guards
├── [feature].service.ts       # Business logic, transactions, and TypeORM repository queries
├── entities/
│   └── [feature].entity.ts    # TypeORM entity definitions with relations and audit columns
└── dto/
    ├── create-[feature].dto.ts # Request body validation using class-validator
    └── update-[feature].dto.ts
```

### 3.2 Backend Conventions
- **Audit Columns**: Core entities should include standard timestamps (`createdAt`, `updatedAt`) and track user actions (`createdBy`, `updatedBy`, `organizationId`).
- **Activity Logging**: Mutation operations (status changes, payments, cancellations, transfers) must record an audit entry in the activity log table.
- **Transactions**: Multi-table operations (e.g., booking creation with customers and payments) must use TypeORM QueryRunner or DataSource transactions.

---

## 4. Engineering & Agent Conventions

1. **No Autonomous Testing**:
   - **Do not test the app in agent mode** (no browser subagents or automated clicking sessions). User will perform manual testing.
2. **Type Safety**:
   - Maintain strict TypeScript types. Define entity models in `apps/frontend/src/types/` and avoid `any`.
3. **Permissions Verification**:
   - Check user authorization on actions using the `useHasPermission` hook (e.g., `const { hasPermission } = useHasPermission("bookings", "update")`).
4. **Service-Based API Calls**:
   - Centralize API requests in dedicated services under `apps/frontend/src/services/` instead of executing scattered Axios calls directly inside components.
5. **User Feedback**:
   - Always notify the user of async outcomes using Sonner (`toast.success` / `toast.error`).