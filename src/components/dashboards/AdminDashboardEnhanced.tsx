import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  FileText, 
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
  Building2,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Star,
  CalendarDays,
  UserCheck,
  UserX,
  FileCheck,
  FileX,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  adminAnalyticsApi, 
  AdminDashboardStats, 
  Consultation, 
  adminConsultationApi, 
  EClinic,
  adminPatientApi,
  PatientProfile,
  PatientStats,
  PaginatedResponse
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { superAdminApi } from '@/lib/api';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import EnhancedPatientManagementTab from '@/components/forms/EnhancedPatientManagementTab';
import ConsultationManagementEnhanced from '@/components/forms/ConsultationManagementEnhanced';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

// Enhanced Admin Dashboard Component
const AdminDashboardEnhanced = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null);
  const [patientStats, setPatientStats] = useState<PatientStats | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [assignedClinics, setAssignedClinics] = useState<EClinic[]>([]);
  
  // Loading states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingConsultations, setLoadingConsultations] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingClinics, setLoadingClinics] = useState(true);
  
  // Error states
  const [statsError, setStatsError] = useState<string | null>(null);
  const [consultationsError, setConsultationsError] = useState<string | null>(null);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [clinicsError, setClinicsError] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPatients, setTotalPatients] = useState(0);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');

  // Warning dialog state
  const [showNoClinicWarning, setShowNoClinicWarning] = useState(false);

  // Check if admin is assigned to any clinic
  const isAssignedToClinic = assignedClinics.length > 0;

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      setStatsError(null);
      const stats = await adminAnalyticsApi.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStatsError('Failed to load dashboard statistics');
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch patient statistics
  const fetchPatientStats = useCallback(async () => {
    try {
      const stats = await adminPatientApi.getPatientStats();
      setPatientStats(stats);
    } catch (error) {
      console.error('Error fetching patient stats:', error);
      toast.error('Failed to load patient statistics');
    }
  }, []);

  // Fetch today's consultations
  const fetchConsultations = useCallback(async () => {
    try {
      setLoadingConsultations(true);
      setConsultationsError(null);
      const data = await adminConsultationApi.getTodaysConsultations();
      setConsultations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      setConsultationsError('Failed to load today\'s consultations');
      toast.error('Failed to load consultations');
      setConsultations([]);
    } finally {
      setLoadingConsultations(false);
    }
  }, []);

  // Fetch patients with pagination and filters
  const fetchPatients = useCallback(async () => {
    try {
      setLoadingPatients(true);
      setPatientsError(null);
      
      const params: Record<string, string | number> = {
        page: currentPage,
        page_size: pageSize,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active' ? 'true' : 'false';
      if (genderFilter !== 'all') params.gender = genderFilter;
      
      const response = await adminPatientApi.getPatients(params);
      setPatients(response.results);
      setTotalPatients(response.count);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatientsError('Failed to load patients');
      toast.error('Failed to load patients');
    } finally {
      setLoadingPatients(false);
    }
  }, [currentPage, pageSize, searchQuery, statusFilter, genderFilter]);

  // Fetch assigned clinics
  const fetchAssignedClinics = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    
    try {
      setLoadingClinics(true);
      setClinicsError(null);
      const data = await superAdminApi.getEClinics({ page: 1, page_size: 10 });
      const filteredClinics = data.results.filter((clinic) => clinic.admin === user.id);
      setAssignedClinics(filteredClinics);
    } catch (error) {
      console.error('Error fetching assigned clinics:', error);
      setClinicsError('Failed to load assigned clinics');
      toast.error('Failed to load assigned clinics');
    } finally {
      setLoadingClinics(false);
    }
  }, [user]);

  // Initialize data on component mount
  useEffect(() => {
    fetchDashboardStats();
    fetchPatientStats();
    fetchConsultations();
    fetchPatients();
    fetchAssignedClinics();
  }, [fetchDashboardStats, fetchPatientStats, fetchConsultations, fetchPatients, fetchAssignedClinics]);

  // Show warning when admin is not assigned to any clinic
  useEffect(() => {
    if (!loadingClinics && !isAssignedToClinic && user?.role === 'admin') {
      setShowNoClinicWarning(true);
    }
  }, [loadingClinics, isAssignedToClinic, user?.role]);

  // Refresh data
  const handleRefresh = () => {
    fetchDashboardStats();
    fetchPatientStats();
    fetchConsultations();
    fetchPatients();
    fetchAssignedClinics();
    toast.success('Dashboard refreshed successfully');
  };

  // Handle patient actions
  const handlePatientAction = async (action: string, patientId: string) => {
    try {
      switch (action) {
        case 'view':
          navigate(`/admin/patients/${patientId}`);
          break;
        case 'edit':
          navigate(`/admin/patients/${patientId}/edit`);
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this patient?')) {
            await adminPatientApi.deletePatient(patientId);
            toast.success('Patient deleted successfully');
            fetchPatients();
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action} on patient:`, error);
      toast.error(`Failed to ${action} patient`);
    }
  };

  // Handle consultation actions
  const handleConsultationAction = (consultationId: string, action: string) => {
    switch (action) {
      case 'view':
        navigate(`/admin/consultations/${consultationId}`);
        break;
      case 'join':
        navigate(`/consultation-meeting?meeting=${encodeURIComponent(`https://meet.jit.si/Consultation-${consultationId}`)}`);
        break;
      default:
        break;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Stats cards data
  const statsCards = [
    {
      title: "Today's Consultations",
      value: dashboardStats?.consultations_today || 0,
      icon: Video,
      color: 'text-[#E17726]',
      bgColor: 'bg-[#E17726]/10',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: "Total Patients",
      value: dashboardStats?.total_patients || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: "Total Revenue",
      value: `₹${dashboardStats?.total_revenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+15%',
      changeType: 'positive' as const
    },
    {
      title: "Active Doctors",
      value: dashboardStats?.active_doctors || 0,
      icon: UserCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+5%',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              {user && user.role === 'admin' && assignedClinics.length > 0 && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  <Building2 className="w-3 h-3 mr-1" />
                  {assignedClinics[0].name}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={loadingStats}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingStats ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={() => navigate('/admin/patients/new')}
                className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                disabled={!isAssignedToClinic}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
              <Button 
                onClick={() => navigate('/admin/consultations/new')}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                disabled={!isAssignedToClinic}
              >
                <Calendar className="w-4 h-4 mr-2" />
                New Consultation
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* No Clinic Assignment Warning Banner */}
        {!loadingClinics && !isAssignedToClinic && user?.role === 'admin' && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800">No E-Clinic Assignment</AlertTitle>
            <AlertDescription className="text-orange-700">
              You have not been assigned to any e-clinic. Most dashboard features are disabled. 
              <Button 
                variant="link" 
                className="p-0 h-auto text-orange-700 underline ml-1"
                onClick={() => setShowNoClinicWarning(true)}
              >
                Click here for more information
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alerts */}
        {statsError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Dashboard Error</AlertTitle>
            <AlertDescription className="text-red-700">{statsError}</AlertDescription>
          </Alert>
        )}

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white rounded-xl p-2 shadow-sm border border-gray-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#E17726] data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="patients" 
              className="data-[state=active]:bg-[#E17726] data-[state=active]:text-white"
              disabled={!isAssignedToClinic}
            >
              <Users className="w-4 h-4 mr-2" />
              Patients
            </TabsTrigger>
            <TabsTrigger 
              value="consultations" 
              className="data-[state=active]:bg-[#E17726] data-[state=active]:text-white"
              disabled={!isAssignedToClinic}
            >
              <Video className="w-4 h-4 mr-2" />
              Consultations
            </TabsTrigger>

            <TabsTrigger 
              value="payments" 
              className="data-[state=active]:bg-[#E17726] data-[state=active]:text-white"
              disabled={!isAssignedToClinic}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* No Clinic Assignment Warning in Overview */}
            {!loadingClinics && !isAssignedToClinic && user?.role === 'admin' && (
              <Card className="border-orange-200 bg-orange-50 shadow-lg rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-orange-800 mb-2">No E-Clinic Assignment</h3>
                      <p className="text-orange-700 mb-4">
                        You have not been assigned to any e-clinic yet. The statistics shown below may not reflect your actual data. 
                        Please contact the super admin to get assigned to an e-clinic.
                      </p>
                      <div className="flex space-x-3">
                        <Button 
                          variant="outline" 
                          className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
                          onClick={() => setShowNoClinicWarning(true)}
                        >
                          Learn More
                        </Button>
                        <Button 
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                          onClick={() => {
                            toast.info('Please contact the super admin to get assigned to an e-clinic');
                          }}
                        >
                          Contact Super Admin
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <div className="flex items-center mt-2">
                          {stat.changeType === 'positive' ? (
                            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                          )}
                          <span className={`text-sm font-medium ${
                            stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.change}
                          </span>
                        </div>
                      </div>
                      <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Today's Consultations */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900">Today's Consultations</CardTitle>
                <Button 
                  size="sm" 
                  className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                  onClick={() => navigate('/admin/consultations/new')}
                  disabled={!isAssignedToClinic}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Consultation
                </Button>
              </CardHeader>
              <CardContent>
                {loadingConsultations ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                        <Skeleton className="h-8 w-[100px]" />
                      </div>
                    ))}
                  </div>
                ) : consultationsError ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{consultationsError}</AlertDescription>
                  </Alert>
                ) : !Array.isArray(consultations) || consultations.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations today</h3>
                    <p className="text-gray-500 mb-4">No consultations are scheduled for today.</p>
                    <Button 
                      onClick={() => navigate('/admin/consultations/new')}
                      className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                      disabled={!isAssignedToClinic}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Consultation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(consultations) && consultations.slice(0, 5).map((consultation) => (
                      <div key={consultation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src="/patient-avatar-1.svg" />
                            <AvatarFallback>{consultation.patient_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900">{consultation.patient_name}</h4>
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
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleConsultationAction(consultation.id, 'join')}
                            >
                              <Video className="w-4 h-4 mr-2" />
                              Join
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
                            <EnhancedPatientManagementTab />
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations" className="space-y-6">
            <ConsultationManagementEnhanced isAssignedToClinic={isAssignedToClinic} />
          </TabsContent>



          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Payment Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Management</h3>
                  <p className="text-gray-500 mb-4">Payment management features will be available soon.</p>
                  <Button variant="outline" disabled>
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* No Clinic Assignment Warning Dialog */}
      <Dialog open={showNoClinicWarning} onOpenChange={setShowNoClinicWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>No E-Clinic Assignment</span>
            </DialogTitle>
            <DialogDescription className="text-gray-700">
              You have not been assigned to any e-clinic yet. Please contact the super admin to get assigned to an e-clinic before you can access the dashboard features.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">Access Restricted</AlertTitle>
              <AlertDescription className="text-orange-700">
                You cannot perform any actions until you are assigned to an e-clinic.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowNoClinicWarning(false)}
              >
                Close
              </Button>
              <Button 
                className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                onClick={() => {
                  setShowNoClinicWarning(false);
                  // You could add navigation to contact super admin here
                  toast.info('Please contact the super admin to get assigned to an e-clinic');
                }}
              >
                Contact Super Admin
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboardEnhanced; 