// LifeLane backend - local JSON storage version
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './config/db.js';
import { auth, adminAuth } from './middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads', file.fieldname === 'image' ? 'images' : 'audio');
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: file => file.fieldname === 'image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024 // 5MB for images, 10MB for audio
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'image') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed'));
            }
        } else {
            if (file.mimetype.startsWith('audio/')) {
                cb(null, true);
            } else {
                cb(new Error('Only audio files are allowed'));
            }
        }
    }
});

// Create upload directories if they don't exist
const uploadDirs = ['uploads/images', 'uploads/audio'];
uploadDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// JSON file paths
const emergencyRequestsPath = path.join(__dirname, 'data', 'emergency_requests.json');
const usersPath = path.join(__dirname, 'data', 'users.json');
const chatbotIntentsPath = path.join(__dirname, 'data', 'chatbot_intents.json');

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

if (!fs.existsSync(chatbotIntentsPath)) {
  fs.writeFileSync(chatbotIntentsPath, JSON.stringify({
    intents: {},
    fallback: 'I couldn\'t find a matching intent. Please try again later.'
  }));
}

// Helper functions for JSON operations
function readRequests() {
  return JSON.parse(fs.readFileSync(emergencyRequestsPath, 'utf8'));
}

function writeRequests(requests) {
  fs.writeFileSync(emergencyRequestsPath, JSON.stringify(requests, null, 2));
}

function readUsers() {
  return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
}

function writeUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function isCodeExpired(createdAt) {
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  return Date.now() - new Date(createdAt).getTime() > fiveMinutes;
}

// Load chatbot intents
const chatbotIntents = JSON.parse(fs.readFileSync(chatbotIntentsPath, 'utf8'));

// Helper function to find matching intent
function findMatchingIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  // Check each category of intents
  for (const category in chatbotIntents.intents) {
    for (const intent in chatbotIntents.intents[category]) {
      const patterns = chatbotIntents.intents[category][intent].patterns;
      
      // Check if any pattern matches the message
      for (const pattern of patterns) {
        if (lowerMessage.includes(pattern)) {
          return chatbotIntents.intents[category][intent].response;
        }
      }
    }
  }
  
  // Return fallback if no match found
  return chatbotIntents.fallback;
}

// User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.execute(
            'INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)',
            [email, hashedPassword, fullName]
        );
        
        const token = jwt.sign({ id: result.insertId, email }, process.env.JWT_SECRET);
        res.status(201).json({ token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            throw new Error('Invalid credentials');
        }
        
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const [admins] = await pool.execute(
            'SELECT * FROM admins WHERE email = ?',
            [email]
        );
        
        if (admins.length === 0) {
            throw new Error('Invalid credentials');
        }
        
        const admin = admins[0];
        const isMatch = await bcrypt.compare(password, admin.password);
        
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        
        const token = jwt.sign(
            { id: admin.id, email: admin.email, isAdmin: true },
            process.env.JWT_SECRET
        );
        res.json({ token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create Emergency Request
app.post('/api/emergency', auth, async (req, res) => {
    try {
        const { emergencyType, description, location, imageUrl, audioUrl } = req.body;
        
        const [result] = await pool.execute(
            'INSERT INTO emergency_requests (user_id, emergency_type, description, location, image_url, audio_url) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, emergencyType, description, location, imageUrl, audioUrl]
        );
        
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get User's Emergency Requests
app.get('/api/emergency/user', auth, async (req, res) => {
    try {
        const [requests] = await pool.execute(
            'SELECT * FROM emergency_requests WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(requests);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get All Emergency Requests (Admin only)
app.get('/api/emergency/all', adminAuth, async (req, res) => {
    try {
        const [requests] = await pool.execute(
            'SELECT er.*, u.full_name, u.email FROM emergency_requests er JOIN users u ON er.user_id = u.id ORDER BY er.created_at DESC'
        );
        res.json(requests);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update Emergency Request Status (Admin only)
app.patch('/api/emergency/:id/status', adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        
        await pool.execute(
            'UPDATE emergency_requests SET status = ? WHERE id = ?',
            [status, id]
        );
        
        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST: Save new emergency request
app.post('/api/emergency-request', (req, res) => {
  console.log('=== Emergency Request Submission Start ===');
  console.log('Request body:', req.body);
  
  try {
    // Validate request body exists
    if (!req.body) {
      console.error('No request body received');
      return res.status(400).json({
        success: false,
        error: 'No request body received'
      });
    }

    // Extract form data
    const patientName = req.body.patientName;
    const age = req.body.age;
    const problemDescription = req.body.problemDescription;
    
    // Validate required fields
    if (!patientName || !age || !problemDescription) {
      console.error('Missing required fields:', { patientName, age, problemDescription });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: patientName, age, and problemDescription are required'
      });
    }

    // Read existing requests
    let requests = [];
    try {
      if (fs.existsSync(emergencyRequestsPath)) {
        const data = fs.readFileSync(emergencyRequestsPath, 'utf8');
        requests = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading existing requests:', error);
      requests = [];
    }

    // Create new request
    const newRequest = {
      id: Date.now(),
      patient_name: patientName,
      age: age,
      problem_description: problemDescription,
      status: 'pending',
      date: new Date().toISOString(),
      code: null,
      grantedAt: null
    };

    // Add to requests array
    requests.push(newRequest);

    // Write back to file
    fs.writeFileSync(emergencyRequestsPath, JSON.stringify(requests, null, 2));

    res.json({
      success: true,
      id: newRequest.id,
      message: 'Emergency request submitted successfully'
    });
  } catch (error) {
    console.error('Error in request submission:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to save emergency request',
      details: error.message
    });
  }
});

// GET: Get a specific request by ID
app.get('/api/emergency-request/:id', (req, res) => {
  try {
    const requests = JSON.parse(fs.readFileSync(emergencyRequestsPath, 'utf8'));
    const request = requests.find(r => r.id === parseInt(req.params.id));
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json(request);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// PUT: Update request status (grant/dismiss)
app.put('/api/emergency-request/:id', (req, res) => {
  try {
    const { status } = req.body;
    if (!['granted', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const requests = JSON.parse(fs.readFileSync(emergencyRequestsPath, 'utf8'));
    const requestIndex = requests.findIndex(r => r.id === parseInt(req.params.id));
    
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Update request
    requests[requestIndex].status = status;
    if (status === 'granted') {
      // Generate a random 6-digit code
      requests[requestIndex].code = Math.floor(100000 + Math.random() * 900000).toString();
      requests[requestIndex].grantedAt = new Date().toISOString();
    }

    // Write back to file
    fs.writeFileSync(emergencyRequestsPath, JSON.stringify(requests, null, 2));
    
    res.json(requests[requestIndex]);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// GET: List all requests (admin endpoint)
app.get('/api/emergency-requests', (req, res) => {
  try {
    const requests = JSON.parse(fs.readFileSync(emergencyRequestsPath, 'utf8'));
    res.json(requests);
  } catch (error) {
    console.error('Error reading requests:', error);
    res.status(500).json({ error: 'Failed to read requests' });
  }
});

// GET: List all requests for a user
app.get('/api/emergency-requests/:userId', (req, res) => {
  try {
    const requests = readRequests();
    const userRequests = requests.filter(r => r.userId === req.params.userId);
    res.json(userRequests);
  } catch (error) {
    console.error('Error reading requests:', error);
    res.status(500).json({ error: 'Failed to read requests' });
  }
});

// Chatbot endpoint
app.post('/api/chatbot', (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const response = findMatchingIntent(message);
    
    res.json({
      success: true,
      response: response
    });
  } catch (error) {
    console.error('Error in chatbot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// File upload endpoints
app.post('/api/upload/image', auth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/images/${req.file.filename}`;
    res.json({ url: fileUrl });
});

app.post('/api/upload/audio', auth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/audio/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 