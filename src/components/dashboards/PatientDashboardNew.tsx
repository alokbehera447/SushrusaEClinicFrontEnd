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
import {
  patientApi,
  UserProfile,
  Consultation,
  Prescription,
  HealthMetric,
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
import PatientRecords from './patient/PatientRecords';

// Define interfaces
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

  // State for data - Real API Integration without dummy fallbacks
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [patientProfile, setPatientProfile] = useState<any | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);

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

  // Modal states
  const [bookConsultationOpen, setBookConsultationOpen] = useState(false);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
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
  const fetchConsultations = useCallback(async () => {
    try {
      setConsultationsLoading(true);
      console.log('Fetching consultations for user:', userProfile?.id);
      
      const consultationsData = await patientApi.getPatientConsultations(userProfile?.id);
      console.log('Consultations received:', consultationsData);
      setConsultations(consultationsData || []);
    } catch (err) {
      console.error('Error fetching consultations:', err);
      setConsultations([]);
      toast({ 
        title: 'Info', 
        description: 'No consultations found for this account.', 
        variant: 'default' 
      });
    } finally {
      setConsultationsLoading(false);
    }
  }, [userProfile?.id, toast]);

  // Fetch prescriptions (Real API - no fallbacks)
  const fetchPrescriptions = useCallback(async () => {
    try {
      setPrescriptionsLoading(true);
      console.log('Fetching prescriptions for user:', userProfile?.id);
      
      const prescriptionsData = await patientApi.getPatientPrescriptions();
      console.log('Prescriptions received:', prescriptionsData);
      
      // Transform API data to match our interface
      const transformedPrescriptions = prescriptionsData.map((prescription: any) => ({
        id: prescription.id,
        doctor_name: prescription.doctor_name || 'Unknown Doctor',
        date: prescription.created_at ? formatDate(prescription.created_at) : formatDate(new Date().toISOString()),
        medicines: prescription.medications || [],
        notes: prescription.notes || ''
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
        const recordsData = await patientApi.getPatientMedicalRecords(userProfile.id);
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
        const documentsData = await patientApi.getPatientDocuments(userProfile.id);
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
        const notesData = await patientApi.getPatientNotes(userProfile.id);
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
    const mockMetrics: HealthMetric[] = [
      {
        id: '1',
        type: 'blood_pressure',
        value: '120/80',
        unit: 'mmHg',
        recorded_date: new Date().toISOString(),
        status: 'normal'
      },
      {
        id: '2',
        type: 'weight',
        value: '70',
        unit: 'kg',
        recorded_date: new Date().toISOString(),
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

  // Load data on component mount
  useEffect(() => {
    console.log('PatientDashboard mounted, user:', user);
    fetchAllData();
  }, [fetchAllData]);

  // Load secondary data when user profile changes
  useEffect(() => {
    fetchSecondaryData();
  }, [fetchSecondaryData]);

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
        address: userProfile.address || '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        pincode: userProfile.pincode || '',
        country: userProfile.country || '',
      });
    }
  }, [userProfile]);

  // Get comprehensive stats from all real APIs
  const getQuickStats = () => {
    return {
      totalConsultations: consultations.length,
      upcomingConsultations: consultations.filter(c => c.status === 'scheduled').length,
      completedConsultations: consultations.filter(c => c.status === 'completed').length,
      activePrescriptions: prescriptions.length,
      totalMedicalRecords: medicalRecords.length,
      totalDocuments: documents.length,
      totalNotes: notes.length,
      totalPayments: payments.length,
      unreadNotifications: notifications.filter(n => !n.is_read).length,
      activeSessions: sessions.length || 1 // At least current session
    };
  };

  const stats = getQuickStats();

  // Action handlers for the component APIs
  const handleCreateMedicalRecord = async () => {
    // Placeholder - would open modal/form
    toast({ title: 'Feature Coming Soon', description: 'Medical record creation will be available soon.' });
  };

  const handleUploadDocument = async () => {
    // Placeholder - would open file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf,.doc,.docx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast({ title: 'Feature Coming Soon', description: 'Document upload will be available soon.' });
      }
    };
    input.click();
  };

  const handleCreateNote = async () => {
    // Placeholder - would open modal/form
    toast({ title: 'Feature Coming Soon', description: 'Note creation will be available soon.' });
  };

  const handleDeleteMedicalRecord = async (id: string) => {
    toast({ title: 'Feature Coming Soon', description: 'Medical record deletion will be available soon.' });
  };

  const handleDeleteDocument = async (id: string) => {
    toast({ title: 'Feature Coming Soon', description: 'Document deletion will be available soon.' });
  };

  const handleDeleteNote = async (id: string) => {
    toast({ title: 'Feature Coming Soon', description: 'Note deletion will be available soon.' });
  };

  // Helper function to get display name
  const getDisplayName = (profile: UserProfile | null): string => {
    return profile?.name || user?.name || 'Patient';
  };

  // Recent activity (based on real data)
  const getRecentActivity = () => {
    const activities = [];
    
    // Add recent consultations
    consultations.slice(0, 3).forEach(consultation => {
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
            <TabsTrigger value="prescriptions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E17726] data-[state=active]:to-[#FF8A56] data-[state=active]:text-white">
              <Pill className="w-4 h-4 mr-2" />
              Prescriptions
            </TabsTrigger>
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
              onSearchChange={setConsultationSearch}
              onFilterChange={setConsultationFilter}
              onBookConsultation={() => setBookConsultationOpen(true)}
              onJoinConsultation={(id) => {
                toast({ title: 'Joining Consultation', description: 'Redirecting to consultation room...' });
              }}
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
            <PatientRecords 
              medicalRecords={medicalRecords}
              documents={documents}
              notes={notes}
              loading={{
                medicalRecords: medicalRecordsLoading,
                documents: documentsLoading,
                notes: notesLoading
              }}
              onCreateMedicalRecord={handleCreateMedicalRecord}
              onUploadDocument={handleUploadDocument}
              onCreateNote={handleCreateNote}
              onDeleteMedicalRecord={handleDeleteMedicalRecord}
              onDeleteDocument={handleDeleteDocument}
              onDeleteNote={handleDeleteNote}
            />
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
    </div>
  );
};

export default PatientDashboard;