import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Pill, 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Print, 
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  User,
  FileText,
  Edit,
  Eye,
  Share,
  Copy,
  Search,
  Filter,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Star,
  Shield,
  Award,
  Zap,
  Target,
  Activity,
  Heart,
  Brain,
  Eye as EyeIcon,
  Thermometer,
  Scale
} from 'lucide-react';
import { Consultation as ApiConsultation, PatientProfile } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

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

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  beforeMeal: boolean;
  isGeneric: boolean;
  quantity: string;
}

interface Prescription {
  medications: Medication[];
  instructions: string;
  followUp: string;
  nextVisit: string;
  diagnosis: string;
  doctorSignature: string;
  clinicInfo: string;
}

interface VitalSigns {
  pulse: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  temperature: string;
  weight: string;
  height: string;
  oxygenSaturation: string;
}

interface PrescriptionWriterProps {
  consultation: Consultation;
  patient: PatientProfile;
  vitalSigns: VitalSigns;
  onPrescriptionChange: (prescription: Prescription) => void;
}

const PrescriptionWriter: React.FC<PrescriptionWriterProps> = ({
  consultation,
  patient,
  vitalSigns,
  onPrescriptionChange
}) => {
  const [prescription, setPrescription] = useState<Prescription>({
    medications: [],
    instructions: '',
    followUp: '',
    nextVisit: '',
    diagnosis: '',
    doctorSignature: '',
    clinicInfo: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { toast } = useToast();

  // Common medications for quick selection
  const commonMedications = [
    { name: 'Paracetamol', dosage: '500mg', frequency: '3 times daily', duration: '5 days' },
    { name: 'Ibuprofen', dosage: '400mg', frequency: '3 times daily', duration: '5 days' },
    { name: 'Amoxicillin', dosage: '500mg', frequency: '3 times daily', duration: '7 days' },
    { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', duration: '14 days' },
    { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '7 days' },
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days' },
    { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days' },
    { name: 'Atorvastatin', dosage: '10mg', frequency: 'Once daily', duration: '30 days' }
  ];

  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      beforeMeal: true,
      isGeneric: false,
      quantity: ''
    };
    
    setPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication]
    }));
  };

  const removeMedication = (id: string) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter(med => med.id !== id)
    }));
  };

  const updateMedication = (id: string, field: keyof Medication, value: any) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.map(med => 
        med.id === id ? { ...med, [field]: value } : med
      )
    }));
  };

  const addCommonMedication = (med: any) => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      instructions: '',
      beforeMeal: true,
      isGeneric: false,
      quantity: ''
    };
    
    setPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication]
    }));
  };

  const savePrescription = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onPrescriptionChange(prescription);
      
      toast({
        title: "Prescription Saved",
        description: "Prescription has been saved successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save prescription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generatePrescriptionPDF = () => {
    // This would integrate with the backend PDF generation
    toast({
      title: "PDF Generated",
      description: "Prescription PDF has been generated.",
      variant: "default",
    });
  };

  const sendPrescription = () => {
    toast({
      title: "Prescription Sent",
      description: "Prescription has been sent to the patient.",
      variant: "default",
    });
  };

  const filteredCommonMeds = commonMedications.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Pill className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold">Prescription Writer</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <Edit className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          
          <Button
            size="sm"
            onClick={savePrescription}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </div>

      {!showPreview ? (
        <div className="space-y-6">
          {/* Common Medications */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Quick Add Common Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Input
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filteredCommonMeds.map((med, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => addCommonMedication(med)}
                      className="justify-start text-left h-auto p-2"
                    >
                      <div>
                        <div className="font-medium text-sm">{med.name}</div>
                        <div className="text-xs text-gray-500">
                          {med.dosage} • {med.frequency} • {med.duration}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medications List */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center">
                  <Pill className="w-4 h-4 mr-2" />
                  Medications ({prescription.medications.length})
                </span>
                <Button
                  size="sm"
                  onClick={addMedication}
                  className="h-7 px-3"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Medication
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescription.medications.length === 0 ? (
                  <div className="text-center py-8">
                    <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">No medications added</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addMedication}
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Medication
                    </Button>
                  </div>
                ) : (
                  prescription.medications.map((medication, index) => (
                    <div key={medication.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Medication {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedication(medication.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">Medication Name *</Label>
                          <Input
                            value={medication.name}
                            onChange={(e) => updateMedication(medication.id, 'name', e.target.value)}
                            placeholder="e.g., Paracetamol"
                            className="h-8"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-500">Dosage *</Label>
                          <Input
                            value={medication.dosage}
                            onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                            placeholder="e.g., 500mg"
                            className="h-8"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-500">Frequency *</Label>
                          <Input
                            value={medication.frequency}
                            onChange={(e) => updateMedication(medication.id, 'frequency', e.target.value)}
                            placeholder="e.g., 3 times daily"
                            className="h-8"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-500">Duration *</Label>
                          <Input
                            value={medication.duration}
                            onChange={(e) => updateMedication(medication.id, 'duration', e.target.value)}
                            placeholder="e.g., 5 days"
                            className="h-8"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-500">Quantity</Label>
                          <Input
                            value={medication.quantity}
                            onChange={(e) => updateMedication(medication.id, 'quantity', e.target.value)}
                            placeholder="e.g., 15 tablets"
                            className="h-8"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`beforeMeal-${medication.id}`}
                              checked={medication.beforeMeal}
                              onChange={(e) => updateMedication(medication.id, 'beforeMeal', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <Label htmlFor={`beforeMeal-${medication.id}`} className="text-xs">
                              Before meal
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`isGeneric-${medication.id}`}
                              checked={medication.isGeneric}
                              onChange={(e) => updateMedication(medication.id, 'isGeneric', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <Label htmlFor={`isGeneric-${medication.id}`} className="text-xs">
                              Generic
                            </Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Label className="text-xs text-gray-500">Special Instructions</Label>
                        <Textarea
                          value={medication.instructions}
                          onChange={(e) => updateMedication(medication.id, 'instructions', e.target.value)}
                          placeholder="Special instructions for this medication..."
                          className="min-h-[60px] text-sm"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* General Instructions */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                General Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={prescription.instructions}
                onChange={(e) => setPrescription({ ...prescription, instructions: e.target.value })}
                placeholder="General instructions for all medications..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Follow-up Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Follow-up Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Next Visit</Label>
                  <Input
                    type="date"
                    value={prescription.nextVisit}
                    onChange={(e) => setPrescription({ ...prescription, nextVisit: e.target.value })}
                    className="h-8"
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500">Diagnosis</Label>
                  <Input
                    value={prescription.diagnosis}
                    onChange={(e) => setPrescription({ ...prescription, diagnosis: e.target.value })}
                    placeholder="Primary diagnosis"
                    className="h-8"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <Label className="text-xs text-gray-500">Follow-up Instructions</Label>
                <Textarea
                  value={prescription.followUp}
                  onChange={(e) => setPrescription({ ...prescription, followUp: e.target.value })}
                  placeholder="Follow-up instructions..."
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Prescription Preview */
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="text-center border-b border-gray-300 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">PRESCRIPTION</h2>
                <p className="text-sm text-gray-600">Dr. {consultation.doctor_name}</p>
                <p className="text-xs text-gray-500">{consultation.clinic_name}</p>
              </div>

              {/* Patient Information */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <span className="font-medium">Patient Name:</span>
                  <p>{patient.user_name}</p>
                </div>
                <div>
                  <span className="font-medium">Age/Gender:</span>
                  <p>{patient.age} years / {patient.gender}</p>
                </div>
                <div>
                  <span className="font-medium">Date:</span>
                  <p>{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium">Consultation ID:</span>
                  <p>{consultation.id}</p>
                </div>
              </div>

              {/* Diagnosis */}
              {prescription.diagnosis && (
                <div className="mb-6">
                  <h3 className="font-semibold text-sm mb-2">Diagnosis:</h3>
                  <p className="text-sm">{prescription.diagnosis}</p>
                </div>
              )}

              {/* Medications */}
              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-3">Medications:</h3>
                <div className="space-y-3">
                  {prescription.medications.map((med, index) => (
                    <div key={med.id} className="border-l-4 border-blue-500 pl-3">
                      <div className="font-medium text-sm">
                        {index + 1}. {med.name} {med.dosage}
                      </div>
                      <div className="text-sm text-gray-600">
                        {med.frequency} for {med.duration}
                        {med.quantity && ` • Quantity: ${med.quantity}`}
                        {med.beforeMeal && ' • Take before meals'}
                        {med.isGeneric && ' • Generic'}
                      </div>
                      {med.instructions && (
                        <div className="text-xs text-gray-500 mt-1">
                          {med.instructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              {prescription.instructions && (
                <div className="mb-6">
                  <h3 className="font-semibold text-sm mb-2">Instructions:</h3>
                  <p className="text-sm">{prescription.instructions}</p>
                </div>
              )}

              {/* Follow-up */}
              {prescription.followUp && (
                <div className="mb-6">
                  <h3 className="font-semibold text-sm mb-2">Follow-up:</h3>
                  <p className="text-sm">{prescription.followUp}</p>
                  {prescription.nextVisit && (
                    <p className="text-sm text-gray-600">Next visit: {prescription.nextVisit}</p>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-gray-300 pt-4 mt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Doctor's Signature:</span>
                    <p className="text-gray-600">Dr. {consultation.doctor_name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>
                    <p className="text-gray-600">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generatePrescriptionPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={sendPrescription}
          >
            <Send className="w-4 h-4 mr-2" />
            Send to Patient
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
          >
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          
          <Button
            variant="outline"
            size="sm"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionWriter;
