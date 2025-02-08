import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
        <div className="flex-shrink-0">
          <Link to="/" className="text-2xl font-bold tracking-wide">
            AdMetrics
          </Link>
        </div>
        
        <div className="flex items-center gap-6 ml-auto">
          {[{ path: '/dashboard', label: 'Dashboard' },
            { path: '/analysis', label: 'Insights' },
            { path: '/marketing', label: 'Ad Campign' },
            { path: '/register-company', label: 'Register Company' },
            { path: '/companies', label: 'Companies' }].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {label}
              </Link>
          ))}
          
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
            <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
