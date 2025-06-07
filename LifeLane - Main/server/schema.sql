-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emergency Requests table
CREATE TABLE IF NOT EXISTS emergency_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  patient_name VARCHAR(100) NOT NULL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'granted', 'dismissed') DEFAULT 'pending',
  problem_description TEXT,
  details TEXT,
  code VARCHAR(32),
  FOREIGN KEY (user_id) REFERENCES users(id)
); 