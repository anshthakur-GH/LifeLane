import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const dbConfig = {
    host: 'containers-us-west-207.railway.app',
    user: 'root',
    password: 'HVPkaTeUeCQyMaURvPgfPyfGoGYqzOzG',
    database: 'railway',
    port: 3306
};

const createTables = `
-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Emergency Requests table
CREATE TABLE IF NOT EXISTS emergency_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    emergency_type VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    image_url VARCHAR(255),
    audio_url VARCHAR(255),
    status ENUM('pending', 'in_progress', 'resolved') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Admins table
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Emergency Response table
CREATE TABLE IF NOT EXISTS emergency_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    admin_id INT NOT NULL,
    response_type VARCHAR(100) NOT NULL,
    notes TEXT,
    status ENUM('assigned', 'in_progress', 'completed') DEFAULT 'assigned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES emergency_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);`;

async function setupDatabase() {
    try {
        // Create connection
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to the database successfully!');

        // Create tables
        console.log('Creating tables...');
        await connection.query(createTables);
        console.log('Tables created successfully!');

        // Create admin user
        const adminPassword = 'admin123'; // Change this to your desired admin password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        const createAdmin = `
        INSERT INTO admins (email, password, full_name, role)
        VALUES ('admin@example.com', ?, 'Admin User', 'super_admin')
        ON DUPLICATE KEY UPDATE password = ?;
        `;

        await connection.query(createAdmin, [hashedPassword, hashedPassword]);
        console.log('Admin user created successfully!');
        console.log('Admin credentials:');
        console.log('Email: admin@example.com');
        console.log('Password:', adminPassword);

        // Close connection
        await connection.end();
        console.log('Database setup completed successfully!');
    } catch (error) {
        console.error('Error setting up database:', error);
    }
}

setupDatabase(); 