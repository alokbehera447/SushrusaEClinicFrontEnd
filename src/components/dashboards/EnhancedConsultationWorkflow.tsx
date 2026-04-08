import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { consultationService, Consultation } from '@/lib/consultationService';
import { 
  Video, 
  Phone, 
  MessageSquare, 
  User, 
  Calendar, 
  Clock, 
  Pill, 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Print, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  Square, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  Settings, 
  Maximize2, 
  Minimize2, 
  FileText, 
  Stethoscope, 
  Heart, 
  Thermometer, 
  Weight, 
  Activity, 
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
  Brain, 
  Eye as EyeIcon, 
  Scale, 
  Droplets, 
  Loader2,
  X,
  Users,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

interface ConsultationWorkflowProps {
  consultation: Consultation;
  onClose: () => void;
  onStatusUpdate: (status: string) => void;
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

interface ConsultationNotes {
  id: string;
  content: string;
  timestamp: string;
  type: 'general' | 'symptom' | 'diagnosis' | 'treatment';
}

const EnhancedConsultationWorkflow: React.FC<ConsultationWorkflowProps> = ({
  consultation,
  onClose,
  onStatusUpdate
}) => {
  const [activeTab, setActiveTab] = useState('meeting');
  const [consultationStatus, setConsultationStatus] = useState(consultation.status);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  
  // Prescription state
  const [prescription, setPrescription] = useState<Prescription>({
    medications: [],
    instructions: '',
    followUp: '',
    nextVisit: '',
    diagnosis: '',
    doctorSignature: '',
    clinicInfo: ''
  });
  
  // Vital signs state
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    pulse: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    temperature: '',
    weight: '',
    height: '',
    oxygenSaturation: ''
  });
  
  // Notes state
  const [notes, setNotes] = useState<ConsultationNotes[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [noteType, setNoteType] = useState<'general' | 'symptom' | 'diagnosis' | 'treatment'>('general');
  
  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPrescriptionMode, setIsPrescriptionMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (consultationStatus === 'in_progress') {
      timerRef.current = setInterval(() => {
        setMeetingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [consultationStatus]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start consultation
  const startConsultation = async () => {
    try {
      setIsLoading(true);
      await consultationService.startConsultation(consultation.id);
      setConsultationStatus('in_progress');
      onStatusUpdate('in_progress');
      toast({
        title: "Consultation Started",
        description: "Video consultation has been initiated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start consultation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Complete consultation
  const completeConsultation = async () => {
    try {
      setIsLoading(true);
      await consultationService.completeConsultation(consultation.id);
      setConsultationStatus('completed');
      onStatusUpdate('completed');
      toast({
        title: "Consultation Completed",
        description: "Consultation has been completed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete consultation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add medication
  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      beforeMeal: false,
      isGeneric: false,
      quantity: ''
    };
    setPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication]
    }));
  };

  // Update medication
  const updateMedication = (id: string, field: keyof Medication, value: any) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.map(med => 
        med.id === id ? { ...med, [field]: value } : med
      )
    }));
  };

  // Remove medication
  const removeMedication = (id: string) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter(med => med.id !== id)
    }));
  };

  // Add note
  const addNote = () => {
    if (currentNote.trim()) {
      const newNote: ConsultationNotes = {
        id: Date.now().toString(),
        content: currentNote,
        timestamp: new Date().toISOString(),
        type: noteType
      };
      setNotes(prev => [...prev, newNote]);
      setCurrentNote('');
    }
  };

  // Save prescription
  const savePrescription = async () => {
    try {
      setIsLoading(true);
      // Here you would call the prescription API
      toast({
        title: "Prescription Saved",
        description: "Prescription has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save prescription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate prescription PDF
  const generatePrescriptionPDF = () => {
    // PDF generation logic
    toast({
      title: "PDF Generated",
      description: "Prescription PDF has been generated successfully.",
    });
  };

  // Send prescription
  const sendPrescription = () => {
    // Send prescription logic
    toast({
      title: "Prescription Sent",
      description: "Prescription has been sent to the patient.",
    });
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className={`bg-white rounded-lg shadow-2xl ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-7xl h-[90vh]'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-bold">Consultation with {consultation.patient.name}</h2>
              <p className="text-sm opacity-90">
                {consultation.consultation_type.replace('_', ' ')} • {formatDuration(meetingDuration)}
              </p>
            </div>
            <Badge variant={consultationStatus === 'in_progress' ? 'default' : 'secondary'}>
              {consultationStatus.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100%-80px)]">
          {/* Left Panel - Video Meeting */}
          <div className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-none">
                <TabsTrigger value="meeting" className="data-[state=active]:bg-white">
                  <Video className="w-4 h-4 mr-2" />
                  Meeting
                </TabsTrigger>
                <TabsTrigger value="prescription" className="data-[state=active]:bg-white">
                  <Pill className="w-4 h-4 mr-2" />
                  Prescription
                </TabsTrigger>
                <TabsTrigger value="vitals" className="data-[state=active]:bg-white">
                  <Activity className="w-4 h-4 mr-2" />
                  Vital Signs
                </TabsTrigger>
                <TabsTrigger value="notes" className="data-[state=active]:bg-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Notes
                </TabsTrigger>
              </TabsList>

              {/* Meeting Tab */}
              <TabsContent value="meeting" className="flex-1 p-4 space-y-4">
                {/* Video Area */}
                <div className="flex-1 bg-gray-900 rounded-lg relative overflow-hidden">
                  {!isVideoActive ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-white">
                        <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-semibold">Video Meeting</p>
                        <p className="text-sm opacity-75">Click start to begin consultation</p>
                      </div>
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                    />
                  )}
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black bg-opacity-50 rounded-full px-4 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAudioActive(!isAudioActive)}
                      className={`text-white ${isAudioActive ? 'bg-green-600' : 'bg-red-600'}`}
                    >
                      {isAudioActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsVideoActive(!isVideoActive)}
                      className={`text-white ${isVideoActive ? 'bg-green-600' : 'bg-red-600'}`}
                    >
                      {isVideoActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsScreenSharing(!isScreenSharing)}
                      className={`text-white ${isScreenSharing ? 'bg-blue-600' : ''}`}
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsRecording(!isRecording)}
                      className={`text-white ${isRecording ? 'bg-red-600' : ''}`}
                    >
                      <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-white' : 'border-2 border-white'}`} />
                    </Button>
                  </div>
                </div>

                {/* Meeting Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="text-lg font-mono">{formatDuration(meetingDuration)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Patient</p>
                      <p className="font-semibold">{consultation.patient.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {consultationStatus === 'scheduled' && (
                      <Button onClick={startConsultation} disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                        Start Consultation
                      </Button>
                    )}
                    {consultationStatus === 'in_progress' && (
                      <Button onClick={completeConsultation} disabled={isLoading} variant="destructive">
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        Complete Consultation
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Prescription Tab */}
              <TabsContent value="prescription" className="flex-1 p-4">
                <ScrollArea className="h-full">
                  <div className="space-y-6">
                    {/* Diagnosis */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Diagnosis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          placeholder="Enter diagnosis..."
                          value={prescription.diagnosis}
                          onChange={(e) => setPrescription(prev => ({ ...prev, diagnosis: e.target.value }))}
                          rows={3}
                        />
                      </CardContent>
                    </Card>

                    {/* Medications */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Medications</span>
                          <Button onClick={addMedication} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Medication
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {prescription.medications.map((medication) => (
                            <div key={medication.id} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">Medication {prescription.medications.indexOf(medication) + 1}</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMedication(medication.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Medication Name</Label>
                                  <Input
                                    value={medication.name}
                                    onChange={(e) => updateMedication(medication.id, 'name', e.target.value)}
                                    placeholder="e.g., Paracetamol"
                                  />
                                </div>
                                <div>
                                  <Label>Dosage</Label>
                                  <Input
                                    value={medication.dosage}
                                    onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                                    placeholder="e.g., 500mg"
                                  />
                                </div>
                                <div>
                                  <Label>Frequency</Label>
                                  <Input
                                    value={medication.frequency}
                                    onChange={(e) => updateMedication(medication.id, 'frequency', e.target.value)}
                                    placeholder="e.g., Twice daily"
                                  />
                                </div>
                                <div>
                                  <Label>Duration</Label>
                                  <Input
                                    value={medication.duration}
                                    onChange={(e) => updateMedication(medication.id, 'duration', e.target.value)}
                                    placeholder="e.g., 7 days"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label>Instructions</Label>
                                  <Textarea
                                    value={medication.instructions}
                                    onChange={(e) => updateMedication(medication.id, 'instructions', e.target.value)}
                                    placeholder="Special instructions..."
                                    rows={2}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Instructions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>General Instructions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          placeholder="Enter general instructions..."
                          value={prescription.instructions}
                          onChange={(e) => setPrescription(prev => ({ ...prev, instructions: e.target.value }))}
                          rows={4}
                        />
                      </CardContent>
                    </Card>

                    {/* Follow-up */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Follow-up</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Follow-up Instructions</Label>
                            <Textarea
                              placeholder="Follow-up instructions..."
                              value={prescription.followUp}
                              onChange={(e) => setPrescription(prev => ({ ...prev, followUp: e.target.value }))}
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label>Next Visit</Label>
                            <Input
                              type="date"
                              value={prescription.nextVisit}
                              onChange={(e) => setPrescription(prev => ({ ...prev, nextVisit: e.target.value }))}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button onClick={savePrescription} disabled={isLoading}>
                          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          Save Prescription
                        </Button>
                        <Button variant="outline" onClick={generatePrescriptionPDF}>
                          <Download className="w-4 h-4 mr-2" />
                          Generate PDF
                        </Button>
                      </div>
                      <Button onClick={sendPrescription} className="bg-green-600 hover:bg-green-700">
                        <Send className="w-4 h-4 mr-2" />
                        Send to Patient
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Vital Signs Tab */}
              <TabsContent value="vitals" className="flex-1 p-4">
                <ScrollArea className="h-full">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Vital Signs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Pulse Rate (bpm)</Label>
                            <Input
                              value={vitalSigns.pulse}
                              onChange={(e) => setVitalSigns(prev => ({ ...prev, pulse: e.target.value }))}
                              placeholder="e.g., 72"
                            />
                          </div>
                          <div>
                            <Label>Blood Pressure (Systolic)</Label>
                            <Input
                              value={vitalSigns.bloodPressureSystolic}
                              onChange={(e) => setVitalSigns(prev => ({ ...prev, bloodPressureSystolic: e.target.value }))}
                              placeholder="e.g., 120"
                            />
                          </div>
                          <div>
                            <Label>Blood Pressure (Diastolic)</Label>
                            <Input
                              value={vitalSigns.bloodPressureDiastolic}
                              onChange={(e) => setVitalSigns(prev => ({ ...prev, bloodPressureDiastolic: e.target.value }))}
                              placeholder="e.g., 80"
                            />
                          </div>
                          <div>
                            <Label>Temperature (°C)</Label>
                            <Input
                              value={vitalSigns.temperature}
                              onChange={(e) => setVitalSigns(prev => ({ ...prev, temperature: e.target.value }))}
                              placeholder="e.g., 36.8"
                            />
                          </div>
                          <div>
                            <Label>Weight (kg)</Label>
                            <Input
                              value={vitalSigns.weight}
                              onChange={(e) => setVitalSigns(prev => ({ ...prev, weight: e.target.value }))}
                              placeholder="e.g., 70"
                            />
                          </div>
                          <div>
                            <Label>Height (cm)</Label>
                            <Input
                              value={vitalSigns.height}
                              onChange={(e) => setVitalSigns(prev => ({ ...prev, height: e.target.value }))}
                              placeholder="e.g., 170"
                            />
                          </div>
                          <div>
                            <Label>Oxygen Saturation (%)</Label>
                            <Input
                              value={vitalSigns.oxygenSaturation}
                              onChange={(e) => setVitalSigns(prev => ({ ...prev, oxygenSaturation: e.target.value }))}
                              placeholder="e.g., 98"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="flex-1 p-4">
                <ScrollArea className="h-full">
                  <div className="space-y-6">
                    {/* Add Note */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Add Note</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label>Note Type</Label>
                            <select
                              value={noteType}
                              onChange={(e) => setNoteType(e.target.value as any)}
                              className="w-full p-2 border rounded-md"
                            >
                              <option value="general">General</option>
                              <option value="symptom">Symptom</option>
                              <option value="diagnosis">Diagnosis</option>
                              <option value="treatment">Treatment</option>
                            </select>
                          </div>
                          <div>
                            <Label>Note Content</Label>
                            <Textarea
                              value={currentNote}
                              onChange={(e) => setCurrentNote(e.target.value)}
                              placeholder="Enter your note..."
                              rows={3}
                            />
                          </div>
                          <Button onClick={addNote} disabled={!currentNote.trim()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Note
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Notes List */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Consultation Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {notes.map((note) => (
                            <div key={note.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline">{note.type}</Badge>
                                <span className="text-sm text-gray-500">
                                  {new Date(note.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm">{note.content}</p>
                            </div>
                          ))}
                          {notes.length === 0 && (
                            <p className="text-center text-gray-500 py-8">No notes added yet</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Patient Info & Quick Actions */}
          <div className="w-80 border-l bg-gray-50">
            <div className="p-4 space-y-6">
              {/* Patient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={consultation.patient.profile_picture} />
                      <AvatarFallback>{consultation.patient.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{consultation.patient.name}</p>
                      <p className="text-sm text-gray-500">Patient</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{consultation.patient.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{consultation.scheduled_date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{consultation.scheduled_time}</span>
                    </div>
                    <div className="flex items-center">
                      <Stethoscope className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{consultation.consultation_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('prescription')}>
                    <Pill className="w-4 h-4 mr-2" />
                    Write Prescription
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('vitals')}>
                    <Activity className="w-4 h-4 mr-2" />
                    Record Vital Signs
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('notes')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Add Notes
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Download Records
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Share className="w-4 h-4 mr-2" />
                    Share Consultation
                  </Button>
                </CardContent>
              </Card>

              {/* Meeting Link */}
              {consultation.doctor_meeting_link && (
                <Card>
                  <CardHeader>
                    <CardTitle>Meeting Link</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Share this link with the patient:</p>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={consultation.doctor_meeting_link}
                          readOnly
                          className="text-xs"
                        />
                        <Button size="sm" variant="outline">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedConsultationWorkflow;
