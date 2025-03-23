# Loan Application System

## Introduction
A comprehensive loan application and management system that enables users to apply for loans, track their applications, manage repayments, and access their financial information securely. The system provides both user and admin interfaces for efficient loan processing and management.

## Project Type
Fullstack

## Directory Structure
```
project/
├─ backend/
│  ├─ middleware/
│  │  └─ auth.js
│  ├─ models/
│  │  ├─ Loan.js
│  │  ├─ LoanApplication.js
│  │  └─ User.js
│  ├─ routes/
│  │  ├─ auth.js
│  │  ├─ loans.js
│  │  └─ users.js
│  └─ server.js
├─ client/
   ├─ src/
   │  ├─ components/
   │  ├─ context/
   │  ├─ utils/
   │  └─ App.jsx
   └─ package.json
```

## Features
- User Authentication and Authorization
  - Secure registration with personal and financial information
  - JWT-based authentication
  - Role-based access control (User/Admin)

- User Dashboard
  - Profile management
  - Loan application status tracking
  - Repayment schedule viewing
  - Financial information management

- Loan Management
  - Multiple loan type support
  - Loan application submission
  - Application status tracking
  - Document upload capability

- Admin Features
  - Loan application review
  - User management
  - System monitoring

## Design Decisions & Assumptions
- JWT for stateless authentication
- React with Material-UI for consistent UI/UX
- MongoDB for flexible document storage
- RESTful API architecture
- Secure storage of sensitive financial information
- Modular component structure for maintainability

## Installation & Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
# Create .env file with required environment variables
npm start
```

Required Environment Variables (.env):
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Usage

### User Registration
1. Navigate to /register
2. Fill in personal details
3. Provide financial information
4. Submit registration form

### Loan Application
1. Log in to your account
2. Navigate to "Apply for Loan"
3. Fill in loan application details
4. Upload required documents
5. Submit application

### Track Application
1. Log in to your dashboard
2. View "My Applications"
3. Check status and updates

## Credentials

### User Account
- Email: user@example.com
- Password: user123

### Admin Account
- Email: admin@example.com
- Password: admin123

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/auth/validate - Validate token

### User Management
- GET /api/users/me - Get user profile
- PUT /api/users/me - Update user profile

### Loan Management
- POST /api/loans - Create loan application
- GET /api/loans - Get user's loans
- GET /api/loans/:id - Get specific loan details
- PUT /api/loans/:id - Update loan application

### Admin Routes
- GET /api/admin/users - Get all users
- GET /api/admin/loans - Get all loans
- PUT /api/admin/loans/:id - Update loan status

## Technology Stack

### Frontend
- React.js
- Material-UI
- React Router
- Axios
- React Context (State Management)

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Mongoose ODM

### Development Tools
- Vite (Build Tool)
- ESLint
- Git Version Control