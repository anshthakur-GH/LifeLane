import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Successfully connected to the database!');
        
        // Test query
        const [rows] = await connection.execute('SELECT 1');
        console.log('Test query result:', rows);

        await connection.end();
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}

testConnection(); 