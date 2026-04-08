import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Settings,
  FileText,
  Clock,
  User,
  Heart,
  Thermometer,
  Activity,
  Plus,
  Send,
  Camera,
  Monitor,
  Volume2,
  VolumeX,
  Download,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { prescriptionApi, EnhancedPrescription, CreatePrescriptionData, PrescriptionMedication } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';

interface VideoConsultationProps {
  consultationId?: string;
  patientId?: string;
}

const VideoConsultation = ({ consultationId, patientId }: VideoConsultationProps) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [activeTab, setActiveTab] = useState('patient-info');
  
  // Prescription states
  const [prescription, setPrescription] = useState<EnhancedPrescription | null>(null);
  const [isLoadingPrescription, setIsLoadingPrescription] = useState(false);
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState<Partial<CreatePrescriptionData>>({
    primary_diagnosis: '',
    general_instructions: '',
    medications: []
  });

  const { user } = useAuth();

  // Mock data
  const patientInfo = {
    id: patientId || 'PAT12345',
    name: 'Rajesh Kumar',
    age: 42,
    gender: 'Male',
    phone: '+91 98765 43210',
    bloodGroup: 'B+',
    allergies: 'Penicillin, Dust',
    appointmentId: consultationId || 'APT-2024-001',
    symptoms: 'Chest pain, shortness of breath, fatigue',
    duration: '3 days'
  };

  const vitals = [
    { label: 'Blood Pressure', value: '140/90 mmHg', status: 'high' },
    { label: 'Heart Rate', value: '85 bpm', status: 'normal' },
    { label: 'Temperature', value: '98.6°F', status: 'normal' },
    { label: 'Oxygen Saturation', value: '97%', status: 'normal' }
  ];

  const consultationHistory = [
    { date: '2024-01-10', doctor: 'Dr. Amit Kumar', diagnosis: 'Hypertension', prescription: 'Amlodipine 5mg' },
    { date: '2023-12-15', doctor: 'Dr. Priya Singh', diagnosis: 'Routine Checkup', prescription: 'Vitamin D3' }
  ];

  // Load prescription for consultation
  useEffect(() => {
    if (consultationId) {
      loadPrescription();
    }
  }, [consultationId]);

  const loadPrescription = async () => {
    if (!consultationId) return;
    
    setIsLoadingPrescription(true);
    try {
      const prescriptionData = await prescriptionApi.getConsultationPrescription(consultationId);
      setPrescription(prescriptionData);
      setPrescriptionData({
        primary_diagnosis: prescriptionData.primary_diagnosis || '',
        general_instructions: prescriptionData.general_instructions || '',
        medications: prescriptionData.medications || []
      });
    } catch (error) {
      console.error('Error loading prescription:', error);
      // If no prescription exists, we'll create one when needed
    } finally {
      setIsLoadingPrescription(false);
    }
  };

  const savePrescription = async () => {
    if (!consultationId || !patientId) {
      toast.error('Consultation ID and Patient ID are required');
      return;
    }

    setIsSavingPrescription(true);
    try {
      if (prescription?.id) {
        // Update existing prescription
        const updatedPrescription = await prescriptionApi.partialUpdatePrescription(
          prescription.id.toString(),
          prescriptionData
        );
        setPrescription(updatedPrescription);
        toast.success('Prescription saved successfully');
      } else {
        // Create new prescription
        const newPrescription = await prescriptionApi.createPrescription({
          consultation: consultationId,
          patient: patientId,
          ...prescriptionData
        });
        setPrescription(newPrescription);
        toast.success('Prescription created successfully');
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast.error('Failed to save prescription');
    } finally {
      setIsSavingPrescription(false);
    }
  };

  const generatePrescriptionPDF = async () => {
    if (!prescription?.id) {
      toast.error('Please save the prescription first');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const result = await prescriptionApi.finalizeAndGeneratePDF(
        prescription.id.toString(),
        prescriptionData
      );
      
      // Update prescription with finalized data
      setPrescription(result.prescription);
      
      // Download the PDF
      if (result.pdf.url) {
        const link = document.createElement('a');
        link.href = result.pdf.url;
        link.download = `prescription_${consultationId}_${new Date().toISOString().split('T')[0]}.pdf`;
        link.target = '_blank'; // Open in new tab for signed URLs
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast.success('Prescription PDF generated and downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate prescription PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const addMedication = () => {
    const newMedication: Omit<PrescriptionMedication, 'id'> = {
      medicine_name: '',
      composition: '',
      dosage_form: 'tablet',
      morning_dose: 0,
      afternoon_dose: 0,
      evening_dose: 0,
      frequency: 'once_daily',
      timing: 'after_breakfast',
      duration_days: 7,
      is_continuous: true,
      special_instructions: '',
      notes: '',
      order: (prescriptionData.medications?.length || 0) + 1
    };

    setPrescriptionData(prev => ({
      ...prev,
      medications: [...(prev.medications || []), newMedication]
    }));
  };

  const updateMedication = (index: number, field: keyof PrescriptionMedication, value: string | number) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications?.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const removeMedication = (index: number) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications?.filter((_, i) => i !== index)
    }));
  };

  const getVitalStatus = (status: string) => {
    switch (status) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'normal': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'patient-info', label: 'Patient Info', icon: User },
    { id: 'vitals', label: 'Vitals', icon: Activity },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'prescription', label: 'Prescription', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-500 text-white">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                Live Consultation
              </Badge>
              <span className="text-white font-medium">{patientInfo.appointmentId}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">Duration: 00:15:23</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Video Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Main Video Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-3/4">
              {/* Doctor Video */}
              <Card className="border-0 shadow-xl rounded-2xl bg-gray-900 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E17726]/20 to-transparent"></div>
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-[#E17726] text-white">Dr. Priya Singh</Badge>
                </div>
                <div className="absolute bottom-4 right-4 z-10">
                  <div className="flex space-x-2">
                    {!isVideoOn && (
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <VideoOff className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {!isAudioOn && (
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <MicOff className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-center h-full">
                  {isVideoOn ? (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <img 
                        src="/doctor-avatar-1.svg" 
                        alt="Doctor" 
                        className="w-32 h-32 rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="text-center text-white">
                      <VideoOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Camera is off</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Patient Video */}
              <Card className="border-0 shadow-xl rounded-2xl bg-gray-900 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-aqua/20 to-transparent"></div>
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-aqua text-white">{patientInfo.name}</Badge>
                </div>
                <div className="flex items-center justify-center h-full">
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <img 
                      src="/patient-avatar-1.svg" 
                      alt="Patient" 
                      className="w-32 h-32 rounded-full"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Video Controls */}
            <Card className="border-0 shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant={isVideoOn ? "default" : "destructive"}
                    size="lg"
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className="rounded-full w-14 h-14"
                  >
                    {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                  </Button>
                  
                  <Button
                    variant={isAudioOn ? "default" : "destructive"}
                    size="lg"
                    onClick={() => setIsAudioOn(!isAudioOn)}
                    className="rounded-full w-14 h-14"
                  >
                    {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                  </Button>

                  <Button
                    variant={isSpeakerOn ? "default" : "outline"}
                    size="lg"
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                    className="rounded-full w-14 h-14"
                  >
                    {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full w-14 h-14 border-gray-300"
                  >
                    <Monitor className="w-6 h-6" />
                  </Button>

                  <Button
                    variant="destructive"
                    size="lg"
                    className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="grid grid-cols-2 gap-1 bg-white rounded-xl p-1 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                    activeTab === tab.id
                      ? 'bg-[#E17726] text-white shadow-md'
                      : 'text-gray-600 hover:text-[#E17726] hover:bg-[#E17726]/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-1" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <Card className="border-0 shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm flex-1">
              <CardContent className="p-6 h-full overflow-y-auto">
                {/* Patient Info Tab */}
                {activeTab === 'patient-info' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <img 
                        src="/patient-avatar-1.svg" 
                        alt="Patient" 
                        className="w-16 h-16 mx-auto mb-3 rounded-full"
                      />
                      <h3 className="font-bold text-midnight">{patientInfo.name}</h3>
                      <p className="text-sm text-gray-600">{patientInfo.id}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Age:</span>
                        <span className="font-medium">{patientInfo.age} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-medium">{patientInfo.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Blood Group:</span>
                        <span className="font-medium">{patientInfo.bloodGroup}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium text-sm">{patientInfo.phone}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-midnight mb-2">Chief Complaints</h4>
                      <p className="text-sm text-gray-700">{patientInfo.symptoms}</p>
                      <p className="text-xs text-gray-500 mt-1">Duration: {patientInfo.duration}</p>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-midnight mb-2">Allergies</h4>
                      <p className="text-sm text-red-600">{patientInfo.allergies}</p>
                    </div>
                  </div>
                )}

                {/* Vitals Tab */}
                {activeTab === 'vitals' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-midnight">Current Vitals</h3>
                    {vitals.map((vital, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-midnight">{vital.label}</p>
                          <p className="text-sm text-gray-600">{vital.value}</p>
                        </div>
                        <Badge className={getVitalStatus(vital.status)}>
                          {vital.status}
                        </Badge>
                      </div>
                    ))}
                    <Button className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Vital
                    </Button>
                  </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-midnight">Consultation History</h3>
                    {consultationHistory.map((consultation, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-midnight">{consultation.date}</p>
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            Completed
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{consultation.doctor}</p>
                        <p className="text-sm font-medium text-midnight">{consultation.diagnosis}</p>
                        <p className="text-xs text-gray-500">{consultation.prescription}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Prescription Tab */}
                {activeTab === 'prescription' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-midnight">Write Prescription</h3>
                      {prescription?.is_finalized && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Finalized
                        </Badge>
                      )}
                    </div>

                    {isLoadingPrescription ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E17726] mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">Loading prescription...</p>
                      </div>
                    ) : (
                      <>
                        {/* Diagnosis */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Primary Diagnosis
                          </label>
                          <Input
                            placeholder="Enter diagnosis..."
                            value={prescriptionData.primary_diagnosis || ''}
                            onChange={(e) => setPrescriptionData(prev => ({
                              ...prev,
                              primary_diagnosis: e.target.value
                            }))}
                            className="rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                          />
                        </div>

                        {/* General Instructions */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            General Instructions
                          </label>
                          <Textarea
                            placeholder="Enter general instructions..."
                            value={prescriptionData.general_instructions || ''}
                            onChange={(e) => setPrescriptionData(prev => ({
                              ...prev,
                              general_instructions: e.target.value
                            }))}
                            className="min-h-20 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                          />
                        </div>

                        {/* Medications */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Medications
                            </label>
                            <Button
                              type="button"
                              size="sm"
                              onClick={addMedication}
                              className="bg-[#E17726] hover:bg-[#c9651e] text-white rounded-lg"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add
                            </Button>
                          </div>
                          
                          <div className="space-y-3">
                            {prescriptionData.medications?.map((medication, index) => (
                              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    Medication {index + 1}
                                  </span>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeMedication(index)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Remove
                                  </Button>
                                </div>
                                
                                <div className="space-y-2">
                                  <Input
                                    placeholder="Medicine name"
                                    value={medication.medicine_name}
                                    onChange={(e) => updateMedication(index, 'medicine_name', e.target.value)}
                                    className="text-sm"
                                  />
                                  
                                  <div className="grid grid-cols-3 gap-2">
                                    <Input
                                      placeholder="Morning"
                                      type="number"
                                      value={medication.morning_dose}
                                      onChange={(e) => updateMedication(index, 'morning_dose', parseInt(e.target.value) || 0)}
                                      className="text-sm"
                                    />
                                    <Input
                                      placeholder="Afternoon"
                                      type="number"
                                      value={medication.afternoon_dose}
                                      onChange={(e) => updateMedication(index, 'afternoon_dose', parseInt(e.target.value) || 0)}
                                      className="text-sm"
                                    />
                                    <Input
                                      placeholder="Evening"
                                      type="number"
                                      value={medication.evening_dose}
                                      onChange={(e) => updateMedication(index, 'evening_dose', parseInt(e.target.value) || 0)}
                                      className="text-sm"
                                    />
                                  </div>
                                  
                                  <Input
                                    placeholder="Special instructions"
                                    value={medication.special_instructions || ''}
                                    onChange={(e) => updateMedication(index, 'special_instructions', e.target.value)}
                                    className="text-sm"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          <Button
                            onClick={savePrescription}
                            disabled={isSavingPrescription}
                            className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white rounded-xl"
                          >
                            {isSavingPrescription ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Prescription
                              </>
                            )}
                          </Button>

                          {prescription?.id && (
                            <Button
                              onClick={generatePrescriptionPDF}
                              disabled={isGeneratingPDF}
                              variant="outline"
                              className="w-full border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white rounded-xl"
                            >
                              {isGeneratingPDF ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E17726] mr-2"></div>
                                  Generating PDF...
                                </>
                              ) : (
                                <>
                                  <Download className="w-4 h-4 mr-2" />
                                  Generate & Download PDF
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Consultation Notes */}
            <Card className="border-0 shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-midnight">Consultation Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Add consultation notes..."
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  className="min-h-24 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                />
                <Button className="w-full bg-aqua hover:bg-aqua/90 text-white rounded-xl">
                  <Send className="w-4 h-4 mr-2" />
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoConsultation;
