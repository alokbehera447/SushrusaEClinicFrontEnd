import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/utils';
import { 
  User,
  Phone,
  Video,
  Activity,
  Mail, 
  Calendar, 
  Clock, 
  FileText, 
  Pill, 
  Plus,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Stethoscope,
  Heart,
  Weight,
  Thermometer,
  Droplets,
  Eye,
  ChevronDown,
  ChevronUp,
  Settings,
  Maximize2,
  Minimize2,
  MessageSquare,
  Camera,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Users,
  X,
  Search,
  Filter,
  Download,
  Print,
  Share2,
  MoreVertical,
  Star,
  Clock4,
  Shield,
  AlertTriangle,
  Info,
  TrendingUp,
  BarChart3,
  PieChart,
  Timeline,
  Zap,
  Target,
  Layers,
  Database,
  Cloud,
  Wifi,
  Signal,
  Battery,
  Volume2,
  VolumeX,
  RotateCcw,
  RefreshCw,
  Edit3,
  Copy,
  Bookmark,
  Flag,
  Tag,
  Paperclip,
  Image,
  FileVideo,
  FileAudio,
  Lock,
  Unlock,
  Globe,
  MapPin,
  Navigation,
  Compass,
  Sunrise,
  Sunset,
  Moon,
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  Cloudy
} from 'lucide-react';

interface Consultation {
  id: string;
  patient_name: string;
  doctor_name: string;
  consultation_type: string;
  status: string;
  scheduled_date: string;
  scheduled_time: string;
  duration: number;
  consultation_fee: number;
  patient: string;
  doctor: string;
  doctor_meeting_link?: string;
}

interface PatientInfo {
  user_name: string;
  user_phone: string;
  user_email: string;
  gender: string;
  date_of_birth: string;
  age: number | null;
  blood_group: string;
  allergies: string;
  medical_history: string;
}

interface Medication {
  id?: string;
  medicine_name: string;
  composition: string;
  dosage_form: string;
  morning_dose: number;
  afternoon_dose: number;
  evening_dose: number;
  frequency: string;
  timing: string;
  custom_timing: string;
  duration_days: number | null;
  duration_weeks: number | null;
  duration_months: number | null;
  is_continuous: boolean;
  special_instructions: string;
  notes: string;
  order: number;
}

interface VitalSigns {
  id?: string;
  pulse: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  temperature: number | null;
  weight: number | null;
  height: number | null;
  respiratory_rate: number | null;
  oxygen_saturation: number | null;
  blood_sugar_fasting: number | null;
  blood_sugar_postprandial: number | null;
  hba1c: number | null;
  notes: string;
}

interface Prescription {
  id?: string;
  consultation: string;
  patient: string;
  primary_diagnosis: string;
  secondary_diagnosis: string;
  clinical_classification: string;
  pulse: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  temperature: number | null;
  weight: number | null;
  height: number | null;
  medications: Medication[];
  vital_signs?: VitalSigns;
  general_instructions: string;
  fluid_intake: string;
  diet_instructions: string;
  lifestyle_advice: string;
  next_visit: string;
  follow_up_notes: string;
  is_draft: boolean;
  is_finalized: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function ConsultationMeeting() {
  const { consultationId } = useParams<{ consultationId: string }>();
  const { toast } = useToast();
  
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('prescription');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showVitalsExpanded, setShowVitalsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickNotes, setShowQuickNotes] = useState(false);
  const [quickNotes, setQuickNotes] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Load consultation data
  useEffect(() => {
    if (consultationId) {
      loadConsultation();
    }
  }, [consultationId]);

  // Auto-save functionality
  useEffect(() => {
    if (prescription && autoSaveEnabled && !prescription.is_finalized) {
      const timer = setTimeout(() => {
        savePrescription(true);
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(timer);
    }
  }, [prescription, autoSaveEnabled]);

  const loadConsultation = async () => {
    try {
      console.log('Loading consultation:', consultationId);
      const response = await api.get(`/api/consultations/${consultationId}/`);
      console.log('Consultation data:', response.data);
      console.log('Meeting link:', response.data.data?.doctor_meeting_link);
      setConsultation(response.data.data);
      
      // Load patient info
      if (response.data.data?.patient) {
        loadPatientInfo(response.data.data.patient);
      }
      
      // Load existing prescription if any
      await loadPrescription();
    } catch (error) {
      console.error('Error loading consultation:', error);
      toast({
        title: "Error",
        description: "Failed to load consultation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPatientInfo = async (patientId: string) => {
    try {
      console.log('Loading patient info for:', patientId);
      const response = await api.get(`/api/patients/${patientId}/`);
      setPatientInfo(response.data.data);
    } catch (error) {
      console.error('Error loading patient info:', error);
      // Set basic patient info from consultation data
      if (consultation) {
        setPatientInfo({
          user_name: consultation.patient_name,
          user_phone: 'Not available',
          user_email: 'Not provided',
          gender: 'Not specified',
          date_of_birth: 'Not provided',
          age: null,
          blood_group: 'Not specified',
          allergies: 'None reported',
          medical_history: 'No significant history',
        });
      }
    }
  };

  const loadPrescription = async () => {
    if (!consultationId) return;
    
    try {
      const response = await api.get(`/api/prescriptions/consultation/${consultationId}/`);
      if (response.data && response.data.success && response.data.data) {
        setPrescription(response.data.data);
      }
    } catch (error) {
      console.error('Error loading prescription:', error);
      // No prescription exists yet, which is fine
    }
  };

  const initializePrescription = () => {
    if (!consultation) return;

    const newPrescription: Prescription = {
      consultation: consultationId!,
      patient: consultation.patient,
      primary_diagnosis: '',
      secondary_diagnosis: '',
      clinical_classification: '',
      pulse: null,
      blood_pressure_systolic: null,
      blood_pressure_diastolic: null,
      temperature: null,
      weight: null,
      height: null,
      medications: [],
      vital_signs: {
        pulse: null,
        blood_pressure_systolic: null,
        blood_pressure_diastolic: null,
        temperature: null,
        weight: null,
        height: null,
        respiratory_rate: null,
        oxygen_saturation: null,
        blood_sugar_fasting: null,
        blood_sugar_postprandial: null,
        hba1c: null,
        notes: '',
      },
      general_instructions: '',
      fluid_intake: '',
      diet_instructions: '',
      lifestyle_advice: '',
      next_visit: '',
      follow_up_notes: '',
      is_draft: true,
      is_finalized: false,
    };

    setPrescription(newPrescription);
  };

  const addMedication = () => {
    if (!prescription) return;

    const newMedication: Medication = {
      medicine_name: '',
      composition: '',
      dosage_form: '',
      morning_dose: 0,
      afternoon_dose: 0,
      evening_dose: 0,
      frequency: '',
      timing: '',
      custom_timing: '',
      duration_days: null,
      duration_weeks: null,
      duration_months: null,
      is_continuous: false,
      special_instructions: '',
      notes: '',
      order: prescription.medications.length + 1,
    };

    setPrescription({
      ...prescription,
      medications: [...prescription.medications, newMedication],
    });
  };

  const updateMedication = (index: number, field: keyof Medication, value: string | number) => {
    if (!prescription) return;

    const updatedMedications = [...prescription.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value,
    };

    setPrescription({
      ...prescription,
      medications: updatedMedications,
    });
  };

  const removeMedication = (index: number) => {
    if (!prescription) return;

    const updatedMedications = prescription.medications.filter((_, i) => i !== index);
    setPrescription({
      ...prescription,
      medications: updatedMedications,
    });
  };

  const updatePrescription = (field: keyof Prescription, value: string | number) => {
    if (!prescription) return;

    setPrescription({
      ...prescription,
      [field]: value,
    });
  };

  const updateVitalSigns = (field: keyof Prescription['vital_signs'], value: string) => {
    if (!prescription || !prescription.vital_signs) return;

    setPrescription({
      ...prescription,
      vital_signs: {
        ...prescription.vital_signs,
        [field]: value === '' ? null : parseFloat(value),
      },
    });
  };

  const savePrescription = async (isAutoSave = false) => {
    if (!prescription) return;

    setSaving(true);
    try {
      if (prescription.id) {
        // Update existing prescription
        await api.put(`/api/prescriptions/${prescription.id}/`, prescription);
      } else {
        // Create new prescription
        const response = await api.post('/api/prescriptions/', prescription);
        setPrescription(response.data.data);
      }

      setLastSaved(new Date());
      
      if (!isAutoSave) {
        toast({
          title: "Success",
          description: "Prescription saved successfully",
        });
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      if (!isAutoSave) {
        toast({
          title: "Error",
          description: "Failed to save prescription",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const finalizePrescription = async () => {
    if (!prescription) return;

    setSaving(true);
    try {
      const finalizedPrescription = {
        ...prescription,
        is_finalized: true,
        is_draft: false,
      };

      if (prescription.id) {
        await api.put(`/api/prescriptions/${prescription.id}/`, finalizedPrescription);
      } else {
        const response = await api.post('/api/prescriptions/', finalizedPrescription);
        setPrescription(response.data.data);
      }

      setPrescription(finalizedPrescription);
      toast({
        title: "Success",
        description: "Prescription finalized successfully",
      });
    } catch (error) {
      console.error('Error finalizing prescription:', error);
      toast({
        title: "Error",
        description: "Failed to finalize prescription",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateTime = new Date(`${date}T${time}`);
      return dateTime.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return `${date} ${time}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVitalStatus = (value: number | null, normal: { min: number; max: number }) => {
    if (value === null) return 'normal';
    if (value < normal.min) return 'low';
    if (value > normal.max) return 'high';
    return 'normal';
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    
    if (diff < 60) return 'Saved just now';
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
    return `Saved ${Math.floor(diff / 3600)}h ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md mx-auto">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600 mx-auto"></div>
            <Stethoscope className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Consultation</h3>
          <p className="text-gray-600">Please wait while we prepare your workspace...</p>
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Setting up secure connection</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md mx-auto">
          <div className="bg-red-100 rounded-full p-6 w-fit mx-auto mb-6">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Consultation Not Found</h2>
          <p className="text-gray-600 mb-6">The consultation you're looking for doesn't exist or has been removed.</p>
          <Button 
            onClick={() => window.history.back()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Enhanced Header with Status Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        {/* Status Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live Session</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{formatDateTime(consultation.scheduled_date, consultation.scheduled_time)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Signal className="h-4 w-4" />
                <span className="text-sm">Secure Connection</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {lastSaved && (
                <div className="flex items-center space-x-2 text-blue-100">
                  <Cloud className="h-4 w-4" />
                  <span className="text-xs">{formatLastSaved()}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Battery className="h-4 w-4" />
                <span className="text-sm">Auto-save {autoSaveEnabled ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                  <span>Consultation Session</span>
                  <Badge className={`${getStatusColor(consultation.status)} text-xs font-medium px-3 py-1`}>
                    {consultation.status.toUpperCase()}
                  </Badge>
                </h1>
                <div className="flex items-center space-x-6 mt-1">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{consultation.patient_name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{consultation.consultation_type}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{consultation.duration} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>₹{consultation.consultation_fee}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                variant="outline"
                size="sm"
                className={`${autoSaveEnabled ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50'}`}
              >
                <Cloud className="h-4 w-4 mr-2" />
                Auto-save
              </Button>
              
              {consultation.doctor_meeting_link && (
                <Button 
                  onClick={() => window.open(consultation.doctor_meeting_link, '_blank')}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
              )}
              
              <Button
                onClick={() => setIsFullscreen(!isFullscreen)}
                variant="outline"
                size="sm"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Panel - Patient & Prescription Data (40%) */}
        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col overflow-hidden shadow-lg">
          {/* Patient Information Header */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span>Patient Overview</span>
              </h2>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {patientInfo ? (
              <div className="space-y-4">
                {/* Patient Basic Info */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{patientInfo.user_name}</h3>
                      <p className="text-blue-600 font-medium">Patient ID: {consultation.patient}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {patientInfo.gender}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {patientInfo.age ? `${patientInfo.age} years` : 'Age N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Information */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                      <Phone className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">{patientInfo.user_phone}</span>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">{patientInfo.user_email}</span>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Medical Information Cards */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-red-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <Droplets className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-semibold text-gray-900">Blood Group</span>
                    </div>
                    <p className="text-lg font-bold text-red-600">{patientInfo.blood_group}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-orange-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-semibold text-gray-900">Allergies</span>
                    </div>
                    <p className="text-sm text-orange-700">{patientInfo.allergies}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-semibold text-gray-900">Medical History</span>
                    </div>
                    <p className="text-sm text-purple-700">{patientInfo.medical_history}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-xl">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Patient information not available</p>
              </div>
            )}
          </div>

          {/* Prescription & Clinical Data Tabs */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              {/* Enhanced Tab Navigation */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
                <TabsList className="grid w-full grid-cols-3 bg-white rounded-lg shadow-sm border border-gray-200">
                  <TabsTrigger 
                    value="prescription" 
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium"
                  >
                    <Pill className="h-4 w-4 mr-2" />
                    Prescription
                  </TabsTrigger>
                  <TabsTrigger 
                    value="vitals" 
                    className="data-[state=active]:bg-green-600 data-[state=active]:text-white font-medium"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Vitals
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notes" 
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Notes
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content */}
              <ScrollArea className="flex-1">
                {/* Prescription Tab */}
                <TabsContent value="prescription" className="p-6 space-y-6 m-0">
                  {prescription ? (
                    <div className="space-y-6">
                      {/* Prescription Header with Actions */}
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <span>Digital Prescription</span>
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Button 
                              onClick={() => savePrescription()} 
                              disabled={saving || prescription.is_finalized}
                              size="sm"
                              variant="outline"
                              className="bg-white"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              {saving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button 
                              onClick={finalizePrescription} 
                              disabled={saving || prescription.is_finalized}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {prescription.is_finalized ? 'Finalized' : 'Finalize'}
                            </Button>
                          </div>
                        </div>
                        
                        {prescription.is_finalized && (
                          <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2 text-green-800">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">Prescription Finalized</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Diagnosis Section */}
                      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                        <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                          <CardTitle className="flex items-center space-x-2">
                            <Target className="h-5 w-5" />
                            <span>Clinical Diagnosis</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="primary_diagnosis" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                <span>Primary Diagnosis</span>
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              </Label>
                              <Input
                                id="primary_diagnosis"
                                value={prescription.primary_diagnosis}
                                onChange={(e) => updatePrescription('primary_diagnosis', e.target.value)}
                                placeholder="Enter primary diagnosis..."
                                className="mt-2 border-purple-200 focus:border-purple-500 text-sm"
                                disabled={prescription.is_finalized}
                              />
                            </div>
                            <div>
                              <Label htmlFor="secondary_diagnosis" className="text-sm font-semibold text-gray-700">
                                Secondary Diagnosis
                              </Label>
                              <Input
                                id="secondary_diagnosis"
                                value={prescription.secondary_diagnosis}
                                onChange={(e) => updatePrescription('secondary_diagnosis', e.target.value)}
                                placeholder="Enter secondary diagnosis..."
                                className="mt-2 border-purple-200 focus:border-purple-500 text-sm"
                                disabled={prescription.is_finalized}
                              />
                            </div>
                            <div>
                              <Label htmlFor="clinical_classification" className="text-sm font-semibold text-gray-700">
                                Clinical Classification
                              </Label>
                              <Input
                                id="clinical_classification"
                                value={prescription.clinical_classification}
                                onChange={(e) => updatePrescription('clinical_classification', e.target.value)}
                                placeholder="Enter clinical classification..."
                                className="mt-2 border-purple-200 focus:border-purple-500 text-sm"
                                disabled={prescription.is_finalized}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Medications Section */}
                      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                        <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Pill className="h-5 w-5" />
                              <span>Medications</span>
                              <Badge variant="secondary" className="bg-white text-green-600">
                                {prescription.medications.length}
                              </Badge>
                            </div>
                            <Button
                              onClick={addMedication}
                              size="sm"
                              variant="secondary"
                              className="bg-white text-green-600 hover:bg-green-50"
                              disabled={prescription.is_finalized}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-6">
                            {prescription.medications.length === 0 ? (
                              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h4 className="text-lg font-medium text-gray-700 mb-2">No Medications Added</h4>
                                <p className="text-gray-500 mb-4">Start adding medications to the prescription</p>
                                <Button onClick={addMedication} className="bg-green-600 hover:bg-green-700 text-white">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add First Medication
                                </Button>
                              </div>
                            ) : (
                              prescription.medications.map((medication, index) => (
                                <div key={medication.id || `med-${index}`} className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-gray-900 flex items-center space-x-2">
                                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                        {index + 1}
                                      </div>
                                      <span>Medication {index + 1}</span>
                                    </h4>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeMedication(index)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      disabled={prescription.is_finalized}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-semibold text-gray-700">Medication Name</Label>
                                      <Input
                                        value={medication.medicine_name}
                                        onChange={(e) => updateMedication(index, 'medicine_name', e.target.value)}
                                        placeholder="e.g., Paracetamol"
                                        className="mt-1 bg-white border-green-200 focus:border-green-500"
                                        disabled={prescription.is_finalized}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm font-semibold text-gray-700">Form</Label>
                                      <Input
                                        value={medication.dosage_form}
                                        onChange={(e) => updateMedication(index, 'dosage_form', e.target.value)}
                                        placeholder="e.g., Tablet, Capsule"
                                        className="mt-1 bg-white border-green-200 focus:border-green-500"
                                        disabled={prescription.is_finalized}
                                      />
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Daily Dosage</Label>
                                    <div className="grid grid-cols-3 gap-4">
                                      <div className="text-center">
                                        <Label className="text-xs text-gray-600 mb-1 block">Morning</Label>
                                        <div className="bg-white rounded-lg p-3 border border-green-200">
                                          <Input
                                            type="number"
                                            value={medication.morning_dose}
                                            onChange={(e) => updateMedication(index, 'morning_dose', parseInt(e.target.value) || 0)}
                                            className="text-center border-0 p-0 h-8 font-bold text-lg"
                                            min="0"
                                            disabled={prescription.is_finalized}
                                          />
                                        </div>
                                      </div>
                                      <div className="text-center">
                                        <Label className="text-xs text-gray-600 mb-1 block">Afternoon</Label>
                                        <div className="bg-white rounded-lg p-3 border border-green-200">
                                          <Input
                                            type="number"
                                            value={medication.afternoon_dose}
                                            onChange={(e) => updateMedication(index, 'afternoon_dose', parseInt(e.target.value) || 0)}
                                            className="text-center border-0 p-0 h-8 font-bold text-lg"
                                            min="0"
                                            disabled={prescription.is_finalized}
                                          />
                                        </div>
                                      </div>
                                      <div className="text-center">
                                        <Label className="text-xs text-gray-600 mb-1 block">Evening</Label>
                                        <div className="bg-white rounded-lg p-3 border border-green-200">
                                          <Input
                                            type="number"
                                            value={medication.evening_dose}
                                            onChange={(e) => updateMedication(index, 'evening_dose', parseInt(e.target.value) || 0)}
                                            className="text-center border-0 p-0 h-8 font-bold text-lg"
                                            min="0"
                                            disabled={prescription.is_finalized}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-semibold text-gray-700">Frequency</Label>
                                      <Input
                                        value={medication.frequency}
                                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                        placeholder="e.g., Daily, Twice daily"
                                        className="mt-1 bg-white border-green-200 focus:border-green-500"
                                        disabled={prescription.is_finalized}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm font-semibold text-gray-700">Timing</Label>
                                      <Input
                                        value={medication.timing}
                                        onChange={(e) => updateMedication(index, 'timing', e.target.value)}
                                        placeholder="e.g., Before meals"
                                        className="mt-1 bg-white border-green-200 focus:border-green-500"
                                        disabled={prescription.is_finalized}
                                      />
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-semibold text-gray-700">Special Instructions</Label>
                                    <Textarea
                                      value={medication.special_instructions}
                                      onChange={(e) => updateMedication(index, 'special_instructions', e.target.value)}
                                      placeholder="Any special instructions for this medication..."
                                      rows={2}
                                      className="mt-1 bg-white border-green-200 focus:border-green-500"
                                      disabled={prescription.is_finalized}
                                    />
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Instructions & Follow-up */}
                      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                        <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                          <CardTitle className="flex items-center space-x-2">
                            <MessageSquare className="h-5 w-5" />
                            <span>Instructions & Follow-up</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="general_instructions" className="text-sm font-semibold text-gray-700">General Instructions</Label>
                              <Textarea
                                id="general_instructions"
                                value={prescription.general_instructions}
                                onChange={(e) => updatePrescription('general_instructions', e.target.value)}
                                placeholder="General care instructions for the patient..."
                                rows={3}
                                className="mt-2 border-orange-200 focus:border-orange-500 bg-white"
                                disabled={prescription.is_finalized}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="fluid_intake" className="text-sm font-semibold text-gray-700">Fluid Intake</Label>
                                <Input
                                  id="fluid_intake"
                                  value={prescription.fluid_intake}
                                  onChange={(e) => updatePrescription('fluid_intake', e.target.value)}
                                  placeholder="e.g., 8-10 glasses of water daily"
                                  className="mt-2 border-orange-200 focus:border-orange-500 bg-white"
                                  disabled={prescription.is_finalized}
                                />
                              </div>
                              <div>
                                <Label htmlFor="diet_instructions" className="text-sm font-semibold text-gray-700">Diet Instructions</Label>
                                <Input
                                  id="diet_instructions"
                                  value={prescription.diet_instructions}
                                  onChange={(e) => updatePrescription('diet_instructions', e.target.value)}
                                  placeholder="e.g., Low sodium diet"
                                  className="mt-2 border-orange-200 focus:border-orange-500 bg-white"
                                  disabled={prescription.is_finalized}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="lifestyle_advice" className="text-sm font-semibold text-gray-700">Lifestyle Advice</Label>
                              <Textarea
                                id="lifestyle_advice"
                                value={prescription.lifestyle_advice}
                                onChange={(e) => updatePrescription('lifestyle_advice', e.target.value)}
                                placeholder="Lifestyle recommendations and modifications..."
                                rows={3}
                                className="mt-2 border-orange-200 focus:border-orange-500 bg-white"
                                disabled={prescription.is_finalized}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="next_visit" className="text-sm font-semibold text-gray-700">Next Visit Date</Label>
                                <Input
                                  id="next_visit"
                                  type="date"
                                  value={prescription.next_visit}
                                  onChange={(e) => updatePrescription('next_visit', e.target.value)}
                                  className="mt-2 border-orange-200 focus:border-orange-500 bg-white"
                                  disabled={prescription.is_finalized}
                                />
                              </div>
                              <div>
                                <Label htmlFor="follow_up_notes" className="text-sm font-semibold text-gray-700">Follow-up Notes</Label>
                                <Textarea
                                  id="follow_up_notes"
                                  value={prescription.follow_up_notes}
                                  onChange={(e) => updatePrescription('follow_up_notes', e.target.value)}
                                  placeholder="Follow-up instructions..."
                                  rows={2}
                                  className="mt-2 border-orange-200 focus:border-orange-500 bg-white"
                                  disabled={prescription.is_finalized}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-dashed border-blue-200">
                      <div className="bg-white p-6 rounded-full shadow-lg mb-6">
                        <FileText className="h-12 w-12 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Create New Prescription</h3>
                      <p className="text-gray-600 mb-6 text-center max-w-md">
                        Start creating a comprehensive digital prescription for this consultation session.
                      </p>
                      <Button 
                        onClick={initializePrescription} 
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg shadow-lg"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Create Prescription
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Vitals Tab */}
                <TabsContent value="vitals" className="p-6 space-y-6 m-0">
                  {prescription && prescription.vital_signs ? (
                    <div className="space-y-6">
                      {/* Vitals Header */}
                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2 mb-2">
                          <Activity className="h-5 w-5 text-green-600" />
                          <span>Vital Signs Monitor</span>
                        </h3>
                        <p className="text-green-700 text-sm">Real-time patient vital signs tracking and monitoring</p>
                      </div>

                      {/* Primary Vitals Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Pulse */}
                        <Card className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 shadow-lg">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <Heart className="h-5 w-5 text-red-600" />
                                <span className="font-semibold text-gray-900">Pulse</span>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`${getVitalStatus(prescription.vital_signs.pulse, {min: 60, max: 100}) === 'normal' ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}`}
                              >
                                {getVitalStatus(prescription.vital_signs.pulse, {min: 60, max: 100})}
                              </Badge>
                            </div>
                            <Input
                              value={prescription.vital_signs.pulse || ''}
                              onChange={(e) => updateVitalSigns('pulse', e.target.value)}
                              placeholder="72"
                              className="text-2xl font-bold text-center bg-white border-red-200 focus:border-red-500"
                              disabled={prescription.is_finalized}
                            />
                            <p className="text-xs text-red-600 text-center mt-1">bpm (60-100)</p>
                          </CardContent>
                        </Card>

                        {/* Temperature */}
                        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 shadow-lg">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <Thermometer className="h-5 w-5 text-orange-600" />
                                <span className="font-semibold text-gray-900">Temperature</span>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`${getVitalStatus(prescription.vital_signs.temperature, {min: 97, max: 99}) === 'normal' ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}`}
                              >
                                {getVitalStatus(prescription.vital_signs.temperature, {min: 97, max: 99})}
                              </Badge>
                            </div>
                            <Input
                              value={prescription.vital_signs.temperature || ''}
                              onChange={(e) => updateVitalSigns('temperature', e.target.value)}
                              placeholder="98.6"
                              className="text-2xl font-bold text-center bg-white border-orange-200 focus:border-orange-500"
                              disabled={prescription.is_finalized}
                            />
                            <p className="text-xs text-orange-600 text-center mt-1">°F (97-99)</p>
                          </CardContent>
                        </Card>

                        {/* Blood Pressure */}
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-lg">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <Activity className="h-5 w-5 text-blue-600" />
                                <span className="font-semibold text-gray-900">Blood Pressure</span>
                              </div>
                              <Badge variant="outline" className="border-blue-500 text-blue-700">
                                systolic/diastolic
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Input
                                value={prescription.vital_signs.blood_pressure_systolic || ''}
                                onChange={(e) => updateVitalSigns('blood_pressure_systolic', e.target.value)}
                                placeholder="120"
                                className="text-xl font-bold text-center bg-white border-blue-200 focus:border-blue-500"
                                disabled={prescription.is_finalized}
                              />
                              <span className="text-2xl font-bold text-blue-600">/</span>
                              <Input
                                value={prescription.vital_signs.blood_pressure_diastolic || ''}
                                onChange={(e) => updateVitalSigns('blood_pressure_diastolic', e.target.value)}
                                placeholder="80"
                                className="text-xl font-bold text-center bg-white border-blue-200 focus:border-blue-500"
                                disabled={prescription.is_finalized}
                              />
                            </div>
                            <p className="text-xs text-blue-600 text-center mt-1">mmHg (120/80)</p>
                          </CardContent>
                        </Card>

                        {/* Weight */}
                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-lg">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <Weight className="h-5 w-5 text-purple-600" />
                                <span className="font-semibold text-gray-900">Weight</span>
                              </div>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <TrendingUp className="h-3 w-3 text-purple-600" />
                              </Button>
                            </div>
                            <Input
                              value={prescription.vital_signs.weight || ''}
                              onChange={(e) => updateVitalSigns('weight', e.target.value)}
                              placeholder="70"
                              className="text-2xl font-bold text-center bg-white border-purple-200 focus:border-purple-500"
                              disabled={prescription.is_finalized}
                            />
                            <p className="text-xs text-purple-600 text-center mt-1">kg</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Secondary Vitals */}
                      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                        <CardHeader 
                          className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-lg cursor-pointer"
                          onClick={() => setShowVitalsExpanded(!showVitalsExpanded)}
                        >
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <BarChart3 className="h-5 w-5" />
                              <span>Additional Vitals</span>
                            </div>
                            {showVitalsExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </CardTitle>
                        </CardHeader>
                        {showVitalsExpanded && (
                          <CardContent className="p-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <Label className="text-sm font-semibold text-gray-700">Height (cm)</Label>
                                <Input
                                  value={prescription.vital_signs.height || ''}
                                  onChange={(e) => updateVitalSigns('height', e.target.value)}
                                  placeholder="170"
                                  className="mt-2 bg-white border-teal-200 focus:border-teal-500"
                                  disabled={prescription.is_finalized}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-semibold text-gray-700">Respiratory Rate</Label>
                                <Input
                                  value={prescription.vital_signs.respiratory_rate || ''}
                                  onChange={(e) => updateVitalSigns('respiratory_rate', e.target.value)}
                                  placeholder="16"
                                  className="mt-2 bg-white border-teal-200 focus:border-teal-500"
                                  disabled={prescription.is_finalized}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-semibold text-gray-700">Oxygen Saturation (%)</Label>
                                <Input
                                  value={prescription.vital_signs.oxygen_saturation || ''}
                                  onChange={(e) => updateVitalSigns('oxygen_saturation', e.target.value)}
                                  placeholder="98"
                                  className="mt-2 bg-white border-teal-200 focus:border-teal-500"
                                  disabled={prescription.is_finalized}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-semibold text-gray-700">Blood Sugar (Fasting)</Label>
                                <Input
                                  value={prescription.vital_signs.blood_sugar_fasting || ''}
                                  onChange={(e) => updateVitalSigns('blood_sugar_fasting', e.target.value)}
                                  placeholder="90"
                                  className="mt-2 bg-white border-teal-200 focus:border-teal-500"
                                  disabled={prescription.is_finalized}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-semibold text-gray-700">Blood Sugar (PP)</Label>
                                <Input
                                  value={prescription.vital_signs.blood_sugar_postprandial || ''}
                                  onChange={(e) => updateVitalSigns('blood_sugar_postprandial', e.target.value)}
                                  placeholder="140"
                                  className="mt-2 bg-white border-teal-200 focus:border-teal-500"
                                  disabled={prescription.is_finalized}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-semibold text-gray-700">HbA1c (%)</Label>
                                <Input
                                  value={prescription.vital_signs.hba1c || ''}
                                  onChange={(e) => updateVitalSigns('hba1c', e.target.value)}
                                  placeholder="5.7"
                                  className="mt-2 bg-white border-teal-200 focus:border-teal-500"
                                  disabled={prescription.is_finalized}
                                />
                              </div>
                            </div>
                            <div className="mt-6">
                              <Label className="text-sm font-semibold text-gray-700">Vitals Notes</Label>
                              <Textarea
                                value={prescription.vital_signs.notes || ''}
                                onChange={(e) => updateVitalSigns('notes', e.target.value)}
                                placeholder="Additional notes about vital signs..."
                                rows={3}
                                className="mt-2 bg-white border-teal-200 focus:border-teal-500"
                                disabled={prescription.is_finalized}
                              />
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border-2 border-dashed border-green-200">
                      <div className="bg-white p-6 rounded-full shadow-lg mb-6">
                        <Activity className="h-12 w-12 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Initialize Vitals Monitoring</h3>
                      <p className="text-gray-600 mb-6 text-center max-w-md">
                        Create a prescription first to start tracking patient vital signs.
                      </p>
                      <Button 
                        onClick={initializePrescription} 
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Create Prescription
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="p-6 space-y-6 m-0">
                  <div className="space-y-6">
                    {/* Notes Header */}
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                            <MessageSquare className="h-5 w-5 text-purple-600" />
                            <span>Consultation Notes</span>
                          </h3>
                          <p className="text-purple-700 text-sm mt-1">Real-time documentation during consultation</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => setShowQuickNotes(!showQuickNotes)}
                            variant="outline"
                            size="sm"
                            className="bg-white"
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            Quick Notes
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Notes Panel */}
                    {showQuickNotes && (
                      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-t-lg">
                          <CardTitle className="flex items-center space-x-2">
                            <Zap className="h-5 w-5" />
                            <span>Quick Notes</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <Textarea
                            value={quickNotes}
                            onChange={(e) => setQuickNotes(e.target.value)}
                            placeholder="Quick notes during consultation..."
                            rows={4}
                            className="bg-white border-yellow-200 focus:border-yellow-500"
                          />
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-yellow-700">Auto-saved every 30 seconds</span>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" className="bg-white">
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                              <Button variant="outline" size="sm" className="bg-white">
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Consultation Details Card */}
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                      <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                        <CardTitle className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5" />
                          <span>Session Details</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <Calendar className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Date & Time</p>
                                <p className="font-semibold">{formatDateTime(consultation.scheduled_date, consultation.scheduled_time)}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="bg-green-100 p-2 rounded-lg">
                                <Clock className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Duration</p>
                                <p className="font-semibold">{consultation.duration} minutes</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-purple-100 p-2 rounded-lg">
                                <FileText className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Type</p>
                                <p className="font-semibold">{consultation.consultation_type}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="bg-yellow-100 p-2 rounded-lg">
                                <Star className="h-4 w-4 text-yellow-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Fee</p>
                                <p className="font-semibold">₹{consultation.consultation_fee}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Clinical Notes */}
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                      <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-lg">
                        <CardTitle className="flex items-center space-x-2">
                          <FileText className="h-5 w-5" />
                          <span>Clinical Documentation</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
                        <div>
                          <Label className="text-sm font-semibold text-gray-700 mb-3 block">Chief Complaint</Label>
                          <Textarea
                            placeholder="Patient's primary concern or reason for visit..."
                            rows={3}
                            className="bg-white border-indigo-200 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-gray-700 mb-3 block">History of Present Illness</Label>
                          <Textarea
                            placeholder="Detailed history of current illness..."
                            rows={4}
                            className="bg-white border-indigo-200 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-gray-700 mb-3 block">Physical Examination</Label>
                          <Textarea
                            placeholder="Physical examination findings..."
                            rows={4}
                            className="bg-white border-indigo-200 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-gray-700 mb-3 block">Assessment & Plan</Label>
                          <Textarea
                            placeholder="Clinical assessment and treatment plan..."
                            rows={4}
                            className="bg-white border-indigo-200 focus:border-indigo-500"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </div>

        {/* Right Panel - Video Meeting (60%) */}
        <div className="w-3/5 bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col shadow-2xl">
          {/* Meeting Controls Header */}
          <div className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium">Live Meeting</span>
                </div>
                <Separator orientation="vertical" className="h-6 bg-gray-600" />
                <div className="flex items-center space-x-2 text-gray-300">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">2 participants</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-gray-700">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-gray-700">
                  <Camera className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-gray-700">
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-gray-700">
                  <Settings className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6 bg-gray-600" />
                <Button
                  onClick={() => setIsMinimized(!isMinimized)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:bg-gray-700"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Meeting Content */}
          <div className="flex-1 relative">
            {consultation.doctor_meeting_link ? (
              <>
                <iframe
                  src={consultation.doctor_meeting_link}
                  className="w-full h-full border-0"
                  allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
                  allowFullScreen
                  title="Video Meeting"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-camera allow-microphone allow-display-capture"
                />
                
                {/* Meeting Overlay Controls */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-2xl p-4 border border-gray-600">
                    <div className="flex items-center space-x-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="bg-gray-800 bg-opacity-50 text-white hover:bg-gray-700 rounded-xl"
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="bg-gray-800 bg-opacity-50 text-white hover:bg-gray-700 rounded-xl"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="bg-gray-800 bg-opacity-50 text-white hover:bg-gray-700 rounded-xl"
                      >
                        <Monitor className="h-4 w-4" />
                      </Button>
                      <Separator orientation="vertical" className="h-6 bg-gray-500" />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="bg-red-600 bg-opacity-80 text-white hover:bg-red-700 rounded-xl"
                      >
                        End Call
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="text-center max-w-md mx-auto p-8">
                  <div className="bg-gray-700 p-8 rounded-full w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                    <Video className="h-16 w-16 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">No Meeting Link Available</h3>
                  <p className="text-gray-400 text-lg mb-6">
                    The meeting link has not been configured for this consultation session.
                  </p>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <p className="text-xs text-gray-500">
                      Contact support if this issue persists
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Meeting Status Footer */}
          <div className="bg-gray-800 border-t border-gray-700 p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4 text-gray-400">
                <div className="flex items-center space-x-1">
                  <Wifi className="h-3 w-3" />
                  <span>Strong connection</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>End-to-end encrypted</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Session time: {consultation.duration} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Volume2 className="h-3 w-3" />
                  <span>Audio quality: HD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 