import React, { useState, Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PatientRegistrationForm from '@/components/forms/PatientRegistrationForm';
import PaymentProcessingForm from '@/components/forms/PaymentProcessingForm';
import PrescriptionWriterForm from '@/components/forms/PrescriptionWriterForm';
import ConsultationCreationForm from '@/components/forms/ConsultationCreationForm';
import ConsultationManagementFlow from '@/components/forms/ConsultationManagementFlow';
import DoctorManagementTab from '@/components/forms/DoctorManagementTab';
import AdminDoctorManagementTab from '@/components/forms/AdminDoctorManagementTab';
import PatientManagementTab from '@/components/forms/PatientManagementTab';
import PaymentsTab from './PaymentsTab';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  FileText, 
  Clock, 
  Video,
  Plus,
  Search,
  Filter,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Activity,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Settings,
  Building2
} from 'lucide-react';
import { adminAnalyticsApi, AdminDashboardStats, Consultation, adminConsultationApi, EClinic } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { superAdminApi } from '@/lib/api';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-4">
                An error occurred while loading the dashboard. Please refresh the page to try again.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-[#E17726] hover:bg-[#c9651e] text-white"
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [showConsultationManagement, setShowConsultationManagement] = useState(false);
  const [expandedConsultation, setExpandedConsultation] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingStats(true);
    adminAnalyticsApi.getDashboardStats()
      .then((data) => {
        setDashboardStats(data);
        setLoadingStats(false);
      })
      .catch((err) => {
        setStatsError('Failed to load dashboard statistics');
        setLoadingStats(false);
      });
  }, []);

  // Only consultations state
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loadingConsultations, setLoadingConsultations] = useState(true);
  const [consultationsError, setConsultationsError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingConsultations(true);
    adminConsultationApi.getTodaysConsultations()
      .then((data) => {
        setConsultations(data);
        setLoadingConsultations(false);
      })
      .catch((err) => {
        setConsultationsError('Failed to load today\'s consultations');
        setLoadingConsultations(false);
      });
  }, []);

  // Updated stats: focus on consultations
  const todayStats = dashboardStats ? [
    { label: "Today's Consultations", value: dashboardStats.consultations_today, icon: Video, color: 'text-[#E17726]' },
    { label: 'Total Doctors', value: dashboardStats.total_doctors, icon: Users, color: 'text-[#E17726]' },
    { label: 'Total Consultations', value: dashboardStats.total_consultations, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Total Revenue', value: `₹${dashboardStats.total_revenue}`, icon: DollarSign, color: 'text-green-600' },
    { label: 'Total Patients', value: dashboardStats.total_patients, icon: Users, color: 'text-green-600' },
  ] : [];

  // Tabs: remove appointments
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'patient-management', label: 'Patient Management', icon: Users },
    { id: 'doctors', label: 'Doctors', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'consultations', label: 'Consultations', icon: Video }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to add new appointment
  // Removed as per edit hint

  // Function to start consultation from appointment
  // Removed as per edit hint

  // Function to end consultation
  const endConsultation = (consultationId: string) => {
    try {
      const consultation = consultations.find(con => con.id === consultationId);
      if (!consultation) return;

      // Update consultation status
      setConsultations(consultations.map(con => 
        con.id === consultationId ? { ...con, status: 'completed' } : con
      ));

      // Update corresponding appointment status
      // Removed as per edit hint
    } catch (error) {
      console.error('Error ending consultation:', error);
      alert('An error occurred while ending the consultation. Please try again.');
    }
  };

  // Helper function to calculate end time
  // Removed as per edit hint

  const { user } = useAuth();
  const [assignedClinics, setAssignedClinics] = useState<EClinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [clinicsError, setClinicsError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role === 'admin') {
      setLoadingClinics(true);
      superAdminApi.getEClinics({ page: 1, page_size: 10 })
        .then((data) => {
          console.log('EClinics API data:', data);
          console.log('Current user:', user);
          if (data && Array.isArray(data.results)) {
            data.results.forEach((clinic) => {
              console.log('Clinic:', clinic.name, 'admin:', clinic.admin, 'user.id:', user.id);
            });
          }
          // Filter clinics where admin matches current user
          setAssignedClinics(data.results.filter((clinic) => clinic.admin === user.id));
          setLoadingClinics(false);
        })
        .catch(() => {
          setClinicsError('Failed to load assigned clinics');
          setLoadingClinics(false);
        });
    }
  }, [user]);

  const navigate = useNavigate();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-midnight">Admin Dashboard</h1>
                {user && user.role === 'admin' && assignedClinics.length > 0 && (
                  <Badge className="bg-aqua/10 text-aqua border-aqua/20">
                    {assignedClinics[0].name}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={() => setShowPatientForm(true)}
                  className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register Patient
                </Button>
                <Button 
                  onClick={() => setShowConsultationForm(true)}
                  variant="outline" 
                  className="border-aqua text-aqua hover:bg-aqua hover:text-white"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Consultation
                </Button>
                <Button 
                  onClick={() => setShowConsultationManagement(true)}
                  variant="outline" 
                  className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Manage Consultations
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Assigned E-Clinic Banner */}
        {user && user.role === 'admin' && assignedClinics.length > 0 && (
          <div className="w-full bg-blue-50 border-b border-blue-200 py-2 px-4 flex items-center justify-center text-sm text-blue-900 font-medium">
            <Building2 className="w-4 h-4 mr-2 text-[#E17726]" />
            Assigned E-Clinic:
            <Popover>
              <PopoverTrigger asChild>
                <span className="ml-2 underline cursor-pointer hover:text-[#E17726] font-semibold">
                  {assignedClinics[0].name} ({assignedClinics[0].city}, {assignedClinics[0].state})
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="font-bold text-base mb-1">{assignedClinics[0].name}</div>
                <div className="text-xs text-gray-600 mb-1">{assignedClinics[0].city}, {assignedClinics[0].state}</div>
                <div className="text-xs text-gray-500 mb-1">Reg#: {assignedClinics[0].registration_number}</div>
                <div className="text-xs text-gray-500 mb-1">Phone: {assignedClinics[0].phone}</div>
                <div className="text-xs text-gray-500 mb-1">Email: {assignedClinics[0].email}</div>
                <Badge className={assignedClinics[0].is_verified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                  {assignedClinics[0].is_verified ? 'Verified' : 'Not Verified'}
                </Badge>
              </PopoverContent>
            </Popover>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-white rounded-xl p-2 shadow-sm border border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#E17726] text-white shadow-md'
                    : 'text-gray-600 hover:text-[#E17726] hover:bg-[#E17726]/5'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Today's Stats */}
              {loadingStats ? (
                <div className="flex justify-center items-center min-h-[120px]">
                  <span className="text-gray-500">Loading statistics...</span>
                </div>
              ) : statsError ? (
                <div className="flex justify-center items-center min-h-[120px] text-red-500">{statsError}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {todayStats.map((stat, index) => (
                    <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                            <p className="text-2xl font-bold text-midnight">{stat.value}</p>
                          </div>
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color === 'text-[#E17726]' ? 'from-[#E17726]/10 to-[#E17726]/5' : stat.color === 'text-aqua' ? 'from-aqua/10 to-aqua/5' : 'from-green-500/10 to-green-500/5'} flex items-center justify-center`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Today's Appointments & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Today's Appointments */}
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-xl font-bold text-midnight">Today's Consultations</CardTitle>
                                          <Button 
                      size="sm" 
                      className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                      onClick={() => setShowConsultationForm(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New
                    </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {loadingConsultations ? (
                        <div className="flex justify-center items-center min-h-[80px] text-gray-500">Loading today's consultations...</div>
                      ) : consultationsError ? (
                        <div className="flex justify-center items-center min-h-[80px] text-red-500">{consultationsError}</div>
                      ) : consultations.length === 0 ? (
                        <div className="flex justify-center items-center min-h-[80px] text-gray-400">No consultations scheduled for today.</div>
                      ) : (
                        consultations.map((consultation, index) => (
                          <div key={consultation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-4">
                              <img 
                                src="/patient-avatar-1.svg" 
                                alt="Patient" 
                                className="w-12 h-12 rounded-full"
                              />
                              <div>
                                <h4 className="font-semibold text-midnight">{consultation.patient_name}</h4>
                                <p className="text-sm text-gray-600">{consultation.doctor_name} • {consultation.consultation_type}</p>
                                <p className="text-xs text-gray-500">{consultation.scheduled_time} • ₹{consultation.consultation_fee}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge className={getStatusColor(consultation.status)}>
                                {consultation.status.replace('-', ' ')}
                              </Badge>
                              {consultation.status === 'scheduled' && (
                                <Button 
                                  size="sm" 
                                  className="bg-aqua hover:bg-aqua/90 text-white"
                                  onClick={() => endConsultation(consultation.id)}
                                >
                                  <Video className="w-4 h-4 mr-2" />
                                  Start
                                </Button>
                              )}
                            </div>
                            {(consultation.meeting_link || consultation.meetingLink) && (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                onClick={() => navigate(`/consultation-meeting?meeting=${encodeURIComponent(consultation.meeting_link || consultation.meetingLink || 'https://meet.jit.si/YourMeetingRoom')}`)}
                              >
                                <Video className="w-4 h-4 mr-2" />
                                Join Meeting
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>


              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              {!showPatientForm ? (
                <>
                {/* Search and Actions Bar */}
                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input 
                          placeholder="Search appointments by patient name, ID..." 
                          className="pl-10 h-11 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                        />
                      </div>
                      <Button variant="outline" className="border-gray-300 h-11 px-6 rounded-xl">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                      <Button 
                        onClick={() => setShowPatientForm(true)}
                        className="bg-[#E17726] hover:bg-[#c9651e] text-white h-11 px-6 rounded-xl"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Register Patient
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Appointments List */}
                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-midnight">All Appointments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {consultations.map((consultation, index) => (
                      <div key={consultation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-semibold text-[#E17726]">{consultation.id}</div>
                            <div className="text-xs text-gray-500">{consultation.scheduled_time}</div>
                          </div>
                          <img 
                            src="/patient-avatar-2.svg" 
                            alt="Patient" 
                            className="w-12 h-12 rounded-full"
                          />
                                                      <div>
                              <h4 className="font-semibold text-midnight">{consultation.patient_name}</h4>
                              <p className="text-sm text-gray-600 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {/* Assuming patient object exists or is accessible */}
                                {/* For now, using a placeholder or assuming it's part of the consultation object */}
                                {/* If patient object is not directly available, this will cause an error */}
                                {/* Based on the new_consultations mock, patient_name is directly available */}
                                {consultation.patient_name}
                              </p>
                              <p className="text-sm text-gray-600">{consultation.doctor_name} • {/* Assuming specialty is part of consultation object */}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="font-semibold text-midnight">₹{consultation.consultation_fee}</div>
                            <Badge className={getStatusColor(consultation.status)}>
                              {consultation.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="rounded-lg">
                              Edit
                            </Button>
                            {consultation.status === 'scheduled' && (
                              <Button 
                                size="sm" 
                                className="bg-aqua hover:bg-aqua/90 text-white rounded-lg"
                                onClick={() => endConsultation(consultation.id)}
                              >
                                <Video className="w-4 h-4 mr-2" />
                                Start
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-midnight">Book New Appointment</h2>
                    <Button 
                      onClick={() => setShowPatientForm(false)}
                      variant="outline"
                    >
                      Back to Appointments
                    </Button>
                  </div>
                  <div className="w-full">
                    {/* Removed AppointmentBookingForm */}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Patients Tab */}
          {activeTab === 'patients' && (
            <div className="space-y-6">
              {showConsultationForm ? (
                <div className="space-y-4">
                  <ConsultationCreationForm onClose={() => setShowConsultationForm(false)} />
                </div>
              ) : !showPatientForm ? (
                <>
                  {/* Patient Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Total Patients</p>
                            <p className="text-2xl font-bold text-midnight">1,247</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E17726]/10 to-[#E17726]/5 flex items-center justify-center">
                            <Users className="w-6 h-6 text-[#E17726]" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">New This Month</p>
                            <p className="text-2xl font-bold text-midnight">89</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
                            <UserPlus className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Active Cases</p>
                            <p className="text-2xl font-bold text-midnight">156</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Follow-ups Due</p>
                            <p className="text-2xl font-bold text-midnight">23</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-yellow-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Search and Actions Bar */}
                  <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input 
                            placeholder="Search patients by name, ID, phone..." 
                            className="pl-10 h-11 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                          />
                        </div>
                        <Button variant="outline" className="border-gray-300 h-11 px-6 rounded-xl">
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                        <Button 
                          onClick={() => setShowPatientForm(true)}
                          className="bg-[#E17726] hover:bg-[#c9651e] text-white h-11 px-6 rounded-xl"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Register Patient
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Patient List */}
                  <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-midnight">Patient Records</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { 
                          id: 'PAT001', 
                          name: 'Rahul Sharma', 
                          age: 34, 
                          gender: 'Male',
                          phone: '+91 98765 43210',
                          lastVisit: '2024-01-15',
                          condition: 'Hypertension',
                          status: 'active'
                        },
                        { 
                          id: 'PAT002', 
                          name: 'Anita Devi', 
                          age: 28, 
                          gender: 'Female',
                          phone: '+91 87654 32109',
                          lastVisit: '2024-01-14',
                          condition: 'Diabetes',
                          status: 'follow-up'
                        },
                        { 
                          id: 'PAT003', 
                          name: 'Suresh Gupta', 
                          age: 45, 
                          gender: 'Male',
                          phone: '+91 76543 21098',
                          lastVisit: '2024-01-10',
                          condition: 'Arthritis',
                          status: 'recovered'
                        },
                        { 
                          id: 'PAT004', 
                          name: 'Priya Patel', 
                          age: 31, 
                          gender: 'Female',
                          phone: '+91 65432 10987',
                          lastVisit: '2024-01-16',
                          condition: 'Migraine',
                          status: 'active'
                        }
                      ].map((patient, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-sm font-semibold text-[#E17726]">{patient.id}</div>
                              <div className="text-xs text-gray-500">Age: {patient.age}</div>
                            </div>
                            <img 
                              src="/patient-avatar-3.svg" 
                              alt="Patient" 
                              className="w-12 h-12 rounded-full"
                            />
                            <div>
                              <h4 className="font-semibold text-midnight">{patient.name}</h4>
                              <p className="text-sm text-gray-600 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {patient.phone}
                              </p>
                              <p className="text-sm text-gray-600">{patient.gender} • Last visit: {patient.lastVisit}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="font-semibold text-midnight">{patient.condition}</div>
                              <Badge className={
                                patient.status === 'active' ? 'bg-green-100 text-green-800' :
                                patient.status === 'follow-up' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }>
                                {patient.status}
                              </Badge>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="rounded-lg">
                                <FileText className="w-4 h-4 mr-2" />
                                Records
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-aqua hover:bg-aqua/90 text-white rounded-lg"
                                onClick={() => setShowConsultationForm(true)}
                              >
                                <Calendar className="w-4 h-4 mr-2" />
                                Book
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-midnight">Register New Patient</h2>
                    <Button 
                      onClick={() => setShowPatientForm(false)}
                      variant="outline"
                    >
                      Back to Patient Management
                    </Button>
                  </div>
                  <PatientRegistrationForm />
                </div>
              )}

              {/* Consultation Creation Form */}
              {showConsultationForm && (
                <div className="space-y-4">
                  <ConsultationCreationForm onClose={() => setShowConsultationForm(false)} />
                </div>
              )}

              {/* Consultation Management Flow */}
              {showConsultationManagement && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-midnight">Consultation Management</h2>
                    <Button 
                      onClick={() => setShowConsultationManagement(false)}
                      variant="outline"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                  {loadingClinics ? (
                    <div>Loading assigned clinics...</div>
                  ) : assignedClinics.length === 0 ? (
                    <div>No clinic assigned to this admin.</div>
                  ) : (
                    <ConsultationManagementFlow assignedClinics={assignedClinics} />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <PaymentsTab />
          )}

                    {/* Doctors Tab */}
          {activeTab === 'doctors' && (
            <div className="space-y-6">
              <AdminDoctorManagementTab />
            </div>
          )}

                    {/* Consultations Tab */}
          {activeTab === 'consultations' && (
            <div className="space-y-6">
              {showConsultationForm ? (
                <div className="space-y-4">
                  <ConsultationCreationForm onClose={() => setShowConsultationForm(false)} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-midnight">Consultation Management</h2>
                    <Button 
                      onClick={() => setShowConsultationForm(true)}
                      className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Create New Consultation
                    </Button>
                  </div>
                  <ConsultationManagementFlow />
                </div>
              )}
            </div>
          )}

          {/* Patient Management Tab */}
          {activeTab === 'patient-management' && (
            <PatientManagementTab />
          )}


        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AdminDashboard; 