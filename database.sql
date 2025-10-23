CREATE DATABASE IF NOT EXISTS payroll_system;
USE payroll_system;

CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    base_salary DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Late') NOT NULL,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    check_in TIME,
    check_out TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE KEY unique_attendance (employee_id, date)
);

CREATE TABLE IF NOT EXISTS overtime_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration DECIMAL(5,2),
    status ENUM('Active', 'Completed') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_overtime_employee ON overtime_sessions(employee_id);
CREATE INDEX idx_overtime_date ON overtime_sessions(date);
CREATE INDEX idx_overtime_status ON overtime_sessions(status);

-- Corrected Trigger (Without DELIMITER)
CREATE TRIGGER before_attendance_insert
BEFORE INSERT ON attendance
FOR EACH ROW
BEGIN
    IF NEW.date IS NULL OR NEW.date = '' THEN
        SET NEW.date = CURDATE();
    END IF;
END;
