import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  RotateCcw,
  Heart,
  Thermometer,
  Activity,
  Scale,
  Save
} from 'lucide-react';
import { adminConsultationApi, superAdminApi, prescriptionApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
  status: 'scheduled' | 'confirmed' | 'patient_checked_in' | 'checked_in' | 'ongoing' | 'completed' | 'cancelled';
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
  const [downloadingPrescriptions, setDownloadingPrescriptions] = useState<{ [key: string]: boolean }>({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('ConsultationManagementFlow mounted, user role:', user?.role);
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
  const [showVitalSignsModal, setShowVitalSignsModal] = useState(false);
  const [selectedConsultationForVitalSigns, setSelectedConsultationForVitalSigns] = useState<Consultation | null>(null);
  const [vitalSignsData, setVitalSignsData] = useState({
    pulse: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    temperature: '',
    weight: '',
    height: '',
    oxygen_saturation: '',
    notes: ''
  });
  const [savingVitalSigns, setSavingVitalSigns] = useState(false);
  
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

  const saveVitalSigns = async (consultationId: string, vitalSigns: any) => {
    setSavingVitalSigns(true);
    try {
      // Validate and format the data before sending
      const formattedData: any = {};
      
      // Convert string values to appropriate types and validate ranges
      if (vitalSigns.pulse && !isNaN(Number(vitalSigns.pulse))) {
        const pulse = parseInt(vitalSigns.pulse);
        if (pulse >= 30 && pulse <= 300) {
          formattedData.heart_rate = pulse;
        }
      }
      
      if (vitalSigns.blood_pressure_systolic && !isNaN(Number(vitalSigns.blood_pressure_systolic))) {
        const systolic = parseInt(vitalSigns.blood_pressure_systolic);
        if (systolic >= 50 && systolic <= 300) {
          formattedData.blood_pressure_systolic = systolic;
        }
      }
      
      if (vitalSigns.blood_pressure_diastolic && !isNaN(Number(vitalSigns.blood_pressure_diastolic))) {
        const diastolic = parseInt(vitalSigns.blood_pressure_diastolic);
        if (diastolic >= 30 && diastolic <= 200) {
          formattedData.blood_pressure_diastolic = diastolic;
        }
      }
      
      if (vitalSigns.temperature && !isNaN(Number(vitalSigns.temperature))) {
        const temp = parseFloat(vitalSigns.temperature);
        if (temp >= 30.0 && temp <= 45.0) {
          formattedData.temperature = Math.round(temp * 10) / 10; // Round to 1 decimal place
        }
      }
      
      if (vitalSigns.weight && !isNaN(Number(vitalSigns.weight))) {
        const weight = parseFloat(vitalSigns.weight);
        if (weight >= 1.0 && weight <= 500.0) {
          formattedData.weight = Math.round(weight * 100) / 100; // Round to 2 decimal places
        }
      }
      
      if (vitalSigns.height && !isNaN(Number(vitalSigns.height))) {
        const height = parseFloat(vitalSigns.height);
        if (height >= 30.0 && height <= 250.0) {
          formattedData.height = Math.round(height * 100) / 100; // Round to 2 decimal places
        }
      }
      
      if (vitalSigns.oxygen_saturation && !isNaN(Number(vitalSigns.oxygen_saturation))) {
        const oxygen = parseInt(vitalSigns.oxygen_saturation);
        if (oxygen >= 70 && oxygen <= 100) {
          formattedData.oxygen_saturation = oxygen;
        }
      }
      
      // Calculate BMI if both height and weight are provided
      if (formattedData.weight && formattedData.height) {
        const heightInMeters = formattedData.height / 100;
        const bmi = formattedData.weight / (heightInMeters * heightInMeters);
        if (bmi >= 10.0 && bmi <= 100.0) {
          formattedData.bmi = Math.round(bmi * 100) / 100; // Round to 2 decimal places
        }
      }
      
      // Add notes if provided
      if (vitalSigns.notes && vitalSigns.notes.trim()) {
        formattedData.notes = vitalSigns.notes.trim();
      }
      
      console.log(`Saving vital signs for consultation ${consultationId}:`, formattedData);
      
      const response = await fetch(`/api/consultations/${consultationId}/vital-signs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(formattedData)
      });

      if (response.ok) {
        console.log('Vital signs saved successfully');
        toast.success('Vital signs saved successfully');
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error('Failed to save vital signs:', errorData);
        toast.error(`Failed to save vital signs: ${errorData.detail || 'Unknown error'}`);
        return { success: false, error: errorData.detail || 'Failed to save vital signs' };
      }
    } catch (error) {
      console.error('Error saving vital signs:', error);
      toast.error('Error saving vital signs');
      return { success: false, error };
    } finally {
      setSavingVitalSigns(false);
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

  // Handle download prescription
  const handleDownloadPrescription = async (consultation: Consultation) => {
    try {
      setDownloadingPrescriptions(prev => ({ ...prev, [consultation.id]: true }));
      
      let prescriptionId = consultation.prescription?.id;
      
      // If no prescription data available, try to get it from the consultation
      if (!prescriptionId) {
        try {
          const prescriptionData = await prescriptionApi.getConsultationPrescription(consultation.id);
          prescriptionId = prescriptionData.id;
        } catch (error) {
          console.error('Error fetching prescription data:', error);
          toast.error('No prescription available for this consultation');
          return;
        }
      }
      
      if (!prescriptionId) {
        toast.error('No prescription available for this consultation');
        return;
      }
      
      const response = await prescriptionApi.downloadPDF(prescriptionId, 'latest');
      
      // The API returns a download URL, so we can open it directly
              if (response.success && response.data && response.data.download_url) {
          window.open(response.data.download_url, '_blank');
        toast.success('Prescription download started');
      } else {
        toast.error('No download URL available');
      }
    } catch (error) {
      console.error('Error downloading prescription:', error);
      toast.error('Failed to download prescription');
    } finally {
      setDownloadingPrescriptions(prev => ({ ...prev, [consultation.id]: false }));
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'patient_checked_in': return 'bg-emerald-100 text-emerald-800';
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
      case 'patient_checked_in': return <User className="w-4 h-4" />;
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {['scheduled', 'confirmed', 'patient_checked_in', 'ongoing', 'completed'].map((status) => (
          <Card key={status} className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon(status)}
              </div>
              <p className="text-sm font-medium text-gray-600 capitalize">{status.replace('_', ' ')}</p>
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
                <option value="patient_checked_in">Checked In</option>
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
                {/* Debug: Show current status */}
                <div className="text-xs text-gray-500 mb-2 w-full">
                  Debug - Status: {consultation.status}
                </div>

                {/* Add Vital Signs Button - Show for multiple statuses */}
                {(consultation.status === 'confirmed' || 
                  consultation.status === 'patient_checked_in' || 
                  consultation.status === 'checked_in' ||
                  consultation.status === 'scheduled') && (
                  <Button 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      setSelectedConsultationForVitalSigns(consultation);
                      setVitalSignsData({
                        pulse: '',
                        blood_pressure_systolic: '',
                        blood_pressure_diastolic: '',
                        temperature: '',
                        weight: '',
                        height: '',
                        oxygen_saturation: '',
                        notes: ''
                      });
                      setShowVitalSignsModal(true);
                    }}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Add Vital Signs
                  </Button>
                )}

                {/* Test Button - Show for all consultations */}
                <Button 
                  size="sm" 
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => {
                    console.log('Opening vital signs modal for consultation:', consultation.id);
                    setSelectedConsultationForVitalSigns(consultation);
                    setVitalSignsData({
                      pulse: '',
                      blood_pressure_systolic: '',
                      blood_pressure_diastolic: '',
                      temperature: '',
                      weight: '',
                      height: '',
                      oxygen_saturation: '',
                      notes: ''
                    });
                    setShowVitalSignsModal(true);
                  }}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Test Vital Signs
                </Button>

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
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/dashboard/consultations/${consultation.id}/reschedule`)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reschedule
                    </Button>
                  </>
                )}

                {consultation.status === 'confirmed' && (
                  <>
                    <Button 
                      size="sm" 
                      className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                      onClick={() => handleStartConsultation(consultation)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Consultation
                    </Button>
                  </>
                )}

                {consultation.status === 'patient_checked_in' && (
                  <>
                    <Button 
                      size="sm" 
                      className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                      onClick={() => handleStartConsultation(consultation)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Consultation
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

                {/* Reschedule Button - Show for scheduled and overdue consultations */}
                {(consultation.status === 'scheduled' || consultation.status === 'overdue') && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate(`/dashboard/consultations/${consultation.id}/reschedule`)}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reschedule
                  </Button>
                )}

                {/* Download Prescription Button - Show for completed consultations */}
                {consultation.status === 'completed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadPrescription(consultation)}
                    disabled={downloadingPrescriptions[consultation.id]}
                    className="flex items-center"
                  >
                    {downloadingPrescriptions[consultation.id] ? (
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {downloadingPrescriptions[consultation.id] ? 'Downloading...' : 'Download Prescription'}
                  </Button>
                )}
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

      {/* Vital Signs Modal */}
      <Dialog open={showVitalSignsModal} onOpenChange={(open) => {
        console.log('Vital signs modal state changed:', open);
        setShowVitalSignsModal(open);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Add Vital Signs
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Patient:</strong> {selectedConsultationForVitalSigns?.patient.name || selectedConsultationForVitalSigns?.patient_name}
              </p>
              <p className="text-sm text-blue-700">
                <strong>Consultation ID:</strong> {selectedConsultationForVitalSigns?.id}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Pulse Rate (bpm)</Label>
                <Input
                  type="number"
                  min="30"
                  max="300"
                  placeholder="e.g., 72"
                  value={vitalSignsData.pulse}
                  onChange={(e) => setVitalSignsData(prev => ({ ...prev, pulse: e.target.value }))}
                  className="mt-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Range: 30-300 bpm</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Temperature (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="30.0"
                  max="45.0"
                  placeholder="e.g., 36.8"
                  value={vitalSignsData.temperature}
                  onChange={(e) => setVitalSignsData(prev => ({ ...prev, temperature: e.target.value }))}
                  className="mt-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Range: 30.0-45.0°C</p>
              </div>
              <div>
                <Label className="text-sm font-medium">BP Systolic (mmHg)</Label>
                <Input
                  type="number"
                  min="50"
                  max="300"
                  placeholder="e.g., 120"
                  value={vitalSignsData.blood_pressure_systolic}
                  onChange={(e) => setVitalSignsData(prev => ({ ...prev, blood_pressure_systolic: e.target.value }))}
                  className="mt-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Range: 50-300 mmHg</p>
              </div>
              <div>
                <Label className="text-sm font-medium">BP Diastolic (mmHg)</Label>
                <Input
                  type="number"
                  min="30"
                  max="200"
                  placeholder="e.g., 80"
                  value={vitalSignsData.blood_pressure_diastolic}
                  onChange={(e) => setVitalSignsData(prev => ({ ...prev, blood_pressure_diastolic: e.target.value }))}
                  className="mt-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Range: 30-200 mmHg</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="500.0"
                  placeholder="e.g., 70"
                  value={vitalSignsData.weight}
                  onChange={(e) => setVitalSignsData(prev => ({ ...prev, weight: e.target.value }))}
                  className="mt-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Range: 1.0-500.0 kg</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Height (cm)</Label>
                <Input
                  type="number"
                  min="30"
                  max="250"
                  placeholder="e.g., 170"
                  value={vitalSignsData.height}
                  onChange={(e) => setVitalSignsData(prev => ({ ...prev, height: e.target.value }))}
                  className="mt-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Range: 30-250 cm</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Oxygen Saturation (%)</Label>
                <Input
                  type="number"
                  min="70"
                  max="100"
                  placeholder="e.g., 98"
                  value={vitalSignsData.oxygen_saturation}
                  onChange={(e) => setVitalSignsData(prev => ({ ...prev, oxygen_saturation: e.target.value }))}
                  className="mt-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Range: 70-100%</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Notes</Label>
              <textarea
                placeholder="Additional notes about vital signs..."
                value={vitalSignsData.notes || ''}
                onChange={(e) => setVitalSignsData(prev => ({ ...prev, notes: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowVitalSignsModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={savingVitalSigns}
                onClick={async () => {
                  if (selectedConsultationForVitalSigns) {
                    const result = await saveVitalSigns(selectedConsultationForVitalSigns.id, vitalSignsData);
                    if (result.success) {
                      setShowVitalSignsModal(false);
                      setSelectedConsultationForVitalSigns(null);
                      setVitalSignsData({
                        pulse: '',
                        blood_pressure_systolic: '',
                        blood_pressure_diastolic: '',
                        temperature: '',
                        weight: '',
                        height: '',
                        oxygen_saturation: '',
                        notes: ''
                      });
                    }
                  }
                }}
              >
                {savingVitalSigns ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Vital Signs
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsultationManagementFlow; 