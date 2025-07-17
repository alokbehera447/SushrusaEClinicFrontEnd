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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-[#E17726] p-2 rounded-xl shadow-md">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-midnight">SUSHRUSA</span>
                  <span className="text-sm text-gray-500 ml-1">eClinic</span>
                </div>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-lg font-semibold text-midnight">Super Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="outline" className="border-gray-300">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <SuperAdminDashboard />
    </div>
  );
};

export default SuperAdminDashboardPage; 