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
  MessageSquare
} from 'lucide-react';
import { 
  consultationService, 
  type Consultation,
  getStatusColor, 
  getStatusText, 
  formatDateTime, 
  formatTime 
} from '@/services/consultationService';

interface AdminReadyPatientsDashboardProps {
  onConsultationSelect?: (consultation: Consultation) => void;
}

export const AdminReadyPatientsDashboard: React.FC<AdminReadyPatientsDashboardProps> = ({
  onConsultationSelect
}) => {
  const { toast } = useToast();
  const [readyPatients, setReadyPatients] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);

  // Load ready patients using admin endpoint
  const loadReadyPatients = async () => {
    try {
      setLoading(true);
      // Use admin ready patients endpoint
      const response = await consultationService.getAdminReadyPatients();
      
      if (response.success) {
        console.log('Admin ready patients response:', response.data);
        
        // Ensure data is an array
        const readyPatientsData = Array.isArray(response.data) ? response.data : [];
        setReadyPatients(readyPatientsData);
      } else {
        toast({
          title: "Error",
          description: "Failed to load ready patients",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading ready patients:', error);
      toast({
        title: "Error",
        description: "Failed to load ready patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load ready patients on component mount
  useEffect(() => {
    loadReadyPatients();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ready Patients</h2>
          <p className="text-gray-600">Patients ready for consultation</p>
        </div>
        <Button onClick={loadReadyPatients} disabled={loading} className="bg-green-600 hover:bg-green-700">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Card */}
      <Card className="border-l-4 border-l-green-500 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{readyPatients.length}</h3>
                <p className="text-sm text-gray-600">Patients Ready for Consultation</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                These patients have been checked in and marked as ready for consultation.
              </p>
            </div>
            {readyPatients.length > 0 && (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Ready to Start</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ready Patients List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Ready for Consultation
          </CardTitle>
          <CardDescription>
            These patients are ready for doctors to start their consultations. Admins can view details but only doctors can start consultations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mr-3 text-green-600" />
              <span className="text-lg text-gray-600">Loading ready patients...</span>
            </div>
          ) : readyPatients.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients ready for consultation</h3>
              <p className="text-gray-500 mb-4">Patients will appear here once they are checked in and marked as ready</p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                <AlertCircle className="h-4 w-4" />
                <span>Check the Consultation Management tab to see all patients</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {readyPatients.map((consultation) => (
                <div
                  key={consultation.id}
                  className="border border-green-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 bg-green-50/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-green-600" />
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
                          <Stethoscope className="h-4 w-4" />
                          <span>Dr. {consultation.doctor_name}</span>
                        </div>
                      </div>
                      
                      {consultation.chief_complaint && (
                        <div className="bg-white rounded-lg p-3 mb-3 border border-green-200">
                          <p className="text-sm text-gray-700">
                            <strong>Chief Complaint:</strong> {consultation.chief_complaint}
                          </p>
                        </div>
                      )}
                      
                      {consultation.symptoms && (
                        <div className="bg-white rounded-lg p-3 mb-3 border border-green-200">
                          <p className="text-sm text-gray-700">
                            <strong>Symptoms:</strong> {consultation.symptoms}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-6">
                      {/* View Details Button */}
                      <Button
                        onClick={() => onConsultationSelect?.(consultation)}
                        variant="outline"
                        size="sm"
                        className="border-green-500 text-green-700 hover:bg-green-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                  
                  {/* Check-in Information */}
                  {(consultation.checked_in_at || consultation.ready_for_consultation_at) && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {consultation.checked_in_at && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span>Patient checked in at: {new Date(consultation.checked_in_at).toLocaleString()}</span>
                          </div>
                        )}
                        {consultation.ready_for_consultation_at && (
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3 text-green-600" />
                            <span>Marked ready at: {new Date(consultation.ready_for_consultation_at).toLocaleString()}</span>
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

      {/* Quick Actions */}
      {readyPatients.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Actions</h3>
                <p className="text-sm text-gray-600">
                  You have {readyPatients.length} patient{readyPatients.length > 1 ? 's' : ''} ready for consultation
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Note: Only doctors can start consultations. Admins can view and manage patient status.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    if (readyPatients.length > 0) {
                      onConsultationSelect?.(readyPatients[0]);
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View First Patient
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
