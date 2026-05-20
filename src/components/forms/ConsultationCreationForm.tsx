import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ChevronRight, CalendarIcon, Clock, User, Stethoscope, CheckCircle, ArrowRight, ArrowLeft, Search, Phone, Star, Timer, DollarSign, FileText, X, Video, Users, Plus, CreditCard, Smartphone, Banknote, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { debounce } from 'lodash';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// --- Restored Original API and Type Imports ---
import { adminPatientApi, doctorApi, superAdminApi, PatientProfile, DoctorProfile, EClinic, createConsultation, calculateAvailableSlots, adminConsultationApi, extractErrorMessage } from '@/lib/api';
import { api } from '@/lib/utils';
import { razorpayService } from '@/services/razorpayService';

// --- Restored Original Type Definition for Slots ---
// This defines the structure of a slot object after being processed for the frontend.
interface DoctorSlotFrontend {
  id: number;
  doctor: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  created_at: string;
  updated_at: string;
  type: 'available' | 'booked';
  booked_in_clinic?: string;
  booked_clinic_id?: string;
  booked_in_different_clinic?: boolean;
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

// Basic list of common chief complaints to quickly select from
const BASIC_COMPLAINTS: string[] = [
  'Fever',
  'Cough',
  'Cold',
  'Headache',
  'Back pain',
  'Stomach pain',
  'Sore throat',
  'Shortness of breath',
  'Chest pain',
  'Dizziness',
  'Nausea',
  'Vomiting',
  'Diarrhea',
  'Fatigue',
  'Body ache',
  'Ear pain',
  'Eye redness',
  'Skin rash',
  'Toothache',
  'Joint pain'
];


// Payment status type
type PaymentStatus = 'idle' | 'loading' | 'popup' | 'verifying' | 'success' | 'failed' | 'cancelled';

// --- Main Component ---
const NewConsultationPage = ({ onClose, assignedClinicId }: { onClose: () => void; assignedClinicId?: string }) => {
  console.log('🚀 NewConsultationPage props:', { assignedClinicId });
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    clinicId: 'CLI002', // Set default clinic ID - remove clinic selection
    consultationType: 'video_call', // From original code
    consultationDate: undefined as Date | undefined,
    selectedSlot: null as DoctorSlotFrontend | null,
    duration: '5', // Default to 5 minutes (doctor's consultation duration)
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
  // Payment gateway state
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);

  // UI State
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<EClinic | null>(null);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [patientOptions, setPatientOptions] = useState<PatientProfile[]>([]);
  const [doctorOptions, setDoctorOptions] = useState<DoctorProfile[]>([]);
  const [doctorSlots, setDoctorSlots] = useState<DoctorSlotFrontend[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);

  // Pagination state
  const [patientPage, setPatientPage] = useState(1);
  const [doctorPage, setDoctorPage] = useState(1);
  const [patientHasMore, setPatientHasMore] = useState(true);
  const [doctorHasMore, setDoctorHasMore] = useState(true);
  const [loadingMorePatients, setLoadingMorePatients] = useState(false);
  const [loadingMoreDoctors, setLoadingMoreDoctors] = useState(false);
  const [searchingPatients, setSearchingPatients] = useState(false);

  // --- Restored Original API Logic ---

  const debouncedPatientSearch = useMemo(() => debounce(async (query: string) => {
    try {
      console.log("🔍 Patient search query:", query);
      setSearchingPatients(true);

      // Reset pagination when search query changes
      setPatientPage(1);
      setPatientHasMore(true);

      if (!query) {
        // Load patients with pagination
        console.log("📋 Loading all patients (no search query)");
        const res = await adminPatientApi.getPatients({ page: 1, page_size: 20 });
        console.log("📋 All patients response:", res);
        setPatientOptions(Array.isArray(res?.results) ? res.results : []);
        setPatientHasMore(res?.count ? res.results.length < res.count : false);
        return;
      }

      // For search queries, use the getPatients API with search parameter
      // This supports searching by name, phone number, and other fields
      console.log("🔍 Searching patients with query:", query);

      // Try the main search first
      let results = await adminPatientApi.getPatients({
        page: 1,
        page_size: 50, // Get more results for search
        search: query
      });
      console.log("🔍 Search results:", results);

      // If no results and query looks like a phone number, try alternative search
      if ((!results?.results || results.results.length === 0) && /^\d+$/.test(query.replace(/\s+/g, ''))) {
        console.log("📱 Query looks like phone number, trying alternative search");

        // Try searching with cleaned phone number (remove spaces, dashes, etc.)
        const cleanQuery = query.replace(/[\s\-\(\)\+]/g, '');
        console.log("📱 Cleaned phone query:", cleanQuery);

        const altResults = await adminPatientApi.getPatients({
          page: 1,
          page_size: 50,
          search: cleanQuery
        });
        console.log("📱 Alternative search results:", altResults);

        if (altResults?.results && altResults.results.length > 0) {
          results = altResults;
        }
      }

      setPatientOptions(Array.isArray(results?.results) ? results.results : []);
      setPatientHasMore(false); // Search results don't need pagination
    } catch (e) {
      console.error("❌ Failed to search patients:", e);
      setPatientOptions([]);
      toast.error("Could not fetch patient data.");
    } finally {
      setSearchingPatients(false);
    }
  }, 400), []);

  const debouncedDoctorSearch = useMemo(() => debounce(async (query: string) => {
    try {
      // Reset pagination when search query changes
      setDoctorPage(1);
      setDoctorHasMore(true);

      if (!query) {
        // Load doctors with pagination
        const res = await doctorApi.getDoctors({ page: 1, page_size: 20 });
        console.log('Doctor API response (no filters):', res);
        setDoctorOptions(Array.isArray(res?.results) ? res.results : []);
        setDoctorHasMore(res?.count ? res.results.length < res.count : false);
        return;
      }
      // Search doctors
      const results = await doctorApi.getDoctors({ search: query });
      console.log('Doctor search response:', results);
      setDoctorOptions(Array.isArray(results?.results) ? results.results : []);
      setDoctorHasMore(results?.count ? results.results.length < results.count : false);
    } catch (e) {
      console.error("Failed to search doctors:", e);
      setDoctorOptions([]);
      toast.error("Could not fetch doctor data.");
    }
  }, 400), []);

  // Load more patients function
  const loadMorePatients = async () => {
    if (loadingMorePatients || !patientHasMore || patientSearch) return; // Don't load more during search

    try {
      setLoadingMorePatients(true);
      const nextPage = patientPage + 1;
      const res = await adminPatientApi.getPatients({ page: nextPage, page_size: 20 });

      if (Array.isArray(res?.results) && res.results.length > 0) {
        setPatientOptions(prev => [...prev, ...res.results]);
        setPatientPage(nextPage);
        setPatientHasMore(res?.count ? (patientOptions.length + res.results.length) < res.count : false);
      } else {
        setPatientHasMore(false);
      }
    } catch (e) {
      console.error("Failed to load more patients:", e);
      toast.error("Could not load more patients.");
    } finally {
      setLoadingMorePatients(false);
    }
  };

  // Load more doctors function
  const loadMoreDoctors = async () => {
    if (loadingMoreDoctors || !doctorHasMore || doctorSearch) return; // Don't load more during search

    try {
      setLoadingMoreDoctors(true);
      const nextPage = doctorPage + 1;
      const res = await doctorApi.getDoctors({ page: nextPage, page_size: 20 });

      if (Array.isArray(res?.results) && res.results.length > 0) {
        setDoctorOptions(prev => [...prev, ...res.results]);
        setDoctorPage(nextPage);
        setDoctorHasMore(res?.count ? (doctorOptions.length + res.results.length) < res.count : false);
      } else {
        setDoctorHasMore(false);
      }
    } catch (e) {
      console.error("Failed to load more doctors:", e);
      toast.error("Could not load more doctors.");
    } finally {
      setLoadingMoreDoctors(false);
    }
  };

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
        clinic_id: assignedClinicId,
        date: formattedDate,
      });

      console.log('🚀 About to call calculateAvailableSlots with:', {
        doctor_id: selectedDoctor.user,
        clinic_id: assignedClinicId,
        date: formattedDate,
      });

      const result = await calculateAvailableSlots({
        doctor_id: selectedDoctor.user,
        date: formattedDate,
        clinic_id: assignedClinicId, // Use the admin's assigned clinic ID
      });

      console.log('🚀 calculateAvailableSlots result:', result);

      const frontendSlots: DoctorSlotFrontend[] = result.slots.map((slot: any) => ({
        id: -1, // Temporary ID for calculated slots
        doctor: selectedDoctor.user.toString(),
        date: formattedDate,
        startTime: slot.start_time,
        endTime: slot.end_time,
        isAvailable: slot.is_available,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        type: slot.is_available ? 'available' : 'booked',
        booked_in_clinic: slot.booked_in_clinic,
        booked_clinic_id: slot.booked_clinic_id,
        booked_in_different_clinic: slot.booked_in_different_clinic,
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
        console.log('🚀 All clinics loaded:', clinics.results);
        const defaultClinic = clinics.results.find(clinic => clinic.id === 'CLI002');
        if (defaultClinic) {
          setSelectedClinic(defaultClinic);
          console.log('🚀 Default clinic loaded:', defaultClinic);
        } else {
          console.error('🚀 Default clinic CLI002 not found, using fallback');
          console.log('🚀 Available clinic IDs:', clinics.results.map(c => c.id));
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
    console.log('🚀 handlePatientSelect called with patient:', patient);
    setSelectedPatient(patient);
    // Use patient.user (user_id like "PAT002")
    // Fallback to patient.id if user is missing (some serializers might name it differently)
    const patientIdentifier = (patient.user || patient.id).toString();
    console.log('🚀 Selected patient identifier:', patientIdentifier);
    setFormData(prev => ({ ...prev, patientId: patientIdentifier }));
    setPatientSearch(patient.user_name || "");
    setPatientOptions([]);
  };

  const handleDoctorSelect = (doctor: DoctorProfile) => {
    console.log('🚀 handleDoctorSelect called with doctor:', doctor);
    setSelectedDoctor(doctor);
    // Use doctor.user (user_id like "DOC019")
    // Fallback to doctor.id if user is missing
    const doctorIdentifier = (doctor.user || doctor.id).toString();
    console.log('🚀 Selected doctor identifier:', doctorIdentifier);
    setFormData(prev => ({
      ...prev,
      doctorId: doctorIdentifier,
      consultationFee: doctor.consultation_fee.toString(),
      duration: (doctor.consultation_duration || 5).toString()
    }));
    setDoctorSearch(doctor.user_name || "");
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
      setPaymentError(null);

      // Basic amount validation for online payments
      const feeNum = parseFloat(formData.consultationFee) || 0;
      if (formData.paymentMethod !== 'cash' && feeNum < 1) {
        toast.error('Online payments must be at least ₹1.00. Please adjust the fee or use Cash payment.');
        setIsSubmitting(false);
        return;
      }

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
        clinic_id: assignedClinicId || 'CLI002',
        payment_method: formData.paymentMethod,
        payment_status: formData.paymentMethod === 'cash' ? 'paid' : 'pending',
      };

      console.log('🚀 Creating consultation with data:', consultationData);

      if (!consultationData.patient) {
        console.error('❌ CRITICAL ERROR: patientId is missing right before API call!', {
          formData_patientId: formData.patientId,
          selectedPatient: selectedPatient
        });
        toast.error('Internal Error: Patient selection lost. Please re-select the patient.');
        setIsSubmitting(false);
        return;
      }

      if (!consultationData.doctor) {
        console.error('❌ CRITICAL ERROR: doctorId is missing right before API call!', {
          formData_doctorId: formData.doctorId,
          selectedDoctor: selectedDoctor
        });
        toast.error('Internal Error: Doctor selection lost. Please re-select the doctor.');
        setIsSubmitting(false);
        return;
      }

      // Step 1: Create consultation on backend
      const response = await api.post('/api/consultations/create-dynamic/', consultationData);
      const consultation = response.data.data;
      console.log('Consultation created:', consultation);

      setCreatedConsultation(consultation);
      setMeetingLink(consultation.doctor_meeting_link || '');

      // Step 2: Handle payment based on method
      if (formData.paymentMethod === 'cash') {
        // Cash: generate receipt immediately
        try {
          const receipt = await adminConsultationApi.generateReceipt(consultation.id);
          setGeneratedReceipt(receipt);
          setShowReceiptModal(true);
          toast.success(`Consultation scheduled & receipt generated (${receipt.receipt_number})`);
        } catch (receiptError) {
          console.error('Failed to generate receipt:', receiptError);
          toast.success('Consultation created successfully');
          setShowSuccessModal(true);
        }
        resetForm();
      } else if (formData.paymentMethod === 'online' || formData.paymentMethod === 'razorpay') {
        // Online: move to payment step and trigger Razorpay
        setCurrentStep(5);
        await triggerRazorpayPayment(consultation);
      } else {
        // Card / UPI: move to payment step
        setCurrentStep(5);
        await triggerRazorpayPayment(consultation);
      }

    } catch (error) {
      const msg = extractErrorMessage(error);
      console.error('Failed to create consultation:', error);
      toast.error(msg || 'Failed to create consultation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger Razorpay payment for a created consultation
  const triggerRazorpayPayment = async (consultation: any) => {
    try {
      setPaymentStatus('loading');
      setPaymentError(null);

      const fee = parseFloat(formData.consultationFee) || 0;

      const verifyResponse = await razorpayService.initiatePayment(
        {
          amount: fee,
          currency: 'INR',
          consultation_id: consultation.id,
          description: `Consultation with ${consultation.doctor_name || 'Doctor'} on ${consultation.scheduled_date}`,
        },
        {
          name: selectedPatient?.user_name || consultation.patient_name || '',
          email: (selectedPatient as any)?.user_email || '',
          contact: selectedPatient?.user_phone || '',
        },
        (status) => setPaymentStatus(status)
      );

      // Payment successful
      setPaymentVerified(true);
      setPaymentStatus('success');
      toast.success('Payment successful! Consultation confirmed.');

      // Generate receipt after online payment too
      try {
        const receipt = await adminConsultationApi.generateReceipt(consultation.id);
        setGeneratedReceipt(receipt);
        setTimeout(() => {
          setShowReceiptModal(true);
        }, 1500);
      } catch (rErr) {
        console.error('Receipt error:', rErr);
      }

      resetForm();
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      if (msg === 'Payment cancelled by user') {
        setPaymentStatus('cancelled');
        setPaymentError('Payment was cancelled. You can retry or choose a different method.');
        toast.warning('Payment cancelled. The consultation has been created but payment is pending.');
      } else {
        setPaymentStatus('failed');
        setPaymentError(msg || 'Payment failed. Please retry or contact support.');
        toast.error(msg || 'Payment failed. Consultation created but payment pending.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      clinicId: assignedClinicId || 'CLI002',
      consultationType: 'video_call',
      consultationDate: undefined,
      selectedSlot: null,
      duration: '5',
      chiefComplaint: '',
      symptoms: '',
      consultationFee: '',
      paymentMethod: 'cash',
    });
    setSelectedPatient(null);
    setSelectedDoctor(null);
    setCurrentStep(1);
    setPaymentStatus('idle');
    setPaymentError(null);
    setPaymentVerified(false);
  };

  // --- UI Logic ---
  const STEPS = [
    { number: 1, title: 'Patient', icon: User },
    { number: 2, title: 'Doctor', icon: Stethoscope },
    { number: 3, title: 'Schedule', icon: CalendarIcon },
    { number: 4, title: 'Details', icon: FileText },
    { number: 5, title: 'Payment', icon: CreditCard },
  ];

  const nextStep = () => setCurrentStep(s => Math.min(s + 1, STEPS.length));
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return !!selectedPatient;
      case 2: return !!selectedDoctor;
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
      // Pagination props
      patientHasMore, loadingMorePatients, loadMorePatients,
      doctorHasMore, loadingMoreDoctors, loadMoreDoctors,
      // Search loading state
      searchingPatients,
    };

    return (
      <div key={currentStep} className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
        {currentStep === 1 && renderStep1(stepProps)}
        {currentStep === 2 && renderStep2(stepProps)}
        {currentStep === 3 && renderStep3({ ...stepProps, isDatePopoverOpen, setIsDatePopoverOpen })}
        {currentStep === 4 && renderStep4(stepProps)}
        {currentStep === 5 && renderStep5({
          formData,
          createdConsultation,
          paymentStatus,
          paymentError,
          paymentVerified,
          selectedPatient,
          triggerRazorpayPayment,
          resetForm,
        })}
      </div>
    );
  };

  const navigate = useNavigate();

  return (
    <>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setCreatedConsultation(null);
          setMeetingLink('');
          navigate('/dashboard/consultations');
        }}
        patientName={
          selectedPatient?.user_name ||
          createdConsultation?.patient_name ||
          createdConsultation?.patient?.name ||
          'Patient'
        }
        doctorName={
          selectedDoctor?.user_name ||
          createdConsultation?.doctor_name ||
          createdConsultation?.doctor?.name ||
          'Doctor'
        }
        appointmentTime={
          formData.consultationDate && formData.selectedSlot
            ? `${format(formData.consultationDate, 'MMMM dd, yyyy')} at ${formData.selectedSlot.startTime}`
            : createdConsultation?.scheduled_date && createdConsultation?.scheduled_time
              ? `${createdConsultation.scheduled_date} at ${createdConsultation.scheduled_time}`
              : ''
        }
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
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${generatedReceipt.payment_status === 'paid'
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

      {/* Compact Admin-Style Layout */}
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Admin</span>
              <ChevronRight className="w-4 h-4" />
              <span>Consultations</span>
              <ChevronRight className="w-4 h-4" />
              <span className="font-medium text-gray-900">New Consultation</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto p-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Create New Consultation</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Schedule a consultation appointment</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Step {currentStep} of {STEPS.length}
                </Badge>
              </div>

              {/* Compact Stepper */}
              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  {STEPS.map((step, index) => (
                    <React.Fragment key={step.number}>
                      <div className="flex items-center">
                        <div
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all",
                            currentStep > step.number ? "bg-green-500 text-white" :
                              currentStep === step.number ? "bg-blue-500 text-white" :
                                "bg-gray-200 text-gray-600"
                          )}
                        >
                          {currentStep > step.number ? <CheckCircle className="h-3 w-3" /> : step.number}
                        </div>
                        <span className={cn(
                          "ml-2 text-xs font-medium",
                          currentStep >= step.number ? "text-gray-900" : "text-gray-500"
                        )}>
                          {step.title}
                        </span>
                      </div>
                      {index < STEPS.length - 1 && (
                        <ChevronRight className="w-3 h-3 text-gray-400 mx-2" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <form onSubmit={handleSubmit}>
                <div className="min-h-[300px]">
                  {renderStepContent()}
                </div>

                {/* Compact Navigation */}
                {currentStep < 5 && (
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="text-sm"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>

                    {currentStep < 4 ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={nextStep}
                        disabled={!canProceedToNext()}
                        className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Next
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isSubmitting || !canProceedToNext()}
                        className={cn(
                          "text-sm text-white",
                          formData.paymentMethod === 'cash'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-[#E17726] hover:bg-[#c9651e]'
                        )}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : formData.paymentMethod === 'cash' ? (
                          <>
                            <Banknote className="w-4 h-4 mr-1" />
                            Create & Mark Paid
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-1" />
                            Create & Pay Online
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

// --- Step Renderer Functions ---

const renderStep1 = ({ patientSearch, setPatientSearch, patientOptions, handlePatientSelect, selectedPatient, setSelectedPatient, setFormData, patientHasMore, loadingMorePatients, loadMorePatients, searchingPatients }: any) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Search Patient</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or phone number..."
          value={patientSearch}
          onChange={(e) => setPatientSearch(e.target.value)}
          disabled={!!selectedPatient}
          className="pl-10 h-9 text-sm"
        />
        {searchingPatients && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-[#E17726] rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>

    {/* Patient List - More Visible */}
    {!selectedPatient && (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Available Patients</h4>
          <span className="text-xs text-gray-500">{patientOptions.length} found</span>
        </div>
        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          {patientOptions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {patientOptions.map((p: PatientProfile) => (
                <div
                  key={p.id}
                  onClick={() => handlePatientSelect(p)}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.user_name}</p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {p.user_phone}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No patients found</p>
              <p className="text-xs">Try searching with a different term</p>
            </div>
          )}
        </div>

        {/* Load More Patients Button */}
        {patientHasMore && !patientSearch && (
          <div className="mt-2 text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadMorePatients}
              disabled={loadingMorePatients}
              className="w-full text-xs"
            >
              {loadingMorePatients ? (
                <>
                  <div className="w-3 h-3 mr-2 border border-gray-300 border-t-transparent rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                `Load More Patients (${patientOptions.length} shown)`
              )}
            </Button>
          </div>
        )}
      </div>
    )}

    {/* Selected Patient */}
    {selectedPatient && (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Patient Selected</p>
              <p className="text-sm text-green-700">{selectedPatient.user_name}</p>
              <p className="text-xs text-green-600">{selectedPatient.user_phone}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedPatient(null);
              setPatientSearch('');
              setFormData((p: any) => ({ ...p, patientId: '' }))
            }}
            className="text-green-700 hover:text-green-800 hover:bg-green-100"
          >
            Change
          </Button>
        </div>
      </div>
    )}
  </div>
);

const renderStep2 = ({ doctorSearch, setDoctorSearch, doctorOptions, handleDoctorSelect, selectedDoctor, setSelectedDoctor, setFormData, doctorHasMore, loadingMoreDoctors, loadMoreDoctors }: any) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Search Doctor</label>
      <div className="relative">
        <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or specialization..."
          value={doctorSearch}
          onChange={(e) => setDoctorSearch(e.target.value)}
          disabled={!!selectedDoctor}
          className="pl-10 h-9 text-sm"
        />
      </div>
    </div>

    {/* Doctor List - More Visible */}
    {!selectedDoctor && (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Available Doctors</h4>
          <span className="text-xs text-gray-500">{doctorOptions.length} found</span>
        </div>
        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          {doctorOptions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {doctorOptions.map((d: DoctorProfile) => (
                <div
                  key={d.user}
                  onClick={() => handleDoctorSelect(d)}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{d.user_name}</p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        {d.specialization}
                      </p>
                      <p className="text-xs text-gray-400">
                        Fee: ${d.consultation_fee} • Duration: {d.consultation_duration || 15} min
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Stethoscope className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No doctors found</p>
              <p className="text-xs">Try searching with a different term</p>
            </div>
          )}
        </div>

        {/* Load More Doctors Button */}
        {doctorHasMore && !doctorSearch && (
          <div className="mt-2 text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadMoreDoctors}
              disabled={loadingMoreDoctors}
              className="w-full text-xs"
            >
              {loadingMoreDoctors ? (
                <>
                  <div className="w-3 h-3 mr-2 border border-gray-300 border-t-transparent rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                `Load More Doctors (${doctorOptions.length} shown)`
              )}
            </Button>
          </div>
        )}
      </div>
    )}

    {/* Selected Doctor */}
    {selectedDoctor && (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Doctor Selected</p>
              <p className="text-sm text-green-700">{selectedDoctor.user_name}</p>
              <p className="text-xs text-green-600">{selectedDoctor.specialization}</p>
              <p className="text-xs text-green-500">
                Fee: ${selectedDoctor.consultation_fee} • Duration: {selectedDoctor.consultation_duration || 15} min
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedDoctor(null);
              setDoctorSearch('');
              setFormData((p: any) => ({ ...p, doctorId: '' }))
            }}
            className="text-green-700 hover:text-green-800 hover:bg-green-100"
          >
            Change
          </Button>
        </div>
      </div>
    )}
  </div>
);

const renderStep3 = ({ formData, handleInputChange, doctorSlots, slotLoading, isDatePopoverOpen, setIsDatePopoverOpen }: any) => (
  <div className="space-y-6">
    {/* Date Selection */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
      <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-9 justify-start text-left text-sm border border-gray-300",
              !formData.consultationDate && "text-gray-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formData.consultationDate ? format(formData.consultationDate, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={formData.consultationDate}
            onSelect={(d: any) => { handleInputChange('consultationDate', d); setIsDatePopoverOpen(false); }}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>

    {/* Time Slots */}
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">Available Time Slots</label>
        {formData.consultationDate && (
          <span className="text-xs text-gray-500">
            {format(formData.consultationDate, "EEEE, MMMM dd, yyyy")}
          </span>
        )}
      </div>

      {slotLoading ? (
        <div className="flex items-center justify-center h-32 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500"></div>
            <span className="text-sm">Loading available slots...</span>
          </div>
        </div>
      ) : doctorSlots.length > 0 ? (
        <>
          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
            {doctorSlots.map((slot: DoctorSlotFrontend, index: number) => (
              <div key={index} className="relative group">
                <button
                  type="button"
                  onClick={() => slot.isAvailable ? handleInputChange('selectedSlot', slot) : null}
                  disabled={!slot.isAvailable}
                  className={cn(
                    "w-full rounded-md p-2 text-center text-sm font-medium transition-all duration-200 border relative",
                    slot.isAvailable && formData.selectedSlot?.startTime === slot.startTime
                      ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                      : slot.isAvailable
                        ? "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        : "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                  )}
                  title={!slot.isAvailable && slot.booked_in_different_clinic
                    ? `Already booked in ${slot.booked_in_clinic}`
                    : !slot.isAvailable
                      ? 'Already booked'
                      : ''}
                >
                  {slot.isAvailable ? (
                    slot.startTime
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="line-through text-gray-400">{slot.startTime}</span>
                      <span className="text-[10px] text-gray-500 font-normal mt-0.5">
                        {slot.booked_in_different_clinic ? 'Booked' : 'Unavailable'}
                      </span>
                    </div>
                  )}
                </button>
                {!slot.isAvailable && slot.booked_in_clinic && (
                  <div className="hidden group-hover:block absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap">
                    Already booked in {slot.booked_in_clinic}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
              <span>Already Booked</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Selected</span>
            </div>
          </div>
        </>
      ) : formData.consultationDate ? (
        <div className="flex flex-col items-center justify-center h-32 border border-gray-200 rounded-lg bg-gray-50 text-gray-500">
          <Clock className="w-6 h-6 mb-2" />
          <p className="text-sm font-medium">No slots available</p>
          <p className="text-xs">Please select another date</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-32 border border-gray-200 rounded-lg bg-gray-50 text-gray-500">
          <CalendarIcon className="w-6 h-6 mb-2" />
          <p className="text-sm font-medium">Select a date first</p>
          <p className="text-xs">Available slots will appear here</p>
        </div>
      )}
    </div>

    {/* Selected Slot Display */}
    {formData.selectedSlot && (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-800">Time Slot Selected</p>
            <p className="text-sm text-blue-700">
              {formData.selectedSlot.startTime} - {formData.selectedSlot.endTime}
            </p>
          </div>
        </div>
      </div>
    )}
  </div>
);

const renderStep4 = ({ formData, handleInputChange }: any) => (
  <div className="space-y-4">
    {/* Chief Complaint */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Chief Complaint *</label>
      <div className="space-y-2">
        <Select value={formData.chiefComplaint} onValueChange={(value) => handleInputChange('chiefComplaint', value)}>
          <SelectTrigger className="w-full h-9 text-sm border border-gray-300">
            <SelectValue placeholder="Choose a common complaint" />
          </SelectTrigger>
          <SelectContent>
            {BASIC_COMPLAINTS.map((complaint) => (
              <SelectItem key={complaint} value={complaint}>{complaint}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Or enter custom complaint..."
          value={formData.chiefComplaint}
          onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
          className="h-9 text-sm"
        />
      </div>
    </div>

    {/* Symptoms */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms (Optional)</label>
      <Textarea
        placeholder="Describe symptoms in detail..."
        value={formData.symptoms}
        onChange={(e) => handleInputChange('symptoms', e.target.value)}
        className="min-h-[80px] text-sm border border-gray-300 resize-none"
      />
    </div>

    {/* Fee and Duration */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee (₹)</label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="number"
            value={formData.consultationFee}
            disabled
            className="pl-10 h-9 text-sm bg-gray-50 font-semibold"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
        <div className="relative">
          <Timer className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={`${formData.duration} minutes`}
            disabled
            className="pl-10 h-9 text-sm bg-gray-50"
          />
        </div>
      </div>
    </div>

    {/* Consultation Type */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Type</label>
      <Select value={formData.consultationType} onValueChange={(value) => handleInputChange('consultationType', value)}>
        <SelectTrigger className="w-full h-9 text-sm border border-gray-300">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="video_call">Video Call</SelectItem>
          <SelectItem value="phone_call">Phone Call</SelectItem>
          <SelectItem value="in_person">In Person</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Payment Method Selection - Full width, prominent */}
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-3">Payment Method *</label>
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: 'cash', label: 'Cash', icon: Banknote, color: 'green', desc: 'Mark as paid instantly' },
          { value: 'online', label: 'Online (Razorpay)', icon: CreditCard, color: 'purple', desc: 'UPI / Card / Net Banking' },
        ].map(({ value, label, icon: Icon, color, desc }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleInputChange('paymentMethod', value)}
            className={cn(
              'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 text-center cursor-pointer',
              formData.paymentMethod === value
                ? color === 'green'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            <Icon className={cn(
              'w-7 h-7 mb-2',
              formData.paymentMethod === value
                ? color === 'green' ? 'text-green-600' : 'text-purple-600'
                : 'text-gray-400'
            )} />
            <span className={cn(
              'text-sm font-semibold',
              formData.paymentMethod === value
                ? color === 'green' ? 'text-green-800' : 'text-purple-800'
                : 'text-gray-600'
            )}>{label}</span>
            <span className={cn(
              'text-xs mt-0.5',
              formData.paymentMethod === value
                ? color === 'green' ? 'text-green-600' : 'text-purple-500'
                : 'text-gray-400'
            )}>{desc}</span>
          </button>
        ))}
      </div>
    </div>

    {/* Dynamic info box based on payment method */}
    {formData.paymentMethod === 'cash' ? (
      <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
        <Banknote className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-800">Cash Payment</p>
          <p className="text-xs text-green-700 mt-0.5">Consultation will be marked as <strong>Paid</strong> immediately and a receipt will be generated.</p>
        </div>
      </div>
    ) : (
      <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <ShieldCheck className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-purple-800">Online Payment via Razorpay</p>
          <p className="text-xs text-purple-700 mt-0.5">Razorpay payment portal will open after scheduling. Supports UPI, Credit/Debit Card, Net Banking, and Wallets. Amount: <strong>₹{formData.consultationFee}</strong></p>
        </div>
      </div>
    )}

    {/* Final Summary */}
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4 text-[#E17726]" />
        Consultation Summary
      </h4>
      <div className="space-y-1.5 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Type:</span>
          <span className="font-medium capitalize">{formData.consultationType?.replace('_', ' ')}</span>
        </div>
        <div className="flex justify-between">
          <span>Fee:</span>
          <span className="font-semibold text-green-700">₹{formData.consultationFee}</span>
        </div>
        <div className="flex justify-between">
          <span>Duration:</span>
          <span className="font-medium">{formData.duration} minutes</span>
        </div>
        <div className="flex justify-between">
          <span>Payment:</span>
          <span className={cn(
            'font-medium px-1.5 py-0.5 rounded-full text-[10px]',
            formData.paymentMethod === 'cash'
              ? 'bg-green-100 text-green-800'
              : 'bg-purple-100 text-purple-800'
          )}>
            {formData.paymentMethod === 'cash' ? 'Cash (Paid)' : 'Online (Razorpay)'}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// Step 5: Payment Processing / Status
const renderStep5 = ({ formData, createdConsultation, paymentStatus, paymentError, paymentVerified, selectedPatient, triggerRazorpayPayment, resetForm }: any) => {
  const fee = parseFloat(formData.consultationFee) || 0;

  const statusConfig: Record<PaymentStatus, { icon: React.ReactNode; title: string; subtitle: string; color: string; bgColor: string }> = {
    idle: {
      icon: <CreditCard className="w-12 h-12" />,
      title: 'Ready to Process Payment',
      subtitle: 'Click "Pay Now" to open the Razorpay payment gateway.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
    },
    loading: {
      icon: <Loader2 className="w-12 h-12 animate-spin" />,
      title: 'Preparing Payment...',
      subtitle: 'Setting up your payment. Please wait.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
    },
    popup: {
      icon: <Smartphone className="w-12 h-12" />,
      title: 'Payment Portal Open',
      subtitle: 'Complete the payment in the Razorpay popup window.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-200',
    },
    verifying: {
      icon: <ShieldCheck className="w-12 h-12 animate-pulse" />,
      title: 'Verifying Payment...',
      subtitle: 'Please wait while we confirm your payment with our server.',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-200',
    },
    success: {
      icon: <CheckCircle className="w-12 h-12" />,
      title: 'Payment Successful!',
      subtitle: 'Consultation confirmed and payment recorded.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-200',
    },
    failed: {
      icon: <AlertCircle className="w-12 h-12" />,
      title: 'Payment Failed',
      subtitle: 'There was an issue processing your payment.',
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200',
    },
    cancelled: {
      icon: <AlertCircle className="w-12 h-12" />,
      title: 'Payment Cancelled',
      subtitle: 'The payment was cancelled. Consultation is created but payment is pending.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200',
    },
  };

  const config = statusConfig[paymentStatus as PaymentStatus] || statusConfig.idle;

  return (
    <div className="space-y-6 py-2">
      {/* Payment Status Card */}
      <div className={cn('flex flex-col items-center justify-center p-8 rounded-2xl border-2 text-center', config.bgColor)}>
        <div className={cn('mb-4', config.color)}>
          {config.icon}
        </div>
        <h3 className={cn('text-lg font-bold mb-1', config.color)}>{config.title}</h3>
        <p className="text-sm text-gray-600">{config.subtitle}</p>
      </div>

      {/* Consultation & Amount Info */}
      {createdConsultation && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-800 border-b pb-2">Consultation Details</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Patient</span>
              <p className="font-medium text-gray-800">{createdConsultation.patient_name}</p>
            </div>
            <div>
              <span className="text-gray-500">Doctor</span>
              <p className="font-medium text-gray-800">{createdConsultation.doctor_name}</p>
            </div>
            <div>
              <span className="text-gray-500">Date & Time</span>
              <p className="font-medium text-gray-800">{createdConsultation.scheduled_date} {createdConsultation.scheduled_time}</p>
            </div>
            <div>
              <span className="text-gray-500">Amount</span>
              <p className="font-bold text-emerald-700 text-sm">₹{fee.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {paymentError && (
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{paymentError}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Retry / Pay Now */}
        {(paymentStatus === 'idle' || paymentStatus === 'failed' || paymentStatus === 'cancelled') && (
          <Button
            className="w-full h-12 text-base font-semibold bg-[#E17726] hover:bg-[#c9651e] text-white rounded-xl shadow-md hover:shadow-lg transition-all"
            onClick={() => triggerRazorpayPayment(createdConsultation)}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {paymentStatus === 'idle' ? `Pay Now — ₹${fee.toFixed(2)}` : `Retry Payment — ₹${fee.toFixed(2)}`}
          </Button>
        )}

        {/* Success — go to consultations */}
        {paymentStatus === 'success' && (
          <Button
            className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            onClick={resetForm}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Done — View Consultations
          </Button>
        )}

        {/* Skip payment (for cancelled/failed — consultation still exists) */}
        {(paymentStatus === 'failed' || paymentStatus === 'cancelled') && (
          <Button
            variant="outline"
            className="w-full h-10 text-sm border-gray-300 text-gray-600"
            onClick={resetForm}
          >
            Skip Payment (Mark as Pending)
          </Button>
        )}
      </div>

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck className="w-4 h-4" />
        <span>Secured by Razorpay — 256-bit SSL encrypted</span>
      </div>
    </div>
  );
};

export default NewConsultationPage;
