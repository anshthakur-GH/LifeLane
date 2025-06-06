import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { EmergencyRequestForm } from './pages/EmergencyRequestForm';
import { RequestStatus } from './pages/RequestStatus';
import { AdminPanel } from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg-cream font-inter">
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/request" element={<EmergencyRequestForm />} />
          <Route path="/status/:id" element={<RequestStatus />} />
          <Route path="/adminpanel" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;