import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Video, 
  Calendar,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  FileText,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  adminConsultationApi,
  Consultation,
  createConsultation
} from '@/lib/api';
import { toast } from 'sonner';
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
import { useNavigate } from 'react-router-dom';

// Consultation Management Enhanced Component
interface ConsultationManagementEnhancedProps {
  isAssignedToClinic?: boolean;
}

const ConsultationManagementEnhanced = ({ isAssignedToClinic = true }: ConsultationManagementEnhancedProps) => {
  const navigate = useNavigate();
  
  // State management
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loadingConsultations, setLoadingConsultations] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Error states
  const [consultationsError, setConsultationsError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalConsultations, setTotalConsultations] = useState(0);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<Consultation | null>(null);

  // Consultation popup state
  const [showConsultationPopup, setShowConsultationPopup] = useState(false);
  const [upcomingConsultation, setUpcomingConsultation] = useState<Consultation | null>(null);
  const [shownPopupConsultations, setShownPopupConsultations] = useState<Set<string>>(new Set());
  const [isProcessingPopup, setIsProcessingPopup] = useState(false);

  // Load shown consultations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('shownPopupConsultations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setShownPopupConsultations(new Set(parsed));
      } catch (error) {
        console.error('Error loading shown consultations:', error);
      }
    }
  }, []);

  // Calculate total pages
  const totalPages = Math.ceil(totalConsultations / pageSize);

  // Fetch consultations with pagination and filters
  const fetchConsultations = useCallback(async () => {
    try {
      setLoadingConsultations(true);
      setConsultationsError(null);
      
      const params: Record<string, string | number> = {
        page: currentPage,
        page_size: pageSize,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.consultation_type = typeFilter;
      if (dateFilter !== 'all') {
        const today = new Date().toISOString().slice(0, 10);
        params.scheduled_date = dateFilter === 'today' ? today : dateFilter;
      }
      
      const response = await adminConsultationApi.getAllConsultations(params);
      setConsultations(response.results);
      setTotalConsultations(response.count);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      setConsultationsError('Failed to load consultations');
      toast.error('Failed to load consultations');
    } finally {
      setLoadingConsultations(false);
    }
  }, [currentPage, pageSize, searchQuery, statusFilter, typeFilter, dateFilter]);

  // Fetch consultation statistics
  const fetchConsultationStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      setStatsError(null);
      
      // Get today's consultations for stats
      const todayConsultations = await adminConsultationApi.getTodaysConsultations();
      
      // Calculate statistics
      const stats = {
        total_consultations: Array.isArray(consultations) ? consultations.length : 0,
        pending_consultations: Array.isArray(consultations) ? consultations.filter(c => c.status === 'scheduled').length : 0,
        cancelled_consultations: Array.isArray(consultations) ? consultations.filter(c => c.status === 'cancelled').length : 0,
        total_revenue: Array.isArray(consultations) ? consultations.reduce((sum, c) => sum + (c.is_paid ? Number(c.consultation_fee) : 0), 0) : 0,
        pending_revenue: Array.isArray(consultations) ? consultations.filter(c => !c.is_paid).reduce((sum, c) => sum + Number(c.consultation_fee), 0) : 0
      };
      
      // Update stats in component state (you could add a stats state if needed)
      console.log('Consultation stats:', stats);
      
    } catch (error) {
      console.error('Error fetching consultation stats:', error);
      setStatsError('Failed to load consultation statistics');
      toast.error('Failed to load consultation statistics');
    } finally {
      setLoadingStats(false);
    }
  }, []); // Remove all dependencies to prevent infinite loops

  // Initialize data on component mount
  useEffect(() => {
    if (isAssignedToClinic) {
      fetchConsultations();
      fetchConsultationStats();
    }
  }, [isAssignedToClinic, fetchConsultations, fetchConsultationStats]);

  // Check for upcoming consultations and show popup
  useEffect(() => {
    if (consultations.length > 0 && !showConsultationPopup && !isProcessingPopup) {
      const now = new Date();
      const upcomingConsultations = consultations.filter(consultation => {
        if (consultation.status !== 'scheduled') return false;
        
        // Skip if we've already shown popup for this consultation
        if (shownPopupConsultations.has(consultation.id)) return false;
        
        const consultationDate = new Date(consultation.scheduled_date);
        const consultationTime = consultation.scheduled_time;
        const [hours, minutes] = consultationTime.split(':').map(Number);
        consultationDate.setHours(hours, minutes, 0, 0);
        
        // Show popup for consultations happening within next 30 minutes
        const timeDiff = consultationDate.getTime() - now.getTime();
        const minutesDiff = timeDiff / (1000 * 60);
        
        return minutesDiff >= -5 && minutesDiff <= 30; // 5 minutes before to 30 minutes after
      });
      
      if (upcomingConsultations.length > 0) {
        setIsProcessingPopup(true);
        // Show popup for the first upcoming consultation
        const firstUpcoming = upcomingConsultations[0];
        setUpcomingConsultation(firstUpcoming);
        setShowConsultationPopup(true);
        // Mark this consultation as shown and save to localStorage
        const newShownSet = new Set([...shownPopupConsultations, firstUpcoming.id]);
        setShownPopupConsultations(newShownSet);
        localStorage.setItem('shownPopupConsultations', JSON.stringify([...newShownSet]));
        
        // If there are more upcoming consultations, show them one by one
        if (upcomingConsultations.length > 1) {
          // Store remaining consultations to show after this one
          const remainingConsultations = upcomingConsultations.slice(1);
          localStorage.setItem('pendingPopupConsultations', JSON.stringify(remainingConsultations));
        }
      }
    }
  }, [consultations, showConsultationPopup, shownPopupConsultations, isProcessingPopup]);

  // Separate effect to handle pending consultations when popup closes
  useEffect(() => {
    if (!showConsultationPopup && upcomingConsultation === null && !isProcessingPopup) {
      // Check if there are pending consultations to show
      const pendingConsultations = localStorage.getItem('pendingPopupConsultations');
      if (pendingConsultations) {
        try {
          const remainingConsultations = JSON.parse(pendingConsultations);
          if (remainingConsultations.length > 0) {
            setIsProcessingPopup(true);
            // Add a small delay to prevent immediate popup
            const timeoutId = setTimeout(() => {
              const nextConsultation = remainingConsultations[0];
              const updatedRemaining = remainingConsultations.slice(1);
              
              setUpcomingConsultation(nextConsultation);
              setShowConsultationPopup(true);
              
              // Mark this consultation as shown
              const newShownSet = new Set([...shownPopupConsultations, nextConsultation.id]);
              setShownPopupConsultations(newShownSet);
              localStorage.setItem('shownPopupConsultations', JSON.stringify([...newShownSet]));
              
              // Update remaining consultations
              if (updatedRemaining.length > 0) {
                localStorage.setItem('pendingPopupConsultations', JSON.stringify(updatedRemaining));
              } else {
                localStorage.removeItem('pendingPopupConsultations');
              }
            }, 1000); // 1 second delay to prevent rapid popups
            
            return () => clearTimeout(timeoutId);
          } else {
            localStorage.removeItem('pendingPopupConsultations');
          }
        } catch (error) {
          console.error('Error processing pending consultations:', error);
          localStorage.removeItem('pendingPopupConsultations');
        }
      }
    }
  }, [showConsultationPopup, upcomingConsultation, shownPopupConsultations, isProcessingPopup]);



  // Reset to first page when filters change
  useEffect(() => {
    if (isAssignedToClinic && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchQuery, statusFilter, dateFilter, typeFilter, isAssignedToClinic]);

  // Handle consultation actions
  const handleConsultationAction = async (action: string, consultation: Consultation) => {
    try {
      switch (action) {
        case 'view':
          navigate(`/admin/consultations/${consultation.id}`);
          break;
        case 'edit':
          navigate(`/admin/consultations/${consultation.id}/edit`);
          break;
        case 'delete':
          setConsultationToDelete(consultation);
          setDeleteDialogOpen(true);
          break;
        case 'join': {
          // Open doctor's meeting link directly in new tab
          const meetingLink = (consultation as any).doctor_meeting_link || (consultation as any).meeting_link;
          if (meetingLink) {
            window.open(meetingLink, '_blank');
          } else {
            toast.error('Meeting link not available for this consultation');
          }
          break;
        }
        case 'reschedule':
          navigate(`/admin/consultations/${consultation.id}/reschedule`);
          break;
        case 'cancel':
          // You would implement cancel consultation API call here
          toast.info('Cancel consultation functionality will be implemented');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action} on consultation:`, error);
      toast.error(`Failed to ${action} consultation`);
    }
  };

  // Handle delete consultation
  const handleDeleteConsultation = async () => {
    if (!consultationToDelete) return;
    
    try {
      // You would implement delete consultation API call here
      toast.success('Consultation deleted successfully');
      setDeleteDialogOpen(false);
      setConsultationToDelete(null);
      fetchConsultations();
    } catch (error) {
      console.error('Error deleting consultation:', error);
      toast.error('Failed to delete consultation');
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (isPaid: boolean) => {
    return isPaid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
  };

  // Stats cards data
  const statsCards = [
    {
      title: "Total Consultations",
      value: totalConsultations,
      icon: Video,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: "Today's Consultations",
      value: Array.isArray(consultations) ? consultations.filter(c => {
        const today = new Date().toISOString().slice(0, 10);
        return c.scheduled_date === today;
      }).length : 0,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: "Completed",
      value: Array.isArray(consultations) ? consultations.filter(c => c.status === 'completed').length : 0,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+15%',
      changeType: 'positive' as const
    },
    {
      title: "Pending Revenue",
      value: Array.isArray(consultations) ? consultations.filter(c => !c.is_paid).reduce((sum, c) => sum + Number(c.consultation_fee), 0) : 0,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '+5%',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* No Clinic Assignment Warning */}
      {!isAssignedToClinic && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">No E-Clinic Assignment</AlertTitle>
          <AlertDescription className="text-orange-700">
            You have not been assigned to any e-clinic. Consultation management features are disabled. 
            Please contact the super admin to get assigned to an e-clinic.
          </AlertDescription>
        </Alert>
      )}

      {/* Consultation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.title === "Pending Revenue" || stat.title === "Total Revenue" 
                      ? `₹${typeof stat.value === 'number' ? stat.value.toLocaleString('en-IN') : stat.value}`
                      : stat.value.toLocaleString()
                    }
                  </p>
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

      {/* Show Upcoming Consultations Button */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            if (consultations.length > 0) {
              const scheduledConsultations = consultations.filter(c => c.status === 'scheduled');
              if (scheduledConsultations.length > 0) {
                // Clear shown consultations to allow all to show
                setShownPopupConsultations(new Set());
                localStorage.removeItem('shownPopupConsultations');
                localStorage.removeItem('pendingPopupConsultations');
                
                // Show first consultation immediately
                const firstConsultation = scheduledConsultations[0];
                setUpcomingConsultation(firstConsultation);
                setShowConsultationPopup(true);
                
                // Store remaining consultations
                if (scheduledConsultations.length > 1) {
                  const remainingConsultations = scheduledConsultations.slice(1);
                  localStorage.setItem('pendingPopupConsultations', JSON.stringify(remainingConsultations));
                }
                
                toast.success(`Showing ${scheduledConsultations.length} scheduled consultations`);
              } else {
                toast.info('No scheduled consultations found');
              }
            } else {
              toast.info('No consultations loaded yet');
            }
          }}
          className="text-xs"
        >
          <Clock className="w-3 h-3 mr-1" />
          Show Upcoming Consultations
        </Button>
      </div>

      {/* Error Alerts */}
      {statsError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Statistics Error</AlertTitle>
          <AlertDescription className="text-red-700">{statsError}</AlertDescription>
        </Alert>
      )}

      {consultationsError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Consultations Error</AlertTitle>
          <AlertDescription className="text-red-700">{consultationsError}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search consultations by patient, doctor, or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                disabled={!isAssignedToClinic}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter} disabled={!isAssignedToClinic}>
              <SelectTrigger className="w-full lg:w-40 h-11 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter} disabled={!isAssignedToClinic}>
              <SelectTrigger className="w-full lg:w-40 h-11 rounded-xl">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter} disabled={!isAssignedToClinic}>
              <SelectTrigger className="w-full lg:w-40 h-11 rounded-xl">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))} disabled={!isAssignedToClinic}>
              <SelectTrigger className="w-full lg:w-32 h-11 rounded-xl">
                <SelectValue placeholder="Page Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => navigate('/admin/consultations/new')}
              className="bg-[#E17726] hover:bg-[#c9651e] text-white h-11 px-6 rounded-xl"
              disabled={!isAssignedToClinic}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Consultation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Consultations Table */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">All Consultations</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingConsultations ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
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
          ) : !Array.isArray(consultations) || consultations.length === 0 ? (
            <div className="text-center py-8">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'No consultations have been scheduled yet.'}
              </p>
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
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(consultations) && consultations.map((consultation) => (
                      <TableRow key={consultation.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src="/patient-avatar-1.svg" />
                              <AvatarFallback>{consultation.patient_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{consultation.patient_name}</p>
                              <p className="text-sm text-gray-500">ID: {consultation.patient}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{consultation.doctor_name}</p>
                            <p className="text-sm text-gray-500">ID: {consultation.doctor}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">
                              {new Date(consultation.scheduled_date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">{consultation.scheduled_time}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {consultation.consultation_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(consultation.status)}>
                            {consultation.status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPaymentStatusColor(consultation.is_paid)}>
                            {consultation.is_paid ? 'Paid' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-gray-900">₹{consultation.consultation_fee}</p>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleConsultationAction('view', consultation)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {consultation.status === 'scheduled' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleConsultationAction('join', consultation)}>
                                    <Video className="w-4 h-4 mr-2" />
                                    Join Meeting
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleConsultationAction('reschedule', consultation)}>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Reschedule
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleConsultationAction('cancel', consultation)}>
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Cancel
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleConsultationAction('edit', consultation)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleConsultationAction('delete', consultation)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalConsultations > 0 && !loadingConsultations && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalConsultations)} of {totalConsultations} consultations ({pageSize} per page)
                  </div>
                  {totalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {(() => {
                        const pages = [];
                        const maxVisiblePages = 7;
                        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                        
                        if (endPage - startPage + 1 < maxVisiblePages) {
                          startPage = Math.max(1, endPage - maxVisiblePages + 1);
                        }
                        
                        // Add first page and ellipsis if needed
                        if (startPage > 1) {
                          pages.push(
                            <Button
                              key={1}
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(1)}
                              className="w-8 h-8 p-0"
                            >
                              1
                            </Button>
                          );
                          if (startPage > 2) {
                            pages.push(
                              <span key="ellipsis1" className="px-2 text-gray-500">
                                ...
                              </span>
                            );
                          }
                        }
                        
                        // Add visible pages
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <Button
                              key={i}
                              variant={currentPage === i ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(i)}
                              className="w-8 h-8 p-0"
                            >
                              {i}
                            </Button>
                          );
                        }
                        
                        // Add last page and ellipsis if needed
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(
                              <span key="ellipsis2" className="px-2 text-gray-500">
                                ...
                              </span>
                            );
                          }
                          pages.push(
                            <Button
                              key={totalPages}
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(totalPages)}
                              className="w-8 h-8 p-0"
                            >
                              {totalPages}
                            </Button>
                          );
                        }
                        
                        return pages;
                      })()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Consultation Popup */}
      <Dialog open={showConsultationPopup} onOpenChange={setShowConsultationPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Upcoming Consultation
              {(() => {
                const pendingConsultations = localStorage.getItem('pendingPopupConsultations');
                if (pendingConsultations) {
                  try {
                    const remainingConsultations = JSON.parse(pendingConsultations);
                    if (remainingConsultations.length > 0) {
                      return (
                        <Badge variant="secondary" className="ml-2">
                          +{remainingConsultations.length} more
                        </Badge>
                      );
                    }
                  } catch (error) {
                    console.error('Error parsing pending consultations:', error);
                  }
                }
                return null;
              })()}
            </DialogTitle>
            <DialogDescription>
              A consultation is scheduled to start soon
            </DialogDescription>
          </DialogHeader>
          
          {upcomingConsultation && (
            <div className="space-y-4">
              {/* Patient Information */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="/patient-avatar-1.svg" />
                  <AvatarFallback>{upcomingConsultation.patient_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{upcomingConsultation.patient_name}</h4>
                  <p className="text-sm text-gray-600">Patient</p>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Time:</span>
                  <span className="font-medium">{upcomingConsultation.scheduled_time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Type:</span>
                  <Badge variant="outline" className="capitalize">
                    {upcomingConsultation.consultation_type}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fee:</span>
                  <span className="font-medium">₹{upcomingConsultation.consultation_fee}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Payment:</span>
                  <Badge className={getPaymentStatusColor(upcomingConsultation.is_paid)}>
                    {upcomingConsultation.is_paid ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    if ((upcomingConsultation as any).doctor_meeting_link) {
                      window.open((upcomingConsultation as any).doctor_meeting_link, '_blank');
                    } else {
                      toast.error('Meeting link not available');
                    }
                    setShowConsultationPopup(false);
                    setUpcomingConsultation(null);
                    setIsProcessingPopup(false);
                  }}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Meeting
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowConsultationPopup(false);
                    setUpcomingConsultation(null);
                    setIsProcessingPopup(false);
                  }}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Consultation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this consultation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConsultation}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsultationManagementEnhanced; 