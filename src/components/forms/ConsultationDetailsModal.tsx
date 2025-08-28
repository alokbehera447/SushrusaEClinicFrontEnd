import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { prescriptionApi } from '@/lib/api';
import { toast } from 'sonner';
import { 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  Video, 
  FileText, 
  Heart, 
  Activity,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Eye,
  CheckCircle,
  AlertCircle,
  Thermometer,
  Stethoscope,
  Pill,
  MessageSquare,
  Camera,
  Microscope
} from 'lucide-react';

interface ConsultationDetails {
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
  status: 'scheduled' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  chiefComplaint: string;
  chief_complaint?: string;
  symptoms?: string;
  consultationFee: number;
  consultation_fee?: number;
  paymentMethod: string;
  payment_method?: string;
  paymentStatus: 'pending' | 'completed' | 'refunded';
  payment_status?: string;
  meetingLink?: string;
  doctor_meeting_link?: string;
  
  prescription_data?: {
    id: string;
    issued_date: string;
    issued_time: string;
    primary_diagnosis: string;
    patient_previous_history: string;
    general_instructions: string;
    diet_instructions: string;
    lifestyle_advice: string;
    next_visit: string;
    follow_up_notes: string;
    is_finalized: boolean;
    medications: Array<{
      id: string;
      medicine_name: string;
      composition: string;
      dosage_form: string;
      morning_dose: number;
      afternoon_dose: number;
      evening_dose: number;
      frequency: string;
      timing: string;
      duration_days: number;
      special_instructions: string;
      notes: string;
    }>;
  };
  
  notes?: string;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

interface Diagnosis {
  id: string;
  diagnosis: string;
  icd10Code?: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
  createdAt: string;
}

interface VitalSigns {
  id: string;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
  weight?: number;
  height?: number;
  bmi?: number;
  notes?: string;
  recordedAt: string;
}

interface ConsultationDocument {
  id: string;
  title: string;
  type: 'prescription' | 'lab_report' | 'xray' | 'ecg' | 'other';
  fileUrl: string;
  fileSize: string;
  uploadedAt: string;
}

interface ConsultationNote {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'clinical' | 'follow_up' | 'emergency';
  createdBy: string;
  createdAt: string;
}

interface Symptom {
  id: string;
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  notes?: string;
  createdAt: string;
}

interface ConsultationDetailsModalProps {
  consultation: ConsultationDetails | null;
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'doctor' | 'nurse' | 'admin' | 'patient';
}

const ConsultationDetailsModal = ({ consultation, isOpen, onClose, userRole = 'admin' }: ConsultationDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [downloadingPrescription, setDownloadingPrescription] = useState(false);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([]);
  const [documents, setDocuments] = useState<ConsultationDocument[]>([]);
  const [notes, setNotes] = useState<ConsultationNote[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app, this would come from API calls
  useEffect(() => {
    if (consultation) {
      // Simulate API calls for consultation details
      setDiagnoses([
        {
          id: 'DIAG001',
          diagnosis: 'Hypertension',
          icd10Code: 'I10',
          severity: 'moderate',
          notes: 'Blood pressure consistently elevated',
          createdAt: '2024-01-20T14:30:00Z'
        },
        {
          id: 'DIAG002',
          diagnosis: 'Type 2 Diabetes',
          icd10Code: 'E11',
          severity: 'mild',
          notes: 'Controlled with medication',
          createdAt: '2024-01-20T14:35:00Z'
        }
      ]);

      setVitalSigns([
        {
          id: 'VIT001',
          bloodPressure: '140/90',
          heartRate: 85,
          temperature: 98.6,
          oxygenSaturation: 98,
          weight: 75,
          height: 170,
          bmi: 26.0,
          notes: 'Blood pressure slightly elevated',
          recordedAt: '2024-01-20T14:00:00Z'
        }
      ]);

      setDocuments([
        {
          id: 'DOC001',
          title: 'Blood Test Report',
          type: 'lab_report',
          fileUrl: '/reports/blood-test.pdf',
          fileSize: '2.5 MB',
          uploadedAt: '2024-01-20T15:00:00Z'
        },
        {
          id: 'DOC002',
          title: 'ECG Report',
          type: 'ecg',
          fileUrl: '/reports/ecg.pdf',
          fileSize: '1.8 MB',
          uploadedAt: '2024-01-20T15:30:00Z'
        }
      ]);

      setNotes([
        {
          id: 'NOTE001',
          title: 'Initial Assessment',
          content: 'Patient presents with chest pain and shortness of breath. History of hypertension and diabetes.',
          category: 'clinical',
          createdBy: 'Dr. Amit Kumar',
          createdAt: '2024-01-20T14:30:00Z'
        },
        {
          id: 'NOTE002',
          title: 'Follow-up Required',
          content: 'Schedule follow-up in 2 weeks to monitor blood pressure and diabetes control.',
          category: 'follow_up',
          createdBy: 'Dr. Amit Kumar',
          createdAt: '2024-01-20T15:00:00Z'
        }
      ]);

      setSymptoms([
        {
          id: 'SYM001',
          symptom: 'Chest Pain',
          severity: 'moderate',
          duration: '2 days',
          notes: 'Pain in left chest, worse with movement',
          createdAt: '2024-01-20T14:00:00Z'
        },
        {
          id: 'SYM002',
          symptom: 'Shortness of Breath',
          severity: 'mild',
          duration: '1 day',
          notes: 'Difficulty breathing during physical activity',
          createdAt: '2024-01-20T14:05:00Z'
        }
      ]);
    }
  }, [consultation]);

  // API Functions aligned with endpoints
  const addDiagnosis = async (diagnosisData: Omit<Diagnosis, 'id' | 'createdAt'>) => {
    try {
      // API Call: POST /api/consultations/{consultation_id}/diagnosis/
      const newDiagnosis: Diagnosis = {
        id: `DIAG${Date.now()}`,
        ...diagnosisData,
        createdAt: new Date().toISOString()
      };
      setDiagnoses(prev => [...prev, newDiagnosis]);
      return { success: true };
    } catch (error) {
      console.error('Error adding diagnosis:', error);
      return { success: false, error };
    }
  };

  const addVitalSigns = async (vitalSignsData: Omit<VitalSigns, 'id' | 'recordedAt'>) => {
    try {
      // API Call: POST /api/consultations/{consultation_id}/vital-signs/
      const newVitalSigns: VitalSigns = {
        id: `VIT${Date.now()}`,
        ...vitalSignsData,
        recordedAt: new Date().toISOString()
      };
      setVitalSigns(prev => [...prev, newVitalSigns]);
      return { success: true };
    } catch (error) {
      console.error('Error adding vital signs:', error);
      return { success: false, error };
    }
  };

  const addNote = async (noteData: Omit<ConsultationNote, 'id' | 'createdAt'>) => {
    try {
      // API Call: POST /api/consultations/{consultation_id}/notes/
      const newNote: ConsultationNote = {
        id: `NOTE${Date.now()}`,
        ...noteData,
        createdAt: new Date().toISOString()
      };
      setNotes(prev => [...prev, newNote]);
      return { success: true };
    } catch (error) {
      console.error('Error adding note:', error);
      return { success: false, error };
    }
  };

  const addSymptom = async (symptomData: Omit<Symptom, 'id' | 'createdAt'>) => {
    try {
      // API Call: POST /api/consultations/{consultation_id}/symptoms/
      const newSymptom: Symptom = {
        id: `SYM${Date.now()}`,
        ...symptomData,
        createdAt: new Date().toISOString()
      };
      setSymptoms(prev => [...prev, newSymptom]);
      return { success: true };
    } catch (error) {
      console.error('Error adding symptom:', error);
      return { success: false, error };
    }
  };

  const uploadDocument = async (documentData: Omit<ConsultationDocument, 'id' | 'uploadedAt'>) => {
    try {
      // API Call: POST /api/consultations/{consultation_id}/documents/
      const newDocument: ConsultationDocument = {
        id: `DOC${Date.now()}`,
        ...documentData,
        uploadedAt: new Date().toISOString()
      };
      setDocuments(prev => [...prev, newDocument]);
      return { success: true };
    } catch (error) {
      console.error('Error uploading document:', error);
      return { success: false, error };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle download prescription
  const handleDownloadPrescription = async () => {
    try {
      setDownloadingPrescription(true);
      
      let prescriptionId = consultation.prescription_data?.id;
      
      // If no prescription data available, try to get it from the consultation
      if (!prescriptionId) {
        try {
          const prescriptionData = await prescriptionApi.getConsultationPrescription(consultation.id);
          prescriptionId = prescriptionData.id;
        } catch (error) {
          console.error('Error fetching prescription data:', error);
          toast.error('No prescription available for this consultation');
          return;
        }
      }
      
      if (!prescriptionId) {
        toast.error('No prescription available for this consultation');
        return;
      }
      
      const response = await prescriptionApi.downloadPDF(prescriptionId, 'latest');
      
      // The API returns a download URL, so we can open it directly
      if (response.download_url) {
        window.open(response.download_url, '_blank');
        toast.success('Prescription download started');
      } else {
        toast.error('No download URL available');
      }
    } catch (error) {
      console.error('Error downloading prescription:', error);
      toast.error('Failed to download prescription');
    } finally {
      setDownloadingPrescription(false);
    }
  };

  // Handle join meeting
  const handleJoinMeeting = () => {
    if (!consultation.doctor_meeting_link) {
      toast.error('No meeting link available');
      return;
    }
    
    // Open meeting link in new tab
    window.open(consultation.doctor_meeting_link, '_blank');
    toast.success('Opening meeting...');
  };

  if (!consultation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center text-xl font-bold text-midnight">
              <Eye className="w-5 h-5 mr-2 text-[#E17726]" />
              Consultation Details - {consultation.id}
            </DialogTitle>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Download Prescription Button */}
              <Button
                onClick={handleDownloadPrescription}
                variant="outline"
                size="sm"
                className="flex items-center"
                disabled={downloadingPrescription}
              >
                {downloadingPrescription ? (
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {downloadingPrescription ? 'Downloading...' : 'Download Prescription'}
              </Button>
              
              {/* Join Meeting Button - Only show if consultation is not completed */}
              {consultation.status !== 'completed' && consultation.doctor_meeting_link && (
                <Button
                  onClick={handleJoinMeeting}
                  size="sm"
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Meeting
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
            <TabsTrigger value="prescription">Prescription</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Consultation Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="w-4 h-4 mr-2" />
                    Consultation Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <Badge className={getStatusColor(consultation.status)}>
                        {consultation.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Type</Label>
                      <div className="flex items-center mt-1">
                        {consultation.consultationType === 'video' ? <Video className="w-4 h-4 mr-1" /> : <Phone className="w-4 h-4 mr-1" />}
                        <span className="capitalize">{consultation.consultationType}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Date</Label>
                      <p>{consultation.consultationDate}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Time</Label>
                      <p>{consultation.consultationTime}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Duration</Label>
                      <p>{consultation.duration} minutes</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Fee</Label>
                      <p>₹{consultation.consultationFee}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Chief Complaint</Label>
                    <p className="mt-1">{consultation.chiefComplaint}</p>
                  </div>
                  {consultation.symptoms && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Symptoms</Label>
                      <p className="mt-1">{consultation.symptoms}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Patient & Doctor Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <User className="w-4 h-4 mr-2" />
                    Patient & Doctor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Patient Info */}
                  <div>
                    <h4 className="font-semibold text-midnight mb-3">Patient Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{consultation.patient_name || consultation.patient?.name || 'Not available'}</span>
                      </div>
                      {(consultation.patient_age || consultation.patient?.age) && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Age:</span>
                          <span className="font-medium">{consultation.patient_age || consultation.patient?.age} years</span>
                        </div>
                      )}
                      {(consultation.patient_gender || consultation.patient?.gender) && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gender:</span>
                          <span className="font-medium">{consultation.patient_gender || consultation.patient?.gender}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{consultation.patient_phone || consultation.patient?.phone || 'Not available'}</span>
                      </div>
                      {(consultation.patient_email || consultation.patient?.email) && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{consultation.patient_email || consultation.patient?.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Doctor Info */}
                  <div>
                    <h4 className="font-semibold text-midnight mb-3">Doctor Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{consultation.doctor_name || consultation.doctor?.name || 'Not available'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Specialty:</span>
                        <span className="font-medium">{consultation.doctor_specialty || consultation.doctor?.specialty || 'General Medicine'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{consultation.doctor_phone || consultation.doctor?.phone || 'Not available'}</span>
                      </div>
                      {(consultation.doctor_email || consultation.doctor?.email) && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{consultation.doctor_email || consultation.doctor?.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {consultation.consultationType === 'video' && consultation.doctor_meeting_link && (
                    <a href={consultation.doctor_meeting_link} target="_blank" rel="noopener noreferrer">
                      <Button 
                        variant="outline" 
                        className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Doctor’s Room
                      </Button>
                    </a>
                  )}
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Diagnosis Tab */}
          <TabsContent value="diagnosis" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-midnight">Diagnoses</h3>
              {(userRole === 'doctor' || userRole === 'admin') && (
                <Button size="sm" className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Diagnosis
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {diagnoses.map((diagnosis) => (
                <Card key={diagnosis.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-midnight">{diagnosis.diagnosis}</h4>
                          {diagnosis.icd10Code && (
                            <Badge variant="outline">{diagnosis.icd10Code}</Badge>
                          )}
                          <Badge className={getSeverityColor(diagnosis.severity)}>
                            {diagnosis.severity}
                          </Badge>
                        </div>
                        {diagnosis.notes && (
                          <p className="text-gray-600 text-sm">{diagnosis.notes}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Added on {new Date(diagnosis.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {(userRole === 'doctor' || userRole === 'admin') && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Vital Signs Tab */}
          <TabsContent value="vitals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-midnight">Vital Signs</h3>
              {(userRole === 'doctor' || userRole === 'nurse' || userRole === 'admin') && (
                <Button size="sm" className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Record Vitals
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {vitalSigns.map((vital) => (
                <Card key={vital.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Blood Pressure</Label>
                          <p className="font-semibold">{vital.bloodPressure}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Heart Rate</Label>
                          <p className="font-semibold">{vital.heartRate} bpm</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Temperature</Label>
                          <p className="font-semibold">{vital.temperature}°F</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">O2 Saturation</Label>
                          <p className="font-semibold">{vital.oxygenSaturation}%</p>
                        </div>
                        {vital.weight && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Weight</Label>
                            <p className="font-semibold">{vital.weight} kg</p>
                          </div>
                        )}
                        {vital.height && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Height</Label>
                            <p className="font-semibold">{vital.height} cm</p>
                          </div>
                        )}
                        {vital.bmi && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600">BMI</Label>
                            <p className="font-semibold">{vital.bmi}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    {vital.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600">{vital.notes}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Recorded on {new Date(vital.recordedAt).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Prescription Tab */}
          <TabsContent value="prescription" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-midnight">Prescription</h3>
              <div className="flex gap-2">
                {consultation.payment_status === 'completed' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.print()}
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Print Receipt
                  </Button>
                )}
                {(userRole === 'doctor' || userRole === 'admin') && (
                  <Button size="sm" className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Prescription
                  </Button>
                )}
              </div>
            </div>
            
            {consultation.prescription_data ? (
              <div className="space-y-6">
                {/* Prescription Header */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Pill className="w-5 h-5 mr-2 text-[#E17726]" />
                      Prescription Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Issued Date</Label>
                        <p className="font-medium">{new Date(consultation.prescription_data.issued_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Issued Time</Label>
                        <p className="font-medium">{consultation.prescription_data.issued_time}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Status</Label>
                        <Badge className={consultation.prescription_data.is_finalized ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {consultation.prescription_data.is_finalized ? 'Finalized' : 'Draft'}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Diagnosis */}
                    {consultation.prescription_data.primary_diagnosis && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Primary Diagnosis</Label>
                        <p className="text-gray-700">{consultation.prescription_data.primary_diagnosis}</p>
                      </div>
                    )}
                    
                    {consultation.prescription_data.patient_previous_history && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Patient Previous History</Label>
                        <p className="text-gray-700">{consultation.prescription_data.patient_previous_history}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Medications */}
                {consultation.prescription_data.medications && consultation.prescription_data.medications.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Medications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {consultation.prescription_data.medications.map((medication, index) => (
                          <div key={medication.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold text-lg">{medication.medicine_name}</h4>
                              <Badge variant="outline">{medication.dosage_form}</Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Composition</Label>
                                <p className="text-sm">{medication.composition || 'Not specified'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Dosage</Label>
                                <p className="text-sm">
                                  {medication.morning_dose}-{medication.afternoon_dose}-{medication.evening_dose}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Frequency</Label>
                                <p className="text-sm capitalize">{medication.frequency.replace('_', ' ')}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Timing</Label>
                                <p className="text-sm capitalize">{medication.timing.replace('_', ' ')}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Duration</Label>
                                <p className="text-sm">{medication.duration_days} days</p>
                              </div>
                            </div>
                            
                            {medication.special_instructions && (
                              <div className="mb-3">
                                <Label className="text-sm font-medium text-gray-600">Special Instructions</Label>
                                <p className="text-sm text-gray-700">{medication.special_instructions}</p>
                              </div>
                            )}
                            
                            {medication.notes && (
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Notes</Label>
                                <p className="text-sm text-gray-700">{medication.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Instructions */}
                {(consultation.prescription_data.general_instructions || 
                  consultation.prescription_data.diet_instructions || 
                  consultation.prescription_data.lifestyle_advice) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {consultation.prescription_data.general_instructions && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">General Instructions</Label>
                          <p className="text-gray-700">{consultation.prescription_data.general_instructions}</p>
                        </div>
                      )}
                      
                      {consultation.prescription_data.diet_instructions && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Diet Instructions</Label>
                          <p className="text-gray-700">{consultation.prescription_data.diet_instructions}</p>
                        </div>
                      )}
                      
                      {consultation.prescription_data.lifestyle_advice && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Lifestyle Advice</Label>
                          <p className="text-gray-700">{consultation.prescription_data.lifestyle_advice}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Follow-up */}
                {(consultation.prescription_data.next_visit || consultation.prescription_data.follow_up_notes) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Follow-up</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {consultation.prescription_data.next_visit && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Next Visit</Label>
                          <p className="text-gray-700">{consultation.prescription_data.next_visit}</p>
                        </div>
                      )}
                      
                      {consultation.prescription_data.follow_up_notes && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Follow-up Notes</Label>
                          <p className="text-gray-700">{consultation.prescription_data.follow_up_notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Pill className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">No Prescription Available</h4>
                  <p className="text-gray-500">No prescription has been created for this consultation yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-midnight">Documents</h3>
              {(userRole === 'doctor' || userRole === 'nurse' || userRole === 'admin') && (
                <Button size="sm" className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((document) => (
                <Card key={document.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-[#E17726]" />
                          <h4 className="font-semibold text-midnight">{document.title}</h4>
                          <Badge variant="outline" className="capitalize">{document.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{document.fileSize}</p>
                        <p className="text-xs text-gray-500">
                          Uploaded on {new Date(document.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-midnight">Notes</h3>
              {(userRole === 'doctor' || userRole === 'nurse' || userRole === 'admin') && (
                <Button size="sm" className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {notes.map((note) => (
                <Card key={note.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-midnight">{note.title}</h4>
                          <Badge className="capitalize">{note.category}</Badge>
                        </div>
                        <p className="text-gray-600">{note.content}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>By: {note.createdBy}</span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Symptoms Tab */}
          <TabsContent value="symptoms" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-midnight">Symptoms</h3>
              {(userRole === 'doctor' || userRole === 'nurse' || userRole === 'admin') && (
                <Button size="sm" className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Symptom
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {symptoms.map((symptom) => (
                <Card key={symptom.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-midnight">{symptom.symptom}</h4>
                          <Badge className={getSeverityColor(symptom.severity)}>
                            {symptom.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Duration: {symptom.duration}</span>
                        </div>
                        {symptom.notes && (
                          <p className="text-gray-600 text-sm">{symptom.notes}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Added on {new Date(symptom.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationDetailsModal; 