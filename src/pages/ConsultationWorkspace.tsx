import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useIsMobile } from '@/lib/deviceDetection';
import MobileConsultationWorkspace from '@/components/mobile/MobileConsultationWorkspace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/lib/toast';
import { 
  ArrowLeft,
  Video,
  Loader2,
  Save,
  Printer,
  Download,
  User,
  Pill,
  Heart,
  Stethoscope,
  FileText,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  Activity,
  History,
  Eye,
  VideoOff,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Plus,
  Edit,
  ChevronLeft,
  X,
  Search
} from 'lucide-react';
import { medicationService, type MedicationSearchResult } from '@/services/medicationService';
import { prescriptionApi, doctorConsultationApi, api } from '@/lib/api';
import InvestigationSelector from '@/components/investigations/InvestigationSelector';
import { PrescriptionInvestigation } from '@/services/investigationService';
import investigationService from '@/services/investigationService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PatientProfile {
  id: string;
  user?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    date_of_birth?: string;
    gender?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    medical_history?: string;
  };
  user_name?: string;
  user_phone?: string;
  user_email?: string;
  name?: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  medical_history?: string;
  allergies?: string;
  current_medications?: string;
  profile_picture?: string;
}

interface MedicalRecord {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
  uploaded_date: string;
  description?: string;
}

interface PrescriptionPDF {
  id: string;
  version: number;
  is_current: boolean;
  generated_at: string;
  generated_by: {
    id: string;
    name: string;
  };
  file_url: string;
  file_size: number;
}

interface ExistingPrescription {
  id: number;
  issued_date: string;
  primary_diagnosis: string;
  is_finalized: boolean;
  medications: any[];
  pdf_versions?: PrescriptionPDF[];
  current_pdf?: PrescriptionPDF;
}

interface Medication {
  id?: number;
  medicine_name: string;
  composition?: string;
  dosage_form?: string;
  dosage?: string;
  morning_dose?: number;
  afternoon_dose?: number;
  evening_dose?: number;
  frequency: 'once_daily' | 'twice_daily' | 'thrice_daily' | 'four_times_daily' | 'sos' | 'custom';
  custom_frequency?: string;
  timing: 'before_breakfast' | 'after_breakfast' | 'before_lunch' | 'after_lunch' | 'before_dinner' | 'after_dinner' | 'bedtime' | 'empty_stomach' | 'with_food' | 'custom';
  custom_timing?: string;
  duration_days?: number;
  duration_weeks?: number;
  duration_months?: number;
  is_continuous?: boolean;
  special_instructions?: string;
  notes?: string;
  before_meal?: boolean;
  is_generic?: boolean;
  quantity?: string;
  order?: number;
}

type Prescription = any;
type Consultation = any;

const ConsultationWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { consultationId } = useParams<{ consultationId: string }>();
  const isMobile = useIsMobile();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadingVitalSigns, setLoadingVitalSigns] = useState(true);

  // UI states
  const [isVideoMaximized, setIsVideoMaximized] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(true);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [showExistingPrescriptions, setShowExistingPrescriptions] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  
  // Section visibility states
  const [showVitalSigns, setShowVitalSigns] = useState(true);
  const [showDiagnosis, setShowDiagnosis] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showMedications, setShowMedications] = useState(true);
  const [showCompleteConfirmation, setShowCompleteConfirmation] = useState(false);
  
  // PDF Modal states
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<ExistingPrescription | null>(null);
  const [selectedPdfVersion, setSelectedPdfVersion] = useState<PrescriptionPDF | null>(null);

  // Data states
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [existingPrescriptions, setExistingPrescriptions] = useState<ExistingPrescription[]>([]);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [prescriptionInvestigations, setPrescriptionInvestigations] = useState<PrescriptionInvestigation[]>([]);

  // Medication form state
  const [medicationForm, setMedicationForm] = useState<Medication>({
    medicine_name: '',
    dosage: '',
    frequency: 'once_daily',
    timing: 'after_breakfast',
    duration_days: 7,
    special_instructions: '',
    before_meal: false,
    is_generic: true,
    quantity: '',
  });

  // Medication search state
  const [medicationSearchQuery, setMedicationSearchQuery] = useState('');
  const [medicationSearchResults, setMedicationSearchResults] = useState<MedicationSearchResult[]>([]);
  const [isSearchingMedications, setIsSearchingMedications] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchSuccess, setSearchSuccess] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState<number>(-1);

  // Form state
  const [formData, setFormData] = useState({
    primary_diagnosis: '',
    patient_previous_history: '',
    general_instructions: '',
    next_visit: '',
    vital_signs: {
      pulse: '',
      blood_pressure_systolic: '',
      blood_pressure_diastolic: '',
      temperature: '',
      weight: '',
      height: '',
    },
  });

  const latestPdfUrl = useMemo(() => prescription?.current_pdf?.file_url as string | undefined, [prescription]);

  // Simple iframe for Jitsi Meet - no complex permission handling needed

  // Log the doctor meeting link being used
  useEffect(() => {
    const meetingUrl = consultation?.doctor_meeting_link || "https://meet.diracai.com/office";
    console.log('🎥 Opening Jitsi Meet iframe with URL:', meetingUrl);
    console.log('🔗 Full iframe URL:', meetingUrl);
    
    // Log the doctor meeting link details
    if (consultation?.doctor_meeting_link) {
      console.log('👨‍⚕️ Doctor meeting link from backend:', consultation.doctor_meeting_link);
      console.log('📋 Doctor ID from consultation:', consultation.doctor?.id || consultation.doctor);
    } else {
      console.log('❌ No doctor meeting link available, using fallback URL');
    }
  }, [consultation]);

  useEffect(() => {
    const loadWorkspaceData = async () => {
      if (!consultationId) return;
      setLoading(true);
      
      try {
        // Load consultation details
        const consultData = await doctorConsultationApi.getConsultationDetails(consultationId);
        setConsultation(consultData);

        if (consultData) {
          // Immediately set vital signs from consultation data if available
          console.log('🔍 Consultation data vital signs:', (consultData as any).vital_signs);
          if ((consultData as any).vital_signs) {
            console.log('🔍 Setting vital signs from consultation data immediately');
            setFormData(prev => ({
              ...prev,
              vital_signs: {
                pulse: (consultData as any).vital_signs.pulse?.toString() || prev.vital_signs.pulse,
                blood_pressure_systolic: (consultData as any).vital_signs.blood_pressure_systolic?.toString() || prev.vital_signs.blood_pressure_systolic,
                blood_pressure_diastolic: (consultData as any).vital_signs.blood_pressure_diastolic?.toString() || prev.vital_signs.blood_pressure_diastolic,
                temperature: (consultData as any).vital_signs.temperature?.toString() || prev.vital_signs.temperature,
                weight: (consultData as any).vital_signs.weight?.toString() || prev.vital_signs.weight,
                height: (consultData as any).vital_signs.height?.toString() || prev.vital_signs.height,
              }
            }));
            setLoadingVitalSigns(false); // Vital signs loaded from consultation
          } else {
            console.log('🔍 No vital signs found in consultation data, will try prescription data');
          }
          const patientId = consultData.patient?.id || consultData.patient;
          
          // Load patient profile
          if (patientId) {
            try {
              const patientResponse = await api.get(`/api/patients/${patientId}/`);
              const profileData = patientResponse.data.success ? patientResponse.data.data : patientResponse.data;
              setPatientProfile(profileData);
            } catch (error) {
              console.error('Error loading patient profile:', error);
              // If patient profile API fails, we'll use the patient data from consultation
              // The consultation already contains basic patient information
            }

            // Load medical records
            setLoadingRecords(true);
            try {
              const recordsResponse = await api.get(`/api/patients/${patientId}/medical-records/`);
              const recordsData = recordsResponse.data.success ? recordsResponse.data.data : recordsResponse.data;
              setMedicalRecords(Array.isArray(recordsData) ? recordsData : recordsData?.results || []);
            } catch (error) {
              console.error('Error loading medical records:', error);
            } finally {
              setLoadingRecords(false);
            }

            // Load existing prescriptions for this consultation
            try {
              console.log('Loading prescription for consultation:', consultationId);
              const prescriptionResponse = await prescriptionApi.getConsultationPrescription(consultationId);
              console.log('Prescription response:', prescriptionResponse);
              
              // The consultation prescription endpoint returns a single prescription
              let prescriptions = [];
              if (prescriptionResponse) {
                prescriptions = [prescriptionResponse];
              }
              
              console.log('Final prescriptions array:', prescriptions);
              console.log('First prescription sample:', prescriptions[0]);
              console.log('Prescription IDs:', prescriptions.map(p => p?.id));
              console.log('Prescription count:', prescriptions.length);
              
              // Debug: Check if prescriptions have the expected structure
              if (prescriptions.length > 0) {
                const firstPrescription = prescriptions[0];
                console.log('First prescription keys:', Object.keys(firstPrescription));
                console.log('First prescription id type:', typeof firstPrescription.id);
                console.log('First prescription id value:', firstPrescription.id);
              }
              
              // Load PDF versions for each prescription (only if we have valid IDs)
              const prescriptionsWithPdfs = await Promise.all(
                prescriptions.map(async (prescription) => {
                  if (!prescription?.id) {
                    console.log('Skipping PDF versions for prescription without ID:', prescription);
                    return prescription;
                  }
                  
                  try {
                    console.log(`Loading PDF versions for prescription ${prescription.id}`);
                    const pdfVersions = await prescriptionApi.getPrescriptionPdfVersions(prescription.id.toString());
                    console.log(`PDF versions for prescription ${prescription.id}:`, pdfVersions);
                    return {
                      ...prescription,
                      pdf_versions: pdfVersions,
                      current_pdf: pdfVersions.find((pdf: any) => pdf.is_current) || null
                    };
                  } catch (error) {
                    console.error(`Error loading PDF versions for prescription ${prescription.id}:`, error);
                    return prescription;
                  }
                })
              );
              
              console.log('Loaded prescriptions with PDFs:', prescriptionsWithPdfs);
              setExistingPrescriptions(prescriptionsWithPdfs);
            } catch (error) {
              console.error('Error loading prescription:', error);
              setExistingPrescriptions([]);
            }
          }

          // Load or create prescription for this consultation
          try {
            const pres = await prescriptionApi.getConsultationPrescription(consultationId);
            setPrescription(pres);
            
            // Load medications from prescription into local state
            if (pres.medications && Array.isArray(pres.medications)) {
              const localMedications = pres.medications.map((med: any) => ({
                id: med.id,
                medicine_name: med.medicine_name || '',
                dosage: med.dosage_display || '',
                frequency: med.frequency || 'once_daily',
                custom_frequency: med.custom_frequency || '',
                timing: med.timing || 'after_breakfast',
                custom_timing: med.custom_timing || '',
                duration_days: med.duration_days || 7,
                special_instructions: med.special_instructions || '',
                before_meal: med.before_meal || false,
                is_generic: med.is_generic || false,
                quantity: med.quantity || '',
              }));
              setMedications(localMedications);
            }
            
            console.log('🔍 Prescription vital signs data:', {
              consultation_vital_signs: (consultData as any)?.vital_signs,
              prescription_pulse: pres.pulse,
              prescription_vital_signs: (pres as any).vital_signs,
              prescription_temperature: pres.temperature,
              prescription_weight: pres.weight,
              prescription_height: pres.height
            });
            
            setFormData({
              primary_diagnosis: pres.primary_diagnosis || '',
              patient_previous_history: (pres as any).patient_previous_history || '',
              general_instructions: pres.general_instructions || '',
              next_visit: pres.next_visit || '',
              vital_signs: {
                pulse: (consultData as any)?.vital_signs?.pulse?.toString() || pres.pulse?.toString() || (pres as any).vital_signs?.pulse?.toString() || '',
                blood_pressure_systolic: (consultData as any)?.vital_signs?.blood_pressure_systolic?.toString() || pres.blood_pressure_systolic?.toString() || (pres as any).vital_signs?.blood_pressure_systolic?.toString() || '',
                blood_pressure_diastolic: (consultData as any)?.vital_signs?.blood_pressure_diastolic?.toString() || pres.blood_pressure_diastolic?.toString() || (pres as any).vital_signs?.blood_pressure_diastolic?.toString() || '',
                temperature: (consultData as any)?.vital_signs?.temperature?.toString() || pres.temperature?.toString() || (pres as any).vital_signs?.temperature?.toString() || '',
                weight: (consultData as any)?.vital_signs?.weight?.toString() || pres.weight?.toString() || (pres as any).vital_signs?.weight?.toString() || '',
                height: (consultData as any)?.vital_signs?.height?.toString() || pres.height?.toString() || (pres as any).vital_signs?.height?.toString() || '',
              },
            });
            
            console.log('🔍 Final vital signs set:', {
              pulse: (consultData as any)?.vital_signs?.pulse?.toString() || pres.pulse?.toString() || (pres as any).vital_signs?.pulse?.toString() || '',
              blood_pressure_systolic: (consultData as any)?.vital_signs?.blood_pressure_systolic?.toString() || pres.blood_pressure_systolic?.toString() || (pres as any).vital_signs?.blood_pressure_systolic?.toString() || '',
              blood_pressure_diastolic: (consultData as any)?.vital_signs?.blood_pressure_diastolic?.toString() || pres.blood_pressure_diastolic?.toString() || (pres as any).vital_signs?.blood_pressure_diastolic?.toString() || '',
              temperature: (consultData as any)?.vital_signs?.temperature?.toString() || pres.temperature?.toString() || (pres as any).vital_signs?.temperature?.toString() || '',
              weight: (consultData as any)?.vital_signs?.weight?.toString() || pres.weight?.toString() || (pres as any).vital_signs?.weight?.toString() || '',
              height: (consultData as any)?.vital_signs?.height?.toString() || pres.height?.toString() || (pres as any).vital_signs?.height?.toString() || '',
            });
            
            setLoadingVitalSigns(false); // Vital signs loaded from prescription

            // Load investigations from prescription data (already included in the response)
            console.log('Prescription investigations from API:', (pres as any).investigations);
            if ((pres as any).investigations && Array.isArray((pres as any).investigations)) {
              setPrescriptionInvestigations((pres as any).investigations);
            } else {
              // Fallback: try to load investigations separately if not included in prescription
              try {
                const investigations = await investigationService.getPrescriptionInvestigations(pres.id);
                setPrescriptionInvestigations(investigations);
              } catch (investigationError) {
                console.error('Error loading investigations:', investigationError);
                setPrescriptionInvestigations([]);
              }
            }
          } catch (err: any) {
            // If not found, create a new draft
            if (consultData && patientId) {
              try {
                const newPres = await prescriptionApi.createPrescription({
                  consultation: consultationId,
                  patient: patientId,
                  primary_diagnosis: '',
                  general_instructions: '',
                  medications: [],
                });
                setPrescription(newPres);
              } catch (createError) {
                console.error('Error creating prescription:', createError);
              }
            }
            setLoadingVitalSigns(false); // No vital signs available
          }
        }
      } catch (error) {
        console.error('Error loading workspace:', error);
        toast.error('Failed to load consultation workspace');
      } finally {
        setLoading(false);
      }
    };

    loadWorkspaceData();
  }, [consultationId]);

  // Auto-save functionality
  useEffect(() => {
    if (!prescription?.id) return;
    const handler = setTimeout(async () => {
      try {
        await prescriptionApi.autoSave(prescription.id, {
          primary_diagnosis: formData.primary_diagnosis,
          patient_previous_history: formData.patient_previous_history,
          general_instructions: formData.general_instructions,
          next_visit: formData.next_visit,
          pulse: formData.vital_signs.pulse ? Number(formData.vital_signs.pulse) : undefined,
          blood_pressure_systolic: formData.vital_signs.blood_pressure_systolic ? Number(formData.vital_signs.blood_pressure_systolic) : undefined,
          blood_pressure_diastolic: formData.vital_signs.blood_pressure_diastolic ? Number(formData.vital_signs.blood_pressure_diastolic) : undefined,
          temperature: formData.vital_signs.temperature ? Number(formData.vital_signs.temperature) : undefined,
          weight: formData.vital_signs.weight ? Number(formData.vital_signs.weight) : undefined,
          height: formData.vital_signs.height ? Number(formData.vital_signs.height) : undefined,
          medications: medications.map((med, index) => ({
            medicine_name: med.medicine_name,
            composition: med.composition || '',
            dosage_form: med.dosage_form || 'tablet',
            morning_dose: med.morning_dose || 0,
            afternoon_dose: med.afternoon_dose || 0,
            evening_dose: med.evening_dose || 0,
            frequency: med.frequency || 'once_daily',
            timing: med.timing || 'after_breakfast',
            custom_timing: med.custom_timing || '',
            duration_days: med.duration_days || 7,
            duration_weeks: med.duration_weeks || 0,
            duration_months: med.duration_months || 0,
            is_continuous: med.is_continuous || false,
            special_instructions: med.special_instructions || '',
            notes: med.notes || '',
            order: index + 1,
          })),
        });
      } catch (error) {
        // Silent fail for auto-save
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [formData, medications, prescription?.id]);

  // Show mobile component if on mobile device (after all hooks)
  if (isMobile) {
    return <MobileConsultationWorkspace />;
  }

  const handleSaveDraft = async () => {
    if (!prescription?.id) return;
    setSaving(true);
    try {
      const updated = await prescriptionApi.saveDraft(prescription.id, {
        primary_diagnosis: formData.primary_diagnosis,
        patient_previous_history: formData.patient_previous_history,
        general_instructions: formData.general_instructions,
        next_visit: formData.next_visit,
        pulse: formData.vital_signs.pulse ? Number(formData.vital_signs.pulse) : undefined,
        blood_pressure_systolic: formData.vital_signs.blood_pressure_systolic ? Number(formData.vital_signs.blood_pressure_systolic) : undefined,
        blood_pressure_diastolic: formData.vital_signs.blood_pressure_diastolic ? Number(formData.vital_signs.blood_pressure_diastolic) : undefined,
        temperature: formData.vital_signs.temperature ? Number(formData.vital_signs.temperature) : undefined,
        weight: formData.vital_signs.weight ? Number(formData.vital_signs.weight) : undefined,
        height: formData.vital_signs.height ? Number(formData.vital_signs.height) : undefined,
        medications: medications.map((med, index) => ({
          medicine_name: med.medicine_name,
          composition: med.composition || '',
          dosage_form: med.dosage_form || 'tablet',
          morning_dose: med.morning_dose || 0,
          afternoon_dose: med.afternoon_dose || 0,
          evening_dose: med.evening_dose || 0,
          frequency: med.frequency || 'once_daily',
          timing: med.timing || 'after_breakfast',
          custom_timing: med.custom_timing || '',
          duration_days: med.duration_days || 7,
          duration_weeks: med.duration_weeks || 0,
          duration_months: med.duration_months || 0,
          is_continuous: med.is_continuous || false,
          special_instructions: med.special_instructions || '',
          notes: med.notes || '',
          order: index + 1,
        })),
      });
      setPrescription(updated);
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!prescription?.id) return;
    setFinalizing(true);
    try {
      const result = await prescriptionApi.finalizeAndGeneratePDF(prescription.id, {
        primary_diagnosis: formData.primary_diagnosis,
        patient_previous_history: formData.patient_previous_history,
        general_instructions: formData.general_instructions,
        next_visit: formData.next_visit,
        pulse: formData.vital_signs.pulse ? Number(formData.vital_signs.pulse) : undefined,
        blood_pressure_systolic: formData.vital_signs.blood_pressure_systolic ? Number(formData.vital_signs.blood_pressure_systolic) : undefined,
        blood_pressure_diastolic: formData.vital_signs.blood_pressure_diastolic ? Number(formData.vital_signs.blood_pressure_diastolic) : undefined,
        temperature: formData.vital_signs.temperature ? Number(formData.vital_signs.temperature) : undefined,
        weight: formData.vital_signs.weight ? Number(formData.vital_signs.weight) : undefined,
        height: formData.vital_signs.height ? Number(formData.vital_signs.height) : undefined,
        medications: medications.map((med, index) => ({
          medicine_name: med.medicine_name,
          composition: med.composition || '',
          dosage_form: med.dosage_form || 'tablet',
          morning_dose: med.morning_dose || 0,
          afternoon_dose: med.afternoon_dose || 0,
          evening_dose: med.evening_dose || 0,
          frequency: med.frequency || 'once_daily',
          timing: med.timing || 'after_breakfast',
          custom_timing: med.custom_timing || '',
          duration_days: med.duration_days || 7,
          duration_weeks: med.duration_weeks || 0,
          duration_months: med.duration_months || 0,
          is_continuous: med.is_continuous || false,
          special_instructions: med.special_instructions || '',
          notes: med.notes || '',
          order: index + 1,
        })),
      });
      
      // Refresh prescription to get updated PDF info
      try {
        const refreshed = await prescriptionApi.getPrescription(String(prescription.id));
        setPrescription(refreshed);
      } catch (refreshError) {
        console.error('Error refreshing prescription:', refreshError);
      }
      
      toast.success('Prescription finalized and PDF generated successfully');
    } catch (error) {
      console.error('Finalize error:', error);
      toast.error('Failed to finalize prescription');
    } finally {
      setFinalizing(false);
    }
  };

  const handleCompleteConsultation = async () => {
    if (!consultationId) return;
    setCompleting(true);
    try {
      // Update consultation status to completed
      const response = await doctorConsultationApi.completeConsultation(consultationId);
      
      if (response && response.success) {
        // Update local consultation state
        setConsultation(prev => prev ? { ...prev, status: 'completed' } : null);
        toast.success('Consultation completed successfully');
        
        // Show success message for longer before redirecting
        setTimeout(() => {
          toast.success('Redirecting to dashboard...');
          setTimeout(() => {
            navigate('/doctor/dashboard');
          }, 1500);
        }, 3000);
      } else {
        toast.error(response?.error || 'Failed to complete consultation');
      }
    } catch (error) {
      console.error('Error completing consultation:', error);
      toast.error('Failed to complete consultation');
    } finally {
      setCompleting(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Medication handlers
  const handleAddMedication = () => {
    setEditingMedication(null);
    setMedicationForm({
      medicine_name: '',
      dosage: '',
      frequency: 'once_daily',
      timing: 'after_breakfast',
      duration_days: 7,
      special_instructions: '',
      before_meal: false,
      is_generic: true,
      quantity: '',
    });
    // Clear any previous messages when opening modal
    setSearchError('');
    setSearchSuccess('');
    setShowMedicationModal(true);
  };

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication);
    setMedicationForm(medication);
    // Clear any previous messages when opening modal
    setSearchError('');
    setSearchSuccess('');
    setShowMedicationModal(true);
  };

  const handleSaveMedication = async () => {
    if (!medicationForm.medicine_name || !medicationForm.dosage) {
      alert('Please fill in medicine name and dosage');
      return;
    }

    try {
      if (editingMedication?.id) {
        // Update existing medication
        const updatedMedications = medications.map(med => 
          med.id === editingMedication.id ? { ...medicationForm, id: med.id } : med
        );
        setMedications(updatedMedications);
      } else {
        // Add new medication
        const newMedication = {
          ...medicationForm,
          id: Date.now(), // Temporary ID for frontend
        };
        setMedications([...medications, newMedication]);
      }
      
      setShowMedicationModal(false);
      setEditingMedication(null);
    } catch (error) {
      console.error('Error saving medication:', error);
      alert('Error saving medication');
    }
  };

  const handleDeleteMedication = (medicationId: number) => {
    setMedications(medications.filter(med => med.id !== medicationId));
  };

  const handleInvestigationsUpdated = (investigations: PrescriptionInvestigation[]) => {
    console.log('ConsultationWorkspace - handleInvestigationsUpdated called with:', investigations);
    setPrescriptionInvestigations(investigations);
  };

  const getFrequencyDisplay = (frequency: string, custom?: string) => {
    switch (frequency) {
      case 'once_daily': return 'Once daily';
      case 'twice_daily': return 'Twice daily';
      case 'thrice_daily': return 'Three times daily';
      case 'four_times_daily': return 'Four times daily';
      case 'sos': return 'SOS (as needed)';
      case 'custom': return custom || 'Custom';
      default: return frequency;
    }
  };

  const getTimingDisplay = (timing: string, custom?: string) => {
    switch (timing) {
      case 'before_breakfast': return 'Before breakfast';
      case 'after_breakfast': return 'After breakfast';
      case 'before_lunch': return 'Before lunch';
      case 'after_lunch': return 'After lunch';
      case 'before_dinner': return 'Before dinner';
      case 'after_dinner': return 'After dinner';
      case 'bedtime': return 'Bedtime';
      case 'empty_stomach': return 'Empty stomach';
      case 'with_food': return 'With food';
      case 'custom': return custom || 'Custom timing';
      default: return timing;
    }
  };

  // Get clinic ID from consultation or doctor's associated clinic
  const getClinicId = () => {
    // First try to get from consultation
    if (consultation?.clinic_id) {
      return consultation.clinic_id;
    }
    
    // If consultation doesn't have clinic, try to get from doctor's clinic associations
    // For now, using a default clinic ID - in production, you'd query the doctor's clinic
    return 'CLI011'; // Using a valid clinic ID from the database (CLI011 exists)
    
    // TODO: In production, implement this logic:
    // const doctorClinics = await api.get(`/api/doctors/${consultation.doctor_id}/clinics/`);
    // return doctorClinics.data[0]?.clinic_id || 'CLI011';
  };

  // Search medications when user types
  const searchMedications = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setMedicationSearchResults([]);
      setSearchError(null);
      setShowSearchResults(false);
      return;
    }

    setIsSearchingMedications(true);
    setSearchError(null);

    try {
      const response = await medicationService.searchMedications(query, 20, false);
      
      if (response.success) {
        setMedicationSearchResults(response.data.medications);
        setShowSearchResults(true);
        setActiveSearchIndex(-1);
      } else {
        setSearchError(response.message || 'Search failed');
        setMedicationSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error('Error searching medications:', error);
      setSearchError('Failed to search medications. Please try again.');
      setMedicationSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearchingMedications(false);
    }
  };

  // Handle medication search input change with debouncing
  const handleMedicationSearchChange = (value: string) => {
    setMedicationSearchQuery(value);
    
    // Clear success and error messages when user starts typing
    setSearchSuccess('');
    setSearchError('');
    
    // Clear previous timeout
    if ((window as any).medicationSearchTimeout) {
      clearTimeout((window as any).medicationSearchTimeout);
    }
    
    // Set new timeout for debounced search
    (window as any).medicationSearchTimeout = setTimeout(() => {
      searchMedications(value);
    }, 300);
  };

  // Auto-create medication if not found
  const handleAddNewMedication = async () => {
    if (!medicationSearchQuery.trim()) return;

    try {
      const response = await medicationService.autoCreateMedication({
        name: medicationSearchQuery,
        dosage_form: 'tablet'
      });

      console.log('🔍 ConsultationWorkspace - Auto-create response:', response);

      let medObj = null;
      if (response.success && response.data) {
        // The service transforms the response to { data: { medications: [...] } }
        if (response.data.medications && Array.isArray(response.data.medications) && response.data.medications.length > 0) {
          medObj = response.data.medications[0];
        }
      }
      
      console.log('🔍 ConsultationWorkspace - Extracted medObj:', medObj);

      if (medObj) {
        const newMedication = {
          ...medicationForm,
          medicine_name: medObj.name,
          dosage: medObj.strength,
          id: Date.now(), // Temporary ID for frontend
        };
        setMedications([...medications, newMedication]);
        setMedicationSearchQuery('');
        setMedicationSearchResults([]);
        setShowSearchResults(false);
        // Keep modal open and show success message
        setSearchError(''); // Clear any previous error
        setSearchSuccess('Medication added successfully! You can add more medications or close the modal.');
        toast({
          title: 'Success',
          description: 'Medication added to inventory and prescription',
          variant: 'default'
        });
      } else {
        setSearchError('Failed to create medication. Please try again.');
        setSearchSuccess(''); // Clear success message
      }
    } catch (error) {
      console.error('Error creating medication:', error);
      setSearchError('Failed to create medication. Please try again.');
      setSearchSuccess(''); // Clear success message
    }
  };

  // Select medication from search results
  const selectMedication = (medication: MedicationSearchResult) => {
    setMedicationForm({
      ...medicationForm,
      medicine_name: medication.name,
      dosage: medication.strength,
    });
    
    setMedicationSearchQuery('');
    setMedicationSearchResults([]);
    setShowSearchResults(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSearchResults || medicationSearchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSearchIndex(prev => 
          prev < medicationSearchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSearchIndex(prev => 
          prev > 0 ? prev - 1 : medicationSearchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSearchIndex >= 0 && activeSearchIndex < medicationSearchResults.length) {
          selectMedication(medicationSearchResults[activeSearchIndex]);
        } else if (medicationSearchResults.length === 0) {
          handleAddNewMedication();
        }
        break;
      case 'Escape':
        setShowSearchResults(false);
        setActiveSearchIndex(-1);
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Consultation Workspace</h3>
          <p className="text-gray-600">Preparing patient data and consultation details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/doctor/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Consultation Workspace</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>ID: {consultationId}</span>
              {consultation && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{consultation.scheduled_date} at {consultation.scheduled_time}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <Badge variant={
                    consultation.status === 'scheduled' ? 'default' : 
                    consultation.status === 'completed' ? 'secondary' : 
                    consultation.status === 'ongoing' || consultation.status === 'in progress' || consultation.status === 'in_progress' ? 'destructive' :
                    'default'
                  }>
                    {consultation.status === 'completed' ? 'Completed' : 
                     consultation.status === 'in progress' || consultation.status === 'in_progress' ? 'In Progress' :
                     consultation.status?.replace('_', ' ')}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Complete Consultation Button - Show for multiple statuses */}
          
          {(consultation?.status === 'ongoing' || 
            consultation?.status === 'in progress' || 
            consultation?.status === 'in_progress' ||
            consultation?.status === 'active') && (
            <Button 
              onClick={() => setShowCompleteConfirmation(true)} 
              disabled={completing} 
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Complete Consultation
            </Button>
          )}
          
          <Button variant="outline" onClick={handleSaveDraft} disabled={saving || finalizing} size="sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </Button>
          <Button onClick={handleFinalize} disabled={finalizing || saving} size="sm">
            {finalizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            Finalize & PDF
          </Button>
          {latestPdfUrl && (
            <a href={latestPdfUrl} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4" />
                PDF
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden bg-slate-50">
        {/* Left Sidebar - Patient Info */}
        <div className={`${isSidebarCollapsed ? 'w-12' : 'w-72 lg:w-80'} bg-white border-r border-slate-200 overflow-y-auto transition-all duration-300 shadow-sm scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100`}>
          {isSidebarCollapsed ? (
            // Collapsed sidebar - just icons
            <div className="p-2 space-y-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-10 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsSidebarCollapsed(false)}
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-10 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setShowPatientDetails(!showPatientDetails)}
                  title="Patient Profile"
                >
                  <User className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-10 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                  onClick={() => setShowMedicalHistory(!showMedicalHistory)}
                  title="Medical History"
                >
                  <History className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-10 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  onClick={() => setShowExistingPrescriptions(!showExistingPrescriptions)}
                  title="Previous Prescriptions"
                >
                  <Stethoscope className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            // Expanded sidebar - full content
            <div className="p-4 space-y-6">
              {/* Collapse button */}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarCollapsed(true)}
                  title="Collapse sidebar"
                  className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>

              {/* Patient Profile */}
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 via-blue-50 to-indigo-50 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base lg:text-lg flex items-center gap-2 text-slate-800 font-semibold">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <User className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                      </div>
                      Patient Profile
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPatientDetails(!showPatientDetails)}
                      className="hover:bg-blue-100 transition-colors"
                    >
                      {showPatientDetails ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>
                {showPatientDetails && (
                  <CardContent className="space-y-4 bg-white p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-14 w-14 ring-2 ring-blue-100 shadow-sm">
                        <AvatarImage src={patientProfile?.profile_picture || consultation?.patient?.profile_picture} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-semibold text-lg">
                          {(patientProfile?.name || consultation?.patient?.name || 'P').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-slate-800 truncate">
                          {patientProfile?.user_name || patientProfile?.name || consultation?.patient_name || consultation?.patient?.name || 'Unknown Patient'}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {patientProfile?.date_of_birth || consultation?.patient?.date_of_birth
                            ? `${calculateAge(patientProfile?.date_of_birth || consultation?.patient?.date_of_birth)} years`
                            : 'Age not available'
                          } • {patientProfile?.gender || consultation?.patient?.gender || 'Gender not specified'}
                        </p>
                      </div>
                    </div>
                    

                    {patientProfile?.allergies && (
                      <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 bg-red-100 rounded-lg mt-0.5">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-red-800 mb-1">Allergies</p>
                            <p className="text-sm text-red-700 leading-relaxed">{patientProfile.allergies}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {patientProfile?.current_medications && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 bg-blue-100 rounded-lg mt-0.5">
                            <Pill className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-blue-800 mb-1">Current Medications</p>
                            <p className="text-sm text-blue-700 leading-relaxed">{patientProfile.current_medications}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>

              {/* Medical History */}
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 via-emerald-50 to-teal-50 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base lg:text-lg flex items-center gap-2 text-slate-800 font-semibold">
                      <div className="p-1.5 bg-emerald-100 rounded-lg">
                        <History className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600" />
                      </div>
                      Medical History
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMedicalHistory(!showMedicalHistory)}
                      className="hover:bg-emerald-100 transition-colors"
                    >
                      {showMedicalHistory ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>
                {showMedicalHistory && (
                  <CardContent className="bg-white p-4 space-y-4">
                    {(patientProfile?.user?.medical_history || patientProfile?.medical_history || consultation?.patient?.medical_history) ? (
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {patientProfile?.user?.medical_history || patientProfile?.medical_history || consultation?.patient?.medical_history}
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-sm text-slate-500 italic text-center">No medical history recorded</p>
                      </div>
                    )}
                    
                    {loadingRecords ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                      </div>
                    ) : medicalRecords.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          Medical Records
                        </h4>
                        {medicalRecords.slice(0, 3).map((record) => (
                          <div key={record.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-emerald-100 rounded-lg">
                                <FileText className="w-4 h-4 text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800">{record.title}</p>
                                <p className="text-xs text-slate-600">{new Date(record.uploaded_date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <a href={record.file_url} target="_blank" rel="noreferrer">
                              <Button variant="ghost" size="sm" className="hover:bg-emerald-100 transition-colors">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </a>
                          </div>
                        ))}
                        {medicalRecords.length > 3 && (
                          <div className="text-center py-2">
                            <p className="text-xs text-slate-500 bg-slate-100 rounded-full px-3 py-1 inline-block">
                              +{medicalRecords.length - 3} more records
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-sm text-slate-500 italic text-center">No medical records uploaded</p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>

              {/* Previous Prescriptions */}
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 via-indigo-50 to-purple-50 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base lg:text-lg flex items-center gap-2 text-slate-800 font-semibold">
                      <div className="p-1.5 bg-indigo-100 rounded-lg">
                        <Stethoscope className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600" />
                      </div>
                      Previous Prescriptions
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowExistingPrescriptions(!showExistingPrescriptions)}
                      className="hover:bg-indigo-100 transition-colors"
                    >
                      {showExistingPrescriptions ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>
                {showExistingPrescriptions && (
                  <CardContent className="bg-white p-4 space-y-4">
                    {existingPrescriptions.length > 0 ? (
                      <div className="space-y-3">
                        {existingPrescriptions.slice(0, 5).map((pres, index) => (
                          <div key={pres.id?.toString() || `prescription-${index}`} className="border border-slate-200 rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate mb-1">
                                  {pres.primary_diagnosis || 'No diagnosis'}
                                </p>
                                <p className="text-xs text-slate-600 mb-2">
                                  {new Date(pres.issued_date).toLocaleDateString()} • {pres.medications?.length || 0} medications
                                </p>
                                <div className="flex items-center gap-2">
                                  {pres.is_finalized ? (
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200 px-2 py-1">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Finalized
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs border-slate-300 text-slate-600 px-2 py-1">
                                      Draft
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                {pres.current_pdf && (
                                  <a href={pres.current_pdf.file_url} target="_blank" rel="noreferrer">
                                    <Button variant="ghost" size="sm" className="hover:bg-indigo-100 transition-colors">
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </a>
                                )}
                                {pres.pdf_versions && pres.pdf_versions.length > 0 && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="hover:bg-indigo-100 transition-colors"
                                    onClick={() => {
                                      setSelectedPrescription(pres);
                                      setShowPdfModal(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {existingPrescriptions.length > 5 && (
                          <div className="text-center py-2">
                            <p className="text-xs text-slate-500 bg-slate-100 rounded-full px-3 py-1 inline-block">
                              +{existingPrescriptions.length - 5} more prescriptions
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-sm text-slate-500 italic text-center">No previous prescriptions</p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Video Meeting Section */}
          <div className={`${isVideoMaximized ? 'w-full' : 'w-2/3'} bg-white border-r border-slate-200 transition-all duration-300 shadow-sm`}>
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                    <Video className="w-5 h-5 text-blue-600" />
                    Jitsi Meet - Dirac AI
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    <AlertCircle className="w-3 h-3" />
                    <span>Video conferencing application</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVideoMaximized(!isVideoMaximized)}
                    className="border-slate-300 hover:bg-blue-50 hover:border-blue-300"
                  >
                    {isVideoMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 p-4 bg-slate-50">
                <div className="w-full h-full relative">
                  {/* Doctor's individual Jitsi Meet iframe */}
                  <iframe
                    src={consultation?.doctor_meeting_link || "https://meet.diracai.com/office"}
                    className="w-full h-full rounded-lg border border-slate-200 shadow-sm bg-white"
                    allow="camera; microphone; fullscreen; speaker; display-capture"
                    allowFullScreen
                    title="Jitsi Meet - Dirac AI"
                    onLoad={() => {
                      console.log('Jitsi Meet iframe loaded successfully');
                    }}
                    onError={(e) => {
                      console.error('Jitsi Meet iframe failed to load:', e);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Prescription Writer Section */}
          {!isVideoMaximized && (
            <div className="w-1/3 bg-slate-50 overflow-y-auto">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                    <Edit className="w-5 h-5 text-emerald-600" />
                    Prescription Writer
                  </h2>
                  {prescription?.is_finalized && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Finalized
                    </Badge>
                  )}
                </div>

                {/* Vital Signs */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                          <Heart className="w-4 h-4 text-emerald-600" />
                          Vital Signs
                        </CardTitle>
                        <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                          <Eye className="w-3 h-3" />
                          <span>Read-only (Admin measured)</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowVitalSigns(!showVitalSigns)}
                        className="hover:bg-emerald-100"
                      >
                        {showVitalSigns ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  {showVitalSigns && (
                    <CardContent className="bg-white">
                      {loadingVitalSigns ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="w-5 h-5 animate-spin text-emerald-600 mr-2" />
                          <span className="text-sm text-slate-600">Loading vital signs...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-slate-700">Pulse (bpm)</Label>
                            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-md">
                              <span className="text-sm font-medium text-slate-800">
                                {formData.vital_signs.pulse || 'Not recorded'}
                              </span>
                              {formData.vital_signs.pulse && <span className="text-xs text-slate-500">bpm</span>}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-700">Temperature (°C)</Label>
                            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-md">
                              <span className="text-sm font-medium text-slate-800">
                                {formData.vital_signs.temperature || 'Not recorded'}
                              </span>
                              {formData.vital_signs.temperature && <span className="text-xs text-slate-500">°C</span>}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-700">BP Systolic</Label>
                            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-md">
                              <span className="text-sm font-medium text-slate-800">
                                {formData.vital_signs.blood_pressure_systolic || 'Not recorded'}
                              </span>
                              {formData.vital_signs.blood_pressure_systolic && <span className="text-xs text-slate-500">mmHg</span>}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-700">BP Diastolic</Label>
                            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-md">
                              <span className="text-sm font-medium text-slate-800">
                                {formData.vital_signs.blood_pressure_diastolic || 'Not recorded'}
                              </span>
                              {formData.vital_signs.blood_pressure_diastolic && <span className="text-xs text-slate-500">mmHg</span>}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-700">Weight (kg)</Label>
                            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-md">
                              <span className="text-sm font-medium text-slate-800">
                                {formData.vital_signs.weight || 'Not recorded'}
                              </span>
                              {formData.vital_signs.weight && <span className="text-xs text-slate-500">kg</span>}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-700">Height (cm)</Label>
                            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-md">
                              <span className="text-sm font-medium text-slate-800">
                                {formData.vital_signs.height || 'Not recorded'}
                              </span>
                              {formData.vital_signs.height && <span className="text-xs text-slate-500">cm</span>}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
              </Card>

                {/* Diagnosis */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        Diagnosis
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDiagnosis(!showDiagnosis)}
                        className="hover:bg-blue-100"
                      >
                        {showDiagnosis ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  {showDiagnosis && (
                    <CardContent className="space-y-3 bg-white">
                    <div>
                      <Label className="text-xs text-slate-700">Primary Diagnosis</Label>
                      <Textarea
                        rows={2}
                        value={formData.primary_diagnosis}
                        onChange={(e) => setFormData({ ...formData, primary_diagnosis: e.target.value })}
                        placeholder="Enter primary diagnosis..."
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-700">Patient Previous History</Label>
                      <Textarea
                        rows={2}
                        value={formData.patient_previous_history}
                        onChange={(e) => setFormData({ ...formData, patient_previous_history: e.target.value })}
                        placeholder="Enter patient's previous medical history..."
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

                {/* Instructions */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                        <FileText className="w-4 h-4 text-teal-600" />
                        Patient Instructions
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowInstructions(!showInstructions)}
                        className="hover:bg-teal-100"
                      >
                        {showInstructions ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  {showInstructions && (
                    <CardContent className="space-y-3 bg-white">
                      <div>
                        <Label className="text-xs text-slate-700">Special Instructions</Label>
                        <Textarea
                          rows={3}
                          value={formData.general_instructions}
                          onChange={(e) => setFormData({ ...formData, general_instructions: e.target.value })}
                          placeholder="Enter special instructions for the patient..."
                          className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-slate-700">Next Visit</Label>
                        <Select
                          value={formData.next_visit}
                          onValueChange={(value) => setFormData({ ...formData, next_visit: value })}
                        >
                          <SelectTrigger className="border-slate-300 focus:border-teal-500 focus:ring-teal-500">
                            <SelectValue placeholder="Select next visit timing" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1 week">1 week</SelectItem>
                            <SelectItem value="2 weeks">2 weeks</SelectItem>
                            <SelectItem value="3 weeks">3 weeks</SelectItem>
                            <SelectItem value="4 weeks">4 weeks</SelectItem>
                            <SelectItem value="6 weeks">6 weeks</SelectItem>
                            <SelectItem value="8 weeks">8 weeks</SelectItem>
                            <SelectItem value="10 weeks">10 weeks</SelectItem>
                            <SelectItem value="12 weeks">12 weeks</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  )}
              </Card>

              {/* Investigation Tests */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                  <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    Investigation Tests
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-white">
                  <InvestigationSelector
                    prescriptionId={prescription?.id || 0}
                    onInvestigationsUpdated={handleInvestigationsUpdated}
                    existingInvestigations={prescriptionInvestigations}
                  />
                </CardContent>
              </Card>

              {/* Medications Summary */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                        <Pill className="w-4 h-4 text-purple-600" />
                        Medications ({medications.length})
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowMedications(!showMedications)}
                          className="hover:bg-purple-100"
                        >
                          {showMedications ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-purple-300 hover:bg-purple-50 hover:border-purple-400"
                          onClick={handleAddMedication}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {showMedications && (
                    <CardContent className="bg-white">
                      {medications.length > 0 ? (
                        <div className="space-y-2">
                          {medications.map((med) => (
                            <div key={med.id} className="p-3 border border-slate-200 rounded-lg bg-purple-50">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-800">{med.medicine_name}</p>
                                  <p className="text-xs text-slate-600">
                                    {med.dosage} • {getFrequencyDisplay(med.frequency, med.custom_frequency)}
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    {getTimingDisplay(med.timing, med.custom_timing)} • Duration: {med.duration_days} days
                                  </p>
                                  {med.special_instructions && (
                                    <p className="text-xs text-slate-500 mt-1">{med.special_instructions}</p>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="hover:bg-purple-100"
                                    onClick={() => handleEditMedication(med)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="hover:bg-red-100 text-red-600"
                                    onClick={() => handleDeleteMedication(med.id!)}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Pill className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">No medications added yet</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 border-purple-300 hover:bg-purple-50 hover:border-purple-400"
                            onClick={handleAddMedication}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add First Medication
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleSaveDraft}
                    variant="outline" 
                    className="flex-1 border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button 
                    onClick={handleFinalize}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Finalize Prescription
                  </Button>
                  {prescription?.current_pdf && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedPrescription({
                          id: prescription.id,
                          issued_date: prescription.issued_date || new Date().toISOString(),
                          primary_diagnosis: prescription.primary_diagnosis || '',
                          is_finalized: prescription.is_finalized || false,
                          medications: prescription.medications || [],
                          current_pdf: prescription.current_pdf,
                          pdf_versions: prescription.pdf_versions || []
                        });
                        setSelectedPdfVersion(prescription.current_pdf);
                        setShowPdfModal(true);
                      }}
                      className="border-blue-300 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View PDF
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Medication Modal */}
      <Dialog open={showMedicationModal} onOpenChange={setShowMedicationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-purple-600" />
              {editingMedication ? 'Edit Medication' : 'Add New Medication'}
            </DialogTitle>
            <DialogDescription>
              Enter the medication details for the prescription.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Label className="text-sm font-medium">Medicine Name *</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={medicationForm.medicine_name}
                    onChange={(e) => {
                      setMedicationForm({ ...medicationForm, medicine_name: e.target.value });
                      handleMedicationSearchChange(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search for medications..."
                    className="pl-10"
                  />
                  {isSearchingMedications && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
                
                {/* {searchError && (
                  <div className="text-red-500 text-sm bg-red-50 p-2 rounded-lg mt-1">
                    {searchError}
                  </div>
                )} */}
                
                {/* {searchSuccess && (
                  <div className="text-green-600 text-sm bg-green-50 p-2 rounded-lg mt-1">
                    {searchSuccess}
                  </div>
                )} */}

                {showSearchResults && medicationSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {medicationSearchResults
                      .filter(medicationResult => medicationResult.source !== 'previously_prescribed')
                      .map((medicationResult, resultIndex) => (
                      <div
                        key={medicationResult.id}
                        onClick={() => selectMedication(medicationResult)}
                        className={`flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                          activeSearchIndex === resultIndex ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{medicationResult.name}</p>
                          <div className="text-xs text-gray-500 space-y-1 mt-1">
                            {medicationResult.brand_name && medicationResult.brand_name !== medicationResult.name && (
                              <div className="font-medium text-blue-600">Brand: {medicationResult.brand_name}</div>
                            )}
                            {medicationResult.composition && (
                              <div>Composition: {medicationResult.composition}</div>
                            )}
                            {medicationResult.dosage_form && (
                              <div>Form: {medicationResult.dosage_form}</div>
                            )}
                            {medicationResult.strength && (
                              <div>Strength: {medicationResult.strength}</div>
                            )}
                            {medicationResult.therapeutic_class && (
                              <div className="text-purple-600">Class: {medicationResult.therapeutic_class}</div>
                            )}
                            {medicationResult.indication && (
                              <div className="text-green-600">For: {medicationResult.indication}</div>
                            )}
                            {medicationResult.manufacturer && (
                              <div>Manufacturer: {medicationResult.manufacturer}</div>
                            )}
                            {medicationResult.dosage_instructions && (
                              <div className="text-orange-600">Instructions: {medicationResult.dosage_instructions}</div>
                            )}
                            {medicationResult.source === 'inventory' && medicationResult.stock !== undefined && (
                              <span className={`px-1 py-0.5 rounded text-xs ${
                                medicationResult.is_low_stock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}>
                                Stock: {medicationResult.stock} {medicationResult.unit}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-blue-600 mt-1">
                            {medicationResult.source === 'inventory' ? 'In Inventory' : 
                             medicationResult.source === 'newly_created' ? 'Newly Created' : 'Local Database'}
                          </p>
                        </div>
                        <Plus className="w-4 h-4 text-green-600" />
                      </div>
                    ))}
                  </div>
                )}

                {showSearchResults && medicationSearchResults.length === 0 && !isSearchingMedications && !searchError && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                    <div className="text-center">
                      <p className="text-gray-500 mb-2">No medications found</p>
                      <Button 
                        onClick={handleAddNewMedication}
                        variant="outline" 
                        size="sm"
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        Add "{medicationForm.medicine_name}" to Inventory
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium">Dosage *</Label>
                <Input
                  value={medicationForm.dosage}
                  onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                  placeholder="e.g., 500mg"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Frequency</Label>
                <Select 
                  value={medicationForm.frequency} 
                  onValueChange={(value) => setMedicationForm({ ...medicationForm, frequency: value as any })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once_daily">Once daily</SelectItem>
                    <SelectItem value="twice_daily">Twice daily</SelectItem>
                    <SelectItem value="thrice_daily">Three times daily</SelectItem>
                    <SelectItem value="four_times_daily">Four times daily</SelectItem>
                    <SelectItem value="sos">SOS (as needed)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {medicationForm.frequency === 'custom' && (
                  <Input
                    value={medicationForm.custom_frequency || ''}
                    onChange={(e) => setMedicationForm({ ...medicationForm, custom_frequency: e.target.value })}
                    placeholder="e.g., Every 8 hours"
                    className="mt-2"
                  />
                )}
              </div>
              <div>
                <Label className="text-sm font-medium">Timing</Label>
                <Select 
                  value={medicationForm.timing} 
                  onValueChange={(value) => setMedicationForm({ ...medicationForm, timing: value as any })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before_breakfast">Before breakfast</SelectItem>
                    <SelectItem value="after_breakfast">After breakfast</SelectItem>
                    <SelectItem value="before_lunch">Before lunch</SelectItem>
                    <SelectItem value="after_lunch">After lunch</SelectItem>
                    <SelectItem value="before_dinner">Before dinner</SelectItem>
                    <SelectItem value="after_dinner">After dinner</SelectItem>
                    <SelectItem value="bedtime">Bedtime</SelectItem>
                    <SelectItem value="empty_stomach">Empty stomach</SelectItem>
                    <SelectItem value="with_food">With food</SelectItem>
                    <SelectItem value="custom">Custom timing</SelectItem>
                  </SelectContent>
                </Select>
                {medicationForm.timing === 'custom' && (
                  <Input
                    value={medicationForm.custom_timing || ''}
                    onChange={(e) => setMedicationForm({ ...medicationForm, custom_timing: e.target.value })}
                    placeholder="e.g., 2 hours after meals"
                    className="mt-2"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Duration (days)</Label>
                <Input
                  type="number"
                  value={medicationForm.duration_days}
                  onChange={(e) => setMedicationForm({ ...medicationForm, duration_days: parseInt(e.target.value) || 0 })}
                  placeholder="7"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Quantity</Label>
                <Input
                  value={medicationForm.quantity}
                  onChange={(e) => setMedicationForm({ ...medicationForm, quantity: e.target.value })}
                  placeholder="e.g., 10 tablets"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Special Instructions</Label>
              <Textarea
                value={medicationForm.special_instructions || ''}
                onChange={(e) => setMedicationForm({ ...medicationForm, special_instructions: e.target.value })}
                placeholder="Any special instructions for the patient..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="before_meal"
                  checked={medicationForm.before_meal}
                  onChange={(e) => setMedicationForm({ ...medicationForm, before_meal: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="before_meal" className="text-sm">Take before meal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_generic"
                  checked={medicationForm.is_generic}
                  onChange={(e) => setMedicationForm({ ...medicationForm, is_generic: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_generic" className="text-sm">Generic medicine</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMedicationModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMedication} className="bg-purple-600 hover:bg-purple-700">
              {editingMedication ? 'Update Medication' : 'Add Medication'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer Modal */}
      <Dialog open={showPdfModal} onOpenChange={setShowPdfModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Prescription PDF Viewer
            </DialogTitle>
            <DialogDescription>
              View all PDF versions of the prescription
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col h-full">
            {/* PDF Version Selector */}
            {selectedPrescription?.pdf_versions && selectedPrescription.pdf_versions.length > 0 && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                <h4 className="text-sm font-medium text-slate-700 mb-2">Select PDF Version:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPrescription.pdf_versions.map((pdf) => (
                    <Button
                      key={pdf.id}
                      variant={selectedPdfVersion?.id === pdf.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPdfVersion(pdf)}
                      className="text-xs"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Version {pdf.version}
                      {pdf.is_current && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          Current
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
                {selectedPdfVersion && (
                  <div className="mt-2 text-xs text-slate-600">
                    Generated: {new Date(selectedPdfVersion.generated_at).toLocaleString()} • 
                    Size: {formatFileSize(selectedPdfVersion.file_size)} • 
                    By: {selectedPdfVersion.generated_by.name}
                  </div>
                )}
              </div>
            )}

            {/* PDF Viewer */}
            <div className="flex-1 min-h-0 border border-slate-200 rounded-lg overflow-hidden">
              {selectedPdfVersion ? (
                <div className="h-full">
                  {/* Try iframe first */}
                  <iframe
                    src={`${selectedPdfVersion.file_url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                    className="w-full h-full min-h-[500px]"
                    title={`Prescription PDF Version ${selectedPdfVersion.version}`}
                    type="application/pdf"
                    onError={(e) => {
                      console.log('Iframe failed to load PDF, showing fallback');
                    }}
                  />
                  {/* Fallback message if iframe doesn't work */}
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      If the PDF doesn't display above, you can{' '}
                      <a 
                        href={selectedPdfVersion.file_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        open it in a new tab
                      </a>{' '}
                      or download it using the button below.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-slate-50">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500">Select a PDF version to view</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                {selectedPrescription && (
                  <>
                    <strong>Prescription:</strong> {selectedPrescription.primary_diagnosis || 'No diagnosis'} • 
                    <strong>Date:</strong> {new Date(selectedPrescription.issued_date).toLocaleDateString()}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {selectedPdfVersion && (
                  <a href={selectedPdfVersion.file_url} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </a>
                )}
                <Button variant="outline" onClick={() => setShowPdfModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Consultation Confirmation Dialog */}
      <Dialog open={showCompleteConfirmation} onOpenChange={setShowCompleteConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Complete Consultation
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                <strong>Warning:</strong> This action cannot be undone. Once completed, the consultation will be marked as finished.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Patient:</strong> {consultation?.patient?.name || consultation?.patient_name}
              </p>
              <p className="text-sm text-blue-700">
                <strong>Consultation ID:</strong> {consultation?.id}
              </p>
              <p className="text-sm text-blue-700">
                <strong>Current Status:</strong> {consultation?.status}
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCompleteConfirmation(false)}
                disabled={completing}
              >
                Cancel
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={async () => {
                  setShowCompleteConfirmation(false);
                  await handleCompleteConsultation();
                }}
                disabled={completing}
              >
                {completing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Consultation
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

export default ConsultationWorkspace;