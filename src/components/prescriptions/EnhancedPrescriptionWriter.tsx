import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/lib/toast';
import { 
  Save, 
  FileText, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle, 
  Download,
  Eye,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { 
  prescriptionApi, 
  EnhancedPrescription, 
  CreatePrescriptionData, 
  PrescriptionMedication 
} from '@/lib/api';

interface EnhancedPrescriptionWriterProps {
  consultationId: string;
  patientId: string;
  onClose: () => void;
  existingPrescription?: EnhancedPrescription;
}

interface AutoSaveStatus {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
}

const EnhancedPrescriptionWriter: React.FC<EnhancedPrescriptionWriterProps> = ({
  consultationId,
  patientId,
  onClose,
  existingPrescription
}) => {
  // Main prescription state
  const [prescription, setPrescription] = useState<CreatePrescriptionData>({
    consultation: consultationId,
    patient: patientId,
    primary_diagnosis: '',
    secondary_diagnosis: '',
    general_instructions: '',
    diet_instructions: '',
    lifestyle_advice: '',
    next_visit: '',
    follow_up_notes: '',
    medications: [],
    pulse: undefined,
    blood_pressure_systolic: undefined,
    blood_pressure_diastolic: undefined,
    temperature: undefined,
    weight: undefined,
    height: undefined,
  });

  // Component state
  const [prescriptionId, setPrescriptionId] = useState<string | null>(
    existingPrescription?.id?.toString() || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
  const [pdfVersions, setPdfVersions] = useState<any[]>([]);
  const [showPDFViewer, setShowPDFViewer] = useState(false);

  // Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>({
    isSaving: false,
    lastSaved: null,
    error: null
  });

  // Refs for auto-save
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prescriptionRef = useRef(prescription);

  // Update ref when prescription changes
  useEffect(() => {
    prescriptionRef.current = prescription;
  }, [prescription]);

  // Initialize prescription data
  useEffect(() => {
    if (existingPrescription) {
      setPrescription({
        consultation: consultationId,
        patient: patientId,
        primary_diagnosis: existingPrescription.primary_diagnosis || '',
        secondary_diagnosis: existingPrescription.secondary_diagnosis || '',
        general_instructions: existingPrescription.general_instructions || '',
        diet_instructions: existingPrescription.diet_instructions || '',
        lifestyle_advice: existingPrescription.lifestyle_advice || '',
        next_visit: existingPrescription.next_visit || '',
        follow_up_notes: existingPrescription.follow_up_notes || '',
        medications: existingPrescription.medications || [],
        pulse: existingPrescription.pulse,
        blood_pressure_systolic: existingPrescription.blood_pressure_systolic,
        blood_pressure_diastolic: existingPrescription.blood_pressure_diastolic,
        temperature: existingPrescription.temperature,
        weight: existingPrescription.weight,
        height: existingPrescription.height,
      });
    }
  }, [existingPrescription, consultationId, patientId]);

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (!prescriptionId || autoSaveStatus.isSaving) return;

    setAutoSaveStatus(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      await prescriptionApi.autoSave(prescriptionId, prescriptionRef.current);
      setAutoSaveStatus(prev => ({ 
        ...prev, 
        isSaving: false, 
        lastSaved: new Date(),
        error: null 
      }));
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus(prev => ({ 
        ...prev, 
        isSaving: false,
        error: 'Auto-save failed' 
      }));
    }
  }, [prescriptionId, autoSaveStatus.isSaving]);

  // Set up auto-save interval
  useEffect(() => {
    if (prescriptionId && !existingPrescription?.is_finalized) {
      autoSaveIntervalRef.current = setInterval(autoSave, 30000); // Auto-save every 30 seconds
      
      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };
    }
  }, [prescriptionId, autoSave, existingPrescription?.is_finalized]);

  // Create new prescription
  const createPrescription = async (): Promise<string> => {
    try {
      const response = await prescriptionApi.createPrescription(prescription);
      const newId = response.id?.toString();
      if (newId) {
        setPrescriptionId(newId);
        toast.success('Prescription created successfully');
        return newId;
      }
      throw new Error('No prescription ID returned');
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error('Failed to create prescription');
      throw error;
    }
  };

  // Update existing prescription
  const updatePrescription = async () => {
    if (!prescriptionId) return;

    try {
      await prescriptionApi.updatePrescription(prescriptionId, prescription);
      toast.success('Prescription updated successfully');
    } catch (error) {
      console.error('Error updating prescription:', error);
      toast.error('Failed to update prescription');
      throw error;
    }
  };

  // Manual save
  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (prescriptionId) {
        await updatePrescription();
      } else {
        await createPrescription();
      }
    } catch (error) {
      // Error handling is done in the individual functions
    } finally {
      setIsLoading(false);
    }
  };

  // Finalize prescription and generate PDF
  const handleFinalize = async () => {
    if (!prescriptionId) {
      toast.error('Please save the prescription first');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const response = await prescriptionApi.finalizeAndGeneratePDF(prescriptionId, prescription);
      
      toast.success('Prescription finalized and PDF generated successfully!');
      
      // Update prescription state to reflect finalized status
      setPrescription(prev => ({
        ...prev,
        ...response.prescription
      }));

      // Load PDF versions
      await loadPDFVersions();
      
      setShowFinalizeDialog(false);
    } catch (error) {
      console.error('Error finalizing prescription:', error);
      toast.error('Failed to finalize prescription');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Load PDF versions
  const loadPDFVersions = async () => {
    if (!prescriptionId) return;

    try {
      const response = await prescriptionApi.getPDFVersions(prescriptionId);
      setPdfVersions(response.versions);
    } catch (error) {
      console.error('Error loading PDF versions:', error);
    }
  };

  // Download PDF
  const handleDownloadPDF = async (version: string | number = 'latest') => {
    if (!prescriptionId) return;

    try {
      const blob = await prescriptionApi.downloadPDF(prescriptionId, version);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescription_${prescriptionId}_v${version}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  // Add medication
  const addMedication = () => {
    const newMedication: Omit<PrescriptionMedication, 'id'> = {
      medicine_name: '',
      composition: '',
      dosage_form: 'Tablet',
      morning_dose: 0,
      afternoon_dose: 0,
      evening_dose: 0,
      frequency: 'once_daily',
      timing: 'after_breakfast',
      duration_days: 7,
      is_continuous: false,
      special_instructions: '',
      order: (prescription.medications?.length || 0) + 1
    };

    setPrescription(prev => ({
      ...prev,
      medications: [...(prev.medications || []), newMedication]
    }));
  };

  // Remove medication
  const removeMedication = (index: number) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications?.filter((_, i) => i !== index) || []
    }));
  };

  // Update medication
  const updateMedication = (index: number, updatedMed: Partial<PrescriptionMedication>) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications?.map((med, i) => 
        i === index ? { ...med, ...updatedMed } : med
      ) || []
    }));
  };

  // Auto-save status display
  const renderAutoSaveStatus = () => {
    if (!prescriptionId || existingPrescription?.is_finalized) return null;

    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {autoSaveStatus.isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving...</span>
          </>
        ) : autoSaveStatus.lastSaved ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Last saved: {autoSaveStatus.lastSaved.toLocaleTimeString()}</span>
          </>
        ) : autoSaveStatus.error ? (
          <>
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-500">{autoSaveStatus.error}</span>
          </>
        ) : (
          <>
            <Clock className="h-4 w-4" />
            <span>Auto-save enabled</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {existingPrescription ? 'Edit Prescription' : 'Write Prescription'}
          </h2>
          <div className="flex items-center gap-4 mt-2">
            {renderAutoSaveStatus()}
            {existingPrescription?.is_finalized && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Finalized
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {pdfVersions.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowPDFViewer(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View PDFs ({pdfVersions.length})
            </Button>
          )}
          
          <Button
            onClick={handleSave}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Draft
          </Button>

          {prescriptionId && !existingPrescription?.is_finalized && (
            <Button
              onClick={() => setShowFinalizeDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Finalize & Generate PDF
            </Button>
          )}

          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Diagnosis & Instructions */}
        <div className="space-y-6">
          {/* Vital Signs */}
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pulse">Pulse (bpm)</Label>
                  <Input
                    id="pulse"
                    type="number"
                    value={prescription.pulse || ''}
                    onChange={(e) => setPrescription(prev => ({
                      ...prev,
                      pulse: e.target.value ? parseInt(e.target.value) : undefined
                    }))}
                    placeholder="e.g., 72"
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">Temperature (°F)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={prescription.temperature || ''}
                    onChange={(e) => setPrescription(prev => ({
                      ...prev,
                      temperature: e.target.value ? parseFloat(e.target.value) : undefined
                    }))}
                    placeholder="e.g., 98.6"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="systolic">Systolic BP</Label>
                  <Input
                    id="systolic"
                    type="number"
                    value={prescription.blood_pressure_systolic || ''}
                    onChange={(e) => setPrescription(prev => ({
                      ...prev,
                      blood_pressure_systolic: e.target.value ? parseInt(e.target.value) : undefined
                    }))}
                    placeholder="120"
                  />
                </div>
                <div>
                  <Label htmlFor="diastolic">Diastolic BP</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    value={prescription.blood_pressure_diastolic || ''}
                    onChange={(e) => setPrescription(prev => ({
                      ...prev,
                      blood_pressure_diastolic: e.target.value ? parseInt(e.target.value) : undefined
                    }))}
                    placeholder="80"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={prescription.weight || ''}
                    onChange={(e) => setPrescription(prev => ({
                      ...prev,
                      weight: e.target.value ? parseFloat(e.target.value) : undefined
                    }))}
                    placeholder="70"
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
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primary_diagnosis">Primary Diagnosis</Label>
                <Textarea
                  id="primary_diagnosis"
                  value={prescription.primary_diagnosis}
                  onChange={(e) => setPrescription(prev => ({
                    ...prev,
                    primary_diagnosis: e.target.value
                  }))}
                  placeholder="Enter primary diagnosis..."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="secondary_diagnosis">Secondary Diagnosis</Label>
                <Textarea
                  id="secondary_diagnosis"
                  value={prescription.secondary_diagnosis}
                  onChange={(e) => setPrescription(prev => ({
                    ...prev,
                    secondary_diagnosis: e.target.value
                  }))}
                  placeholder="Enter secondary diagnosis..."
                  rows={2}
                />
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
                  onChange={(e) => setPrescription(prev => ({
                    ...prev,
                    general_instructions: e.target.value
                  }))}
                  placeholder="General medication instructions..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="diet_instructions">Diet Instructions</Label>
                <Textarea
                  id="diet_instructions"
                  value={prescription.diet_instructions}
                  onChange={(e) => setPrescription(prev => ({
                    ...prev,
                    diet_instructions: e.target.value
                  }))}
                  placeholder="Diet recommendations..."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="lifestyle_advice">Lifestyle Advice</Label>
                <Textarea
                  id="lifestyle_advice"
                  value={prescription.lifestyle_advice}
                  onChange={(e) => setPrescription(prev => ({
                    ...prev,
                    lifestyle_advice: e.target.value
                  }))}
                  placeholder="Lifestyle recommendations..."
                  rows={2}
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
                  value={prescription.next_visit}
                  onChange={(e) => setPrescription(prev => ({
                    ...prev,
                    next_visit: e.target.value
                  }))}
                  placeholder="e.g., Follow up in 2 weeks"
                />
              </div>
              <div>
                <Label htmlFor="follow_up_notes">Follow-up Notes</Label>
                <Textarea
                  id="follow_up_notes"
                  value={prescription.follow_up_notes}
                  onChange={(e) => setPrescription(prev => ({
                    ...prev,
                    follow_up_notes: e.target.value
                  }))}
                  placeholder="Additional follow-up instructions..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Medications */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Medications</CardTitle>
              <Button onClick={addMedication} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </CardHeader>
            <CardContent>
              {prescription.medications && prescription.medications.length > 0 ? (
                <div className="space-y-4">
                  {prescription.medications.map((medication, index) => (
                    <MedicationCard
                      key={index}
                      medication={medication}
                      onUpdate={(updatedMed) => updateMedication(index, updatedMed)}
                      onRemove={() => removeMedication(index)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No medications added yet</p>
                  <Button onClick={addMedication} variant="outline" className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Medication
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Finalize Confirmation Dialog */}
      <AlertDialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalize Prescription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to finalize this prescription? This will:
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Generate a professional PDF</li>
                <li>Make the prescription read-only</li>
                <li>Make it accessible to the patient</li>
                <li>Create a new version if edited later</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalize}
              disabled={isGeneratingPDF}
              className="bg-green-600 hover:bg-green-700"
            >
              {isGeneratingPDF ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Finalize & Generate PDF
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Viewer Dialog */}
      <Dialog open={showPDFViewer} onOpenChange={setShowPDFViewer}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prescription PDFs</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {pdfVersions.map((version) => (
              <div key={version.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Version {version.version}</div>
                  <div className="text-sm text-gray-500">
                    Generated: {new Date(version.generated_at).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    By: {version.generated_by.name}
                  </div>
                  {version.is_current && (
                    <Badge variant="secondary" className="mt-1">Current</Badge>
                  )}
                </div>
                <Button
                  onClick={() => handleDownloadPDF(version.version)}
                  size="sm"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Medication Card Component
interface MedicationCardProps {
  medication: Omit<PrescriptionMedication, 'id'>;
  onUpdate: (medication: Partial<PrescriptionMedication>) => void;
  onRemove: () => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ medication, onUpdate, onRemove }) => {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Medication {medication.order}</h4>
        <Button
          onClick={onRemove}
          size="sm"
          variant="outline"
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Medicine Name</Label>
          <Input
            value={medication.medicine_name}
            onChange={(e) => onUpdate({ medicine_name: e.target.value })}
            placeholder="Enter medicine name"
          />
        </div>
        <div>
          <Label>Composition</Label>
          <Input
            value={medication.composition || ''}
            onChange={(e) => onUpdate({ composition: e.target.value })}
            placeholder="e.g., 500mg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Dosage Form</Label>
          <Select
            value={medication.dosage_form || 'Tablet'}
            onValueChange={(value) => onUpdate({ dosage_form: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tablet">Tablet</SelectItem>
              <SelectItem value="Capsule">Capsule</SelectItem>
              <SelectItem value="Syrup">Syrup</SelectItem>
              <SelectItem value="Injection">Injection</SelectItem>
              <SelectItem value="Drops">Drops</SelectItem>
              <SelectItem value="Cream">Cream</SelectItem>
              <SelectItem value="Ointment">Ointment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Frequency</Label>
          <Select
            value={medication.frequency}
            onValueChange={(value: any) => onUpdate({ frequency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="once_daily">Once Daily</SelectItem>
              <SelectItem value="twice_daily">Twice Daily</SelectItem>
              <SelectItem value="thrice_daily">Thrice Daily</SelectItem>
              <SelectItem value="four_times_daily">Four Times Daily</SelectItem>
              <SelectItem value="sos">SOS (As Needed)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Dosage (Morning-Afternoon-Evening)</Label>
        <div className="grid grid-cols-3 gap-2">
          <Input
            type="number"
            min="0"
            value={medication.morning_dose}
            onChange={(e) => onUpdate({ morning_dose: parseInt(e.target.value) || 0 })}
            placeholder="M"
          />
          <Input
            type="number"
            min="0"
            value={medication.afternoon_dose}
            onChange={(e) => onUpdate({ afternoon_dose: parseInt(e.target.value) || 0 })}
            placeholder="A"
          />
          <Input
            type="number"
            min="0"
            value={medication.evening_dose}
            onChange={(e) => onUpdate({ evening_dose: parseInt(e.target.value) || 0 })}
            placeholder="E"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Timing</Label>
          <Select
            value={medication.timing}
            onValueChange={(value: any) => onUpdate({ timing: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="before_breakfast">Before Breakfast</SelectItem>
              <SelectItem value="after_breakfast">After Breakfast</SelectItem>
              <SelectItem value="before_lunch">Before Lunch</SelectItem>
              <SelectItem value="after_lunch">After Lunch</SelectItem>
              <SelectItem value="before_dinner">Before Dinner</SelectItem>
              <SelectItem value="after_dinner">After Dinner</SelectItem>
              <SelectItem value="bedtime">Bedtime</SelectItem>
              <SelectItem value="empty_stomach">Empty Stomach</SelectItem>
              <SelectItem value="with_food">With Food</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Duration (days)</Label>
          <Input
            type="number"
            min="1"
            value={medication.duration_days || ''}
            onChange={(e) => onUpdate({ duration_days: parseInt(e.target.value) || undefined })}
            placeholder="e.g., 7"
          />
        </div>
      </div>

      <div>
        <Label>Special Instructions</Label>
        <Textarea
          value={medication.special_instructions || ''}
          onChange={(e) => onUpdate({ special_instructions: e.target.value })}
          placeholder="Any special instructions for this medication..."
          rows={2}
        />
      </div>
    </div>
  );
};

export default EnhancedPrescriptionWriter;