import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Video,
  MessageSquare
} from 'lucide-react';
import { adminConsultationApi, doctorApi, DoctorProfile } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
  doctor_name?: string;
  doctor_phone?: string;
  doctor_email?: string;
  doctor_specialty?: string;
  consultationType: 'video' | 'phone' | 'in-person';
  consultation_type?: string;
  consultationDate: string;
  scheduled_date?: string;
  consultationTime: string;
  scheduled_time?: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled' | 'overdue' | 'rescheduled';
  chiefComplaint: string;
  chief_complaint?: string;
  symptoms?: string;
  consultationFee: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
}

interface RescheduleFormData {
  selectedDoctor: DoctorProfile | null;
  selectedDate: string;
  selectedTime: string;
  reason: string;
  notifyPatient: boolean;
  notifyDoctor: boolean;
}

interface DoctorSlot {
  date: string;
  time: string;
  available: boolean;
  isBooked: boolean;
}

const RescheduleConsultation: React.FC = () => {
  const { consultationId } = useParams<{ consultationId: string }>();
  const navigate = useNavigate();
  
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New booking-style state
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<DoctorSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [formData, setFormData] = useState<RescheduleFormData>({
    selectedDoctor: null,
    selectedDate: '',
    selectedTime: '',
    reason: '',
    notifyPatient: true,
    notifyDoctor: true
  });

  // Common time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  useEffect(() => {
    if (consultationId) {
      fetchConsultationDetails();
      loadAvailableDoctors();
    }
  }, [consultationId]);

  // Load available doctors
  const loadAvailableDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await doctorApi.getDoctors({
        is_active: true,
        is_verified: true,
        page_size: 100
      });
      setDoctors(response.results || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      toast.error('Failed to load available doctors');
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Load available slots for selected doctor
  const loadDoctorSlots = async (doctorId: string, date: string) => {
    try {
      setLoadingSlots(true);
      // This would call doctor availability API - for now using mock data
      const slots: DoctorSlot[] = timeSlots.map(time => ({
        date,
        time,
        available: Math.random() > 0.3, // Mock availability
        isBooked: Math.random() > 0.7   // Mock booking status
      }));
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading doctor slots:', error);
      toast.error('Failed to load doctor availability');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle doctor selection
  const handleDoctorSelect = (doctor: DoctorProfile) => {
    setFormData(prev => ({ 
      ...prev, 
      selectedDoctor: doctor,
      selectedDate: '',
      selectedTime: ''
    }));
    setAvailableSlots([]);
  };

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setFormData(prev => ({ ...prev, selectedDate: date, selectedTime: '' }));
    if (formData.selectedDoctor) {
      loadDoctorSlots(formData.selectedDoctor.id, date);
    }
  };

  const fetchConsultationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch consultation details
      const consultationData = await adminConsultationApi.getConsultation(consultationId!);
      
      // Map the API response to our interface
      const mappedConsultation: Consultation = {
        id: consultationData.id,
        patient: {
          id: consultationData.patient?.id || consultationData.patient_id,
          name: consultationData.patient?.name || consultationData.patient_name || 'Unknown Patient',
          phone: consultationData.patient?.phone || consultationData.patient_phone || '',
          email: consultationData.patient?.email || consultationData.patient_email,
          age: consultationData.patient?.age || consultationData.patient_age,
          gender: consultationData.patient?.gender || consultationData.patient_gender
        },
        patient_name: consultationData.patient_name,
        patient_phone: consultationData.patient_phone,
        patient_email: consultationData.patient_email,
        patient_age: consultationData.patient_age,
        patient_gender: consultationData.patient_gender,
        doctor: {
          id: consultationData.doctor?.id || consultationData.doctor_id,
          name: consultationData.doctor?.name || consultationData.doctor_name || 'Unknown Doctor',
          specialty: consultationData.doctor?.specialty || consultationData.doctor_specialty || '',
          phone: consultationData.doctor?.phone || consultationData.doctor_phone || '',
          email: consultationData.doctor?.email || consultationData.doctor_email
        },
        doctor_name: consultationData.doctor_name,
        doctor_phone: consultationData.doctor_phone,
        doctor_email: consultationData.doctor_email,
        doctor_specialty: consultationData.doctor_specialty,
        consultationType: consultationData.consultation_type === 'video_call' ? 'video' : 'phone',
        consultation_type: consultationData.consultation_type,
        consultationDate: consultationData.scheduled_date,
        scheduled_date: consultationData.scheduled_date,
        consultationTime: consultationData.scheduled_time,
        scheduled_time: consultationData.scheduled_time,
        duration: consultationData.duration || 30,
        status: consultationData.status,
        chiefComplaint: consultationData.chief_complaint || '',
        chief_complaint: consultationData.chief_complaint,
        symptoms: consultationData.symptoms,
        consultationFee: consultationData.consultation_fee || 0,
        paymentStatus: consultationData.payment_status || 'pending',
        meetingLink: consultationData.meeting_link,
        createdAt: consultationData.created_at,
        updatedAt: consultationData.updated_at
      };
      
      setConsultation(mappedConsultation);
      
      // Set default new date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData(prev => ({
        ...prev,
        newDate: tomorrow.toISOString().split('T')[0]
      }));
      
    } catch (error) {
      console.error('Error fetching consultation details:', error);
      setError('Failed to load consultation details');
      toast.error('Failed to load consultation details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof RescheduleFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.selectedDoctor) {
      toast.error('Please select a doctor');
      return false;
    }
    
    if (!formData.selectedDate) {
      toast.error('Please select a date');
      return false;
    }
    
    if (!formData.selectedTime) {
      toast.error('Please select a time slot');
      return false;
    }
    
    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for rescheduling');
      return false;
    }
    
    // Check if new date/time is in the future
    const newDateTime = new Date(`${formData.selectedDate}T${formData.selectedTime}`);
    const now = new Date();
    
    if (newDateTime <= now) {
      toast.error('Selected date and time must be in the future');
      return false;
    }
    
    return true;
  };

  const handleReschedule = async () => {
    if (!validateForm() || !consultation || !formData.selectedDoctor) return;
    
    try {
      setSaving(true);
      setError(null);
      
      // Create new consultation with selected doctor and time
      const rescheduleData = {
        consultation_id: consultation.id,
        new_doctor: formData.selectedDoctor.id,
        new_date: formData.selectedDate,
        new_time: formData.selectedTime,
        reason: formData.reason,
        notify_patient: formData.notifyPatient,
        notify_doctor: formData.notifyDoctor
      };
      
      // Call the reschedule API with new doctor
      const updatedConsultation = await adminConsultationApi.rescheduleConsultation(
        consultation.id,
        formData.selectedDate,
        formData.selectedTime,
        formData.selectedDoctor.id // Pass new doctor ID
      );
      
      toast.success(`Consultation rescheduled successfully with ${formData.selectedDoctor.user_name}!`);
      
      // Navigate back to overdue consultations or main consultations
      navigate('/dashboard/consultations/overdue');
      
    } catch (error) {
      console.error('Error rescheduling consultation:', error);
      const errorMessage = (error as any).response?.data?.message || 'Failed to reschedule consultation';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
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
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'patient_checked_in': return <User className="w-4 h-4" />;
      case 'ongoing': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'rescheduled': return <Calendar className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E17726] mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Consultation Details</h3>
            <p className="text-gray-500">Please wait while we fetch the consultation information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error || 'Consultation not found'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button 
            onClick={() => navigate('/dashboard/consultations')}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Consultations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/dashboard/consultations')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Reschedule Consultation</h1>
            <p className="text-sm text-gray-600">ID: {consultation?.id}</p>
          </div>
        </div>
        <Badge className={`${getStatusColor(consultation?.status || '')} px-3 py-1`}>
          {getStatusIcon(consultation?.status || '')}
          <span className="ml-1 capitalize">{consultation?.status?.replace('_', ' ')}</span>
          {consultation && (consultation as any).is_overdue && (
            <span className="ml-2 text-xs">({(consultation as any).hours_overdue?.toFixed(1)}h overdue)</span>
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Compact Consultation Details */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#E17726]" />
                Current Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status</span>
                <Badge className={`${getStatusColor(consultation.status)} text-xs`}>
                  {getStatusIcon(consultation.status)}
                  <span className="ml-1 capitalize">{consultation.status.replace('_', ' ')}</span>
                </Badge>
              </div>

              {/* Current Date & Time */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Current Date</span>
                  <span className="text-sm text-gray-900">
                    {format(new Date(consultation.consultationDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Current Time</span>
                  <span className="text-sm text-gray-900">{consultation.consultationTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Duration</span>
                  <span className="text-sm text-gray-900">{consultation.duration} minutes</span>
                </div>
              </div>

              {/* Patient Information */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Patient Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">
                      {consultation.patient.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">
                      {consultation.patient.phone}
                    </span>
                  </div>
                  {consultation.patient.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-900">
                        {consultation.patient.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Doctor Information */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Doctor Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">
                      {consultation.doctor.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Specialty:</span>
                    <span className="text-sm text-gray-900">
                      {consultation.doctor.specialty}
                    </span>
                  </div>
                </div>
              </div>

              {/* Consultation Type */}
              <div className="pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Video className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Type:</span>
                  <span className="text-sm text-gray-900 capitalize">
                    {consultation.consultationType} consultation
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compact Reschedule Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E17726]" />
                Reschedule Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Date and Time Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newDate" className="text-sm font-medium text-gray-700">
                    New Date *
                  </Label>
                  <Input
                    id="newDate"
                    type="date"
                    value={formData.newDate}
                    onChange={(e) => handleInputChange('newDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newTime" className="text-sm font-medium text-gray-700">
                    New Time *
                  </Label>
                  <Select value={formData.newTime} onValueChange={(value) => handleInputChange('newTime', value)}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                  Reason for Rescheduling *
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  placeholder="Provide reason for rescheduling..."
                  className="text-sm min-h-[80px]"
                  rows={3}
                />
              </div>

              {/* Compact Notification Options */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Notifications</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="notifyPatient"
                      checked={formData.notifyPatient}
                      onChange={(e) => handleInputChange('notifyPatient', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="notifyPatient" className="text-sm text-gray-700">
                      Notify patient about the reschedule
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="notifyDoctor"
                      checked={formData.notifyDoctor}
                      onChange={(e) => handleInputChange('notifyDoctor', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="notifyDoctor" className="text-sm text-gray-700">
                      Notify doctor about the reschedule
                    </Label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleReschedule}
                  disabled={saving}
                  className="bg-[#E17726] hover:bg-[#c9651e] text-white flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Rescheduling...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Reschedule Consultation
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => navigate('/dashboard/consultations')}
                  variant="outline"
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RescheduleConsultation;

