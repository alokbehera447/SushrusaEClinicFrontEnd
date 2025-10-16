import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  BarChart3, 
  User,
  Plus,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PatientSearch } from '@/components/PatientSearch';
import { PatientManagementDashboard } from '@/components/PatientManagementDashboard';
import { PatientStatsDashboard } from '@/components/PatientStatsDashboard';
import { type PatientProfile } from '@/services/patientService';

const PatientManagement: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [activeTab, setActiveTab] = useState('search');

  const handlePatientSelect = (patient: PatientProfile) => {
    setSelectedPatient(patient);
    setActiveTab('dashboard');
  };

  const handleBackToSearch = () => {
    setSelectedPatient(null);
    setActiveTab('search');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Patient Management</h1>
              <p className="text-gray-600">
                Comprehensive patient management system with medical records, documents, and analytics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Admin Access
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Patients
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Patient Dashboard
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Patient Search & Management
              </CardTitle>
              <CardDescription>
                Search for patients and manage their medical records, documents, and notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientSearch 
                onPatientSelect={handlePatientSelect} 
                showBookConsultation={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patient Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {selectedPatient ? (
            <div className="space-y-6">
              {/* Patient Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{selectedPatient.user_name}</CardTitle>
                        <CardDescription>
                          Patient ID: {selectedPatient.id} | Age: {selectedPatient.age} | {selectedPatient.gender}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={selectedPatient.is_active ? "default" : "secondary"}>
                        {selectedPatient.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="outline" onClick={handleBackToSearch}>
                        Back to Search
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                         <div>
                       <span className="font-medium text-gray-500">Contact:</span>
                       <p>{selectedPatient.user_phone}</p>
                       <p className="text-gray-600">{selectedPatient.user_email || 'No email'}</p>
                     </div>
                    <div>
                      <span className="font-medium text-gray-500">Location:</span>
                      <p>{selectedPatient.city}, {selectedPatient.state}</p>
                      <p className="text-gray-600">{selectedPatient.country}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Blood Group:</span>
                      <p>{selectedPatient.blood_group || 'Not specified'}</p>
                      <p className="text-gray-600">
                        {selectedPatient.chronic_conditions.length} chronic conditions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Patient Management Dashboard */}
              <PatientManagementDashboard patientId={selectedPatient.id} />
            </div>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Patient Dashboard
                  </CardTitle>
                  <CardDescription>
                    Select a patient to view their detailed information and manage their records
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <User className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Patient Selected</h3>
                  <p className="text-gray-600 mb-4">
                    To view a patient's dashboard, please search for a patient first and select them from the search results.
                  </p>
                  <Button onClick={() => setActiveTab('search')}>
                    <Search className="h-4 w-4 mr-2" />
                    Search Patients
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Patient Analytics & Statistics
              </CardTitle>
              <CardDescription>
                Comprehensive analytics and insights about patient data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientStatsDashboard />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6">
        <div className="flex flex-col gap-2">
          <Button 
            size="lg" 
            className="rounded-full w-14 h-14 shadow-lg"
            onClick={() => setActiveTab('search')}
          >
            <Search className="h-6 w-6" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="rounded-full w-14 h-14 shadow-lg"
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatientManagement;
