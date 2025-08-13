import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ChevronRight, CalendarIcon, Clock, User, Stethoscope, Building2, CheckCircle, ArrowRight, ArrowLeft, Search, Phone, Star, Timer, DollarSign, FileText, X, Sparkles, Home, Video } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { debounce } from 'lodash';
import { toast } from 'sonner';

// --- Restored Original API and Type Imports ---
import { adminPatientApi, doctorApi, superAdminApi, PatientProfile, DoctorProfile, EClinic, createConsultation, calculateAvailableSlots, adminConsultationApi } from '@/lib/api';
import { api } from '@/lib/utils';

// --- Restored Original Type Definition for Slots ---
// This defines the structure of a slot object after being processed for the frontend.
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

// --- Reusable UI Components (defined within this file for simplicity) ---

// Floating Label Input Component
const FloatingLabelInput = ({ id, label, icon: Icon, ...props }: any) => (
  <div className="relative">
    <Input
      id={id}
      placeholder=" " // Important for the floating label effect
      className="peer h-14 w-full rounded-xl border-2 border-slate-300 bg-white/80 pt-4 text-base shadow-sm transition-all focus:border-orange-500 focus:bg-white focus:shadow-md focus:shadow-orange-500/10 pl-12"
      {...props}
    />
    <label
      htmlFor={id}
      className="absolute left-12 top-1 -translate-y-1/2 scale-75 cursor-text text-xs text-slate-500 transition-all 
                 peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-base 
                 peer-focus:top-1 peer-focus:-translate-y-1/2 peer-focus:scale-75 peer-focus:text-xs peer-focus:text-orange-600"
    >
      {label}
    </label>
    {Icon && <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 peer-focus:text-orange-500" />}
  </div>
);

// Success Modal Component
const SuccessModal = ({ isOpen, onClose, patientName, doctorName, appointmentTime, consultation, meetingLink }: any) => {
  if (!isOpen) return null;

  // Check if consultation time is now or within 15 minutes
  const isConsultationTimeNow = () => {
    if (!consultation?.scheduled_date || !consultation?.scheduled_time) return false;
    
    const now = new Date();
    const consultationDate = new Date(consultation.scheduled_date);
    const [hours, minutes] = consultation.scheduled_time.split(':');
    consultationDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const timeDiff = consultationDate.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    // Return true if consultation is within 15 minutes (before or after)
    return Math.abs(minutesDiff) <= 15;
  };

  const canJoinMeeting = isConsultationTimeNow() && meetingLink && consultation?.consultation_type === 'video_call';

  const handleJoinMeeting = () => {
    if (meetingLink) {
      window.open(meetingLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative m-4 w-full max-w-md transform rounded-3xl bg-gradient-to-br from-white to-slate-50 p-8 text-center shadow-2xl transition-all animate-in zoom-in-95 duration-500">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700">
          <X className="h-6 w-6" />
        </button>
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Success!</h2>
        <p className="mt-2 text-slate-600">The consultation has been scheduled.</p>
        
        {canJoinMeeting && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-center mb-2">
              <Video className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-semibold">Consultation Time!</span>
            </div>
            <p className="text-blue-700 text-sm mb-3">Your consultation is scheduled to start now. Click below to join the meeting.</p>
            <Button 
              onClick={handleJoinMeeting}
              className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white transition-transform hover:scale-105 active:scale-100"
            >
              <Video className="h-4 w-4 mr-2" />
              Join Meeting
            </Button>
          </div>
        )}
        
        <div className="mt-6 space-y-3 rounded-xl bg-slate-100/70 p-4 text-left">
          <div className="flex items-center">
            <User className="mr-3 h-5 w-5 text-orange-500" />
            <span className="font-medium text-slate-700">{patientName}</span>
          </div>
          <div className="flex items-center">
            <Stethoscope className="mr-3 h-5 w-5 text-orange-500" />
            <span className="font-medium text-slate-700">{doctorName}</span>
          </div>
          <div className="flex items-center">
            <CalendarIcon className="mr-3 h-5 w-5 text-orange-500" />
            <span className="font-medium text-slate-700">{appointmentTime}</span>
          </div>
        </div>
        
        <div className="mt-6 flex gap-3">
          {canJoinMeeting ? (
            <>
              <Button 
                onClick={handleJoinMeeting}
                className="flex-1 h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white transition-transform hover:scale-105 active:scale-100"
              >
                <Video className="h-4 w-4 mr-2" />
                Join Meeting
              </Button>
              <Button 
                onClick={onClose} 
                variant="outline"
                className="flex-1 h-12 text-lg border-orange-500 text-orange-500 hover:bg-orange-50 transition-transform hover:scale-105 active:scale-100"
              >
                Close
              </Button>
            </>
          ) : (
            <Button 
              onClick={onClose} 
              className="w-full h-12 text-lg bg-orange-500 hover:bg-orange-600 transition-transform hover:scale-105 active:scale-100"
            >
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};


// --- Main Component ---
const NewConsultationPage = ({ onClose, assignedClinicId }: { onClose: () => void; assignedClinicId?: string }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    clinicId: 'CLI002', // Set default clinic ID - remove clinic selection
    consultationType: 'video_call', // From original code
    consultationDate: undefined as Date | undefined,
    selectedSlot: null as DoctorSlotFrontend | null,
    duration: '30',
    chiefComplaint: '',
    symptoms: '',
    consultationFee: '',
    paymentMethod: 'cash', // Default to cash payment
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<any>(null);
  const [createdConsultation, setCreatedConsultation] = useState<any>(null);
  const [meetingLink, setMeetingLink] = useState<string>('');
  
  // UI State
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<EClinic | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [patientOptions, setPatientOptions] = useState<PatientProfile[]>([]);
  const [doctorOptions, setDoctorOptions] = useState<DoctorProfile[]>([]);
  const [doctorSlots, setDoctorSlots] = useState<DoctorSlotFrontend[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);
  
  // --- Restored Original API Logic ---

  const debouncedPatientSearch = useMemo(() => debounce(async (query: string) => {
    try {
      if (!query) {
        const res = await adminPatientApi.getPatients({ page: 1, page_size: 8 });
        setPatientOptions(Array.isArray(res?.results) ? res.results : []);
        return;
      }
      const results = await adminPatientApi.searchPatients({ query });
      setPatientOptions(Array.isArray(results) ? results : []);
    } catch (e) {
      console.error("Failed to search patients:", e);
      setPatientOptions([]);
      toast.error("Could not fetch patient data.");
    }
  }, 400), []);

  const debouncedDoctorSearch = useMemo(() => debounce(async (query: string) => {
    try {
      if (!query) {
        // Load all doctors without filters
        const res = await doctorApi.getDoctors({});
        console.log('Doctor API response (no filters):', res);
        setDoctorOptions(Array.isArray(res?.results) ? res.results.slice(0, 8) : []);
        return;
      }
      // Search doctors
      const results = await doctorApi.getDoctors({ search: query });
      console.log('Doctor search response:', results);
      setDoctorOptions(Array.isArray(results?.results) ? results.results : []);
    } catch (e) {
      console.error("Failed to search doctors:", e);
      setDoctorOptions([]);
      toast.error("Could not fetch doctor data.");
    }
  }, 400), []);

  const fetchAvailableSlots = async (date: Date) => {
    console.log('🚀 fetchAvailableSlots called with date:', date);
    console.log('🚀 selectedDoctor:', selectedDoctor);
    console.log('🚀 selectedClinic:', selectedClinic);
    
    if (!selectedDoctor || !selectedClinic) {
      console.log('🚀 Early return - missing doctor or clinic');
      return;
    }

    console.log('🚀 Starting slot fetch...');
    setSlotLoading(true);
    setDoctorSlots([]);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      console.log('🚀 Fetching slots with:', {
        doctor_id: selectedDoctor.user,
        clinic_id: selectedClinic.id,
        date: formattedDate,
      });
      
      console.log('🚀 About to call calculateAvailableSlots with:', {
        doctor_id: selectedDoctor.user,
        clinic_id: selectedClinic.id,
        date: formattedDate,
      });
      
      const result = await calculateAvailableSlots({
        doctor_id: selectedDoctor.user,
        clinic_id: selectedClinic.id,
        date: formattedDate,
      });
      
      console.log('🚀 calculateAvailableSlots result:', result);
      
      const frontendSlots: DoctorSlotFrontend[] = result.slots.map((slot: any) => ({
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
      setFormData(prev => ({ ...prev, duration: result.clinic_duration.toString() }));
    } catch (error) {
      console.error('Error calculating available slots:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('Error response:', error.response?.data);
      }
      toast.error("Failed to fetch available slots.");
    } finally {
      setSlotLoading(false);
    }
  };

  useEffect(() => { debouncedPatientSearch(patientSearch); }, [patientSearch, debouncedPatientSearch]);
  useEffect(() => { debouncedDoctorSearch(doctorSearch); }, [doctorSearch, debouncedDoctorSearch]);
  
  // Load initial data when component mounts
  useEffect(() => {
    console.log('🚀 Component mounted - loading initial data');
    // Load initial patients
    console.log('🚀 Loading initial patients...');
    debouncedPatientSearch('');
    // Load initial doctors
    console.log('🚀 Loading initial doctors...');
    debouncedDoctorSearch('');
    
    // Load default clinic
    const loadDefaultClinic = async () => {
      try {
        const clinics = await superAdminApi.getEClinics({ page: 1, page_size: 10 });
        const defaultClinic = clinics.results.find(clinic => clinic.id === 'CLI002');
        if (defaultClinic) {
          setSelectedClinic(defaultClinic);
          console.log('🚀 Default clinic loaded:', defaultClinic);
        } else {
          console.error('🚀 Default clinic CLI002 not found, using fallback');
          // Fallback to a basic clinic object
          setSelectedClinic({ id: 'CLI002', name: 'Default Clinic' } as EClinic);
        }
      } catch (error) {
        console.error('🚀 Error loading default clinic:', error);
        // Fallback to a basic clinic object
        setSelectedClinic({ id: 'CLI002', name: 'Default Clinic' } as EClinic);
      }
    };
    
    loadDefaultClinic();
  }, [debouncedPatientSearch, debouncedDoctorSearch]);

  useEffect(() => {
    console.log('🚀 useEffect triggered:', {
      selectedDoctor: selectedDoctor?.user_name,
      selectedClinic: selectedClinic?.name,
      consultationDate: formData.consultationDate,
      allConditionsMet: !!(selectedDoctor && selectedClinic && formData.consultationDate)
    });
    
    if (selectedDoctor && selectedClinic && formData.consultationDate) {
      console.log('🚀 All conditions met, fetching slots...');
      fetchAvailableSlots(formData.consultationDate);
    } else {
      console.log('🚀 Conditions not met, skipping slot fetch');
    }
  }, [selectedDoctor, selectedClinic, formData.consultationDate]);

  // Remove clinic fetching since we're using default clinic

  // --- Handlers ---
  const handleInputChange = (field: string, value: any) => {
    console.log('🚀 handleInputChange called:', { field, value });
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('🚀 New form data:', newData);
      return newData;
    });
  };

  const handlePatientSelect = (patient: PatientProfile) => {
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, patientId: patient.user }));
    setPatientSearch(patient.user_name);
    setPatientOptions([]);
  };

  const handleDoctorSelect = (doctor: DoctorProfile) => {
    setSelectedDoctor(doctor);
    setFormData(prev => ({ 
      ...prev, 
      doctorId: doctor.user,
      consultationFee: doctor.consultation_fee.toString() // Auto-set consultation fee from doctor
    }));
    setDoctorSearch(doctor.user_name);
    setDoctorOptions([]);
  };

  const handleClinicSelect = (clinicId: string) => {
    // const clinic = clinicOptions.find(c => c.id.toString() === clinicId); // This line is removed
    // if (clinic) { // This line is removed
    //   setSelectedClinic(clinic); // This line is removed
    //   setFormData(prev => ({ ...prev, clinicId: clinic.id })); // This line is removed
    // } // This line is removed
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.selectedSlot) {
      toast.error("Please select a time slot.");
      return;
    }
    try {
      setIsSubmitting(true);
      
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
        clinic_id: assignedClinicId || 'CLI002', // Use the assigned clinic ID or fallback
        payment_method: formData.paymentMethod,
        payment_status: formData.paymentMethod === 'cash' ? 'paid' : 'pending',
      };

      console.log('Creating consultation with data:', consultationData);
      
      // Use the dynamic consultation creation endpoint that doesn't require slot_id
      const response = await api.post('/api/consultations/create-dynamic/', consultationData);
      const consultation = response.data.data;
      console.log('Consultation created:', consultation);
      
      // Store consultation data and meeting link
      setCreatedConsultation(consultation);
      setMeetingLink(consultation.doctor_meeting_link || '');
      
      // Generate receipt if cash payment
      if (formData.paymentMethod === 'cash') {
        try {
          const receipt = await adminConsultationApi.generateReceipt(consultation.id);
          console.log('Receipt generated:', receipt);
          setGeneratedReceipt(receipt);
          setShowReceiptModal(true);
          toast.success(`Consultation created and receipt generated (${receipt.receipt_number})`);
        } catch (receiptError) {
          console.error('Failed to generate receipt:', receiptError);
          toast.success('Consultation created successfully (receipt generation failed)');
          setShowSuccessModal(true);
        }
      } else {
        toast.success('Consultation created successfully');
        setShowSuccessModal(true);
      }
      
      // Reset form
      setFormData({
        patientId: '',
        doctorId: '',
        clinicId: assignedClinicId || 'CLI002',
        consultationType: 'video_call',
        consultationDate: undefined,
        selectedSlot: null,
        duration: '30',
        chiefComplaint: '',
        symptoms: '',
        consultationFee: '',
        paymentMethod: 'cash',
      });
      setSelectedPatient(null);
      setSelectedDoctor(null);
      setCurrentStep(1);
    } catch (error) {
      console.error('Failed to create consultation:', error);
      toast.error('Failed to create consultation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI Logic ---
  const STEPS = [
    { number: 1, title: 'Patient Information', icon: User },
    { number: 2, title: 'Doctor & Clinic', icon: Stethoscope },
    { number: 3, title: 'Schedule Appointment', icon: CalendarIcon },
    { number: 4, title: 'Consultation Details', icon: FileText },
  ];

  const nextStep = () => setCurrentStep(s => Math.min(s + 1, STEPS.length));
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return !!selectedPatient;
      case 2: return !!selectedDoctor; // Removed clinic check since we use default
      case 3: return !!formData.consultationDate && !!formData.selectedSlot;
      case 4: return formData.chiefComplaint.trim() !== '';
      default: return false;
    }
  };

  const renderStepContent = () => {
    const stepProps = {
        formData, handleInputChange, handlePatientSelect, handleDoctorSelect,
        patientSearch, setPatientSearch, doctorSearch, setDoctorSearch,
        patientOptions, doctorOptions,
        selectedPatient, setSelectedPatient, selectedDoctor, setSelectedDoctor, selectedClinic,
        doctorSlots, slotLoading,
    };
    
    return (
      <div key={currentStep} className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
        {currentStep === 1 && renderStep1(stepProps)}
        {currentStep === 2 && renderStep2(stepProps)}
        {currentStep === 3 && renderStep3(stepProps)}
        {currentStep === 4 && renderStep4(stepProps)}
      </div>
    );
  };

  return (
    <>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setCreatedConsultation(null);
          setMeetingLink('');
          onClose();
        }}
        patientName={selectedPatient?.user_name}
        doctorName={selectedDoctor?.user_name}
        appointmentTime={formData.consultationDate && formData.selectedSlot ? `${format(formData.consultationDate, 'MMMM dd, yyyy')} at ${formData.selectedSlot.startTime}` : ''}
        consultation={createdConsultation}
        meetingLink={meetingLink}
      />

      {/* Receipt Modal */}
      {showReceiptModal && generatedReceipt && (
        <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Payment Receipt</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Receipt Header */}
              <div className="text-center border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900">Sushrusa E-Clinic</h3>
                <p className="text-sm text-gray-600">Consultation Receipt</p>
                <p className="text-xs text-gray-500 mt-1">Receipt #: {generatedReceipt.receipt_number}</p>
              </div>
              
              {/* Receipt Details */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Patient:</span>
                  <span className="text-sm font-medium">{generatedReceipt.patient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Doctor:</span>
                  <span className="text-sm font-medium">{generatedReceipt.doctor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Clinic:</span>
                  <span className="text-sm font-medium">{generatedReceipt.clinic_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="text-sm font-medium">{new Date(generatedReceipt.receipt_data.consultation_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Time:</span>
                  <span className="text-sm font-medium">{generatedReceipt.receipt_data.consultation_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Method:</span>
                  <span className="text-sm font-medium capitalize">{generatedReceipt.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    generatedReceipt.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {generatedReceipt.payment_status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
              
              {/* Amount */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-xl font-bold text-green-600">{generatedReceipt.formatted_amount}</span>
                </div>
              </div>
              
              {/* Footer */}
              <div className="text-center text-xs text-gray-500 border-t pt-4">
                <p>Issued by: {generatedReceipt.issued_by_name}</p>
                <p>Date: {new Date(generatedReceipt.issued_at).toLocaleString()}</p>
                <p className="mt-2">Thank you for choosing Sushrusa E-Clinic!</p>
              </div>
            </div>
            
            <DialogFooter className="flex gap-2">
              {meetingLink && createdConsultation?.consultation_type === 'video_call' && (
                <Button 
                  onClick={() => {
                    window.open(meetingLink, '_blank', 'noopener,noreferrer');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowReceiptModal(false);
                  setGeneratedReceipt(null);
                  setCreatedConsultation(null);
                  setMeetingLink('');
                }}
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  // Print receipt
                  window.print();
                }}
              >
                Print Receipt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-orange-50 to-orange-100 p-4 sm:p-6 lg:p-8 font-sans">
        <header className="max-w-6xl mx-auto mb-6">
            <div className="flex items-center text-sm text-slate-500">
                <Home className="w-4 h-4 mr-2" />
                <span className="font-medium">Admin</span>
                <ChevronRight className="w-4 h-4 mx-1" />
                <span className="font-medium">Consultations</span>
                <ChevronRight className="w-4 h-4 mx-1" />
                <span className="font-semibold text-orange-600">New</span>
            </div>
        </header>

        <main className="max-w-6xl mx-auto">
          <Card className="w-full rounded-3xl border-0 bg-white/60 backdrop-blur-xl shadow-2xl shadow-orange-900/10 animate-in fade-in-50 slide-in-from-bottom-10 duration-700">
            <CardHeader className="p-8 border-b border-slate-200/80">
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl font-bold text-slate-800 tracking-tight">New Consultation</CardTitle>
                    <p className="mt-1 text-slate-500">Follow the steps below to schedule a new appointment.</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-500 hover:bg-slate-200/50 hover:text-slate-800">
                      <X className="h-6 w-6"/>
                  </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-8 lg:p-12">
              {/* Stepper */}
              <div className="mb-12">
                <div className="flex items-center">
                  {STEPS.map((step, index) => (
                    <React.Fragment key={step.number}>
                      <div className="flex flex-col items-center text-center w-24">
                        <div
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-500",
                            currentStep > step.number ? "border-green-500 bg-green-500 text-white" :
                            currentStep === step.number ? "border-orange-500 bg-orange-500 text-white scale-110 shadow-lg shadow-orange-500/30" :
                            "border-slate-300 bg-white text-slate-400"
                          )}
                        >
                          {currentStep > step.number ? <CheckCircle className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
                        </div>
                        <p className={cn("mt-2 text-xs font-semibold sm:text-sm", currentStep >= step.number ? "text-orange-600" : "text-slate-500")}>
                          {step.title}
                        </p>
                      </div>
                      {index < STEPS.length - 1 && (
                        <div className="h-1 flex-1 bg-slate-200 mx-2 sm:mx-4 rounded-full relative overflow-hidden">
                           <div className="h-full absolute left-0 top-0 rounded-full bg-orange-500 transition-transform duration-500" style={{ transform: currentStep > step.number ? 'translateX(0%)' : 'translateX(-100%)' }}></div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="min-h-[350px]">
                    {renderStepContent()}
                </div>

                <div className="mt-12 flex items-center justify-between border-t border-slate-200/80 pt-8">
                  <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1} className="h-12 px-6 text-lg rounded-xl border-2 border-slate-300 disabled:opacity-50 transition-transform hover:scale-105 active:scale-100">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  {currentStep < STEPS.length ? (
                    <Button type="button" onClick={nextStep} disabled={!canProceedToNext()} className="h-12 px-6 text-lg rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/30 disabled:bg-slate-300 disabled:shadow-none transition-all hover:scale-105 hover:bg-orange-600 active:scale-100">
                      Next Step
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting || !canProceedToNext()} className="h-12 px-8 text-lg rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/40 disabled:bg-slate-300 disabled:shadow-none transition-all hover:scale-105 active:scale-100">
                      {isSubmitting ? (
                        <div className="flex items-center"><div className="animate-spin rounded-full h-5 w-5 border-2 border-white/50 border-t-white mr-2"></div>Scheduling...</div>
                      ) : (
                        <><Sparkles className="w-5 h-5 mr-2" />Create Consultation</>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

// --- Step Renderer Functions ---

const renderStep1 = ({ patientSearch, setPatientSearch, patientOptions, handlePatientSelect, selectedPatient, setSelectedPatient, setFormData }: any) => (
  <div className="max-w-2xl mx-auto">
    <div className="relative">
      <FloatingLabelInput id="patient-search" label="Search Patient by Name or Phone" icon={Search} value={patientSearch} onChange={(e: any) => setPatientSearch(e.target.value)} disabled={!!selectedPatient}/>
      {patientOptions.length > 0 && !selectedPatient && (
        <div className="absolute z-10 mt-2 w-full space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-25">
          {patientOptions.map((p: PatientProfile) => (
            <div key={p.id} onClick={() => handlePatientSelect(p)} className="flex cursor-pointer items-center justify-between rounded-lg p-3 hover:bg-orange-50">
              <div>
                <p className="font-semibold text-slate-800">{p.user_name}</p>
                <p className="text-sm text-slate-500 flex items-center"><Phone className="w-3 h-3 mr-2"/>{p.user_phone}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </div>
          ))}
        </div>
      )}
    </div>
    {selectedPatient && (
      <div className="mt-6 flex items-center justify-between rounded-xl bg-green-50 p-4 border border-green-200 animate-in fade-in-50">
        <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100"><CheckCircle className="h-6 w-6 text-green-600" /></div>
            <div>
            <p className="font-bold text-green-800">Patient Selected</p>
            <p className="text-green-700">{selectedPatient.user_name}</p>
            </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { setSelectedPatient(null); setPatientSearch(''); setFormData((p:any) => ({...p, patientId: ''})) }}>Change</Button>
      </div>
    )}
  </div>
);

const renderStep2 = ({ doctorSearch, setDoctorSearch, doctorOptions, handleDoctorSelect, selectedDoctor, setSelectedDoctor, setFormData }: any) => (
  <div className="max-w-2xl mx-auto">
    <div className="relative">
      <FloatingLabelInput id="doctor-search" label="Search for a Doctor" icon={Stethoscope} value={doctorSearch} onChange={(e: any) => setDoctorSearch(e.target.value)} disabled={!!selectedDoctor} />
       {doctorOptions.length > 0 && !selectedDoctor && (
           <div className="absolute z-10 mt-2 w-full space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-25">
           {doctorOptions.map((d: DoctorProfile) => (
               <div key={d.user} onClick={() => handleDoctorSelect(d)} className="flex cursor-pointer items-center justify-between rounded-lg p-3 hover:bg-orange-50">
               <div>
                   <p className="font-semibold text-slate-800">{d.user_name}</p>
                   <p className="text-sm text-slate-500 flex items-center"><Star className="w-3 h-3 mr-2"/>{d.specialization}</p>
               </div>
               <ArrowRight className="h-5 w-5 text-slate-400" />
               </div>
           ))}
           </div>
       )}
    </div>
    {selectedDoctor && (
      <div className="mt-6 flex items-center justify-between rounded-xl bg-green-50 p-4 border border-green-200 animate-in fade-in-50">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100"><CheckCircle className="h-6 w-6 text-green-600" /></div>
          <div>
            <p className="font-bold text-green-800">Doctor Selected</p>
            <p className="text-green-700">{selectedDoctor.user_name}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { setSelectedDoctor(null); setDoctorSearch(''); setFormData((p:any) => ({...p, doctorId: ''}))}}>Change</Button>
      </div>
    )}
  </div>
);

const renderStep3 = ({ formData, handleInputChange, doctorSlots, slotLoading }: any) => (
  <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
    <div>
      <h3 className="font-bold text-slate-700 mb-2 text-lg">Select Date</h3>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full h-14 justify-start text-left font-normal text-base rounded-xl border-2 border-slate-300", !formData.consultationDate && "text-slate-500")}>
            <CalendarIcon className="mr-3 h-5 w-5" />
            {formData.consultationDate ? format(formData.consultationDate, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.consultationDate} onSelect={(d: any) => handleInputChange('consultationDate', d)} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus /></PopoverContent>
      </Popover>
    </div>
    <div>
      <h3 className="font-bold text-slate-700 mb-2 text-lg">Available Slots</h3>
      {slotLoading ? (
        <div className="flex items-center justify-center h-48 rounded-xl bg-slate-100/80"><div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-orange-500"></div></div>
      ) : doctorSlots.filter((slot: DoctorSlotFrontend) => slot.isAvailable).length > 0 ? (
        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2">
          {doctorSlots.filter((slot: DoctorSlotFrontend) => slot.isAvailable).map((slot: DoctorSlotFrontend, index: number) => (
            <button type="button" key={index} onClick={() => handleInputChange('selectedSlot', slot)} className={cn("rounded-lg p-3 text-center font-semibold transition-all duration-200 border-2", formData.selectedSlot?.startTime === slot.startTime ? "bg-orange-500 text-white border-orange-500 shadow-md scale-105" : "bg-white border-slate-200 hover:border-orange-400")}>
              {slot.startTime}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 rounded-xl bg-slate-100/80 text-slate-500">
            <Clock className="w-10 h-10 mb-2"/>
            <p className="font-semibold">No slots available.</p>
            <p className="text-sm">Please select another date.</p>
        </div>
      )}
    </div>
  </div>
);

const renderStep4 = ({ formData, handleInputChange }: any) => (
  <div className="space-y-6 max-w-2xl mx-auto">
    <FloatingLabelInput id="chief-complaint" label="Chief Complaint *" icon={FileText} value={formData.chiefComplaint} onChange={(e: any) => handleInputChange('chiefComplaint', e.target.value)} required />
    <div className="relative">
      <Textarea id="symptoms" placeholder=" " value={formData.symptoms} onChange={(e) => handleInputChange('symptoms', e.target.value)} className="peer min-h-[120px] w-full rounded-xl border-2 border-slate-300 bg-white/80 pt-5 text-base transition-colors focus:border-orange-500 focus:bg-white resize-none" />
      <label htmlFor="symptoms" className="absolute left-4 top-4 -translate-y-0 scale-100 cursor-text text-base text-slate-500 transition-all peer-placeholder-shown:scale-100 peer-focus:top-1 peer-focus:-translate-y-1/2 peer-focus:scale-75 peer-focus:text-xs peer-focus:text-orange-600">Symptoms (Optional)</label>
    </div>
    <div className="grid sm:grid-cols-2 gap-6">
      <FloatingLabelInput id="consultation-fee" label="Consultation Fee" icon={DollarSign} type="number" value={formData.consultationFee} onChange={(e: any) => handleInputChange('consultationFee', e.target.value)} disabled />
      <div>
        <FloatingLabelInput id="duration" label="Duration (minutes)" icon={Timer} value={formData.duration} disabled />
        <p className="text-xs text-slate-500 mt-1 pl-1">Duration is set by clinic.</p>
      </div>
    </div>
    
    <div className="grid sm:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
        <select 
          value={formData.paymentMethod} 
          onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="cash">Cash</option>
          <option value="online">Online Payment</option>
          <option value="card">Card</option>
          <option value="upi">UPI</option>
        </select>
        {formData.paymentMethod === 'cash' && (
          <p className="text-xs text-green-600 mt-1">Payment will be marked as completed</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Payment Status</label>
        <div className="px-3 py-2 bg-slate-100 rounded-lg">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            formData.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {formData.paymentMethod === 'cash' ? 'Completed' : 'Pending'}
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default NewConsultationPage;
