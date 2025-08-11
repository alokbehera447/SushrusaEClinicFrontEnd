import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ConsultationDetailsModal from './ConsultationDetailsModal';
import { 
  Video, 
  Phone, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  DollarSign,
  Send,
  Bell,
  Calendar,
  MessageSquare,
  Download,
  Eye,
  Edit,
  Play,
  Square,
  RotateCcw
} from 'lucide-react';
import { adminConsultationApi, superAdminApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Consultation {
  id: string;
  patient: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    age?: number;
    gender?: string;
  };
  // New API fields for backward compatibility
  patient_name?: string;
  patient_phone?: string;
  patient_email?: string;
  patient_age?: number;
  patient_gender?: string;
  doctor: {
    id: string;
    name: string;
    specialty: string;
    phone: string;
    email?: string;
  };
  // New API fields for backward compatibility
  doctor_name?: string;
  doctor_phone?: string;
  doctor_email?: string;
  doctor_specialty?: string;
  consultationType: 'video' | 'phone' | 'in-person';
  consultationDate: string;
  consultationTime: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  chiefComplaint: string;
  symptoms?: string;
  consultationFee: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'refunded';
  meetingLink?: string;
  prescription?: {
    id: string;
    status: 'pending' | 'active' | 'completed';
    medicines: string[];
    instructions: string;
    writtenDate: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const ConsultationManagementFlow = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [assignedClinics, setAssignedClinics] = useState<{ id: string; name: string }[]>([]);
  const [loadingClinics, setLoadingClinics] = useState<boolean>(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    setLoadingClinics(true);
    superAdminApi.getEClinics({ page: 1, page_size: 10 })
      .then((data) => {
        const clinics = (data.results || []).filter((clinic: any) => clinic.admin === user.id);
        setAssignedClinics(clinics.map((c: any) => ({ id: c.id, name: c.name })));
        setLoadingClinics(false);
      })
      .catch(() => {
        setAssignedClinics([]);
        setLoadingClinics(false);
      });
  }, [user]);

  useEffect(() => {
    if (loadingClinics) return;
    if (!assignedClinics || assignedClinics.length === 0) {
      setConsultations([]);
      setLoading(false);
      setError('No clinic assigned to this admin.');
      return;
    }
    const clinicId = assignedClinics[0].id;
    setLoading(true);
    setError(null);
    adminConsultationApi.getClinicConsultations(clinicId, { page: 1, page_size: 20 })
      .then((res) => {
        let arr = [];
        if (res.results && Array.isArray(res.results.data)) {
          arr = res.results.data;
        } else if (Array.isArray(res.results)) {
          arr = res.results;
        } else if (res.data && Array.isArray(res.data.results)) {
          arr = res.data.results;
        }
        if (!Array.isArray(arr)) {
          arr = [];
        }
        const mapped = arr.map((c: any) => ({
          id: c.id,
          patient: {
            id: c.patient,
            name: c.patient_name,
            phone: c.patient_phone || '',
            email: c.patient_email || '',
            age: c.patient_age || undefined,
            gender: c.patient_gender || undefined,
          },
          // Add the new API fields for backward compatibility
          patient_name: c.patient_name,
          patient_phone: c.patient_phone,
          patient_email: c.patient_email,
          patient_age: c.patient_age,
          patient_gender: c.patient_gender,
          doctor: {
            id: c.doctor,
            name: c.doctor_name,
            specialty: c.doctor_specialty || '',
            phone: c.doctor_phone || '',
            email: c.doctor_email || '',
          },
          // Add the new API fields for backward compatibility
          doctor_name: c.doctor_name,
          doctor_phone: c.doctor_phone,
          doctor_email: c.doctor_email,
          doctor_specialty: c.doctor_specialty,
          consultationType: c.consultation_type === 'video_call' ? 'video' : c.consultation_type,
          consultationDate: c.scheduled_date,
          consultationTime: c.scheduled_time,
          duration: c.duration,
          status: c.status,
          chiefComplaint: c.chief_complaint || '',
          symptoms: c.symptoms || '',
          consultationFee: c.consultation_fee,
          paymentMethod: '',
          paymentStatus: c.payment_status,
          meetingLink: c.doctor_meeting_link || c.meeting_link || c.meetingLink || null,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }));
        setAllConsultations(mapped);
        setConsultations(mapped);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load consultations');
        setLoading(false);
      });
  }, [assignedClinics, loadingClinics]);

  // Filter consultations based on current filters
  useEffect(() => {
    let filtered = [...allConsultations];

    // Filter upcoming consultations
    if (filterUpcoming) {
      const now = new Date();
      filtered = filtered.filter(consultation => {
        const consultationDate = new Date(consultation.consultationDate);
        const consultationTime = consultation.consultationTime;
        const [hours, minutes] = consultationTime.split(':');
        consultationDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        return consultationDate >= now;
      });
    }

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter(consultation => consultation.status === filterStatus);
    }

    // Filter by payment status
    if (filterPaymentStatus) {
      filtered = filtered.filter(consultation => consultation.paymentStatus === filterPaymentStatus);
    }

    setConsultations(filtered);
  }, [allConsultations, filterUpcoming, filterStatus, filterPaymentStatus]);

  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedConsultationForDetails, setSelectedConsultationForDetails] = useState<Consultation | null>(null);
  
  // Filter states
  const [filterUpcoming, setFilterUpcoming] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('');
  const [allConsultations, setAllConsultations] = useState<Consultation[]>([]);

  // API Functions aligned with endpoints
  const updateConsultationStatus = async (consultationId: string, status: string) => {
    try {
      // API Call: PUT /api/consultations/{id}/
      console.log(`Updating consultation ${consultationId} status to ${status}`);
      
      setConsultations(prev => prev.map(con => 
        con.id === consultationId 
          ? { ...con, status: status as any, updatedAt: new Date().toISOString() }
          : con
      ));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating consultation status:', error);
      return { success: false, error };
    }
  };

  const sendNotification = async (consultationId: string, type: 'patient' | 'doctor', message: string) => {
    try {
      // API Call: POST /api/notifications/ (if you have notifications endpoint)
      console.log(`Sending ${type} notification for consultation ${consultationId}: ${message}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error };
    }
  };

  const createPrescription = async (consultationId: string, prescriptionData: any) => {
    try {
      // API Call: POST /api/prescriptions/
      console.log(`Creating prescription for consultation ${consultationId}:`, prescriptionData);
      
      const newPrescription = {
        id: `RX${Date.now()}`,
        status: 'active',
        medicines: prescriptionData.medicines,
        instructions: prescriptionData.instructions,
        writtenDate: new Date().toISOString().split('T')[0]
      };

      setConsultations(prev => prev.map(con => 
        con.id === consultationId 
          ? { ...con, prescription: newPrescription }
          : con
      ));
      
      return { success: true, prescription: newPrescription };
    } catch (error) {
      console.error('Error creating prescription:', error);
      return { success: false, error };
    }
  };

  const updatePaymentStatus = async (consultationId: string, paymentStatus: string) => {
    try {
      // API Call: PUT /api/payments/{id}/
      console.log(`Updating payment status for consultation ${consultationId} to ${paymentStatus}`);
      
      setConsultations(prev => prev.map(con => 
        con.id === consultationId 
          ? { ...con, paymentStatus: paymentStatus as any }
          : con
      ));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating payment status:', error);
      return { success: false, error };
    }
  };

  // Workflow Actions
  const handleStartConsultation = async (consultation: Consultation) => {
    const result = await updateConsultationStatus(consultation.id, 'ongoing');
    if (result.success) {
      // Send notifications
      await sendNotification(consultation.id, 'patient', 'Your consultation has started. Please join the call.');
      await sendNotification(consultation.id, 'doctor', 'Consultation has started. Patient is waiting.');
    }
  };

  const handleEndConsultation = async (consultation: Consultation) => {
    const result = await updateConsultationStatus(consultation.id, 'completed');
    if (result.success) {
      // Send completion notifications
      await sendNotification(consultation.id, 'patient', 'Your consultation has ended. Check your email for prescription.');
      await sendNotification(consultation.id, 'doctor', 'Consultation completed. Please write prescription if needed.');
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'ongoing': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getConsultationTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'in-person': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-midnight mb-2">Consultation Management</h2>
        <p className="text-gray-600">Complete workflow management for consultations</p>
      </div>

      {/* Workflow Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['scheduled', 'ongoing', 'completed', 'cancelled'].map((status) => (
          <Card key={status} className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon(status)}
              </div>
              <p className="text-sm font-medium text-gray-600 capitalize">{status}</p>
              <p className="text-2xl font-bold text-midnight">
                {consultations.filter(c => c.status === status).length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-midnight">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="upcoming"
                checked={filterUpcoming}
                onChange={(e) => setFilterUpcoming(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="upcoming" className="text-sm font-medium text-gray-700">
                Upcoming Consultations Only
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded border-gray-300 text-sm"
              >
                <option value="">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Payment:</label>
              <select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
                className="rounded border-gray-300 text-sm"
              >
                <option value="">All Payments</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterUpcoming(false);
                setFilterStatus('');
                setFilterPaymentStatus('');
              }}
              className="text-gray-600"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Consultation List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-midnight">
            Consultations ({consultations.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <p className="text-center py-8">Loading consultations...</p>}
          {error && <p className="text-center py-8 text-red-500">{error}</p>}
          {!loading && !error && consultations.length === 0 && (
            <p className="text-center py-8 text-gray-500">No consultations found.</p>
          )}
          {!loading && !error && consultations.length > 0 && consultations.map((consultation) => (
            <div key={consultation.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-[#E17726]">{consultation.id}</div>
                    <div className="text-xs text-gray-500">{consultation.consultationDate} {consultation.consultationTime}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getConsultationTypeIcon(consultation.consultationType)}
                    <span className="text-sm text-gray-600 capitalize">{consultation.consultationType}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(consultation.status)}>
                    {getStatusIcon(consultation.status)}
                    <span className="ml-1 capitalize">{consultation.status}</span>
                  </Badge>
                  <Badge className={consultation.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    <DollarSign className="w-3 h-3 mr-1" />
                    {consultation.paymentStatus}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Patient</p>
                  <p className="font-semibold text-midnight">{consultation.patient.name}</p>
                  <p className="text-sm text-gray-600">{consultation.patient.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Doctor</p>
                  <p className="font-semibold text-midnight">{consultation.doctor.name}</p>
                  <p className="text-sm text-gray-600">{consultation.doctor.specialty}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Chief Complaint</p>
                  <p className="text-sm text-midnight">{consultation.chiefComplaint}</p>
                </div>
              </div>

              {/* Action Buttons based on Status */}
              <div className="flex flex-wrap gap-2">
                {consultation.status === 'scheduled' && (
                  <>
                    <Button 
                      size="sm" 
                      className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                      onClick={() => handleStartConsultation(consultation)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Consultation
                    </Button>
                    {consultation.consultationType === 'video' && consultation.meetingLink && (
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => window.open(consultation.meetingLink, '_blank')}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Meeting
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedConsultation(consultation);
                        setShowNotificationDialog(true);
                      }}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Send Reminder
                    </Button>
                  </>
                )}

                {consultation.status === 'ongoing' && (
                  <>
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleEndConsultation(consultation)}
                    >
                      <Square className="w-4 h-4 mr-2" />
                      End Consultation
                    </Button>
                    {consultation.consultationType === 'video' && consultation.meetingLink && (
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => window.open(consultation.meetingLink, '_blank')}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Meeting
                      </Button>
                    )}
                  </>
                )}

                {consultation.status === 'completed' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedConsultation(consultation);
                        setShowPrescriptionDialog(true);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {consultation.prescription ? 'View Prescription' : 'Write Prescription'}
                    </Button>
                    {consultation.paymentStatus === 'pending' && (
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => updatePaymentStatus(consultation.id, 'completed')}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Mark Payment Complete
                      </Button>
                    )}
                  </>
                )}

                {consultation.meetingLink && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.open(consultation.meetingLink, '_blank')}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join Now
                  </Button>
                )}

                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setSelectedConsultationForDetails(consultation);
                    setShowDetailsModal(true);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notification Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Send reminder to {selectedConsultation?.patient.name} about their consultation scheduled for {selectedConsultation?.consultationDate} at {selectedConsultation?.consultationTime}.
            </p>
            <div className="flex space-x-2">
              <Button 
                onClick={() => {
                  if (selectedConsultation) {
                    sendNotification(selectedConsultation.id, 'patient', 'Reminder: Your consultation is scheduled for tomorrow.');
                  }
                  setShowNotificationDialog(false);
                }}
              >
                <Send className="w-4 h-4 mr-2" />
                Send SMS
              </Button>
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prescription Dialog */}
      <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prescription Management</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedConsultation?.prescription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Prescription {selectedConsultation.prescription.id}</h4>
                  <Badge className="bg-green-100 text-green-800">
                    {selectedConsultation.prescription.status}
                  </Badge>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-700 mb-2">Medicines:</p>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {selectedConsultation.prescription.medicines.map((medicine, idx) => (
                          <li key={idx}>{medicine}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-2">Instructions:</p>
                      <p className="text-gray-600">{selectedConsultation.prescription.instructions}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Written on: {selectedConsultation.prescription.writtenDate}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline">
                    <Send className="w-4 h-4 mr-2" />
                    Send to Patient
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No prescription written yet</p>
                <Button 
                  onClick={() => {
                    if (selectedConsultation) {
                      createPrescription(selectedConsultation.id, {
                        medicines: ['Sample Medicine 500mg'],
                        instructions: 'Take as prescribed by doctor'
                      });
                    }
                    setShowPrescriptionDialog(false);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Write Prescription
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Consultation Details Modal */}
      <ConsultationDetailsModal 
        consultation={selectedConsultationForDetails}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedConsultationForDetails(null);
        }}
        userRole="admin"
      />
    </div>
  );
};

export default ConsultationManagementFlow; 