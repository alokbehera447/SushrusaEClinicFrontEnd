import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Video, 
  FileText, 
  Clock, 
  Users,
  DollarSign,
  Star,
  Activity,
  Settings,
  Search,
  Phone,
  Mail,
  Edit,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Plus,
  Eye,
  RefreshCw,
  UserCheck,
  TrendingUp,
  BarChart3,
  User,
  Bell,
  Moon,
  Sun,
  HelpCircle,
  MoreVertical,
  LogOut,
  MessageSquare
} from 'lucide-react';
import DoctorAvailabilitySlots from '@/components/workflow/DoctorAvailabilitySlots';
import PrescriptionWriter from '@/components/workflow/PrescriptionWriter';
import PrescriptionManagement from '@/components/prescriptions/PrescriptionManagement';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { patientApi, UserProfile, doctorAnalyticsApi, DoctorPerformanceStats, doctorApi, Consultation, DoctorProfile, DoctorEarnings } from '@/lib/api';
// import { useDoctorSuperAdminWebSocket } from '@/hooks/useDoctorSuperAdminWebSocket';
import DoctorConsultationTab from './DoctorConsultationTab';
import EnhancedConsultationDashboard from './EnhancedConsultationDashboard';
import DoctorProfileTab from './DoctorProfileTab';

// Define Slot type
interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  maxPatients: number;
  notes: string;
  patientName?: string;
}

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedConsultation, setExpandedConsultation] = useState<string | null>(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedDate, setSelectedDate] = useState('2024-01-16');
  const [consultationFilter, setConsultationFilter] = useState('all');
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    type: 'available',
    maxPatients: 1,
    notes: ''
  });
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);
  const [stats, setStats] = useState<DoctorPerformanceStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loadingConsultations, setLoadingConsultations] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [earnings, setEarnings] = useState<DoctorEarnings | null>(null);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [earningsPeriod, setEarningsPeriod] = useState<'week' | 'month' | 'year'>('month');



  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | DoctorProfile | null>(null);

  // WebSocket connection for doctor status updates - TEMPORARILY DISABLED
  console.log('🔍 DoctorDashboard - User object:', user);
  console.log('🔍 DoctorDashboard - Access token available:', !!user);
  
  // const { isConnected, isConnecting, error: wsError, userRole } = useDoctorSuperAdminWebSocket(
  //   (status) => {
  //     console.log('🔄 Doctor status update received:', status);
  //   },
  //   undefined, // onSuperAdminRequest
  //   undefined, // onDoctorResponse
  //   () => {
  //     console.log('🎉 Doctor WebSocket connected to SuperAdmin dashboard!');
  //     console.log('👨‍⚕️ Doctor is now online and visible to SuperAdmin');
  //   },
  //   () => {
  //     console.log('❌ Doctor WebSocket disconnected from SuperAdmin dashboard');
  //   }
  // );
  
  // Mock WebSocket state for now
  const isConnected = false;
  const isConnecting = false;
  const wsError = null;
  const userRole = 'doctor';
  useEffect(() => {
    async function fetchProfile() {
      if (user && user.role === 'doctor') {
        console.log('👨‍⚕️ Doctor logged in, initializing dashboard...');
        // console.log('🔗 WebSocket connection will be established automatically');
        setLoadingProfile(true);
        try {
          // Try to get doctor profile first, fallback to user profile
          try {
            const data = await doctorApi.getCurrentDoctorProfile();
            setProfile(data);
          } catch (doctorError) {
            console.log('Doctor profile not found, trying user profile:', doctorError);
            try {
              const data = await patientApi.getCurrentUserProfile();
              setProfile(data);
            } catch (userError) {
              console.log('User profile also not found, using basic user info:', userError);
              // Create a basic profile from user info
              setProfile({
                id: parseInt(user.id),
                user: user.id,
                user_name: user.name,
                user_phone: user.phone,
                user_email: '',
                license_number: '',
                qualification: '',
                specialization: '',
                experience_years: 0,
                consultation_fee: 0,
                languages_spoken: [],
                is_verified: false,
                is_active: true,
                is_accepting_patients: true,
                rating: 0,
                total_reviews: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as DoctorProfile);
            }
          }
        } catch (error) {
          console.error('Error fetching doctor profile:', error);
          // Don't clear profile, keep previous data if available
        } finally {
          setLoadingProfile(false);
        }
      } else {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [user]);


  useEffect(() => {
    async function fetchStats() {
      setLoadingStats(true);
      try {
        const today = new Date().toISOString().slice(0, 10);
        const data = await doctorAnalyticsApi.getDoctorPerformance(today);
        setStats(data);
      } catch (error) {
        console.error('Error fetching doctor stats:', error);
        // Don't set stats to null, keep previous data if available
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  // Fetch earnings data
  useEffect(() => {
    async function fetchEarnings() {
      console.log('🔍 DoctorDashboard - Fetching earnings for period:', earningsPeriod);
      setLoadingEarnings(true);
      try {
        const earningsData = await doctorAnalyticsApi.getDoctorEarnings({ period: earningsPeriod });
        console.log('🔍 DoctorDashboard - Earnings data received:', earningsData);
        setEarnings(earningsData);
      } catch (error) {
        console.error('Error fetching earnings:', error);
        // Set a default earnings object to prevent crashes
        const defaultEarnings = {
          overview: {
            total_earnings: 0,
            total_consultations: 0,
            avg_per_consultation: 0,
            earnings_growth: 0,
            growth_type: 'positive' as const
          },
          monthly_breakdown: [],
          payment_status: {
            received_payments: 0,
            pending_payments: 0,
            processing_payments: 0,
            next_payout_amount: 0,
            next_payout_date: ''
          },
          payment_methods: {},
          recent_transactions: [],
          period: {
            start_date: '',
            end_date: '',
            period_type: 'month'
          }
        };
        console.log('🔍 DoctorDashboard - Setting default earnings:', defaultEarnings);
        setEarnings(defaultEarnings);
      } finally {
        setLoadingEarnings(false);
      }
    }
    fetchEarnings();
  }, [earningsPeriod]);


  // Helper function to get display name from profile
  const getDisplayName = (profile: UserProfile | DoctorProfile | null): string => {
    if (!profile) return 'Doctor';
    
    // Check if it's a DoctorProfile (has user_name) or UserProfile (has name)
    const name = 'user_name' in profile ? profile.user_name : profile.name;
    return name && name.startsWith('Dr.') ? name : `Dr. ${name || 'Doctor'}`;
  };

  // Helper function to get profile details
  const getProfileDetails = (profile: UserProfile | DoctorProfile | null): string => {
    if (!profile) return '';
    
    if ('user_name' in profile) {
      // DoctorProfile
      return `${profile.bio || ''}${profile.clinic_address ? ' • ' + profile.clinic_address : ''}`;
    } else {
      // UserProfile
      return `${profile.medical_history || ''}${profile.street ? ' • ' + profile.street : ''}`;
    }
  };

  // Helper function to get meeting link
  const getMeetingLink = (profile: UserProfile | DoctorProfile | null): string | null => {
    if (!profile) return null;
    
    // For now, return null as neither interface has meeting_link
    // This can be extended when meeting_link is added to the interfaces
    return null;
  };

  // Show loading state if profile is still loading
  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#E17726] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctor dashboard...</p>
        </div>
      </div>
    );
  }

  // Dynamic stats for today
  const todayStats = [
    { 
      label: "Today's Consultations", 
      value: loadingStats ? '...' : stats?.total_consultations ?? 0, 
      icon: Video, 
      color: 'text-[#E17726]',
      bgColor: 'bg-[#E17726]/10',
      change: '+12%',
      changeType: 'positive' as const
    },
    { 
      label: 'Scheduled Appointments', 
      value: '-', 
      icon: Calendar, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+8%',
      changeType: 'positive' as const
    }, // Not available in API yet
    { 
      label: 'Completed Today', 
      value: loadingStats ? '...' : stats?.completed_consultations ?? 0, 
      icon: CheckCircle, 
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+15%',
      changeType: 'positive' as const
    },
    { 
      label: "Today's Earnings", 
      value: loadingStats ? '...' : (stats?.total_revenue ? `₹${stats.total_revenue}` : '₹0'), 
      icon: DollarSign, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+5%',
      changeType: 'positive' as const
    },
  ];

  const scheduleSlots = [
    // January 16, 2024
    {
      id: 'SLOT001',
      date: '2024-01-16',
      startTime: '09:00',
      endTime: '09:30',
      type: 'available',
      maxPatients: 1,
      currentPatients: 0,
      notes: 'Morning consultation slot'
    },
    {
      id: 'SLOT002',
      date: '2024-01-16',
      startTime: '09:30',
      endTime: '10:00',
      type: 'booked',
      maxPatients: 1,
      currentPatients: 1,
      patientName: 'Rajesh Kumar',
      notes: 'Follow-up consultation'
    },
    {
      id: 'SLOT003',
      date: '2024-01-16',
      startTime: '10:00',
      endTime: '10:30',
      type: 'available',
      maxPatients: 1,
      currentPatients: 0,
      notes: 'Available for new patients'
    },
    {
      id: 'SLOT004',
      date: '2024-01-16',
      startTime: '14:00',
      endTime: '14:30',
      type: 'booked',
      maxPatients: 1,
      currentPatients: 1,
      patientName: 'Priya Sharma',
      notes: 'Diabetes management'
    },
    {
      id: 'SLOT005',
      date: '2024-01-16',
      startTime: '15:00',
      endTime: '16:00',
      type: 'break',
      maxPatients: 0,
      currentPatients: 0,
      notes: 'Lunch break'
    },
    {
      id: 'SLOT006',
      date: '2024-01-16',
      startTime: '18:00',
      endTime: '18:30',
      type: 'available',
      maxPatients: 1,
      currentPatients: 0,
      notes: 'Evening consultation'
    },
    // January 17, 2024
    {
      id: 'SLOT007',
      date: '2024-01-17',
      startTime: '09:00',
      endTime: '09:30',
      type: 'booked',
      maxPatients: 1,
      currentPatients: 1,
      patientName: 'Amit Singh',
      notes: 'Routine checkup'
    },
    {
      id: 'SLOT008',
      date: '2024-01-17',
      startTime: '10:00',
      endTime: '10:30',
      type: 'available',
      maxPatients: 1,
      currentPatients: 0,
      notes: 'Available slot'
    },
    {
      id: 'SLOT009',
      date: '2024-01-17',
      startTime: '14:00',
      endTime: '14:30',
      type: 'available',
      maxPatients: 1,
      currentPatients: 0,
      notes: 'Afternoon consultation'
    },
    {
      id: 'SLOT010',
      date: '2024-01-17',
      startTime: '16:00',
      endTime: '17:00',
      type: 'break',
      maxPatients: 0,
      currentPatients: 0,
      notes: 'Tea break'
    },
    // January 18, 2024
    {
      id: 'SLOT011',
      date: '2024-01-18',
      startTime: '09:00',
      endTime: '09:30',
      type: 'available',
      maxPatients: 1,
      currentPatients: 0,
      notes: 'Morning slot'
    },
    {
      id: 'SLOT012',
      date: '2024-01-18',
      startTime: '11:00',
      endTime: '11:30',
      type: 'booked',
      maxPatients: 1,
      currentPatients: 1,
      patientName: 'Neha Patel',
      notes: 'Cardiology consultation'
    },
    {
      id: 'SLOT013',
      date: '2024-01-18',
      startTime: '15:00',
      endTime: '15:30',
      type: 'available',
      maxPatients: 1,
      currentPatients: 0,
      notes: 'Afternoon availability'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'consultations', label: 'Consultations', icon: Video },
    { id: 'slot-booking', label: 'Slot Booking', icon: Clock },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'profile', label: 'Profile', icon: User }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 border-b border-emerald-500 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{getDisplayName(profile)}</h1>
                <p className="text-xs text-blue-100">{user?.phone || 'No contact available'}</p>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Available
              </Badge>
              {/* WebSocket Connection Status - TEMPORARILY DISABLED */}
              {/* <div className="flex items-center space-x-2 ml-4">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : isConnecting ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                <span className="text-xs text-blue-100">
                  {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
                </span>
                {wsError && (
                  <span className="text-xs text-red-200">({wsError})</span>
                )}
              </div> */}
            </div>
            <div className="flex items-center space-x-3">
              {/* Consultation Management Button */}
              <Button 
                onClick={() => navigate('/doctor/consultations')}
                size="sm" 
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-colors duration-300"
              >
                <Activity className="w-4 h-4 mr-2" />
                Manage Consultations
              </Button>

              {/* Theme Toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="text-white hover:bg-white/20 transition-colors duration-300"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              {/* Help Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20 transition-colors duration-300"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>

              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowNotifications(true)}
                className="relative text-white hover:bg-white/20 transition-colors duration-300"
              >
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 border border-white">
                    {notificationCount}
                  </Badge>
                )}
              </Button>

              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-white/20 transition-colors duration-300">
                    <Avatar className="h-8 w-8 border-2 border-white/20">
                      <AvatarFallback className="bg-white/20 text-white font-semibold">
                        {getDisplayName(profile).charAt(0) || 'D'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-white">
                        {getDisplayName(profile)}
                      </p>
                      <p className="text-xs text-blue-100">
                        {user?.phone || 'No contact available'}
                      </p>
                    </div>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white rounded-xl p-2 shadow-sm border border-gray-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#E17726] data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="consultations" className="data-[state=active]:bg-[#E17726] data-[state=active]:text-white">
              <Video className="w-4 h-4 mr-2" />
              Consultations
            </TabsTrigger>
            <TabsTrigger value="slot-booking" className="data-[state=active]:bg-[#E17726] data-[state=active]:text-white">
              <Clock className="w-4 h-4 mr-2" />
              Slot Booking
            </TabsTrigger>
            <TabsTrigger value="earnings" className="data-[state=active]:bg-[#E17726] data-[state=active]:text-white">
              <DollarSign className="w-4 h-4 mr-2" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#E17726] data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
          <div className="space-y-8">
            {/* Today's Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {todayStats.map((stat, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                        <p className="text-3xl font-bold text-midnight">{stat.value}</p>
                        <p className={`text-sm mt-1 ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.change} this month
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Next Consultations & Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Next Consultations */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-900">Next Consultations</CardTitle>
                    <Badge className="bg-[#E17726]/10 text-[#E17726]">
                      {consultations.filter(c => c.status === 'scheduled').length} Pending
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {consultations.map((consultation, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-semibold text-[#E17726]">{consultation.scheduled_time}</div>
                            <div className="text-xs text-gray-500">{consultation.consultation_type}</div>
                          </div>
                          <img 
                            src="/patient-avatar-1.svg" 
                            alt="Patient" 
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <h4 className="font-semibold text-midnight">{consultation.patient_name}</h4>
                            <p className="text-sm text-gray-600">{consultation.chief_complaint}</p>
                            <p className="text-xs text-gray-500">{consultation.symptoms || 'No symptoms listed'}</p>
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
                              onClick={() => navigate(`/consultation/${consultation.id}/meeting`)}
                            >
                              <Video className="w-4 h-4 mr-2" />
                              Join Meeting
                            </Button>
                          )}
                          {consultation.status === 'in-progress' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Continue
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Performance & Quick Stats */}
              <div className="space-y-6">
                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900">This Week</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Consultations</span>
                      <span className="font-semibold text-midnight">42</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Avg. Rating</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold text-midnight ml-1">4.8</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Earnings</span>
                      <span className="font-semibold text-midnight">₹21,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-semibold text-green-600">98%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white justify-start h-12 rounded-xl">
                      <Video className="w-5 h-5 mr-3" />
                      Join Video Call
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white">
                      <Calendar className="w-5 h-5 mr-3" />
                      Update Schedule
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-12 rounded-xl border-aqua text-aqua hover:bg-aqua hover:text-white"
                      onClick={() => navigate('/doctor/consultations')}
                    >
                      <Activity className="w-5 h-5 mr-3" />
                      Manage Consultations
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Payment Methods Distribution */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingEarnings ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E17726]"></div>
                  </div>
                ) : earnings?.payment_methods && Object.keys(earnings.payment_methods).length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(earnings.payment_methods).map(([method, amount]) => (
                      <div key={method} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-midnight capitalize">{method.replace('_', ' ')}</p>
                            <p className="text-sm text-gray-600">Total</p>
                          </div>
                          <p className="font-bold text-[#E17726]">₹{(amount as number).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No payment method data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingEarnings ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E17726]"></div>
                  </div>
                                ) : earnings?.recent_transactions && earnings.recent_transactions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-600">Showing {earnings.recent_transactions.length} recent transactions</p>
                      <p className="text-sm font-semibold text-[#E17726]">
                        Total: ₹{earnings.recent_transactions.reduce((sum, t) => sum + (t.amount ?? 0), 0).toLocaleString()}
                      </p>
                    </div>
                    {earnings.recent_transactions.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-[#E17726]/10 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-[#E17726]" />
                          </div>
                          <div>
                            <p className="font-semibold text-midnight">{transaction.patient_name}</p>
                            <p className="text-sm text-gray-600 capitalize">
                              {transaction.consultation_type?.replace('_', ' ')} • {transaction.payment_method}
                            </p>
                            <p className="text-xs text-gray-500">{transaction.processed_at}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#E17726]">₹{(transaction.amount ?? 0).toLocaleString()}</p>
                          <Badge className={`text-xs ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent transactions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations">
            <EnhancedConsultationDashboard />
          </TabsContent>

          {/* Slot Booking Tab */}
          <TabsContent value="slot-booking">
            <DoctorAvailabilitySlots />
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
          <div className="space-y-8">

            {/* Period Filter */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900">Earnings Analytics</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant={earningsPeriod === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEarningsPeriod('week')}
                    className={earningsPeriod === 'week' ? 'bg-[#E17726] hover:bg-[#c9651e]' : ''}
                  >
                    Week
                  </Button>
                  <Button 
                    variant={earningsPeriod === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEarningsPeriod('month')}
                    className={earningsPeriod === 'month' ? 'bg-[#E17726] hover:bg-[#c9651e]' : ''}
                  >
                    Month
                  </Button>
                  <Button 
                    variant={earningsPeriod === 'year' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEarningsPeriod('year')}
                    className={earningsPeriod === 'year' ? 'bg-[#E17726] hover:bg-[#c9651e]' : ''}
                  >
                    Year
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLoadingEarnings(true);
                      doctorAnalyticsApi.getDoctorEarnings({ period: earningsPeriod })
                        .then(setEarnings)
                        .catch(console.error)
                        .finally(() => setLoadingEarnings(false));
                    }}
                    disabled={loadingEarnings}
                    className="ml-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingEarnings ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {earnings?.period && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-midnight">Period: {earnings.period.period_type.charAt(0).toUpperCase() + earnings.period.period_type.slice(1)}</p>
                      <p className="text-sm text-gray-600">
                        {earnings.period.start_date} to {earnings.period.end_date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#E17726]">
                        {earnings.overview?.total_consultations ?? 0} consultations
                      </p>
                      <p className="text-sm text-gray-600">
                        ₹{(earnings.overview?.total_earnings ?? 0).toLocaleString()} total
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Earnings Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Total Consultations</p>
                      <p className="text-3xl font-bold text-midnight">
                        {loadingEarnings ? '...' : (earnings?.overview?.total_consultations ?? 0)}
                      </p>
                      <p className={`text-sm mt-1 ${earnings?.overview?.growth_type === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {earnings?.overview?.earnings_growth ? `${earnings.overview.earnings_growth > 0 ? '+' : ''}${earnings.overview.earnings_growth.toFixed(1)}%` : '0%'} this {earningsPeriod}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E17726]/10 to-[#E17726]/5 flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#E17726]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Total Earnings</p>
                      <p className="text-3xl font-bold text-midnight">
                        ₹{loadingEarnings ? '...' : (earnings?.overview?.total_earnings ?? 0).toLocaleString()}
                      </p>
                      <p className={`text-sm mt-1 ${earnings?.overview?.growth_type === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {earnings?.overview?.earnings_growth ? `${earnings.overview.earnings_growth > 0 ? '+' : ''}${earnings.overview.earnings_growth.toFixed(1)}%` : '0%'} this {earningsPeriod}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Average Per Consultation</p>
                      <p className="text-3xl font-bold text-midnight">
                        ₹{loadingEarnings ? '...' : (earnings?.overview?.average_per_consultation ?? 0).toLocaleString()}
                      </p>
                      <p className="text-sm mt-1 text-gray-600">
                        Based on {earnings?.overview?.total_consultations ?? 0} consultations
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Earnings Trend Chart */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Earnings Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingEarnings ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E17726]"></div>
                  </div>
                ) : earnings?.trends && earnings.trends.length > 0 ? (
                  <div className="space-y-4">
                    {earnings.trends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-[#E17726]/10 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-[#E17726]" />
                          </div>
                          <div>
                            <p className="font-semibold text-midnight">{trend.period}</p>
                            <p className="text-sm text-gray-600">{trend.consultations} consultations</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#E17726]">₹{trend.earnings.toLocaleString()}</p>
                          <p className={`text-sm ${trend.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend.growth >= 0 ? '+' : ''}{trend.growth.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No earnings trend data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods Distribution */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingEarnings ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E17726]"></div>
                  </div>
                ) : earnings?.payment_methods && Object.keys(earnings.payment_methods).length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(earnings.payment_methods).map(([method, amount]) => (
                      <div key={method} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-midnight capitalize">{method.replace('_', ' ')}</p>
                            <p className="text-sm text-gray-600">Total</p>
                          </div>
                          <p className="font-bold text-[#E17726]">₹{(amount as number).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No payment method data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingEarnings ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E17726]"></div>
                  </div>
                ) : earnings?.recent_transactions && earnings.recent_transactions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-600">Showing {earnings.recent_transactions.length} recent transactions</p>
                      <p className="text-sm font-semibold text-[#E17726]">
                        Total: ₹{earnings.recent_transactions.reduce((sum, t) => sum + (t.amount ?? 0), 0).toLocaleString()}
                      </p>
                    </div>
                    {earnings.recent_transactions.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-[#E17726]/10 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-[#E17726]" />
                          </div>
                          <div>
                            <p className="font-semibold text-midnight">{transaction.patient_name}</p>
                            <p className="text-sm text-gray-600 capitalize">
                              {transaction.consultation_type?.replace('_', ' ')} • {transaction.payment_method}
                            </p>
                            <p className="text-xs text-gray-500">{transaction.processed_at}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#E17726]">₹{(transaction.amount ?? 0).toLocaleString()}</p>
                          <Badge className={`text-xs ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent transactions available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <DoctorProfileTab 
              key={profile?.id || 'loading'}
              profile={profile as DoctorProfile} 
              onProfileUpdate={(updatedProfile) => {
                console.log('🔄 Updating doctor profile in dashboard:', updatedProfile);
                setProfile(updatedProfile);
              }}
            />
          </TabsContent>

          {/* Prescriptions Tab - Temporarily Disabled */}
          {/* 
          <TabsContent value="prescriptions">
            <div className="space-y-6">
              Prescription Management Header
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">Prescription Management</CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                      onClick={() => navigate('/prescriptions')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Manage All Prescriptions
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-aqua text-aqua hover:bg-aqua hover:text-white"
                      onClick={() => navigate('/prescriptions/new')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Prescription
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              Quick Actions
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/prescriptions')}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">All Prescriptions</h3>
                        <p className="text-sm text-gray-600">View and manage all prescriptions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/prescriptions?tab=drafts')}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <Edit className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Draft Prescriptions</h3>
                        <p className="text-sm text-gray-600">Continue writing draft prescriptions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/prescriptions?tab=finalized')}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-green-100 rounded-full">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Finalized Prescriptions</h3>
                        <p className="text-sm text-gray-600">View and download finalized PDFs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              Recent Prescriptions
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Recent Prescriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <PrescriptionManagement />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          */}

          {/* Schedule Tab */}
          <TabsContent value="schedule">
          <div className="space-y-8">
            {/* Schedule Management Header */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900">Schedule Management</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                    onClick={() => {
                      setNewSlot({
                        ...newSlot,
                        date: selectedDate
                      });
                      setShowAddSlot(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Availability Slot
                  </Button>
                  <Button variant="outline" className="border-aqua text-aqua hover:bg-aqua hover:text-white">
                    <Settings className="w-4 h-4 mr-2" />
                    Schedule Settings
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Schedule Filter and Display */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CardTitle className="text-xl font-bold text-gray-900">Schedule</CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const today = new Date();
                          setSelectedDate(today.toISOString().split('T')[0]);
                        }}
                        className="border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white"
                      >
                        Today
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          setSelectedDate(tomorrow.toISOString().split('T')[0]);
                        }}
                        className="border-aqua text-aqua hover:bg-aqua hover:text-white"
                      >
                        Tomorrow
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Or select date:</label>
                      <Input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-40"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-[#E17726]/10 text-[#E17726]">
                    {scheduleSlots.filter(slot => slot.date === selectedDate && slot.type === 'available').length} Available
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    {scheduleSlots.filter(slot => slot.date === selectedDate && slot.type === 'booked').length} Booked
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-midnight mb-2">
                    Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  {scheduleSlots.filter(slot => slot.date === selectedDate).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No slots scheduled for this date</p>
                      <Button 
                        className="mt-2 bg-[#E17726] hover:bg-[#c9651e] text-white"
                        onClick={() => setShowAddSlot(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Slots for This Date
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {scheduleSlots
                    .filter(slot => slot.date === selectedDate)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((slot, index) => (
                    <div 
                      key={slot.id} 
                      className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                        slot.type === 'available' 
                          ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                          : slot.type === 'booked' 
                          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="font-semibold text-midnight">{slot.startTime} - {slot.endTime}</div>
                            <div className="text-sm text-gray-500">
                              {slot.maxPatients} patient{slot.maxPatients > 1 ? 's' : ''} max
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge className={`${
                                slot.type === 'available' 
                                  ? 'bg-green-100 text-green-800' 
                                  : slot.type === 'booked' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {slot.type === 'available' ? 'Available' : slot.type === 'booked' ? 'Booked' : 'Break'}
                              </Badge>
                              {slot.type === 'booked' && (
                                <span className="text-sm text-blue-600 font-medium">{slot.patientName}</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{slot.notes}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {slot.type === 'available' && (
                            <Button size="sm" variant="outline" className="border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add Slot Modal */}
            {showAddSlot && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-midnight">Add Availability Slot</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAddSlot(false)}
                      className="border-gray-300"
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <Input 
                        type="date" 
                        value={newSlot.date}
                        onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                        <Input 
                          type="time" 
                          value={newSlot.startTime}
                          onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                        <Input 
                          type="time" 
                          value={newSlot.endTime}
                          onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Slot Type</label>
                      <select 
                        value={newSlot.type}
                        onChange={(e) => setNewSlot({...newSlot, type: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-[#E17726] focus:ring-[#E17726]"
                      >
                        <option value="available">Available for Consultation</option>
                        <option value="break">Break Time</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>
                    
                    {newSlot.type === 'available' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Patients</label>
                        <Input 
                          type="number" 
                          min="1" 
                          max="5"
                          value={newSlot.maxPatients}
                          onChange={(e) => setNewSlot({...newSlot, maxPatients: parseInt(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                      <textarea 
                        value={newSlot.notes}
                        onChange={(e) => setNewSlot({...newSlot, notes: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-[#E17726] focus:ring-[#E17726]"
                        rows={3}
                        placeholder="Add any notes about this slot..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddSlot(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-[#E17726] hover:bg-[#c9651e] text-white flex-1"
                      onClick={() => {
                        // Here you would add the slot to the schedule
                        console.log('Adding slot:', newSlot);
                        setShowAddSlot(false);
                        setNewSlot({
                          date: '',
                          startTime: '',
                          endTime: '',
                          type: 'available',
                          maxPatients: 1,
                          notes: ''
                        });
                      }}
                    >
                      Add Slot
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Slot Details Modal */}
            {selectedSlot && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-midnight">Slot Details</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedSlot(null)}
                      className="border-gray-300"
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <p className="text-midnight font-medium">{selectedSlot.date}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Time</label>
                        <p className="text-midnight font-medium">{selectedSlot.startTime} - {selectedSlot.endTime}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <Badge className={`${
                          selectedSlot.type === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : selectedSlot.type === 'booked' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedSlot.type === 'available' ? 'Available' : selectedSlot.type === 'booked' ? 'Booked' : 'Break'}
                        </Badge>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Max Patients</label>
                        <p className="text-midnight font-medium">{selectedSlot.maxPatients}</p>
                      </div>
                    </div>
                    
                    {selectedSlot.type === 'booked' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Booked Patient</label>
                        <p className="text-midnight font-medium">{selectedSlot.patientName}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="text-gray-600">{selectedSlot.notes}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedSlot(null)}
                      className="flex-1"
                    >
                      Close
                    </Button>
                    {selectedSlot.type === 'available' && (
                      <Button 
                        className="bg-[#E17726] hover:bg-[#c9651e] text-white flex-1"
                        onClick={() => {
                          // Here you would edit the slot
                          console.log('Editing slot:', selectedSlot);
                          setSelectedSlot(null);
                        }}
                      >
                        Edit Slot
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
          <div className="space-y-8">

            {/* Period Filter */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900">Earnings Analytics</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant={earningsPeriod === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEarningsPeriod('week')}
                    className={earningsPeriod === 'week' ? 'bg-[#E17726] hover:bg-[#c9651e]' : ''}
                  >
                    Week
                  </Button>
                  <Button 
                    variant={earningsPeriod === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEarningsPeriod('month')}
                    className={earningsPeriod === 'month' ? 'bg-[#E17726] hover:bg-[#c9651e]' : ''}
                  >
                    Month
                  </Button>
                  <Button 
                    variant={earningsPeriod === 'year' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEarningsPeriod('year')}
                    className={earningsPeriod === 'year' ? 'bg-[#E17726] hover:bg-[#c9651e]' : ''}
                  >
                    Year
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLoadingEarnings(true);
                      doctorAnalyticsApi.getDoctorEarnings({ period: earningsPeriod })
                        .then(setEarnings)
                        .catch(console.error)
                        .finally(() => setLoadingEarnings(false));
                    }}
                    disabled={loadingEarnings}
                    className="ml-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingEarnings ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {earnings?.period && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-midnight">Period: {earnings.period.period_type.charAt(0).toUpperCase() + earnings.period.period_type.slice(1)}</p>
                      <p className="text-sm text-gray-600">
                        {earnings.period.start_date} to {earnings.period.end_date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#E17726]">
                        {earnings.overview?.total_consultations ?? 0} consultations
                      </p>
                      <p className="text-sm text-gray-600">
                        ₹{(earnings.overview?.total_earnings ?? 0).toLocaleString()} total
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Earnings Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Total Consultations</p>
                      <p className="text-3xl font-bold text-midnight">
                        {loadingEarnings ? '...' : (earnings?.overview?.total_consultations ?? 0)}
                      </p>
                      <p className={`text-sm mt-1 ${earnings?.overview?.growth_type === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {earnings?.overview?.earnings_growth ? `${earnings.overview.earnings_growth > 0 ? '+' : ''}${earnings.overview.earnings_growth.toFixed(1)}%` : '0%'} this {earningsPeriod}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E17726]/10 to-[#E17726]/5 flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#E17726]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Total Earnings</p>
                      <p className="text-3xl font-bold text-midnight">
                        {loadingEarnings ? '...' : `₹${(earnings?.overview?.total_earnings ?? 0).toLocaleString()}`}
                      </p>
                      <p className={`text-sm mt-1 ${earnings?.overview?.growth_type === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {earnings?.overview?.earnings_growth ? `${earnings.overview.earnings_growth > 0 ? '+' : ''}${earnings.overview.earnings_growth.toFixed(1)}%` : '0%'} this {earningsPeriod}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Avg. per Consultation</p>
                      <p className="text-3xl font-bold text-midnight">
                        {loadingEarnings ? '...' : `₹${(earnings?.overview?.avg_per_consultation ?? 0).toLocaleString()}`}
                      </p>
                      <p className="text-sm text-aqua mt-1">Standard rate</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aqua/10 to-aqua/5 flex items-center justify-center">
                      <Star className="w-6 h-6 text-aqua" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Earnings Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Monthly Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingEarnings ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E17726]"></div>
                    </div>
                  ) : earnings?.monthly_breakdown && earnings.monthly_breakdown.length > 0 ? (
                    earnings.monthly_breakdown.slice(0, 6).map((month, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-midnight">{month.month}</p>
                          <p className="text-sm text-gray-600">{month.consultations} consultations</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#E17726]">₹{(month.earnings ?? 0).toLocaleString()}</p>
                                                      <p className={`text-sm ${month.growth_type === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                              {(month.growth ?? 0) > 0 ? '+' : ''}{(month.growth ?? 0).toFixed(1)}%
                            </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No earnings data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingEarnings ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E17726]"></div>
                    </div>
                  ) : earnings?.payment_status ? (
                    <>
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-semibold text-green-800">Received Payments</p>
                            <p className="text-sm text-green-600">Last 30 days</p>
                          </div>
                        </div>
                                                 <p className="font-bold text-green-800">₹{(earnings.payment_status.received_payments ?? 0).toLocaleString()}</p>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <div>
                            <p className="font-semibold text-yellow-800">Pending Payments</p>
                            <p className="text-sm text-yellow-600">Processing</p>
                          </div>
                        </div>
                                                 <p className="font-bold text-yellow-800">₹{(earnings.payment_status.pending_payments ?? 0).toLocaleString()}</p>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-semibold text-blue-800">Next Payout</p>
                            <p className="text-sm text-blue-600">{earnings.payment_status.next_payout_date}</p>
                          </div>
                        </div>
                                                 <p className="font-bold text-blue-800">₹{(earnings.payment_status.next_payout_amount ?? 0).toLocaleString()}</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No payment data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods Distribution */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingEarnings ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E17726]"></div>
                  </div>
                ) : earnings?.payment_methods && Object.keys(earnings.payment_methods).length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(earnings.payment_methods).map(([method, amount]) => (
                      <div key={method} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-midnight capitalize">{method.replace('_', ' ')}</p>
                            <p className="text-sm text-gray-600">Total</p>
                          </div>
                          <p className="font-bold text-[#E17726]">₹{(amount as number).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No payment method data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingEarnings ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E17726]"></div>
                  </div>
                ) : earnings?.recent_transactions && earnings.recent_transactions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-600">Showing {earnings.recent_transactions.length} recent transactions</p>
                      <p className="text-sm font-semibold text-[#E17726]">
                        Total: ₹{earnings.recent_transactions.reduce((sum, t) => sum + (t.amount ?? 0), 0).toLocaleString()}
                      </p>
                    </div>
                    {earnings.recent_transactions.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-[#E17726]/10 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-[#E17726]" />
                          </div>
                          <div>
                            <p className="font-semibold text-midnight">{transaction.patient_name}</p>
                            <p className="text-sm text-gray-600 capitalize">
                              {transaction.consultation_type?.replace('_', ' ')} • {transaction.payment_method}
                            </p>
                            <p className="text-xs text-gray-500">{transaction.processed_at}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#E17726]">₹{(transaction.amount ?? 0).toLocaleString()}</p>
                          <Badge className={`text-xs ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent transactions available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard; 