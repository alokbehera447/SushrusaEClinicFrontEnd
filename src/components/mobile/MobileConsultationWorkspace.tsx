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
  CheckCircle
} from 'lucide-react';
import { prescriptionApi, doctorConsultationApi, api } from '@/lib/api';

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
}

interface Consultation {
  id: string;
  patient: PatientProfile;
  doctor: any;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  chief_complaint?: string;
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
        setConsultation(consultData);
        setPatientProfile(consultData.patient);

        // Load prescription
        try {
          const pres = await prescriptionApi.getConsultationPrescription(consultationId);
          setPrescription(pres);
          
          // Set vital signs from prescription
          if (pres.vital_signs) {
            setVitalSigns({
              pulse: pres.vital_signs.pulse?.toString() || '',
              blood_pressure_systolic: pres.vital_signs.blood_pressure_systolic?.toString() || '',
              blood_pressure_diastolic: pres.vital_signs.blood_pressure_diastolic?.toString() || '',
              temperature: pres.vital_signs.temperature?.toString() || '',
              weight: pres.vital_signs.weight?.toString() || '',
              height: pres.vital_signs.height?.toString() || '',
            });
          }
          
          // Set patient history
          setPatientHistory(pres.patient_history || []);
        } catch (err) {
          console.error('Error loading prescription:', err);
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
        <div className="px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/consultations')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Mobile Consultation</h1>
          <div className="w-9" /> {/* Spacer */}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Meeting Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Video className="w-4 h-4 mr-2 text-blue-600" />
              Video Consultation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Video className="w-4 h-4 mr-2" />
              Join Meeting
            </Button>
          </CardContent>
        </Card>

        {/* Patient Profile */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <User className="w-4 h-4 mr-2 text-green-600" />
              Patient Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                {patientProfile.profile_picture ? (
                  <AvatarImage src={patientProfile.profile_picture} alt={patientProfile.name} />
                ) : (
                  <AvatarFallback className="bg-green-100 text-green-700">
                    {patientProfile.name?.[0] || 'P'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{patientProfile.name}</h3>
                <p className="text-sm text-gray-600">{patientProfile.phone}</p>
                <p className="text-sm text-gray-600">{patientProfile.email}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">DOB:</span>
                <p className="text-gray-600">{patientProfile.date_of_birth || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Gender:</span>
                <p className="text-gray-600">{patientProfile.gender || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Previous Prescriptions */}
        {patientHistory.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <FileText className="w-4 h-4 mr-2 text-purple-600" />
                Previous Prescriptions ({patientHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patientHistory.slice(0, 3).map((prescription) => (
                  <div key={prescription.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium">CON{prescription.consultation}</p>
                      <p className="text-xs text-gray-600">{prescription.issued_date}</p>
                    </div>
                    <Badge variant={prescription.is_finalized ? "default" : "secondary"}>
                      {prescription.is_finalized ? "Finalized" : "Draft"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vital Signs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Heart className="w-4 h-4 mr-2 text-red-600" />
              Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pulse" className="text-sm">Pulse (bpm)</Label>
                <Input
                  id="pulse"
                  type="number"
                  value={vitalSigns.pulse}
                  onChange={(e) => setVitalSigns(prev => ({ ...prev, pulse: e.target.value }))}
                  placeholder="72"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="systolic" className="text-sm">Systolic BP</Label>
                <Input
                  id="systolic"
                  type="number"
                  value={vitalSigns.blood_pressure_systolic}
                  onChange={(e) => setVitalSigns(prev => ({ ...prev, blood_pressure_systolic: e.target.value }))}
                  placeholder="120"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="diastolic" className="text-sm">Diastolic BP</Label>
                <Input
                  id="diastolic"
                  type="number"
                  value={vitalSigns.blood_pressure_diastolic}
                  onChange={(e) => setVitalSigns(prev => ({ ...prev, blood_pressure_diastolic: e.target.value }))}
                  placeholder="80"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="temperature" className="text-sm">Temperature (°F)</Label>
                <Input
                  id="temperature"
                  type="number"
                  value={vitalSigns.temperature}
                  onChange={(e) => setVitalSigns(prev => ({ ...prev, temperature: e.target.value }))}
                  placeholder="98.6"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="weight" className="text-sm">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={vitalSigns.weight}
                  onChange={(e) => setVitalSigns(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="70"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="height" className="text-sm">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={vitalSigns.height}
                  onChange={(e) => setVitalSigns(prev => ({ ...prev, height: e.target.value }))}
                  placeholder="170"
                  className="mt-1"
                />
              </div>
            </div>
            <Button 
              onClick={handleSaveVitalSigns}
              className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Vital Signs
            </Button>
          </CardContent>
        </Card>

        {/* Photo Upload */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Camera className="w-4 h-4 mr-2 text-orange-600" />
              Prescription Image
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                className="w-full border-dashed border-2 border-gray-300 hover:border-orange-500"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Prescription Image
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Image uploaded successfully</p>
                  <p className="text-xs text-gray-500">{uploadedImage.name}</p>
                </div>
                <Button
                  onClick={handleCameraCapture}
                  variant="outline"
                  className="w-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Change Image
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate PDF */}
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={handleGeneratePDF}
              disabled={!uploadedImage || generating}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-lg"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Generate Prescription PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileConsultationWorkspace;
