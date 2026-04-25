# SmartCampus — Unified Campus Operations Platform

A full-stack web application that brings campus resource management, booking, maintenance ticketing, and secure authentication into one unified platform.

---

## Table of Contents

- [Overview](#overview)
- [Modules](#modules)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Features by Module](#features-by-module)
- [API Overview](#api-overview)
- [Screenshots](#screenshots)

---

## Overview

SmartCampus is a role-based campus management system built for universities. It provides a single dashboard for managing physical resources, handling student bookings, resolving maintenance tickets, and controlling user access — all from one platform.

---

## Modules

| Module | Path | Description |
|--------|------|-------------|
| **Home** | `/` | Landing page with navigation to all modules |
| **Module 1 — Resource Management** | `/m1` | Manage campus resources with live analytics dashboard |
| **Module 2 — Booking System** | `/m2` | Students browse and book campus resources |
| **Module 3 — Support Ticketing** | `/m3` | Maintenance and incident ticket management |
| **Module 4 — Auth & Access** | `/m4` | Login, registration, OAuth2, role-based access |
| **Campus Resources** | `/resources` | Public-facing resource browser with booking |
| **Create Ticket** | `/create-ticket` | Standalone ticket submission for users |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| React Router DOM | 7 | Client-side routing |
| Recharts | 3 | Analytics charts |
| Tailwind CSS | 3 | Utility-first styling |
| CRACO | 7 | CRA config override |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Spring Boot | 4.0.5 | REST API framework |
| Spring Security | — | Authentication & authorization |
| Spring OAuth2 Client | — | Google OAuth2 login |
| JWT (jjwt) | 0.11.5 | Token-based auth |
| Spring Data MongoDB | — | Database ORM |
| Lombok | — | Boilerplate reduction |
| Java | 21 | Runtime |

### Database
- **MongoDB Atlas** — cloud-hosted NoSQL database

---

## Project Structure

```
PAF-SpringBoot/
├── frontend/                        # React application
│   ├── public/
│   └── src/
│       ├── Admin/                   # Admin portal
│       ├── Home/                    # Landing page
│       ├── M1/                      # Resource management module
│       │   ├── components/
│       │   ├── pages/
│       │   │   ├── ResourceDashboard.jsx   # Live analytics dashboard
│       │   │   ├── GenerateReport.jsx      # Export/print reports
│       │   │   ├── ViewResources.jsx
│       │   │   ├── CreateResource.jsx
│       │   │   └── UpdateResource.jsx
│       │   ├── services/
│       │   └── ResourceList.js      # Public resource browser
│       ├── M2/                      # Booking module
│       │   ├── BookingForm.js
│       │   ├── MyBookings.js
│       │   ├── AdminM2.js
│       │   └── bookingService.js
│       ├── M3/                      # Ticketing module
│       │   ├── api/
│       │   ├── components/
│       │   ├── context/
│       │   ├── layout/
│       │   └── pages/
│       ├── M4/                      # Auth module
│       └── App.js
│
└── backend/backend/                 # Spring Boot application
    └── src/main/java/backend/
        ├── Module_1/                # Resource management API
        ├── Module_2/Booking/        # Booking API
        ├── Module_3/                # Ticketing API
        └── Module_4/Auth/           # Authentication API
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **Java** 21
- **Maven** 3.9+
- **MongoDB Atlas** account (or local MongoDB instance)

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/backend
   ```

2. Configure your environment in `src/main/resources/application.properties`:
   ```properties
   spring.data.mongodb.uri=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
   spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
   spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
   jwt.secret=YOUR_JWT_SECRET_KEY
   ```

3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```
   The backend starts on **http://localhost:8081**

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (optional — defaults to localhost):
   ```env
   REACT_APP_API_BASE_URL=http://localhost:8081/api
   REACT_APP_M3_API_BASE_URL=http://localhost:8081/api/module3
   ```

4. Start the development server:
   ```bash
   npm start
   ```
   The frontend starts on **http://localhost:3000**

---

## Environment Variables

### Frontend `.env`

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_BASE_URL` | `http://localhost:8081/api` | Backend API base URL |
| `REACT_APP_M3_API_BASE_URL` | `http://localhost:8081/api/module3` | Module 3 ticketing API |

### Backend `application.properties`

| Property | Description |
|---|---|
| `spring.data.mongodb.uri` | MongoDB connection string |
| `spring.security.oauth2.client.registration.google.client-id` | Google OAuth2 client ID |
| `spring.security.oauth2.client.registration.google.client-secret` | Google OAuth2 client secret |
| `jwt.secret` | Secret key for JWT signing |

---

## Features by Module

### Module 1 — Resource Management
- Live analytics dashboard with charts (Recharts)
  - Resource distribution by type (doughnut chart)
  - Most booked resources (bar chart)
  - Booking status summary (bar chart)
  - Booking trend over 6 months (line chart)
  - Peak booking hours (bar chart)
  - Top 5 most used resources table
- Create, view, update, and manage campus resources
- Filter resources by type, status, and capacity
- Generate and export reports as CSV or PDF

### Module 2 — Booking System
- Browse available campus resources
- Book resources with date, time, and purpose
- View and manage personal bookings
- Admin panel for approving/rejecting bookings
- Booking analytics for admins

### Module 3 — Support Ticketing
- Role-based workspace: User, Admin, Technician
- Users submit maintenance tickets with image attachments
- Admins triage, assign, and manage the ticket queue
- Technicians update progress and resolve tickets
- Comment threads on tickets
- Standalone ticket creation from home page

### Module 4 — Authentication
- Email/password registration and login
- Google OAuth2 login
- JWT-based session management
- Role-based access control (USER / ADMIN)
- Protected routes per role

---

## API Overview

| Base Path | Module | Description |
|---|---|---|
| `/api/resources` | M1 | Campus resource CRUD |
| `/api/m2/bookings` | M2 | Booking management |
| `/api/m2/bookings/analytics` | M2 | Booking analytics |
| `/api/module3/tickets` | M3 | Ticket management |
| `/api/module3/technicians` | M3 | Technician management |
| `/api/auth/register` | M4 | User registration |
| `/api/auth/login` | M4 | User login |
| `/oauth2/callback` | M4 | Google OAuth2 callback |

---

## Screenshots

> Dashboard, resource browser, booking form, ticketing workspace, and analytics charts are all accessible after running the application locally.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## License

This project was developed as part of a university module assignment.
