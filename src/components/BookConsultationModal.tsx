/**
 * BookConsultationModal
 * ──────────────────────────────────────────────────────────────────────────
 * A 4-step premium modal for booking a consultation with integrated
 * Razorpay payment:
 *   Step 1 – Choose a doctor  (fetches from public API)
 *   Step 2 – Pick a slot / set details
 *   Step 3 – Review & Pay (Razorpay popup)
 *   Step 4 – Confirmation screen
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Star,
  Clock,
  MapPin,
  Video,
  Users,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Loader2,
  CreditCard,
  Shield,
  Zap,
  AlertCircle,
  XCircle,
  User,
  Stethoscope,
  CalendarDays,
  IndianRupee,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';
import { razorpayService } from '@/services/razorpayService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { createConsultation, calculateAvailableSlots } from '@/lib/api';

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface Doctor {
  id: number;
  user_id: string;
  name: string;
  specialization: string;
  sub_specialization?: string;
  experience_years: number | string;
  consultation_fee: number | string;
  online_consultation_fee?: number;
  languages_spoken?: string | string[];
  bio?: string;
  rating: number | string;
  total_reviews: number | string;
  clinic_name?: string;
  clinic_address?: string;
  consultation_types: string[];
  is_online_consultation_available: boolean;
  consultation_duration: number;
  profile_picture?: string;
}

type ConsultationType = 'video' | 'in_person' | 'audio';

type PaymentStatus =
  | 'idle'
  | 'loading'
  | 'popup'
  | 'verifying'
  | 'success'
  | 'failed'
  | 'cancelled';

type Step = 1 | 2 | 3 | 4;

interface BookingDetails {
  doctor: Doctor | null;
  consultationType: ConsultationType;
  preferredDate: string;
  preferredTime: string;
  chiefComplaint: string;
  symptoms: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onBookingComplete?: (paymentData: {
    doctorName: string;
    amount: number;
    paymentId: string;
  }) => void;
  // Optional pre-selected doctor
  initialDoctor?: Doctor | null;
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

const safeNum = (v: string | number | null | undefined): number => {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

const tomorrow = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
];

const STEP_LABELS: Record<Step, string> = {
  1: 'Choose Doctor',
  2: 'Appointment Details',
  3: 'Review & Pay',
  4: 'Confirmation',
};

// ──────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────

const StepIndicator = ({ current }: { current: Step }) => (
  <div className="flex items-center justify-between mb-6 px-2">
    {([1, 2, 3, 4] as Step[]).map((step, idx) => (
      <React.Fragment key={step}>
        <div className="flex flex-col items-center gap-1">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              step < current
                ? 'bg-green-500 text-white shadow-green-200 shadow-md'
                : step === current
                ? 'bg-gradient-to-br from-[#E17726] to-[#FF8A56] text-white shadow-orange-200 shadow-md'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {step < current ? <CheckCircle className="w-4 h-4" /> : step}
          </div>
          <span
            className={`text-xs font-medium hidden sm:block ${
              step === current ? 'text-[#E17726]' : step < current ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            {STEP_LABELS[step]}
          </span>
        </div>
        {idx < 3 && (
          <div
            className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${
              step < current ? 'bg-green-400' : 'bg-gray-200'
            }`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

const DoctorCard = ({
  doctor,
  selected,
  onSelect,
}: {
  doctor: Doctor;
  selected: boolean;
  onSelect: () => void;
}) => {
  const fee = safeNum(doctor.consultation_fee);
  const rating = safeNum(doctor.rating);
  const reviews = safeNum(doctor.total_reviews);
  const exp = safeNum(doctor.experience_years);

  const initials = doctor.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-lg group ${
        selected
          ? 'border-[#E17726] bg-orange-50 shadow-md shadow-orange-100'
          : 'border-gray-100 bg-white hover:border-[#E17726]/40'
      }`}
      id={`doctor-card-${doctor.id}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            {doctor.profile_picture ? (
              <img src={doctor.profile_picture} alt={doctor.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#E17726] to-[#FF8A56] flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
            )}
          </div>
          {doctor.is_online_consultation_available && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">{doctor.name}</p>
              <p className="text-[#E17726] font-semibold text-xs mt-0.5">{doctor.specialization}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-black text-gray-900 text-base">₹{fee.toLocaleString()}</p>
              <p className="text-xs text-gray-400">per visit</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              {rating.toFixed(1)} ({reviews})
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {exp}y exp
            </span>
            {doctor.consultation_types?.includes('video') && (
              <span className="flex items-center gap-1 text-blue-600">
                <Video className="w-3 h-3" />
                Online
              </span>
            )}
          </div>

          {doctor.clinic_address && (
            <p className="flex items-center gap-1 text-xs text-gray-400 mt-1 truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {doctor.clinic_address}
            </p>
          )}
        </div>
      </div>

      {selected && (
        <div className="mt-2 flex items-center gap-1.5 text-[#E17726] text-xs font-semibold">
          <CheckCircle className="w-3.5 h-3.5" />
          Selected
        </div>
      )}
    </button>
  );
};

// ──────────────────────────────────────────────────────────────
// Main Modal
// ──────────────────────────────────────────────────────────────

const BookConsultationModal: React.FC<Props> = ({
  open,
  onClose,
  onBookingComplete,
  initialDoctor,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // ── Step management ──
  const [step, setStep] = useState<Step>(initialDoctor ? 2 : 1);

  // ── Step 1: Doctor selection ──
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorSpecialty, setDoctorSpecialty] = useState('All');

  // ── Booking details ──
  const [booking, setBooking] = useState<BookingDetails>({
    doctor: initialDoctor || null,
    consultationType: 'video',
    preferredDate: tomorrow(),
    preferredTime: '10:00',
    chiefComplaint: '',
    symptoms: '',
  });

  // ── Payment ──
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentResult, setPaymentResult] = useState<{
    paymentId: string;
    amount: number;
    razorpayPaymentId: string;
    completedAt: string;
  } | null>(null);
  const [paymentError, setPaymentError] = useState<string>('');
  
  // ── Available Slots ──
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);

  const fetchAvailableSlots = useCallback(async () => {
    if (!booking.doctor || !booking.preferredDate) return;
    
    setIsSlotsLoading(true);
    try {
      const data = await calculateAvailableSlots({
        doctor_id: booking.doctor.id, 
        date: booking.preferredDate,
      });
      // Extract times that are marked as available
      const enabledTimes = data.slots
        .filter(s => s.is_available)
        .map(s => s.start_time.substring(0, 5));
      setAvailableSlots(enabledTimes);
      
      // If current selected time is not in available list, pick the first available one
      if (enabledTimes.length > 0 && !enabledTimes.includes(booking.preferredTime)) {
        setBooking(prev => ({ ...prev, preferredTime: enabledTimes[0] }));
      }
    } catch (e) {
      console.error('Error fetching available slots:', e);
      // Fallback to all slots if API fails, but ideally we show error
      setAvailableSlots(TIME_SLOTS);
    } finally {
      setIsSlotsLoading(false);
    }
  }, [booking.doctor?.id, booking.preferredDate]);

  useEffect(() => {
    if (open && step === 2 && booking.doctor) {
      fetchAvailableSlots();
    }
  }, [open, step, booking.doctor?.id, booking.preferredDate, fetchAvailableSlots]);

  // ── Load doctors ──
  const fetchDoctors = useCallback(async () => {
    setDoctorsLoading(true);
    try {
      const params = new URLSearchParams({ page: '1', page_size: '20', ordering: 'rating' });
      if (doctorSearch) params.set('search', doctorSearch);
      if (doctorSpecialty !== 'All') params.set('specialization', doctorSpecialty);

      const res = await fetch(`${API_BASE_URL}/api/doctors/public/?${params}`);
      const data = await res.json();

      let list: Doctor[] = [];
      if (data.results?.success) list = data.results.data || [];
      else if (data.success) list = data.data?.results || data.data || [];
      else if (Array.isArray(data.results)) list = data.results;
      setDoctors(list);
    } catch (e) {
      console.error('Error fetching doctors:', e);
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  }, [doctorSearch, doctorSpecialty]);

  useEffect(() => {
    if (open && step === 1) fetchDoctors();
  }, [open, step, fetchDoctors]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep(initialDoctor ? 2 : 1);
      setBooking((prev) => ({ ...prev, doctor: initialDoctor || null }));
      setPaymentStatus('idle');
      setPaymentResult(null);
      setPaymentError('');
    }
  }, [open, initialDoctor]);

  // ── Navigation ──
  const goNext = () => setStep((s) => Math.min(s + 1, 4) as Step);
  const goPrev = () => setStep((s) => Math.max(s - 1, 1) as Step);

  const canProceedStep1 = !!booking.doctor;
  const canProceedStep2 =
    booking.preferredDate && booking.preferredTime && booking.chiefComplaint.trim().length >= 3;

  // ── Payment handler ──
  const handlePay = async () => {
    if (!booking.doctor) return;
    setPaymentError('');

    const consultationFee = safeNum(booking.doctor.consultation_fee);
    const description = `Consultation with ${booking.doctor.name} - ${booking.consultationType}`;

    try {
      setPaymentStatus('creating_order');
      // Create backend consultation first
      const consultation = await createConsultation({
        patient: user?.id || '', 
        doctor: booking.doctor.user_id, // Safely use the User table ID instead of Profile ID
        consultation_type: booking.consultationType === 'video' ? 'video_call' : 'in_person',
        scheduled_date: booking.preferredDate || '',
        scheduled_time: booking.preferredTime || '',
        duration: 30,
        chief_complaint: booking.chiefComplaint || 'Routine consultation',
        symptoms: booking.symptoms || '',
        consultation_fee: consultationFee,
      });

      const result = await razorpayService.initiatePayment(
        {
          amount: consultationFee,
          description,
          consultation_id: consultation.id,
        },
        {
          name: user?.name || '',
          contact: user?.phone || '',
        },
        (status) => {
          setPaymentStatus(status);
          if (status === 'popup') {
            toast({ title: 'Payment window opened', description: 'Complete your payment in the popup.' });
          }
          if (status === 'verifying') {
            toast({ title: 'Verifying payment…', description: 'Please wait.' });
          }
        }
      );

      setPaymentResult({
        paymentId: result.data.payment_id,
        amount: result.data.amount,
        razorpayPaymentId: result.data.razorpay_payment_id,
        completedAt: result.data.completed_at,
      });

      setStep(4);

      onBookingComplete?.({
        doctorName: booking.doctor.name,
        amount: consultationFee,
        paymentId: result.data.payment_id,
      });

      toast({
        title: '✅ Payment Successful!',
        description: `₹${consultationFee} paid for consultation with ${booking.doctor.name}.`,
      });
    } catch (err: any) {
      let errMsg = 'Payment failed';

      if (err.response?.data?.error?.code === 'VALIDATION_ERROR') {
        const details = err.response.data.error.details;
        if (details?.non_field_errors?.[0]?.toLowerCase().includes('conflict')) {
          errMsg = 'This time slot is already booked by another patient. Please choose a different time slot.';
        } else {
          errMsg = err.response.data.error.message || 'Invalid data provided';
        }
      } else {
        errMsg = err.response?.data?.error?.message || (err instanceof Error ? err.message : 'Payment failed');
      }

      if (errMsg !== 'Payment cancelled by user') {
        setPaymentError(errMsg);
        toast({ title: 'Booking Failed', description: errMsg, variant: 'destructive' });
      } else {
        toast({ title: 'Payment Cancelled', description: 'You cancelled the payment.' });
      }
    }
  };

  const SPECIALTIES = [
    'All', 'Cardiology', 'Dermatology', 'General Medicine', 'Pediatrics',
    'Orthopedics', 'Neurology', 'Gynecology', 'Psychiatry', 'Ophthalmology',
    'ENT', 'Urology', 'Oncology', 'Endocrinology', 'Gastroenterology',
  ];

  const consultationFee = booking.doctor ? safeNum(booking.doctor.consultation_fee) : 0;

  // ──────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="bg-gradient-to-br from-[#E17726] to-[#FF8A56] p-2 rounded-xl">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            Book a Consultation
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {STEP_LABELS[step]} — Step {step} of 4
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="px-6 pt-4">
          <StepIndicator current={step} />
        </div>

        {/* Content area - scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">

          {/* ════════════════════════════════════════
              STEP 1 — Choose Doctor
          ════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Search & filter row */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="doctor-search-input"
                    placeholder="Search by name or condition…"
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={doctorSpecialty} onValueChange={setDoctorSpecialty}>
                  <SelectTrigger className="w-44" id="specialty-filter">
                    <SelectValue placeholder="Specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Doctor list */}
              {doctorsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-[#E17726]" />
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No doctors found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {doctors.map((doc) => (
                    <DoctorCard
                      key={doc.id}
                      doctor={doc}
                      selected={booking.doctor?.id === doc.id}
                      onSelect={() => setBooking((prev) => ({ ...prev, doctor: doc }))}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════
              STEP 2 — Appointment Details
          ════════════════════════════════════════ */}
          {step === 2 && booking.doctor && (
            <div className="space-y-5">
              {/* Selected doctor summary */}
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E17726] to-[#FF8A56] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {booking.doctor.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{booking.doctor.name}</p>
                  <p className="text-sm text-[#E17726]">{booking.doctor.specialization}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-black text-lg text-gray-900">₹{consultationFee.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">consultation fee</p>
                </div>
              </div>

              {/* Consultation type */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Consultation Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: 'video', label: 'Video Call', icon: Video },
                      { value: 'in_person', label: 'In-Person', icon: Users },
                      { value: 'audio', label: 'Audio Call', icon: Phone },
                    ] as const
                  ).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      id={`consultation-type-${value}`}
                      onClick={() => setBooking((p) => ({ ...p, consultationType: value }))}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        booking.consultationType === value
                          ? 'border-[#E17726] bg-orange-50 text-[#E17726]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#E17726]" />
                  Preferred Date
                </label>
                <Input
                  id="preferred-date"
                  type="date"
                  value={booking.preferredDate}
                  min={tomorrow()}
                  onChange={(e) => setBooking((p) => ({ ...p, preferredDate: e.target.value }))}
                />
              </div>

              {/* Time slots */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#E17726]" />
                  Preferred Time
                </label>
                <div className="relative">
                  {isSlotsLoading && (
                    <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-lg">
                      <Loader2 className="w-6 h-6 animate-spin text-[#E17726]" />
                    </div>
                  )}
                  <div className="grid grid-cols-5 gap-2">
                    {TIME_SLOTS.map((t) => {
                      const isAvailable = availableSlots.includes(t);
                      const isBooked = !isAvailable;
                      
                      return (
                        <button
                          key={t}
                          id={`time-slot-${t.replace(':', '')}`}
                          disabled={isBooked || isSlotsLoading}
                          onClick={() => setBooking((p) => ({ ...p, preferredTime: t }))}
                          className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                            booking.preferredTime === t
                              ? 'border-[#E17726] bg-[#E17726] text-white shadow-md'
                              : isBooked
                              ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-50'
                              : 'border-gray-200 text-gray-600 hover:border-[#E17726]/50 hover:bg-orange-50'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                  {availableSlots.length === 0 && !isSlotsLoading && (
                    <p className="text-[10px] text-red-500 mt-2 text-center font-medium">
                      ⚠️ No slots available for this date. Please try another day.
                    </p>
                  )}
                </div>
              </div>

              {/* Chief complaint */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Chief Complaint <span className="text-red-500">*</span>
                </label>
                <Input
                  id="chief-complaint"
                  placeholder="e.g. Fever, headache, chest pain…"
                  value={booking.chiefComplaint}
                  onChange={(e) => setBooking((p) => ({ ...p, chiefComplaint: e.target.value }))}
                />
              </div>

              {/* Symptoms */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Additional Symptoms (optional)
                </label>
                <textarea
                  id="symptoms-textarea"
                  rows={3}
                  placeholder="Briefly describe your symptoms…"
                  value={booking.symptoms}
                  onChange={(e) => setBooking((p) => ({ ...p, symptoms: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#E17726] focus:ring-1 focus:ring-[#E17726] outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              STEP 3 — Review & Pay
          ════════════════════════════════════════ */}
          {step === 3 && booking.doctor && (
            <div className="space-y-5">
              {/* Booking summary card */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-5 space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">Booking Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#E17726]" /> Doctor
                    </span>
                    <span className="font-semibold">{booking.doctor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-[#E17726]" /> Specialization
                    </span>
                    <span className="font-semibold">{booking.doctor.specialization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#E17726]" /> Date & Time
                    </span>
                    <span className="font-semibold">
                      {new Date(booking.preferredDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })} at {booking.preferredTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      {booking.consultationType === 'video' ? (
                        <Video className="w-4 h-4 text-[#E17726]" />
                      ) : booking.consultationType === 'in_person' ? (
                        <Users className="w-4 h-4 text-[#E17726]" />
                      ) : (
                        <Phone className="w-4 h-4 text-[#E17726]" />
                      )}
                      Type
                    </span>
                    <span className="font-semibold capitalize">
                      {booking.consultationType === 'video'
                        ? 'Video Call'
                        : booking.consultationType === 'in_person'
                        ? 'In-Person'
                        : 'Audio Call'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#E17726]" /> Chief Complaint
                    </span>
                    <span className="font-semibold text-right max-w-[55%] truncate">
                      {booking.chiefComplaint}
                    </span>
                  </div>
                </div>

                <div className="border-t border-orange-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">Consultation Fee</span>
                    <div className="flex items-center gap-1 text-2xl font-black text-gray-900">
                      <IndianRupee className="w-5 h-5" />
                      {consultationFee.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment error */}
              {paymentError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{paymentError}</p>
                </div>
              )}

              {/* Payment status feedback */}
              {(paymentStatus === 'loading' || paymentStatus === 'verifying') && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
                  <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />
                  <p className="text-sm font-medium">
                    {paymentStatus === 'loading' ? 'Preparing your payment…' : 'Verifying payment with our server…'}
                  </p>
                </div>
              )}

              {/* Security badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Shield, label: '256-bit SSL', color: 'text-green-600 bg-green-50' },
                  { icon: Zap, label: 'Instant Confirm', color: 'text-blue-600 bg-blue-50' },
                  { icon: CreditCard, label: 'UPI / Card / Net', color: 'text-purple-600 bg-purple-50' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium ${color}`}>
                    <Icon className="w-4 h-4" />
                    {label}
                  </div>
                ))}
              </div>

              {/* Razorpay credit */}
              <p className="text-center text-xs text-gray-400">
                Payments secured by{' '}
                <span className="font-bold text-[#072654]">Razorpay</span>
              </p>
            </div>
          )}

          {/* ════════════════════════════════════════
              STEP 4 — Confirmation
          ════════════════════════════════════════ */}
          {step === 4 && paymentResult && booking.doctor && (
            <div className="flex flex-col items-center text-center py-4 space-y-6">
              {/* Success animation */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-[bounce_1s_ease-in-out_1]">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping opacity-30" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900">Payment Successful! 🎉</h2>
                <p className="text-gray-600 mt-2">
                  Your consultation request has been submitted successfully.
                </p>
              </div>

              {/* Receipt card */}
              <div className="w-full bg-gray-50 rounded-2xl border border-gray-200 p-5 text-left space-y-3 text-sm">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#E17726]" />
                  Payment Receipt
                </h3>
                {[
                  { label: 'Doctor', value: booking.doctor.name },
                  { label: 'Amount Paid', value: `₹${paymentResult.amount.toLocaleString()}` },
                  { label: 'Payment ID', value: paymentResult.razorpayPaymentId },
                  {
                    label: 'Date & Time',
                    value: new Date(paymentResult.completedAt).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    }),
                  },
                  {
                    label: 'Appointment',
                    value: `${new Date(booking.preferredDate).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short',
                    })} at ${booking.preferredTime}`,
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-900 text-right max-w-[60%] break-all">{value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 text-left w-full">
                <p className="font-semibold mb-1">📋 What happens next?</p>
                <ul className="space-y-1 text-xs list-disc list-inside">
                  <li>Our team will confirm your appointment</li>
                  <li>You'll receive a notification with meeting details</li>
                  <li>Join via the Consultations tab at your scheduled time</li>
                </ul>
              </div>

              <Button
                id="close-confirmation-btn"
                onClick={onClose}
                className="w-full bg-gradient-to-r from-[#E17726] to-[#FF8A56] text-white font-bold py-3"
              >
                Back to Dashboard
              </Button>
            </div>
          )}
        </div>

        {/* ── Footer navigation (hidden on step 4) ── */}
        {step !== 4 && (
          <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-3">
            <Button
              id="prev-step-btn"
              variant="outline"
              onClick={goPrev}
              disabled={step === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            {step < 3 && (
              <Button
                id="next-step-btn"
                onClick={goNext}
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                className="flex items-center gap-2 bg-gradient-to-r from-[#E17726] to-[#FF8A56] text-white font-bold"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}

            {step === 3 && (
              <Button
                id="pay-now-btn"
                onClick={handlePay}
                disabled={paymentStatus === 'loading' || paymentStatus === 'verifying' || paymentStatus === 'popup'}
                className="flex items-center gap-2 bg-gradient-to-r from-[#E17726] to-[#FF8A56] text-white font-bold px-6 py-2 shadow-lg shadow-orange-200"
              >
                {paymentStatus === 'loading' || paymentStatus === 'verifying' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {paymentStatus === 'verifying' ? 'Verifying…' : 'Preparing…'}
                  </>
                ) : paymentStatus === 'popup' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Complete payment in popup…
                  </>
                ) : (
                  <>
                    <IndianRupee className="w-4 h-4" />
                    Pay ₹{consultationFee.toLocaleString()}
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookConsultationModal;
