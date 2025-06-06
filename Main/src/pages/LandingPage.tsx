import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Zap, Phone, Mail, MapPin } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-bg-cream to-bg-light py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-header mb-6">
            Convert Your Vehicle Into a<br />
            <span className="text-emergency">Life-Saving Vehicle</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            LifeLane empowers individuals to transport patients during medical emergencies when ambulances aren't available. With one-time siren access, and real-time approval — you save time when every second counts.
          </p>
          <Link
            to="/request"
            className="inline-flex items-center bg-emergency text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
          >
            <AlertCircle className="w-6 h-6 mr-2" />
            Request Emergency
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-header mb-16">
            How LifeLane Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-emergency bg-opacity-10 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-emergency" />
              </div>
              <h3 className="text-2xl font-semibold text-header mb-4">1. Request</h3>
              <p className="text-gray-600 leading-relaxed">
                Submit your emergency request with patient details and location. Our system instantly alerts nearby verified drivers.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-success bg-opacity-10 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-success" />
              </div>
              <h3 className="text-2xl font-semibold text-header mb-4">2. Approval</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive instant approval with a unique siren code and driver details. Track your ride in real-time with live updates.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary bg-opacity-10 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Zap className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-header mb-4">3. Activation</h3>
              <p className="text-gray-600 leading-relaxed">
                Your ride becomes an emergency vehicle with priority routing and traffic clearance capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-emergency">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Save Lives?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Join thousands of users who trust LifeLane for emergency medical transport
          </p>
          <Link
            to="/login"
            className="inline-flex items-center bg-white text-header px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-header text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-emergency p-2 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">LifeLane</span>
              </div>
              <p className="text-gray-300">
                Transforming emergency medical transport through technology and community.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-gray-300">1-800-LIFELANE</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-gray-300">help@lifelane.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-gray-300">Available Nationwide</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Emergency Transport</li>
                <li>Medical Transfers</li>
                <li>Priority Routing</li>
                <li>24/7 Support</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>HIPAA Compliance</li>
                <li>Driver Guidelines</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-12 pt-8 text-center text-gray-300">
            <p>&copy; 2024 LifeLane. All rights reserved. Licensed medical transport platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};