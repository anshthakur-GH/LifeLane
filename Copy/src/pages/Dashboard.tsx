import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

interface EmergencyRequest {
  id: string;
  patientName: string;
  date: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  problemDescription: string;
}

export const Dashboard: React.FC = () => {
  const [requests] = React.useState<EmergencyRequest[]>([
    {
      id: '1',
      patientName: 'John Smith',
      date: '2024-01-15',
      status: 'approved',
      problemDescription: 'Chest pain and difficulty breathing'
    },
    {
      id: '2',
      patientName: 'Sarah Johnson',
      date: '2024-01-14',
      status: 'completed',
      problemDescription: 'Severe abdominal pain'
    },
    {
      id: '3',
      patientName: 'Michael Davis',
      date: '2024-01-13',
      status: 'pending',
      problemDescription: 'Allergic reaction'
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning text-yellow-800';
      case 'approved':
        return 'bg-success text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
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
                Welcome back, Alex!
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
                <p className="text-2xl font-bold text-header">12</p>
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
                <p className="text-2xl font-bold text-warning">3</p>
              </div>
              <div className="bg-warning bg-opacity-10 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-warning" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-success">6</p>
              </div>
              <div className="bg-success bg-opacity-10 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">8</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-header mb-6">Recent Requests</h2>
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-header">
                        {request.patientName}
                      </h3>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{request.problemDescription}</p>
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};