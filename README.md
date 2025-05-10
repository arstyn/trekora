# Tekora - SaaS Travel Management Platform

> A powerful SaaS solution for travel agencies and tour operators to manage their bookings, finance, operations, and customer relationships in one platform.

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [License](#license)

---

## About

**Tekora** is a **multi-tenant SaaS platform** designed for travel companies to manage:

- Package creation
- Traveler bookings
- Finance tracking
- Operational workflows
- Customer engagement

Fully customizable per company, the platform is scalable, secure, and ready for real-time collaboration across departments.

---

## Features

- **Package Management**: Create and manage travel packages (flight, train, vehicle, etc.).
- **Sales Workflow**: Enquiry → Lead → Confirmation → Payment → Reservation.
- **Finance Management**: Track payments, refunds, invoices.
- **Traveler Management**: Customer badges (Silver, Gold, Platinum), loyalty tracking, referral programs.
- **Operations Management**: Ticketing, food, accommodation, visa management.
- **Departmental Collaboration**: Sales, Product, Operations, Accounts, Marketing, HR.
- **Branch Management**: Multi-branch support.
- **Reports**: Export data as PDF, Excel, or CSV.
- **Notifications**: WhatsApp (Primary), Email, and SMS alerts.
- **Real-time Dashboards**: Live updates for all activities.
- **Cancellation and Refunds**: Controlled and transparent refund workflow.

---

## Tech Stack

- **Monorepo Tooling**: [Turborepo](https://turbo.build/)
- **Frontend**: [Next.js](https://nextjs.org/)
- **Backend**: [Nest.js](https://nestjs.com/)
- **Database**: [PostgreSQL (AWS RDS)](https://aws.amazon.com/rds/)
- **ORM**: [Drizzle](https://orm.drizzle.team/) or [TypeORM](https://typeorm.io/)
- **Hosting**: AWS EC2
- **Notifications**: WhatsApp, Email, SMS

---

## Installation

Postgresql
Link: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

Version: 17.0.1

```bash
# Clone the repository
git clone https://github.com/your-organization/tekora.git
cd tekora

# Install all dependencies using Turborepo
npm install
```

---

## Environment Variables

---

## Scripts

```bash
# Start all apps for development
npm run dev

# Build all apps
npm run build

# Start all apps in production mode
npm run start
```

---

## Project Structure

```
apps/
  web/        # Next.js frontend app
  api/         # Nest.js backend app
packages/
  api/          # Common models, types, and utilities

infrastructure/    # AWS setup files, deployment scripts
```

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Contributions

This project is intended for internal development only. External contributions are not accepted at this time.

---

## Contact

Made with ❤️ by the Tekora Team.
