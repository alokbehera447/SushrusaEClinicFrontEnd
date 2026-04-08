import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Video, 
  FileText, 
  Heart, 
  Activity, 
  Stethoscope, 
  Pill, 
  ClipboardList, 
  Download, 
  Share2, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Printer, 
  MessageSquare,
  Thermometer,
  Droplets,
  Scale,
  Zap,
  FileImage,
  File,
  Camera,
  Scan,
  AlertCircle,
  Info,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Receipt,
  Plus
} from 'lucide-react';
import { 
  adminConsultationApi, 
  prescriptionApi,
  type ConsultationDetails, 
  ConsultationVitalSigns, 
  ConsultationAttachment, 
  ConsultationNote, 
  ConsultationDiagnosis,
  PrescriptionDetails 
} from '@/lib/api';
import { toast } from 'sonner';
import { formatDate, formatTime, formatDateTime } from '@/lib/utils';

const ConsultationDetails: React.FC = () => {
  const { consultationId } = useParams<{ consultationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [consultation, setConsultation] = useState<ConsultationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Separate state for prescription and receipt data
  const [prescriptionData, setPrescriptionData] = useState<any>(null);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [prescriptionPdfVersions, setPrescriptionPdfVersions] = useState<any[]>([]);
  const [loadingPrescription, setLoadingPrescription] = useState(false);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([
    'basic-info', 'patient-info', 'doctor-info'
  ]));

  // Fetch consultation details
  const fetchConsultationDetails = useCallback(async () => {
    if (!consultationId) return;
    
    try {
      setLoading(true);
      setError(null);
      const details = await adminConsultationApi.getConsultationDetails(consultationId);
      setConsultation(details);
    } catch (error) {
      console.error('Error fetching consultation details:', error);
      setError('Failed to load consultation details');
      toast.error('Failed to load consultation details');
    } finally {
      setLoading(false);
    }
  }, [consultationId]);

  // Fetch prescription data
  const fetchPrescriptionData = useCallback(async () => {
    if (!consultationId) return;
    
    try {
      setLoadingPrescription(true);
      const prescription = await prescriptionApi.getConsultationPrescription(consultationId);
      setPrescriptionData(prescription);
      console.log('Prescription data loaded:', prescription);
      
      // Always try to fetch PDF versions (even if not finalized) to show latest available PDF
      if (prescription && prescription.id) {
        try {
          const pdfVersions = await prescriptionApi.getPrescriptionPdfVersions(prescription.id.toString());
          setPrescriptionPdfVersions(pdfVersions);
          console.log('Prescription PDF versions loaded:', pdfVersions);
        } catch (pdfError) {
          console.error('Error fetching prescription PDF versions:', pdfError);
          setPrescriptionPdfVersions([]);
        }
      }
    } catch (error) {
      console.error('Error fetching prescription:', error);
      // Don't show error toast for prescription as it might not exist
      setPrescriptionData(null);
      setPrescriptionPdfVersions([]);
    } finally {
      setLoadingPrescription(false);
    }
  }, [consultationId]);

  // Fetch receipt data
  const fetchReceiptData = useCallback(async () => {
    if (!consultationId) return;
    
    try {
      setLoadingReceipt(true);
      const receipt = await adminConsultationApi.getReceipt(consultationId);
      setReceiptData(receipt);
      console.log('Receipt data loaded:', receipt);
    } catch (error: any) {
      console.error('Error fetching receipt:', error);
      // Handle 404 specifically - receipt doesn't exist yet
      if (error.response?.status === 404) {
        console.log('No receipt found for this consultation');
        setReceiptData(null);
      } else {
        // For other errors, still don't show toast as receipt might not exist
        setReceiptData(null);
      }
    } finally {
      setLoadingReceipt(false);
    }
  }, [consultationId]);

  useEffect(() => {
    fetchConsultationDetails();
  }, [consultationId, fetchConsultationDetails]);

  // Fetch prescription and receipt data when consultation is loaded
  useEffect(() => {
    if (consultation) {
      fetchPrescriptionData();
      fetchReceiptData();
    }
  }, [consultation, fetchPrescriptionData, fetchReceiptData]);

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return { color: 'bg-blue-100 text-blue-800', icon: Calendar };
      case 'patient_checked_in': return { color: 'bg-yellow-100 text-yellow-800', icon: User };
      case 'ready_for_consultation': return { color: 'bg-orange-100 text-orange-800', icon: CheckCircle };
      case 'in_progress': return { color: 'bg-purple-100 text-purple-800', icon: Activity };
      case 'completed': return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'cancelled': return { color: 'bg-red-100 text-red-800', icon: XCircle };
      case 'no_show': return { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
      case 'rescheduled': return { color: 'bg-indigo-100 text-indigo-800', icon: Calendar };
      case 'overdue': return { color: 'bg-red-100 text-red-800', icon: AlertTriangle };
      default: return { color: 'bg-gray-100 text-gray-800', icon: Info };
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (isPaid: boolean) => {
    return isPaid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
  };

  // Format vital signs for display
  const formatVitalSigns = (vitals: ConsultationVitalSigns) => {
    const signs = [];
    if (vitals.blood_pressure_systolic && vitals.blood_pressure_diastolic) {
      signs.push(`BP: ${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic} mmHg`);
    }
    if (vitals.heart_rate) {
      signs.push(`HR: ${vitals.heart_rate} bpm`);
    }
    if (vitals.temperature) {
      signs.push(`Temp: ${vitals.temperature}°C`);
    }
    if (vitals.respiratory_rate) {
      signs.push(`RR: ${vitals.respiratory_rate}/min`);
    }
    if (vitals.oxygen_saturation) {
      signs.push(`SpO2: ${vitals.oxygen_saturation}%`);
    }
    if (vitals.weight) {
      signs.push(`Weight: ${vitals.weight} kg`);
    }
    if (vitals.height) {
      signs.push(`Height: ${vitals.height} cm`);
    }
    if (vitals.bmi) {
      signs.push(`BMI: ${vitals.bmi}`);
    }
    if (vitals.blood_glucose) {
      signs.push(`Glucose: ${vitals.blood_glucose} mg/dL`);
    }
    return signs;
  };

  // Finalize prescription
  const handleFinalizePrescription = async () => {
    if (!prescriptionData?.id) return;
    
    setFinalizing(true);
    try {
      const result = await prescriptionApi.finalizeAndGeneratePDF(prescriptionData.id);
      toast.success('Prescription finalized and PDF generated successfully');
      
      // Update prescription data with the finalized version
      setPrescriptionData(result.prescription);
      
      // Update PDF versions with the newly generated PDF
      if (result.pdf) {
        setPrescriptionPdfVersions([{
          id: result.pdf.id,
          version_number: result.pdf.version,
          download_url: result.pdf.url,
          file_url: result.pdf.url,
          generated_at: result.pdf.generated_at,
          generated_by: {
            name: user?.name || 'Unknown'
          }
        }]);
      }
    } catch (error) {
      console.error('Error finalizing prescription:', error);
      toast.error('Failed to finalize prescription');
    } finally {
      setFinalizing(false);
    }
  };

  // Get attachment icon
  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'image': return FileImage;
      case 'document': return File;
      case 'lab_report': return ClipboardList;
      case 'prescription': return Pill;
      case 'xray': return Camera;
      case 'scan': return Scan;
      default: return File;
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[...Array(3)].map((_, j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !consultation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="outline" onClick={() => navigate('/dashboard/consultations')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Consultations
            </Button>
          </div>
          
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error || 'Consultation not found'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const StatusInfo = getStatusInfo(consultation.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/consultations')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Consultations</span>
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Consultation Details
              </h1>
              <p className="text-gray-600">ID: {consultation.id}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Status Banner */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <StatusInfo.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {consultation.consultation_type.replace('_', ' ').toUpperCase()}
                  </h2>
                  <p className="text-gray-600">
                    {formatDate(consultation.scheduled_date)} at {formatTime(consultation.scheduled_time)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Badge className={`${StatusInfo.color} px-3 py-1`}>
                  {consultation.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge className={`${getPaymentStatusColor(consultation.is_paid)} px-3 py-1`}>
                  {consultation.is_paid ? 'PAID' : 'PENDING'}
                </Badge>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Consultation Fee</p>
                  <p className="text-xl font-bold text-gray-900">₹{consultation.consultation_fee}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('basic-info')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg font-semibold">
                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                    Basic Information
                  </CardTitle>
                  {expandedSections.has('basic-info') ? 
                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  }
                </div>
              </CardHeader>
              
              {expandedSections.has('basic-info') && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Consultation ID</label>
                        <p className="text-gray-900 font-mono">{consultation.id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Type</label>
                        <p className="text-gray-900 capitalize">{consultation.consultation_type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Duration</label>
                        <p className="text-gray-900">{consultation.duration} minutes</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Scheduled Date</label>
                        <p className="text-gray-900">{formatDate(consultation.scheduled_date)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Scheduled Time</label>
                        <p className="text-gray-900">{formatTime(consultation.scheduled_time)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created</label>
                        <p className="text-gray-900">{formatDateTime(consultation.created_at)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {consultation.actual_start_time && (
                    <Separator />
                  )}
                  
                  {consultation.actual_start_time && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Actual Start Time</label>
                        <p className="text-gray-900">{formatDateTime(consultation.actual_start_time)}</p>
                      </div>
                      {consultation.actual_end_time && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Actual End Time</label>
                          <p className="text-gray-900">{formatDateTime(consultation.actual_end_time)}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Patient Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('patient-info')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg font-semibold">
                    <User className="w-5 h-5 mr-2 text-green-600" />
                    Patient Information
                  </CardTitle>
                  {expandedSections.has('patient-info') ? 
                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  }
                </div>
              </CardHeader>
              
              {expandedSections.has('patient-info') && (
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src="/patient-avatar.svg" />
                      <AvatarFallback className="text-lg">
                        {consultation.patient_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{consultation.patient_name}</h3>
                        <p className="text-sm text-gray-500">Patient ID: {consultation.patient}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {consultation.patient_phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{consultation.patient_phone}</span>
                          </div>
                        )}
                        {consultation.patient_email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{consultation.patient_email}</span>
                          </div>
                        )}
                        {consultation.patient_age && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{consultation.patient_age} years old</span>
                          </div>
                        )}
                        {consultation.patient_gender && (
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 capitalize">{consultation.patient_gender}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Doctor Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('doctor-info')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg font-semibold">
                    <Stethoscope className="w-5 h-5 mr-2 text-blue-600" />
                    Doctor Information
                  </CardTitle>
                  {expandedSections.has('doctor-info') ? 
                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  }
                </div>
              </CardHeader>
              
              {expandedSections.has('doctor-info') && (
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src="/doctor-avatar.svg" />
                      <AvatarFallback className="text-lg">
                        {consultation.doctor_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{consultation.doctor_name}</h3>
                        <p className="text-sm text-gray-500">Doctor ID: {consultation.doctor}</p>
                        {consultation.doctor_specialty && (
                          <Badge variant="outline" className="mt-1">
                            {consultation.doctor_specialty}
                          </Badge>
                        )}
                      </div>
                      
                      
                      {consultation.doctor_meeting_link && (
                        <div className="pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(consultation.doctor_meeting_link, '_blank')}
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Join Meeting
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Chief Complaint & Symptoms */}
            <Card className="border-0 shadow-lg">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('complaint-symptoms')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg font-semibold">
                    <MessageSquare className="w-5 h-5 mr-2 text-orange-600" />
                    Chief Complaint & Symptoms
                  </CardTitle>
                  {expandedSections.has('complaint-symptoms') ? 
                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  }
                </div>
              </CardHeader>
              
              {expandedSections.has('complaint-symptoms') && (
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Chief Complaint</label>
                    <p className="text-gray-900 mt-1">{consultation.chief_complaint}</p>
                  </div>
                  
                  {consultation.symptoms && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Symptoms</label>
                      <p className="text-gray-900 mt-1">{consultation.symptoms}</p>
                    </div>
                  )}
                  
                  {consultation.recorded_symptoms && consultation.recorded_symptoms.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Recorded Symptoms</label>
                      <div className="mt-2 space-y-2">
                        {consultation.recorded_symptoms.map((symptom, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{symptom.symptom}</p>
                              <p className="text-sm text-gray-600">{symptom.duration}</p>
                              {symptom.notes && (
                                <p className="text-sm text-gray-500 mt-1">{symptom.notes}</p>
                              )}
                            </div>
                            <Badge variant="outline" className={`${
                              symptom.severity === 'severe' ? 'bg-red-100 text-red-800' :
                              symptom.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {symptom.severity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Vital Signs */}
            {consultation.vital_signs && (
              <Card className="border-0 shadow-lg">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection('vital-signs')}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg font-semibold">
                      <Activity className="w-5 h-5 mr-2 text-red-600" />
                      Vital Signs
                    </CardTitle>
                    {expandedSections.has('vital-signs') ? 
                      <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    }
                  </div>
                </CardHeader>
                
                {expandedSections.has('vital-signs') && (
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formatVitalSigns(consultation.vital_signs).map((sign, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg text-center">
                          <p className="text-sm font-medium text-gray-900">{sign}</p>
                        </div>
                      ))}
                    </div>
                    
                    {consultation.vital_signs.notes && (
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-500">Notes</label>
                        <p className="text-gray-900 mt-1">{consultation.vital_signs.notes}</p>
                      </div>
                    )}
                    
                    <div className="mt-4 text-xs text-gray-500">
                      Recorded: {formatDateTime(consultation.vital_signs.recorded_at)}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Diagnoses */}
            {consultation.diagnoses && consultation.diagnoses.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection('diagnoses')}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg font-semibold">
                      <ClipboardList className="w-5 h-5 mr-2 text-purple-600" />
                      Diagnoses
                    </CardTitle>
                    {expandedSections.has('diagnoses') ? 
                      <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    }
                  </div>
                </CardHeader>
                
                {expandedSections.has('diagnoses') && (
                  <CardContent className="space-y-4">
                    {consultation.diagnoses.map((diagnosis, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{diagnosis.diagnosis}</h4>
                            {diagnosis.icd_code && (
                              <p className="text-sm text-gray-600 mt-1">ICD-10: {diagnosis.icd_code}</p>
                            )}
                            {diagnosis.notes && (
                              <p className="text-sm text-gray-700 mt-2">{diagnosis.notes}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant="outline" className="capitalize">
                              {diagnosis.diagnosis_type}
                            </Badge>
                            <Badge className={`${
                              diagnosis.confidence_level === 'high' ? 'bg-green-100 text-green-800' :
                              diagnosis.confidence_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {diagnosis.confidence_level} confidence
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            )}


            {/* Attachments */}
            {consultation.attachments && consultation.attachments.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection('attachments')}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg font-semibold">
                      <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                      Attachments & Documents
                    </CardTitle>
                    {expandedSections.has('attachments') ? 
                      <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    }
                  </div>
                </CardHeader>
                
                {expandedSections.has('attachments') && (
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {consultation.attachments.map((attachment, index) => {
                        const IconComponent = getAttachmentIcon(attachment.attachment_type);
                        return (
                          <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <IconComponent className="w-5 h-5 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{attachment.title}</h4>
                                <p className="text-sm text-gray-600 capitalize">{attachment.attachment_type.replace('_', ' ')}</p>
                                {attachment.description && (
                                  <p className="text-sm text-gray-500 mt-1">{attachment.description}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-2">
                                  Uploaded: {formatDateTime(attachment.uploaded_at)}
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Notes */}
            {consultation.notes && consultation.notes.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection('notes')}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg font-semibold">
                      <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                      Consultation Notes
                    </CardTitle>
                    {expandedSections.has('notes') ? 
                      <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    }
                  </div>
                </CardHeader>
                
                {expandedSections.has('notes') && (
                  <CardContent className="space-y-4">
                    {consultation.notes.map((note, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="capitalize">
                            {note.note_type.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(note.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-900">{note.content}</p>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Chief Complaint & Symptoms */}
            <Card className="border-0 shadow-lg">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('complaint-symptoms')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg font-semibold">
                    <MessageSquare className="w-5 h-5 mr-2 text-orange-600" />
                    Chief Complaint & Symptoms
                  </CardTitle>
                  {expandedSections.has('complaint-symptoms') ? 
                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  }
                </div>
              </CardHeader>
              
              {expandedSections.has('complaint-symptoms') && (
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Chief Complaint</label>
                    <p className="text-gray-900 mt-1">{consultation.chief_complaint || 'Not specified'}</p>
                  </div>
                  
                  {consultation.symptoms && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Symptoms</label>
                      <p className="text-gray-900 mt-1">{consultation.symptoms}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Prescription */}
            <Card className="border-0 shadow-lg">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('prescription')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg font-semibold">
                    <Pill className="w-5 h-5 mr-2 text-green-600" />
                    Prescription
                    {loadingPrescription && (
                      <div className="ml-2 w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </CardTitle>
                  {expandedSections.has('prescription') ? 
                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  }
                </div>
              </CardHeader>
              
              {expandedSections.has('prescription') && (
                <CardContent className="space-y-4">
                  {loadingPrescription ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading prescription data...</p>
                      </div>
                    </div>
                  ) : prescriptionData ? (
                    <>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Issued Date</label>
                          <p className="text-gray-900 text-sm">{formatDate(prescriptionData.issued_date || prescriptionData.created_at)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Primary Diagnosis</label>
                          <p className="text-gray-900 text-sm">{prescriptionData.primary_diagnosis || 'Not specified'}</p>
                        </div>
                      </div>
                      
                      {prescriptionData.general_instructions && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Instructions</label>
                          <p className="text-gray-900 text-sm mt-1">{prescriptionData.general_instructions}</p>
                        </div>
                      )}
                      
                      {prescriptionPdfVersions.length > 0 ? (
                        <div>
                          <label className="text-sm font-medium text-gray-500 mb-2 block">Latest PDF</label>
                          <div className="flex flex-wrap gap-2">
                            {prescriptionPdfVersions.slice(0, 2).map((pdf: any, index: number) => (
                              <Button 
                                key={pdf.id}
                                variant={index === 0 ? "default" : "outline"}
                                size="sm"
                                onClick={() => window.open(pdf.download_url || pdf.file_url, '_blank')}
                                className="flex items-center gap-1 text-xs"
                              >
                                <Download className="w-3 h-3" />
                                {index === 0 ? 'Latest' : `V${pdf.version}`}
                              </Button>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            By Dr. {prescriptionPdfVersions[0]?.generated_by?.name || 'Unknown'}
                          </p>
                        </div>
                      ) : prescriptionData?.is_finalized ? (
                        <div className="text-center py-2">
                          <AlertCircle className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                          <p className="text-xs text-orange-600">Prescription finalized but no PDF generated</p>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <FileText className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                          <p className="text-xs text-blue-600">Prescription not finalized yet</p>
                          <p className="text-xs text-gray-500 mt-1">PDF will be available after finalization</p>
                          {user?.role === 'doctor' && consultation?.doctor === user.id && (
                            <Button
                              onClick={handleFinalizePrescription}
                              disabled={finalizing}
                              size="sm"
                              className="mt-2 h-7 text-xs px-3"
                            >
                              {finalizing ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                                  Finalizing...
                                </>
                              ) : (
                                <>
                                  <Printer className="w-3 h-3 mr-1" />
                                  Finalize Prescription
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Pill className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">No prescription found</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Receipt */}
            <Card className="border-0 shadow-lg">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('receipt')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg font-semibold">
                    <Receipt className="w-5 h-5 mr-2 text-blue-600" />
                    Receipt
                    {loadingReceipt && (
                      <div className="ml-2 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </CardTitle>
                  {expandedSections.has('receipt') ? 
                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  }
                </div>
              </CardHeader>
              
              {expandedSections.has('receipt') && (
                <CardContent className="space-y-4">
                  {loadingReceipt ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading receipt data...</p>
                      </div>
                    </div>
                  ) : receiptData ? (
                    <>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Amount</label>
                          <p className="text-gray-900 text-sm">₹{receiptData.amount || consultation?.consultation_fee || '0'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Payment Status</label>
                          <Badge className={receiptData.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                            {receiptData.payment_status || 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      
                      {receiptData.pdf_url && (
                        <div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(receiptData.pdf_url, '_blank')}
                            className="w-full flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download Receipt PDF
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Receipt className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">No receipt found</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mt-2"
                        onClick={async () => {
                          try {
                            const response = await adminConsultationApi.generateReceipt(consultationId!);
                            setReceiptData(response);
                            toast.success('Receipt generated successfully');
                          } catch (error) {
                            console.error('Error generating receipt:', error);
                            toast.error('Failed to generate receipt');
                          }
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Generate Receipt
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Join Meeting */}
            {consultation.doctor_meeting_link && (
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <Button 
                    className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.open(consultation.doctor_meeting_link, '_blank')}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join Meeting
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Consultation Timeline */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Consultation Created</p>
                      <p className="text-xs text-gray-500">{formatDateTime(consultation.created_at)}</p>
                    </div>
                  </div>
                  
                  {consultation.actual_start_time && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Consultation Started</p>
                        <p className="text-xs text-gray-500">{formatDateTime(consultation.actual_start_time)}</p>
                      </div>
                    </div>
                  )}
                  
                  {consultation.actual_end_time && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Consultation Ended</p>
                        <p className="text-xs text-gray-500">{formatDateTime(consultation.actual_end_time)}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      consultation.status === 'completed' ? 'bg-green-500' :
                      consultation.status === 'cancelled' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Current Status</p>
                      <p className="text-xs text-gray-500 capitalize">{consultation.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Consultation Fee</span>
                  <span className="font-medium">₹{consultation.consultation_fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Status</span>
                  <Badge className={getPaymentStatusColor(consultation.is_paid)}>
                    {consultation.is_paid ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
                {consultation.payment_method && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment Method</span>
                    <span className="text-sm text-gray-900 capitalize">{consultation.payment_method}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span>₹{consultation.consultation_fee}</span>
                </div>
              </CardContent>
            </Card>

            {/* Follow-up Information */}
            {(consultation.is_follow_up || consultation.follow_up_required) && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Follow-up</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {consultation.is_follow_up && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">This is a follow-up consultation</p>
                      {consultation.parent_consultation && (
                        <p className="text-xs text-blue-700 mt-1">
                          Parent: {consultation.parent_consultation}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {consultation.follow_up_required && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm font-medium text-orange-900">Follow-up required</p>
                      {consultation.follow_up_date && (
                        <p className="text-xs text-orange-700 mt-1">
                          Scheduled: {formatDate(consultation.follow_up_date)}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Cancellation Information */}
            {consultation.status === 'cancelled' && (
              <Card className="border-0 shadow-lg border-red-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-red-800">Cancellation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {consultation.cancellation_reason && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Reason</label>
                      <p className="text-gray-900 mt-1">{consultation.cancellation_reason}</p>
                    </div>
                  )}
                  {consultation.cancelled_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Cancelled At</label>
                      <p className="text-gray-900 mt-1">{formatDateTime(consultation.cancelled_at)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetails;
