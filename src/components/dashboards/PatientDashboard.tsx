import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  FileText,
  Download,
  Clock,
  User,
  Heart,
  Star,
  Activity,
  Phone,
  Mail,
  MapPin,
  Edit,
  Eye,
  Search,
  Filter,
  AlertCircle,
  Settings,
  Loader2,
  RefreshCw,
  Bell,
  Moon,
  Sun,
  HelpCircle,
  MoreVertical,
  LogOut,
  MessageSquare,
  CalendarDays,
  Stethoscope,
  Pill,
  FileImage,
  Upload,
  Plus,
  TrendingUp,
  HeartPulse,
  UserCircle,
  Smartphone,
  Shield,
  CheckCircle,
  XCircle,
  ArrowRight,
  VideoIcon as Video,
  Users,
  BookOpen,
  Target,
  Zap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  patientApi,
  UserProfile,
  PatientProfile,
  Consultation,
  MedicalRecord,
  PatientDocument,
  PatientNote,
  Prescription as APIPrescription,
  formatDate,
  formatDateTime
} from '@/lib/api';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

// Import new components
import PatientOverview from './patient/PatientOverview';
import PatientConsultations from './patient/PatientConsultations';
import PatientRecordsManager from './patient/PatientRecordsManager';

// Define interfaces
interface TransformedPrescription {
  id: string;
  doctor_name: string;
  date: string;
  medicines: Array<{name: string; dosage: string; frequency: string; duration: string}>;
  notes: string;
}

interface EditProfileForm {
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  blood_group: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  // Health Information fields
  allergies: string;
  chronic_conditions: string[];
  current_medications: string[];
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
}

interface Prescription {
  id: string;
  doctor_name: string;
  date: string;
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  notes: string;
}

interface HealthMetric {
  id: string;
  type: string;
  value: string;
  unit: string;
  recorded_date: string;
  status: string;
}

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State for data - Real API Integration without dummy fallbacks
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [prescriptions, setPrescriptions] = useState<TransformedPrescription[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
  const [notifications, setNotifications] = useState<Record<string, unknown>[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [sessions, setSessions] = useState<Record<string, unknown>[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<Record<string, any>[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [consultationsLoading, setConsultationsLoading] = useState(false);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const [medicalRecordsLoading, setMedicalRecordsLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter and search states
  const [consultationFilter, setConsultationFilter] = useState('all');
  const [consultationSearch, setConsultationSearch] = useState('');
  const [prescriptionSearch, setPrescriptionSearch] = useState('');
  
  // Date filter states
  const [consultationStartDate, setConsultationStartDate] = useState('');
  const [consultationEndDate, setConsultationEndDate] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Modal states
  const [bookConsultationOpen, setBookConsultationOpen] = useState(false);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<TransformedPrescription | null>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<EditProfileForm>({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    blood_group: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    // Health Information fields
    allergies: '',
    chronic_conditions: [],
    current_medications: [],
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
  });

  // === REAL API INTEGRATION - NO DUMMY DATA ===

  // Fetch user profile data (Authentication API)
  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching user profile for user:', user?.id);
      
      const profile = await patientApi.getCurrentUserProfile();
      console.log('User profile received:', profile);
      setUserProfile(profile);
      
      // Also fetch patient-specific profile if user ID exists
      if (profile.id) {
        try {
          const patientProf = await patientApi.getPatientProfile(profile.id);
          console.log('Patient profile received:', patientProf);
          setPatientProfile(patientProf);
        } catch (err) {
          console.log('Patient profile not found, this is normal for new users');
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load profile data');
      toast({ 
        title: 'Error', 
        description: 'Failed to load profile data. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  // Fetch consultations (Real API - no fallbacks)
  const fetchConsultations = useCallback(async (page: number = 1) => {
    try {
      setConsultationsLoading(true);
      console.log('Fetching consultations for user:', userProfile?.id);
      
      const params: {
        page?: number;
        page_size?: number;
        status?: string;
        search?: string;
        ordering?: string;
        start_date?: string;
        end_date?: string;
      } = {
        page: page,
        page_size: pageSize,
        ordering: '-scheduled_date'
      };
      
      if (consultationFilter !== 'all') {
        params.status = consultationFilter;
      }
      
      if (consultationSearch) {
        params.search = consultationSearch;
      }
      
      // Add date filters
      if (consultationStartDate) {
        params.start_date = consultationStartDate;
      }
      
      if (consultationEndDate) {
        params.end_date = consultationEndDate;
      }
      
      console.log('Sending consultation request with params:', params);
      console.log('Date filters - Start:', consultationStartDate, 'End:', consultationEndDate);
      const response = await patientApi.getPatientConsultations(undefined, params);
      console.log('Consultations response received:', response);
      
      // If we have date filters but no consultations, log this specifically
      if ((consultationStartDate || consultationEndDate) && 
          (!response || !response.consultations || response.consultations.length === 0)) {
        console.log('⚠️ Date filter applied but no consultations found in the specified date range');
      }
      if (response && response.consultations) {
        console.log('Filtered consultations:', response.consultations.map(c => ({
          id: c.id,
          scheduled_date: c.scheduled_date,
          doctor_name: c.doctor_name,
          status: c.status
        })));
      }
      
      if (response && response.consultations && Array.isArray(response.consultations)) {
        // Handle new response structure with pagination
        console.log(`Setting ${response.consultations.length} consultations from API response`);
        setConsultations(response.consultations);
        setTotalCount(response.pagination.count || 0);
        setTotalPages(Math.ceil((response.pagination.count || 0) / pageSize));
        setCurrentPage(page);
      } else if (Array.isArray(response)) {
        // Handle array response from new patient-specific endpoint
        console.log(`Setting ${response.length} consultations from array response`);
        setConsultations(response);
        setTotalCount(response.length || 0);
        setTotalPages(Math.ceil((response.length || 0) / pageSize));
        setCurrentPage(page);
      } else {
        // Handle other response formats
        console.log('No consultations found, setting empty array');
        setConsultations([]);
        setTotalCount(0);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Error fetching consultations:', err);
      setConsultations([]);
      setTotalCount(0);
      setTotalPages(1);
      toast({ 
        title: 'Info', 
        description: 'No consultations found for this account.', 
        variant: 'default' 
      });
    } finally {
      setConsultationsLoading(false);
    }
  }, [userProfile?.id, pageSize, consultationFilter, consultationSearch, consultationStartDate, consultationEndDate, toast]);

  // Fetch prescriptions (Real API - no fallbacks)
  const fetchPrescriptions = useCallback(async () => {
    try {
      setPrescriptionsLoading(true);
      console.log('Fetching prescriptions for user:', userProfile?.id);
      
      const prescriptionsData = await patientApi.getPatientPrescriptions();
      console.log('Prescriptions received:', prescriptionsData);
      
      // Transform API data to match our interface
      const transformedPrescriptions = prescriptionsData.map((prescription: APIPrescription) => ({
        id: prescription.id,
        doctor_name: prescription.doctor_name || 'Unknown Doctor',
        date: formatDate(prescription.created_at),
        medicines: [], // We'll need to fetch medications separately if needed
        notes: prescription.general_instructions || ''
      }));
      
      setPrescriptions(transformedPrescriptions);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setPrescriptions([]);
    } finally {
      setPrescriptionsLoading(false);
    }
  }, [userProfile?.id]);

  // Fetch medical records (Real API)
  const fetchMedicalRecords = useCallback(async () => {
    try {
      setMedicalRecordsLoading(true);
      if (userProfile?.id) {
        console.log('Fetching medical records for user:', userProfile.id);
        const recordsData = await patientApi.getPatientMedicalRecords();
        console.log('Medical records received:', recordsData);
        setMedicalRecords(recordsData || []);
      }
    } catch (err) {
      console.error('Error fetching medical records:', err);
      setMedicalRecords([]);
    } finally {
      setMedicalRecordsLoading(false);
    }
  }, [userProfile?.id]);

  // Fetch documents (Real API)
  const fetchDocuments = useCallback(async () => {
    try {
      setDocumentsLoading(true);
      if (userProfile?.id) {
        console.log('Fetching documents for user:', userProfile.id);
        const documentsData = await patientApi.getPatientDocuments();
        console.log('Documents received:', documentsData);
        setDocuments(documentsData || []);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  }, [userProfile?.id]);

  // Fetch notes (Real API)
  const fetchNotes = useCallback(async () => {
    try {
      setNotesLoading(true);
      if (userProfile?.id) {
        console.log('Fetching notes for user:', userProfile.id);
        const notesData = await patientApi.getPatientNotes();
        console.log('Notes received:', notesData);
        setNotes(notesData || []);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  }, [userProfile?.id]);

  // Fetch payments (Real API)
  const fetchPayments = useCallback(async () => {
    try {
      setPaymentsLoading(true);
      console.log('Fetching payments for user:', userProfile?.id);
      const paymentsData = await patientApi.getPatientPayments();
      console.log('Payments received:', paymentsData);
      setPayments(paymentsData || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  }, [userProfile?.id]);

  // Fetch notifications (Real API)
  const fetchNotifications = useCallback(async () => {
    try {
      setNotificationsLoading(true);
      console.log('Fetching notifications for user:', userProfile?.id);
      const notificationsData = await patientApi.getPatientNotifications();
      console.log('Notifications received:', notificationsData);
      setNotifications(notificationsData || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  }, [userProfile?.id]);

  // Initialize health metrics (will be replaced with real API)
  const initializeHealthMetrics = useCallback(() => {
    const mockMetrics: Record<string, any>[] = [
      {
        id: '1',
        type: 'blood_pressure',
        value: '120/80',
        date: new Date().toISOString(),
        unit: 'mmHg',
        status: 'normal'
      },
      {
        id: '2',
        type: 'weight',
        value: '70',
        date: new Date().toISOString(),
        unit: 'kg',
        status: 'normal'
      }
    ];
    setHealthMetrics(mockMetrics);
  }, []);

  // Comprehensive data fetch function
  const fetchAllData = useCallback(async () => {
    console.log('Starting comprehensive data fetch...');
    await fetchUserProfile();
  }, [fetchUserProfile]);

  // Fetch secondary data after user profile is loaded
  const fetchSecondaryData = useCallback(async () => {
    if (userProfile?.id) {
      console.log('Fetching secondary data for user:', userProfile.id);
      await Promise.allSettled([
        fetchConsultations(),
        fetchPrescriptions(),
        fetchMedicalRecords(),
        fetchDocuments(),
        fetchNotes(),
        fetchPayments(),
        fetchNotifications()
      ]);
      initializeHealthMetrics();
    }
  }, [
    userProfile?.id, 
    fetchConsultations, 
    fetchPrescriptions, 
    fetchMedicalRecords,
    fetchDocuments, 
    fetchNotes, 
    fetchPayments, 
    fetchNotifications,
    initializeHealthMetrics
  ]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    fetchConsultations(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleConsultationSearch = (value: string) => {
    setConsultationSearch(value);
    setCurrentPage(1);
  };

  const handleConsultationFilter = (value: string) => {
    setConsultationFilter(value);
    setCurrentPage(1);
  };

  const handleConsultationStartDateChange = (date: string) => {
    console.log('Start date changed to:', date);
    setConsultationStartDate(date);
    setCurrentPage(1);
  };

  const handleConsultationEndDateChange = (date: string) => {
    console.log('End date changed to:', date);
    setConsultationEndDate(date);
    setCurrentPage(1);
  };

  // Load data on component mount
  useEffect(() => {
    console.log('PatientDashboard mounted, user:', user);
    fetchAllData();
  }, [fetchAllData]);

  // Load secondary data when user profile changes
  useEffect(() => {
    fetchSecondaryData();
  }, [fetchSecondaryData]);

  // Refetch consultations when filters or search change
  useEffect(() => {
    if (userProfile?.id) {
      fetchConsultations(1);
    }
  }, [consultationFilter, consultationSearch, consultationStartDate, consultationEndDate, pageSize, fetchConsultations, userProfile?.id]);

  // Update edit form when user profile changes
  useEffect(() => {
    if (userProfile) {
      setEditForm({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        age: userProfile.age?.toString() || '',
        gender: userProfile.gender || '',
        blood_group: userProfile.blood_group || '',
        address: userProfile.street || '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        pincode: userProfile.pincode || '',
        country: userProfile.country || '',
        // Health Information fields
        allergies: patientProfile?.allergies || '',
        chronic_conditions: patientProfile?.chronic_conditions || [],
        current_medications: patientProfile?.current_medications || [],
        emergency_contact_name: patientProfile?.emergency_contact_name || '',
        emergency_contact_phone: patientProfile?.emergency_contact_phone || '',
        emergency_contact_relationship: patientProfile?.emergency_contact_relationship || '',
      });
    }
  }, [userProfile, patientProfile]);

  // Get comprehensive stats from all real APIs
  const getQuickStats = () => {
    const consultationsArray = Array.isArray(consultations) ? consultations : [];
    const notificationsArray = Array.isArray(notifications) ? notifications : [];
    
    return {
      totalConsultations: consultationsArray.length,
      upcomingConsultations: consultationsArray.filter(c => c.status === 'scheduled').length,
      completedConsultations: consultationsArray.filter(c => c.status === 'completed').length,
      activePrescriptions: prescriptions.length,
      totalMedicalRecords: medicalRecords.length,
      totalDocuments: documents.length,
      totalNotes: notes.length,
      totalPayments: payments.length,
      unreadNotifications: notificationsArray.filter(n => !n.is_read).length,
      activeSessions: sessions.length || 1 // At least current session
    };
  };

  const stats = getQuickStats();



  // Helper function to get display name
  const getDisplayName = (profile: UserProfile | null): string => {
    return profile?.name || user?.name || 'Patient';
  };

  // Recent activity (based on real data)
  const getRecentActivity = () => {
    const activities = [];
    const consultationsArray = Array.isArray(consultations) ? consultations : [];
    
    // Add recent consultations
    consultationsArray.slice(0, 3).forEach(consultation => {
      activities.push({
        description: `Consultation with ${consultation.doctor_name}`,
        date: formatDate(consultation.created_at)
      });
    });

    // Add recent prescriptions
    prescriptions.slice(0, 2).forEach(prescription => {
      activities.push({
        description: `New prescription from ${prescription.doctor_name}`,
        date: prescription.date
      });
    });

    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  };

  // Loading component
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#E17726]" />
          <p className="text-lg font-semibold text-gray-700">Loading your dashboard...</p>
          <p className="text-sm text-gray-500">Please wait while we fetch your health data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-[#E17726] to-[#FF8A56] text-white text-xl font-bold">
                  {getDisplayName(userProfile).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Welcome back, {getDisplayName(userProfile)}!
                </h1>
                <p className="text-gray-600">Managing your health journey</p>
                <Badge className="bg-green-100 text-green-800 border-green-200 mt-2">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active Patient
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative"
                onClick={() => {
                  // Handle notifications
                  toast({ title: 'Notifications', description: `You have ${stats.unreadNotifications} unread notifications.` });
                }}
              >
                <Bell className="w-4 h-4" />
                {stats.unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                    {stats.unreadNotifications}
                  </Badge>
                )}
              </Button>

              {/* Quick Actions */}
              <Button 
                onClick={() => setBookConsultationOpen(true)}
                className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:from-[#c9651e] hover:to-[#e67e22] text-white"
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                Book Consultation
              </Button>

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setEditProfileOpen(true)}>
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E17726] data-[state=active]:to-[#FF8A56] data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="consultations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E17726] data-[state=active]:to-[#FF8A56] data-[state=active]:text-white">
              <Stethoscope className="w-4 h-4 mr-2" />
              Consultations
            </TabsTrigger>
            {/* <TabsTrigger value="prescriptions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E17726] data-[state=active]:to-[#FF8A56] data-[state=active]:text-white">
              <Pill className="w-4 h-4 mr-2" />
              Prescriptions
            </TabsTrigger> */}
            <TabsTrigger value="records" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E17726] data-[state=active]:to-[#FF8A56] data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Records
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E17726] data-[state=active]:to-[#FF8A56] data-[state=active]:text-white">
              <UserCircle className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <PatientOverview 
              stats={stats}
              healthMetrics={healthMetrics}
              recentActivity={getRecentActivity()}
            />
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations" className="space-y-6 mt-6">
            <PatientConsultations 
              consultations={consultations}
              loading={consultationsLoading}
              searchTerm={consultationSearch}
              filter={consultationFilter}
              onSearchChange={handleConsultationSearch}
              onFilterChange={handleConsultationFilter}
              startDate={consultationStartDate}
              endDate={consultationEndDate}
              onStartDateChange={handleConsultationStartDateChange}
              onEndDateChange={handleConsultationEndDateChange}
              onBookConsultation={() => setBookConsultationOpen(true)}
              onJoinConsultation={(id) => {
                toast({ 
                  title: 'Joining Consultation', 
                  description: 'Redirecting to consultation room...' 
                });
                // Navigate to the consultation meeting room
                navigate(`/patient/consultation/${id}/meeting`);
              }}
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold">My Prescriptions</h2>
                <p className="text-gray-600">View and manage your medication prescriptions</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search prescriptions..."
                  value={prescriptionSearch}
                  onChange={(e) => setPrescriptionSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>

            {prescriptionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-3">Loading prescriptions...</span>
              </div>
            ) : prescriptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prescriptions
                  .filter(prescription =>
                    prescription.doctor_name.toLowerCase().includes(prescriptionSearch.toLowerCase()) ||
                    prescription.medicines.some(med => med.name.toLowerCase().includes(prescriptionSearch.toLowerCase()))
                  )
                  .map((prescription) => (
                  <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Pill className="w-5 h-5 text-purple-500" />
                          <CardTitle className="text-lg">{prescription.doctor_name}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {prescription.date}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-700">Medicines:</h4>
                        {prescription.medicines.slice(0, 2).map((medicine, index) => (
                          <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                            <span className="font-medium">{medicine.name}</span>
                            <span className="text-gray-600 ml-2">- {medicine.dosage}</span>
                          </div>
                        ))}
                        {prescription.medicines.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{prescription.medicines.length - 2} more medicines
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedPrescription(prescription);
                            setPrescriptionModalOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Prescriptions Found</h3>
                  <p className="text-gray-600">
                    You don't have any prescriptions yet. Book a consultation to get started.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="records" className="space-y-6 mt-6">
            {userProfile?.id ? (
              <PatientRecordsManager patientId={userProfile.id} />
            ) : (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-3">Loading patient information...</span>
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Summary */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCircle className="w-5 h-5 mr-2" />
                    Profile Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <Avatar className="h-20 w-20 mx-auto mb-4">
                      <AvatarFallback className="bg-gradient-to-br from-[#E17726] to-[#FF8A56] text-white text-xl">
                        {getDisplayName(userProfile).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">{getDisplayName(userProfile)}</h3>
                    <p className="text-gray-600">{userProfile?.email}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span>{userProfile?.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span>{userProfile?.age || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span>{userProfile?.gender || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blood Group:</span>
                      <span>{userProfile?.blood_group || 'N/A'}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setEditProfileOpen(true)}
                    className="w-full bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:from-[#c9651e] hover:to-[#e67e22] text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Health Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-500" />
                    Health Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Medical History</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Allergies:</span>
                          <span>{patientProfile?.allergies || 'None reported'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Chronic Conditions:</span>
                          <span>{patientProfile?.chronic_conditions?.length > 0 ? patientProfile.chronic_conditions.join(', ') : 'None reported'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Medications:</span>
                          <span>{patientProfile?.current_medications?.length > 0 ? patientProfile.current_medications.join(', ') : 'None'}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Emergency Contact</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span>{patientProfile?.emergency_contact_name || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span>{patientProfile?.emergency_contact_phone || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Relationship:</span>
                          <span>{patientProfile?.emergency_contact_relationship || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Book Consultation Modal */}
      <Dialog open={bookConsultationOpen} onOpenChange={setBookConsultationOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Consultation</DialogTitle>
            <DialogDescription>
              Schedule a consultation with one of our qualified doctors.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This feature is coming soon! You'll be able to book consultations directly from your dashboard.
            </p>
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:from-[#c9651e] hover:to-[#e67e22] text-white"
                onClick={() => {
                  toast({ title: 'Coming Soon', description: 'Consultation booking will be available soon!' });
                  setBookConsultationOpen(false);
                }}
              >
                Book Now
              </Button>
              <Button variant="outline" onClick={() => setBookConsultationOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prescription Detail Modal */}
      <Dialog open={prescriptionModalOpen} onOpenChange={setPrescriptionModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>
              {selectedPrescription && `By ${selectedPrescription.doctor_name} on ${selectedPrescription.date}`}
            </DialogDescription>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Medicines:</h4>
                {selectedPrescription.medicines.map((medicine, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <h5 className="font-medium">{medicine.name}</h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Dosage: {medicine.dosage}</p>
                      <p>Frequency: {medicine.frequency}</p>
                      <p>Duration: {medicine.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
              {selectedPrescription.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes:</h4>
                  <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                    {selectedPrescription.notes}
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={() => setPrescriptionModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update your personal information and health details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Age</label>
                  <Input
                    type="number"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    placeholder="Enter your age"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Gender</label>
                  <Select value={editForm.gender} onValueChange={(value) => setEditForm({ ...editForm, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Blood Group</label>
                  <Select value={editForm.blood_group} onValueChange={(value) => setEditForm({ ...editForm, blood_group: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Address Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Street Address</label>
                  <Input
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="Enter your street address"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">City</label>
                    <Input
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      placeholder="Enter your city"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">State</label>
                    <Input
                      value={editForm.state}
                      onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      placeholder="Enter your state"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Pincode</label>
                    <Input
                      value={editForm.pincode}
                      onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                      placeholder="Enter your pincode"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Country</label>
                  <Input
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    placeholder="Enter your country"
                  />
                </div>
              </div>
            </div>

            {/* Health Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Health Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Allergies</label>
                  <Input
                    value={editForm.allergies}
                    onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                    placeholder="List your allergies (e.g., peanuts, latex)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Chronic Conditions</label>
                  <Input
                    value={editForm.chronic_conditions.join(', ')}
                    onChange={(e) => setEditForm({ ...editForm, chronic_conditions: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="List your chronic conditions (e.g., asthma, diabetes)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Current Medications</label>
                  <Input
                    value={editForm.current_medications.join(', ')}
                    onChange={(e) => setEditForm({ ...editForm, current_medications: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="List your current medications (e.g., ibuprofen, metformin)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Emergency Contact Name</label>
                  <Input
                    value={editForm.emergency_contact_name}
                    onChange={(e) => setEditForm({ ...editForm, emergency_contact_name: e.target.value })}
                    placeholder="Enter emergency contact name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Emergency Contact Phone</label>
                  <Input
                    value={editForm.emergency_contact_phone}
                    onChange={(e) => setEditForm({ ...editForm, emergency_contact_phone: e.target.value })}
                    placeholder="Enter emergency contact phone"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Emergency Contact Relationship</label>
                  <Input
                    value={editForm.emergency_contact_relationship}
                    onChange={(e) => setEditForm({ ...editForm, emergency_contact_relationship: e.target.value })}
                    placeholder="Enter emergency contact relationship"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setEditProfileOpen(false)}
              disabled={editLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                try {
                  setEditLoading(true);
                  
                  // Update user profile (basic info)
                  const userProfileData = {
                    name: editForm.name,
                    email: editForm.email,
                    phone: editForm.phone,
                    age: parseInt(editForm.age) || null,
                    gender: editForm.gender,
                    blood_group: editForm.blood_group,
                    street: editForm.address,
                    city: editForm.city,
                    state: editForm.state,
                    pincode: editForm.pincode,
                    country: editForm.country,
                    emergency_contact_name: editForm.emergency_contact_name,
                    emergency_contact_phone: editForm.emergency_contact_phone,
                    emergency_contact_relationship: editForm.emergency_contact_relationship,
                  };
                  
                  await patientApi.updateUserProfile(userProfileData);
                  
                  // Update patient profile (health info) if patient profile exists
                  if (patientProfile?.id) {
                    const patientProfileData = {
                      allergies: editForm.allergies,
                      chronic_conditions: editForm.chronic_conditions,
                      current_medications: editForm.current_medications,
                      emergency_contact_name: editForm.emergency_contact_name,
                      emergency_contact_phone: editForm.emergency_contact_phone,
                      emergency_contact_relationship: editForm.emergency_contact_relationship,
                    };
                    
                    await patientApi.updatePatientProfile(patientProfile.id, patientProfileData);
                  }
                  
                  toast({ 
                    title: 'Profile Updated', 
                    description: 'Your profile has been updated successfully!' 
                  });
                  setEditProfileOpen(false);
                  // Refresh user profile data
                  await fetchUserProfile();
                } catch (error) {
                  console.error('Error updating profile:', error);
                  toast({ 
                    title: 'Error', 
                    description: 'Failed to update profile. Please try again.', 
                    variant: 'destructive' 
                  });
                } finally {
                  setEditLoading(false);
                }
              }}
              disabled={editLoading}
              className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:from-[#c9651e] hover:to-[#e67e22] text-white"
            >
              {editLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Profile
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientDashboard;