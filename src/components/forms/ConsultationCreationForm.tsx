import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, User, Stethoscope, Building2, Calendar as CalendarIcon2, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { adminPatientApi, doctorApi, superAdminApi, PatientProfile, DoctorProfile, EClinic, createConsultation, calculateAvailableSlots } from '@/lib/api';
import { debounce } from 'lodash';
import { toast } from 'sonner';

interface CalculatedSlot {
  start_time: string;
  end_time: string;
  duration_minutes: number;
  clinic_name: string;
  doctor_name: string;
  is_available: boolean;
}

interface DoctorSlotFrontend {
  id: number;
  doctor: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  created_at: string;
  updated_at: string;
  type: 'available' | 'booked';
}

const ConsultationCreationForm = ({ onClose }: { onClose: () => void }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Consultation Info
    patientId: '',
    doctorId: '',
    clinicId: '',
    consultationType: 'video_call', // video_call only
    consultationDate: undefined as Date | undefined,
    selectedSlot: null as DoctorSlotFrontend | null,
    duration: '30', // minutes
    
    // Consultation Details
    chiefComplaint: '',
    symptoms: '',
    medicalHistory: '',
    currentMedications: '',
    allergies: '',
    
    // Financial
    consultationFee: '',
    paymentMethod: 'cash',
    
    // Additional Info
    notes: '',
    followUpRequired: false,
    followUpDate: undefined as Date | undefined,
    referralRequired: false,
    referralTo: '',
    
    // Emergency Info
    isEmergency: false,
    emergencyContact: '',
    emergencyPhone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<EClinic | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [patientOptions, setPatientOptions] = useState<PatientProfile[]>([]);
  const [doctorOptions, setDoctorOptions] = useState<DoctorProfile[]>([]);
  const [clinicOptions, setClinicOptions] = useState<EClinic[]>([]);
  const [doctorSlots, setDoctorSlots] = useState<DoctorSlotFrontend[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  // Debounced patient search
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

  // Debounced doctor search
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
    const results = await doctorApi.getDoctors({ search: query });
    setDoctorOptions(Array.isArray(results) ? results : []);
  }, 400), []);

  // Function to fetch available slots
  const fetchAvailableSlots = async (date: Date) => {
    if (!selectedDoctor || !selectedClinic) {
      setDoctorSlots([]);
      return;
    }

    setSlotLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const result = await calculateAvailableSlots({
        doctor_id: selectedDoctor.user,
        clinic_id: selectedClinic.id,
        date: formattedDate
      });
      
      // Convert to frontend format
      const frontendSlots: DoctorSlotFrontend[] = result.slots.map(slot => ({
        id: -1, // Temporary ID for calculated slots
        doctor: Number(selectedDoctor.user),
        date: formattedDate,
        startTime: slot.start_time,
        endTime: slot.end_time,
        isAvailable: slot.is_available,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        type: slot.is_available ? 'available' : 'booked',
      }));
      
      setDoctorSlots(frontendSlots);
      
      // Update duration based on clinic
      setFormData(prev => ({ ...prev, duration: result.clinic_duration.toString() }));
    } catch (error) {
      console.error('Error calculating available slots:', error);
      setDoctorSlots([]);
    } finally {
      setSlotLoading(false);
    }
  };

  // Effects
  React.useEffect(() => {
    debouncedPatientSearch(patientSearch);
  }, [patientSearch]);

  React.useEffect(() => {
    debouncedDoctorSearch(doctorSearch);
  }, [doctorSearch]);

  // Calculate slots when doctor, clinic, or date changes
  React.useEffect(() => {
    if (selectedDoctor && selectedClinic && formData.consultationDate) {
      fetchAvailableSlots(formData.consultationDate);
    }
  }, [selectedDoctor, selectedClinic, formData.consultationDate]);

  // Fetch clinics
  React.useEffect(() => {
    async function fetchClinics() {
      try {
        const res = await superAdminApi.getEClinics();
        setClinicOptions(Array.isArray(res.results) ? res.results : []);
      } catch {
        setClinicOptions([]);
      }
    }
    fetchClinics();
  }, []);

  const handleInputChange = (field: string, value: string | number | boolean | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePatientSelect = (patient: PatientProfile) => {
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, patientId: patient.user }));
    setPatientSearch(patient.user_name);
  };

  const handleDoctorSelect = (doctor: DoctorProfile) => {
    setSelectedDoctor(doctor);
    setFormData(prev => ({ ...prev, doctorId: doctor.user }));
    setDoctorSearch(doctor.user_name);
  };

  const handleClinicSelect = (clinic: EClinic) => {
    console.log('Clinic selected:', clinic);
    console.log('Clinic ID:', clinic.id, 'Type:', typeof clinic.id);
    setSelectedClinic(clinic);
    setFormData(prev => ({ ...prev, clinicId: clinic.id }));
  };

  const handleSlotSelect = (slot: DoctorSlotFrontend) => {
    setFormData(prev => ({ ...prev, selectedSlot: slot }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Form data before submission:', formData);
      console.log('Selected clinic:', selectedClinic);
      const consultationData = {
        patient: formData.patientId,
        doctor: formData.doctorId,
        consultation_type: formData.consultationType,
        scheduled_date: format(formData.consultationDate!, 'yyyy-MM-dd'),
        scheduled_time: formData.selectedSlot.startTime,
        duration: parseInt(formData.duration),
        chief_complaint: formData.chiefComplaint,
        symptoms: formData.symptoms,
        consultation_fee: parseFloat(formData.consultationFee) || 0,
        clinic_id: parseInt(formData.clinicId) || undefined
      };

      console.log('Sending consultation data:', consultationData);
      console.log('Clinic ID type:', typeof consultationData.clinic_id, 'Value:', consultationData.clinic_id);
      await createConsultation(consultationData);
      toast.success('Consultation created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating consultation:', error);
      alert('Failed to create consultation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="patient-search">Search Patient</Label>
        <Input
          id="patient-search"
          placeholder="Search by name, phone, or email..."
          value={patientSearch}
          onChange={(e) => setPatientSearch(e.target.value)}
        />
        {patientOptions.length > 0 && (
          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {patientOptions.map((patient) => (
              <div
                key={patient.id}
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => handlePatientSelect(patient)}
              >
                <div className="font-medium">{patient.user_name}</div>
                <div className="text-sm text-gray-600">{patient.user_phone}</div>
              </div>
            ))}
          </div>
        )}
        {selectedPatient && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium">Selected: {selectedPatient.user_name}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="doctor-search">Search Doctor</Label>
        <Input
          id="doctor-search"
          placeholder="Search by name or specialization..."
          value={doctorSearch}
          onChange={(e) => setDoctorSearch(e.target.value)}
        />
        {doctorOptions.length > 0 && (
          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {doctorOptions.map((doctor) => (
              <div
                key={doctor.user}
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => handleDoctorSelect(doctor)}
              >
                <div className="font-medium">{doctor.user_name}</div>
                <div className="text-sm text-gray-600">{doctor.specialization}</div>
              </div>
            ))}
          </div>
        )}
        {selectedDoctor && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium">Selected: {selectedDoctor.user_name}</span>
            </div>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="clinic-select">Select Clinic</Label>
        <Select onValueChange={(value) => {
          const clinic = clinicOptions.find(c => c.id === value);
          if (clinic) handleClinicSelect(clinic);
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select a clinic" />
          </SelectTrigger>
          <SelectContent>
            {clinicOptions.map((clinic) => (
              <SelectItem key={clinic.id} value={clinic.id}>
                {clinic.name} ({clinic.consultation_duration} min)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedClinic && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium">Selected: {selectedClinic.name}</span>
              <span className="text-sm text-gray-600">({selectedClinic.consultation_duration} min duration)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label>Select Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.consultationDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon2 className="mr-2 h-4 w-4" />
              {formData.consultationDate ? format(formData.consultationDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.consultationDate}
              onSelect={(date) => handleInputChange('consultationDate', date)}
              initialFocus
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      {slotLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Calculating available slots...</p>
        </div>
      )}

      {slotError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{slotError}</p>
        </div>
      )}

      {doctorSlots.length > 0 && (
        <div>
          <Label>Available Time Slots</Label>
          <div className="mt-2 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {doctorSlots.map((slot, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 border rounded-lg cursor-pointer text-center",
                  formData.selectedSlot === slot
                    ? "bg-blue-50 border-blue-300"
                    : "hover:bg-gray-50"
                )}
                onClick={() => handleSlotSelect(slot)}
              >
                <div className="font-medium">{slot.startTime}</div>
                <div className="text-sm text-gray-600">{slot.isAvailable ? 'Available' : 'Booked'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {doctorSlots.length === 0 && !slotLoading && formData.consultationDate && (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No available slots for this date</p>
          <p className="text-sm">The doctor may not have set availability for this date</p>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          value={formData.duration}
          onChange={(e) => handleInputChange('duration', e.target.value)}
          disabled
        />
        <p className="text-sm text-gray-500 mt-1">Video consultation duration based on clinic settings</p>
      </div>

      <div>
        <Label htmlFor="chief-complaint">Chief Complaint *</Label>
        <Textarea
          id="chief-complaint"
          placeholder="Primary reason for consultation..."
          value={formData.chiefComplaint}
          onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="symptoms">Symptoms</Label>
        <Textarea
          id="symptoms"
          placeholder="Describe symptoms..."
          value={formData.symptoms}
          onChange={(e) => handleInputChange('symptoms', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="consultation-fee">Consultation Fee</Label>
          <Input
            id="consultation-fee"
            type="number"
            placeholder="0.00"
            value={formData.consultationFee}
            onChange={(e) => handleInputChange('consultationFee', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="payment-method">Payment Method</Label>
          <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="online">Online</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information..."
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
        />
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedPatient !== null;
      case 2:
        return selectedDoctor !== null && selectedClinic !== null;
      case 3:
        return formData.consultationDate !== undefined && formData.selectedSlot !== null;
      case 4:
        return formData.chiefComplaint.trim() !== '';
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create New Consultation</h2>
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep >= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              )}>
                {step}
              </div>
              {step < 4 && (
                <div className={cn(
                  "w-16 h-1 mx-2",
                  currentStep > step ? "bg-blue-600" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between mb-6 text-sm text-gray-600">
          <span>Select Patient</span>
          <span>Select Doctor & Clinic</span>
          <span>Choose Time Slot</span>
          <span>Consultation Details</span>
        </div>

        <form onSubmit={handleSubmit}>
          {renderStepContent()}

          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceedToNext()}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!canProceedToNext() || isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Consultation'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultationCreationForm; 