const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));


const db = mysql.createConnection({
   host: process.env.DB_HOST ,
    user: process.env.DB_USER ,
    password: process.env.DB_PASSWORD ,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

const JWT_SECRET = 'your-secret-key';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};


app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password, baseSalary } = req.body;

        if (!name || !email || !password || !baseSalary) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const salary = parseFloat(baseSalary);
        if (isNaN(salary) || salary <= 0) {
            return res.status(400).json({ message: 'Invalid base salary' });
        }

        const [existingUser] = await db.promise().query(
            'SELECT id FROM employees WHERE email = ?',
            [email.toLowerCase()]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'This email is already registered. Please use a different email or login.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.promise().query(
            'INSERT INTO employees (name, email, password, base_salary) VALUES (?, ?, ?, ?)',
            [name.trim(), email.toLowerCase(), hashedPassword, salary]
        );

        res.status(201).json({
            message: 'Signup successful! Please login with your credentials.',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error during signup. Please try again.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const [users] = await db.promise().query(
            'SELECT id, name, email, password, base_salary FROM employees WHERE email = ?',
            [email.toLowerCase()]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'No account found with this email. Please sign up first.' });
        }

        const user = users[0];

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Incorrect password. Please try again.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                baseSalary: user.base_salary
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login. Please try again.' });
    }
});


app.get('/api/auth/validate', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.promise().query(
            'SELECT id, name, email, base_salary FROM employees WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];
        res.json({ user });
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(500).json({ message: 'Error validating token' });
    }
});


// app.get('/api/dashboard', authenticateToken, async (req, res) => {
//     try {
//         const today = new Date().toISOString().split('T')[0];
        

//         const [attendanceResults] = await db.promise().query(
//             'SELECT status FROM attendance WHERE employee_id = ? AND date = ?',
//             [req.user.id, today]
//         );

//         const attendanceStatus = attendanceResults.length > 0 ? attendanceResults[0].status : 'Not Marked';

//         const [salaryResults] = await db.promise().query(
//             'SELECT base_salary FROM employees WHERE id = ?',
//             [req.user.id]
//         );

//         if (salaryResults.length === 0) {
//             return res.status(404).json({ message: 'Employee not found' });
//         }

//         const baseSalary = salaryResults[0].base_salary;
//         const [overtimeResults] = await db.promise().query(
//             'SELECT COALESCE(SUM(overtime_hours), 0) as total_overtime FROM attendance WHERE employee_id = ? AND MONTH(date) = MONTH(CURRENT_DATE()) AND YEAR(date) = YEAR(CURRENT_DATE())',
//             [req.user.id]
//         );

//         const overtimeHours = overtimeResults[0].total_overtime;


//         const overtimePay = overtimeHours * (baseSalary / 160) * 1.5; 
//         const monthlySalary = baseSalary + overtimePay;

//         res.json({
//             attendanceStatus,
//             // baseSalary: baseSalary.toFixed(2),
//             baseSalary: Number(baseSalary).toFixed(2),
//             monthlySalary: Number(monthlySalary).toFixed(2),
//             overtimeHours: parseFloat(overtimeHours).toFixed(2)
//         });
//     } catch (error) {
//         console.error('Dashboard data error:', error);
//         res.status(500).json({ message: 'Error fetching dashboard data' });
//     }
// });


app.get('/api/dashboard', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Attendance status
        const [attendanceResults] = await db.promise().query(
            'SELECT status FROM attendance WHERE employee_id = ? AND date = ?',
            [req.user.id, today]
        );
        const attendanceStatus = attendanceResults.length > 0 ? attendanceResults[0].status : 'Not Marked';

        // Base salary
        const [salaryResults] = await db.promise().query(
            'SELECT base_salary FROM employees WHERE id = ?',
            [req.user.id]
        );

        if (salaryResults.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const baseSalary = parseFloat(salaryResults[0].base_salary);

        // Overtime this month
        const [overtimeResults] = await db.promise().query(
            'SELECT COALESCE(SUM(overtime_hours), 0) as total_overtime FROM attendance WHERE employee_id = ? AND MONTH(date) = MONTH(CURRENT_DATE()) AND YEAR(date) = YEAR(CURRENT_DATE())',
            [req.user.id]
        );

        const overtimeHours = parseFloat(overtimeResults[0].total_overtime) || 0;
        const overtimePay = overtimeHours * (baseSalary / 160) * 1.5;
        const monthlySalary = baseSalary + overtimePay;

        res.json({
            attendanceStatus,
            baseSalary: baseSalary.toFixed(2),
            monthlySalary: monthlySalary.toFixed(2),
            overtimeHours: overtimeHours.toFixed(2)
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ message: 'Error fetching dashboard data' });
    }
});


app.post('/api/attendance', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status || !['Present', 'Absent', 'Late'].includes(status)) {
            return res.status(400).json({ message: 'Invalid attendance status' });
        }

        const today = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toTimeString().split(' ')[0]; // Get current time in HH:MM:SS format

        const [existingAttendance] = await db.promise().query(
            'SELECT id, status FROM attendance WHERE employee_id = ? AND date = ?',
            [req.user.id, today]
        );

        if (existingAttendance.length > 0) {
            await db.promise().query(
                'UPDATE attendance SET status = ?, check_in = ? WHERE employee_id = ? AND date = ?',
                [status, currentTime, req.user.id, today]
            );
        } else {
            await db.promise().query(
                'INSERT INTO attendance (employee_id, date, status, check_in) VALUES (?, ?, ?, ?)',
                [req.user.id, today, status, currentTime]
            );
        }

        const [updatedAttendance] = await db.promise().query(
            'SELECT status, check_in FROM attendance WHERE employee_id = ? AND date = ?',
            [req.user.id, today]
        );

        res.json({ 
            message: 'Attendance marked successfully',
            status: status,
            checkIn: updatedAttendance[0].check_in,
            date: today
        });
    } catch (error) {
        console.error('Attendance marking error:', error);
        res.status(500).json({ message: 'Error marking attendance' });
    }
});

app.get('/api/attendance/visibility', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const [attendance] = await db.promise().query(
            'SELECT status FROM attendance WHERE employee_id = ? AND date = ?',
            [req.user.id, today]
        );

        const isMarked = attendance.length > 0;
        res.json({ isMarked });
    } catch (error) {
        console.error('Attendance visibility error:', error);
        res.status(500).json({ message: 'Error checking attendance visibility' });
    }
});

app.post('/api/overtime/start', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        // const startTime = new Date().toISOString();
        const startTime = new Date().toISOString().slice(0, 19).replace('T', ' ');


        const [existingSession] = await db.promise().query(
            'SELECT id FROM overtime_sessions WHERE employee_id = ? AND date = ? AND status = "Active"',
            [req.user.id, today]
        );

        if (existingSession.length > 0) {
            return res.status(400).json({ message: 'An overtime session is already active' });
        }

        await db.promise().query(
            'INSERT INTO overtime_sessions (employee_id, date, start_time, status) VALUES (?, ?, ?, "Active")',
            [req.user.id, today, startTime]
        );

        res.json({ message: 'Overtime started successfully' });
    } catch (error) {
        console.error('Start overtime error:', error);
        res.status(500).json({ message: 'Error starting overtime' });
    }
});

// app.post('/api/overtime/stop', authenticateToken, async (req, res) => {
//     try {
//         const today = new Date().toISOString().split('T')[0];
//         const endTime = new Date();

//         const [activeSession] = await db.promise().query(
//             'SELECT id, start_time FROM overtime_sessions WHERE employee_id = ? AND date = ? AND status = "Active"',
//             [req.user.id, today]
//         );

//         if (activeSession.length === 0) {
//             return res.status(400).json({ message: 'No active overtime session found' });
//         }
//         const startTime = new Date(activeSession[0].start_time);
//         const duration = (endTime - startTime) / (1000 * 60 * 60);

//         // await db.promise().query(
//         //     'UPDATE overtime_sessions SET end_time = ?, duration = ?, status = "Completed" WHERE id = ?',
//         //     [endTime.toISOString(), duration, activeSession[0].id]
//         // );

//         const formattedEndTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
// await db.promise().query(
//     'UPDATE overtime_sessions SET end_time = ?, duration = ?, status = "Completed" WHERE id = ?',
//     [formattedEndTime, duration, activeSession[0].id]
// );


//         // const [currentOvertime] = await db.promise().query(
//         //     'SELECT COALESCE(overtime_hours, 0) as current_overtime FROM attendance WHERE employee_id = ? AND date = ?',
//         //     [req.user.id, today]
//         // );

//         // const newOvertimeHours = (currentOvertime[0].current_overtime || 0) + duration;

 
//         // await db.promise().query(
//         //     'UPDATE attendance SET overtime_hours = ? WHERE employee_id = ? AND date = ?',
//         //     [newOvertimeHours, req.user.id, today]
//         // );

// const [currentOvertimeResult] = await db.promise().query(
//     'SELECT COALESCE(overtime_hours, 0) as current_overtime FROM attendance WHERE employee_id = ? AND date = ?',
//     [req.user.id, today]
// );

// const currentOvertime = parseFloat(currentOvertimeResult[0].current_overtime) || 0;
// const newOvertimeHours = currentOvertime + parseFloat(duration);

// await db.promise().query(
//     'UPDATE attendance SET overtime_hours = ? WHERE employee_id = ? AND date = ?',
//     [newOvertimeHours.toFixed(2), req.user.id, today]
// );



//         res.json({ 
//             message: 'Overtime stopped successfully',
//             overtimeHours: newOvertimeHours.toFixed(2)
//         });
//     } catch (error) {
//         console.error('Stop overtime error:', error);
//         res.status(500).json({ message: 'Error stopping overtime' });
//     }
// });


app.post('/api/overtime/stop', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const endTime = new Date();

        const [activeSession] = await db.promise().query(
            'SELECT id, start_time FROM overtime_sessions WHERE employee_id = ? AND date = ? AND status = "Active"',
            [req.user.id, today]
        );

        if (activeSession.length === 0) {
            return res.status(400).json({ message: 'No active overtime session found' });
        }

        const startTime = new Date(activeSession[0].start_time);
        const duration = (endTime - startTime) / (1000 * 60 * 60); // hours

        const formattedEndTime = endTime.toISOString().slice(0, 19).replace('T', ' ');

        // Complete overtime session
        await db.promise().query(
            'UPDATE overtime_sessions SET end_time = ?, duration = ?, status = "Completed" WHERE id = ?',
            [formattedEndTime, duration, activeSession[0].id]
        );

        // Update attendance overtime
        const [currentOvertimeResult] = await db.promise().query(
            'SELECT COALESCE(overtime_hours, 0) as current_overtime FROM attendance WHERE employee_id = ? AND date = ?',
            [req.user.id, today]
        );

        const currentOvertime = parseFloat(currentOvertimeResult[0].current_overtime) || 0;
        const newOvertimeHours = currentOvertime + parseFloat(duration);

        await db.promise().query(
            'UPDATE attendance SET overtime_hours = ? WHERE employee_id = ? AND date = ?',
            [newOvertimeHours.toFixed(2), req.user.id, today]
        );

        res.json({
            message: 'Overtime stopped successfully',
            overtimeHours: newOvertimeHours.toFixed(2)
        });
    } catch (error) {
        console.error('Stop overtime error:', error);
        res.status(500).json({ message: 'Error stopping overtime' });
    }
});

app.get('/api/overtime/history', authenticateToken, async (req, res) => {
    try {
        const [history] = await db.promise().query(
            `SELECT 
                id,
                date,
                start_time,
                end_time,
                duration,
                status,
                created_at
            FROM overtime_sessions 
            WHERE employee_id = ? 
            ORDER BY date DESC, start_time DESC`,
            [req.user.id]
        );

        const formattedHistory = history.map(record => ({
            ...record,
            date: new Date(record.date).toLocaleDateString(),
            start_time: new Date(record.start_time).toLocaleTimeString(),
            end_time:  new Date(record.end_time).toLocaleTimeString(),
            duration: record.duration ? parseFloat(record.duration).toFixed(2) : '0.00',
            status: record.status
        }));

        res.json({ history: formattedHistory });
    } catch (error) {
        console.error('Get overtime history error:', error);
        res.status(500).json({ message: 'Error fetching overtime history' });
    }
});

// app.get('/api/profile', authenticateToken, async (req, res) => {
//     try {
//         console.log('Fetching profile for user ID:', req.user.id);

//         const [profile] = await db.promise().query(
//             `SELECT 
//                 id,
//                 name,
//                 email,
//                 base_salary,
//                 created_at
//             FROM employees 
//             WHERE id = ?`,
//             [req.user.id]
//         );

//         if (profile.length === 0) {
//             console.log('No profile found for user ID:', req.user.id);
//             return res.status(404).json({ message: 'Profile not found' });
//         }

//         const [attendanceStats] = await db.promise().query(
//             `SELECT 
//                 COUNT(CASE WHEN status = 'Present' THEN 1 END) as present_days,
//                 COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent_days,
//                 COALESCE(SUM(overtime_hours), 0) as total_overtime,
//                 COUNT(*) as total_days
//             FROM attendance 
//             WHERE employee_id = ? 
//             AND MONTH(date) = MONTH(CURRENT_DATE()) 
//             AND YEAR(date) = YEAR(CURRENT_DATE())`,
//             [req.user.id]
//         );
//         const today = new Date().toISOString().split('T')[0];
//         const [todayAttendance] = await db.promise().query(
//             'SELECT status, check_in, check_out FROM attendance WHERE employee_id = ? AND date = ?',
//             [req.user.id, today]
//         );


//         const [recentAttendance] = await db.promise().query(
//             `SELECT 
//                 date,
//                 status,
//                 check_in,
//                 check_out,
//                 overtime_hours
//             FROM attendance 
//             WHERE employee_id = ? 
//             ORDER BY date DESC 
//             LIMIT 5`,
//             [req.user.id]
//         );

//         const baseSalary = parseFloat(profile[0].base_salary);
//         const overtimeHours = parseFloat(attendanceStats[0].total_overtime);
//         const hourlyRate = baseSalary / 160;
//         const overtimePay = overtimeHours * hourlyRate * 1.5;
//         const monthlySalary = baseSalary + overtimePay;

//         const formattedProfile = {
//             id: profile[0].id,
//             name: profile[0].name,
//             email: profile[0].email,
//             created_at: new Date(profile[0].created_at).toLocaleDateString(),
//             // base_salary: baseSalary.toFixed(2),
//             base_salary: Number(baseSalary).toFixed(2),
//             monthly_salary: monthlySalary.toFixed(2),
//             overtime_pay: overtimePay.toFixed(2),
//             attendance: {
//                 present_days: attendanceStats[0].present_days || 0,
//                 absent_days: attendanceStats[0].absent_days || 0,
//                 total_overtime: overtimeHours.toFixed(2),
//                 total_days: attendanceStats[0].total_days || 0,
//                 today_status: todayAttendance.length > 0 ? todayAttendance[0].status : 'Not Marked',
//                 today_check_in: todayAttendance.length > 0 ? todayAttendance[0].check_in : null,
//                 today_check_out: todayAttendance.length > 0 ? todayAttendance[0].check_out : null,
//                 recent_history: recentAttendance.map(record => ({
//                     // date: new Date(record.date).toISOString(),
//                     date: record.date ? new Date(record.date + 'Z').toISOString() : null,
//                     status: record.status,
//                     check_in: record.check_in ? new Date(record.check_in + 'Z').toISOString() : null,
//                     check_out: record.check_out ? new Date(record.check_out + 'Z').toISOString() : null,
//                     overtime: record.overtime_hours ? record.overtime_hours.toFixed(2) : '0.00'
//                 }))
//             }
//         };

//         console.log('Sending profile data:', formattedProfile);
//         res.json({ profile: formattedProfile });
//     } catch (error) {
//         console.error('Get profile error:', error);
//         res.status(500).json({ message: 'Error fetching profile data' });
//     }
// });


app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const [profile] = await db.promise().query(
            `SELECT id, name, email, base_salary, created_at
             FROM employees WHERE id = ?`,
            [req.user.id]
        );

        if (profile.length === 0) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const [attendanceStats] = await db.promise().query(
            `SELECT 
                COUNT(CASE WHEN status = 'Present' THEN 1 END) as present_days,
                COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent_days,
                COALESCE(SUM(overtime_hours), 0) as total_overtime,
                COUNT(*) as total_days
             FROM attendance 
             WHERE employee_id = ? AND MONTH(date) = MONTH(CURRENT_DATE()) AND YEAR(date) = YEAR(CURRENT_DATE())`,
            [req.user.id]
        );

        const today = new Date().toISOString().split('T')[0];
        const [todayAttendance] = await db.promise().query(
            'SELECT status, check_in, check_out FROM attendance WHERE employee_id = ? AND date = ?',
            [req.user.id, today]
        );

        const [recentAttendance] = await db.promise().query(
            `SELECT date, status, check_in, check_out, overtime_hours
             FROM attendance 
             WHERE employee_id = ?
             ORDER BY date DESC
             LIMIT 5`,
            [req.user.id]
        );

        const baseSalary = parseFloat(profile[0].base_salary);
        const overtimeHours = parseFloat(attendanceStats[0].total_overtime);
        const hourlyRate = baseSalary / 160;
        const overtimePay = overtimeHours * hourlyRate * 1.5;
        const monthlySalary = baseSalary + overtimePay;

        const formattedProfile = {
            id: profile[0].id,
            name: profile[0].name,
            email: profile[0].email,
            created_at: profile[0].created_at ? new Date(profile[0].created_at).toLocaleDateString() : null,
            base_salary: baseSalary.toFixed(2),
            monthly_salary: monthlySalary.toFixed(2),
            overtime_pay: overtimePay.toFixed(2),
            attendance: {
                present_days: attendanceStats[0].present_days || 0,
                absent_days: attendanceStats[0].absent_days || 0,
                total_overtime: overtimeHours.toFixed(2),
                total_days: attendanceStats[0].total_days || 0,
                today_status: todayAttendance.length > 0 ? todayAttendance[0].status : 'Not Marked',
                today_check_in: todayAttendance.length > 0 && todayAttendance[0].check_in ? new Date(todayAttendance[0].check_in).toLocaleTimeString() : null,
                today_check_out: todayAttendance.length > 0 && todayAttendance[0].check_out ? new Date(todayAttendance[0].check_out).toLocaleTimeString() : null,
                recent_history: recentAttendance.map(record => ({
                    date: record.date ? new Date(record.date).toLocaleDateString() : null,
                    status: record.status,
                    check_in: record.check_in ? new Date(record.check_in).toLocaleTimeString() : null,
                    check_out: record.check_out ? new Date(record.check_out).toLocaleTimeString() : null,
                    overtime: record.overtime_hours !== null ? parseFloat(record.overtime_hours).toFixed(2) : '0.00'
                }))
            }
        };

        res.json({ profile: formattedProfile });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Error fetching profile data' });
    }
});

app.delete('/api/employee/delete', authenticateToken, async (req, res) => {
    try {
        await db.promise().beginTransaction();

        await db.promise().query(
            'DELETE FROM overtime_sessions WHERE employee_id = ?',
            [req.user.id]
        );

        await db.promise().query(
            'DELETE FROM attendance WHERE employee_id = ?',
            [req.user.id]
        );
        await db.promise().query(
            'DELETE FROM employees WHERE id = ?',
            [req.user.id]
        );
        await db.promise().commit();

        res.json({ message: 'Employee account deleted successfully' });
    } catch (error) {
        await db.promise().rollback();
        console.error('Delete employee error:', error);
        res.status(500).json({ message: 'Error deleting employee account' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});