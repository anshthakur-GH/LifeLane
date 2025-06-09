const isDevelopment = window.location.hostname === 'localhost';

export const config = {
    apiUrl: isDevelopment 
        ? 'http://localhost:5000'
        : 'https://your-backend-app-name.railway.app',
    uploadUrl: isDevelopment
        ? 'http://localhost:5000/uploads'
        : 'https://your-backend-app-name.railway.app/uploads'
}; 