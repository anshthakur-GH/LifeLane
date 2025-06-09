import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { EmergencyRequestForm } from './pages/EmergencyRequestForm';
import { RequestStatus } from './pages/RequestStatus';
import { AdminPanel } from './pages/AdminPanel';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import { ChatBot } from './components/ChatBot';
import { Status } from './pages/Status';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({ 
    children, 
    requireAdmin = false 
}) => {
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/dashboard" />;
    }

    return <>{children}</>;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-bg-cream font-inter">
                    <Header />
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route 
                            path="/dashboard" 
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/request" 
                            element={
                                <ProtectedRoute>
                                    <EmergencyRequestForm />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/status/:id" 
                            element={
                                <ProtectedRoute>
                                    <RequestStatus />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/adminpanel" 
                            element={
                                <ProtectedRoute requireAdmin>
                                    <AdminPanel />
                                </ProtectedRoute>
                            } 
                        />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms-of-service" element={<TermsOfService />} />
                    </Routes>
                    <ChatBot />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;