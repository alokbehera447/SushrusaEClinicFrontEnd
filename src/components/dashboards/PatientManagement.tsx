import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, UserPlus, Users } from 'lucide-react';
import PatientManagementTab from '../forms/PatientManagementTab';

interface PatientManagementProps {
  isDarkMode?: boolean;
}

const PatientManagement: React.FC<PatientManagementProps> = ({ isDarkMode = false }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Navigation Card */}
      <Card className={`border-0 shadow-lg rounded-2xl backdrop-blur-sm transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90'
      }`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <Users className="w-5 h-5 text-[#E17726]" />
            Patient Management Access
          </CardTitle>
          <p className={`text-sm transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Quick access to dedicated patient management interface
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/dashboard/patients')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                isDarkMode
                  ? 'bg-[#E17726] hover:bg-[#E17726]/90 text-white'
                  : 'bg-[#E17726] hover:bg-[#E17726]/90 text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Manage Patients
              <ExternalLink className="w-3 h-3" />
            </Button>
            
            <Button
              onClick={() => navigate('/dashboard/patients/new')}
              variant="outline"
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Add Patient
            </Button>
          </div>
          
          <div className={`mt-3 pt-3 border-t text-sm ${
            isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'
          }`}>
            Access the full patient management interface with advanced features
          </div>
        </CardContent>
      </Card>

      {/* Existing Patient Management Tab */}
      <PatientManagementTab isDarkMode={isDarkMode} />
    </div>
  );
};

export default PatientManagement;