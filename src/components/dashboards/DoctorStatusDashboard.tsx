import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
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
  Wifi, 
  WifiOff, 
  Users, 
  Clock, 
  Activity, 
  Search, 
  Filter, 
  RefreshCw, 
  MoreHorizontal, 
  Eye, 
  MessageSquare, 
  Phone, 
  Video, 
  Calendar, 
  UserCheck, 
  UserX, 
  AlertCircle, 
  CheckCircle, 
  Circle, 
  Coffee, 
  Briefcase, 
  Home,
  Settings,
  Bell,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  MapPin,
  Mail,
  Star,
  Clock as ClockIcon,
  CalendarDays,
  FileText,
  CreditCard,
  Zap,
  Shield,
  Heart,
  Brain,
  Stethoscope,
  Pill,
  Microscope,
  Thermometer,
  Syringe,
  Eye as EyeIcon,
  Ear,
  Baby,
  User,
  Users2,
  UserPlus,
  UserMinus,
  UserCog,
  UserCheck as UserCheckIcon,
  UserX as UserXIcon
} from 'lucide-react';
import { useDoctorSuperAdminWebSocket, DoctorStatusUpdate, WebSocketMessage } from '@/hooks/useDoctorSuperAdminWebSocket';
import { doctorStatusApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DoctorStatusStats {
  total_doctors: number;
  online_doctors: number;
  available_doctors: number;
  consulting_doctors: number;
  away_doctors: number;
  offline_doctors: number;
  recent_activity: number;
  status_breakdown: Record<string, number>;
  online_percentage: number;
  available_percentage: number;
}

interface DoctorStatusDashboardProps {
  isDarkMode?: boolean;
}

const DoctorStatusDashboard: React.FC<DoctorStatusDashboardProps> = ({ isDarkMode = false }) => {
  const { user } = useAuth();
  const [doctorStatuses, setDoctorStatuses] = useState<DoctorStatusUpdate[]>([]);
  const [filteredStatuses, setFilteredStatuses] = useState<DoctorStatusUpdate[]>([]);
  const [stats, setStats] = useState<DoctorStatusStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorStatusUpdate | null>(null);
  const [showDoctorDetails, setShowDoctorDetails] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // WebSocket connection for real-time updates
  const handleStatusUpdate = useCallback((status: DoctorStatusUpdate) => {
    setDoctorStatuses(prev => {
      const updated = prev.map(prevStatus => 
        prevStatus.doctor_id === status.doctor_id ? status : prevStatus
      );
      return updated;
    });
    setLastUpdate(new Date());
  }, []);

  const { isConnected, isConnecting, error, sendMessage, reconnect, userRole } = useDoctorSuperAdminWebSocket(
    handleStatusUpdate,
    undefined, // onSuperAdminRequest
    undefined, // onDoctorResponse
    () => {
      console.log('🔗 Doctor-SuperAdmin WebSocket CONNECTED successfully!');
      console.log('👨‍⚕️ User Role:', userRole);
      console.log('🌐 WebSocket URL: ws://127.0.0.1:8000/ws/doctor-superadmin/');
      toast.success('Real-time connection established');
    },
    () => {
      console.log('❌ Doctor-SuperAdmin WebSocket DISCONNECTED');
      toast.error('Real-time connection lost');
    }
  );

  // Debug WebSocket status
  useEffect(() => {
    console.log('WebSocket Status:', {
      isConnected,
      isConnecting,
      error
    });
  }, [isConnected, isConnecting, error]);

  // Periodic activity update to keep doctors marked as online
  useEffect(() => {
    const activityInterval = setInterval(() => {
      // Send a ping to keep the connection alive and update activity
      if (isConnected) {
        sendMessage({ type: 'ping' });
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(activityInterval);
  }, [isConnected, sendMessage]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load doctor statuses
        const statusResponse = await doctorStatusApi.getDoctorStatuses();
        if (statusResponse.data) {
          // Cast to unknown first to avoid TypeScript strict checking
          setDoctorStatuses(statusResponse.data as unknown as DoctorStatusUpdate[]);
          setFilteredStatuses(statusResponse.data as unknown as DoctorStatusUpdate[]);
        }

        // Load statistics
        const statsResponse = await doctorStatusApi.getDoctorStatusStats();
        if (statsResponse.data) {
          setStats(statsResponse.data);
        }
      } catch (error) {
        console.error('Error loading doctor status data:', error);
        toast.error('Failed to load doctor status data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Filter doctors based on search and filters
  useEffect(() => {
    let filtered = doctorStatuses;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.doctor_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.doctor_specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doctor => doctor.current_status === statusFilter);
    }

    // Apply availability filter
    if (availabilityFilter !== 'all') {
      switch (availabilityFilter) {
        case 'online':
          filtered = filtered.filter(doctor => doctor.is_online);
          break;
        case 'available':
          filtered = filtered.filter(doctor => doctor.is_available);
          break;
        case 'consulting':
          filtered = filtered.filter(doctor => doctor.current_status === 'consulting');
          break;
        case 'away':
          filtered = filtered.filter(doctor => doctor.current_status === 'away');
          break;
        case 'offline':
          filtered = filtered.filter(doctor => !doctor.is_online);
          break;
      }
    }

    setFilteredStatuses(filtered);
  }, [doctorStatuses, searchTerm, statusFilter, availabilityFilter]);

  // Update doctor status (for doctors updating their own status)
  const updateDoctorStatus = async (statusData: {
    current_status?: string;
    status_note?: string;
    is_available?: boolean;
  }) => {
    try {
      await doctorStatusApi.updateDoctorStatus(statusData);
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'consulting':
        return <Video className="h-4 w-4 text-blue-600" />;
      case 'busy':
        return <Briefcase className="h-4 w-4 text-orange-600" />;
      case 'away':
        return <Coffee className="h-4 w-4 text-yellow-600" />;
      case 'break':
        return <Coffee className="h-4 w-4 text-purple-600" />;
      case 'offline':
        return <UserX className="h-4 w-4 text-gray-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'consulting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'busy':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'away':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'break':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'offline':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSpecializationIcon = (specialization: string) => {
    const spec = specialization.toLowerCase();
    if (spec.includes('cardio')) return <Heart className="h-4 w-4" />;
    if (spec.includes('neuro')) return <Brain className="h-4 w-4" />;
    if (spec.includes('ortho')) return <Stethoscope className="h-4 w-4" />;
    if (spec.includes('pediatric')) return <Baby className="h-4 w-4" />;
    if (spec.includes('dental')) return <Stethoscope className="h-4 w-4" />;
    if (spec.includes('eye') || spec.includes('ophthal')) return <EyeIcon className="h-4 w-4" />;
    if (spec.includes('ent') || spec.includes('ear')) return <Ear className="h-4 w-4" />;
    if (spec.includes('dermat')) return <Thermometer className="h-4 w-4" />;
    if (spec.includes('psych')) return <Brain className="h-4 w-4" />;
    if (spec.includes('surg')) return <Syringe className="h-4 w-4" />;
    if (spec.includes('lab') || spec.includes('path')) return <Microscope className="h-4 w-4" />;
    return <Stethoscope className="h-4 w-4" />;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading doctor status data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctor Status Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of doctor availability and status
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-1 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">Disconnected</span>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={reconnect}
            disabled={isConnecting}
          >
            <RefreshCw className={cn("h-4 w-4", isConnecting && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_doctors}</div>
              <p className="text-xs text-muted-foreground">
                {stats.online_doctors} currently online
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.available_doctors}</div>
              <p className="text-xs text-muted-foreground">
                {stats.available_percentage.toFixed(1)}% of online doctors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Consultation</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.consulting_doctors}</div>
              <p className="text-xs text-muted-foreground">
                Currently with patients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.online_percentage.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.online_doctors} of {stats.total_doctors} doctors
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Doctor Status Overview</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="consulting">In Consultation</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="away">Away</SelectItem>
                <SelectItem value="break">On Break</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="consulting">In Consultation</SelectItem>
                <SelectItem value="away">Away</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredStatuses.length} of {doctorStatuses.length} doctors
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>

          {/* Doctor Status Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Current Consultation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStatuses.map((doctor) => (
                  <TableRow key={doctor.doctor_id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={doctor.doctor_profile_picture || undefined} 
                            alt={doctor.doctor_name}
                          />
                          <AvatarFallback>
                            {doctor.doctor_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{doctor.doctor_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {doctor.doctor_email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getSpecializationIcon(doctor.doctor_specialization)}
                        <span className="text-sm">{doctor.doctor_specialization}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(doctor.current_status)}
                        <Badge variant="outline" className={getStatusColor(doctor.current_status)}>
                          {doctor.status_display}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {doctor.is_online ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <Circle className="h-2 w-2 fill-current" />
                            <span className="text-sm">Online</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Circle className="h-2 w-2" />
                            <span className="text-sm">Offline</span>
                          </div>
                        )}
                        {doctor.is_available && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Available
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatTimeAgo(doctor.last_activity)}</div>
                        <div className="text-muted-foreground">
                          {doctor.last_activity_formatted}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {doctor.current_consultation_info ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {doctor.current_consultation_info.patient_name}
                          </div>
                          <div className="text-muted-foreground">
                            {new Date(doctor.current_consultation_info.scheduled_time).toLocaleTimeString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => {
                            setSelectedDoctor(doctor);
                            setShowDoctorDetails(true);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            Call Doctor
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Calendar className="mr-2 h-4 w-4" />
                            View Schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            View Consultations
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Doctor Details Dialog */}
      <Dialog open={showDoctorDetails} onOpenChange={setShowDoctorDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Doctor Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedDoctor?.doctor_name}
            </DialogDescription>
          </DialogHeader>
          {selectedDoctor && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage 
                    src={selectedDoctor.doctor_profile_picture || undefined} 
                    alt={selectedDoctor.doctor_name}
                  />
                  <AvatarFallback className="text-lg">
                    {selectedDoctor.doctor_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedDoctor.doctor_name}</h3>
                  <p className="text-muted-foreground">{selectedDoctor.doctor_email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {getSpecializationIcon(selectedDoctor.doctor_specialization)}
                    <span className="text-sm font-medium">{selectedDoctor.doctor_specialization}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Current Status</h4>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedDoctor.current_status)}
                    <Badge variant="outline" className={getStatusColor(selectedDoctor.current_status)}>
                      {selectedDoctor.status_display}
                    </Badge>
                  </div>
                  {selectedDoctor.status_note && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Note: {selectedDoctor.status_note}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Availability</h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {selectedDoctor.is_online ? (
                        <div className="flex items-center space-x-1 text-green-600">
                          <Circle className="h-2 w-2 fill-current" />
                          <span className="text-sm">Online</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Circle className="h-2 w-2" />
                          <span className="text-sm">Offline</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedDoctor.is_available ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Available for consultations
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          Not available
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Last Activity</h4>
                  <p className="text-sm">{formatTimeAgo(selectedDoctor.last_activity)}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDoctor.last_activity_formatted}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Last Login</h4>
                  {selectedDoctor.last_login ? (
                    <>
                      <p className="text-sm">{formatTimeAgo(selectedDoctor.last_login)}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedDoctor.last_login_formatted}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No login recorded</p>
                  )}
                </div>
              </div>

              {selectedDoctor.current_consultation_info && (
                <div>
                  <h4 className="font-medium mb-2">Current Consultation</h4>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Video className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">In Progress</span>
                    </div>
                    <p className="text-sm">
                      <strong>Patient:</strong> {selectedDoctor.current_consultation_info.patient_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Scheduled:</strong> {new Date(selectedDoctor.current_consultation_info.scheduled_time).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDoctorDetails(false)}>
                  Close
                </Button>
                <Button>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Connection Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={reconnect}
              className="mt-2"
            >
              Reconnect
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DoctorStatusDashboard;
