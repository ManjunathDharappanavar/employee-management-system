# employee-management-system
I made a employee management system which was the task given in a hackathon named TECHNOVA organised by KLE RLS Belgavi

# <div align="center">👥 Employee Attendance & Payroll System</div>

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/Vue.js-4FC08D?style=flat&logo=vue.js&logoColor=white" alt="Vue.js">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-404D59?style=flat&logo=express&logoColor=white" alt="Express.js">
  <img src="https://img.shields.io/badge/MySQL-00000F?style=flat&logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/Bootstrap-563D7C?style=flat&logo=bootstrap&logoColor=white" alt="Bootstrap">
</div>

<div align="center">
  <h3>🎯 Complete employee management solution with attendance tracking and payroll automation</h3>
  <p><em>Streamline • Automate • Monitor • Calculate payroll efficiently</em></p>
</div>

<br>

---

## 📋 Table of Contents

<details>
<summary>Click to expand</summary>

- [✨ Features](#-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [🔧 Configuration](#-configuration)
- [💼 Core Functionality](#-core-functionality)
- [🔐 Authentication & Security](#-authentication--security)
- [📊 Database Schema](#-database-schema)
- [🎨 User Interface](#-user-interface)
- [📱 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)

</details>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 👤 **Employee Management**
- Secure user registration and authentication
- Comprehensive employee profiles
- JWT-based session management
- Account management and deletion

</td>
<td width="50%">

### ⏰ **Attendance Tracking**
- Daily attendance marking system
- Real-time attendance status monitoring
- Comprehensive attendance history
- Monthly attendance statistics

</td>
</tr>
<tr>
<td width="50%">

### 💰 **Payroll Automation**
- Automated salary calculations
- Base salary management
- Overtime pay computation
- Monthly payroll summaries

</td>
<td width="50%">

### 🕐 **Overtime Management**
- Real-time overtime tracking
- Start/stop overtime sessions
- Overtime history records
- Automated overtime pay calculation

</td>
</tr>
</table>

---

## 🏗️ System Architecture

The application follows a modern three-tier architecture pattern designed for scalability and maintainability.

### Frontend Layer
**Vue.js 3 with Bootstrap 5** provides a responsive, interactive user interface featuring real-time data updates, modal-based interactions, and comprehensive dashboard functionality. The frontend communicates with the backend through RESTful API calls and implements JWT token-based authentication for secure access control.

### Backend Layer
**Node.js with Express.js** serves as the application server, handling business logic, authentication, and data processing. The backend implements comprehensive API endpoints for user management, attendance tracking, overtime calculation, and payroll processing with robust error handling and input validation.

### Database Layer
**MySQL** provides reliable data persistence with optimized table structures for employees, attendance records, and overtime sessions. The database design supports efficient querying for attendance statistics, payroll calculations, and historical data retrieval.

---

## 🚀 Quick Start

<div align="center">
<img src="https://via.placeholder.com/600x300/4FC08D/FFFFFF?text=Employee+Dashboard+Interface" alt="Employee Dashboard" width="100%" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
</div>

<br>

Get the Employee Management System running locally in minutes:

```bash
# Clone the repository
git clone https://github.com/ManjunathDharappanavar/employee-management-system.git

# Navigate to project directory
cd employee-management-system

# Install backend dependencies
npm install

# Setup database
node setup.js

# Start the server
npm start

# Access the application
# Open your browser and navigate to: http://localhost:3000
```

<div align="center">
  <a href="#installation">
    <img src="https://img.shields.io/badge/Get%20Started-Install%20Now-success?style=for-the-badge&logo=rocket" alt="Get Started">
  </a>
</div>

---

## 📦 Installation

### Prerequisites

Ensure your development environment includes the following components:

**Required Software:**
- Node.js (version 14.0 or higher)
- MySQL Server (version 8.0 or higher)
- npm or yarn package manager
- Modern web browser with JavaScript enabled

### Step-by-Step Installation

**1. Repository Setup**
```bash
git clone https://github.com/ManjunathDharappanavar/employee-management-system.git
cd employee-management-system
```

**2. Dependency Installation**
```bash
npm install
```

**3. Database Configuration**
```bash
# Ensure MySQL server is running
mysql -u root -p

# Create database (if not using setup script)
CREATE DATABASE payroll_system;
```

**4. Database Setup**
```bash
# Run the automated database setup
node setup.js
```

**5. Environment Configuration**
Create a `.env` file in the root directory:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=payroll_system
JWT_SECRET=your_jwt_secret_key
```

**6. Application Launch**
```bash
npm start
```

---

## 🔧 Configuration

### Database Configuration

The application connects to MySQL using the following default configuration:

```javascript
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'payroll_system'
};
```

### Server Configuration

The Express server configuration supports:
- CORS enabled for frontend communication
- JSON request body parsing
- Static file serving for frontend assets
- JWT authentication middleware

### Security Configuration

**Authentication Settings:**
- JWT token expiration: 24 hours
- Password hashing: bcrypt with salt rounds
- Input validation for all API endpoints
- SQL injection prevention through parameterized queries

---

## 💼 Core Functionality

### Employee Dashboard

The dashboard provides comprehensive overview of employee information including current attendance status, monthly salary calculations, overtime hours tracking, and quick access to attendance marking functionality.

### Attendance Management

**Daily Attendance Marking:**
- One-click attendance marking system
- Real-time status updates
- Automatic timestamp recording
- Prevention of duplicate entries

**Attendance Tracking:**
- Monthly attendance statistics
- Historical attendance records
- Attendance percentage calculations
- Visual status indicators

### Overtime Processing

**Session Management:**
- Start and stop overtime sessions
- Real-time duration tracking
- Automatic session completion
- Session history maintenance

**Calculation System:**
- Overtime rate: 1.5x base hourly rate
- Automatic payroll integration
- Monthly overtime summaries
- Duration-based calculations

### Payroll Calculations

**Salary Components:**
- Base monthly salary
- Overtime compensation
- Total monthly earnings
- Detailed pay breakdown

**Calculation Methods:**
- Base hourly rate: Monthly salary ÷ 160 hours
- Overtime rate: Base hourly rate × 1.5
- Total pay: Base salary + overtime compensation

---

## 🔐 Authentication & Security

### User Registration Process

The registration system implements comprehensive validation including email format verification, password strength requirements, and duplicate account prevention. User passwords are securely hashed using bcrypt before database storage.

### Login Authentication

The login system validates user credentials against hashed passwords and generates JWT tokens for session management. Tokens include user identification and expiration timestamps for secure access control.

### Security Measures

**Input Validation:**
- Email format verification
- Password complexity requirements
- Numeric input validation for salary data
- SQL injection prevention through parameterized queries

**Session Management:**
- JWT token-based authentication
- Token expiration handling
- Automatic session validation
- Secure token storage recommendations

---

## 📊 Database Schema

### Tables Structure

**employees Table:**
- Primary key: `id` (AUTO_INCREMENT)
- User identification: `name`, `email`
- Authentication: `password` (hashed)
- Compensation: `base_salary`
- Audit: `created_at`, `updated_at`

**attendance Table:**
- Foreign key: `employee_id` (references employees.id)
- Date tracking: `date`, `check_in`, `check_out`
- Status: `status` (Present/Absent/Late)
- Overtime: `overtime_hours`

**overtime_sessions Table:**
- Session tracking: `employee_id`, `date`
- Time management: `start_time`, `end_time`, `duration`
- Status: `status` (Active/Completed)

### Database Relationships

The schema implements proper foreign key relationships ensuring data integrity and enabling efficient queries for attendance statistics, payroll calculations, and historical reporting.

---

## 🎨 User Interface

### Design Framework

The frontend utilizes Bootstrap 5 for responsive design with Font Awesome icons for visual enhancement. The interface implements a professional color scheme with intuitive navigation and clear information hierarchy.

### Component Architecture

**Navigation System:**
- Responsive navbar with authentication status
- Modal-based login and registration forms
- Profile access and logout functionality

**Dashboard Layout:**
- Grid-based statistics display
- Interactive attendance marking
- Real-time overtime tracking
- Comprehensive data tables

**Modal Interfaces:**
- Authentication forms with validation
- Profile information display
- Account management options
- Confirmation dialogs for critical actions

### Responsive Design

The application provides optimal user experience across desktop, tablet, and mobile devices with adaptive layouts, touch-friendly interfaces, and scalable typography.

---

## 📱 API Documentation

### Authentication Endpoints

**POST /api/auth/signup**
- Purpose: Register new employee account
- Body: `{ name, email, password, baseSalary }`
- Response: User ID and success confirmation

**POST /api/auth/login**
- Purpose: Authenticate existing user
- Body: `{ email, password }`
- Response: JWT token and user information

**GET /api/auth/validate**
- Purpose: Validate current session token
- Headers: `Authorization: Bearer <token>`
- Response: User validation status

### Dashboard Endpoints

**GET /api/dashboard**
- Purpose: Retrieve dashboard statistics
- Authentication: Required
- Response: Attendance status, salary information, overtime data

### Attendance Endpoints

**POST /api/attendance**
- Purpose: Mark daily attendance
- Body: `{ status }`
- Response: Attendance confirmation and timestamp

**GET /api/attendance/visibility**
- Purpose: Check attendance marking status
- Response: Boolean indicating if attendance is marked

### Overtime Endpoints

**POST /api/overtime/start**
- Purpose: Begin overtime session
- Response: Session start confirmation

**POST /api/overtime/stop**
- Purpose: End overtime session
- Response: Session completion and duration

**GET /api/overtime/history**
- Purpose: Retrieve overtime session history
- Response: Paginated overtime records

### Profile Endpoints

**GET /api/profile**
- Purpose: Retrieve comprehensive employee profile
- Response: Personal information, salary data, attendance statistics

**DELETE /api/employee/delete**
- Purpose: Permanently delete employee account
- Response: Account deletion confirmation

---

## 🧪 Testing

### Testing Strategy

Implement comprehensive testing including unit tests for business logic, integration tests for API endpoints, and end-to-end tests for user workflows. Testing should cover authentication flows, attendance marking, overtime calculations, and payroll processing.

### Recommended Testing Tools

- **Jest** for unit and integration testing
- **Supertest** for API endpoint testing
- **Vue Test Utils** for frontend component testing
- **Cypress** for end-to-end testing

---

## 🚀 Deployment

### Production Environment Setup

**Server Requirements:**
- Node.js runtime environment
- MySQL database server
- Process manager (PM2 recommended)
- Reverse proxy (Nginx recommended)

**Environment Variables:**
Configure production environment variables for database connection, JWT secrets, and server configuration.

**Database Migration:**
Execute database setup scripts and ensure proper indexing for production performance.

### Cloud Deployment Options

The application architecture supports deployment on various cloud platforms including AWS, Google Cloud Platform, Azure, and Heroku with appropriate configuration adjustments.

---

## 🤝 Contributing

### Development Guidelines

Contributions should follow established patterns for code organization, maintain consistency with existing authentication flows, and include appropriate error handling and input validation.

### Code Standards

**Backend Development:**
- Use async/await for database operations
- Implement proper error handling and logging
- Follow RESTful API design principles
- Include input validation for all endpoints

**Frontend Development:**
- Maintain Vue.js component structure
- Use Bootstrap classes for consistent styling
- Implement proper error feedback to users
- Follow responsive design principles

**Database Development:**
- Use parameterized queries to prevent SQL injection
- Maintain proper foreign key relationships
- Include appropriate indexes for query performance
- Follow database normalization principles

### Pull Request Process

1. Fork the repository and create a feature branch
2. Implement changes with appropriate testing
3. Update documentation for API changes
4. Ensure all tests pass and code follows established patterns
5. Submit pull request with detailed description of changes

---

## 📈 Performance Considerations

### Database Optimization

Implement appropriate indexes on frequently queried columns, optimize complex queries for attendance statistics, and consider database connection pooling for production environments.

### Frontend Performance

Utilize Vue.js reactive data binding efficiently, implement proper loading states for API calls, and optimize asset loading for improved user experience.

### Security Best Practices

Regularly update dependencies for security patches, implement rate limiting for API endpoints, and ensure proper input sanitization for all user inputs.

---

<div align="center">
  <h3>⭐ Star this repository if you find it valuable for your projects!</h3>
  <p>Built for modern employee management and payroll automation</p>
  
  <a href="#top">
    <img src="https://img.shields.io/badge/Back%20to%20Top-4FC08D?style=for-the-badge&logoColor=white" alt="Back to Top">
  </a>
</div>
