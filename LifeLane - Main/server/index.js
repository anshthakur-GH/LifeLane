// LifeLane backend - ready for Railway deployment with MySQL and JWT authentication
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from './db.js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const upload = multer();

// Enable CORS for all routes
app.use(cors({
  origin: true, // Allow requests from the same origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// JSON file paths
const emergencyRequestsPath = path.join(__dirname, 'data', 'emergency_requests.json');
const usersPath = path.join(__dirname, 'data', 'users.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// Initialize JSON files if they don't exist
if (!fs.existsSync(emergencyRequestsPath)) {
  fs.writeFileSync(emergencyRequestsPath, JSON.stringify([]));
}
if (!fs.existsSync(usersPath)) {
  fs.writeFileSync(usersPath, JSON.stringify([]));
}

// JWT Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Seed admin user
async function seedAdmin() {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', ['unfazed.services@gmail.com']);
  if (rows.length === 0) {
    const password_hash = await bcrypt.hash('unfazed_24052025', 10);
    await pool.query(
      'INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, ?)',
      ['Admin', 'unfazed.services@gmail.com', password_hash, 1]
    );
    console.log('Admin user seeded');
  }
}
seedAdmin();

// Registration
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) return res.status(400).json({ error: 'Email already exists' });
  const password_hash = await bcrypt.hash(password, 10);
  await pool.query('INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, ?)', [name, email, password_hash, 0]);
  res.status(201).json({ message: 'User registered successfully' });
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
  const user = users[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email, is_admin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, is_admin: user.is_admin, name: user.name, email: user.email });
});

// Create Emergency Request
app.post('/api/emergency-request', authenticateToken, async (req, res) => {
  const { patient_name, problem_description, details } = req.body;
  const user_id = req.user.id;
  const [result] = await pool.query(
    'INSERT INTO emergency_requests (user_id, patient_name, problem_description, details, status, createdAt) VALUES (?, ?, ?, ?, ?, NOW())',
    [user_id, patient_name, problem_description, details, 'pending']
  );
  res.json({ id: result.insertId, message: 'Request received' });
});

// Get requests for logged-in user
app.get('/api/my-requests', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const [requests] = await pool.query(
    'SELECT * FROM emergency_requests WHERE user_id = ? ORDER BY createdAt DESC',
    [userId]
  );
  res.json(requests);
});

// Get all requests (admin)
app.get('/api/emergency-requests', authenticateToken, async (req, res) => {
  if (!req.user.is_admin) return res.sendStatus(403);
  const [requests] = await pool.query(
    'SELECT er.*, u.name as user_name, u.email as user_email FROM emergency_requests er JOIN users u ON er.user_id = u.id ORDER BY er.createdAt DESC'
  );
  res.json(requests);
});

// Update Emergency Request Status (admin)
app.put('/api/emergency-request/:id', authenticateToken, async (req, res) => {
  if (!req.user.is_admin) return res.sendStatus(403);
  const { id } = req.params;
  const { status } = req.body;
  let code = null, grantedAt = null;
  if (status === 'granted') {
    code = `SRN-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    grantedAt = new Date();
  }
  await pool.query(
    'UPDATE emergency_requests SET status = ?, code = ?, grantedAt = ? WHERE id = ?',
    [status, code, grantedAt, id]
  );
  res.json({ message: 'Request updated successfully' });
});

const lifelaneDocs = `
1. Introduction / Welcome Intents
User: What is LifeLane?
Bot:
LifeLane is a digital emergency system. It lets private vehicles act as temporary ambulances when ambulances are unavailable. You can request a siren activation code through our app or website. After admin verification, you receive a one-time code to activate a siren device in your car.

2. Core Functionality
User: How does LifeLane work?
Bot:
Submit an emergency request with patient details. Our team verifies your request. Once approved, you get a one-time siren code. Enter the code in your LifeLane device to activate the siren and drive to the hospital.

User: Can I use LifeLane without a siren device?
Bot:
No. You need a LifeLane-compatible siren device installed in your vehicle. The device only activates after a valid code is entered.

3. Emergency Request Process
User: What do I need to submit a request?
Bot:
Provide the patient's name, age, a short description of the emergency, and an optional photo. Our admin team will verify your request.

User: How long does it take to get approved?
Bot:
Most approvals take 2–5 minutes. We verify requests manually to ensure real emergencies.

User: What happens after I'm approved?
Bot:
You receive a secure, one-time siren activation code. Enter this code into your LifeLane device to activate emergency mode.

4. Siren Code FAQs
User: How long is the siren code valid?
Bot:
Each code is valid for 15–30 minutes and can only be used once. After that, it expires and cannot be reused.

User: What if I enter the wrong code?
Bot:
If you enter the wrong code, the siren device will not activate. You can re-enter the correct code or contact support.

User: Can I use the same code again later?
Bot:
No. Every code is single-use and tied to a specific emergency request. Submit a new request if you need another code.

5. Device & Technical
User: How does the device work?
Bot:
The device contains a secure list of codes. When you enter the code, the device checks if it matches. If valid and unused, the siren activates.

User: What if my device doesn't activate?
Bot:
Check that you entered the correct code and the device is powered. If it still does not work, contact support at lifelanesupport@gmail.com.

6. Safety, Misuse & Fines
User: What if someone misuses LifeLane?
Bot:
Misuse may result in fines or a ban. All actions are logged and monitored.

User: Is it legal to use a siren?
Bot:
LifeLane codes are approved only after emergency verification. Our sirens are not ambulance sirens. Local traffic rules must be followed.

7. Support & Contact
User: How can I contact LifeLane?
Bot:
Email lifelanesupport@gmail.com or call +91 73938 00862, +91 83683 12681, +91 96502 75609, +91 79824 04800.

User: Is there someone I can talk to in an emergency?
Bot:
Yes. Our support team is available 24/7 for emergency requests and device issues.

8. Closing & Help Intents
User: I still have questions.
Bot:
You can ask me anything or contact our team for help.

User: Thank you
Bot:
You're welcome. Stay safe.
`;

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:5173",
        "X-Title": "LifeLane",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528:free",
        messages: [
          {
            role: "system",
            content: `You are LifeBot, a professional support assistant for LifeLane. Only answer using the information below. If you do not know the answer, say you do not know. All responses must be short, direct, and professional. Do not use markdown, asterisks, or emojis. Do not use an overly friendly or casual tone. Use sentence case. Here is the documentation:\n${lifelaneDocs}`
          },
          ...messages
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from OpenRouter');
    }

    const data = await response.json();
    res.json({ message: data.choices[0].message });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 