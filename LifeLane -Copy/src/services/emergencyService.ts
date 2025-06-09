import axios from 'axios';
import { config } from '../config';

export interface EmergencyRequest {
    id: number;
    userId: number;
    emergencyType: string;
    description: string;
    location: string;
    status: 'pending' | 'in_progress' | 'resolved';
    priority: 'low' | 'medium' | 'high';
    imageUrl?: string;
    audioUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export const getAllEmergencyRequests = async (): Promise<EmergencyRequest[]> => {
    try {
        const response = await axios.get(`${config.apiUrl}/api/emergency-requests`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching emergency requests:', error);
        throw error;
    }
};

export const updateEmergencyRequestStatus = async (
    requestId: number,
    status: EmergencyRequest['status']
): Promise<EmergencyRequest> => {
    try {
        const response = await axios.patch(
            `${config.apiUrl}/api/emergency-requests/${requestId}/status`,
            { status },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating emergency request status:', error);
        throw error;
    }
};

export const createEmergencyRequest = async (
    requestData: Omit<EmergencyRequest, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<EmergencyRequest> => {
    try {
        const response = await axios.post(
            `${config.apiUrl}/api/emergency-requests`,
            requestData,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating emergency request:', error);
        throw error;
    }
};

export const getUserEmergencyRequests = async (): Promise<EmergencyRequest[]> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${config.apiUrl}/emergency/user`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch emergency requests');
    }

    return response.json();
}; 