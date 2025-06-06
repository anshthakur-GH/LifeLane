import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, FileText, Upload, AlertCircle } from 'lucide-react';

export const EmergencyRequestForm: React.FC = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    problemDescription: '',
    location: '',
    contactNumber: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Emergency request submitted:', formData);
    // Handle form submission logic here
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
                Contact Number *
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Enter your contact number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-header mb-3">
                Current Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Enter current address or landmark"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-header mb-3">
                Problem Description *
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

            <div>
              <label className="block text-sm font-semibold text-header mb-3">
                Upload Image (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </label>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Important Notice</h4>
                  <p className="text-sm text-yellow-700">
                    This is for emergency medical transport coordination. For life-threatening emergencies, 
                    please call 911 immediately. Our service complements but does not replace emergency services.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link
                to="/dashboard"
                className="flex-1 bg-gray-100 text-header py-3 px-6 rounded-xl font-semibold text-center hover:bg-gray-200 transition-colors"
              >
                Cancel
              </Link>
              <Link
                to="/status/new"
                className="flex-1 bg-emergency text-white py-3 px-6 rounded-xl font-semibold text-center hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
              >
                Submit Emergency Request
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};