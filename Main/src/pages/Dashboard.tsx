import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [requests, setRequests] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const admin = localStorage.getItem('is_admin') === 'true';
    setIsAdmin(admin);
    if (!token) return;
    fetch(admin ? '/api/emergency-requests' : '/api/my-requests', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setRequests(data));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'granted':
        return 'text-green-600';
      case 'dismissed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'granted':
        return <CheckCircle className="w-4 h-4" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-header mb-2">
                Welcome back!
              </h1>
              <p className="text-gray-600">
                {isAdmin ? 'Manage all emergency requests' : 'Manage your emergency requests and track active transports'}
              </p>
            </div>
            {!isAdmin && (
              <Link
                to="/request"
                className="mt-6 md:mt-0 inline-flex items-center bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Emergency Request
              </Link>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{isAdmin ? 'All Emergency Requests' : 'Your Emergency Requests'}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>}
                  {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((req: any) => (
                  <tr key={req.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{req.patient_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{req.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(req.createdAt).toLocaleString()}</td>
                    {isAdmin && <td className="px-6 py-4 whitespace-nowrap">{req.user_name} ({req.user_email})</td>}
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                          onClick={async () => {
                            const token = localStorage.getItem('token');
                            await fetch(`/api/emergency-request/${req.id}`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ status: 'granted' })
                            });
                            window.location.reload();
                          }}
                          disabled={req.status === 'granted'}
                        >
                          Grant
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded"
                          onClick={async () => {
                            const token = localStorage.getItem('token');
                            await fetch(`/api/emergency-request/${req.id}`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ status: 'dismissed' })
                            });
                            window.location.reload();
                          }}
                          disabled={req.status === 'dismissed'}
                        >
                          Dismiss
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};