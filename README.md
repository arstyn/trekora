# Trekora - SaaS Travel Management Platform

> A powerful SaaS solution for travel agencies and tour operators to manage their bookings, finance, operations, and customer relationships in one platform.

**Current Version**: 0.0.1 (Beta)

---

## Table of Contents

-   [About](#about)
-   [Features](#features)
-   [Tech Stack](#tech-stack)
-   [Installation](#installation)
-   [Environment Variables](#environment-variables)
-   [Database Configuration](#database-configuration)
-   [Running the Application](#running-the-application)
-   [Project Structure](#project-structure)
-   [Version Management](#version-management)
-   [License](#license)

---

## About

**Trekora** is a **multi-tenant SaaS platform** designed for travel companies to manage:

-   Package creation
-   Traveler bookings
-   Finance tracking
-   Operational workflows
-   Customer engagement

Fully customizable per company, the platform is scalable, secure, and ready for real-time collaboration across departments.

---

## Features

-   **Package Management**: Create and manage travel packages (flight, train, vehicle, etc.).
-   **Sales Workflow**: Enquiry → Lead → Confirmation → Payment → Reservation.
-   **Finance Management**: Track payments, refunds, invoices.
-   **Traveler Management**: Customer badges (Silver, Gold, Platinum), loyalty tracking, referral programs.
-   **Operations Management**: Ticketing, food, accommodation, visa management.
-   **Departmental Collaboration**: Sales, Product, Operations, Accounts, Marketing, HR.
-   **Branch Management**: Multi-branch support.
-   **Reports**: Export data as PDF, Excel, or CSV.
-   **Notifications**: WhatsApp (Primary), Email, and SMS alerts.
-   **Real-time Dashboards**: Live updates for all activities.
-   **Cancellation and Refunds**: Controlled and transparent refund workflow.

---

## Tech Stack

-   **Frontend**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
-   **Backend**: [Nest.js](https://nestjs.com/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
-   **ORM**: [TypeORM](https://typeorm.io/)
-   **Real-time**: [Socket.IO](https://socket.io/)
-   **Hosting**: AWS EC2
-   **Notifications**: WhatsApp, Email, SMS

---

## Installation

### Prerequisites

Download and install PostgreSQL (Version 17):

-   Link: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

### Setup

```bash
# Clone the repository
git clone https://github.com/feyzibrahim/trekora.git
cd trekora

# Install backend dependencies
cd apps/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Environment Variables

Copy the `.env.public` files from both `apps/backend` and `apps/frontend` directories and rename them to `.env`. Update the values as needed for your local environment.

---

## Database Configuration

### Running Migrations

To create all the tables and schemas, navigate to the backend directory and run:

```bash
cd apps/backend
npm run migration:run
```

### Creating Migration Files

To create a new migration file:

```bash
cd apps/backend
npx typeorm migration:create ./src/database/migrations/fileName
```

### Database Seeding

We have a database seeding option to populate the database with dummy data for local development. Check the seed module in `apps/backend/src/database/seeds` to view the data structure.

To seed the database:

```bash
cd apps/backend
npm run seed
```

---

## Running the Application

### Development Mode

You'll need to run the backend and frontend separately in different terminals:

**Terminal 1 - Backend:**

```bash
cd apps/backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd apps/frontend
npm run dev
```

### Production Build

**Backend:**

```bash
cd apps/backend
npm run build
npm run start:prod
```

**Frontend:**

```bash
cd apps/frontend
npm run build
npm run preview
```

---

## Project Structure

```
trekora/
├── apps/
│   ├── backend/          # Nest.js backend application
│   │   ├── src/
│   │   │   ├── modules/   # Feature modules
│   │   │   ├── database/  # Database entities, migrations, seeds
│   │   │   └── ...
│   │   └── package.json
│   └── frontend/          # React frontend application
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── services/
│       │   └── ...
│       └── package.json
└── README.md
```

---

## Version Management

### Current Status

-   **Current Version**: 0.0.1 (Beta)
-   **Status**: The application is in **beta** until we reach version 1.0.0
-   **Official Release**: Version 1.0.0 will mark the official release

### Version Format

We follow [Semantic Versioning](https://semver.org/) (SemVer):

-   Format: `MAJOR.MINOR.PATCH` (e.g., `0.0.1`)
-   **MAJOR**: Breaking changes (will be 1.0.0 for official release)
-   **MINOR**: New features (backward compatible)
-   **PATCH**: Bug fixes (backward compatible)

### How to Update Versions

When making changes to the application, you must update the version numbers in the following files:

1. **Backend Version**: Update `apps/backend/package.json`

    ```json
    {
        "version": "0.0.1"
    }
    ```

2. **Frontend Version**: Update `apps/frontend/package.json`

    ```json
    {
        "version": "0.0.1"
    }
    ```

3. **Release Notes**: Update `RELEASE_NOTES.md` with:
    - New version number
    - Release date
    - List of changes (features, bug fixes, etc.)

### Version Update Guidelines

-   **Patch (0.0.X)**: Bug fixes, minor improvements
-   **Minor (0.X.0)**: New features, enhancements
-   **Major (X.0.0)**: Breaking changes (currently reserved for 1.0.0 official release)

### Example Workflow

1. Make your changes
2. Update version in both `package.json` files
3. Update `RELEASE_NOTES.md` with the new version and changes
4. Commit with message: `chore: bump version to 0.0.2`
5. Tag the release:

    **Using Command Line:**

    ```bash
    git tag v0.0.2
    git push origin v0.0.2
    ```

    **Using GitHub Desktop:**

    - After committing your changes, go to **Repository** → **Create Tag...** (or press `Ctrl+Shift+T` / `Cmd+Shift+T`)
    - Enter the tag name: `v0.0.2`
    - Optionally add a description (e.g., "Version 0.0.2 - Bug fixes and improvements")
    - Click **Create Tag**
    - Push the tag to GitHub: **Repository** → **Push Tags...** (or it will be included when you push your branch)

### Important Notes

-   **Always update both backend and frontend versions** to keep them in sync
-   **Document all changes** in `RELEASE_NOTES.md`
-   **Version 1.0.0** will be reserved for the official release when we're confident in feature completeness and stability
-   Until 1.0.0, all versions are considered **beta**

---

## Release Notes

For detailed release notes and changelog, see [RELEASE_NOTES.md](./RELEASE_NOTES.md).

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Contributions

This project is intended for internal development only. External contributions are not accepted at this time.

---

## Contact

Made with ❤️ by the Trekora Team.
