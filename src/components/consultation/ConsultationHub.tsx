import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Play,
  Pause,
  Square,
  RefreshCw,
  Bell,
  Calendar,
  Stethoscope,
  Heart,
  Activity,
  Thermometer,
  Pill,
  FileText,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Timer,
  Zap,
  TrendingUp,
  Users,
  Eye,
  Edit,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Star,
  Shield,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { doctorApi, Consultation as ApiConsultation, PatientProfile } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { formatDate, formatDateTime, getStatusColor } from '@/lib/api';
import ConsultationQueue from './ConsultationQueue';
import PatientContextPanel from './PatientContextPanel';
import ActiveConsultation from './ActiveConsultation';
import ConsultationStats from './ConsultationStats';

// Extend the API's Consultation type
interface Consultation extends ApiConsultation {
  doctor_meeting_link?: string;
  prescription?: {
    id: string;
    medicines: string[];
    instructions: string;
    writtenDate: string;
  }
}

interface ConsultationSession {
  consultation: Consultation;
  patient: PatientProfile;
  isActive: boolean;
  startTime?: Date;
  endTime?: Date;
  currentStep?: string;
}

interface ConsultationHubProps {
  doctorId?: string;
  clinicId?: string;
}

const ConsultationHub: React.FC<ConsultationHubProps> = ({ doctorId, clinicId }) => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [activeSession, setActiveSession] = useState<ConsultationSession | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('queue');
  const [showPatientContext, setShowPatientContext] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch consultations
  const fetchConsultations = useCallback(async () => {
    try {
      const response = await doctorApi.getAllConsultations({
        ordering: '-scheduled_date',
        page: 1,
        page_size: 50
      });
      
      if (response.results) {
        setConsultations(response.results);
      } else {
        setConsultations(response);
      }
    } catch (error) {
      console.error('Failed to fetch consultations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch consultations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Auto-refresh consultations every 30 seconds
  useEffect(() => {
    fetchConsultations();
    
    const interval = setInterval(() => {
      if (!activeSession) {
        fetchConsultations();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchConsultations, activeSession]);

  // Handle consultation actions
  const handleStartConsultation = async (consultation: Consultation) => {
    try {
      await doctorApi.startConsultation(consultation.id);
      
      // Find patient profile for this consultation
      const patientProfile = await doctorApi.getPatientProfile(consultation.patient);
      
      const session: ConsultationSession = {
        consultation,
        patient: patientProfile,
        isActive: true,
        startTime: new Date(),
        currentStep: 'assessment'
      };
      
      setActiveSession(session);
      setActiveTab('active');
      
      toast({
        title: "Consultation Started",
        description: `Started consultation with ${consultation.patient_name}`,
        variant: "default",
      });
    } catch (error) {
      console.error('Failed to start consultation:', error);
      toast({
        title: "Error",
        description: "Failed to start consultation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteConsultation = async (prescription?: any) => {
    if (!activeSession) return;
    
    try {
      await doctorApi.completeConsultation(activeSession.consultation.id);
      
      setActiveSession(null);
      setActiveTab('queue');
      
      toast({
        title: "Consultation Completed",
        description: "Consultation has been completed successfully.",
        variant: "default",
      });
      
      // Refresh consultations
      fetchConsultations();
    } catch (error) {
      console.error('Failed to complete consultation:', error);
      toast({
        title: "Error",
        description: "Failed to complete consultation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setShowPatientContext(true);
  };

  const getConsultationStats = () => {
    const stats = {
      total: consultations.length,
      scheduled: consultations.filter(c => c.status === 'scheduled').length,
      inProgress: consultations.filter(c => c.status === 'in-progress').length,
      completed: consultations.filter(c => c.status === 'completed').length,
      cancelled: consultations.filter(c => c.status === 'cancelled').length,
      today: consultations.filter(c => {
        const today = new Date().toISOString().split('T')[0];
        return c.scheduled_date === today;
      }).length
    };
    return stats;
  };

  const stats = getConsultationStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading consultation hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Stethoscope className="w-8 h-8 mr-3 text-blue-600" />
            Consultation Hub
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your patient consultations efficiently
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setRefreshing(true)}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          
          <Badge variant="outline" className="text-sm">
            <Activity className="w-3 h-3 mr-1" />
            {activeSession ? 'Active Session' : 'Available'}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Scheduled</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.scheduled}</p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">In Progress</p>
                <p className="text-2xl font-bold text-green-900">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Completed</p>
                <p className="text-2xl font-bold text-purple-900">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-900">{stats.cancelled}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Today</p>
                <p className="text-2xl font-bold text-orange-900">{stats.today}</p>
              </div>
              <CalendarDays className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Consultation Queue & Patient Context */}
        <div className="lg:col-span-1 space-y-6">
          {/* Consultation Queue */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Consultation Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ConsultationQueue
                consultations={consultations}
                onSelectConsultation={handleSelectConsultation}
                onStartConsultation={handleStartConsultation}
                activeSession={activeSession}
              />
            </CardContent>
          </Card>

          {/* Patient Context Panel */}
          {selectedConsultation && showPatientContext && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                  <span className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Patient Context
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPatientContext(false)}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <PatientContextPanel
                  consultation={selectedConsultation}
                  onClose={() => setShowPatientContext(false)}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Active Consultation or Queue Details */}
        <div className="lg:col-span-3">
          {activeSession ? (
            <ActiveConsultation
              session={activeSession}
              onComplete={handleCompleteConsultation}
              onUpdate={(updatedSession) => setActiveSession(updatedSession)}
            />
          ) : (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Video className="w-6 h-6 mr-3" />
                  Consultation Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ConsultationStats consultations={consultations} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationHub;
