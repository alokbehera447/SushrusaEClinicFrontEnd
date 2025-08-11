import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Video, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Play,
  Pause,
  Square,
  RefreshCw,
  Bell,
  Calendar,
  Stethoscope,
  Heart,
  Activity,
  Thermometer,
  Pill,
  FileText,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Timer,
  Zap,
  TrendingUp,
  Users,
  Eye,
  Edit,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Star,
  Shield,
  Award,
  Save,
  Send,
  Download,
  Upload,
  Camera,
  Microphone,
  Volume2,
  VolumeX,
  Settings,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Battery,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryEmpty,
  Clock as ClockIcon,
  Timer as TimerIcon,
  Calendar as CalendarIcon,
  User as UserIcon,
  Heart as HeartIcon,
  Activity as ActivityIcon,
  Thermometer as ThermometerIcon,
  Scale as ScaleIcon,
  Eye as EyeIcon,
  Brain as BrainIcon,
  Stethoscope as StethoscopeIcon,
  History as HistoryIcon,
  Plus as PlusIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  MessageSquare as MessageSquareIcon,
  Video as VideoIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  MapPin as MapPinIcon,
  CalendarDays as CalendarDaysIcon,
  Timer as TimerIcon,
  Zap as ZapIcon,
  TrendingUp as TrendingUpIcon,
  Users as UsersIcon,
  Eye as EyeIcon2,
  Edit as EditIcon2,
  Plus as PlusIcon2,
  Search as SearchIcon,
  Filter as FilterIcon,
  MoreVertical as MoreVerticalIcon,
  ChevronRight as ChevronRightIcon,
  ChevronDown as ChevronDownIcon,
  Star as StarIcon,
  Shield as ShieldIcon,
  Award as AwardIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Download as DownloadIcon2,
  Upload as UploadIcon,
  Camera as CameraIcon,
  Microphone as MicrophoneIcon,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
  Settings as SettingsIcon,
  Monitor as MonitorIcon,
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  Laptop as LaptopIcon,
  Desktop as DesktopIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Signal as SignalIcon,
  SignalHigh as SignalHighIcon,
  SignalMedium as SignalMediumIcon,
  SignalLow as SignalLowIcon,
  Battery as BatteryIcon,
  BatteryFull as BatteryFullIcon,
  BatteryMedium as BatteryMediumIcon,
  BatteryLow as BatteryLowIcon,
  BatteryEmpty as BatteryEmptyIcon
} from 'lucide-react';
import { Consultation as ApiConsultation, PatientProfile } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import ConsultationWorkflow from './ConsultationWorkflow';
import PrescriptionWriter from './PrescriptionWriter';
import VitalSignsPanel from './VitalSignsPanel';
import ConsultationNotes from './ConsultationNotes';

// Extend the API's Consultation type
interface Consultation extends ApiConsultation {
  doctor_meeting_link?: string;
  prescription?: {
    id: string;
    medicines: string[];
    instructions: string;
    writtenDate: string;
  }
}

interface ConsultationSession {
  consultation: Consultation;
  patient: PatientProfile;
  isActive: boolean;
  startTime?: Date;
  endTime?: Date;
  currentStep?: string;
}

interface ActiveConsultationProps {
  session: ConsultationSession;
  onComplete: (prescription?: any) => void;
  onUpdate: (session: ConsultationSession) => void;
}

const ActiveConsultation: React.FC<ActiveConsultationProps> = ({ 
  session, 
  onComplete, 
  onUpdate 
}) => {
  const [currentStep, setCurrentStep] = useState(session.currentStep || 'assessment');
  const [consultationNotes, setConsultationNotes] = useState('');
  const [vitalSigns, setVitalSigns] = useState({
    pulse: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    temperature: '',
    weight: '',
    height: '',
    oxygenSaturation: ''
  });
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [consultationDuration, setConsultationDuration] = useState(0);
  const [prescription, setPrescription] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();

  // Timer for consultation duration
  useEffect(() => {
    if (session.startTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const start = new Date(session.startTime!);
        const duration = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);
        setConsultationDuration(duration);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [session.startTime]);

  // Auto-save consultation notes
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (consultationNotes.trim()) {
        saveConsultationNotes();
      }
    }, 3000);

    return () => clearTimeout(autoSave);
  }, [consultationNotes]);

  const saveConsultationNotes = async () => {
    try {
      // Save consultation notes to backend
      await fetch(`/api/consultations/${session.consultation.id}/notes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          content: consultationNotes,
          is_private: false
        })
      });
    } catch (error) {
      console.error('Failed to save consultation notes:', error);
    }
  };

  const handleStepChange = (step: string) => {
    setCurrentStep(step);
    const updatedSession = { ...session, currentStep: step };
    onUpdate(updatedSession);
  };

  const handleCompleteConsultation = async () => {
    setIsSaving(true);
    try {
      // Save final consultation notes
      if (consultationNotes.trim()) {
        await saveConsultationNotes();
      }

      // Complete the consultation
      await fetch(`/api/consultations/${session.consultation.id}/complete/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      toast({
        title: "Consultation Completed",
        description: "Consultation has been completed successfully.",
        variant: "default",
      });

      onComplete(prescription);
    } catch (error) {
      console.error('Failed to complete consultation:', error);
      toast({
        title: "Error",
        description: "Failed to complete consultation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Consultation Header */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                <AvatarImage src={`/api/patients/${session.patient.user}/avatar`} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {session.patient.user_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Consultation with {session.patient.user_name}
                </h2>
                <p className="text-sm text-gray-600">
                  {session.consultation.consultation_type.replace('_', ' ')} • {session.consultation.chief_complaint}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Consultation Timer */}
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <TimerIcon className="w-5 h-5 text-blue-600" />
                <span className="font-mono text-lg font-bold text-gray-900">
                  {formatDuration(consultationDuration)}
                </span>
              </div>
              
              {/* Video Call Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={isVideoOn ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className="h-10 w-10 p-0"
                >
                  {isVideoOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant={isAudioOn ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsAudioOn(!isAudioOn)}
                  className="h-10 w-10 p-0"
                >
                  {isAudioOn ? <MicrophoneIcon className="w-4 h-4" /> : <MicrophoneOff className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setIsRecording(!isRecording)}
                  className="h-10 w-10 p-0"
                >
                  <Circle className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Complete Button */}
              <Button
                onClick={handleCompleteConsultation}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Complete Consultation
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Consultation Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Patient Info & Vital Signs */}
        <div className="lg:col-span-1 space-y-6">
          {/* Patient Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Age:</span>
                  <p className="font-medium">{session.patient.age || 'Not specified'} years</p>
                </div>
                <div>
                  <span className="text-gray-500">Gender:</span>
                  <p className="font-medium">{session.patient.gender}</p>
                </div>
                <div>
                  <span className="text-gray-500">Blood Group:</span>
                  <p className="font-medium">{session.patient.blood_group || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <p className="font-medium">{session.patient.user_phone}</p>
                </div>
              </div>
              
              {session.patient.allergies && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-red-800">Allergies</span>
                  </div>
                  <p className="text-sm text-red-700">{session.patient.allergies}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vital Signs */}
          <VitalSignsPanel
            vitalSigns={vitalSigns}
            onVitalSignsChange={setVitalSigns}
          />
        </div>

        {/* Center Panel - Consultation Workflow */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center">
                <StethoscopeIcon className="w-5 h-5 mr-2" />
                Consultation Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConsultationWorkflow
                currentStep={currentStep}
                onStepChange={handleStepChange}
                consultation={session.consultation}
                patient={session.patient}
                onComplete={handleCompleteConsultation}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Panel - Notes & Prescription */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultation Notes */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Consultation Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ConsultationNotes
              notes={consultationNotes}
              onNotesChange={setConsultationNotes}
              consultationId={session.consultation.id}
            />
          </CardContent>
        </Card>

        {/* Prescription Writer */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Pill className="w-5 h-5 mr-2" />
              Prescription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PrescriptionWriter
              consultation={session.consultation}
              patient={session.patient}
              vitalSigns={vitalSigns}
              onPrescriptionChange={setPrescription}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActiveConsultation;
