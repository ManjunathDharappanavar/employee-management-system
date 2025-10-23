# Employee Attendance & Payroll Management System

A digital solution to track employee attendance and payroll in a company.

## Features

- Employee Authentication & Profile Management
- Attendance Marking System
- Automated Salary Calculation
- Overtime Calculations

## Technologies Used

- Frontend: HTML, CSS, JavaScript (Vue.js)
- Backend: Node.js, Express.js
- Database: MySQL

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn package manager

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the MySQL database:
   ```sql
   CREATE DATABASE payroll_system;
   USE payroll_system;

   CREATE TABLE employees (
       id INT PRIMARY KEY AUTO_INCREMENT,
       name VARCHAR(100) NOT NULL,
       email VARCHAR(100) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       base_salary DECIMAL(10,2) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE attendance (
       id INT PRIMARY KEY AUTO_INCREMENT,
       employee_id INT NOT NULL,
       date DATE NOT NULL,
       status ENUM('Present', 'Absent', 'Late') NOT NULL,
       overtime_hours DECIMAL(5,2) DEFAULT 0,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (employee_id) REFERENCES employees(id),
       UNIQUE KEY unique_attendance (employee_id, date)
   );
   ```

4. Update the database connection details in `server.js` if needed:
   ```javascript
   const db = mysql.createConnection({
       host: 'localhost',
       user: 'your_username',
       password: 'your_password',
       database: 'payroll_system'
   });
   ```

5. Start the server:
   ```bash
   npm start
   ```

6. Open the application in your browser:
   ```
   http://localhost:3000
   ```

## API Endpoints

- POST `/api/auth/login` - Employee login
- GET `/api/auth/validate` - Validate JWT token
- GET `/api/dashboard` - Get dashboard data
- POST `/api/attendance` - Mark attendance

## Security Features

- JWT-based authentication
- Password hashing using bcrypt
- CORS enabled
- Input validation
- SQL injection prevention

## Development

To run the application in development mode with auto-reload:
```bash
npm run dev
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 