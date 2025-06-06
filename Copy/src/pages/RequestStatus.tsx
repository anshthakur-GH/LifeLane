import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Copy, CheckCircle, Clock, XCircle, MapPin, Phone, User } from 'lucide-react';

export const RequestStatus: React.FC = () => {
  const { id } = useParams();
  const [timeRemaining, setTimeRemaining] = useState(480); // 8 minutes in seconds
  const [sirenCode] = useState('SRN-2024-XJ7K');
  
  // Mock status - in real app this would come from API
  const [status] = useState<'pending' | 'approved' | 'rejected'>('approved');

  useEffect(() => {
    if (status === 'approved' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show success message (in real app)
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning',
          icon: <Clock className="w-6 h-6" />,
          text: 'Pending Approval',
          description: 'Your request is being processed. We are matching you with available drivers.'
        };
      case 'approved':
        return {
          color: 'text-success',
          bgColor: 'bg-success',
          icon: <CheckCircle className="w-6 h-6" />,
          text: 'Request Approved',
          description: 'Your emergency transport has been approved. Driver is en route to your location.'
        };
      case 'rejected':
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-500',
          icon: <XCircle className="w-6 h-6" />,
          text: 'Request Rejected',
          description: 'We were unable to fulfill this request. Please try again or contact support.'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-500',
          icon: <Clock className="w-6 h-6" />,
          text: 'Unknown Status',
          description: ''
        };
    }
  };

  const statusConfig = getStatusConfig();

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
                  <span className="text-gray-600">Patient: <strong>John Smith</strong></span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">Location: <strong>123 Main St, City</strong></span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">Contact: <strong>+1 (555) 123-4567</strong></span>
                </div>
              </div>
            </div>

            {status === 'approved' && (
              <div className="bg-bg-light rounded-xl p-6">
                <h3 className="text-lg font-semibold text-header mb-4">Driver Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Driver: <strong>Sarah Wilson</strong></span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Phone: <strong>+1 (555) 987-6543</strong></span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-5 h-5 text-gray-400 mr-3">🚗</span>
                    <span className="text-gray-600">Vehicle: <strong>Honda Civic - ABC123</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Siren Code */}
          {status === 'approved' && (
            <div className="bg-gradient-to-r from-success to-primary rounded-xl p-6 text-white mb-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Your Siren Code</h3>
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-3xl font-bold font-mono tracking-wider">{sirenCode}</span>
                  <button
                    onClick={() => copyToClipboard(sirenCode)}
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
          {status === 'approved' && timeRemaining > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center mb-8">
              <h3 className="text-xl font-semibold text-yellow-800 mb-2">ETA</h3>
              <div className="text-4xl font-bold text-yellow-600 mb-2">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-yellow-700">Driver will arrive in approximately</p>
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
            {status === 'approved' && (
              <button className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg">
                Track Live Location
              </button>
            )}
            <button className="bg-emergency text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};