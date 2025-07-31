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
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/utils';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Video, 
  FileText, 
  Pill, 
  Activity,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle
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
  const [activeTab, setActiveTab] = useState('consultation');

  // Load consultation data
  useEffect(() => {
    if (consultationId) {
      loadConsultation();
    }
  }, [consultationId]);

  const loadConsultation = async () => {
    try {
      console.log('Loading consultation:', consultationId);
      const response = await api.get(`/api/consultations/${consultationId}/`);
      console.log('Consultation data:', response.data);
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
      is_draft: true,
      is_finalized: false,
      next_visit: '',
      follow_up_notes: '',
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
      frequency: 'once_daily',
      timing: 'after_breakfast',
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

    // Convert numeric fields
    const numericFields = ['pulse', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'temperature', 'weight', 'height'];
    const processedValue = numericFields.includes(field) 
      ? (value === '' ? null : Number(value))
      : value;

    setPrescription({
      ...prescription,
      [field]: processedValue,
      updated_at: new Date().toISOString(),
    });
  };

  const updateVitalSigns = (field: keyof Prescription['vital_signs'], value: string) => {
    if (!prescription) return;

    // Convert numeric fields
    const numericFields = ['pulse', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'temperature', 'weight', 'height', 'respiratory_rate', 'oxygen_saturation', 'blood_sugar_fasting', 'blood_sugar_postprandial', 'hba1c'];
    const processedValue = numericFields.includes(field) 
      ? (value === '' ? null : Number(value))
      : value;

    setPrescription({
      ...prescription,
      vital_signs: {
        ...prescription.vital_signs,
        [field]: processedValue,
      },
      updated_at: new Date().toISOString(),
    });
  };

  const savePrescription = async () => {
    if (!prescription) return;

    setSaving(true);
    try {
      // Prepare data for API - only include fields that exist in the backend model
      const prescriptionData = {
        consultation: prescription.consultation,
        patient: prescription.patient,
        primary_diagnosis: prescription.primary_diagnosis,
        secondary_diagnosis: prescription.secondary_diagnosis,
        clinical_classification: prescription.clinical_classification,
        pulse: prescription.pulse || null,
        blood_pressure_systolic: prescription.blood_pressure_systolic || null,
        blood_pressure_diastolic: prescription.blood_pressure_diastolic || null,
        temperature: prescription.temperature || null,
        weight: prescription.weight || null,
        height: prescription.height || null,
        general_instructions: prescription.general_instructions,
        fluid_intake: prescription.fluid_intake,
        diet_instructions: prescription.diet_instructions,
        lifestyle_advice: prescription.lifestyle_advice,
        next_visit: prescription.next_visit,
        follow_up_notes: prescription.follow_up_notes,
        is_draft: prescription.is_draft,
        is_finalized: prescription.is_finalized,
        medications: prescription.medications.map(med => ({
          medicine_name: med.medicine_name,
          composition: med.composition,
          dosage_form: med.dosage_form,
          morning_dose: med.morning_dose,
          afternoon_dose: med.afternoon_dose,
          evening_dose: med.evening_dose,
          frequency: med.frequency,
          timing: med.timing,
          custom_timing: med.custom_timing,
          duration_days: med.duration_days,
          duration_weeks: med.duration_weeks,
          duration_months: med.duration_months,
          is_continuous: med.is_continuous,
          special_instructions: med.special_instructions,
          notes: med.notes,
          order: med.order,
        })),
        vital_signs: prescription.vital_signs ? {
          pulse: prescription.vital_signs.pulse || null,
          blood_pressure_systolic: prescription.vital_signs.blood_pressure_systolic || null,
          blood_pressure_diastolic: prescription.vital_signs.blood_pressure_diastolic || null,
          temperature: prescription.vital_signs.temperature || null,
          weight: prescription.vital_signs.weight || null,
          height: prescription.vital_signs.height || null,
          respiratory_rate: prescription.vital_signs.respiratory_rate || null,
          oxygen_saturation: prescription.vital_signs.oxygen_saturation || null,
          blood_sugar_fasting: prescription.vital_signs.blood_sugar_fasting || null,
          blood_sugar_postprandial: prescription.vital_signs.blood_sugar_postprandial || null,
          hba1c: prescription.vital_signs.hba1c || null,
          notes: prescription.vital_signs.notes,
        } : undefined,
      };

      let response;
      
      if (prescription.id) {
        // Update existing prescription
        response = await api.patch(`/api/prescriptions/${prescription.id}/`, prescriptionData);
      } else {
        // Create new prescription
        response = await api.post('/api/prescriptions/', prescriptionData);
        if (response.data && response.data.success && response.data.data) {
          setPrescription(response.data.data);
        }
      }
      
      toast({
        title: "Success",
        description: "Prescription saved successfully",
      });
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast({
        title: "Error",
        description: "Failed to save prescription",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const finalizePrescription = async () => {
    if (!prescription) return;

    setSaving(true);
    try {
      // Prepare data for API - only include fields that exist in the backend model
      const finalizedPrescription = {
        consultation: prescription.consultation,
        patient: prescription.patient,
        primary_diagnosis: prescription.primary_diagnosis,
        secondary_diagnosis: prescription.secondary_diagnosis,
        clinical_classification: prescription.clinical_classification,
        pulse: prescription.pulse || null,
        blood_pressure_systolic: prescription.blood_pressure_systolic || null,
        blood_pressure_diastolic: prescription.blood_pressure_diastolic || null,
        temperature: prescription.temperature || null,
        weight: prescription.weight || null,
        height: prescription.height || null,
        general_instructions: prescription.general_instructions,
        fluid_intake: prescription.fluid_intake,
        diet_instructions: prescription.diet_instructions,
        lifestyle_advice: prescription.lifestyle_advice,
        next_visit: prescription.next_visit,
        follow_up_notes: prescription.follow_up_notes,
        is_draft: false,
        is_finalized: true,
        medications: prescription.medications.map(med => ({
          medicine_name: med.medicine_name,
          composition: med.composition,
          dosage_form: med.dosage_form,
          morning_dose: med.morning_dose,
          afternoon_dose: med.afternoon_dose,
          evening_dose: med.evening_dose,
          frequency: med.frequency,
          timing: med.timing,
          custom_timing: med.custom_timing,
          duration_days: med.duration_days,
          duration_weeks: med.duration_weeks,
          duration_months: med.duration_months,
          is_continuous: med.is_continuous,
          special_instructions: med.special_instructions,
          notes: med.notes,
          order: med.order,
        })),
        vital_signs: prescription.vital_signs ? {
          pulse: prescription.vital_signs.pulse || null,
          blood_pressure_systolic: prescription.vital_signs.blood_pressure_systolic || null,
          blood_pressure_diastolic: prescription.vital_signs.blood_pressure_diastolic || null,
          temperature: prescription.vital_signs.temperature || null,
          weight: prescription.vital_signs.weight || null,
          height: prescription.vital_signs.height || null,
          respiratory_rate: prescription.vital_signs.respiratory_rate || null,
          oxygen_saturation: prescription.vital_signs.oxygen_saturation || null,
          blood_sugar_fasting: prescription.vital_signs.blood_sugar_fasting || null,
          blood_sugar_postprandial: prescription.vital_signs.blood_sugar_postprandial || null,
          hba1c: prescription.vital_signs.hba1c || null,
          notes: prescription.vital_signs.notes,
        } : undefined,
      };

      let response;
      if (prescription.id) {
        response = await api.patch(`/api/prescriptions/${prescription.id}/`, finalizedPrescription);
      } else {
        response = await api.post('/api/prescriptions/', finalizedPrescription);
      }
      
      if (response.data && response.data.success && response.data.data) {
        setPrescription(response.data.data);
      }
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading consultation...</p>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Consultation Not Found</h2>
          <p className="text-gray-600">The consultation you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Consultation Meeting</h1>
            <p className="text-sm text-gray-600">
              {consultation.patient_name} • {consultation.consultation_type} • {consultation.status}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={consultation.status === 'completed' ? 'default' : 'secondary'}>
              {consultation.status}
            </Badge>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4 mr-2" />
              Start Video Call
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Patient Info */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>
          
          {patientInfo ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{patientInfo.user_name}</p>
                  <p className="text-sm text-gray-600">Patient</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{patientInfo.user_phone}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{patientInfo.user_email}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {patientInfo.age ? `${patientInfo.age} years` : 'Age not specified'}
                  </span>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Medical Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Blood Group:</span> {patientInfo.blood_group}
                  </div>
                  <div>
                    <span className="font-medium">Allergies:</span> {patientInfo.allergies}
                  </div>
                  <div>
                    <span className="font-medium">Medical History:</span> {patientInfo.medical_history}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Patient information not available</p>
            </div>
          )}
        </div>

        {/* Right Panel - Main Content */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b border-gray-200 px-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="consultation">Consultation</TabsTrigger>
                <TabsTrigger value="prescription">Prescription</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="consultation" className="flex-1 p-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Consultation Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Date</Label>
                        <p className="text-sm text-gray-900">{consultation.scheduled_date}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Time</Label>
                        <p className="text-sm text-gray-900">{consultation.scheduled_time}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Duration</Label>
                        <p className="text-sm text-gray-900">{consultation.duration} minutes</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Fee</Label>
                        <p className="text-sm text-gray-900">₹{consultation.consultation_fee}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Consultation Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      placeholder="Enter consultation notes here..."
                      className="min-h-[200px]"
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

                        <TabsContent value="prescription" className="flex-1 p-6 space-y-6">
              {prescription ? (
                <div className="space-y-6">
                  {/* Header Actions */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Prescription</h2>
                    <div className="flex items-center space-x-2">
                      <Button 
                        onClick={savePrescription} 
                        disabled={saving || prescription.is_finalized}
                        variant="outline"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button 
                        onClick={finalizePrescription} 
                        disabled={saving || prescription.is_finalized}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Finalize
                      </Button>
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Diagnosis</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="primary_diagnosis">Primary Diagnosis</Label>
                        <Input
                          id="primary_diagnosis"
                          value={prescription.primary_diagnosis}
                          onChange={(e) => updatePrescription('primary_diagnosis', e.target.value)}
                          placeholder="Enter primary diagnosis"
                        />
                      </div>
                      <div>
                        <Label htmlFor="secondary_diagnosis">Secondary Diagnosis</Label>
                        <Input
                          id="secondary_diagnosis"
                          value={prescription.secondary_diagnosis}
                          onChange={(e) => updatePrescription('secondary_diagnosis', e.target.value)}
                          placeholder="Enter secondary diagnosis (optional)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="clinical_classification">Clinical Classification</Label>
                        <Input
                          id="clinical_classification"
                          value={prescription.clinical_classification}
                          onChange={(e) => updatePrescription('clinical_classification', e.target.value)}
                          placeholder="Enter clinical classification"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vital Signs */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5" />
                        <span>Vital Signs</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="pulse">Pulse (bpm)</Label>
                          <Input
                            id="pulse"
                            value={prescription.vital_signs.pulse || ''}
                            onChange={(e) => updateVitalSigns('pulse', e.target.value)}
                            placeholder="e.g., 72"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bp_systolic">BP Systolic (mmHg)</Label>
                          <Input
                            id="bp_systolic"
                            value={prescription.vital_signs.blood_pressure_systolic || ''}
                            onChange={(e) => updateVitalSigns('blood_pressure_systolic', e.target.value)}
                            placeholder="e.g., 120"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bp_diastolic">BP Diastolic (mmHg)</Label>
                          <Input
                            id="bp_diastolic"
                            value={prescription.vital_signs.blood_pressure_diastolic || ''}
                            onChange={(e) => updateVitalSigns('blood_pressure_diastolic', e.target.value)}
                            placeholder="e.g., 80"
                          />
                        </div>
                        <div>
                          <Label htmlFor="temperature">Temperature (°F)</Label>
                          <Input
                            id="temperature"
                            value={prescription.vital_signs.temperature || ''}
                            onChange={(e) => updateVitalSigns('temperature', e.target.value)}
                            placeholder="e.g., 98.6"
                          />
                        </div>
                        <div>
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input
                            id="weight"
                            value={prescription.vital_signs.weight || ''}
                            onChange={(e) => updateVitalSigns('weight', e.target.value)}
                            placeholder="e.g., 70"
                          />
                        </div>
                        <div>
                          <Label htmlFor="height">Height (cm)</Label>
                          <Input
                            id="height"
                            value={prescription.vital_signs.height || ''}
                            onChange={(e) => updateVitalSigns('height', e.target.value)}
                            placeholder="e.g., 170"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Medications */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Pill className="h-5 w-5" />
                        <span>Medications</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {prescription.medications.map((medication, index) => (
                          <div key={medication.id || `med-${index}`} className="border rounded-lg p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Medication {index + 1}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMedication(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Medication Name</Label>
                                <Input
                                  value={medication.medicine_name}
                                  onChange={(e) => updateMedication(index, 'medicine_name', e.target.value)}
                                  placeholder="e.g., Paracetamol"
                                />
                              </div>
                              <div>
                                <Label>Composition</Label>
                                <Input
                                  value={medication.composition}
                                  onChange={(e) => updateMedication(index, 'composition', e.target.value)}
                                  placeholder="e.g., Paracetamol 500mg"
                                />
                              </div>
                              <div>
                                <Label>Dosage Form</Label>
                                <Input
                                  value={medication.dosage_form}
                                  onChange={(e) => updateMedication(index, 'dosage_form', e.target.value)}
                                  placeholder="e.g., Tablet"
                                />
                              </div>
                              <div>
                                <Label>Frequency</Label>
                                <Input
                                  value={medication.frequency}
                                  onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                  placeholder="e.g., once_daily"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Morning Dose</Label>
                                <Input
                                  type="number"
                                  value={medication.morning_dose}
                                  onChange={(e) => updateMedication(index, 'morning_dose', parseInt(e.target.value) || 0)}
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <Label>Afternoon Dose</Label>
                                <Input
                                  type="number"
                                  value={medication.afternoon_dose}
                                  onChange={(e) => updateMedication(index, 'afternoon_dose', parseInt(e.target.value) || 0)}
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <Label>Evening Dose</Label>
                                <Input
                                  type="number"
                                  value={medication.evening_dose}
                                  onChange={(e) => updateMedication(index, 'evening_dose', parseInt(e.target.value) || 0)}
                                  placeholder="0"
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
                              />
                            </div>
                          </div>
                        ))}
                        <Button
                          onClick={addMedication}
                          variant="outline"
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Medication
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Instructions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Instructions & Advice</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="general_instructions">General Instructions</Label>
                        <Textarea
                          id="general_instructions"
                          value={prescription.general_instructions}
                          onChange={(e) => updatePrescription('general_instructions', e.target.value)}
                          placeholder="General instructions for the patient"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fluid_intake">Fluid Intake</Label>
                          <Input
                            id="fluid_intake"
                            value={prescription.fluid_intake}
                            onChange={(e) => updatePrescription('fluid_intake', e.target.value)}
                            placeholder="e.g., 8-10 glasses of water daily"
                          />
                        </div>
                        <div>
                          <Label htmlFor="diet_instructions">Diet Instructions</Label>
                          <Input
                            id="diet_instructions"
                            value={prescription.diet_instructions}
                            onChange={(e) => updatePrescription('diet_instructions', e.target.value)}
                            placeholder="e.g., Low sodium diet"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="lifestyle_advice">Lifestyle Advice</Label>
                        <Textarea
                          id="lifestyle_advice"
                          value={prescription.lifestyle_advice}
                          onChange={(e) => updatePrescription('lifestyle_advice', e.target.value)}
                          placeholder="Lifestyle recommendations"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Follow-up */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Follow-up</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="next_visit">Next Visit</Label>
                        <Input
                          id="next_visit"
                          type="date"
                          value={prescription.next_visit}
                          onChange={(e) => updatePrescription('next_visit', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="follow_up_notes">Follow-up Notes</Label>
                        <Textarea
                          id="follow_up_notes"
                          value={prescription.follow_up_notes}
                          onChange={(e) => updatePrescription('follow_up_notes', e.target.value)}
                          placeholder="Notes for follow-up visit"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Prescription Found</h3>
                    <p className="text-gray-600 mb-4">Create a new prescription for this consultation</p>
                    <Button onClick={initializePrescription} disabled={saving}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Prescription
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>


          </Tabs>
        </div>
      </div>
    </div>
  );
} 