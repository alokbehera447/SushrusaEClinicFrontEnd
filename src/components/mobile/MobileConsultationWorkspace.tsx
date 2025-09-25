import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';
import { 
  ArrowLeft,
  Video,
  Loader2,
  User,
  Heart,
  FileText,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  Upload,
  Camera,
  Download,
  CheckCircle,
  Stethoscope,
  AlertCircle,
  History,
  Eye,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { prescriptionApi, doctorConsultationApi, api } from '@/lib/api';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface PatientProfile {
  id: string;
  user_name?: string;
  user_phone?: string;
  user_email?: string;
  name?: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  profile_picture?: string;
  age?: number;
  emergency_contact?: string;
  medical_history?: string;
  allergies?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  registration_number: string;
  profile_picture?: string;
}

interface Consultation {
  id: string;
  patient: PatientProfile;
  doctor: Doctor;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  chief_complaint?: string;
  consultation_type?: string;
  duration_minutes?: number;
  notes?: string;
  vital_signs?: any;
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
  filename: string;
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

interface Prescription {
  id: number;
  consultation_id: string;
  patient: PatientProfile;
  doctor: any;
  issued_date: string;
  issued_time: string;
  primary_diagnosis: string;
  patient_previous_history: string;
  general_instructions: string;
  next_visit: string;
  vital_signs: any;
  is_draft: boolean;
  is_finalized: boolean;
  medications: any[];
  investigations: any[];
  patient_history: any[];
}

const MobileConsultationWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { consultationId } = useParams<{ consultationId: string }>();
  
  // State
  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [consultationHistory, setConsultationHistory] = useState<any[]>([]);
  
  // PDF Modal states
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<ExistingPrescription | null>(null);
  const [selectedPdfVersion, setSelectedPdfVersion] = useState<PrescriptionPDF | null>(null);
  
  // Existing prescriptions state
  const [existingPrescriptions, setExistingPrescriptions] = useState<ExistingPrescription[]>([]);
  const [showExistingPrescriptions, setShowExistingPrescriptions] = useState(false);
  
  // Debug: Log state changes
  useEffect(() => {
    console.log('🔍 Existing prescriptions state changed:', existingPrescriptions.length, existingPrescriptions);
  }, [existingPrescriptions]);
  
  // Vital signs state
  const [vitalSigns, setVitalSigns] = useState({
    pulse: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    temperature: '',
    weight: '',
    height: '',
  });
  
  // Photo upload state
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load consultation data
  useEffect(() => {
    const loadConsultationData = async () => {
      if (!consultationId) return;
      
      setLoading(true);
      try {
        // Load consultation details
        const consultData = await doctorConsultationApi.getConsultationDetails(consultationId);
        console.log('🔍 Consultation data:', consultData);
        console.log('🔍 Patient data:', consultData.patient);
        console.log('🔍 Patient ID:', consultData.patient?.id);
        setConsultation(consultData);
        setPatientProfile(consultData.patient);

        // Load prescription
        try {
          const pres = await prescriptionApi.getConsultationPrescription(consultationId);
          setPrescription(pres);
          
          // Set vital signs from prescription or consultation
          const vitals = pres.vital_signs || consultData.vital_signs;
          if (vitals) {
            setVitalSigns({
              pulse: vitals.pulse?.toString() || '',
              blood_pressure_systolic: vitals.blood_pressure_systolic?.toString() || '',
              blood_pressure_diastolic: vitals.blood_pressure_diastolic?.toString() || '',
              temperature: vitals.temperature?.toString() || '',
              weight: vitals.weight?.toString() || '',
              height: vitals.height?.toString() || '',
            });
          }
          
          // Set patient history
          setPatientHistory(pres.patient_history || []);
        } catch (err) {
          console.error('Error loading prescription:', err);
        }

        // Load existing prescriptions for this patient
        try {
          const patientId = typeof consultData.patient === 'string' ? consultData.patient : consultData.patient?.id;
          console.log('🔍 Loading existing prescriptions for patient:', patientId);
          
          if (!patientId) {
            console.error('🔍 No patient ID found in consultation data');
            setExistingPrescriptions([]);
            return;
          }
          
          // Always try to get the current consultation's prescription first
          let prescriptions = [];
          try {
            const currentPrescription = await prescriptionApi.getConsultationPrescription(consultationId);
            if (currentPrescription) {
              console.log('🔍 Found current consultation prescription:', currentPrescription);
              prescriptions = [currentPrescription];
            } else {
              console.log('🔍 No current consultation prescription found');
            }
          } catch (currentPresError) {
            console.error('🔍 Error loading current consultation prescription:', currentPresError);
          }
          
          // Also try to get prescriptions for this patient to add more prescriptions
          try {
            const prescriptionsResponse = await prescriptionApi.getPrescriptions({ patient: patientId });
            console.log('🔍 Patient prescriptions response:', prescriptionsResponse);
            const patientPrescriptions = prescriptionsResponse?.results || prescriptionsResponse || [];
            console.log('🔍 Patient prescriptions array:', patientPrescriptions);
            
            // Add patient prescriptions that are not already in the array
            patientPrescriptions.forEach(patientPres => {
              if (!prescriptions.find(p => p.id === patientPres.id)) {
                console.log('🔍 Adding patient prescription:', patientPres.id);
                prescriptions.push(patientPres);
              }
            });
          } catch (patientPresError) {
            console.error('🔍 Error loading patient prescriptions:', patientPresError);
          }
          
          console.log('🔍 Final prescriptions array before PDF loading:', prescriptions.length, prescriptions);
          
          // Load PDF versions for each prescription
          console.log('🔍 Starting to load PDF versions for', prescriptions.length, 'prescriptions');
          const prescriptionsWithPdfs = await Promise.all(
            prescriptions.map(async (prescription: any) => {
              console.log('🔍 Processing prescription:', prescription.id, prescription);
              if (!prescription?.id) {
                console.log('🔍 Skipping prescription without ID:', prescription);
                return prescription;
              }
              
              try {
                console.log(`🔍 Loading PDF versions for prescription ${prescription.id}`);
                const pdfResponse = await prescriptionApi.getPrescriptionPdfVersions(prescription.id.toString());
                console.log(`🔍 PDF response for prescription ${prescription.id}:`, pdfResponse);
                // Handle the API response structure: { data: { versions: [...] } }
                const pdfVersions = pdfResponse?.data?.versions || pdfResponse?.versions || pdfResponse || [];
                console.log(`🔍 PDF versions for prescription ${prescription.id}:`, pdfVersions);
                const result = {
                  ...prescription,
                  pdf_versions: pdfVersions,
                  current_pdf: pdfVersions.find((pdf: any) => pdf.is_current) || null
                };
                console.log(`🔍 Final prescription object for ${prescription.id}:`, result);
                return result;
              } catch (error) {
                console.error(`Error loading PDF versions for prescription ${prescription.id}:`, error);
                return prescription;
              }
            })
          );
          
          console.log('🔍 Final prescriptions with PDFs:', prescriptionsWithPdfs);
          console.log('🔍 Setting existing prescriptions state...');
          setExistingPrescriptions(prescriptionsWithPdfs);
          console.log('🔍 Existing prescriptions state should now be:', prescriptionsWithPdfs.length);
        } catch (err) {
          console.error('Error loading existing prescriptions:', err);
          setExistingPrescriptions([]);
        }

        // Load patient's consultation history
        try {
          const historyPatientId = typeof consultData.patient === 'string' ? consultData.patient : consultData.patient?.id;
          const historyResponse = await api.get(`/api/consultations/?patient_id=${historyPatientId}&limit=5`);
          setConsultationHistory(historyResponse.data.results || []);
        } catch (err) {
          console.error('Error loading consultation history:', err);
        }
      } catch (error) {
        console.error('Error loading consultation:', error);
        toast.error('Failed to load consultation data');
      } finally {
        setLoading(false);
      }
    };

    loadConsultationData();
  }, [consultationId]);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      setUploadedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Save vital signs
  const handleSaveVitalSigns = async () => {
    if (!prescription?.id) return;
    
    try {
      const vitalSignsData = {
        pulse: vitalSigns.pulse ? Number(vitalSigns.pulse) : null,
        blood_pressure_systolic: vitalSigns.blood_pressure_systolic ? Number(vitalSigns.blood_pressure_systolic) : null,
        blood_pressure_diastolic: vitalSigns.blood_pressure_diastolic ? Number(vitalSigns.blood_pressure_diastolic) : null,
        temperature: vitalSigns.temperature ? Number(vitalSigns.temperature) : null,
        weight: vitalSigns.weight ? Number(vitalSigns.weight) : null,
        height: vitalSigns.height ? Number(vitalSigns.height) : null,
      };

      await prescriptionApi.saveDraft(prescription.id, {
        ...vitalSignsData,
        primary_diagnosis: prescription.primary_diagnosis,
        patient_previous_history: prescription.patient_previous_history,
        general_instructions: prescription.general_instructions,
        next_visit: prescription.next_visit,
        medications: prescription.medications,
      });
      
      toast.success('Vital signs saved successfully');
    } catch (error) {
      console.error('Error saving vital signs:', error);
      toast.error('Failed to save vital signs');
    }
  };

  // Generate PDF with uploaded image
  const handleGeneratePDF = async () => {
    if (!prescription?.id) {
      toast.error('No prescription found');
      return;
    }

    if (!uploadedImage) {
      toast.error('Please upload a prescription image first');
      return;
    }

    setGenerating(true);
    try {
      // First save vital signs
      await handleSaveVitalSigns();

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('prescription_image', uploadedImage);
      formData.append('prescription_id', prescription.id.toString());

      // Upload image and generate PDF
      const response = await api.post(`/api/prescriptions/${prescription.id}/generate-mobile-pdf/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('PDF generated successfully');
        // Optionally download the PDF
        if (response.data.download_url) {
          window.open(response.data.download_url, '_blank');
        }
      } else {
        toast.error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">Loading consultation...</p>
        </div>
      </div>
    );
  }

  if (!consultation || !patientProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Consultation not found</p>
          <Button onClick={() => navigate('/dashboard/consultations')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Consultations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-3 py-2 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/consultations')}
            className="p-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="text-center">
            <h1 className="text-sm font-semibold text-gray-900">Mobile Consultation</h1>
            <p className="text-xs text-gray-500">{consultationId}</p>
          </div>
          <div className="w-8" /> {/* Spacer */}
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Meeting Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Video className="w-3 h-3 mr-2 text-blue-600" />
              Video Consultation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-3"
              onClick={() => {
                const meetingUrl = consultation?.doctor_meeting_link || "https://meet.diracai.com/office";
                window.open(meetingUrl, '_blank', 'noopener,noreferrer');
              }}
            >
              <Video className="w-4 h-4 mr-2" />
              Join Meeting
            </Button>
          </CardContent>
        </Card>

        {/* Existing Prescriptions - Moved to top */}
        {(() => {
          console.log('🔍 Rendering existing prescriptions:', existingPrescriptions.length, existingPrescriptions);
          return existingPrescriptions.length > 0;
        })() && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" />
                  Previous Prescriptions
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExistingPrescriptions(!showExistingPrescriptions)}
                  className="text-xs p-1"
                >
                  {showExistingPrescriptions ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            
            {showExistingPrescriptions && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {existingPrescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {prescription.primary_diagnosis || 'No diagnosis'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(prescription.issued_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {prescription.is_finalized ? (
                            <Badge variant="default" className="text-xs">Finalized</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Draft</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span className="text-xs text-gray-600">
                            {prescription.pdf_versions?.length || 0} PDF version{(prescription.pdf_versions?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {prescription.pdf_versions && prescription.pdf_versions.length > 0 ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPrescription(prescription);
                              setSelectedPdfVersion(prescription.current_pdf || prescription.pdf_versions[0]);
                              setShowPdfModal(true);
                            }}
                            className="text-xs h-7 px-2"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View PDFs
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-500">No PDFs</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Patient Profile */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <User className="w-3 h-3 mr-2 text-green-600" />
              Patient Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center space-x-2">
              <Avatar className="w-10 h-10">
                {patientProfile.profile_picture ? (
                  <AvatarImage src={patientProfile.profile_picture} alt={patientProfile.name} />
                ) : (
                  <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                    {patientProfile.name?.[0] || 'P'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-sm">{patientProfile.name}</h3>
                <p className="text-xs text-gray-600">{patientProfile.phone}</p>
                <p className="text-xs text-gray-600">{patientProfile.email}</p>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium text-gray-700">DOB:</span>
                <p className="text-gray-600">{patientProfile.date_of_birth || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Gender:</span>
                <p className="text-gray-600">{patientProfile.gender || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Age:</span>
                <p className="text-gray-600">{patientProfile.age || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">ID:</span>
                <p className="text-gray-600">{patientProfile.id}</p>
              </div>
            </div>
            {patientProfile.address && (
              <div className="mt-2 text-xs">
                <span className="font-medium text-gray-700">Address:</span>
                <p className="text-gray-600">{patientProfile.address}</p>
              </div>
            )}
            {patientProfile.emergency_contact && (
              <div className="mt-2 text-xs">
                <span className="font-medium text-gray-700">Emergency Contact:</span>
                <p className="text-gray-600">{patientProfile.emergency_contact}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Consultation Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Stethoscope className="w-3 h-3 mr-2 text-blue-600" />
              Current Consultation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Date:</span>
                <span className="text-gray-600">{consultation?.scheduled_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Time:</span>
                <span className="text-gray-600">{consultation?.scheduled_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Status:</span>
                <Badge variant="outline" className="text-xs">
                  {consultation?.status}
                </Badge>
              </div>
              {consultation?.chief_complaint && (
                <div>
                  <span className="font-medium text-gray-700">Chief Complaint:</span>
                  <p className="text-gray-600 mt-1">{consultation.chief_complaint}</p>
                </div>
              )}
              {consultation?.doctor && (
                <div>
                  <span className="font-medium text-gray-700">Doctor:</span>
                  <p className="text-gray-600">{consultation.doctor.name} - {consultation.doctor.specialization}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Consultation History */}
        {consultationHistory.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <History className="w-3 h-3 mr-2 text-purple-600" />
                Consultation History ({consultationHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {consultationHistory.slice(0, 3).map((consultation) => (
                  <div key={consultation.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <div>
                      <p className="font-medium">{consultation.id}</p>
                      <p className="text-gray-600">{consultation.scheduled_date}</p>
                      {consultation.chief_complaint && (
                        <p className="text-gray-500 truncate max-w-[150px]">{consultation.chief_complaint}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {consultation.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Previous Prescriptions */}
        {patientHistory.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <FileText className="w-3 h-3 mr-2 text-orange-600" />
                Previous Prescriptions ({patientHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {patientHistory.slice(0, 3).map((prescription) => (
                  <div key={prescription.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <div>
                      <p className="font-medium">CON{prescription.consultation}</p>
                      <p className="text-gray-600">{prescription.issued_date}</p>
                      {prescription.primary_diagnosis && (
                        <p className="text-gray-500 truncate max-w-[150px]">{prescription.primary_diagnosis}</p>
                      )}
                    </div>
                    <Badge variant={prescription.is_finalized ? "default" : "secondary"} className="text-xs">
                      {prescription.is_finalized ? "Finalized" : "Draft"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vital Signs - Read Only */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Heart className="w-3 h-3 mr-2 text-red-600" />
              Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Pulse (bpm)</Label>
                <div className="mt-1 text-xs h-8 px-3 py-2 bg-gray-50 border border-gray-200 rounded flex items-center">
                  {vitalSigns.pulse || 'N/A'}
                </div>
              </div>
              <div>
                <Label className="text-xs">Systolic BP</Label>
                <div className="mt-1 text-xs h-8 px-3 py-2 bg-gray-50 border border-gray-200 rounded flex items-center">
                  {vitalSigns.blood_pressure_systolic || 'N/A'}
                </div>
              </div>
              <div>
                <Label className="text-xs">Diastolic BP</Label>
                <div className="mt-1 text-xs h-8 px-3 py-2 bg-gray-50 border border-gray-200 rounded flex items-center">
                  {vitalSigns.blood_pressure_diastolic || 'N/A'}
                </div>
              </div>
              <div>
                <Label className="text-xs">Temperature (°F)</Label>
                <div className="mt-1 text-xs h-8 px-3 py-2 bg-gray-50 border border-gray-200 rounded flex items-center">
                  {vitalSigns.temperature || 'N/A'}
                </div>
              </div>
              <div>
                <Label className="text-xs">Weight (kg)</Label>
                <div className="mt-1 text-xs h-8 px-3 py-2 bg-gray-50 border border-gray-200 rounded flex items-center">
                  {vitalSigns.weight || 'N/A'}
                </div>
              </div>
              <div>
                <Label className="text-xs">Height (cm)</Label>
                <div className="mt-1 text-xs h-8 px-3 py-2 bg-gray-50 border border-gray-200 rounded flex items-center">
                  {vitalSigns.height || 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Upload */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Camera className="w-3 h-3 mr-2 text-orange-600" />
              Prescription Image
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {!uploadedImage ? (
              <Button
                onClick={handleCameraCapture}
                variant="outline"
                className="w-full border-dashed border-2 border-gray-300 hover:border-orange-500 text-xs py-3"
              >
                <Upload className="w-3 h-3 mr-2" />
                Upload Prescription Image
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Image uploaded successfully</p>
                  <p className="text-xs text-gray-500 truncate">{uploadedImage.name}</p>
                </div>
                <Button
                  onClick={handleCameraCapture}
                  variant="outline"
                  className="w-full text-xs py-2"
                >
                  <Camera className="w-3 h-3 mr-2" />
                  Change Image
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate PDF */}
        <Card>
          <CardContent className="pt-4">
            <Button
              onClick={handleGeneratePDF}
              disabled={!uploadedImage || generating}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white h-10 text-sm"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Prescription PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>

      </div>

      {/* PDF Viewer Modal */}
      <Dialog open={showPdfModal} onOpenChange={setShowPdfModal}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden">
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
              </div>
            )}

            {/* PDF Viewer */}
            <div className="flex-1 min-h-[400px]">
              {selectedPdfVersion ? (
                <div className="h-full">
                  <iframe
                    src={`${selectedPdfVersion.file_url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                    className="w-full h-full min-h-[400px]"
                    title={`Prescription PDF Version ${selectedPdfVersion.version}`}
                    type="application/pdf"
                  />
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MobileConsultationWorkspace;
