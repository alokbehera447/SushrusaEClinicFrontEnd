import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  Stethoscope, 
  Play, 
  RefreshCw,
  Users,
  Activity,
  Eye,
  AlertCircle,
  CheckCircle,
  DollarSign,
  MessageSquare,
  Filter,
  Search,
  CalendarDays,
  CheckSquare,
  Square,
  ArrowRight
} from 'lucide-react';
import { 
  consultationService, 
  type Consultation,
  type ConsultationManagementParams,
  getStatusColor, 
  getStatusText, 
  formatDateTime, 
  formatTime 
} from '@/services/consultationService';

interface DoctorConsultationManagementDashboardProps {
  onConsultationSelect?: (consultation: Consultation) => void;
}

export const DoctorConsultationManagementDashboard: React.FC<DoctorConsultationManagementDashboardProps> = ({
  onConsultationSelect
}) => {
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ConsultationManagementParams>({
    status: 'all',
    search: '',
    ordering: '-scheduled_date',
    page: 1,
    page_size: 20
  });
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    checkedIn: 0,
    ready: 0,
    inProgress: 0,
    completed: 0
  });
  // Overdue state (read-only)
  const [showOverdue, setShowOverdue] = useState(false);
  const [overdue, setOverdue] = useState<Consultation[]>([]);
  const [loadingOverdue, setLoadingOverdue] = useState(false);

  // Load consultations
  const loadConsultations = async () => {
    try {
      setLoading(true);
      const response = await consultationService.getDoctorConsultations(filters);
      
      if (response.success) {
        console.log('Doctor consultations response:', response.data);
        
        // Ensure data is an array
        const consultationsData = Array.isArray(response.data) ? response.data : [];
        setConsultations(consultationsData);
        
        // Calculate stats
        const statsData = {
          total: consultationsData.length,
          scheduled: consultationsData.filter(c => c.status === 'scheduled').length,
          checkedIn: consultationsData.filter(c => c.status === 'patient_checked_in').length,
          ready: consultationsData.filter(c => c.status === 'ready_for_consultation').length,
          inProgress: consultationsData.filter(c => c.status === 'in_progress').length,
          completed: consultationsData.filter(c => c.status === 'completed').length
        };
        setStats(statsData);
      } else {
        toast({
          title: "Error",
          description: "Failed to load consultations",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading consultations:', error);
      toast({
        title: "Error",
        description: "Failed to load consultations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load overdue (read-only)
  const loadOverdue = async () => {
    try {
      setLoadingOverdue(true);
      const response = await consultationService.getDoctorOverdueConsultations();
      if (response.success) {
        const data = Array.isArray(response.data) ? response.data : [];
        setOverdue(data);
        setShowOverdue(true);
      } else {
        toast({ title: 'Error', description: 'Failed to load overdue consultations', variant: 'destructive' });
      }
    } catch (e) {
      console.error('Error loading overdue consultations:', e);
      toast({ title: 'Error', description: 'Failed to load overdue consultations', variant: 'destructive' });
    } finally {
      setLoadingOverdue(false);
    }
  };

  // Start consultation
  const handleStartConsultation = async (consultation: Consultation) => {
    try {
      const response = await consultationService.startConsultation(consultation.id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        loadConsultations(); // Refresh the list
        
        // Navigate to consultation workspace
        if (onConsultationSelect) {
          onConsultationSelect(consultation);
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to start consultation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error starting consultation:', error);
      toast({
        title: "Error",
        description: "Failed to start consultation",
        variant: "destructive",
      });
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof ConsultationManagementParams, value: string | number) => {
    // Handle "all" status as empty string for API
    const apiValue = key === 'status' && value === 'all' ? '' : value;
    setFilters(prev => ({
      ...prev,
      [key]: apiValue,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Load consultations when filters change
  useEffect(() => {
    loadConsultations();
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Consultations</h2>
          <p className="text-gray-600">Manage your consultations and start sessions with ready patients</p>
        </div>
        <div className="flex items-center">
          <Button onClick={loadConsultations} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={loadOverdue} variant="outline" disabled={loadingOverdue} className="ml-2">
            <AlertCircle className={`h-4 w-4 mr-2 ${loadingOverdue ? 'animate-spin' : ''}`} />
            Overdue
          </Button>
        </div>
      </div>

      {/* Overdue List (read-only) */}
      {showOverdue && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Overdue Consultations
            </CardTitle>
            <CardDescription>
              Consultations past their scheduled time. Admin will handle rescheduling.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingOverdue ? (
              <div className="flex items-center justify-center py-8 text-gray-600">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading overdue consultations...
              </div>
            ) : overdue.length === 0 ? (
              <div className="text-center py-8 text-gray-600">No overdue consultations</div>
            ) : (
              <div className="space-y-4">
                {overdue.map((c) => (
                  <div key={c.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{c.patient_name}</h4>
                          <Badge className={getStatusColor('overdue')}>Overdue</Badge>
                          {typeof c.hours_overdue === 'number' && (
                            <span className="text-xs text-red-700">{c.hours_overdue.toFixed(1)}h overdue</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDateTime(c.scheduled_date, c.scheduled_time)}</span>
                          </div>
                        </div>
                      </div>
                      {/* Read-only: no doctor actions */}
                    </div>
                    {c.reschedule_status && (
                      <div className="mt-2 text-xs text-gray-500">Reschedule status: {c.reschedule_status}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Checked In</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.checkedIn}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ready</p>
                <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-blue-600" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="patient_checked_in">Checked In</SelectItem>
                  <SelectItem value="ready_for_consultation">Ready</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="search" className="text-sm font-medium">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Patient name, complaint..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="ordering" className="text-sm font-medium">Sort By</Label>
              <Select 
                value={filters.ordering} 
                onValueChange={(value) => handleFilterChange('ordering', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-scheduled_date">Date (Newest)</SelectItem>
                  <SelectItem value="scheduled_date">Date (Oldest)</SelectItem>
                  <SelectItem value="patient_name">Patient Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="page-size" className="text-sm font-medium">Items per page</Label>
              <Select 
                value={filters.page_size?.toString()} 
                onValueChange={(value) => handleFilterChange('page_size', parseInt(value))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="20" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultations List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            My Consultations
          </CardTitle>
          <CardDescription>
            Manage your consultations and start sessions with ready patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mr-3 text-blue-600" />
              <span className="text-lg text-gray-600">Loading consultations...</span>
            </div>
          ) : consultations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations found</h3>
              <p className="text-gray-500">Try adjusting your filters or search criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {consultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-lg text-gray-900">{consultation.patient_name}</h3>
                        </div>
                        <Badge className={getStatusColor(consultation.status)}>
                          {getStatusText(consultation.status)}
                        </Badge>
                        <span className="text-sm text-gray-500 font-mono">#{consultation.id}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDateTime(consultation.scheduled_date, consultation.scheduled_time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{consultation.duration} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>${consultation.consultation_fee}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>{consultation.consultation_type}</span>
                        </div>
                      </div>
                      
                      {consultation.chief_complaint && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700">
                            <strong>Chief Complaint:</strong> {consultation.chief_complaint}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-6">
                      {/* Start Consultation Button - Only for Ready Patients */}
                      {consultation.status === 'ready_for_consultation' && (
                        <Button
                          onClick={() => handleStartConsultation(consultation)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 shadow-lg"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start Consultation
                        </Button>
                      )}
                      
                      {/* View Details Button */}
                      <Button
                        onClick={() => onConsultationSelect?.(consultation)}
                        variant="outline"
                        size="sm"
                        className="border-blue-500 text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                  
                  {/* Check-in Information */}
                  {(consultation.checked_in_at || consultation.ready_for_consultation_at) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {consultation.checked_in_at && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Patient checked in: {new Date(consultation.checked_in_at).toLocaleString()}</span>
                          </div>
                        )}
                        {consultation.ready_for_consultation_at && (
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            <span>Marked ready: {new Date(consultation.ready_for_consultation_at).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
