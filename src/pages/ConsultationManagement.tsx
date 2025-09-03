import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { superAdminApi } from '@/lib/api';
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
  Stethoscope, 
  Activity,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { ConsultationManagementDashboard } from '@/components/ConsultationManagementDashboard';
import { DoctorReadyPatientsDashboard } from '@/components/DoctorReadyPatientsDashboard';
import { AdminReadyPatientsDashboard } from '@/components/AdminReadyPatientsDashboard';
import { DoctorConsultationManagementDashboard } from '@/components/DoctorConsultationManagementDashboard';
import { type Consultation } from '@/services/consultationService';

const ConsultationManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [activeTab, setActiveTab] = useState('management'); // Default to management tab
  const [assignedClinicId, setAssignedClinicId] = useState<string | undefined>();

  // Get user role from AuthContext and route
  useEffect(() => {
    console.log('AuthContext user:', user);
    console.log('User role from AuthContext:', user?.role);
    
    // Determine role based on AuthContext and current route
    const isAdminRoute = window.location.pathname.includes('/dashboard/');
    const isDoctorRoute = window.location.pathname.includes('/doctor/');
    const detectedRole = user?.role || '';
    
    if (detectedRole) {
      // If role is detected in AuthContext, use it
      console.log('Using detected role from AuthContext:', detectedRole);
      setUserRole(detectedRole);
    } else if (isAdminRoute) {
      // If on admin route and no role detected, default to admin
      console.log('Admin route detected, defaulting to admin role');
      setUserRole('admin');
    } else if (isDoctorRoute) {
      // If on doctor route and no role detected, default to doctor
      console.log('Doctor route detected, defaulting to doctor role');
      setUserRole('doctor');
    } else {
      // Fallback to detected role
      setUserRole(detectedRole);
    }
  }, [user]);

  // Fetch assigned clinic for admin users
  useEffect(() => {
    const fetchAssignedClinic = async () => {
      if (!user || user.role !== 'admin') return;
      
      try {
        const data = await superAdminApi.getEClinics({ page: 1, page_size: 10 });
        const assignedClinic = data.results.find((clinic) => clinic.admin === user.id);
        if (assignedClinic) {
          setAssignedClinicId(assignedClinic.id);
          console.log('Assigned clinic ID:', assignedClinic.id);
        }
      } catch (error) {
        console.error('Error fetching assigned clinic:', error);
      }
    };

    fetchAssignedClinic();
  }, [user]);

  const handleConsultationSelect = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    // Navigate to consultation workspace - use correct path for all users
    navigate(`/consultation/${consultation.id}/workspace`);
  };

  const handleBackToManagement = () => {
    setSelectedConsultation(null);
    setActiveTab('management');
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
              onClick={() => navigate(userRole === 'doctor' ? '/doctor/dashboard' : '/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {userRole === 'doctor' ? 'Doctor' : 'Admin'}
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Consultation Management</h1>
              <p className="text-gray-600">
                {(userRole === 'admin' || userRole === 'superadmin')
                  ? 'Manage patient check-ins and consultation flow' 
                  : 'View and start consultations with ready patients'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-2">
              {(userRole === 'admin' || userRole === 'superadmin') ? (
                <>
                  <Users className="h-4 w-4" />
                  Admin Access
                </>
              ) : (
                <>
                  <Stethoscope className="h-4 w-4" />
                  Doctor Access
                </>
              )}
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {console.log('Rendering with userRole:', userRole)}
      {console.log('Current pathname:', window.location.pathname)}
      
      {/* Determine if we should show admin view based on role or URL */}
      {(() => {
        const isAdminRoute = window.location.pathname.includes('/dashboard/');
        const isAdminRole = userRole === 'admin' || userRole === 'superadmin';
        const shouldShowAdminView = isAdminRole || isAdminRoute;
        
        console.log('isAdminRoute:', isAdminRoute);
        console.log('isAdminRole:', isAdminRole);
        console.log('shouldShowAdminView:', shouldShowAdminView);
        
        return shouldShowAdminView ? (
        // Admin View
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="management" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Consultation Management
            </TabsTrigger>
            <TabsTrigger value="ready" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Ready Patients
            </TabsTrigger>
          </TabsList>

          <TabsContent value="management" className="space-y-6">
            <ConsultationManagementDashboard 
              onConsultationSelect={handleConsultationSelect}
              userRole={userRole}
              assignedClinicId={assignedClinicId}
            />
          </TabsContent>

          <TabsContent value="ready" className="space-y-6">
            <AdminReadyPatientsDashboard 
              onConsultationSelect={handleConsultationSelect}
            />
          </TabsContent>
        </Tabs>
      ) : (
        // Doctor View
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="management" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              My Consultations
            </TabsTrigger>
            <TabsTrigger value="ready" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Ready Patients
            </TabsTrigger>
          </TabsList>

          <TabsContent value="management" className="space-y-6">
            <DoctorConsultationManagementDashboard 
              onConsultationSelect={handleConsultationSelect}
            />
          </TabsContent>

          <TabsContent value="ready" className="space-y-6">
            <DoctorReadyPatientsDashboard 
              onConsultationSelect={handleConsultationSelect}
            />
          </TabsContent>
        </Tabs>
      )})()}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Today's Consultations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">No consultations scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ready Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
            <p className="text-xs text-gray-500">No patients ready for consultation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">0</div>
            <p className="text-xs text-gray-500">No consultations in progress</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsultationManagement;
