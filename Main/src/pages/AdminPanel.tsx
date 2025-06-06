import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Key } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    const res = await fetch('http://localhost:5000/api/emergency-requests');
    const data = await res.json();
    setRequests(data);
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
  };

  const handleCloseDetails = () => {
    setSelectedRequest(null);
  };

  const handleGrant = async (id: number) => {
    setLoading(true);
    await fetch(`http://localhost:5000/api/emergency-request/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'granted' }),
    });
    setLoading(false);
    setSelectedRequest(null);
    fetchRequests();
  };

  const handleDismiss = async (id: number) => {
    setLoading(true);
    await fetch(`http://localhost:5000/api/emergency-request/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'dismissed' }),
    });
    setLoading(false);
    setSelectedRequest(null);
    fetchRequests();
  };

  return (
    <div className="pt-16 min-h-screen bg-bg-light">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-header mb-8">Admin Panel - Emergency Requests</h1>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-header mb-6">All Emergency Requests</h2>
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center text-gray-400 py-12 text-lg">No emergency requests found.</div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-header">
                        {request.patient_name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === 'pending'
                            ? 'bg-warning text-warning'
                            : request.status === 'granted'
                            ? 'bg-success text-success'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {request.status === 'pending' && <Eye className="w-4 h-4 mr-1" />}
                        {request.status === 'granted' && <CheckCircle className="w-4 h-4 mr-1" />}
                        {request.status === 'dismissed' && <XCircle className="w-4 h-4 mr-1" />}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{request.problem_description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(request.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 flex flex-col gap-2">
                    <button
                      onClick={() => handleViewDetails(request)}
                      className="inline-flex items-center bg-gray-100 text-header px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                    {request.status === 'granted' && request.code && (
                      <div className="flex items-center text-success mt-2">
                        <Key className="w-4 h-4 mr-1" />
                        <span className="font-mono">{request.code}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal for details */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                onClick={handleCloseDetails}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-header mb-4">Request Details</h2>
              <p className="mb-2"><strong>Patient:</strong> {selectedRequest.patient_name}</p>
              <p className="mb-2"><strong>Date:</strong> {selectedRequest.date}</p>
              <p className="mb-2"><strong>Description:</strong> {selectedRequest.problem_description}</p>
              <p className="mb-4"><strong>Details:</strong> {selectedRequest.details}</p>
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-4 mt-6">
                  <button
                    className="bg-success text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all flex-1"
                    onClick={() => handleGrant(selectedRequest.id)}
                    disabled={loading}
                  >
                    Grant & Issue Code
                  </button>
                  <button
                    className="bg-emergency text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all flex-1"
                    onClick={() => handleDismiss(selectedRequest.id)}
                    disabled={loading}
                  >
                    Dismiss
                  </button>
                </div>
              )}
              {selectedRequest.status === 'granted' && selectedRequest.code && (
                <div className="mt-6 flex items-center text-success">
                  <Key className="w-5 h-5 mr-2" />
                  <span className="font-mono text-lg">Issued Code: {selectedRequest.code}</span>
                </div>
              )}
              {selectedRequest.status === 'dismissed' && (
                <div className="mt-6 text-emergency font-semibold">Request was dismissed.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 