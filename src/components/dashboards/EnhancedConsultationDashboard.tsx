import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  PlayCircle,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Bell,
  Search,
  Filter,
  Eye,
  Edit,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Star,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Shield,
  Award,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { consultationService, Consultation, ConsultationStats, ConsultationAnalytics } from '@/lib/consultationService';
import { doctorConsultationApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import EnhancedConsultationWorkflow from './EnhancedConsultationWorkflow';

interface RealTimeStats {
  todayConsultations: number;
  upcomingConsultations: number;
  completedToday: number;
  revenueToday: number;
  avgRating: number;
  activePatients: number;
}

const EnhancedConsultationDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [stats, setStats] = useState<ConsultationStats | null>(null);
  const [analytics, setAnalytics] = useState<ConsultationAnalytics | null>(null);
  const [realTimeStats, setRealTimeStats] = useState<RealTimeStats>({
    todayConsultations: 0,
    upcomingConsultations: 0,
    completedToday: 0,
    revenueToday: 0,
    avgRating: 0,
    activePatients: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalConsultations, setTotalConsultations] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [paginationLoading, setPaginationLoading] = useState(false);

  const { user } = useAuth();

  // Fetch initial data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch consultations when page, pageSize, filter, or debounced search changes
  useEffect(() => {
    if (!loading) { // Only fetch if not in initial loading state
      fetchConsultations(currentPage);
    }
  }, [currentPage, pageSize, filter, debouncedSearchTerm]);

  // Real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRealTimeUpdates();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      await Promise.all([
        fetchConsultations(),
        fetchStats(),
        fetchAnalytics(),
        fetchRealTimeUpdates()
      ]);
      console.log('Dashboard data fetched successfully');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      console.log('Loading set to false');
    }
  };

  const fetchConsultations = async (page: number = currentPage) => {
    try {
      setPaginationLoading(true);
      console.log('Fetching consultations...');
      const response = await consultationService.getDoctorConsultations({
        page: page,
        page_size: pageSize,
        status: filter !== 'all' ? filter : undefined,
        search: debouncedSearchTerm || undefined
      });
      console.log('Consultations response:', response);
      // Ensure we always have an array
      const consultationsArray = Array.isArray(response?.consultations) ? response.consultations : [];
      setConsultations(consultationsArray);
      setTotalPages(response?.total_pages || 1);
      setTotalConsultations(response?.total || 0);
      console.log('Consultations fetched:', consultationsArray.length);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      setConsultations([]);
      setTotalPages(1);
      setTotalConsultations(0);
    } finally {
      setPaginationLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const stats = await consultationService.getConsultationStats({
        date_from: startDate.toISOString().split('T')[0],
        date_to: new Date().toISOString().split('T')[0]
      });
      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats structure if API fails
      setStats({
        total_consultations: 0,
        scheduled_consultations: 0,
        completed_consultations: 0,
        cancelled_consultations: 0,
        total_revenue: 0,
        consultation_trends: [],
        doctor_consultation_stats: {
          average_duration: 0,
          average_rating: 0,
          consultation_type_distribution: [],
          revenue_stats: {
            total_revenue: 0,
            average_consultation_fee: 0,
            pending_payments: 0
          }
        }
      });
    }
  };

  const fetchAnalytics = async () => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const analytics = await consultationService.getConsultationAnalytics({
        date_from: startDate.toISOString().split('T')[0],
        date_to: new Date().toISOString().split('T')[0],
        group_by: 'day'
      });
      setAnalytics(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set default analytics structure if API fails
      setAnalytics({
        daily_stats: [],
        status_distribution: [],
        consultation_types: [],
        revenue_trends: []
      });
    }
  };

  const fetchRealTimeUpdates = async () => {
    try {
      const updates = await consultationService.getRealTimeUpdates();
      const todayConsultations = updates?.today_consultations || [];
      const upcomingConsultations = updates?.upcoming_consultations || [];
      
      setRealTimeStats({
        todayConsultations: todayConsultations.length,
        upcomingConsultations: upcomingConsultations.length,
        completedToday: todayConsultations.filter(c => c.status === 'completed').length,
        revenueToday: todayConsultations.reduce((sum, c) => sum + (c.is_paid ? c.consultation_fee : 0), 0),
        avgRating: 4.8, // This would come from ratings API
        activePatients: new Set(todayConsultations.map(c => c.patient.id)).size
      });
    } catch (error) {
      console.error('Error fetching real-time updates:', error);
    }
  };


  const handleConsultationAction = async (consultationId: string, action: 'start' | 'complete' | 'cancel' | 'open') => {
    try {
      switch (action) {
        case 'open':
          window.location.href = `/consultation/${consultationId}/workspace`;
          return;
        case 'start':
          await consultationService.startConsultation(consultationId);
          break;
        case 'complete':
          await consultationService.completeConsultation(consultationId);
          break;
        case 'cancel':
          await consultationService.cancelConsultation(consultationId, 'Cancelled by doctor');
          break;
      }
      await fetchConsultations();
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
    }
  };

  const openConsultationWorkflow = (consultation: Consultation) => {
    // Navigate to dedicated workspace page instead of modal
    handleConsultationAction(consultation.id, 'open');
  };

  const closeConsultationWorkflow = () => {
    setShowWorkflow(false);
    setSelectedConsultation(null);
  };

  const handleConsultationStatusUpdate = (status: string) => {
    if (selectedConsultation) {
      setSelectedConsultation(prev => prev ? { ...prev, status } : null);
    }
    fetchConsultations(); // Refresh the list
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchConsultations(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
    fetchConsultations(1);
  };

  // Filter and search handlers
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page
    // Don't call fetchConsultations here - it will be called by useEffect
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Reset to first page
    // Don't call fetchConsultations here - it will be called by useEffect
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConsultationTypeIcon = (type: string) => {
    switch (type) {
      case 'video_call': return <Video className="w-4 h-4" />;
      case 'voice_call': return <Phone className="w-4 h-4" />;
      case 'chat': return <MessageSquare className="w-4 h-4" />;
      case 'in_person': return <Users className="w-4 h-4" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  // Since we're now fetching filtered data from the backend, we can use consultations directly
  const filteredConsultations = consultations || [];

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout - forcing component to render');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E17726]"></div>
        <p className="text-gray-600">Loading consultations...</p>
        <Button 
          variant="outline" 
          onClick={() => setLoading(false)}
          className="text-sm"
        >
          Skip Loading
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with real-time stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Consultations</p>
                <p className="text-2xl font-bold">{stats?.total_consultations || 0}</p>
              </div>
              <Calendar className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Completed</p>
                <p className="text-2xl font-bold">{stats?.completed_consultations || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Revenue</p>
                <p className="text-2xl font-bold">₹{stats?.total_revenue || 0}</p>
              </div>
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Scheduled</p>
                <p className="text-2xl font-bold">{stats?.scheduled_consultations || 0}</p>
              </div>
              <Clock className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Manage your consultations and patient flow</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => navigate('/doctor/consultations')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Activity className="w-4 h-4 mr-2" />
                Manage Consultations
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-white rounded-xl p-1 sm:p-2 shadow-sm border border-gray-200 gap-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#E17726] data-[state=active]:text-white text-xs sm:text-sm p-2 sm:p-3">
            <Activity className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#E17726] data-[state=active]:text-white text-xs sm:text-sm p-2 sm:p-3">
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-[#E17726] data-[state=active]:text-white text-xs sm:text-sm p-2 sm:p-3">
            <Award className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Performance</span>
            <span className="sm:hidden">Performance</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Recent Consultations */}
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base">
                  Recent Consultations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="space-y-2 sm:space-y-3">
                  {Array.isArray(filteredConsultations) && filteredConsultations.length > 0 ? (
                    filteredConsultations.slice(0, 5).map((consultation) => (
                      <div key={consultation.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-0">
                          <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                            <AvatarImage src={consultation.patient?.profile_picture} />
                            <AvatarFallback className="text-xs">{consultation.patient?.name?.charAt(0) || 'P'}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-xs sm:text-sm truncate">{consultation.patient?.name || 'Unknown Patient'}</p>
                            <p className="text-xs text-gray-500 truncate">{consultation.consultation_id || consultation.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end space-x-1 sm:space-x-2">
                          <Badge className={`text-xs ${getStatusColor(consultation.status)}`}>
                            {consultation.status?.replace('_', ' ') || 'Unknown'}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              onClick={() => openConsultationWorkflow(consultation)}
                              className="bg-blue-600 hover:bg-blue-700 text-xs px-2 sm:px-3"
                            >
                              <Video className="w-3 h-3 sm:mr-1" />
                              <span className="hidden sm:inline">Open</span>
                            </Button>
                            {consultation.status === 'scheduled' && (
                              <Button
                                size="sm"
                                onClick={() => handleConsultationAction(consultation.id, 'start')}
                                className="bg-green-600 hover:bg-green-700 text-xs px-2 sm:px-3"
                              >
                                <PlayCircle className="w-3 h-3 sm:mr-1" />
                                <span className="hidden sm:inline">Start</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4 text-sm sm:text-base">No consultations available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base">Quick Statistics</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                {stats && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                        <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.total_consultations}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Total Consultations</p>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                        <p className="text-lg sm:text-2xl font-bold text-green-600">
                          {stats.total_consultations > 0 ? Math.round((stats.completed_consultations / stats.total_consultations) * 100) : 0}%
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">Completion Rate</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="text-center p-2 sm:p-3 bg-purple-50 rounded-lg">
                        <p className="text-lg sm:text-2xl font-bold text-purple-600">₹{stats.total_revenue}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Total Revenue</p>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-lg">
                        <p className="text-lg sm:text-2xl font-bold text-orange-600">{stats.doctor_consultation_stats?.average_duration || 0}min</p>
                        <p className="text-xs sm:text-sm text-gray-600">Avg Duration</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-base">Consultation Types</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    {Array.isArray(stats?.doctor_consultation_stats?.consultation_type_distribution) 
                      ? stats.doctor_consultation_stats.consultation_type_distribution.map((type) => (
                        <div key={type.type} className="flex items-center justify-between">
                          <span className="capitalize text-xs sm:text-sm">{type.type.replace('_', ' ')}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 sm:w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#E17726] h-2 rounded-full"
                                style={{ width: `${type.percentage || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs sm:text-sm font-medium">{type.count || 0}</span>
                          </div>
                        </div>
                      ))
                      : <p className="text-gray-500 text-center py-4 text-sm sm:text-base">No consultation type data available</p>
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-base">Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    {[
                      { status: 'scheduled', count: stats?.scheduled_consultations || 0, percentage: stats?.scheduled_consultations ? (stats.scheduled_consultations / stats.total_consultations) * 100 : 0 },
                      { status: 'completed', count: stats?.completed_consultations || 0, percentage: stats?.completed_consultations ? (stats.completed_consultations / stats.total_consultations) * 100 : 0 },
                      { status: 'cancelled', count: stats?.cancelled_consultations || 0, percentage: stats?.cancelled_consultations ? (stats.cancelled_consultations / stats.total_consultations) * 100 : 0 }
                    ].map((status) => (
                      <div key={status.status} className="flex items-center justify-between">
                        <span className="capitalize text-xs sm:text-sm">{status.status.replace('_', ' ')}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 sm:w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[#E17726] h-2 rounded-full"
                              style={{ width: `${status.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs sm:text-sm font-medium">{status.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Star className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-green-600">{stats?.doctor_consultation_stats?.average_rating || 0}</h3>
                <p className="text-xs sm:text-sm text-gray-600">Average Rating</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-blue-600">{stats?.doctor_consultation_stats?.average_duration || 0} min</h3>
                <p className="text-xs sm:text-sm text-gray-600">Average Duration</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-purple-600">₹{stats?.doctor_consultation_stats?.revenue_stats?.average_consultation_fee || 0}</h3>
                <p className="text-xs sm:text-sm text-gray-600">Average Fee</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Consultation Workflow Modal */}
      {showWorkflow && selectedConsultation && (
        <EnhancedConsultationWorkflow
          consultation={selectedConsultation}
          onClose={closeConsultationWorkflow}
          onStatusUpdate={handleConsultationStatusUpdate}
        />
      )}
    </div>
  );
};

export default EnhancedConsultationDashboard;
