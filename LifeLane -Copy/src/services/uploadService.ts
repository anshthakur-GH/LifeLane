const API_URL = 'http://localhost:3000/api';

export const uploadFile = async (file: File, type: 'image' | 'audio'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload/${type}`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload file');
    }

    const data = await response.json();
    return data.url;
};

export const validateFile = (file: File, type: 'image' | 'audio'): boolean => {
    if (type === 'image') {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        return validTypes.includes(file.type) && file.size <= maxSize;
    } else {
        const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        return validTypes.includes(file.type) && file.size <= maxSize;
    }
}; 