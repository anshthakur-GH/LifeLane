const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const fetch = require('node-fetch');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const upload = multer();

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

app.use(cors());
app.use(express.json());

function readRequests() {
  if (!fs.existsSync(emergencyRequestsPath)) return [];
  return JSON.parse(fs.readFileSync(emergencyRequestsPath, 'utf8'));
}
function writeRequests(requests) {
  fs.writeFileSync(emergencyRequestsPath, JSON.stringify(requests, null, 2));
}

// Health check route
app.get('/', (req, res) => {
  res.send('LifeLane backend is running');
});

// User Registration
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    if (users.some(user => user.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now(), name, email, password: hashedPassword };
    users.push(newUser);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST: Save new request (fix: use multer to parse FormData)
app.post('/api/emergency-request', upload.none(), (req, res) => {
  const requests = readRequests();
  const { user_id, patient_name, problem_description, details } = req.body || {};
  const newRequest = {
    id: Date.now(),
    user_id,
    patient_name,
    problem_description,
    details,
    status: 'pending'
  };
  requests.push(newRequest);
  writeRequests(requests);
  res.json({ id: newRequest.id, message: 'Request received' });
});

// GET: List all requests
app.get('/api/emergency-requests', (req, res) => {
  res.json(readRequests());
});

// Update Emergency Request Status
app.put('/api/emergency-request/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const requests = JSON.parse(fs.readFileSync(emergencyRequestsPath, 'utf8'));
    const requestIndex = requests.findIndex(req => req.id === parseInt(id));
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (status === 'granted') {
      // Generate siren code and set grantedAt timestamp
      const code = `SRN-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      requests[requestIndex].status = 'granted';
      requests[requestIndex].code = code;
      requests[requestIndex].grantedAt = new Date().toISOString();
    } else if (status === 'dismissed') {
      requests[requestIndex].status = 'dismissed';
      requests[requestIndex].code = null;
      requests[requestIndex].grantedAt = null;
    }
    // If status is set back to pending, clear code and grantedAt
    if (status === 'pending') {
      requests[requestIndex].status = 'pending';
      requests[requestIndex].code = null;
      requests[requestIndex].grantedAt = null;
    }

    fs.writeFileSync(emergencyRequestsPath, JSON.stringify(requests, null, 2));
    res.json({ message: 'Request updated successfully', request: requests[requestIndex] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Emergency Request by ID
app.get('/api/emergency-request/:id', (req, res) => {
  const { id } = req.params;
  try {
    const requests = JSON.parse(fs.readFileSync(emergencyRequestsPath, 'utf8'));
    const request = requests.find(req => req.id === parseInt(id));
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 