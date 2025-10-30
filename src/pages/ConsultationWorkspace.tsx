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
  Minus,
  Edit,
  ChevronLeft,
  X,
  Search,
  RefreshCw
} from 'lucide-react';
import { medicationService, type MedicationSearchResult } from '@/services/medicationService';
import { prescriptionApi, doctorConsultationApi, api } from '@/lib/api';
import InvestigationSelector from '@/components/investigations/InvestigationSelector';
import { PrescriptionInvestigation } from '@/services/investigationService';
import investigationService from '@/services/investigationService';
import EnhancedMedicationTable from '@/components/medications/EnhancedMedicationTable';
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
  id: string | number;
  title: string;
  document_url: string;
  record_type: string;
  date_recorded: string;
  description?: string;
  patient?: string;
  patient_name?: string;
  recorded_by?: string;
  recorded_by_name?: string;
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
  timing: 'with_food' | 'before_breakfast' | 'empty_stomach' | 'bedtime' | 'after_breakfast' | 'before_lunch' | 'after_lunch' | 'before_dinner' | 'after_dinner' | 'custom';
  custom_timing?: string;
  timing_display_text?: string;
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
  const [showMedicalHistory, setShowMedicalHistory] = useState(true);
  const [showExistingPrescriptions, setShowExistingPrescriptions] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showEnhancedMedicationTable, setShowEnhancedMedicationTable] = useState(false);
  
  // Section visibility states
  const [showVitalSigns, setShowVitalSigns] = useState(true);
  const [showDiagnosis, setShowDiagnosis] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showMedications, setShowMedications] = useState(true);
  const [showCompleteConfirmation, setShowCompleteConfirmation] = useState(false);
  const [showAddTestsForm, setShowAddTestsForm] = useState(false);
  
  // PDF Modal states
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<ExistingPrescription | null>(null);
  const [selectedPdfVersion, setSelectedPdfVersion] = useState<PrescriptionPDF | null>(null);

  // Medical Record Preview Modal states
  const [showRecordPreview, setShowRecordPreview] = useState(false);
  const [selectedRecordUrl, setSelectedRecordUrl] = useState<string | null>(null);
  const [selectedRecordTitle, setSelectedRecordTitle] = useState<string>("");
  const [recordPreviewFullscreen, setRecordPreviewFullscreen] = useState<boolean>(true);
  const [imageZoom, setImageZoom] = useState<number>(1);
  const [imageRotation, setImageRotation] = useState<number>(0);
  const [recordPdfBlobUrl, setRecordPdfBlobUrl] = useState<string | null>(null);
  const [recordPdfLoading, setRecordPdfLoading] = useState<boolean>(false);
  const [recordPdfError, setRecordPdfError] = useState<string | null>(null);

  const openPdfInSystemPrintViewer = (url: string) => {
    try {
      const printWindow = window.open('', '_blank', 'noopener,noreferrer');
      if (!printWindow) return;
      const escapedUrl = url.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      printWindow.document.open();
      printWindow.document.write(`<!doctype html><html><head><title>Print PDF</title><style>html,body{height:100%;margin:0;} iframe{border:0;width:100%;height:100%;}</style></head><body><iframe id="pdfFrame" src="${escapedUrl}"></iframe><script>\n(function(){\n  function trigger(){\n    try{window.focus(); setTimeout(function(){ window.print(); }, 300); }catch(e){}\n  }\n  const f = document.getElementById('pdfFrame');\n  if (f) { f.onload = trigger; } else { trigger(); }\n})();\n<\/script></body></html>`);
      printWindow.document.close();
    } catch (e) {
      console.error('Failed to open print viewer', e);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    // Reset transforms whenever a new record is opened
    if (showRecordPreview) {
      setImageZoom(1);
      setImageRotation(0);
    }
  }, [selectedRecordUrl, showRecordPreview]);

  // Fetch PDF as blob to avoid browser auto-download when server forces attachment
  useEffect(() => {
    let revokeUrl: string | null = null;
    const isPdf = !!selectedRecordUrl && /\.pdf(\?|$)/i.test(selectedRecordUrl);
    if (showRecordPreview && isPdf && selectedRecordUrl) {
      setRecordPdfLoading(true);
      setRecordPdfError(null);
      setRecordPdfBlobUrl(null);
      fetch(selectedRecordUrl, { mode: 'cors' })
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blob = await res.blob();
          const type = blob.type || 'application/pdf';
          const pdfBlob = blob.type ? blob : new Blob([blob], { type });
          const url = URL.createObjectURL(pdfBlob);
          setRecordPdfBlobUrl(url);
          revokeUrl = url;
        })
        .catch((err) => {
          console.error('PDF fetch failed:', err);
          setRecordPdfError('Unable to preview PDF due to browser or server restrictions.');
        })
        .finally(() => setRecordPdfLoading(false));
    }
    return () => {
      if (revokeUrl) {
        URL.revokeObjectURL(revokeUrl);
      }
      setRecordPdfBlobUrl(null);
      setRecordPdfLoading(false);
      setRecordPdfError(null);
    };
  }, [showRecordPreview, selectedRecordUrl]);

  // Data states
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [existingPrescriptions, setExistingPrescriptions] = useState<ExistingPrescription[]>([]);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [prescriptionInvestigations, setPrescriptionInvestigations] = useState<PrescriptionInvestigation[]>([]);



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

  // Auto-refresh vital signs when page comes into focus
  useEffect(() => {
    const handleFocus = () => {
      refreshConsultationData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [consultationId]);

  // Function to fetch vital signs specifically
  const fetchVitalSigns = async (consultationId: string) => {
    try {
      console.log('🔍 Fetching vital signs for consultation:', consultationId);
      
      // Try the specific vital signs endpoint first
      const response = await api.get(`/api/consultations/${consultationId}/vital-signs/`);
      console.log('🔍 Vital signs API response:', response.data);
      
      if (response.data && response.data.data) {
        const vitalSigns = response.data.data;
        console.log('🔍 Parsed vital signs data:', vitalSigns);
        
        setFormData(prev => ({
          ...prev,
          vital_signs: {
            pulse: vitalSigns.heart_rate?.toString() || vitalSigns.pulse?.toString() || prev.vital_signs.pulse,
            blood_pressure_systolic: vitalSigns.blood_pressure_systolic?.toString() || prev.vital_signs.blood_pressure_systolic,
            blood_pressure_diastolic: vitalSigns.blood_pressure_diastolic?.toString() || prev.vital_signs.blood_pressure_diastolic,
            temperature: vitalSigns.temperature?.toString() || prev.vital_signs.temperature,
            weight: vitalSigns.weight?.toString() || prev.vital_signs.weight,
            height: vitalSigns.height?.toString() || prev.vital_signs.height,
          }
        }));
        
        setLoadingVitalSigns(false);
        return vitalSigns;
      }
    } catch (error: any) {
      console.log('🔍 Vital signs API error (this is normal if no vital signs exist):', error.response?.status, error.response?.data);
      
      // If 404, it means no vital signs exist yet - this is normal
      if (error.response?.status === 404) {
        console.log('🔍 No vital signs found for this consultation yet');
        setLoadingVitalSigns(false);
        return null;
      }
      
      // For other errors, log them but don't fail
      console.error('Error fetching vital signs:', error);
      setLoadingVitalSigns(false);
    }
    
    return null;
  };

  // Function to refresh consultation data
  const refreshConsultationData = async () => {
    if (!consultationId) return;
    
    try {
      // Reload consultation details
      const consultData = await doctorConsultationApi.getConsultationDetails(consultationId);
      setConsultation(consultData);

      // Also fetch vital signs specifically
      await fetchVitalSigns(consultationId);

      // Fallback: check if vital signs are in consultation data
      if (consultData && (consultData as any).vital_signs) {
        console.log('🔄 Refreshed vital signs from consultation data:', (consultData as any).vital_signs);
        setFormData(prev => ({
          ...prev,
          vital_signs: {
            pulse: (consultData as any).vital_signs.heart_rate?.toString() || (consultData as any).vital_signs.pulse?.toString() || prev.vital_signs.pulse,
            blood_pressure_systolic: (consultData as any).vital_signs.blood_pressure_systolic?.toString() || prev.vital_signs.blood_pressure_systolic,
            blood_pressure_diastolic: (consultData as any).vital_signs.blood_pressure_diastolic?.toString() || prev.vital_signs.blood_pressure_diastolic,
            temperature: (consultData as any).vital_signs.temperature?.toString() || prev.vital_signs.temperature,
            weight: (consultData as any).vital_signs.weight?.toString() || prev.vital_signs.weight,
            height: (consultData as any).vital_signs.height?.toString() || prev.vital_signs.height,
          }
        }));
      }
    } catch (error) {
      console.error('Error refreshing consultation data:', error);
    }
  };

  useEffect(() => {
    const loadWorkspaceData = async () => {
      if (!consultationId) return;
      setLoading(true);
      
      try {
        // Load consultation details
        const consultData = await doctorConsultationApi.getConsultationDetails(consultationId);
        setConsultation(consultData);

        // Fetch vital signs specifically
        console.log('🔍 Fetching vital signs for consultation:', consultationId);
        await fetchVitalSigns(consultationId);

        if (consultData) {
          // Check if vital signs are also in consultation data (fallback)
          console.log('🔍 Consultation data vital signs:', (consultData as any).vital_signs);
          if ((consultData as any).vital_signs) {
            console.log('🔍 Setting vital signs from consultation data as fallback');
            setFormData(prev => ({
              ...prev,
              vital_signs: {
                pulse: (consultData as any).vital_signs.heart_rate?.toString() || (consultData as any).vital_signs.pulse?.toString() || prev.vital_signs.pulse,
                blood_pressure_systolic: (consultData as any).vital_signs.blood_pressure_systolic?.toString() || prev.vital_signs.blood_pressure_systolic,
                blood_pressure_diastolic: (consultData as any).vital_signs.blood_pressure_diastolic?.toString() || prev.vital_signs.blood_pressure_diastolic,
                temperature: (consultData as any).vital_signs.temperature?.toString() || prev.vital_signs.temperature,
                weight: (consultData as any).vital_signs.weight?.toString() || prev.vital_signs.weight,
                height: (consultData as any).vital_signs.height?.toString() || prev.vital_signs.height,
              }
            }));
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
                    const pdfResponse = await prescriptionApi.getPrescriptionPdfVersions(prescription.id.toString());
                    console.log(`PDF response for prescription ${prescription.id}:`, pdfResponse);
                    // Handle the API response structure: { data: { versions: [...] } }
                    const pdfVersions = pdfResponse?.data?.versions || pdfResponse?.versions || pdfResponse || [];
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
                composition: med.composition || '',
                dosage_form: med.dosage_form || 'tablet',
                dosage: med.dosage_display || `${med.morning_dose || 0}-${med.afternoon_dose || 0}-${med.evening_dose || 0}`,
                morning_dose: med.morning_dose || 0,
                afternoon_dose: med.afternoon_dose || 0,
                evening_dose: med.evening_dose || 0,
                frequency: med.frequency || 'once_daily',
                custom_frequency: med.custom_frequency || '',
                timing: med.timing || 'with_food',
                custom_timing: med.custom_timing || '',
                timing_display_text: med.timing_display_text || '',
                duration_days: med.duration_days || 7,
                duration_weeks: med.duration_weeks || 0,
                duration_months: med.duration_months || 0,
                is_continuous: med.is_continuous || false,
                special_instructions: med.special_instructions || '',
                notes: med.notes || '',
                before_meal: med.before_meal || false,
                is_generic: med.is_generic || false,
                quantity: med.quantity || '',
                order: med.order || 0,
              }));
              console.log('🔍 Loaded medications with dosage values:', localMedications.map(med => ({
                name: med.medicine_name,
                dosage: med.dosage,
                morning_dose: med.morning_dose,
                afternoon_dose: med.afternoon_dose,
                evening_dose: med.evening_dose,
                timing: med.timing,
                custom_timing: med.custom_timing,
                duration_days: med.duration_days,
                special_instructions: med.special_instructions,
                notes: med.notes
              })));
              
              console.log('🔍 Raw API medication data:', pres.medications.map((med: any) => ({
                id: med.id,
                medicine_name: med.medicine_name,
                timing: med.timing,
                custom_timing: med.custom_timing,
                duration_days: med.duration_days,
                special_instructions: med.special_instructions,
                notes: med.notes
              })));
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
                pulse: (consultData as any)?.vital_signs?.heart_rate?.toString() || (consultData as any)?.vital_signs?.pulse?.toString() || pres.pulse?.toString() || (pres as any).vital_signs?.pulse?.toString() || '',
                blood_pressure_systolic: (consultData as any)?.vital_signs?.blood_pressure_systolic?.toString() || pres.blood_pressure_systolic?.toString() || (pres as any).vital_signs?.blood_pressure_systolic?.toString() || '',
                blood_pressure_diastolic: (consultData as any)?.vital_signs?.blood_pressure_diastolic?.toString() || pres.blood_pressure_diastolic?.toString() || (pres as any).vital_signs?.blood_pressure_diastolic?.toString() || '',
                temperature: (consultData as any)?.vital_signs?.temperature?.toString() || pres.temperature?.toString() || (pres as any).vital_signs?.temperature?.toString() || '',
                weight: (consultData as any)?.vital_signs?.weight?.toString() || pres.weight?.toString() || (pres as any).vital_signs?.weight?.toString() || '',
                height: (consultData as any)?.vital_signs?.height?.toString() || pres.height?.toString() || (pres as any).vital_signs?.height?.toString() || '',
              },
            });
            
            console.log('🔍 Final vital signs set:', {
              pulse: (consultData as any)?.vital_signs?.heart_rate?.toString() || (consultData as any)?.vital_signs?.pulse?.toString() || pres.pulse?.toString() || (pres as any).vital_signs?.pulse?.toString() || '',
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
            timing: med.timing || 'with_food',
            custom_timing: med.custom_timing || '',
            timing_display_text: med.timing_display_text || '',
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
          timing: med.timing || 'with_food',
          custom_timing: med.custom_timing || '',
          timing_display_text: med.timing_display_text || '',
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
          timing: med.timing || 'with_food',
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
    setShowEnhancedMedicationTable(true);
  };

  const handleBulkSaveMedications = async (allMedications: Medication[]) => {
    try {
      console.log('💾 Saving all medications:', allMedications.map(m => ({ 
        name: m.medicine_name, 
        dosage: `${m.morning_dose}-${m.afternoon_dose}-${m.evening_dose}`,
        isNew: !(m.id && m.id > 0)
      })));
      if (!prescription?.id) throw new Error('Missing prescription id');

      // The EnhancedMedicationTable now sends ALL medications (both existing and new)
      // So we don't need to merge with existing medications anymore
      const medicationsToSave = allMedications.map((med, index) => ({
        medicine_name: med.medicine_name,
        composition: med.composition || '',
        dosage_form: med.dosage_form || 'tablet',
        morning_dose: med.morning_dose || 0,
        afternoon_dose: med.afternoon_dose || 0,
        evening_dose: med.evening_dose || 0,
        frequency: med.frequency || 'once_daily',
        timing: med.timing || 'with_food',
        custom_timing: med.custom_timing || '',
        timing_display_text: med.timing_display_text || '',
        duration_days: med.duration_days || 7,
        duration_weeks: med.duration_weeks || 0,
        duration_months: med.duration_months || 0,
        is_continuous: med.is_continuous || false,
        special_instructions: med.special_instructions || '',
        notes: med.notes || '',
        order: index + 1,
      }));

      await prescriptionApi.autoSave(prescription.id, { medications: medicationsToSave });

      // Update local state immediately to prevent duplication
      const updatedLocalMedications = allMedications.map((med, index) => ({
        id: med.id,
        medicine_name: med.medicine_name || '',
        composition: med.composition || '',
        dosage_form: med.dosage_form || 'tablet',
        dosage: `${med.morning_dose || 0}-${med.afternoon_dose || 0}-${med.evening_dose || 0}`,
        morning_dose: med.morning_dose || 0,
        afternoon_dose: med.afternoon_dose || 0,
        evening_dose: med.evening_dose || 0,
        frequency: med.frequency || 'once_daily',
        custom_frequency: med.custom_frequency || '',
        timing: med.timing || 'with_food',
        custom_timing: med.custom_timing || '',
        timing_display_text: med.timing_display_text || '',
        duration_days: med.duration_days || 7,
        duration_weeks: med.duration_weeks || 0,
        duration_months: med.duration_months || 0,
        is_continuous: med.is_continuous || false,
        special_instructions: med.special_instructions || '',
        notes: med.notes || '',
        before_meal: med.before_meal || false,
        is_generic: med.is_generic || false,
        quantity: med.quantity || '',
        order: index + 1,
      }));
      
      console.log('🔄 Updated local medications:', updatedLocalMedications.length);
      setMedications(updatedLocalMedications);

      // Close dialog
      setShowEnhancedMedicationTable(false);
      
      // Reload from API to get the latest state with proper IDs for new medications
      if (consultationId) {
        const updatedPrescription = await prescriptionApi.getConsultationPrescription(consultationId);
        setPrescription(updatedPrescription);
        if (updatedPrescription.medications && Array.isArray(updatedPrescription.medications)) {
          const localMedications = updatedPrescription.medications.map((med: any) => ({
            id: med.id,
            medicine_name: med.medicine_name || '',
            composition: med.composition || '',
            dosage_form: med.dosage_form || 'tablet',
            dosage: med.dosage_display || `${med.morning_dose || 0}-${med.afternoon_dose || 0}-${med.evening_dose || 0}`,
            morning_dose: med.morning_dose || 0,
            afternoon_dose: med.afternoon_dose || 0,
            evening_dose: med.evening_dose || 0,
            frequency: med.frequency || 'once_daily',
            custom_frequency: med.custom_frequency || '',
            timing: med.timing || 'with_food',
            custom_timing: med.custom_timing || '',
            timing_display_text: med.timing_display_text || '',
            duration_days: med.duration_days || 7,
            duration_weeks: med.duration_weeks || 0,
            duration_months: med.duration_months || 0,
            is_continuous: med.is_continuous || false,
            special_instructions: med.special_instructions || '',
            notes: med.notes || '',
            before_meal: med.before_meal || false,
            is_generic: med.is_generic || false,
            quantity: med.quantity || '',
            order: med.order || 0,
          }));
          console.log('🔄 Final medications from API:', localMedications.length);
          setMedications(localMedications);
        }
      }
    } catch (error) {
      console.error('Error saving medications:', error);
      throw error;
    }
  };

  const handleDeleteMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
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
      case 'with_food': return 'After Food';
      case 'before_breakfast': return 'Before Food';
      case 'empty_stomach': return 'Empty Stomach';
      case 'bedtime': return 'Bedtime';
      case 'custom': return custom || 'Custom timing';
      // Legacy backwards compatibility
      case 'after_breakfast':
      case 'after_lunch':
      case 'after_dinner': return 'After Food';
      case 'before_lunch':
      case 'before_dinner': return 'Before Food';
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
    <div className="h-screen bg-gray-50 flex flex-col consultation-workspace">
      {/* Header */}
      <div className="bg-white border-b px-3 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/doctor/dashboard')} className="h-7 w-7 p-0">
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">Consultation Workspace</h1>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <span>ID: {consultationId}</span>
              {consultation && (
                <>
                  <Separator orientation="vertical" className="h-3" />
                  <span>{consultation.scheduled_date} at {consultation.scheduled_time}</span>
                  <Separator orientation="vertical" className="h-3" />
                  <Badge variant={
                    consultation.status === 'scheduled' ? 'default' : 
                    consultation.status === 'completed' ? 'secondary' : 
                    consultation.status === 'ongoing' || consultation.status === 'in progress' || consultation.status === 'in_progress' ? 'destructive' :
                    'default'
                  } className="text-xs px-1.5 py-0">
                    {consultation.status === 'completed' ? 'Completed' : 
                     consultation.status === 'in progress' || consultation.status === 'in_progress' ? 'In Progress' :
                     consultation.status?.replace('_', ' ')}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          {/* Complete Consultation Button - Show for multiple statuses */}
          
          {(consultation?.status === 'ongoing' || 
            consultation?.status === 'in progress' || 
            consultation?.status === 'in_progress' ||
            consultation?.status === 'active') && (
            <Button 
              onClick={() => setShowCompleteConfirmation(true)} 
              disabled={completing} 
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs px-2"
            >
              {completing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
              <span className="ml-1">Complete</span>
            </Button>
          )}
          
          <Button variant="outline" onClick={handleSaveDraft} disabled={saving || finalizing} size="sm" className="h-7 text-xs px-2">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            <span className="ml-1">Save</span>
          </Button>
          <Button onClick={handleFinalize} disabled={finalizing || saving} size="sm" className="h-7 text-xs px-2">
            {finalizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Printer className="w-3 h-3" />}
            <span className="ml-1">Finalize</span>
          </Button>
          {latestPdfUrl && (
            <a href={latestPdfUrl} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="sm" className="h-7 text-xs px-2">
                <Download className="w-3 h-3" />
                <span className="ml-1">PDF</span>
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden bg-slate-50">
        {/* Left Sidebar - Patient Info */}
        <div className={`${isSidebarCollapsed ? 'w-10' : 'w-56 lg:w-64'} bg-white border-r border-slate-200 overflow-y-auto transition-all duration-300 shadow-sm scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100`}>
          {isSidebarCollapsed ? (
            // Collapsed sidebar - just icons
            <div className="p-1 space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 hover:bg-blue-50 hover:text-blue-600 transition-colors p-0"
                onClick={() => setIsSidebarCollapsed(false)}
                title="Expand sidebar"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 hover:bg-blue-50 hover:text-blue-600 transition-colors p-0"
                  onClick={() => setShowPatientDetails(!showPatientDetails)}
                  title="Patient Profile"
                >
                  <User className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 hover:bg-emerald-50 hover:text-emerald-600 transition-colors p-0"
                  onClick={() => setShowMedicalHistory(!showMedicalHistory)}
                  title="Medical History"
                >
                  <History className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 hover:bg-indigo-50 hover:text-indigo-600 transition-colors p-0"
                  onClick={() => setShowExistingPrescriptions(!showExistingPrescriptions)}
                  title="Previous Prescriptions"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            // Expanded sidebar - full content
            <div className="p-2 space-y-3">
              {/* Collapse button */}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarCollapsed(true)}
                  title="Collapse sidebar"
                  className="hover:bg-blue-50 hover:text-blue-600 transition-colors h-6 p-0 w-6"
                >
                  <ChevronLeft className="w-3 h-3" />
                </Button>
              </div>

              {/* Patient Profile */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-1.5 pt-2 px-2.5 bg-gradient-to-r from-blue-50 via-blue-50 to-indigo-50 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs flex items-center gap-1.5 text-slate-800 font-semibold">
                      <div className="p-1 bg-blue-100 rounded">
                        <User className="w-3 h-3 text-blue-600" />
                      </div>
                      Patient Profile
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPatientDetails(!showPatientDetails)}
                      className="h-5 w-5 p-0 hover:bg-blue-100 transition-colors"
                    >
                      {showPatientDetails ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </Button>
                  </div>
                </CardHeader>
                {showPatientDetails && (
                  <CardContent className="space-y-2 bg-white p-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-9 w-9 ring-1 ring-blue-100">
                        <AvatarImage src={patientProfile?.profile_picture || consultation?.patient?.profile_picture} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-semibold text-xs">
                          {(patientProfile?.name || consultation?.patient?.name || 'P').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-xs text-slate-800 truncate">
                          {patientProfile?.user_name || patientProfile?.name || consultation?.patient_name || consultation?.patient?.name || 'Unknown Patient'}
                        </h3>
                        <p className="text-[10px] text-slate-600">
                          {patientProfile?.date_of_birth || consultation?.patient?.date_of_birth
                            ? `${calculateAge(patientProfile?.date_of_birth || consultation?.patient?.date_of_birth)} years`
                            : 'Age not available'
                          } • {patientProfile?.gender || consultation?.patient?.gender || 'Gender not specified'}
                        </p>
                      </div>
                    </div>
                    

                    {patientProfile?.allergies && (
                      <div className="p-2 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded">
                        <div className="flex items-start gap-1.5">
                          <div className="p-0.5 bg-red-100 rounded mt-0.5">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-red-800 mb-0.5">Allergies</p>
                            <p className="text-[10px] text-red-700 leading-tight">{patientProfile.allergies}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {patientProfile?.current_medications && (
                      <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded">
                        <div className="flex items-start gap-1.5">
                          <div className="p-0.5 bg-blue-100 rounded mt-0.5">
                            <Pill className="w-3 h-3 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-blue-800 mb-0.5">Current Medications</p>
                            <p className="text-[10px] text-blue-700 leading-tight">{patientProfile.current_medications}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>

              {/* Medical History */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-1.5 pt-2 px-2.5 bg-gradient-to-r from-emerald-50 via-emerald-50 to-teal-50 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs flex items-center gap-1.5 text-slate-800 font-semibold">
                      <div className="p-1 bg-emerald-100 rounded">
                        <History className="w-3 h-3 text-emerald-600" />
                      </div>
                      Medical History
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMedicalHistory(!showMedicalHistory)}
                      className="h-5 w-5 p-0 hover:bg-emerald-100 transition-colors"
                    >
                      {showMedicalHistory ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </Button>
                  </div>
                </CardHeader>
                {showMedicalHistory && (
                  <CardContent className="bg-white p-2 space-y-2">
                    {/* {(patientProfile?.user?.medical_history || patientProfile?.medical_history || consultation?.patient?.medical_history) ? (
                      <div className="p-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded">
                        <p className="text-[10px] text-slate-700 leading-tight">
                          {patientProfile?.user?.medical_history || patientProfile?.medical_history || consultation?.patient?.medical_history}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                        <p className="text-[10px] text-slate-500 italic text-center">No medical history recorded</p>
                      </div>
                    )} */}
                    
                    {loadingRecords ? (
                      <div className="flex items-center justify-center py-3">
                        <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                      </div>
                    ) : medicalRecords.length > 0 ? (
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-semibold text-slate-700 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-emerald-600" />
                          Medical Records
                        </h4>
                        {medicalRecords.slice(0, 3).map((record) => (
                          <div key={record.id} className="flex items-center justify-between p-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded">
                            <div className="flex items-center gap-1.5">
                              <div className="p-0.5 bg-emerald-100 rounded">
                                <FileText className="w-2.5 h-2.5 text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-[10px] font-medium text-slate-800 truncate max-w-[120px]">{record.title}</p>
                                <p className="text-[9px] text-slate-600">{new Date(record.date_recorded).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-5 w-5 p-0 hover:bg-emerald-100 transition-colors"
                              onClick={() => {
                                setSelectedRecordUrl(record.document_url);
                                setSelectedRecordTitle(record.title || 'Medical Record');
                                setRecordPreviewFullscreen(true);
                                setShowRecordPreview(true);
                              }}
                              title="Preview"
                            >
                              <Eye className="w-2.5 h-2.5" />
                            </Button>
                          </div>
                        ))}
                        {medicalRecords.length > 3 && (
                          <div className="text-center py-1">
                            <p className="text-[9px] text-slate-500 bg-slate-100 rounded-full px-2 py-0.5 inline-block">
                              +{medicalRecords.length - 3} more records
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                        <p className="text-[10px] text-slate-500 italic text-center">No medical records uploaded</p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>

              {/* Previous Prescriptions */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-1.5 pt-2 px-2.5 bg-gradient-to-r from-indigo-50 via-indigo-50 to-purple-50 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs flex items-center gap-1.5 text-slate-800 font-semibold">
                      <div className="p-1 bg-indigo-100 rounded">
                        <Stethoscope className="w-3 h-3 text-indigo-600" />
                      </div>
                      Previous Prescriptions
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowExistingPrescriptions(!showExistingPrescriptions)}
                      className="h-5 w-5 p-0 hover:bg-indigo-100 transition-colors"
                    >
                      {showExistingPrescriptions ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </Button>
                  </div>
                </CardHeader>
                {showExistingPrescriptions && (
                  <CardContent className="bg-white p-2 space-y-2">
                    {existingPrescriptions.length > 0 ? (
                      <div className="space-y-1.5">
                        {existingPrescriptions.slice(0, 5).map((pres, index) => (
                          <div key={pres.id?.toString() || `prescription-${index}`} className="border border-slate-200 rounded p-2 bg-gradient-to-r from-indigo-50 to-purple-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-semibold text-slate-800 truncate mb-0.5">
                                  {pres.primary_diagnosis || 'No diagnosis'}
                                </p>
                                <p className="text-[9px] text-slate-600 mb-1">
                                  {new Date(pres.issued_date).toLocaleDateString()} • {pres.medications?.length || 0} meds
                                </p>
                                <div className="flex items-center gap-1">
                                  {pres.is_finalized ? (
                                    <Badge variant="secondary" className="text-[9px] bg-green-100 text-green-800 border-green-200 px-1 py-0 h-4">
                                      <CheckCircle className="w-2 h-2 mr-0.5" />
                                      Finalized
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[9px] border-slate-300 text-slate-600 px-1 py-0 h-4">
                                      Draft
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-0.5 ml-1">
                                {pres.current_pdf && (
                                  <a href={pres.current_pdf.file_url} target="_blank" rel="noreferrer">
                                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-indigo-100 transition-colors">
                                      <Download className="w-2.5 h-2.5" />
                                    </Button>
                                  </a>
                                )}
                                {pres.pdf_versions && pres.pdf_versions.length > 0 && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-5 w-5 p-0 hover:bg-indigo-100 transition-colors"
                                    onClick={() => {
                                      setSelectedPrescription(pres);
                                      setShowPdfModal(true);
                                    }}
                                  >
                                    <Eye className="w-2.5 h-2.5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {existingPrescriptions.length > 5 && (
                          <div className="text-center py-1">
                            <p className="text-[9px] text-slate-500 bg-slate-100 rounded-full px-2 py-0.5 inline-block">
                              +{existingPrescriptions.length - 5} more prescriptions
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                        <p className="text-[10px] text-slate-500 italic text-center">No previous prescriptions</p>
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
          <div className={`${isVideoMaximized ? 'w-full' : 'flex-1'} bg-white border-r border-slate-200 transition-all duration-300 shadow-sm`}>
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-2 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold flex items-center gap-1.5 text-slate-800">
                    <Video className="w-4 h-4 text-blue-600" />
                    Jitsi Meet - Dirac AI
                  </h2>
                  <div className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                    <AlertCircle className="w-2.5 h-2.5" />
                    <span>Video conferencing</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVideoMaximized(!isVideoMaximized)}
                    className="border-slate-300 hover:bg-blue-50 hover:border-blue-300 h-6 w-6 p-0"
                  >
                    {isVideoMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 p-2 bg-slate-50">
                <div className="w-full h-full relative">
                  {/* Doctor's individual Jitsi Meet iframe */}
                  <iframe
                    src={consultation?.doctor_meeting_link || "https://meet.diracai.com/office"}
                    className="w-full h-full rounded-lg border border-slate-200 shadow-sm bg-white"
                    allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
                    allowFullScreen
                    title="Jitsi Meet - Dirac AI"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-camera allow-microphone"
                    onLoad={() => {
                      console.log('🎥 Jitsi Meet iframe loaded successfully');
                      console.log('🔗 Current iframe src:', consultation?.doctor_meeting_link || "https://meet.diracai.com/office");
                    }}
                    onError={(e) => {
                      console.error('❌ Jitsi Meet iframe failed to load:', e);
                    }}
                  />
                  
                  {/* Fallback message if iframe doesn't load */}
                  <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg hidden" id="iframe-fallback">
                    <div className="text-center p-4">
                      <Video className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Meeting</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Meeting Link: {consultation?.doctor_meeting_link || "https://meet.diracai.com/office"}
                      </p>
                      <Button 
                        onClick={() => window.open(consultation?.doctor_meeting_link || "https://meet.diracai.com/office", '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Open Meeting in New Tab
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prescription Writer Section */}
          {!isVideoMaximized && (
            <div className="w-[500px] bg-slate-50 overflow-y-auto">
              <div className="p-2 space-y-1">
                <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                  <h2 className="text-sm font-semibold flex items-center gap-1.5 text-slate-800">
                    <Edit className="w-3.5 h-3.5 text-emerald-600" />
                    Prescription Writer
                  </h2>
                  {prescription?.is_finalized && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-[10px] px-1.5 py-0 h-4">
                      <CheckCircle className="w-2 h-2 mr-0.5" />
                      Finalized
                    </Badge>
                  )}
                </div>

                {/* Vital Signs */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-1.5 pt-2 px-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CardTitle className="text-xs flex items-center gap-1 text-slate-800 font-semibold">
                          <Heart className="w-3 h-3 text-emerald-600" />
                          Vital Signs
                        </CardTitle>
                        <div className="flex items-center gap-0.5 text-[9px] text-emerald-600 bg-emerald-100 px-1 py-0.5 rounded-full">
                          <Eye className="w-2 h-2" />
                          <span>Read-only</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            setLoadingVitalSigns(true);
                            await fetchVitalSigns(consultationId || '');
                          }}
                          className="h-5 w-5 p-0 hover:bg-blue-100"
                          title="Fetch vital signs"
                        >
                          <RefreshCw className="w-3 h-3 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowVitalSigns(!showVitalSigns)}
                          className="h-5 w-5 p-0 hover:bg-emerald-100"
                        >
                          {showVitalSigns ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {showVitalSigns && (
                    <CardContent className="bg-white p-2">
                      {loadingVitalSigns ? (
                        <div className="flex items-center justify-center py-3">
                          <Loader2 className="w-3 h-3 animate-spin text-emerald-600 mr-1" />
                          <span className="text-[10px] text-slate-600">Loading...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-6 gap-1">
                          <div className="text-center">
                            <div className="text-[10px] text-slate-600 mb-1">Pulse</div>
                            <div className="flex items-center justify-center gap-0.5 p-1 bg-slate-50 border border-slate-200 rounded text-center">
                              <span className="text-[10px] font-medium text-slate-800">
                                {formData.vital_signs.pulse || '-'}
                              </span>
                              <span className="text-[9px] text-slate-500">bpm</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] text-slate-600 mb-1">Temp</div>
                            <div className="flex items-center justify-center gap-0.5 p-1 bg-slate-50 border border-slate-200 rounded text-center">
                              <span className="text-[10px] font-medium text-slate-800">
                                {formData.vital_signs.temperature || '-'}
                              </span>
                              <span className="text-[9px] text-slate-500">°C</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] text-slate-600 mb-1">BP Sys</div>
                            <div className="flex items-center justify-center gap-0.5 p-1 bg-slate-50 border border-slate-200 rounded text-center">
                              <span className="text-[10px] font-medium text-slate-800">
                                {formData.vital_signs.blood_pressure_systolic || '-'}
                              </span>
                              <span className="text-[9px] text-slate-500">mmHg</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] text-slate-600 mb-1">BP Dia</div>
                            <div className="flex items-center justify-center gap-0.5 p-1 bg-slate-50 border border-slate-200 rounded text-center">
                              <span className="text-[10px] font-medium text-slate-800">
                                {formData.vital_signs.blood_pressure_diastolic || '-'}
                              </span>
                              <span className="text-[9px] text-slate-500">mmHg</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] text-slate-600 mb-1">Weight</div>
                            <div className="flex items-center justify-center gap-0.5 p-1 bg-slate-50 border border-slate-200 rounded text-center">
                              <span className="text-[10px] font-medium text-slate-800">
                                {formData.vital_signs.weight || '-'}
                              </span>
                              <span className="text-[9px] text-slate-500">kg</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] text-slate-600 mb-1">Height</div>
                            <div className="flex items-center justify-center gap-0.5 p-1 bg-slate-50 border border-slate-200 rounded text-center">
                              <span className="text-[10px] font-medium text-slate-800">
                                {formData.vital_signs.height || '-'}
                              </span>
                              <span className="text-[9px] text-slate-500">cm</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
              </Card>

                {/* Diagnosis */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-1.5 pt-2 px-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs flex items-center gap-1 text-slate-800 font-semibold">
                        <Stethoscope className="w-3 h-3 text-blue-600" />
                        Diagnosis
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDiagnosis(!showDiagnosis)}
                        className="h-5 w-5 p-0 hover:bg-blue-100"
                      >
                        {showDiagnosis ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      </Button>
                    </div>
                  </CardHeader>
                  {showDiagnosis && (
                    <CardContent className="space-y-1 bg-white p-2">
                    <div>
                      <Label className="text-[10px] text-slate-700">Primary Diagnosis</Label>
                      <Textarea
                        rows={2}
                        value={formData.primary_diagnosis}
                        onChange={(e) => setFormData({ ...formData, primary_diagnosis: e.target.value })}
                        placeholder="Enter primary diagnosis..."
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-1 focus:outline-none text-xs p-1.5 min-h-[50px]"
                      />
                    </div>
                    {/* <div>
                      <Label className="text-[10px] text-slate-700">Patient Previous History</Label>
                      <Textarea
                        rows={2}
                        value={formData.patient_previous_history}
                        onChange={(e) => setFormData({ ...formData, patient_previous_history: e.target.value })}
                        placeholder="Enter patient's previous medical history..."
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-xs p-1.5 min-h-[50px]"
                      />
                    </div> */}
                  </CardContent>
                )}
              </Card>

              {/* Investigation Tests */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-1.5 pt-2 px-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                  <div className="flex items-center justify-between w-full">
                    <CardTitle className="text-xs flex items-center gap-1 text-slate-800 font-semibold">
                      <Stethoscope className="w-3 h-3 text-blue-600" />
                      Investigation Tests
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => setShowAddTestsForm(true)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-8 px-4 text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-300 border border-blue-400 hover:border-blue-300"
                      >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Add Tests
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="bg-white p-2">
                  <InvestigationSelector
                    prescriptionId={prescription?.id || 0}
                    onInvestigationsUpdated={handleInvestigationsUpdated}
                    existingInvestigations={prescriptionInvestigations}
                    showAddForm={showAddTestsForm}
                    onShowAddFormChange={setShowAddTestsForm}
                  />
                </CardContent>
              </Card>

              {/* Medications Summary */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-1.5 pt-2 px-2.5 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs flex items-center gap-1 text-slate-800 font-semibold">
                        <Pill className="w-3 h-3 text-purple-600" />
                        Medications ({medications.length})
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowMedications(!showMedications)}
                          className="h-5 w-5 p-0 hover:bg-purple-100"
                        >
                          {showMedications ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </Button>
                        <Button 
                          onClick={handleAddMedication}
                          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-8 px-4 text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-300 border border-purple-400 hover:border-purple-300 w-full"
                        >
                          <Plus className="w-4 h-4 mr-1.5" />
                          Add Medications
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {showMedications && (
                    <CardContent className="bg-white p-2">
                      {medications.length > 0 ? (
                        <div className="space-y-1.5">
                          {medications.map((med, index) => (
                            <div key={med.id || `med-${index}`} className="p-2 border border-slate-200 rounded bg-purple-50">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <div className="p-0.5 bg-purple-100 rounded">
                                      <Pill className="w-3 h-3 text-purple-600" />
                                    </div>
                                    <p className="text-xs font-medium text-slate-800">{med.medicine_name}</p>
                                  </div>
                                  <p className="text-[10px] text-slate-600">
                                    {med.dosage} • {getFrequencyDisplay(med.frequency, med.custom_frequency)}
                                  </p>
                                  <p className="text-[10px] text-slate-600">
                                    {(med.timing_display_text || getTimingDisplay(med.timing, med.custom_timing))} • {med.duration_days} days
                                  </p>
                                  {med.special_instructions && (
                                    <p className="text-[10px] text-slate-500 mt-0.5">{med.special_instructions}</p>
                                  )}
                                </div>
                                <div className="flex gap-0.5">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-5 w-5 p-0 hover:bg-red-100 text-red-600"
                                    onClick={() => handleDeleteMedication(index)}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Pill className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                          <p className="text-xs text-slate-500">No medications added yet</p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>

              {/* Patient Instructions & Follow-up - Moved to Bottom */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-1.5 pt-2 px-2.5 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs flex items-center gap-1 text-slate-800 font-semibold">
                      <Clock className="w-3 h-3 text-purple-600" />
                      Follow-up & Instructions
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInstructions(!showInstructions)}
                      className="h-5 w-5 p-0 hover:bg-purple-100"
                    >
                      {showInstructions ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </Button>
                  </div>
                </CardHeader>
                {showInstructions && (
                  <CardContent className="space-y-2 bg-white p-2">
                    <div>
                      <Label className="text-[10px] text-slate-700">Patient Instructions</Label>
                      <Textarea
                        rows={3}
                        value={formData.general_instructions}
                        onChange={(e) => setFormData({ ...formData, general_instructions: e.target.value })}
                        placeholder="Enter special instructions for the patient (e.g., rest, diet, lifestyle advice)..."
                        className="border-slate-300 focus:border-purple-500 focus:ring-purple-500 focus:ring-1 focus:outline-none text-xs p-1.5 min-h-[60px]"
                      />
                    </div>

                    <div>
                      <Label className="text-[10px] text-slate-700">Next Visit</Label>
                      <Select
                        value={formData.next_visit}
                        onValueChange={(value) => setFormData({ ...formData, next_visit: value })}
                      >
                        <SelectTrigger className="border-slate-300 focus:border-purple-500 focus:ring-purple-500 focus:ring-1 focus:outline-none h-7 text-xs">
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

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Medication Table */}
      <EnhancedMedicationTable
        isOpen={showEnhancedMedicationTable}
        onClose={() => setShowEnhancedMedicationTable(false)}
        onSave={handleBulkSaveMedications}
        consultationId={consultationId || ''}
        existingMedications={medications}
      />

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

      {/* Medical Record Viewer Modal */}
      <Dialog open={showRecordPreview} onOpenChange={setShowRecordPreview}>
        <DialogContent className={`${recordPreviewFullscreen ? 'w-[96vw] max-w-[96vw] h-[92vh]' : 'max-w-4xl max-h-[90vh]'} overflow-hidden`}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 truncate">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span className="truncate" title={selectedRecordTitle}>{selectedRecordTitle || 'Medical Record'}</span>
              </span>
              <div className="flex items-center gap-2">
                {/* Image controls (only show for non-PDFs) */}
                {selectedRecordUrl && !/\.pdf(\?|$)/i.test(selectedRecordUrl) && (
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => setImageRotation((r) => (r + 90) % 360)}
                      title="Rotate"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => setImageZoom((z) => Math.max(0.25, Number((z - 0.25).toFixed(2))))}
                      title="Zoom Out"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => setImageZoom((z) => Math.min(4, Number((z + 0.25).toFixed(2))))}
                      title="Zoom In"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-2 text-xs"
                      onClick={() => { setImageZoom(1); setImageRotation(0); }}
                      title="Reset"
                    >
                      Reset
                    </Button>
                  </div>
                )}
                {selectedRecordUrl && /\.pdf(\?|$)/i.test(selectedRecordUrl) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 px-2 text-xs"
                    onClick={() => openPdfInSystemPrintViewer(recordPdfBlobUrl || selectedRecordUrl)}
                    title="Print PDF"
                  >
                    Print
                  </Button>
                )}
                {selectedRecordUrl && (
                  <a href={selectedRecordUrl} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Open
                    </Button>
                  </a>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  onClick={() => setRecordPreviewFullscreen(!recordPreviewFullscreen)}
                  title={recordPreviewFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {recordPreviewFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              Preview the medical record. Supports PDF and images.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 border border-slate-200 rounded-lg overflow-hidden bg-white">
            {selectedRecordUrl ? (
              <div className="w-full h-[70vh] md:h-[75vh]">
                {/* Heuristic: if URL ends with .pdf treat as PDF */}
                {/\.pdf(\?|$)/i.test(selectedRecordUrl) ? (
                  <div className="w-full h-full">
                    {recordPdfLoading && (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">Loading PDF…</div>
                    )}
                    {!recordPdfLoading && recordPdfBlobUrl && (
                      <iframe
                        src={`${recordPdfBlobUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                        className="w-full h-full"
                        title="Medical Record PDF"
                      />
                    )}
                    {!recordPdfLoading && !recordPdfBlobUrl && (
                      <div className="w-full h-full flex items-center justify-center p-4 text-center">
                        <div>
                          <p className="text-slate-600 text-sm mb-3">{recordPdfError || 'PDF preview is unavailable.'}</p>
                          <a href={selectedRecordUrl} target="_blank" rel="noreferrer">
                            <Button variant="outline" size="sm">Open PDF in new tab</Button>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full overflow-auto bg-slate-50">
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <img 
                        src={selectedRecordUrl} 
                        alt={selectedRecordTitle}
                        className="max-w-none object-contain"
                        style={{ transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`, transformOrigin: 'center center' }}
                        onError={(e) => {
                          const container = (e.target as HTMLImageElement).parentElement;
                          if (container) {
                            container.innerHTML = `<iframe src='${selectedRecordUrl}' class='w-full h-[70vh] md:h-[75vh]'></iframe>`;
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-slate-500 text-sm">No record selected</p>
              </div>
            )}
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