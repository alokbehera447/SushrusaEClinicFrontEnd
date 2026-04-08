import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { patientApi, doctorApi } from '@/lib/api';
import { 
  User,
  Phone,
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
  Stethoscope,
  Heart,
  Weight,
  Thermometer,
  Droplets,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Activity,
  Shield,
  Loader2,
  Edit,
  X
} from 'lucide-react';

// Interfaces
interface Consultation {
  id: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  patient_age: number;
  patient_gender: string;
  doctor_name: string;
  scheduled_date: string;
  scheduled_time: string;
  duration: number;
  consultation_type: string;
  consultation_fee: number;
  status: string;
  chief_complaint: string;
  symptoms: string;
  doctor_meeting_link?: string;
}

interface Medication {
  id?: number;
  name: string;
  generic_name: string;
  brand_name: string;
  strength: string;
  dosage_form: string;
  dosage: string;
  frequency: string;
  timing: string;
  duration_days: number;
  total_quantity: number;
  special_instructions: string;
  order: number;
}

interface VitalSigns {
  blood_pressure_systolic: string;
  blood_pressure_diastolic: string;
  heart_rate: string;
  temperature: string;
  respiratory_rate: string;
  oxygen_saturation: string;
  weight: string;
  height: string;
  bmi: string;
}

interface Prescription {
  id?: number;
  consultation: string;
  patient_name: string;
  doctor_name: string;
  diagnosis: string;
  symptoms: string;
  general_instructions: string;
  issued_date: string;
  valid_until: string;
  status: string;
  is_finalized: boolean;
  medications: Medication[];
  vital_signs: VitalSigns;
}

export default function ConsultationMeeting() {
  const { consultationId } = useParams<{ consultationId: string }>();
  const { toast } = useToast();

  // State
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('prescription');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Auto-save effect
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      if (prescription && autoSaveEnabled && (!prescription.is_finalized || isEditing)) {
        savePrescription(true);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveTimer);
  }, [prescription, autoSaveEnabled, isEditing]);

  // Responsive effect
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Load data on mount
  useEffect(() => {
    if (consultationId) {
      loadConsultationData();
    }
  }, [consultationId]);

  const loadConsultationData = async () => {
    try {
      setLoading(true);
      
      // Load consultation details
      const consultationResponse = await patientApi.getConsultation(consultationId!);
      setConsultation(consultationResponse);
      
      // Load existing prescription if any
      await loadPrescription();
    } catch (error) {
      console.error('Error loading consultation data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load consultation data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPrescription = async () => {
    try {
      const prescriptions = await patientApi.getConsultationPrescriptions(consultationId!);
      if (prescriptions && prescriptions.length > 0) {
        setPrescription(prescriptions[0]);
      } else {
        initializePrescription();
      }
    } catch (error) {
      console.error('Error loading prescription:', error);
      initializePrescription();
    }
  };

  const initializePrescription = () => {
    if (!consultation) return;

    const newPrescription: Prescription = {
      consultation: consultationId!,
      patient_name: consultation.patient_name,
      doctor_name: consultation.doctor_name,
      diagnosis: '',
      symptoms: consultation.symptoms || '',
      general_instructions: '',
      issued_date: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      is_finalized: false,
      medications: [],
      vital_signs: {
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        heart_rate: '',
        temperature: '',
        respiratory_rate: '',
        oxygen_saturation: '',
        weight: '',
        height: '',
        bmi: ''
      }
    };

    setPrescription(newPrescription);
  };

  const addMedication = () => {
    if (!prescription) return;

    const newMedication: Medication = {
      name: '',
      generic_name: '',
      brand_name: '',
      strength: '',
      dosage_form: 'tablet',
      dosage: '',
      frequency: '',
      timing: 'after_meal',
      duration_days: 7,
      total_quantity: 0,
      special_instructions: '',
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

  const updatePrescription = (field: keyof Prescription, value: string) => {
    if (!prescription) return;

    setPrescription({
      ...prescription,
      [field]: value,
    });
  };

  const updateVitalSigns = (field: keyof VitalSigns, value: string) => {
    if (!prescription || !prescription.vital_signs) return;

    setPrescription({
      ...prescription,
      vital_signs: {
        ...prescription.vital_signs,
        [field]: value,
      },
    });
  };

  const savePrescription = async (isAutoSave = false) => {
    if (!prescription) return;

    try {
      setSaving(true);

      // Use direct API calls since structured endpoints don't exist
      let response;
      if (prescription.id) {
        // Update existing prescription
        response = await fetch(`/api/prescriptions/${prescription.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify(prescription)
        });
      } else {
        // Create new prescription
        response = await fetch('/api/prescriptions/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify(prescription)
        });
      }

      if (response.ok) {
        const data = await response.json();
        setPrescription(data.data || data);
        
        if (!isAutoSave) {
          toast({
            title: 'Success',
            description: 'Prescription saved successfully',
          });
        }
      } else {
        throw new Error('Failed to save prescription');
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      if (!isAutoSave) {
        toast({
          title: 'Error',
          description: 'Failed to save prescription',
          variant: 'destructive'
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const finalizePrescription = async () => {
    if (!prescription) return;

    try {
      setSaving(true);

      const finalizedPrescription = {
        ...prescription,
        is_finalized: true,
        status: 'active',
        issued_date: new Date().toISOString().split('T')[0],
      };

      let response;
      if (prescription.id) {
        response = await fetch(`/api/prescriptions/${prescription.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify(finalizedPrescription)
        });
      } else {
        response = await fetch('/api/prescriptions/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify(finalizedPrescription)
        });
      }

      if (response.ok) {
        const data = await response.json();
        setPrescription(data.data || data);
        setIsEditing(false); // Exit edit mode when finalized
        
        toast({
          title: 'Success',
          description: 'Prescription finalized successfully',
        });
      } else {
        throw new Error('Failed to finalize prescription');
      }
    } catch (error) {
      console.error('Error finalizing prescription:', error);
      toast({
        title: 'Error',
        description: 'Failed to finalize prescription',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleEditMode = () => {
    const newEditingState = !isEditing;
    setIsEditing(newEditingState);
    console.log('Edit mode toggled:', newEditingState);
    console.log('Prescription finalized:', prescription?.is_finalized);
    console.log('Fields should be disabled:', prescription?.is_finalized && !newEditingState);
    
    if (!isEditing) {
      toast({
        title: 'Edit Mode',
        description: 'You can now edit the finalized prescription',
      });
    } else {
      toast({
        title: 'View Mode',
        description: 'Prescription is now in view-only mode',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#E17726] mx-auto mb-4" />
          <p className="text-gray-600">Loading consultation...</p>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Consultation not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Mobile Header */}
      {isMobileView && (
        <div className="bg-white shadow-sm border-b px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Consultation</h1>
              <p className="text-sm text-gray-600">{consultation.patient_name}</p>
            </div>
            <Button
              onClick={() => setIsPanelMinimized(!isPanelMinimized)}
              variant="outline"
              size="sm"
            >
              {isPanelMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      <div className={`flex ${isMobileView ? 'flex-col' : 'flex-row'} h-screen`}>
        {/* Left Panel - Patient & Prescription Data */}
        <div className={`
          ${isMobileView 
            ? isPanelMinimized 
              ? 'h-0 overflow-hidden' 
              : 'h-1/2' 
            : 'w-2/5'
          } 
          bg-white shadow-xl border-r border-gray-200 flex flex-col
        `}>
          {/* Desktop Header */}
          {!isMobileView && (
            <div className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Digital Consultation</h1>
                  <p className="text-orange-100">Session ID: {consultationId}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Active Session</span>
                </div>
              </div>
            </div>
          )}

          {/* Patient Information */}
          <div className="p-4 border-b">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-[#E17726]" />
                  <span>Patient Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{consultation.patient_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-semibold">{consultation.patient_age} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-semibold">{consultation.patient_gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{consultation.patient_phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Chief Complaint</p>
                  <p className="font-semibold">{consultation.chief_complaint}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prescription & Clinical Data Tabs */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-4 pt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="prescription"
                    className="flex items-center space-x-2"
                  >
                    <Pill className="h-4 w-4" />
                    <span>Prescription</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="vitals"
                    className="flex items-center space-x-2"
                  >
                    <Activity className="h-4 w-4" />
                    <span>Vitals</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                {/* Prescription Tab */}
                <TabsContent value="prescription" className="p-4 space-y-4 m-0">
                  {prescription ? (
                    <div className="space-y-4">
                      {/* Prescription Header with Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-[#E17726]" />
                          <span className="font-semibold">Digital Prescription</span>
                          {prescription.is_finalized && (
                            <Badge variant="default" className="bg-green-600">
                              Finalized
                            </Badge>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => savePrescription()}
                            disabled={saving || (prescription.is_finalized && !isEditing)}
                            size="sm"
                            variant="outline"
                          >
                            {saving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                          {prescription.is_finalized ? (
                            <Button
                              onClick={toggleEditMode}
                              disabled={saving}
                              size="sm"
                              variant={isEditing ? "destructive" : "outline"}
                            >
                              {isEditing ? (
                                <>
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel Edit
                                </>
                              ) : (
                                <>
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              onClick={finalizePrescription}
                              disabled={saving}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Finalize
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Auto-save indicator */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Auto-save: {autoSaveEnabled ? 'On' : 'Off'}</span>
                        <Button
                          onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                          variant="ghost"
                          size="sm"
                        >
                          {autoSaveEnabled ? 'Disable' : 'Enable'} Auto-save
                        </Button>
                      </div>

                      {/* Basic Information */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label htmlFor="diagnosis">Diagnosis</Label>
                            <Input
                              id="diagnosis"
                              value={prescription.diagnosis}
                              onChange={(e) => updatePrescription('diagnosis', e.target.value)}
                              placeholder="Primary diagnosis"
                              disabled={prescription.is_finalized && !isEditing}
                              className={prescription.is_finalized && !isEditing ? 'bg-gray-100' : ''}
                            />
                          </div>
                          <div>
                            <Label htmlFor="symptoms">Symptoms</Label>
                            <Textarea
                              id="symptoms"
                              value={prescription.symptoms}
                              onChange={(e) => updatePrescription('symptoms', e.target.value)}
                              placeholder="Patient symptoms"
                              rows={3}
                              disabled={prescription.is_finalized && !isEditing}
                            />
                          </div>
                          <div>
                            <Label htmlFor="instructions">General Instructions</Label>
                            <Textarea
                              id="instructions"
                              value={prescription.general_instructions}
                              onChange={(e) => updatePrescription('general_instructions', e.target.value)}
                              placeholder="General instructions for patient"
                              rows={3}
                              disabled={prescription.is_finalized && !isEditing}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Medications */}
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Medications</CardTitle>
                            <Button
                              onClick={addMedication}
                              size="sm"
                              variant="outline"
                              disabled={prescription.is_finalized && !isEditing}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Medicine
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {prescription.medications.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No medications added yet</p>
                          ) : (
                            prescription.medications.map((medication, index) => (
                              <Card key={index} className="border border-gray-200">
                                <CardContent className="p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">Medicine {index + 1}</span>
                                    <Button
                                      onClick={() => removeMedication(index)}
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600 hover:text-red-700"
                                      disabled={prescription.is_finalized && !isEditing}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <Label>Medicine Name</Label>
                                      <Input
                                        value={medication.name}
                                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                        placeholder="Medicine name"
                                        disabled={prescription.is_finalized && !isEditing}
                                      />
                                    </div>
                                    <div>
                                      <Label>Strength</Label>
                                      <Input
                                        value={medication.strength}
                                        onChange={(e) => updateMedication(index, 'strength', e.target.value)}
                                        placeholder="e.g., 500mg"
                                        disabled={prescription.is_finalized && !isEditing}
                                      />
                                    </div>
                                    <div>
                                      <Label>Dosage</Label>
                                      <Input
                                        value={medication.dosage}
                                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                        placeholder="e.g., 1 tablet"
                                        disabled={prescription.is_finalized && !isEditing}
                                      />
                                    </div>
                                    <div>
                                      <Label>Frequency</Label>
                                      <Input
                                        value={medication.frequency}
                                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                        placeholder="e.g., Twice daily"
                                        disabled={prescription.is_finalized && !isEditing}
                                      />
                                    </div>
                                    <div>
                                      <Label>Duration (days)</Label>
                                      <Input
                                        type="number"
                                        value={medication.duration_days}
                                        onChange={(e) => updateMedication(index, 'duration_days', parseInt(e.target.value))}
                                        disabled={prescription.is_finalized && !isEditing}
                                      />
                                    </div>
                                    <div>
                                      <Label>Total Quantity</Label>
                                      <Input
                                        type="number"
                                        value={medication.total_quantity}
                                        onChange={(e) => updateMedication(index, 'total_quantity', parseInt(e.target.value))}
                                        disabled={prescription.is_finalized && !isEditing}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Special Instructions</Label>
                                    <Textarea
                                      value={medication.special_instructions}
                                      onChange={(e) => updateMedication(index, 'special_instructions', e.target.value)}
                                      placeholder="Special instructions for this medication"
                                      rows={2}
                                      disabled={prescription.is_finalized && !isEditing}
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Prescription</h3>
                      <p className="text-gray-600 mb-4">Click below to create a new prescription</p>
                      <Button onClick={initializePrescription}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Prescription
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Vitals Tab */}
                <TabsContent value="vitals" className="p-4 space-y-4 m-0">
                  {prescription && prescription.vital_signs ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Stethoscope className="h-5 w-5 text-[#E17726]" />
                          <span>Vital Signs</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="bp_systolic">Blood Pressure (Systolic)</Label>
                            <div className="flex items-center space-x-2">
                              <Heart className="h-4 w-4 text-red-500" />
                              <Input
                                id="bp_systolic"
                                value={prescription.vital_signs.blood_pressure_systolic}
                                onChange={(e) => updateVitalSigns('blood_pressure_systolic', e.target.value)}
                                placeholder="120"
                                disabled={prescription.is_finalized && !isEditing}
                              />
                              <span className="text-sm text-gray-500">mmHg</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bp_diastolic">Blood Pressure (Diastolic)</Label>
                            <div className="flex items-center space-x-2">
                              <Heart className="h-4 w-4 text-red-500" />
                              <Input
                                id="bp_diastolic"
                                value={prescription.vital_signs.blood_pressure_diastolic}
                                onChange={(e) => updateVitalSigns('blood_pressure_diastolic', e.target.value)}
                                placeholder="80"
                                disabled={prescription.is_finalized && !isEditing}
                              />
                              <span className="text-sm text-gray-500">mmHg</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="heart_rate">Heart Rate</Label>
                            <div className="flex items-center space-x-2">
                              <Activity className="h-4 w-4 text-green-500" />
                              <Input
                                id="heart_rate"
                                value={prescription.vital_signs.heart_rate}
                                onChange={(e) => updateVitalSigns('heart_rate', e.target.value)}
                                placeholder="72"
                                disabled={prescription.is_finalized && !isEditing}
                              />
                              <span className="text-sm text-gray-500">bpm</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="temperature">Temperature</Label>
                            <div className="flex items-center space-x-2">
                              <Thermometer className="h-4 w-4 text-orange-500" />
                              <Input
                                id="temperature"
                                value={prescription.vital_signs.temperature}
                                onChange={(e) => updateVitalSigns('temperature', e.target.value)}
                                placeholder="98.6"
                                disabled={prescription.is_finalized && !isEditing}
                              />
                              <span className="text-sm text-gray-500">°F</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="oxygen_saturation">Oxygen Saturation</Label>
                            <div className="flex items-center space-x-2">
                              <Droplets className="h-4 w-4 text-blue-500" />
                              <Input
                                id="oxygen_saturation"
                                value={prescription.vital_signs.oxygen_saturation}
                                onChange={(e) => updateVitalSigns('oxygen_saturation', e.target.value)}
                                placeholder="98"
                                disabled={prescription.is_finalized && !isEditing}
                              />
                              <span className="text-sm text-gray-500">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="weight">Weight</Label>
                            <div className="flex items-center space-x-2">
                              <Weight className="h-4 w-4 text-purple-500" />
                              <Input
                                id="weight"
                                value={prescription.vital_signs.weight}
                                onChange={(e) => updateVitalSigns('weight', e.target.value)}
                                placeholder="70"
                                disabled={prescription.is_finalized && !isEditing}
                              />
                              <span className="text-sm text-gray-500">kg</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="text-center py-8">
                      <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Vital Signs</h3>
                      <p className="text-gray-600">Create a prescription first to record vital signs</p>
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </div>

        {/* Right Panel - Video Meeting */}
        <div className={`
          ${isMobileView 
            ? isPanelMinimized 
              ? 'flex-1' 
              : 'h-1/2' 
            : 'w-3/5'
          } 
          bg-gray-900 flex flex-col
        `}>
          {/* Simplified Video Container */}
          <div className="flex-1 relative">
            {consultation.doctor_meeting_link ? (
              <iframe
                src={consultation.doctor_meeting_link}
                className="w-full h-full border-0"
                allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
                allowFullScreen
                title="Video Meeting"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-camera allow-microphone allow-display-capture"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="text-center max-w-md mx-auto p-8">
                  <div className="bg-gray-700 p-8 rounded-full w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                    <Shield className="h-16 w-16 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Meeting Link Not Available</h3>
                  <p className="text-gray-400 text-lg">
                    The meeting link has not been configured for this consultation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}