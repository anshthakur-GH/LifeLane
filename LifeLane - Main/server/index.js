// LifeLane backend - local JSON storage version
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;
const upload = multer();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here' // Replace with your actual API key
});

// Enable CORS for all routes
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

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

// Emergency request endpoints
app.post('/api/emergency-request', (req, res) => {
  try {
    const requests = readRequests();
    const newRequest = {
      id: Date.now().toString(),
      patient_name: req.body.patient_name,
      problem_description: req.body.problem_description,
      details: req.body.details,
      status: 'pending',
      date: new Date().toISOString(),
      code: null
    };
    requests.push(newRequest);
    writeRequests(requests);
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error saving request:', error);
    res.status(500).json({ error: 'Failed to save request' });
  }
});

app.get('/api/emergency-requests', (req, res) => {
  try {
    const requests = readRequests();
    res.json(requests);
  } catch (error) {
    console.error('Error reading requests:', error);
    res.status(500).json({ error: 'Failed to read requests' });
  }
});

app.put('/api/emergency-request/:id', (req, res) => {
  try {
    const requests = readRequests();
    const index = requests.findIndex(r => r.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const updatedRequest = {
      ...requests[index],
      status: req.body.status,
      code: req.body.status === 'granted' ? Math.random().toString(36).substring(2, 8).toUpperCase() : null
    };
    
    requests[index] = updatedRequest;
    writeRequests(requests);
    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const lastUserMessage = messages[messages.length - 1].content.toLowerCase();

    // Prepare the conversation history with specific instructions
    const conversationHistory = [
      {
        role: 'system',
        content: `You are LifeBot, an AI assistant for the LifeLane emergency response platform. Follow these exact guidelines:

1. GREETING:
   - When user says hello/hi: "Hi, I'm LifeBot! Here to help you use LifeLane during emergencies. How can I assist you today?"

2. WHAT IS LIFELANE:
   - When asked about LifeLane: "LifeLane helps convert private vehicles into emergency vehicles when ambulances aren't available. It works through a secure siren activation system after admin verification."

3. HOW IT WORKS:
   - When asked about process: Explain the 4 steps:
     1. Request - User submits emergency request with patient details
     2. Verify - Admin team verifies the request
     3. Code - System generates one-time-use activation code
     4. Activate - User enters code in siren device

4. SIREN CODE:
   - When asked about getting code: "After you submit an emergency request, our admin team verifies it and sends you a one-time-use activation code. You can then enter it into your siren device to activate."
   - When asked about reusing code: "No. Each siren code is unique, valid for a short time, and can only be used once."

5. CONTACT SUPPORT:
   - When asked about support: Provide these exact contact details:
     Email: lifelanesupport@gmail.com
     Phone: +91 73938 00862, +91 83683 12681, +91 96502 75609, +91 79824 04800

6. MISUSE WARNING:
   - When asked about misuse: "Misuse of the siren system may lead to fines, account suspension, or legal action. LifeLane is meant only for real emergencies."

7. FALLBACK:
   - For unknown questions: "I'm not sure about that, but our support team can help. Would you like their contact details?"

Always maintain a professional and empathetic tone. Prioritize emergency situations and guide users to the appropriate channels.`
      },
      ...messages
    ];

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversationHistory,
      temperature: 0.3, // Lower temperature for more consistent responses
      max_tokens: 200,
      presence_penalty: 0.3,
      frequency_penalty: 0.3
    });

    const response = completion.choices[0].message;

    res.json({
      message: {
        role: 'assistant',
        content: response.content
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      details: error.message
    });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
}); 