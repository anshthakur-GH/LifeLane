import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Copy, CheckCircle, Clock, XCircle, MapPin, Phone, User, FileText } from 'lucide-react';

export const RequestStatus: React.FC = () => {
  const { id } = useParams();
  const [request, setRequest] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [error, setError] = useState('');

  // Fetch request by ID
  const fetchRequest = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/emergency-request/${id}`);
      if (!res.ok) throw new Error('Request not found');
      const data = await res.json();
      setRequest(data);
      // If granted, set timer
      if (data.status === 'granted' && data.grantedAt) {
        const grantedTime = new Date(data.grantedAt).getTime();
        const now = Date.now();
        const diff = Math.max(0, 10 * 60 - Math.floor((now - grantedTime) / 1000));
        setTimeRemaining(diff);
      } else {
        setTimeRemaining(null);
      }
    } catch (err) {
      setError('Could not fetch request');
    }
  };

  useEffect(() => {
    fetchRequest();
    let interval: NodeJS.Timeout | undefined;
    if (request && request.status === 'pending') {
      interval = setInterval(fetchRequest, 5000);
    }
    return () => interval && clearInterval(interval);
  }, [id, request?.status]);

  // Countdown for granted requests
  useEffect(() => {
    if (timeRemaining === null) return;
    if (timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (error) {
    return <div className="pt-16 text-center text-red-600">{error}</div>;
  }
  if (!request) {
    return <div className="pt-16 text-center">Loading...</div>;
  }

  let statusConfig;
  if (request.status === 'pending') {
    statusConfig = {
      color: 'text-warning',
      bgColor: 'bg-warning',
      icon: <Clock className="w-6 h-6" />,
      text: 'Pending Approval',
      description: 'Your request is being processed. Waiting for admin approval.'
    };
  } else if (request.status === 'granted') {
    statusConfig = {
      color: 'text-success',
      bgColor: 'bg-success',
      icon: <CheckCircle className="w-6 h-6" />,
      text: 'Request Approved',
      description: 'Your emergency transport has been approved. Use the siren code below.'
    };
  } else {
    statusConfig = {
      color: 'text-gray-600',
      bgColor: 'bg-gray-500',
      icon: <XCircle className="w-6 h-6" />,
      text: 'Request Dismissed',
      description: 'Your request was not approved by admin.'
    };
  }

  return (
    <div className="pt-16 min-h-screen bg-bg-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Status Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 ${statusConfig.bgColor} bg-opacity-10 rounded-full mb-4`}>
              <div className={statusConfig.color}>
                {statusConfig.icon}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-header mb-2">{statusConfig.text}</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">{statusConfig.description}</p>
          </div>

          {/* Request Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-bg-light rounded-xl p-6">
              <h3 className="text-lg font-semibold text-header mb-4">Request Details</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">Patient: <strong>{request.patient_name}</strong></span>
                </div>
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">Emergency Description: <strong>{request.problem_description}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Siren Code */}
          {request.status === 'granted' && request.code && (
            <div className="bg-gradient-to-r from-success to-primary rounded-xl p-6 text-white mb-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Your Siren Code</h3>
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-3xl font-bold font-mono tracking-wider">{request.code}</span>
                  <button
                    onClick={() => copyToClipboard(request.code)}
                    className="bg-white bg-opacity-20 p-2 rounded-lg hover:bg-opacity-30 transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm opacity-90 mt-2">Share this code with traffic authorities if needed</p>
              </div>
            </div>
          )}

          {/* Countdown Timer */}
          {request.status === 'granted' && timeRemaining !== null && timeRemaining > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center mb-8">
              <h3 className="text-xl font-semibold text-yellow-800 mb-2">ETA</h3>
              <div className="text-4xl font-bold text-yellow-600 mb-2">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-yellow-700">Siren code is valid for 10 minutes from approval</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="bg-gray-100 text-header px-6 py-3 rounded-xl font-semibold text-center hover:bg-gray-200 transition-colors"
            >
              Back to Dashboard
            </Link>
            <button className="bg-emergency text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};