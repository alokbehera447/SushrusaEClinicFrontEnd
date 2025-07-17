import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from "date-fns";
import { CalendarIcon, Plus, Minus, Search, FileText, User, Stethoscope, Pill, Clock, AlertTriangle, CheckCircle, Printer, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Medication {
  id: string;
  name: string;
  strength: string;
  form: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  beforeFood: boolean;
}

// Define patient type
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
}

// Define drug type
interface Drug {
  name: string;
  strength: string;
  form: string;
}

const PrescriptionWriterForm = () => {
  const [prescriptionData, setPrescriptionData] = useState({
    patientId: '',
    patientName: '',
    patientAge: '',
    patientGender: '',
    patientPhone: '',
    
    // Consultation Details
    chiefComplaint: '',
    diagnosis: '',
    symptoms: '',
    examination: '',
    
    // Follow-up
    followUpDate: undefined as Date | undefined,
    followUpInstructions: '',
    
    // Additional
    generalInstructions: '',
    doctorNotes: '',
    urgentMedication: false
  });

  const [medications, setMedications] = useState<Medication[]>([]);
  const [drugSearch, setDrugSearch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [header, setHeader] = useState('Sushrusa eClinic\nAddress: ...\nContact: ...');
  const [body, setBody] = useState('');
  const [footer, setFooter] = useState('Thank you for visiting Sushrusa eClinic!\nFor emergencies, call ...');

  // Mock patient data
  const patients: Patient[] = [
    { id: 'PAT001', name: 'Rahul Sharma', age: 34, gender: 'Male', phone: '+91 98765 43210' },
    { id: 'PAT002', name: 'Anita Devi', age: 28, gender: 'Female', phone: '+91 87654 32109' },
    { id: 'PAT003', name: 'Suresh Gupta', age: 45, gender: 'Male', phone: '+91 76543 21098' }
  ];

  // Mock drug database
  const drugs: Drug[] = [
    { name: 'Paracetamol', strength: '500mg', form: 'Tablet' },
    { name: 'Amoxicillin', strength: '250mg', form: 'Capsule' },
    { name: 'Ibuprofen', strength: '400mg', form: 'Tablet' },
    { name: 'Cetirizine', strength: '10mg', form: 'Tablet' },
    { name: 'Omeprazole', strength: '20mg', form: 'Capsule' },
    { name: 'Metformin', strength: '500mg', form: 'Tablet' },
    { name: 'Aspirin', strength: '75mg', form: 'Tablet' },
    { name: 'Dextromethorphan', strength: '15mg', form: 'Syrup' },
    { name: 'Salbutamol', strength: '100mcg', form: 'Inhaler' },
    { name: 'Prednisolone', strength: '5mg', form: 'Tablet' }
  ];

  const filteredDrugs = drugs.filter(drug =>
    drug.name.toLowerCase().includes(drugSearch.toLowerCase())
  );

  const searchPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(prescriptionData.patientId.toLowerCase()) ||
    patient.id.toLowerCase().includes(prescriptionData.patientId.toLowerCase())
  );

  const selectPatient = (patient: Patient) => {
    setPrescriptionData(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.age.toString(),
      patientGender: patient.gender,
      patientPhone: patient.phone
    }));
  };

  const addMedication = (drug?: Drug) => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: drug ? drug.name : '',
      strength: drug ? drug.strength : '',
      form: drug ? drug.form : '',
      dosage: '1',
      frequency: 'twice daily',
      duration: '5 days',
      instructions: '',
      beforeFood: false
    };
    setMedications([...medications, newMedication]);
    setDrugSearch('');
  };

  const updateMedication = (id: string, field: keyof Medication, value: string | boolean) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const handleInputChange = (field: string, value: string | number | boolean | Date | undefined) => {
    setPrescriptionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generatePrescription = async () => {
    setIsGenerating(true);
    
    const prescription = {
      ...prescriptionData,
      medications,
      prescriptionDate: new Date().toISOString(),
      doctorName: 'Dr. Ramesh Kumar', // This would come from authentication
      clinicName: 'Sushrusa eClinic',
      prescriptionId: `RX${Date.now()}`
    };

    // Simulate generation
    setTimeout(() => {
      console.log('Prescription generated:', prescription);
      alert('Prescription generated successfully!');
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-midnight mb-2">Digital Prescription</h2>
        <p className="text-gray-600">Create and manage patient prescriptions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Patient & Consultation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-transparent">
              <CardTitle className="flex items-center text-xl font-bold text-midnight">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search patient by name or ID..."
                  value={prescriptionData.patientId}
                  onChange={(e) => handleInputChange('patientId', e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              {prescriptionData.patientId && searchPatients.length > 0 && !prescriptionData.patientName && (
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                  {searchPatients.map(patient => (
                    <div
                      key={patient.id}
                      onClick={() => selectPatient(patient)}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{patient.name}</p>
                        <p className="text-xs text-gray-500">{patient.id} • {patient.age}y • {patient.gender}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {prescriptionData.patientName && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-green-100 text-green-700">
                        {prescriptionData.patientName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-green-800">{prescriptionData.patientName}</h4>
                      <p className="text-sm text-green-600">
                        {prescriptionData.patientId} • {prescriptionData.patientAge}y • {prescriptionData.patientGender}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clinical Assessment */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#E17726]/10 to-transparent">
              <CardTitle className="flex items-center text-xl font-bold text-midnight">
                <Stethoscope className="w-5 h-5 mr-2 text-[#E17726]" />
                Clinical Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="chiefComplaint" className="text-sm font-medium">Chief Complaint *</Label>
                <Textarea
                  id="chiefComplaint"
                  value={prescriptionData.chiefComplaint}
                  onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
                  placeholder="Primary reason for the visit"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms" className="text-sm font-medium">Symptoms</Label>
                <Textarea
                  id="symptoms"
                  value={prescriptionData.symptoms}
                  onChange={(e) => handleInputChange('symptoms', e.target.value)}
                  placeholder="List of symptoms observed or reported"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="examination" className="text-sm font-medium">Physical Examination</Label>
                <Textarea
                  id="examination"
                  value={prescriptionData.examination}
                  onChange={(e) => handleInputChange('examination', e.target.value)}
                  placeholder="Physical examination findings"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis" className="text-sm font-medium">Diagnosis *</Label>
                <Textarea
                  id="diagnosis"
                  value={prescriptionData.diagnosis}
                  onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                  placeholder="Primary and secondary diagnosis"
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Medications */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-green-500/10 to-transparent">
              <CardTitle className="flex items-center text-xl font-bold text-midnight">
                <Pill className="w-5 h-5 mr-2 text-green-600" />
                Medications
              </CardTitle>
              <Button onClick={() => addMedication()} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Drug Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search for medications..."
                  value={drugSearch}
                  onChange={(e) => setDrugSearch(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              {drugSearch && filteredDrugs.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                  {filteredDrugs.map((drug, index) => (
                    <div
                      key={index}
                      onClick={() => addMedication(drug)}
                      className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                    >
                      <div>
                        <p className="font-medium text-sm">{drug.name}</p>
                        <p className="text-xs text-gray-500">{drug.strength} • {drug.form}</p>
                      </div>
                      <Plus className="w-4 h-4 text-green-600" />
                    </div>
                  ))}
                </div>
              )}

              {/* Medications List */}
              <div className="space-y-4">
                {medications.map((medication, index) => (
                  <div key={medication.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-midnight">Medication {index + 1}</h4>
                      <Button
                        onClick={() => removeMedication(medication.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">Medicine Name</Label>
                        <Input
                          value={medication.name}
                          onChange={(e) => updateMedication(medication.id, 'name', e.target.value)}
                          placeholder="Medicine name"
                          className="h-9"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">Strength</Label>
                        <Input
                          value={medication.strength}
                          onChange={(e) => updateMedication(medication.id, 'strength', e.target.value)}
                          placeholder="500mg"
                          className="h-9"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">Form</Label>
                        <Select
                          value={medication.form}
                          onValueChange={(value) => updateMedication(medication.id, 'form', value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select form" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Tablet">Tablet</SelectItem>
                            <SelectItem value="Capsule">Capsule</SelectItem>
                            <SelectItem value="Syrup">Syrup</SelectItem>
                            <SelectItem value="Injection">Injection</SelectItem>
                            <SelectItem value="Ointment">Ointment</SelectItem>
                            <SelectItem value="Inhaler">Inhaler</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">Dosage</Label>
                        <Input
                          value={medication.dosage}
                          onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                          placeholder="1"
                          className="h-9"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">Frequency</Label>
                        <Select
                          value={medication.frequency}
                          onValueChange={(value) => updateMedication(medication.id, 'frequency', value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once daily">Once daily</SelectItem>
                            <SelectItem value="twice daily">Twice daily</SelectItem>
                            <SelectItem value="thrice daily">Thrice daily</SelectItem>
                            <SelectItem value="four times daily">Four times daily</SelectItem>
                            <SelectItem value="as needed">As needed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">Duration</Label>
                        <Input
                          value={medication.duration}
                          onChange={(e) => updateMedication(medication.id, 'duration', e.target.value)}
                          placeholder="5 days"
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Instructions</Label>
                      <Input
                        value={medication.instructions}
                        onChange={(e) => updateMedication(medication.id, 'instructions', e.target.value)}
                        placeholder="Take with water"
                        className="h-9"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`beforeFood-${medication.id}`}
                        checked={medication.beforeFood}
                        onChange={(e) => updateMedication(medication.id, 'beforeFood', e.target.checked)}
                        className="w-4 h-4 text-[#E17726] focus:ring-[#E17726]"
                      />
                      <Label htmlFor={`beforeFood-${medication.id}`} className="text-sm">Take before food</Label>
                    </div>
                  </div>
                ))}

                {medications.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Pill className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No medications added yet</p>
                    <Button onClick={() => addMedication()} size="sm" className="mt-2 bg-green-600 hover:bg-green-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Medication
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          {/* Follow-up */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold text-midnight">
                <Clock className="w-5 h-5 mr-2 text-[#E17726]" />
                Follow-up
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Follow-up Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-10 justify-start text-left font-normal",
                        !prescriptionData.followUpDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {prescriptionData.followUpDate ? format(prescriptionData.followUpDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={prescriptionData.followUpDate}
                      onSelect={(date) => handleInputChange('followUpDate', date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="followUpInstructions" className="text-sm font-medium">Follow-up Instructions</Label>
                <Textarea
                  id="followUpInstructions"
                  value={prescriptionData.followUpInstructions}
                  onChange={(e) => handleInputChange('followUpInstructions', e.target.value)}
                  placeholder="Instructions for next visit"
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* General Instructions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-midnight">General Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="generalInstructions" className="text-sm font-medium">Patient Instructions</Label>
                <Textarea
                  id="generalInstructions"
                  value={prescriptionData.generalInstructions}
                  onChange={(e) => handleInputChange('generalInstructions', e.target.value)}
                  placeholder="General care instructions for patient"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctorNotes" className="text-sm font-medium">Doctor's Notes</Label>
                <Textarea
                  id="doctorNotes"
                  value={prescriptionData.doctorNotes}
                  onChange={(e) => handleInputChange('doctorNotes', e.target.value)}
                  placeholder="Private notes for future reference"
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="urgentMedication"
                  checked={prescriptionData.urgentMedication}
                  onChange={(e) => handleInputChange('urgentMedication', e.target.checked)}
                  className="w-4 h-4 text-red-600 focus:ring-red-600"
                />
                <Label htmlFor="urgentMedication" className="text-sm flex items-center text-red-600">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Mark as urgent
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-midnight">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={generatePrescription}
                disabled={
                  isGenerating || 
                  !prescriptionData.patientName || 
                  !prescriptionData.chiefComplaint || 
                  !prescriptionData.diagnosis ||
                  medications.length === 0
                }
                className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white h-12 text-lg font-semibold"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Generate Prescription
                  </>
                )}
              </Button>

              <Button variant="outline" className="w-full border-gray-300">
                <Printer className="w-4 h-4 mr-2" />
                Print Preview
              </Button>

              <Button variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
                <Send className="w-4 h-4 mr-2" />
                Send to Patient
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New: Header, Body, Footer fields */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-400/10 to-transparent">
          <CardTitle className="flex items-center text-xl font-bold text-midnight">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Prescription Format (Header, Body, Footer)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="header" className="text-sm font-medium">Header (eClinic Info)</Label>
            <Textarea
              id="header"
              value={header}
              onChange={(e) => setHeader(e.target.value)}
              placeholder="Clinic name, address, contact, etc."
              className="min-h-[60px] font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body" className="text-sm font-medium">Body (Editable Prescription Content)</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write diagnosis, medicines, instructions, etc. here as free text."
              className="min-h-[120px] font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="footer" className="text-sm font-medium">Footer (eClinic Info)</Label>
            <Textarea
              id="footer"
              value={footer}
              onChange={(e) => setFooter(e.target.value)}
              placeholder="Footer info, disclaimers, etc."
              className="min-h-[60px] font-mono"
            />
          </div>
        </CardContent>
      </Card>

      {/* Right Column - Preview */}
      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-400/10 to-transparent">
            <CardTitle className="flex items-center text-xl font-bold text-midnight">
              <Printer className="w-5 h-5 mr-2 text-gray-600" />
              Prescription Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-white border rounded-lg p-4 space-y-4 font-serif">
              {/* Header */}
              <div className="text-center border-b pb-2 whitespace-pre-line text-lg font-bold text-blue-900">
                {header}
              </div>
              {/* Body (free text) */}
              {body && (
                <div className="whitespace-pre-line py-2 text-base text-gray-900">
                  {body}
                </div>
              )}
              {/* Structured fields preview */}
              <div className="py-2 text-base text-gray-900">
                <div><b>Patient:</b> {prescriptionData.patientName} ({prescriptionData.patientId})</div>
                <div><b>Age/Gender:</b> {prescriptionData.patientAge} / {prescriptionData.patientGender}</div>
                <div><b>Diagnosis:</b> {prescriptionData.diagnosis}</div>
                <div><b>Symptoms:</b> {prescriptionData.symptoms}</div>
                <div><b>Medications:</b></div>
                <ul className="list-disc ml-6">
                  {medications.map((med, idx) => (
                    <li key={med.id}>
                      {med.name} {med.strength} {med.form} - {med.dosage}, {med.frequency}, {med.duration} {med.beforeFood ? '(Before Food)' : ''} {med.instructions && `- ${med.instructions}`}
                    </li>
                  ))}
                </ul>
                <div><b>General Instructions:</b> {prescriptionData.generalInstructions}</div>
                <div><b>Follow-up:</b> {prescriptionData.followUpDate ? `Yes, on ${format(prescriptionData.followUpDate, "PPP")}` : 'No'}</div>
              </div>
              {/* Footer */}
              <div className="text-center border-t pt-2 whitespace-pre-line text-sm text-gray-700">
                {footer}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrescriptionWriterForm; 