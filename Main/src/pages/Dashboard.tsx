import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const userId = 1; // Replace with real user id if available

  useEffect(() => {
    const fetchRequests = async () => {
      const res = await fetch('http://localhost:5000/api/emergency-requests');
      const data = await res.json();
      setRequests(data.filter((r: any) => String(r.user_id) === String(userId)));
    };
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
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
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-header mb-2">
                Welcome back!
              </h1>
              <p className="text-gray-600">
                Manage your emergency requests and track active transports
              </p>
            </div>
            <Link
              to="/request"
              className="mt-6 md:mt-0 inline-flex items-center bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Emergency Request
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-header">{requests.length}</p>
              </div>
              <div className="bg-primary bg-opacity-10 p-3 rounded-lg">
                <Plus className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-warning">{requests.filter(r => r.status === 'pending').length}</p>
              </div>
              <div className="bg-warning bg-opacity-10 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-warning" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Granted</p>
                <p className="text-2xl font-bold text-success">{requests.filter(r => r.status === 'granted').length}</p>
              </div>
              <div className="bg-success bg-opacity-10 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dismissed</p>
                <p className="text-2xl font-bold text-gray-600">{requests.filter(r => r.status === 'dismissed').length}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-header mb-6">Recent Requests</h2>
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center text-gray-400 py-12 text-lg">No recent requests found.</div>
            ) :
              requests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-header">
                          {request.patient_name}
                        </h3>
                        <span
                          className={`inline-flex items-center text-xs font-semibold ${getStatusColor(request.status)}`}
                        >
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status === 'granted' ? 'Granted' : request.status}</span>
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{request.problem_description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(request.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <Link
                        to={`/status/${request.id}`}
                        className="inline-flex items-center bg-gray-100 text-header px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};