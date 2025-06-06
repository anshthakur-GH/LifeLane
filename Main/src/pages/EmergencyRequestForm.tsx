import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, FileText, AlertCircle } from 'lucide-react';

export const EmergencyRequestForm: React.FC = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    problemDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/emergency-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1, // Replace with real user id if available
          patient_name: formData.patientName,
          problem_description: formData.problemDescription,
          details: `Age: ${formData.age}`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        navigate(`/status/${data.id}`);
      } else {
        setError(data.error || 'Failed to submit request');
      }
    } catch (err) {
      setError('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-bg-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-8">
            <div className="bg-emergency bg-opacity-10 p-3 rounded-lg mr-4">
              <AlertCircle className="w-8 h-8 text-emergency" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-header">Emergency Request</h1>
              <p className="text-gray-600">Please provide accurate information for immediate assistance</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-header mb-3">
                  Patient Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter patient's full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-header mb-3">
                  Age *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter patient's age"
                    min="1"
                    max="120"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-header mb-3">
                Emergency Detail *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
                <textarea
                  name="problemDescription"
                  value={formData.problemDescription}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  placeholder="Describe the emergency situation, symptoms, and any relevant medical information..."
                  required
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Important Notice</h4>
                  <p className="text-sm text-yellow-700">
                    This is for emergency medical transport coordination. For life-threatening emergencies, 
                    please call 112 immediately. Our service complements but does not replace emergency services.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gray-100 text-header py-3 px-6 rounded-xl font-semibold text-center hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-emergency text-white py-3 px-6 rounded-xl font-semibold text-center hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Emergency Request'}
              </button>
            </div>
            {error && <div className="text-red-600 text-center mt-4">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};