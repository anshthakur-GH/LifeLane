import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo on the left */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-emergency p-2 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-header">LifeLane</span>
          </Link>

          {/* Centered Navigation */}
          <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link
              to="/"
              className={`$${isActive('/') ? 'text-primary' : 'text-header hover:text-primary'} font-medium transition-colors`}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`$${isActive('/dashboard') ? 'text-primary' : 'text-header hover:text-primary'} font-medium transition-colors`}
            >
              Dashboard
            </Link>
            <Link
              to="/contact"
              className={`$${isActive('/contact') ? 'text-primary' : 'text-header hover:text-primary'} font-medium transition-colors`}
            >
              Contact
            </Link>
          </nav>

          {/* Login on the right */}
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            <Link
              to="/login"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-header" />
            ) : (
              <Menu className="w-6 h-6 text-header" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className={`$${isActive('/') ? 'text-primary' : 'text-header'} font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className={`$${isActive('/dashboard') ? 'text-primary' : 'text-header'} font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/contact"
                className={`$${isActive('/contact') ? 'text-primary' : 'text-header'} font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/login"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity w-fit"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};