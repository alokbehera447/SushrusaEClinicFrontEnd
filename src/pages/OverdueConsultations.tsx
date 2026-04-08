import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  AlertCircle, 
  Clock, 
  User, 
  Stethoscope, 
  Calendar,
  Search,
  RefreshCw,
  RotateCcw,
  Eye,
  DollarSign,
  Phone,
  Mail,
  Loader2
} from 'lucide-react';
import { consultationService } from '@/services/consultationService';
import { toast } from '@/hooks/use-toast';
import { formatDateTime, formatTime } from '@/services/consultationService';
import { useAuth } from '@/context/AuthContext';
import { adminConsultationApi } from '@/lib/api';

interface OverdueConsultation {
  id: string;
  patient: string;
  doctor: string;
  patient_name: string;
  doctor_name: string;
  consultation_type: string;
  scheduled_date: string;
  scheduled_time: string;
  duration: number;
  status: string;
  payment_status: string;
  consultation_fee: string;
  is_paid: boolean;
  created_at: string;
  doctor_meeting_link: string;
  is_overdue: boolean;
  hours_overdue: number;
  reschedule_status: string;
  reschedule_requested: boolean;
  reschedule_approved: boolean;
}

const OverdueConsultations: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<OverdueConsultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOverdueConsultations();
  }, []);

  const loadOverdueConsultations = async () => {
    try {
      setLoading(true);
      
      // Use the main consultation API with overdue status filter
      // This will respect admin e-clinic assignments automatically
      const response = await adminConsultationApi.getAllConsultations({
        status: 'overdue',
        page: 1,
        page_size: 100, // Get all overdue consultations
        ordering: '-scheduled_date'
      });
      
      setConsultations(response.results || []);
    } catch (error) {
      console.error('Error loading overdue consultations:', error);
      toast({
        title: "Error",
        description: "Failed to load overdue consultations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = (consultationId: string) => {
    navigate(`/dashboard/consultations/${consultationId}/reschedule`);
  };

  const handleViewDetails = (consultation: OverdueConsultation) => {
    // Create a simple consultation details modal or navigate to consultation management with details
    toast({
      title: "Consultation Details",
      description: `${consultation.patient_name} with ${consultation.doctor_name} - ${consultation.hours_overdue.toFixed(1)}h overdue`,
    });
    
    // Alternative: Navigate back to main consultations and show details
    // navigate(`/dashboard/consultations?highlight=${consultation.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'ready_for_consultation': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredConsultations = consultations.filter(consultation =>
    consultation.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    consultation.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    consultation.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/dashboard/consultations')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Consultations
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Overdue Consultations</h1>
            <p className="text-sm text-gray-600">Manage consultations that are past their scheduled time</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-red-100 text-red-800 px-3 py-1">
            <AlertCircle className="w-4 h-4 mr-1" />
            {consultations.length} Overdue
          </Badge>
          <Button 
            onClick={loadOverdueConsultations} 
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by patient name, doctor name, or consultation ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Overdue Consultations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Overdue Consultations ({filteredConsultations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              <span className="ml-3">Loading overdue consultations...</span>
            </div>
          ) : filteredConsultations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No overdue consultations found</h3>
              <p>All consultations are on schedule or completed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Header Row */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-600">
                <div className="col-span-2">Patient</div>
                <div className="col-span-2">Doctor</div>
                <div className="col-span-2">Scheduled</div>
                <div className="col-span-1">Type</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Overdue</div>
                <div className="col-span-1">Fee</div>
                <div className="col-span-2">Actions</div>
              </div>

              {/* Consultation Rows */}
              {filteredConsultations.map((consultation) => (
                <div key={consultation.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  {/* Desktop Layout */}
                  <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                    {/* Patient */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate" title={consultation.patient_name}>
                            {consultation.patient_name}
                          </div>
                          <div className="text-xs text-gray-500">ID: {consultation.patient}</div>
                        </div>
                      </div>
                    </div>

                    {/* Doctor */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate" title={consultation.doctor_name}>
                            {consultation.doctor_name}
                          </div>
                          <div className="text-xs text-gray-500">ID: {consultation.doctor}</div>
                        </div>
                      </div>
                    </div>

                    {/* Scheduled */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(consultation.scheduled_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {consultation.scheduled_time}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="col-span-1">
                      <Badge variant="outline" className="text-xs">
                        {consultation.consultation_type.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                      <Badge className={`${getStatusColor(consultation.status)} text-xs`}>
                        {consultation.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Overdue Hours */}
                    <div className="col-span-1">
                      <div className="text-sm font-semibold text-red-600">
                        {consultation.hours_overdue.toFixed(1)}h
                      </div>
                      <div className="text-xs text-gray-500">overdue</div>
                    </div>

                    {/* Fee */}
                    <div className="col-span-1">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {consultation.consultation_fee}
                        </span>
                      </div>
                      <div className={`text-xs ${consultation.is_paid ? 'text-green-600' : 'text-orange-600'}`}>
                        {consultation.payment_status}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(consultation)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                      {consultation.reschedule_status === 'eligible' && (
                        <Button
                          size="sm"
                          onClick={() => handleReschedule(consultation.id)}
                          className="bg-[#E17726] hover:bg-[#c9651e] text-white flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reschedule
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="lg:hidden space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{consultation.patient_name}</h3>
                        <p className="text-sm text-gray-600">with {consultation.doctor_name}</p>
                        <p className="text-xs text-gray-500">ID: {consultation.id}</p>
                      </div>
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        {consultation.hours_overdue.toFixed(1)}h overdue
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Scheduled:</span>
                        <div>{new Date(consultation.scheduled_date).toLocaleDateString()}</div>
                        <div>{consultation.scheduled_time}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Fee:</span>
                        <div className="font-medium">${consultation.consultation_fee}</div>
                        <div className={consultation.is_paid ? 'text-green-600' : 'text-orange-600'}>
                          {consultation.payment_status}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(consultation)}
                        className="flex-1"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      {consultation.reschedule_status === 'eligible' && (
                        <Button
                          size="sm"
                          onClick={() => handleReschedule(consultation.id)}
                          className="bg-[#E17726] hover:bg-[#c9651e] text-white flex-1"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Reschedule
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{consultations.length}</div>
                <div className="text-sm text-gray-600">Total Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {consultations.length > 0 ? 
                    Math.round(consultations.reduce((sum, c) => sum + c.hours_overdue, 0) / consultations.length) 
                    : 0}h
                </div>
                <div className="text-sm text-gray-600">Avg Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {consultations.filter(c => c.reschedule_status === 'eligible').length}
                </div>
                <div className="text-sm text-gray-600">Can Reschedule</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverdueConsultations;
