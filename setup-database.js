const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();


const dbConfig = {
    host: process.env.DB_HOST ,
    user: process.env.DB_USER ,
    password: process.env.DB_PASSWORD ,
    database: process.env.DB_NAME 
};

async function setupDatabase() {
    let db;
    try {
        db = await mysql.createConnection(dbConfig); 

        // Read the entire SQL file
        let sqlFile = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');

        // Handle MariaDB custom delimiters (e.g., DELIMITER $$)
        sqlFile = sqlFile.replace(/DELIMITER \$\$/g, '').replace(/\$\$/g, ';');

        const statements = sqlFile.split(';').map(stmt => stmt.trim()).filter(stmt => stmt);

        for (const statement of statements) {
            try {
                await db.query(statement);
            } catch (queryError) {
                console.error('Error executing query:', queryError.message, '\nQuery:', statement);
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
