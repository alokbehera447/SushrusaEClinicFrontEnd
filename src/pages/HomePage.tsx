import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Sushrusa eClinic</h1>
        <p className="text-xl text-gray-600">Healthcare Management System</p>
        
        <div className="space-x-4">
          <Link to="/doctor-dashboard">
            <Button>Doctor Dashboard</Button>
          </Link>
          <Link to="/prescriptions">
            <Button variant="outline">Prescription Management</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 