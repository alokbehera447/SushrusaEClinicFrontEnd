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
  ExternalLink
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

  const savePrescription = async () => {
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
            {consultation.doctor_meeting_link && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(consultation.doctor_meeting_link, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Meeting
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Consultation Details (40%) */}
        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          {/* Patient Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>
            
            {patientInfo ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{patientInfo.user_name}</p>
                    <p className="text-sm text-gray-600">Patient</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{patientInfo.user_phone}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{patientInfo.user_email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {patientInfo.age ? `${patientInfo.age} years` : 'Age not specified'}
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Medical Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blood Group:</span>
                      <span className="font-medium">{patientInfo.blood_group}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Allergies:</span>
                      <span className="font-medium">{patientInfo.allergies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medical History:</span>
                      <span className="font-medium">{patientInfo.medical_history}</span>
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

          {/* Consultation & Prescription Tabs */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="border-b border-gray-200 px-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="consultation">Consultation</TabsTrigger>
                  <TabsTrigger value="prescription">Prescription</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="consultation" className="p-4 h-full">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Consultation Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Date:</span>
                          <span className="text-sm font-medium">{consultation.scheduled_date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Time:</span>
                          <span className="text-sm font-medium">{consultation.scheduled_time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Duration:</span>
                          <span className="text-sm font-medium">{consultation.duration} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Fee:</span>
                          <span className="text-sm font-medium">₹{consultation.consultation_fee}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Quick Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea 
                          placeholder="Enter consultation notes here..."
                          className="min-h-[120px] text-sm"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="prescription" className="p-4 h-full">
                  {prescription ? (
                    <div className="space-y-4">
                      {/* Header Actions */}
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Prescription</h2>
                        <div className="flex items-center space-x-2">
                          <Button 
                            onClick={savePrescription} 
                            disabled={saving || prescription.is_finalized}
                            size="sm"
                            variant="outline"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button 
                            onClick={finalizePrescription} 
                            disabled={saving || prescription.is_finalized}
                            size="sm"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Finalize
                          </Button>
                        </div>
                      </div>

                      {/* Diagnosis */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>Diagnosis</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label htmlFor="primary_diagnosis" className="text-sm">Primary Diagnosis</Label>
                            <Input
                              id="primary_diagnosis"
                              value={prescription.primary_diagnosis}
                              onChange={(e) => updatePrescription('primary_diagnosis', e.target.value)}
                              placeholder="Enter primary diagnosis"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="secondary_diagnosis" className="text-sm">Secondary Diagnosis</Label>
                            <Input
                              id="secondary_diagnosis"
                              value={prescription.secondary_diagnosis}
                              onChange={(e) => updatePrescription('secondary_diagnosis', e.target.value)}
                              placeholder="Enter secondary diagnosis"
                              className="text-sm"
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
                          <div className="grid grid-cols-2 gap-4">
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
                                    <Label>Dosage Form</Label>
                                    <Input
                                      value={medication.dosage_form}
                                      onChange={(e) => updateMedication(index, 'dosage_form', e.target.value)}
                                      placeholder="e.g., Tablet"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <Label>Morning</Label>
                                    <Input
                                      type="number"
                                      value={medication.morning_dose}
                                      onChange={(e) => updateMedication(index, 'morning_dose', parseInt(e.target.value) || 0)}
                                      placeholder="0"
                                    />
                                  </div>
                                  <div>
                                    <Label>Afternoon</Label>
                                    <Input
                                      type="number"
                                      value={medication.afternoon_dose}
                                      onChange={(e) => updateMedication(index, 'afternoon_dose', parseInt(e.target.value) || 0)}
                                      placeholder="0"
                                    />
                                  </div>
                                  <div>
                                    <Label>Evening</Label>
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
                            <Button onClick={addMedication} variant="outline" className="w-full">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Medication
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Instructions */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Instructions</CardTitle>
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
                          <div className="grid grid-cols-2 gap-4">
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
              </div>
            </Tabs>
          </div>
        </div>

        {/* Right Panel - Meeting Iframe (60%) */}
        <div className="w-3/5 bg-gray-900 flex flex-col">
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
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 text-lg mb-2">No Meeting Link Available</p>
                <p className="text-gray-500 text-sm">Meeting link not found for this consultation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 