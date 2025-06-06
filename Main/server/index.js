const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

// Submit Emergency Request (JSON only)
app.post('/api/emergency-request', (req, res) => {
  const { user_id, patient_name, problem_description, details } = req.body;
  if (!user_id || !patient_name || !problem_description) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const requests = JSON.parse(fs.readFileSync(emergencyRequestsPath, 'utf8'));
    const newRequest = {
      id: Date.now(),
      user_id,
      patient_name,
      date: new Date().toISOString(),
      status: 'pending',
      problem_description,
      details,
      code: null
    };
    requests.push(newRequest);
    fs.writeFileSync(emergencyRequestsPath, JSON.stringify(requests, null, 2));
    res.status(201).json({ message: 'Emergency request submitted successfully', id: newRequest.id });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get All Emergency Requests (for admin)
app.get('/api/emergency-requests', (req, res) => {
  try {
    const requests = JSON.parse(fs.readFileSync(emergencyRequestsPath, 'utf8'));
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 