import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Heart, 
  AlertTriangle,
  Pill,
  FileText,
  Clock,
  Star,
  Activity,
  Thermometer,
  Scale,
  Eye,
  Brain,
  Stethoscope,
  History,
  Plus,
  Edit,
  Download,
  Share,
  MessageSquare,
  Video,
  Phone as PhoneIcon,
  Mail as MailIcon,
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  Heart as HeartIcon,
  AlertTriangle as AlertTriangleIcon,
  Pill as PillIcon,
  FileText as FileTextIcon,
  Clock as ClockIcon,
  Star as StarIcon,
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
  Video as VideoIcon
} from 'lucide-react';
import { Consultation as ApiConsultation, PatientProfile } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/api';

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

interface PatientContextPanelProps {
  consultation: Consultation;
  onClose: () => void;
}

const PatientContextPanel: React.FC<PatientContextPanelProps> = ({ consultation, onClose }) => {
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [patientConsultations, setPatientConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        // Fetch patient profile
        const profile = await fetch(`/api/patients/${consultation.patient}/profile/`).then(res => res.json());
        setPatientProfile(profile);
        
        // Fetch patient's previous consultations
        const consultations = await fetch(`/api/consultations/?patient=${consultation.patient}&ordering=-scheduled_date`).then(res => res.json());
        setPatientConsultations(consultations.results || consultations);
      } catch (error) {
        console.error('Failed to fetch patient data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [consultation.patient]);

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getBloodGroupColor = (bloodGroup: string) => {
    const colors: { [key: string]: string } = {
      'A+': 'bg-red-100 text-red-800 border-red-300',
      'A-': 'bg-red-50 text-red-700 border-red-200',
      'B+': 'bg-blue-100 text-blue-800 border-blue-300',
      'B-': 'bg-blue-50 text-blue-700 border-blue-200',
      'AB+': 'bg-purple-100 text-purple-800 border-purple-300',
      'AB-': 'bg-purple-50 text-purple-700 border-purple-200',
      'O+': 'bg-green-100 text-green-800 border-green-300',
      'O-': 'bg-green-50 text-green-700 border-green-200',
    };
    return colors[bloodGroup] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getConsultationStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-32">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600">Loading patient information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patientProfile) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Patient information not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Patient Header */}
      <div className="flex items-start space-x-4">
        <Avatar className="h-16 w-16 border-4 border-gray-200">
          <AvatarImage src={`/api/patients/${consultation.patient}/avatar`} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
            {patientProfile.user_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{patientProfile.user_name}</h3>
          <p className="text-sm text-gray-600">
            {patientProfile.age ? `${patientProfile.age} years` : 'Age not specified'} • {patientProfile.gender}
          </p>
          
          <div className="flex items-center space-x-2 mt-2">
            <Badge className={getBloodGroupColor(patientProfile.blood_group)}>
              <HeartIcon className="w-3 h-3 mr-1" />
              {patientProfile.blood_group || 'Not specified'}
            </Badge>
            
            {patientProfile.allergies && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangleIcon className="w-3 h-3 mr-1" />
                Allergies
              </Badge>
            )}
          </div>
        </div>
        
        <Button variant="ghost" size="sm" onClick={onClose}>
          <EditIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center space-x-2">
          <PhoneIcon className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700">{patientProfile.user_phone}</span>
        </div>
        
        {patientProfile.user_email && (
          <div className="flex items-center space-x-2">
            <MailIcon className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{patientProfile.user_email}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <MapPinIcon className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700">
            {patientProfile.city}, {patientProfile.state}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700">
            {patientProfile.date_of_birth ? formatDate(patientProfile.date_of_birth) : 'Not specified'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="medical" className="text-xs">Medical</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Medical Summary */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <StethoscopeIcon className="w-4 h-4 mr-2" />
              Medical Summary
            </h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Total Consultations:</span>
                <p className="font-medium">{patientConsultations.length}</p>
              </div>
              <div>
                <span className="text-gray-500">Last Visit:</span>
                <p className="font-medium">
                  {patientConsultations.length > 0 
                    ? formatDate(patientConsultations[0].scheduled_date)
                    : 'No previous visits'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Current Medications */}
          {patientProfile.current_medications && patientProfile.current_medications.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <PillIcon className="w-4 h-4 mr-2" />
                Current Medications
              </h4>
              <div className="space-y-2">
                {patientProfile.current_medications.map((medication, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {medication}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Allergies */}
          {patientProfile.allergies && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <AlertTriangleIcon className="w-4 h-4 mr-2 text-red-500" />
                Allergies
              </h4>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{patientProfile.allergies}</p>
              </div>
            </div>
          )}

          {/* Chronic Conditions */}
          {patientProfile.chronic_conditions && patientProfile.chronic_conditions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <ActivityIcon className="w-4 h-4 mr-2" />
                Chronic Conditions
              </h4>
              <div className="space-y-2">
                {patientProfile.chronic_conditions.map((condition, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="medical" className="space-y-4 mt-4">
          {/* Medical History */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <HistoryIcon className="w-4 h-4 mr-2" />
              Medical History
            </h4>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700">
                {patientProfile.medical_history || 'No medical history recorded'}
              </p>
            </div>
          </div>

          {/* Insurance Information */}
          {patientProfile.insurance_provider && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Insurance Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Provider:</span>
                  <p className="font-medium">{patientProfile.insurance_provider}</p>
                </div>
                <div>
                  <span className="text-gray-500">Policy Number:</span>
                  <p className="font-medium">{patientProfile.insurance_policy_number}</p>
                </div>
                {patientProfile.insurance_expiry && (
                  <div>
                    <span className="text-gray-500">Expiry:</span>
                    <p className="font-medium">{formatDate(patientProfile.insurance_expiry)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          {/* Previous Consultations */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <ClockIcon className="w-4 h-4 mr-2" />
              Previous Consultations
            </h4>
            
            {patientConsultations.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {patientConsultations.slice(0, 5).map((prevConsultation) => (
                  <div key={prevConsultation.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{formatDate(prevConsultation.scheduled_date)}</span>
                      <Badge className={`text-xs ${getConsultationStatusColor(prevConsultation.status)}`}>
                        {prevConsultation.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{prevConsultation.chief_complaint}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">Dr. {prevConsultation.doctor_name}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">₹{prevConsultation.consultation_fee}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No previous consultations</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4 mt-4">
          {/* Medical Documents */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <FileTextIcon className="w-4 h-4 mr-2" />
              Medical Documents
            </h4>
            
            <div className="text-center py-8">
              <FileTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No documents uploaded</p>
              <Button size="sm" variant="outline" className="mt-2">
                <PlusIcon className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="flex space-x-2 pt-4 border-t border-gray-200">
        <Button size="sm" variant="outline" className="flex-1">
          <MessageSquareIcon className="w-4 h-4 mr-2" />
          Message
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          <VideoIcon className="w-4 h-4 mr-2" />
          Call
        </Button>
        <Button size="sm" variant="outline">
          <Share className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default PatientContextPanel;
