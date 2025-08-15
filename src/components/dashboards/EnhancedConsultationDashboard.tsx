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
  RefreshCw,
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
  const [refreshing, setRefreshing] = useState(false);
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
      await Promise.all([
        fetchConsultations(),
        fetchStats(),
        fetchAnalytics(),
        fetchRealTimeUpdates()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultations = async (page: number = currentPage) => {
    try {
      setPaginationLoading(true);
      const response = await consultationService.getDoctorConsultations({
        page: page,
        page_size: pageSize,
        status: filter !== 'all' ? filter : undefined,
        search: debouncedSearchTerm || undefined
      });
      // Ensure we always have an array
      const consultationsArray = Array.isArray(response?.consultations) ? response.consultations : [];
      setConsultations(consultationsArray);
      setTotalPages(response?.total_pages || 1);
      setTotalConsultations(response?.total || 0);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E17726]"></div>
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
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-white rounded-xl p-2 shadow-sm border border-gray-200">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#E17726] data-[state=active]:text-white">
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="consultations" className="data-[state=active]:bg-[#E17726] data-[state=active]:text-white">
            <Video className="w-4 h-4 mr-2" />
            Consultations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#E17726] data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-[#E17726] data-[state=active]:text-white">
            <Award className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Consultations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Consultations</span>
                  <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.isArray(filteredConsultations) && filteredConsultations.length > 0 ? (
                    filteredConsultations.slice(0, 5).map((consultation) => (
                      <div key={consultation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={consultation.patient?.profile_picture} />
                            <AvatarFallback>{consultation.patient?.name?.charAt(0) || 'P'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{consultation.patient?.name || 'Unknown Patient'}</p>
                            <p className="text-xs text-gray-500">{consultation.consultation_id || consultation.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(consultation.status)}>
                            {consultation.status?.replace('_', ' ') || 'Unknown'}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => openConsultationWorkflow(consultation)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Video className="w-3 h-3 mr-1" />
                            Open
                          </Button>
                          {consultation.status === 'scheduled' && (
                            <Button
                              size="sm"
                              onClick={() => handleConsultationAction(consultation.id, 'start')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <PlayCircle className="w-3 h-3 mr-1" />
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No consultations available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{stats.total_consultations}</p>
                        <p className="text-sm text-gray-600">Total Consultations</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {stats.total_consultations > 0 ? Math.round((stats.completed_consultations / stats.total_consultations) * 100) : 0}%
                        </p>
                        <p className="text-sm text-gray-600">Completion Rate</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">₹{stats.total_revenue}</p>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">{stats.doctor_consultation_stats?.average_duration || 0}min</p>
                        <p className="text-sm text-gray-600">Avg Duration</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Consultations Tab */}
        <TabsContent value="consultations" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search consultations..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E17726] focus:border-transparent"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E17726] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <Button onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4">
            {Array.isArray(filteredConsultations) && filteredConsultations.length > 0 ? (
              filteredConsultations.map((consultation) => (
                <Card key={consultation.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={consultation.patient?.profile_picture} />
                          <AvatarFallback>{consultation.patient?.name?.charAt(0) || 'P'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{consultation.patient?.name || 'Unknown Patient'}</h3>
                          <p className="text-sm text-gray-500">{consultation.consultation_id || consultation.id}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getConsultationTypeIcon(consultation.consultation_type)}
                            <span className="text-xs text-gray-500">
                              {consultation.scheduled_date} at {consultation.scheduled_time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(consultation.status)}>
                          {consultation.status?.replace('_', ' ') || 'Unknown'}
                        </Badge>
                        <div className="text-right">
                          <p className="font-semibold">₹{consultation.consultation_fee || 0}</p>
                          <p className="text-xs text-gray-500">{consultation.duration || 0} min</p>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            onClick={() => openConsultationWorkflow(consultation)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Video className="w-3 h-3" />
                          </Button>
                          {consultation.status === 'scheduled' && (
                            <Button
                              size="sm"
                              onClick={() => handleConsultationAction(consultation.id, 'start')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <PlayCircle className="w-3 h-3" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No consultations found</p>
                </CardContent>
              </Card>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Show:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-600">per page</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalConsultations)} of {totalConsultations} consultations
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || paginationLoading}
                  >
                    {paginationLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ChevronLeft className="w-4 h-4" />
                    )}
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {/* Generate page numbers with proper logic */}
                    {(() => {
                      const pages = [];
                      const maxVisiblePages = 5;
                      
                      if (totalPages <= maxVisiblePages) {
                        // Show all pages if total is small
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // Show smart pagination for large numbers
                        if (currentPage <= 3) {
                          // Near the beginning
                          for (let i = 1; i <= 4; i++) {
                            pages.push(i);
                          }
                          pages.push('...');
                          pages.push(totalPages);
                        } else if (currentPage >= totalPages - 2) {
                          // Near the end
                          pages.push(1);
                          pages.push('...');
                          for (let i = totalPages - 3; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          // In the middle
                          pages.push(1);
                          pages.push('...');
                          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                            pages.push(i);
                          }
                          pages.push('...');
                          pages.push(totalPages);
                        }
                      }
                      
                      return pages.map((page, index) => {
                        if (page === '...') {
                          return (
                            <span key={`ellipsis-${index}`} className="text-gray-400 px-2">
                              ...
                            </span>
                          );
                        }
                        
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page as number)}
                            disabled={paginationLoading}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      });
                    })()}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || paginationLoading}
                  >
                    Next
                    {paginationLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Consultation Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.isArray(stats?.doctor_consultation_stats?.consultation_type_distribution) 
                      ? stats.doctor_consultation_stats.consultation_type_distribution.map((type) => (
                        <div key={type.type} className="flex items-center justify-between">
                          <span className="capitalize">{type.type.replace('_', ' ')}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#E17726] h-2 rounded-full"
                                style={{ width: `${type.percentage || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{type.count || 0}</span>
                          </div>
                        </div>
                      ))
                      : <p className="text-gray-500 text-center py-4">No consultation type data available</p>
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { status: 'scheduled', count: stats?.scheduled_consultations || 0, percentage: stats?.scheduled_consultations ? (stats.scheduled_consultations / stats.total_consultations) * 100 : 0 },
                      { status: 'completed', count: stats?.completed_consultations || 0, percentage: stats?.completed_consultations ? (stats.completed_consultations / stats.total_consultations) * 100 : 0 },
                      { status: 'cancelled', count: stats?.cancelled_consultations || 0, percentage: stats?.cancelled_consultations ? (stats.cancelled_consultations / stats.total_consultations) * 100 : 0 }
                    ].map((status) => (
                      <div key={status.status} className="flex items-center justify-between">
                        <span className="capitalize">{status.status.replace('_', ' ')}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[#E17726] h-2 rounded-full"
                              style={{ width: `${status.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{status.count}</span>
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
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-600">{stats?.doctor_consultation_stats?.average_rating || 0}</h3>
                <p className="text-gray-600">Average Rating</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-blue-600">{stats?.doctor_consultation_stats?.average_duration || 0} min</h3>
                <p className="text-gray-600">Average Duration</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-purple-600">₹{stats?.doctor_consultation_stats?.revenue_stats?.average_consultation_fee || 0}</h3>
                <p className="text-gray-600">Average Fee</p>
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
