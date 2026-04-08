import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  ArrowLeft,
  User,
  Stethoscope,
  Pill,
  Calendar,
  FileText,
  AlertTriangle,
  Plus,
  Save,
  Send,
  Clock,
  Activity,
  Heart,
  Brain,
  Eye,
  Thermometer,
  Scale,
  Zap,
  Target,
  Award,
  Shield,
  Star
} from 'lucide-react';
import { Consultation as ApiConsultation, PatientProfile } from '@/lib/api';

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

interface ConsultationWorkflowProps {
  currentStep: string;
  onStepChange: (step: string) => void;
  consultation: Consultation;
  patient: PatientProfile;
  onComplete: () => void;
}

const ConsultationWorkflow: React.FC<ConsultationWorkflowProps> = ({
  currentStep,
  onStepChange,
  consultation,
  patient,
  onComplete
}) => {
  const [assessment, setAssessment] = useState({
    chiefComplaint: consultation.chief_complaint || '',
    symptoms: consultation.symptoms || '',
    duration: '',
    severity: 'mild',
    history: '',
    examination: ''
  });

  const [diagnosis, setDiagnosis] = useState({
    primaryDiagnosis: '',
    differentialDiagnosis: '',
    clinicalFindings: '',
    labResults: '',
    imaging: ''
  });

  const [treatment, setTreatment] = useState({
    medications: [],
    instructions: '',
    lifestyle: '',
    followUp: '',
    referrals: ''
  });

  const [followUp, setFollowUp] = useState({
    nextVisit: '',
    tests: '',
    instructions: '',
    emergency: ''
  });

  const steps = [
    { id: 'assessment', label: 'Assessment', icon: User, completed: false },
    { id: 'diagnosis', label: 'Diagnosis', icon: Stethoscope, completed: false },
    { id: 'treatment', label: 'Treatment', icon: Pill, completed: false },
    { id: 'followup', label: 'Follow-up', icon: Calendar, completed: false }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      onStepChange(steps[nextIndex].id);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      onStepChange(steps[prevIndex].id);
    }
  };

  const handleStepClick = (stepId: string) => {
    onStepChange(stepId);
  };

  const isStepCompleted = (stepId: string) => {
    switch (stepId) {
      case 'assessment':
        return assessment.chiefComplaint && assessment.symptoms;
      case 'diagnosis':
        return diagnosis.primaryDiagnosis;
      case 'treatment':
        return treatment.medications.length > 0 || treatment.instructions;
      case 'followup':
        return followUp.nextVisit || followUp.instructions;
      default:
        return false;
    }
  };

  const renderAssessmentStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chief Complaint */}
        <div className="space-y-2">
          <Label htmlFor="chiefComplaint" className="text-sm font-medium">
            Chief Complaint *
          </Label>
          <Input
            id="chiefComplaint"
            value={assessment.chiefComplaint}
            onChange={(e) => setAssessment({ ...assessment, chiefComplaint: e.target.value })}
            placeholder="e.g., Chest pain, fever, headache"
            className="h-10"
          />
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration" className="text-sm font-medium">
            Duration
          </Label>
          <Input
            id="duration"
            value={assessment.duration}
            onChange={(e) => setAssessment({ ...assessment, duration: e.target.value })}
            placeholder="e.g., 3 days, 1 week"
            className="h-10"
          />
        </div>
      </div>

      {/* Symptoms */}
      <div className="space-y-2">
        <Label htmlFor="symptoms" className="text-sm font-medium">
          Symptoms *
        </Label>
        <Textarea
          id="symptoms"
          value={assessment.symptoms}
          onChange={(e) => setAssessment({ ...assessment, symptoms: e.target.value })}
          placeholder="Describe the symptoms in detail..."
          className="min-h-[100px]"
        />
      </div>

      {/* Severity */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Severity</Label>
        <div className="flex space-x-2">
          {['mild', 'moderate', 'severe'].map((level) => (
            <Button
              key={level}
              variant={assessment.severity === level ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAssessment({ ...assessment, severity: level })}
              className="capitalize"
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="space-y-2">
        <Label htmlFor="history" className="text-sm font-medium">
          Medical History
        </Label>
        <Textarea
          id="history"
          value={assessment.history}
          onChange={(e) => setAssessment({ ...assessment, history: e.target.value })}
          placeholder="Relevant medical history..."
          className="min-h-[100px]"
        />
      </div>

      {/* Physical Examination */}
      <div className="space-y-2">
        <Label htmlFor="examination" className="text-sm font-medium">
          Physical Examination
        </Label>
        <Textarea
          id="examination"
          value={assessment.examination}
          onChange={(e) => setAssessment({ ...assessment, examination: e.target.value })}
          placeholder="Physical examination findings..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  );

  const renderDiagnosisStep = () => (
    <div className="space-y-6">
      {/* Primary Diagnosis */}
      <div className="space-y-2">
        <Label htmlFor="primaryDiagnosis" className="text-sm font-medium">
          Primary Diagnosis *
        </Label>
        <Input
          id="primaryDiagnosis"
          value={diagnosis.primaryDiagnosis}
          onChange={(e) => setDiagnosis({ ...diagnosis, primaryDiagnosis: e.target.value })}
          placeholder="e.g., Acute bronchitis, Hypertension"
          className="h-10"
        />
      </div>

      {/* Differential Diagnosis */}
      <div className="space-y-2">
        <Label htmlFor="differentialDiagnosis" className="text-sm font-medium">
          Differential Diagnosis
        </Label>
        <Textarea
          id="differentialDiagnosis"
          value={diagnosis.differentialDiagnosis}
          onChange={(e) => setDiagnosis({ ...diagnosis, differentialDiagnosis: e.target.value })}
          placeholder="List possible differential diagnoses..."
          className="min-h-[100px]"
        />
      </div>

      {/* Clinical Findings */}
      <div className="space-y-2">
        <Label htmlFor="clinicalFindings" className="text-sm font-medium">
          Clinical Findings
        </Label>
        <Textarea
          id="clinicalFindings"
          value={diagnosis.clinicalFindings}
          onChange={(e) => setDiagnosis({ ...diagnosis, clinicalFindings: e.target.value })}
          placeholder="Clinical findings supporting the diagnosis..."
          className="min-h-[100px]"
        />
      </div>

      {/* Lab Results */}
      <div className="space-y-2">
        <Label htmlFor="labResults" className="text-sm font-medium">
          Laboratory Results
        </Label>
        <Textarea
          id="labResults"
          value={diagnosis.labResults}
          onChange={(e) => setDiagnosis({ ...diagnosis, labResults: e.target.value })}
          placeholder="Relevant laboratory results..."
          className="min-h-[100px]"
        />
      </div>

      {/* Imaging */}
      <div className="space-y-2">
        <Label htmlFor="imaging" className="text-sm font-medium">
          Imaging Studies
        </Label>
        <Textarea
          id="imaging"
          value={diagnosis.imaging}
          onChange={(e) => setDiagnosis({ ...diagnosis, imaging: e.target.value })}
          placeholder="Imaging findings (X-ray, CT, MRI, etc.)..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  );

  const renderTreatmentStep = () => (
    <div className="space-y-6">
      {/* Medications */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Medications</Label>
        <div className="space-y-2">
          {treatment.medications.map((med, index) => (
            <div key={index} className="flex space-x-2">
              <Input
                value={med}
                onChange={(e) => {
                  const newMeds = [...treatment.medications];
                  newMeds[index] = e.target.value;
                  setTreatment({ ...treatment, medications: newMeds });
                }}
                placeholder="Medication name, dosage, frequency"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newMeds = treatment.medications.filter((_, i) => i !== index);
                  setTreatment({ ...treatment, medications: newMeds });
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTreatment({ ...treatment, medications: [...treatment.medications, ''] })}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-2">
        <Label htmlFor="instructions" className="text-sm font-medium">
          Treatment Instructions
        </Label>
        <Textarea
          id="instructions"
          value={treatment.instructions}
          onChange={(e) => setTreatment({ ...treatment, instructions: e.target.value })}
          placeholder="Detailed treatment instructions..."
          className="min-h-[100px]"
        />
      </div>

      {/* Lifestyle Recommendations */}
      <div className="space-y-2">
        <Label htmlFor="lifestyle" className="text-sm font-medium">
          Lifestyle Recommendations
        </Label>
        <Textarea
          id="lifestyle"
          value={treatment.lifestyle}
          onChange={(e) => setTreatment({ ...treatment, lifestyle: e.target.value })}
          placeholder="Diet, exercise, and lifestyle recommendations..."
          className="min-h-[100px]"
        />
      </div>

      {/* Referrals */}
      <div className="space-y-2">
        <Label htmlFor="referrals" className="text-sm font-medium">
          Referrals
        </Label>
        <Textarea
          id="referrals"
          value={treatment.referrals}
          onChange={(e) => setTreatment({ ...treatment, referrals: e.target.value })}
          placeholder="Specialist referrals if needed..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  );

  const renderFollowUpStep = () => (
    <div className="space-y-6">
      {/* Next Visit */}
      <div className="space-y-2">
        <Label htmlFor="nextVisit" className="text-sm font-medium">
          Next Visit
        </Label>
        <Input
          id="nextVisit"
          type="date"
          value={followUp.nextVisit}
          onChange={(e) => setFollowUp({ ...followUp, nextVisit: e.target.value })}
          className="h-10"
        />
      </div>

      {/* Tests Required */}
      <div className="space-y-2">
        <Label htmlFor="tests" className="text-sm font-medium">
          Tests Required
        </Label>
        <Textarea
          id="tests"
          value={followUp.tests}
          onChange={(e) => setFollowUp({ ...followUp, tests: e.target.value })}
          placeholder="Laboratory tests, imaging, or other investigations..."
          className="min-h-[100px]"
        />
      </div>

      {/* Follow-up Instructions */}
      <div className="space-y-2">
        <Label htmlFor="followUpInstructions" className="text-sm font-medium">
          Follow-up Instructions
        </Label>
        <Textarea
          id="followUpInstructions"
          value={followUp.instructions}
          onChange={(e) => setFollowUp({ ...followUp, instructions: e.target.value })}
          placeholder="Instructions for the patient..."
          className="min-h-[100px]"
        />
      </div>

      {/* Emergency Instructions */}
      <div className="space-y-2">
        <Label htmlFor="emergency" className="text-sm font-medium">
          Emergency Instructions
        </Label>
        <Textarea
          id="emergency"
          value={followUp.emergency}
          onChange={(e) => setFollowUp({ ...followUp, emergency: e.target.value })}
          placeholder="When to seek immediate medical attention..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'assessment':
        return renderAssessmentStep();
      case 'diagnosis':
        return renderDiagnosisStep();
      case 'treatment':
        return renderTreatmentStep();
      case 'followup':
        return renderFollowUpStep();
      default:
        return renderAssessmentStep();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => handleStepClick(step.id)}
              className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                currentStep === step.id
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : isStepCompleted(step.id)
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
              }`}
            >
              {isStepCompleted(step.id) ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <step.icon className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{step.label}</span>
            </button>
            {index < steps.length - 1 && (
              <ArrowRight className="w-5 h-5 text-gray-400 mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <steps[currentStepIndex]?.icon className="w-5 h-5 mr-2" />
            {steps[currentStepIndex]?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => onStepChange('assessment')}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Progress
          </Button>

          {currentStepIndex < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepCompleted(currentStep)}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Consultation
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationWorkflow;
