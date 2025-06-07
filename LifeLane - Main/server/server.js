const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer();
const DATA_FILE = path.join(__dirname, 'requests.json');

app.use(cors());
app.use(express.json());

// Helper to read/write JSON file
function readRequests() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}
function writeRequests(requests) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(requests, null, 2));
}

// POST: Save new request
app.post('/api/emergency-request', upload.none(), (req, res) => {
  const requests = readRequests();
  const newRequest = {
    id: Date.now(),
    ...req.body,
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

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
}); 