import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserEmergencyRequests, EmergencyRequest } from '../services/emergencyService';

export const Dashboard: React.FC = () => {
    const [requests, setRequests] = useState<EmergencyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await getUserEmergencyRequests();
                setRequests(data);
            } catch (err) {
                setError('Failed to fetch emergency requests');
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'resolved':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-orange-100 text-orange-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.fullName}</h1>
                <button
                    onClick={() => navigate('/request')}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    New Emergency Request
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-6">Your Emergency Requests</h2>
                
                {requests.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No emergency requests found.</p>
                        <button
                            onClick={() => navigate('/request')}
                            className="mt-4 text-blue-500 hover:text-blue-600"
                        >
                            Create your first request
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {requests.map((request) => (
                            <div
                                key={request.id}
                                className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800">
                                            {request.emergencyType}
                                        </h3>
                                        <p className="text-gray-600 mt-1">{request.location}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                                            {request.status}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(request.priority)}`}>
                                            {request.priority}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-gray-700 mb-4">{request.description}</p>

                                <div className="flex gap-4">
                                    {request.imageUrl && (
                                        <div className="w-24 h-24">
                                            <img
                                                src={request.imageUrl}
                                                alt="Emergency"
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        </div>
                                    )}
                                    {request.audioUrl && (
                                        <audio
                                            controls
                                            className="w-full max-w-md"
                                            src={request.audioUrl}
                                        >
                                            Your browser does not support the audio element.
                                        </audio>
                                    )}
                                </div>

                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-sm text-gray-500">
                                        Created: {new Date(request.createdAt).toLocaleString()}
                                    </span>
                                    <button
                                        onClick={() => navigate(`/status/${request.id}`)}
                                        className="text-blue-500 hover:text-blue-600"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};