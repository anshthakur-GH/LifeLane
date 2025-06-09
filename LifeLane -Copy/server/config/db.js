import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: 'containers-us-west-207.railway.app',
    user: 'root',
    password: 'HVPkaTeUeCQyMaURvPgfPyfGoGYqzOzG',
    database: 'railway',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: true
    }
});

export default pool; 