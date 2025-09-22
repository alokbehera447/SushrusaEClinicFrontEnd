import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Stethoscope,
  Star,
  MapPin
} from 'lucide-react';
import { adminConsultationApi, doctorApi, DoctorProfile, api } from '@/lib/api';
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
  doctor: {
    id: string;
    name: string;
    specialty: string;
    phone: string;
    email?: string;
  };
  consultationType: 'video' | 'phone' | 'in-person';
  consultationDate: string;
  consultationTime: string;
  duration: number;
  status: string;
  chiefComplaint: string;
  consultationFee: number;
  paymentStatus: string;
}

interface DoctorSlot {
  id: number;
  doctor: string;
  clinic: string | null;
  clinic_name: string | null;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_booked: boolean;
  booked_consultation: string | null;
  created_at: string;
  updated_at: string;
}

const BookingStyleReschedule: React.FC = () => {
  const { consultationId } = useParams<{ consultationId: string }>();
  const navigate = useNavigate();
  
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Booking flow state
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<DoctorSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [reason, setReason] = useState('');
  const [notifyPatient, setNotifyPatient] = useState(true);
  const [notifyDoctor, setNotifyDoctor] = useState(true);

  // Note: Time slots are now loaded dynamically from doctor's actual schedule

  useEffect(() => {
    if (consultationId) {
      fetchConsultationDetails();
      loadAvailableDoctors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultationId]);

  const fetchConsultationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock consultation data - replace with actual API call
      const mockConsultation: Consultation = {
        id: consultationId || '',
        patient: {
          id: 'PAT002',
          name: 'User 3210',
          phone: '+919876543210',
          email: 'user3210@example.com',
          age: 35,
          gender: 'Male'
        },
        doctor: {
          id: 'ADM003',
          name: 'Sasmita Pradhan',
          specialty: 'General Medicine',
          phone: '+919876543211',
          email: 'sasmita@example.com'
        },
        consultationType: 'video',
        consultationDate: '2025-09-17',
        consultationTime: '10:00',
        duration: 30,
        status: 'overdue',
        chiefComplaint: 'Test overdue consultation for reschedule demo',
        consultationFee: 500,
        paymentStatus: 'pending'
      };
      
      setConsultation(mockConsultation);
    } catch (error) {
      console.error('Error fetching consultation:', error);
      setError('Failed to load consultation details');
    } finally {
      setLoading(false);
    }
  };

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

  const loadDoctorSlots = async (doctorId: string, date: string) => {
    try {
      setLoadingSlots(true);
      
      // Get real doctor slots from API with date filter
      const response = await api.get(`/api/doctors/${doctorId}/slots/?date=${date}`);
      
      let slots: DoctorSlot[] = [];
      
      // Handle paginated response
      if (response.data && response.data.results && Array.isArray(response.data.results)) {
        slots = response.data.results;
        
        // If there are more pages, fetch all pages
        let nextUrl = response.data.next;
        while (nextUrl) {
          const nextResponse = await api.get(nextUrl.replace('http://127.0.0.1:8000', ''));
          if (nextResponse.data && nextResponse.data.results) {
            slots = slots.concat(nextResponse.data.results);
            nextUrl = nextResponse.data.next;
          } else {
            break;
          }
        }
      } else if (response.data && Array.isArray(response.data)) {
        slots = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        slots = response.data.data;
      }
      
      // Filter slots for the specific date and only available ones
      // Since we're filtering by date in the API, we should only get slots for that date
      const dateSlots = slots.filter(slot => 
        slot.date === date && 
        slot.is_available && 
        !slot.is_booked
      );
      
      setAvailableSlots(dateSlots);
      
      if (dateSlots.length === 0) {
        toast.error(`No available slots found for ${selectedDoctor?.user_name} on ${new Date(date).toLocaleDateString()}`);
      }
      
    } catch (error) {
      console.error('Error loading doctor slots:', error);
      toast.error('Failed to load doctor availability');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDoctorSelect = (doctor: DoctorProfile) => {
    setSelectedDoctor(doctor);
    setSelectedDate('');
    setSelectedTime('');
    setAvailableSlots([]);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    if (selectedDoctor) {
      loadDoctorSlots(selectedDoctor.user, date);
    }
  };

  const handleReschedule = async () => {
    if (!consultation || !selectedDoctor || !selectedDate || !selectedTime || !reason.trim()) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      console.log('🔄 Starting reschedule process...');
      console.log('Current consultation:', consultation);
      console.log('New doctor:', selectedDoctor);
      console.log('New date:', selectedDate);
      console.log('New time:', selectedTime);
      
      // Check if we're changing the doctor
      const isDoctorChange = selectedDoctor.user !== consultation.doctor.id;
      
      if (isDoctorChange) {
        // For doctor changes, we need to create a new consultation and cancel the old one
        console.log('🔄 Doctor change detected, creating new consultation...');
        
        // Find the selected slot ID from available slots
        const selectedSlot = availableSlots.find(slot => 
          slot.start_time === selectedTime && slot.date === selectedDate
        );
        
        if (!selectedSlot) {
          throw new Error('Selected time slot is not available. Please refresh and try again.');
        }
        
        // Create new consultation with new doctor
        const newConsultationData = {
          patient: consultation.patient.id,
          doctor: selectedDoctor.user,
          consultation_type: consultation.consultation_type,
          scheduled_date: selectedDate,
          scheduled_time: selectedTime,
          duration: consultation.duration || 30,
          chief_complaint: consultation.chief_complaint || 'Rescheduled consultation',
          consultation_fee: selectedDoctor.consultation_fee || consultation.consultation_fee,
          slot_id: selectedSlot.id
        };
        
        console.log('📝 Creating new consultation with data:', newConsultationData);
        const newResponse = await api.post('/api/consultations/', newConsultationData);
        console.log('✅ New consultation created:', newResponse.data);
        
        // Cancel the old consultation
        console.log('❌ Cancelling old consultation...');
        await adminConsultationApi.cancelConsultation(consultation.id, `Rescheduled to new consultation with ${selectedDoctor.user_name}. Reason: ${reason}`);
        console.log('✅ Old consultation cancelled');
        
        toast.success(`Consultation rescheduled successfully with ${selectedDoctor.user_name}! New consultation ID: ${newResponse.data.id || newResponse.data.data?.id || 'N/A'}`);
      } else {
        // Same doctor, use the reschedule endpoint
        console.log('🔄 Same doctor, using reschedule endpoint...');
        
        const response = await adminConsultationApi.rescheduleConsultation(
          consultation.id,
          selectedDate,
          selectedTime
        );
        console.log('✅ Consultation rescheduled:', response);
        
        toast.success(`Consultation rescheduled successfully!`);
      }
      
      // Navigate back to overdue consultations
      navigate('/dashboard/consultations/overdue');
      
    } catch (error) {
      console.error('❌ Error rescheduling consultation:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to reschedule consultation';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#E17726]" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Consultation Details</h3>
            <p className="text-gray-500">Please wait...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error || 'Consultation not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/dashboard/consultations/overdue')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overdue
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Reschedule Consultation</h1>
            <p className="text-sm text-gray-600">ID: {consultation.id} - Booking Style Flow</p>
          </div>
        </div>
        <Badge className="bg-red-100 text-red-800 px-3 py-1">
          <AlertCircle className="w-4 h-4 mr-1" />
          Overdue
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Patient Info (Pre-selected) */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 text-green-600" />
                Patient (Selected)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="font-semibold text-gray-900">{consultation.patient.name}</div>
                <div className="text-sm text-gray-600">ID: {consultation.patient.id}</div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {consultation.patient.phone}
                </div>
                {consultation.patient.email && (
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {consultation.patient.email}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <strong>Original Issue:</strong> {consultation.chiefComplaint}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Flow */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#E17726]" />
                Reschedule Booking Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {/* Step 1: Doctor Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#E17726] text-white rounded-full flex items-center justify-center text-xs">1</span>
                  Select New Doctor *
                </Label>
                {loadingDoctors ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading doctors...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border rounded-lg p-3">
                    {doctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        onClick={() => handleDoctorSelect(doctor)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedDoctor?.id === doctor.id
                            ? 'border-[#E17726] bg-orange-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <Stethoscope className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium text-sm text-gray-900 truncate">
                              {doctor.user_name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {doctor.specialization || 'General Medicine'}
                            </div>
                            <div className="text-xs text-green-600 font-medium">
                              ₹{doctor.consultation_fee}
                            </div>
                            {doctor.rating && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-xs text-gray-600">{doctor.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 2: Date Selection */}
              {selectedDoctor && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-6 bg-[#E17726] text-white rounded-full flex items-center justify-center text-xs">2</span>
                    Select Date *
                  </Label>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>Selected Doctor:</strong> {selectedDoctor.user_name} - {selectedDoctor.specialization}
                    </p>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateSelect(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Time Selection */}
              {selectedDoctor && selectedDate && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-6 bg-[#E17726] text-white rounded-full flex items-center justify-center text-xs">3</span>
                    Select Available Time Slot *
                  </Label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading available slots for {selectedDate}...
                    </div>
                  ) : (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-800 mb-3">
                        <strong>Available slots for {new Date(selectedDate).toLocaleDateString()}:</strong>
                      </p>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot.id}
                            variant={selectedTime === slot.start_time ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTime(slot.start_time)}
                            disabled={!slot.is_available || slot.is_booked}
                            className={`text-xs h-10 flex flex-col ${
                              selectedTime === slot.start_time
                                ? 'bg-[#E17726] text-white'
                                : slot.is_available && !slot.is_booked
                                ? 'border-green-200 text-green-700 hover:bg-green-50'
                                : 'opacity-50 cursor-not-allowed bg-gray-100'
                            }`}
                          >
                            <span className="font-medium">{slot.start_time}</span>
                            <span className="text-[10px] opacity-75">to {slot.end_time}</span>
                          </Button>
                        ))}
                      </div>
                      {availableSlots.length === 0 && !loadingSlots && (
                        <div className="text-center py-4 text-gray-500">
                          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>No available slots for this date.</p>
                          <p className="text-xs">Doctor may not have set availability for {new Date(selectedDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        <span className="text-green-600">●</span> Available 
                        <span className="text-gray-400 ml-3">●</span> Unavailable
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Reason */}
              {selectedTime && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-6 bg-[#E17726] text-white rounded-full flex items-center justify-center text-xs">4</span>
                    Reason for Rescheduling *
                  </Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide reason for rescheduling (e.g., doctor availability, patient request, etc.)..."
                    className="text-sm min-h-[60px]"
                    rows={2}
                  />
                </div>
              )}

              {/* Step 5: Notifications & Submit */}
              {reason.trim() && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-6 bg-[#E17726] text-white rounded-full flex items-center justify-center text-xs">5</span>
                    Confirm & Book
                  </Label>
                  
                  {/* Booking Summary */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-gray-900 mb-2">Reschedule Summary:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Patient:</span> {consultation.patient.name}
                      </div>
                      <div>
                        <span className="text-gray-600">New Doctor:</span> {selectedDoctor.user_name}
                      </div>
                      <div>
                        <span className="text-gray-600">New Date:</span> {new Date(selectedDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-gray-600">New Time:</span> {selectedTime}
                      </div>
                      <div>
                        <span className="text-gray-600">Fee:</span> ₹{selectedDoctor.consultation_fee}
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span> {selectedDoctor.consultation_duration || 30} min
                      </div>
                    </div>
                  </div>

                  {/* Notification Options */}
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="notifyPatient"
                        checked={notifyPatient}
                        onChange={(e) => setNotifyPatient(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="notifyPatient" className="text-sm text-gray-700">
                        Notify Patient
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="notifyDoctor"
                        checked={notifyDoctor}
                        onChange={(e) => setNotifyDoctor(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="notifyDoctor" className="text-sm text-gray-700">
                        Notify New Doctor
                      </Label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-2">
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
                          Confirm Reschedule with {selectedDoctor.user_name}
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => navigate('/dashboard/consultations/overdue')}
                      variant="outline"
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingStyleReschedule;
