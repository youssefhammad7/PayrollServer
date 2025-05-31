# Payroll System Frontend

This directory contains the frontend applications for the Payroll Management System.

## Project Structure

```
frontend/
├── payroll-web-app/          # Main React application
├── payroll-shared/           # Shared utilities and types
└── README.md                 # This file
```

## Applications

### payroll-web-app
- **Technology**: React 18 + TypeScript + Vite
- **UI Framework**: Material-UI (MUI)
- **State Management**: Zustand + React Query
- **Routing**: React Router
- **HTTP Client**: Axios

### payroll-shared
- **Purpose**: Shared TypeScript types, constants, and utilities
- **Exports**: API types, application constants, validation schemas

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install main app dependencies:**
```bash
cd payroll-web-app
npm install
```

2. **Install shared package dependencies:**
```bash
cd ../payroll-shared
npm install
```

### Development

1. **Start the development server:**
```bash
cd payroll-web-app
npm run dev
```

2. **Configure API endpoint:**
Create a `.env.local` file in `payroll-web-app/`:
```env
VITE_API_BASE_URL=https://localhost:7001/api
```

### Build for Production

```bash
cd payroll-web-app
npm run build
```

## Architecture Overview

### Key Features Implemented
- ✅ Authentication system with JWT
- ✅ Role-based access control
- ✅ API client with interceptors
- ✅ Shared type definitions
- ✅ Application constants

### Next Steps in Development
1. Create main layout components
2. Implement login screen
3. Build dashboard
4. Add employee management screens
5. Implement reports functionality

## API Integration

The frontend connects to the .NET Core backend API running on `https://localhost:7001/api`.

### Authentication Flow
1. User submits login credentials
2. Backend returns JWT token
3. Token stored in localStorage
4. All API requests include Bearer token
5. Automatic redirect to login on 401 errors

### Role-Based Authorization
- **Admin**: Full access to all features
- **HR Clerk**: Employee, payroll, and report management
- **Read-Only**: View-only access to employees and reports 