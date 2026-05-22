# 💳 BillJoy — Production-Grade FinTech Dashboard

BillJoy is a comprehensive Bill Payment and Management System built with a focus on modern UI/UX, scalability, and robust security. It features a complete **Admin Management Panel** and a **User Dashboard** for seamless financial tracking.

---

## 🚀 Key Features

### 🏛️ Admin Management
- **Centralized Dashboard**: Real-time analytics for total users, revenue KPIs, and bill distribution.
- **User Management**: Searchable directory to manage user roles and account statuses.
- **Bill Assignment**: Create and assign recurring or one-time bills to specific users.
- **⚡ Demo Data Generator**: One-click generation of test bills for development and testing.
- **Revenue Analytics**: Detailed charting of monthly revenue trends and payment method breakdowns.

### 👤 User Experience
- **Interactive Dashboard**: Personalspending trends, upcoming due dates, and recent activity.
- **Bill Due Calendar**: Calendar-based visualization of upcoming financial obligations.
- **Secure Payments**: Integrated payment gateway with support for Cards, UPI, and Bank Transfers.
- **Notification System**: Real-time alerts for new bills and payment confirmations.

---

## 🛠️ Technology Stack

### Frontend (React)
- **Framework**: `React 18` + `Vite` (for ultra-fast development)
- **Language**: `TypeScript` (Strictly Typed)
- **Styling**: `Tailwind CSS` + `shadcn/ui` (Premium FinTech aesthetic)
- **State Management**: `@tanstack/react-query` (Server state & caching)
- **Charts**: `Recharts` (Interactive analytics)
- **Architecture**: **Feature-Sliced Design (FSD)** for modularity and scaling.

### Backend (Spring Boot)
- **Framework**: `Spring Boot 3.2.x`
- **Security**: `Spring Security` + `JWT Authentication`
- **Database**: `MySQL` (Production) / `H2` (Development)
- **ORM**: `Spring Data JPA` (Hibernate)

---

## 📂 Project Structure (Frontend)

The frontend follows the **Feature-Sliced Design** pattern:
- `src/app`: Global configuration, providers, and routing.
- `src/features`: Modular features (Admin, Auth, Dashboard, Bills, Payments).
- `src/components`: Shared UI components (Layout, UI primitives, Charts).
- `src/services`: API interaction layer.
- `src/utils`: Formatting and global utilities.

---

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Java JDK 17+](https://adoptium.net/)
- [Maven](https://maven.apache.org/)

### 1. Backend Setup
```bash
cd backend
mvn spring-boot:run
```
*Backend runs on `http://localhost:8080`*

### 2. Frontend Setup
```bash
# In the root directory
npm install
npm run dev
```
*Frontend runs on `http://localhost:8081`*

---

## 🔐 Security & Bug Fixes
- **CORS Resolution**: Configured to handle preflight `OPTIONS` requests allowed through the security filter chain.
- **JWT Protection**: All sensitive endpoints require a valid Bearer token.
- **Role-Based Access**: Strict separation between `ADMIN` and `USER` roles verified at both client and server levels.

---

## 🧪 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **User** | `test@billjoy.com` | `password` |
| **Admin** | `admin@billjoy.com` | `admin123` |

---

Developed with ❤️ for Advanced FinTech Management.
    