import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Save, 
  Printer, 
  Loader2,
  User,
  Heart,
  Pill
} from 'lucide-react';
import { prescriptionApi } from '@/lib/api';
import { toast } from '@/lib/toast';
import MedicationSearch from '@/components/MedicationSearch';

const PrescriptionWriter: React.FC = () => {
  const navigate = useNavigate();
  const { prescriptionId } = useParams<{ prescriptionId: string }>();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prescription, setPrescription] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    primary_diagnosis: '',
    general_instructions: '',
    vital_signs: {
      pulse: '',
      blood_pressure_systolic: '',
      blood_pressure_diastolic: '',
      temperature: '',
      weight: ''
    }
  });

  const [selectedMedications, setSelectedMedications] = useState<any[]>([]);

  const handleMedicationSelect = (medication: any) => {
    setSelectedMedications(prev => [...prev, medication]);
    toast.success(`Added ${medication.name} to prescription`);
  };

  useEffect(() => {
    const loadPrescription = async () => {
      if (!prescriptionId) {
        setLoading(false);
        return;
      }

      try {
        const response = await prescriptionApi.getPrescription(prescriptionId);
        const prescriptionData = response.data;
        setPrescription(prescriptionData);
        
        setFormData({
          primary_diagnosis: prescriptionData.primary_diagnosis || '',
          general_instructions: prescriptionData.general_instructions || '',
          vital_signs: {
            pulse: prescriptionData.vital_signs?.pulse?.toString() || '',
            blood_pressure_systolic: prescriptionData.vital_signs?.blood_pressure_systolic?.toString() || '',
            blood_pressure_diastolic: prescriptionData.vital_signs?.blood_pressure_diastolic?.toString() || '',
            temperature: prescriptionData.vital_signs?.temperature?.toString() || '',
            weight: prescriptionData.vital_signs?.weight?.toString() || ''
          }
        });
      } catch (error) {
        console.error('Error loading prescription:', error);
        toast.error("Error loading prescription");
      } finally {
        setLoading(false);
      }
    };

    loadPrescription();
  }, [prescriptionId]);

  const handleSaveDraft = async () => {
    if (!prescriptionId) return;

    setSaving(true);
    try {
      await prescriptionApi.updatePrescription(prescriptionId, {
        ...formData,
        is_draft: true,
        is_finalized: false
      });
      toast.success("Draft saved successfully");
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error("Error saving draft");
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!prescriptionId) return;

    setSaving(true);
    try {
      await prescriptionApi.finalizeAndGeneratePDF(prescriptionId, formData);
      toast.success("Prescription finalized and PDF generated successfully");
      navigate('/prescriptions');
    } catch (error) {
      console.error('Error finalizing prescription:', error);
      toast.error("Error finalizing prescription");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading prescription...</p>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Prescription not found</h3>
          <Button onClick={() => navigate('/prescriptions')}>
            Back to Prescriptions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/prescriptions')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prescription Writer</h1>
            <p className="text-gray-600">
              Writing prescription for {prescription.patient?.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center space-x-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </Button>
          <Button
            onClick={handleFinalize}
            disabled={saving}
            className="flex items-center space-x-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            Finalize & Generate PDF
          </Button>
        </div>
      </div>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Patient Name</Label>
              <p className="font-medium">{prescription.patient?.name}</p>
            </div>
            <div>
              <Label>Phone</Label>
              <p className="font-medium">{prescription.patient?.phone}</p>
            </div>
            <div>
              <Label>Doctor</Label>
              <p className="font-medium">{prescription.doctor?.name}</p>
            </div>
            <div>
              <Label>Consultation Date</Label>
              <p className="font-medium">
                {new Date(prescription.consultation?.scheduled_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5" />
            Vital Signs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="pulse">Pulse (bpm)</Label>
              <Input
                id="pulse"
                type="number"
                value={formData.vital_signs.pulse}
                onChange={(e) => setFormData({
                  ...formData,
                  vital_signs: {
                    ...formData.vital_signs,
                    pulse: e.target.value
                  }
                })}
                placeholder="72"
              />
            </div>
            <div>
              <Label htmlFor="bp-systolic">BP Systolic (mmHg)</Label>
              <Input
                id="bp-systolic"
                type="number"
                value={formData.vital_signs.blood_pressure_systolic}
                onChange={(e) => setFormData({
                  ...formData,
                  vital_signs: {
                    ...formData.vital_signs,
                    blood_pressure_systolic: e.target.value
                  }
                })}
                placeholder="120"
              />
            </div>
            <div>
              <Label htmlFor="bp-diastolic">BP Diastolic (mmHg)</Label>
              <Input
                id="bp-diastolic"
                type="number"
                value={formData.vital_signs.blood_pressure_diastolic}
                onChange={(e) => setFormData({
                  ...formData,
                  vital_signs: {
                    ...formData.vital_signs,
                    blood_pressure_diastolic: e.target.value
                  }
                })}
                placeholder="80"
              />
            </div>
            <div>
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={formData.vital_signs.temperature}
                onChange={(e) => setFormData({
                  ...formData,
                  vital_signs: {
                    ...formData.vital_signs,
                    temperature: e.target.value
                  }
                })}
                placeholder="37.0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnosis */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnosis</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="primary-diagnosis">Primary Diagnosis</Label>
            <Textarea
              id="primary-diagnosis"
              value={formData.primary_diagnosis}
              onChange={(e) => setFormData({
                ...formData,
                primary_diagnosis: e.target.value
              })}
              placeholder="Enter primary diagnosis..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Medication Search - FDA Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pill className="w-5 h-5" />
            Add Medications (FDA Database)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Search Medications</Label>
              <MedicationSearch
                onMedicationSelect={handleMedicationSelect}
                placeholder="Search for medications (e.g., aspirin, ibuprofen, amoxicillin)..."
                className="mt-2"
                includeFDA={false}
              />
            </div>
            
            {/* Selected Medications */}
            {selectedMedications.length > 0 && (
              <div className="mt-6">
                <Label>Selected Medications ({selectedMedications.length})</Label>
                <div className="mt-2 space-y-2">
                  {selectedMedications.map((medication, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-blue-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-blue-900">{medication.name}</h4>
                          <div className="text-sm text-blue-700 space-y-1 mt-1">
                            {medication.brand_name && medication.brand_name !== medication.name && (
                              <div className="font-medium text-blue-600">Brand: {medication.brand_name}</div>
                            )}
                            {medication.composition && (
                              <div>Composition: {medication.composition}</div>
                            )}
                            {medication.dosage_form && (
                              <div>Form: {medication.dosage_form}</div>
                            )}
                            {medication.strength && (
                              <div>Strength: {medication.strength}</div>
                            )}
                            {medication.manufacturer && (
                              <div className="text-xs text-gray-500">Manufacturer: {medication.manufacturer}</div>
                            )}
                          </div>
                          <p className="text-xs text-blue-600 mt-2">
                            Source: {medication.source === 'fda_api' ? 'FDA Database' : 'Local Database'}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedMedications(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="general-instructions">General Instructions</Label>
            <Textarea
              id="general-instructions"
              value={formData.general_instructions}
              onChange={(e) => setFormData({
                ...formData,
                general_instructions: e.target.value
              })}
              placeholder="Enter general instructions for the patient..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Medications Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pill className="w-5 h-5" />
            Medications ({prescription.medications?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prescription.medications && prescription.medications.length > 0 ? (
            <div className="space-y-3">
              {prescription.medications.map((medication: any, index: number) => (
                <div key={medication.id || index} className="border rounded-lg p-3">
                  <h4 className="font-medium text-gray-900">{medication.medicine_name}</h4>
                  <div className="text-sm text-gray-600 space-y-1 mt-1">
                    {medication.composition && (
                      <div>Composition: {medication.composition}</div>
                    )}
                    {medication.dosage_form && (
                      <div>Form: {medication.dosage_form}</div>
                    )}
                    {medication.strength && (
                      <div>Strength: {medication.strength}</div>
                    )}
                    <div>Dosage: {medication.dosage_display} | Frequency: {medication.frequency}</div>
                    <div>Duration: {medication.duration_days} days</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No medications added</h3>
              <p className="text-gray-600">Medications can be added in the full prescription writer.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrescriptionWriter; 