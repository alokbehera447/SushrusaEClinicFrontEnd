import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, LogOut, ArrowLeft } from 'lucide-react';
import SuperAdminDashboard from '@/components/dashboards/SuperAdminDashboard';
import { useAuth } from '@/context/AuthContext';

const SuperAdminDashboardPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const username = 'Super Admin';
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 to-white'
    }`}>
      {/* Header */}
      <div className={`border-b sticky top-0 z-50 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-[#E17726] p-2 rounded-xl shadow-md">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className={`text-xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-midnight'
                  }`}>SUSHRUSA</span>
                  <span className={`text-sm ml-1 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>eClinic</span>
                </div>
              </Link>
              <div className={`h-6 w-px transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
              }`}></div>
              <div>
                <h1 className={`text-lg font-semibold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-midnight'
                }`}>Super Admin Dashboard</h1>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>Welcome back, {username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="outline" className={`transition-colors duration-300 ${
                  isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300'
                }`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className={`transition-colors duration-300 ${
                  isDarkMode ? 'border-red-400 text-red-300 hover:bg-red-900/20' : 'border-red-300 text-red-600 hover:bg-red-50'
                }`}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <SuperAdminDashboard isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
    </div>
  );
};

export default SuperAdminDashboardPage; 