const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'payroll_system'
};

async function setupDatabase() {
    let db;
    try {
        db = await mysql.createConnection(dbConfig); 

        const sqlFile = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
        const statements = sqlFile.split(';').filter(statement => statement.trim());

        for (const statement of statements) {
            try {
                if (statement.trim()) {
                    await db.query(statement); 
                }
            } catch (queryError) {
                console.error('Error executing query:', queryError.message);
            }
        }

        console.log('Database setup completed successfully!');
    } catch (error) {
        console.error('Error setting up database:', error.message);
    } finally {
        if (db) {
            await db.end(); 
        }
    }
}

setupDatabase();
