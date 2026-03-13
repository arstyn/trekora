# Release Notes

All notable changes to Trekora will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## Version 0.0.2 (Beta) - Resilience & Reliability Update

**Release Date:** 2026-03-13

### 🎉 Summary

In this release we actually re-did the how the roles are defined we created permissions and permission sets based on tenants. Also added ton of logging inside the application to keep track of what is happening.

### ✨ Features

#### ⚡ Operations & Workflow

- **Workflow Progress System**: Enhanced the `WorkflowManager` to provide real-time visualization of pre-trip checklists and booking progress.
- **Interactive Safety Checks**: Added confirmation prompts for critical status changes (e.g., batch status transitions) to prevent accidental data modification.
- **Optimized Task Management**: Refactored the "Todos" system for faster loading and a cleaner, component-based interface.

#### 📡 Real-time & Logging

- **Instant Log Refresh**: System logs now update instantly via WebSockets without requiring a page reload.
- **Review Before Publish**: New workflow stage in package management allowing users to review all pending changes before making them live.

### 🚀 Infrastructure

- **Railway.com Integration**: Added native support for Railway deployments, including monorepo pathing and automated production migrations.
- **Nixpacks Support**: Optimized the build process using Nixpacks for faster deployments and consistent environments.
- **Environment Management**: Improved `.env` structure for better handling of CORS, public URLs, and external social providers.

### 🔨 Improvements

- **Package creation**: Improved package creation flow. Added a step wise creation process for packages. Also improved the loading on package details page.
- **Batches are now linked to booking**: Batches are now linked to booking. This means that a batch can have multiple bookings and a booking can contain multiple passangers.
- **Batch status changes confirmation**: Batch status changes now require confirmation from the user.

---

## Version 0.0.1 (Beta) - Initial Production Release

**Release Date:** [Current Date]

### 🎉 Initial Production Launch

We're excited to announce the first production release of Trekora! This beta version marks our journey from development to production, providing a comprehensive travel management platform for agencies and tour operators.

### ✨ Features

#### Core Functionality

- **Authentication & Authorization**: Secure user authentication with JWT tokens and role-based access control
- **Organization Management**: Multi-tenant support for managing multiple organizations
- **User Management**: Complete user, employee, and department management system
- **Branch Management**: Multi-branch support for organizations

#### Travel Management

- **Package Management**: Create and manage travel packages with detailed itineraries
- **Lead Management**: Track leads through the complete sales workflow (Enquiry → Lead → Confirmation → Payment → Reservation)
- **Customer Management**: Comprehensive customer profiles with document management
- **Booking System**: Full booking lifecycle management
- **Pre-Booking**: Pre-booking workflow support
- **Payment Tracking**: Payment and refund management system

#### Operations

- **Batch Management**: Organize and manage travel batches
- **Reminders**: Automated reminder system for important tasks
- **Notifications**: Real-time notifications via WhatsApp, Email, and SMS
- **File Management**: Upload and manage customer documents, package images, and itineraries

#### Dashboard & Analytics

- **Real-time Dashboard**: Live updates for all activities
- **Data Import**: Import functionality for bulk data operations

#### User Experience

- **Modern UI**: Built with React and Tailwind CSS for a responsive, modern interface
- **Real-time Updates**: WebSocket integration for live updates
- **Responsive Design**: Mobile-friendly interface

### 🛠️ Technical Stack

- **Backend**: NestJS with TypeScript
- **Frontend**: React with Vite
- **Database**: PostgreSQL with TypeORM
- **Real-time**: Socket.IO for WebSocket communication
- **Authentication**: JWT-based authentication
- **File Storage**: Local file system with organized structure

### 📝 Notes

- This is a **beta release**. We're actively working on improvements and new features.
- The application is now in production and ready for use.
- Version 1.0.0 will mark the official release when we're confident in feature completeness and stability.

### 🔄 Versioning

- **Current Version**: 0.0.1 (Beta)
- **Version Format**: `MAJOR.MINOR.PATCH`
- **Beta Status**: All versions < 1.0.0 are considered beta
- **Official Release**: Version 1.0.0 will mark the official release

---

**Next Steps**: Continue monitoring production usage, gather feedback, and iterate on improvements for future releases.

---

## [Unreleased]

### Planned Features

- Additional features and improvements coming in future releases
