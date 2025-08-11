import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { 
  patientApi, 
  doctorApi, 
  prescriptionApi,
  Consultation as APIConsultation, 
  Prescription as APIPrescription,
  EnhancedPrescription,
  CreatePrescriptionData,
  PrescriptionMedication as APIMedication,
  PrescriptionVitalSigns as APIVitalSigns
} from '@/lib/api';
import { 
  User,
  Phone,
  Mail, 
  Calendar, 
  Clock, 
  FileText, 
  FileDown,
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
  X,
  Video
} from 'lucide-react';

// Interfaces
interface Consultation {
  id: string;
  patient: string; // Patient ID - this is what we need for prescriptions!
  doctor: string; // Doctor ID
  patient_name: string;
  doctor_name: string;
  patient_phone?: string;
  patient_email?: string;
  patient_age?: number;
  patient_gender?: string;
  scheduled_date: string;
  scheduled_time: string;
  duration: number;
  consultation_type: string;
  consultation_fee?: number;
  status: string;
  chief_complaint: string;
  symptoms?: string;
  doctor_meeting_link?: string;
  doctor_notes?: string;
  patient_notes?: string;
  payment_status?: string;
  is_paid?: boolean;
  created_at?: string;
  updated_at?: string;
  booked_slot?: string;
}

// Use API interfaces directly
type Medication = APIMedication;
type VitalSigns = APIVitalSigns;
type Prescription = EnhancedPrescription;

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
  const [isVideoMeetingActive, setIsVideoMeetingActive] = useState(false);
  
  // Ref to track if data has been loaded to prevent multiple calls
  const dataLoadedRef = useRef(false);

  // Responsive effect
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  const initializePrescription = useCallback((consultationData?: Consultation) => {
    const consult = consultationData || consultation;
    if (!consult) return;

    const newPrescription: Prescription = {
      consultation: consultationId!,
      patient: consult.patient, // Use the actual patient ID
      primary_diagnosis: '',
      general_instructions: '',
      is_draft: true,
      is_finalized: false,
      medications: [],
      vital_signs: {
        blood_pressure_systolic: undefined,
        blood_pressure_diastolic: undefined,
        pulse: undefined,
        temperature: undefined,
        respiratory_rate: undefined,
        oxygen_saturation: undefined,
        weight: undefined,
        height: undefined
      },
      // Additional fields from API
      secondary_diagnosis: '',
      clinical_classification: '',
      fluid_intake: '',
      diet_instructions: '',
      lifestyle_advice: '',
      next_visit: '',
      follow_up_notes: ''
    };

    setPrescription(newPrescription);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultationId]); // consultation intentionally excluded to prevent circular dependency

  const loadPrescription = useCallback(async (consultationData?: Consultation) => {
    try {
      const prescription = await prescriptionApi.getConsultationPrescription(consultationId!);
      if (prescription) {
        setPrescription(prescription);
      } else {
        initializePrescription(consultationData);
      }
    } catch (error) {
      console.error('Error loading prescription:', error);
      // If no prescription exists, initialize a new one
      initializePrescription(consultationData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultationId]); // initializePrescription intentionally excluded to prevent circular dependency

  const loadConsultationData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load consultation details
      const consultationResponse = await patientApi.getConsultation(consultationId!);
      const consultationData = consultationResponse as unknown as Consultation;
      setConsultation(consultationData);
      
      // Load existing prescription if any, passing consultation data to avoid dependency
      await loadPrescription(consultationData);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultationId, toast]); // loadPrescription intentionally excluded to prevent circular dependency

  const addMedication = () => {
    if (!prescription) return;

    const newMedication: Medication = {
      medicine_name: '',
      composition: '',
      dosage_form: 'tablet',
      morning_dose: 0,
      afternoon_dose: 0,
      evening_dose: 0,
      frequency: 'once_daily',
      timing: 'after_breakfast',
      custom_timing: '',
      duration_days: 7,
      duration_weeks: 0,
      duration_months: 0,
      is_continuous: false,
      special_instructions: '',
      notes: '',
      order: (prescription.medications?.length || 0) + 1,
    };

    setPrescription({
      ...prescription,
      medications: [...(prescription.medications || []), newMedication],
    });
  };

  const updateMedication = (index: number, field: keyof Medication, value: string | number | boolean) => {
    if (!prescription || !prescription.medications) return;

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
    if (!prescription || !prescription.medications) return;

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

  const updateVitalSigns = (field: keyof VitalSigns, value: string | number) => {
    if (!prescription) return;

    const numericValue = typeof value === 'string' ? (value === '' ? undefined : Number(value)) : value;
    
    setPrescription({
      ...prescription,
      vital_signs: {
        ...prescription.vital_signs,
        [field]: numericValue,
      },
    });
  };

  const savePrescription = useCallback(async (isAutoSave = false) => {
    if (!prescription || !consultation) return;

    try {
      setSaving(true);

      // Prepare prescription data for API
      const prescriptionData: CreatePrescriptionData = {
        consultation: consultationId!,
        patient: consultation.patient, // Use the actual patient ID from consultation
        primary_diagnosis: prescription.primary_diagnosis || '',
        secondary_diagnosis: prescription.secondary_diagnosis || '',
        clinical_classification: prescription.clinical_classification || '',
        general_instructions: prescription.general_instructions || '',
        fluid_intake: prescription.fluid_intake || '',
        diet_instructions: prescription.diet_instructions || '',
        lifestyle_advice: prescription.lifestyle_advice || '',
        next_visit: prescription.next_visit || '',
        follow_up_notes: prescription.follow_up_notes || '',
        
        // Vital signs
        pulse: prescription.vital_signs?.pulse,
        blood_pressure_systolic: prescription.vital_signs?.blood_pressure_systolic,
        blood_pressure_diastolic: prescription.vital_signs?.blood_pressure_diastolic,
        temperature: prescription.vital_signs?.temperature,
        weight: prescription.vital_signs?.weight,
        height: prescription.vital_signs?.height,
        
        // Medications
        medications: prescription.medications?.map(med => ({
          medicine_name: med.medicine_name,
          composition: med.composition || '',
          dosage_form: med.dosage_form || 'tablet',
          morning_dose: med.morning_dose || 0,
          afternoon_dose: med.afternoon_dose || 0,
          evening_dose: med.evening_dose || 0,
          frequency: med.frequency || 'once_daily',
          timing: med.timing || 'after_breakfast',
          custom_timing: med.custom_timing || '',
          duration_days: med.duration_days || 0,
          duration_weeks: med.duration_weeks || 0,
          duration_months: med.duration_months || 0,
          is_continuous: med.is_continuous || false,
          special_instructions: med.special_instructions || '',
          notes: med.notes || '',
          order: med.order || 1
        })) || []
      };

      let savedPrescription: EnhancedPrescription;
      
      if (prescription.id) {
        // Update existing prescription
        savedPrescription = await prescriptionApi.partialUpdatePrescription(prescription.id.toString(), prescriptionData);
      } else {
        // Create new prescription
        savedPrescription = await prescriptionApi.createPrescription(prescriptionData);
      }

      setPrescription(savedPrescription);
      
      if (!isAutoSave) {
        toast({
          title: 'Success',
          description: 'Prescription saved successfully',
        });
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
  }, [prescription, consultation, consultationId, toast]);

  // Load data on mount - only once
  useEffect(() => {
    if (consultationId && !dataLoadedRef.current) {
      dataLoadedRef.current = true;
      loadConsultationData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultationId]); // loadConsultationData intentionally excluded to prevent re-renders

  // Auto-save effect - use ref to avoid unnecessary re-renders
  const prescriptionRef = useRef(prescription);
  const autoSaveEnabledRef = useRef(autoSaveEnabled);
  
  useEffect(() => {
    prescriptionRef.current = prescription;
    autoSaveEnabledRef.current = autoSaveEnabled;
  });

  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      if (prescriptionRef.current && autoSaveEnabledRef.current && (!prescriptionRef.current.is_finalized || isEditing)) {
        savePrescription(true);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveTimer);
  }, [savePrescription, isEditing]); // Only depend on savePrescription

  const finalizePrescription = async () => {
    if (!prescription) return;

    try {
      setSaving(true);

      // First save the prescription if it doesn't exist
      if (!prescription.id) {
        await savePrescription(true); // Save as auto-save to avoid duplicate toast
      }

      // Then finalize it
      if (prescription.id) {
        const finalizedPrescription = await prescriptionApi.finalizePrescription(prescription.id.toString());
        setPrescription(finalizedPrescription);
        setIsEditing(false); // Exit edit mode when finalized
        
        toast({
          title: 'Success',
          description: 'Prescription finalized successfully',
        });
      } else {
        throw new Error('Failed to create prescription before finalizing');
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

  const generateNewPDF = async () => {
    if (!prescription?.id) return;

    try {
      setSaving(true);
      
      // First save any pending changes
      await savePrescription(true);
      
      // Then generate a new PDF with updated data
      const result = await prescriptionApi.finalizeAndGeneratePDF(prescription.id.toString());
      
      toast({
        title: 'Success',
        description: `New PDF generated successfully! Version ${result.pdf.version}`,
      });
      
      // Open the new PDF
      if (result.pdf.url) {
        window.open(result.pdf.url, '_blank');
      }
    } catch (error) {
      console.error('Error generating new PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate new PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
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
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Consultation Session</h1>
              <p className="text-sm text-gray-600">Patient: {consultation.patient_name} • ID: {consultationId}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Active</span>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-3">
            {/* Start/Stop Meeting Button */}
            <Button
              onClick={() => setIsVideoMeetingActive(!isVideoMeetingActive)}
              variant={isVideoMeetingActive ? "destructive" : "default"}
              size="sm"
              className="hidden md:flex"
            >
              {isVideoMeetingActive ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  End Meeting
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Start Meeting
                </>
              )}
            </Button>
            
            <Button
              onClick={() => setIsPanelMinimized(!isPanelMinimized)}
              variant="outline"
              size="sm"
              className="hidden md:flex"
            >
              {isPanelMinimized ? (
                <>
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Show Panel
                </>
              ) : (
                <>
                  <Minimize2 className="h-4 w-4 mr-2" />
                  Hide Panel
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Prescription Writing Area - Main Focus (60%) */}
        <div className={`
          ${isMobileView ? 'w-full' : 'w-3/5'} 
          bg-white flex flex-col
        `}>
          {/* Prescription Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Digital Prescription</h2>
                  <p className="text-sm text-gray-600">Write prescription for {consultation.patient_name}</p>
                </div>
              </div>
              
              {/* Prescription Status & Actions */}
              <div className="flex items-center space-x-3">
                {prescription?.is_finalized && (
                  <Badge variant="default" className="bg-green-600">
                    Finalized
                  </Badge>
                )}
                {isEditing && prescription?.is_finalized && (
                  <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-50">
                    Editing
                  </Badge>
                )}
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    onClick={() => savePrescription()}
                    disabled={saving || (prescription?.is_finalized && !isEditing)}
                    size="sm"
                    variant="outline"
                    className="bg-white hover:bg-gray-50"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span className="ml-2 hidden sm:inline">Save</span>
                  </Button>
                  
                  {prescription?.is_finalized ? (
                    <Button
                      onClick={toggleEditMode}
                      disabled={saving}
                      size="sm"
                      variant={isEditing ? "destructive" : "outline"}
                      className="bg-white hover:bg-gray-50"
                    >
                      {isEditing ? (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Cancel Edit</span>
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={finalizePrescription}
                      disabled={saving}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Finalize</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Prescription Content */}
          <div className="flex-1 overflow-auto p-6">
            {prescription ? (
              <div className="space-y-6">
                {/* Diagnosis Section */}
                <Card className="border-0 shadow-sm bg-gray-50/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Stethoscope className="h-5 w-5 text-blue-600" />
                      <span>Diagnosis & Assessment</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primary_diagnosis" className="text-sm font-medium">
                          Primary Diagnosis
                        </Label>
                        <Textarea
                          id="primary_diagnosis"
                          value={prescription.primary_diagnosis || ''}
                          onChange={(e) => updatePrescription('primary_diagnosis', e.target.value)}
                          placeholder="Enter primary diagnosis..."
                          className="min-h-[80px] resize-none"
                          disabled={prescription.is_finalized && !isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondary_diagnosis" className="text-sm font-medium">
                          Secondary Diagnosis
                        </Label>
                        <Textarea
                          id="secondary_diagnosis"
                          value={prescription.secondary_diagnosis || ''}
                          onChange={(e) => updatePrescription('secondary_diagnosis', e.target.value)}
                          placeholder="Enter secondary diagnosis (if any)..."
                          className="min-h-[80px] resize-none"
                          disabled={prescription.is_finalized && !isEditing}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="clinical_classification" className="text-sm font-medium">
                        Clinical Classification
                      </Label>
                      <Input
                        id="clinical_classification"
                        value={prescription.clinical_classification || ''}
                        onChange={(e) => updatePrescription('clinical_classification', e.target.value)}
                        placeholder="e.g., Acute, Chronic, Emergency"
                        disabled={prescription.is_finalized && !isEditing}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Instructions Section */}
                <Card className="border-0 shadow-sm bg-gray-50/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span>Instructions & Advice</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="general_instructions" className="text-sm font-medium">
                        General Instructions
                      </Label>
                      <Textarea
                        id="general_instructions"
                        value={prescription.general_instructions || ''}
                        onChange={(e) => updatePrescription('general_instructions', e.target.value)}
                        placeholder="Enter general instructions for the patient..."
                        className="min-h-[100px] resize-none"
                        disabled={prescription.is_finalized && !isEditing}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="diet_instructions" className="text-sm font-medium">
                          Diet Instructions
                        </Label>
                        <Textarea
                          id="diet_instructions"
                          value={prescription.diet_instructions || ''}
                          onChange={(e) => updatePrescription('diet_instructions', e.target.value)}
                          placeholder="Dietary recommendations..."
                          className="min-h-[80px] resize-none"
                          disabled={prescription.is_finalized && !isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lifestyle_advice" className="text-sm font-medium">
                          Lifestyle Advice
                        </Label>
                        <Textarea
                          id="lifestyle_advice"
                          value={prescription.lifestyle_advice || ''}
                          onChange={(e) => updatePrescription('lifestyle_advice', e.target.value)}
                          placeholder="Lifestyle modifications..."
                          className="min-h-[80px] resize-none"
                          disabled={prescription.is_finalized && !isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Medications Section */}
                <Card className="border-0 shadow-sm bg-gray-50/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-lg">
                        <Pill className="h-5 w-5 text-purple-600" />
                        <span>Medications</span>
                      </div>
                      {!prescription.is_finalized || isEditing ? (
                        <Button
                          onClick={addMedication}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Medication
                        </Button>
                      ) : null}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {prescription.medications && prescription.medications.length > 0 ? (
                      <div className="space-y-4">
                        {prescription.medications.map((medication, index) => (
                          <Card key={index} className="border border-gray-200 bg-white">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center space-x-2">
                                  <Pill className="h-4 w-4 text-purple-600" />
                                  <span>Medication {index + 1}</span>
                                </CardTitle>
                                {(!prescription.is_finalized || isEditing) && (
                                  <Button
                                    onClick={() => removeMedication(index)}
                                    size="sm"
                                    variant="destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Medicine Name</Label>
                                  <Input
                                    value={medication.medicine_name}
                                    onChange={(e) => updateMedication(index, 'medicine_name', e.target.value)}
                                    placeholder="Enter medicine name"
                                    disabled={prescription.is_finalized && !isEditing}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Dosage Form</Label>
                                  <Input
                                    value={medication.dosage_form || ''}
                                    onChange={(e) => updateMedication(index, 'dosage_form', e.target.value)}
                                    placeholder="e.g., tablet, syrup, injection"
                                    disabled={prescription.is_finalized && !isEditing}
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label>Morning Dose</Label>
                                  <Input
                                    type="number"
                                    value={medication.morning_dose || ''}
                                    onChange={(e) => updateMedication(index, 'morning_dose', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    disabled={prescription.is_finalized && !isEditing}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Afternoon Dose</Label>
                                  <Input
                                    type="number"
                                    value={medication.afternoon_dose || ''}
                                    onChange={(e) => updateMedication(index, 'afternoon_dose', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    disabled={prescription.is_finalized && !isEditing}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Evening Dose</Label>
                                  <Input
                                    type="number"
                                    value={medication.evening_dose || ''}
                                    onChange={(e) => updateMedication(index, 'evening_dose', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    disabled={prescription.is_finalized && !isEditing}
                                  />
                                </div>
                              </div>
                              

                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No medications added yet</p>
                        {(!prescription.is_finalized || isEditing) && (
                          <Button
                            onClick={addMedication}
                            className="mt-4 bg-purple-600 hover:bg-purple-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Medication
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Vital Signs Section */}
                <Card className="border-0 shadow-sm bg-gray-50/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Activity className="h-5 w-5 text-red-600" />
                      <span>Vital Signs</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Doctor's Note:</strong> Record the patient's vital signs during the consultation. 
                        These measurements help in diagnosis and treatment planning.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bp_systolic" className="text-sm font-medium">
                            Blood Pressure (Systolic)
                          </Label>
                          <div className="flex items-center space-x-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <Input
                              id="bp_systolic"
                              type="number"
                              value={prescription.vital_signs?.blood_pressure_systolic || ''}
                              onChange={(e) => updateVitalSigns('blood_pressure_systolic', e.target.value)}
                              placeholder="120"
                              disabled={prescription.is_finalized && !isEditing}
                            />
                            <span className="text-sm text-gray-500">mmHg</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="bp_diastolic" className="text-sm font-medium">
                            Blood Pressure (Diastolic)
                          </Label>
                          <div className="flex items-center space-x-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <Input
                              id="bp_diastolic"
                              type="number"
                              value={prescription.vital_signs?.blood_pressure_diastolic || ''}
                              onChange={(e) => updateVitalSigns('blood_pressure_diastolic', e.target.value)}
                              placeholder="80"
                              disabled={prescription.is_finalized && !isEditing}
                            />
                            <span className="text-sm text-gray-500">mmHg</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="pulse" className="text-sm font-medium">
                            Pulse Rate
                          </Label>
                          <div className="flex items-center space-x-2">
                            <Activity className="h-4 w-4 text-green-500" />
                            <Input
                              id="pulse"
                              type="number"
                              value={prescription.vital_signs?.pulse || ''}
                              onChange={(e) => updateVitalSigns('pulse', e.target.value)}
                              placeholder="72"
                              disabled={prescription.is_finalized && !isEditing}
                            />
                            <span className="text-sm text-gray-500">bpm</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="temperature" className="text-sm font-medium">
                            Temperature
                          </Label>
                          <div className="flex items-center space-x-2">
                            <Thermometer className="h-4 w-4 text-orange-500" />
                            <Input
                              id="temperature"
                              type="number"
                              step="0.1"
                              value={prescription.vital_signs?.temperature || ''}
                              onChange={(e) => updateVitalSigns('temperature', e.target.value)}
                              placeholder="98.6"
                              disabled={prescription.is_finalized && !isEditing}
                            />
                            <span className="text-sm text-gray-500">°F</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="oxygen_saturation" className="text-sm font-medium">
                            Oxygen Saturation
                          </Label>
                          <div className="flex items-center space-x-2">
                            <Droplets className="h-4 w-4 text-blue-500" />
                            <Input
                              id="oxygen_saturation"
                              type="number"
                              value={prescription.vital_signs?.oxygen_saturation || ''}
                              onChange={(e) => updateVitalSigns('oxygen_saturation', e.target.value)}
                              placeholder="98"
                              disabled={prescription.is_finalized && !isEditing}
                            />
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="weight" className="text-sm font-medium">
                            Weight
                          </Label>
                          <div className="flex items-center space-x-2">
                            <Weight className="h-4 w-4 text-purple-500" />
                            <Input
                              id="weight"
                              type="number"
                              step="0.1"
                              value={prescription.vital_signs?.weight || ''}
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

                {/* PDF Actions */}
                {prescription.is_finalized && prescription.id && (
                  <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-200">
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={async () => {
                        try {
                          type PDFVersion = { id: string; is_current: boolean; file_url: string; version: number; generated_at: string; generated_by: { name: string } };
                          const pdfs = await prescriptionApi.getPDFVersions(prescription.id.toString());
                          const current = (pdfs.versions as PDFVersion[]).find((v) => v.is_current);
                          if (current && current.file_url) {
                            window.open(current.file_url, '_blank');
                          } else {
                            toast({
                              title: 'PDF Not Found',
                              description: 'No PDF available for this prescription yet.',
                              variant: 'destructive',
                            });
                          }
                        } catch (err) {
                          toast({
                            title: 'Error',
                            description: 'Failed to fetch prescription PDF.',
                            variant: 'destructive',
                          });
                        }
                      }}
                      className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      View/Download PDF
                    </Button>
                    
                    {isEditing && (
                      <Button
                        size="lg"
                        variant="outline"
                        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        onClick={generateNewPDF}
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                          <FileDown className="h-5 w-5 mr-2" />
                        )}
                        Generate New PDF
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Prescription Created</h3>
                <p className="text-gray-600 mb-6">Start by creating a prescription for this consultation</p>
                <Button 
                  onClick={() => initializePrescription()}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Prescription
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Video Meeting & Patient Info Panel - Right Side (40%) */}
        <div className={`
          ${isMobileView ? 'w-full' : 'w-2/5'} 
          ${isPanelMinimized && !isMobileView ? 'w-16' : ''}
          bg-white border-l border-gray-200 flex flex-col transition-all duration-300
        `}>
          {isPanelMinimized && !isMobileView ? (
            <div className="p-4">
              <Button
                onClick={() => setIsPanelMinimized(false)}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              {/* Video Meeting Section */}
              {isVideoMeetingActive && (
                <div className="bg-gray-900 flex flex-col">
                  {/* Video Header */}
                  <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-sm font-medium">Live Meeting</span>
                      </div>
                      <Button
                        onClick={() => setIsVideoMeetingActive(false)}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Video Container */}
                  <div className="flex-1 relative min-h-[300px]">
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
                        <div className="text-center max-w-md mx-auto p-6">
                          <div className="bg-gray-700 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                            <Video className="h-12 w-12 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-3">Meeting Link Not Available</h3>
                          <p className="text-gray-400 text-sm">
                            The meeting link has not been configured for this consultation.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Patient Info Section */}
              <div className="flex-1 flex flex-col">
                {/* Patient Info Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Patient Information</h3>
                    {!isMobileView && (
                      <Button
                        onClick={() => setIsPanelMinimized(true)}
                        variant="ghost"
                        size="sm"
                      >
                        <Minimize2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Patient Info Content */}
                <div className="flex-1 overflow-auto p-4 space-y-4">
                {/* Basic Patient Info */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <User className="h-4 w-4 text-blue-600" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold">{consultation.patient_name}</p>
                    </div>
                    {consultation.patient_phone && (
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{consultation.patient_phone}</p>
                      </div>
                    )}
                    {consultation.patient_email && (
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{consultation.patient_email}</p>
                      </div>
                    )}
                    {consultation.patient_age && (
                      <div>
                        <p className="text-sm text-gray-600">Age</p>
                        <p className="font-medium">{consultation.patient_age} years</p>
                      </div>
                    )}
                    {consultation.patient_gender && (
                      <div>
                        <p className="text-sm text-gray-600">Gender</p>
                        <p className="font-medium">{consultation.patient_gender}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Consultation Details */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span>Consultation Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">{new Date(consultation.scheduled_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium">{consultation.scheduled_time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-medium">{consultation.consultation_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Chief Complaint</p>
                      <p className="font-medium">{consultation.chief_complaint}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Access Buttons */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {/* TODO: Open patient records modal */}}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Medical Records
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {/* TODO: Open patient notes modal */}}
                  >
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Patient Notes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {/* TODO: Open patient documents modal */}}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Documents
                  </Button>
                </div>

                {/* Auto-save Status */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Auto-save:</span>
                    <span className={autoSaveEnabled ? 'text-green-600' : 'text-gray-400'}>
                      {autoSaveEnabled ? 'On' : 'Off'}
                    </span>
                  </div>
                  <Button
                    onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                  >
                    {autoSaveEnabled ? 'Disable' : 'Enable'} Auto-save
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
  );
}