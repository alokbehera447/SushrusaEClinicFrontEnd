import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  CalendarIcon, 
  Clock, 
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  adminPatientApi, 
  doctorApi, 
  getAvailableSlots, 
  createConsultation,
  PatientProfile, 
  DoctorProfile, 
  DoctorSlot 
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { debounce } from 'lodash';

interface EClinic {
  id: string;
  name: string;
  consultation_duration: number;
}

const EnhancedConsultationBooking = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    clinicId: '',
    consultationType: 'video_call',
    chiefComplaint: '',
    symptoms: '',
    consultationFee: '',
  });

  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<EClinic | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<DoctorSlot | null>(null);

  const [patientSearch, setPatientSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [patientOptions, setPatientOptions] = useState<PatientProfile[]>([]);
  const [doctorOptions, setDoctorOptions] = useState<DoctorProfile[]>([]);
  const [clinicOptions, setClinicOptions] = useState<EClinic[]>([]);
  const [availableSlots, setAvailableSlots] = useState<DoctorSlot[]>([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Debounced search functions
  const debouncedPatientSearch = React.useMemo(() => debounce(async (query: string) => {
    if (!query) {
      try {
        const res = await adminPatientApi.getPatients({ page: 1, page_size: 8 });
        setPatientOptions(Array.isArray(res?.results) ? res.results : []);
      } catch {
        setPatientOptions([]);
      }
      return;
    }
    try {
      const results = await adminPatientApi.searchPatients({ query });
      setPatientOptions(Array.isArray(results) ? results : []);
    } catch (e) {
      setPatientOptions([]);
    }
  }, 400), []);

  const debouncedDoctorSearch = React.useMemo(() => debounce(async (query: string) => {
    if (!query) {
      try {
        const res = await doctorApi.getDoctors({ is_active: true, is_verified: true });
        setDoctorOptions(Array.isArray(res) ? res.slice(0, 8) : []);
      } catch {
        setDoctorOptions([]);
      }
      return;
    }
    try {
      const results = await doctorApi.getDoctors({ search: query });
      setDoctorOptions(Array.isArray(results) ? results : []);
    } catch (e) {
      setDoctorOptions([]);
    }
  }, 400), []);

  // Load initial data
  useEffect(() => {
    debouncedPatientSearch(patientSearch);
  }, [patientSearch, debouncedPatientSearch]);

  useEffect(() => {
    debouncedDoctorSearch(doctorSearch);
  }, [doctorSearch, debouncedDoctorSearch]);

  useEffect(() => {
    // Load clinics
    const loadClinics = async () => {
      try {
        // Mock data - replace with actual API call
        setClinicOptions([
          { id: '1', name: 'General Clinic', consultation_duration: 15 },
          { id: '2', name: 'Specialty Clinic', consultation_duration: 30 },
          { id: '3', name: 'Emergency Clinic', consultation_duration: 20 },
        ]);
      } catch (error) {
        console.error('Error loading clinics:', error);
      }
    };
    loadClinics();
  }, []);

  // Fetch available slots when doctor, clinic, and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedClinic && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDoctor, selectedClinic, selectedDate]);

  const fetchAvailableSlots = async () => {
    if (!selectedDoctor || !selectedClinic || !selectedDate) return;

    setLoading(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const slots = await getAvailableSlots({
        doctor_id: selectedDoctor.user,
        clinic_id: selectedClinic.id,
        date: formattedDate
      });
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available slots",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedDoctor || !selectedSlot) {
      toast({
        title: "Missing Information",
        description: "Please select patient, doctor, and slot",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patient: selectedPatient.user,
        doctor: selectedDoctor.user,
        consultation_type: formData.consultationType,
        scheduled_date: selectedSlot.date,
        scheduled_time: selectedSlot.start_time,
        duration: selectedClinic?.consultation_duration || 15,
        chief_complaint: formData.chiefComplaint,
        symptoms: formData.symptoms,
        consultation_fee: Number(formData.consultationFee) || selectedDoctor.consultation_fee,
        slot_id: selectedSlot.id,
      };

      const result = await createConsultation(payload);
      toast({
        title: "Success",
        description: "Consultation booked successfully!",
      });
      onClose();
    } catch (error) {
      console.error('Error creating consultation:', error);
      toast({
        title: "Error",
        description: "Failed to book consultation",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getSlotStatus = (slot: DoctorSlot) => {
    if (slot.is_booked) {
      return { label: 'Booked', variant: 'destructive' as const, icon: XCircle };
    }
    if (slot.is_available) {
      return { label: 'Available', variant: 'default' as const, icon: CheckCircle };
    }
    return { label: 'Unavailable', variant: 'secondary' as const, icon: AlertTriangle };
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold text-midnight">
            <User className="w-5 h-5 mr-2 text-[#E17726]" />
            Select Patient
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Search Patient</Label>
            <Input
              placeholder="Search by name, phone, or email"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patientOptions.map((patient) => (
              <div
                key={patient.id}
                onClick={() => {
                  setSelectedPatient(patient);
                  setFormData(prev => ({ ...prev, patientId: patient.id }));
                }}
                className={cn(
                  "p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md",
                  selectedPatient?.id === patient.id
                    ? "border-[#E17726] bg-[#E17726]/5"
                    : "border-gray-200 hover:border-[#E17726]/50"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#E17726]/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#E17726]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-midnight">{patient.user_name}</h4>
                    <p className="text-sm text-gray-600">{patient.user_phone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold text-midnight">
            <User className="w-5 h-5 mr-2 text-[#E17726]" />
            Select Doctor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Search Doctor</Label>
            <Input
              placeholder="Search by name or specialization"
              value={doctorSearch}
              onChange={(e) => setDoctorSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctorOptions.map((doctor) => (
              <div
                key={doctor.id}
                onClick={() => {
                  setSelectedDoctor(doctor);
                  setFormData(prev => ({ ...prev, doctorId: doctor.id.toString() }));
                }}
                className={cn(
                  "p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md",
                  selectedDoctor?.id === doctor.id
                    ? "border-[#E17726] bg-[#E17726]/5"
                    : "border-gray-200 hover:border-[#E17726]/50"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#E17726]/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#E17726]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-midnight">{doctor.user_name}</h4>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    <p className="text-xs text-gray-500">₹{doctor.consultation_fee}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={() => setStep(2)}
          disabled={!selectedPatient || !selectedDoctor}
        >
          Next: Select Clinic & Date
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold text-midnight">
            <CalendarIcon className="w-5 h-5 mr-2 text-[#E17726]" />
            Select Clinic & Date
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Select Clinic</Label>
              <Select 
                value={selectedClinic?.id || ''} 
                onValueChange={(value) => {
                  const clinic = clinicOptions.find(c => c.id === value);
                  setSelectedClinic(clinic || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a clinic" />
                </SelectTrigger>
                <SelectContent>
                  {clinicOptions.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      {clinic.name} ({clinic.consultation_duration} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                disabled={(date) => date < new Date()}
              />
            </div>
          </div>

          {selectedClinic && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">{selectedClinic.name}</h4>
              <p className="text-sm text-blue-700">
                Consultation Duration: {selectedClinic.consultation_duration} minutes
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button 
          onClick={() => setStep(3)}
          disabled={!selectedClinic || !selectedDate}
        >
          Next: Select Slot
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold text-midnight">
            <Clock className="w-5 h-5 mr-2 text-[#E17726]" />
            Select Time Slot
            {selectedDate && (
              <span className="ml-2 text-sm font-normal text-gray-600">
                for {format(selectedDate, 'MMMM d, yyyy')}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E17726]"></div>
              <span className="ml-2">Loading available slots...</span>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No available slots for this date</p>
              <p className="text-sm">Please try a different date or contact the doctor</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableSlots.map((slot) => {
                const status = getSlotStatus(slot);
                const IconComponent = status.icon;
                
                return (
                  <div
                    key={slot.id}
                    onClick={() => {
                      if (slot.is_available && !slot.is_booked) {
                        setSelectedSlot(slot);
                      }
                    }}
                    className={cn(
                      "p-4 border-2 rounded-lg cursor-pointer transition-all",
                      selectedSlot?.id === slot.id
                        ? "border-[#E17726] bg-[#E17726]/5"
                        : slot.is_available && !slot.is_booked
                          ? "border-green-200 hover:border-[#E17726]/50 hover:shadow-md"
                          : "border-gray-200 opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <IconComponent className="w-4 h-4" />
                      <Badge variant={status.variant} className="text-xs">
                        {status.label}
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-midnight">
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {slot.clinic_name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button 
          onClick={() => setStep(4)}
          disabled={!selectedSlot}
        >
          Next: Consultation Details
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold text-midnight">
            <Save className="w-5 h-5 mr-2 text-[#E17726]" />
            Consultation Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Consultation Type</Label>
              <Select 
                value={formData.consultationType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, consultationType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video_call">Video Call</SelectItem>
                  <SelectItem value="phone_call">Phone Call</SelectItem>
                  <SelectItem value="in_person">In Person</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Consultation Fee (₹)</Label>
              <Input
                type="number"
                value={formData.consultationFee}
                onChange={(e) => setFormData(prev => ({ ...prev, consultationFee: e.target.value }))}
                placeholder={selectedDoctor?.consultation_fee.toString()}
              />
            </div>
          </div>

          <div>
            <Label>Chief Complaint</Label>
            <Textarea
              value={formData.chiefComplaint}
              onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
              placeholder="Describe the main reason for consultation"
              rows={3}
            />
          </div>

          <div>
            <Label>Symptoms</Label>
            <Textarea
              value={formData.symptoms}
              onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
              placeholder="List any symptoms the patient is experiencing"
              rows={3}
            />
          </div>

          {/* Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Booking Summary</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Patient:</strong> {selectedPatient?.user_name}</p>
              <p><strong>Doctor:</strong> {selectedDoctor?.user_name}</p>
              <p><strong>Clinic:</strong> {selectedClinic?.name}</p>
              <p><strong>Date:</strong> {selectedDate && format(selectedDate, 'MMMM d, yyyy')}</p>
              <p><strong>Time:</strong> {selectedSlot && `${selectedSlot.start_time.slice(0, 5)} - ${selectedSlot.end_time.slice(0, 5)}`}</p>
              <p><strong>Duration:</strong> {selectedClinic?.consultation_duration} minutes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(3)}>
          Back
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Booking...' : 'Book Consultation'}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-midnight mb-2">Book Consultation</h2>
          <p className="text-gray-600">Smart slot-based consultation booking</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                step >= stepNumber 
                  ? "bg-[#E17726] text-white" 
                  : "bg-gray-200 text-gray-600"
              )}>
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={cn(
                  "w-16 h-1 mx-2",
                  step > stepNumber ? "bg-[#E17726]" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
};

export default EnhancedConsultationBooking; 