import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from "date-fns";
import { 
  Video, 
  Phone, 
  User, 
  CalendarIcon, 
  Clock, 
  DollarSign, 
  FileText, 
  AlertTriangle, 
  Save,
  Search,
  Plus,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminPatientApi, doctorApi, doctorSlotApi, DoctorSlotFrontend, PatientProfile, DoctorProfile } from '@/lib/api';
import { debounce } from 'lodash';

const ConsultationCreationForm = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    // Basic Consultation Info
    patientId: '',
    doctorId: '',
    consultationType: 'video', // video, phone, in-person
    consultationDate: undefined as Date | undefined,
    consultationTime: '',
    duration: '30', // minutes
    priority: 'normal', // low, normal, high, emergency
    
    // Consultation Details
    chiefComplaint: '',
    symptoms: '',
    medicalHistory: '',
    currentMedications: '',
    allergies: '',
    
    // Financial
    consultationFee: '',
    paymentMethod: 'cash',
    
    // Additional Info
    notes: '',
    followUpRequired: false,
    followUpDate: undefined as Date | undefined,
    referralRequired: false,
    referralTo: '',
    
    // Emergency Info
    isEmergency: false,
    emergencyContact: '',
    emergencyPhone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [patientOptions, setPatientOptions] = useState<PatientProfile[]>([]);
  const [doctorOptions, setDoctorOptions] = useState<DoctorProfile[]>([]);
  const [slotMonth, setSlotMonth] = useState<number | null>(null);
  const [slotYear, setSlotYear] = useState<number | null>(null);
  const [doctorSlots, setDoctorSlots] = useState<Record<string, DoctorSlotFrontend[]>>({});
  const [slotLoading, setSlotLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<DoctorSlotFrontend | null>(null);

  // Debounced patient search
  const debouncedPatientSearch = React.useMemo(() => debounce(async (query: string) => {
    if (!query) {
      // Fetch default patient list
      try {
        const res = await adminPatientApi.getPatients({ page: 1, page_size: 8 });
        setPatientOptions(Array.isArray(res?.results) ? res.results : []);
      } catch {
        setPatientOptions([]);
      }
      return;
    }
    try {
      const results = await adminPatientApi.searchPatients({ query });
      setPatientOptions(Array.isArray(results) ? results : []);
    } catch (e) {
      setPatientOptions([]);
    }
  }, 400), []);
  React.useEffect(() => {
    debouncedPatientSearch(patientSearch);
  }, [patientSearch]);

  // Debounced doctor search
  const debouncedDoctorSearch = React.useMemo(() => debounce(async (query: string) => {
    if (!query) {
      // Fetch default doctor list
      try {
        const res = await doctorApi.getDoctors({ is_active: true, is_verified: true });
        setDoctorOptions(Array.isArray(res) ? res.slice(0, 8) : []);
      } catch {
        setDoctorOptions([]);
      }
      return;
    }
    const results = await doctorApi.getDoctors({ search: query });
    setDoctorOptions(Array.isArray(results) ? results : []);
  }, 400), []);
  React.useEffect(() => {
    debouncedDoctorSearch(doctorSearch);
  }, [doctorSearch]);
  // Fetch slots after doctor selection
  React.useEffect(() => {
    if (!selectedDoctor) return;
    const today = new Date();
    const month = slotMonth ?? today.getMonth();
    const year = slotYear ?? today.getFullYear();
    setSlotLoading(true);
    // Use doctor user code (selectedDoctor.user) for slot API calls
    doctorSlotApi.getSlots(selectedDoctor.user, month, year).then(slots => {
      const grouped: Record<string, DoctorSlotFrontend[]> = {};
      slots.forEach(slot => {
        if (!grouped[slot.date]) grouped[slot.date] = [];
        grouped[slot.date].push(slot);
      });
      setDoctorSlots(grouped);
    }).finally(() => setSlotLoading(false));
  }, [selectedDoctor, slotMonth, slotYear]);

  const handleInputChange = (field: string, value: string | number | boolean | Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // API call to create consultation
      const consultationData = {
        ...formData,
        patient: selectedPatient,
        doctor: selectedDoctor,
        status: 'scheduled'
      };
      
      console.log('Creating consultation:', consultationData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Consultation created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating consultation:', error);
      alert('Failed to create consultation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConsultationFee = () => {
    const baseFee = formData.consultationType === 'video' ? 800 : 
                   formData.consultationType === 'phone' ? 600 : 1000;
    return baseFee;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-midnight mb-2">Create New Consultation</h2>
          <p className="text-gray-600">Schedule a consultation with patient and doctor</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Patient & Doctor Selection */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#E17726]/10 to-transparent">
            <CardTitle className="flex items-center text-xl font-bold text-midnight">
              <User className="w-5 h-5 mr-2 text-[#E17726]" />
              Patient & Doctor Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Patient Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Select Patient *</Label>
              <Input
                placeholder="Search patient by name, phone, or email"
                value={patientSearch}
                onChange={e => setPatientSearch(e.target.value)}
                className="mb-2"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(patientOptions || []).map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => {
                      setSelectedPatient(patient);
                      handleInputChange('patientId', patient.id);
                    }}
                    className={cn(
                      "p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md",
                      selectedPatient?.id === patient.id
                        ? "border-[#E17726] bg-[#E17726]/5"
                        : "border-gray-200 hover:border-[#E17726]/50"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#E17726]/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[#E17726]" />
                      </div>
                      <div>
                        <p className="font-medium text-midnight">{patient.user_name}</p>
                        <p className="text-sm text-gray-600">{patient.user_phone}</p>
                        <p className="text-xs text-gray-500">{patient.age ? `${patient.age} years, ` : ''}{patient.gender}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="border-dashed border-2 border-gray-300 text-gray-600 hover:border-[#E17726] hover:text-[#E17726]">
                <Plus className="w-4 h-4 mr-2" />
                Register New Patient
              </Button>
            </div>

            <Separator />

            {/* Doctor Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Select Doctor *</Label>
              <Input
                placeholder="Search doctor by name, specialization, etc."
                value={doctorSearch}
                onChange={e => setDoctorSearch(e.target.value)}
                className="mb-2"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {doctorOptions.map((doctor) => (
                  <div
                    key={doctor.id}
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      handleInputChange('doctorId', doctor.id);
                    }}
                    className={cn(
                      "p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md",
                      selectedDoctor?.id === doctor.id
                        ? "border-aqua bg-aqua/5"
                        : "border-gray-200 hover:border-aqua/50"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        "bg-aqua/10"
                      )}>
                        <User className={cn("w-5 h-5", "text-aqua")} />
                      </div>
                      <div>
                        <p className="font-medium text-midnight">{doctor.user_name}</p>
                        <p className="text-sm text-gray-600">{doctor.specialization}</p>
                        <Badge className={doctor.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {doctor.is_active ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consultation Details */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-transparent">
            <CardTitle className="flex items-center text-xl font-bold text-midnight">
              <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
              Consultation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Consultation Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Consultation Type *</Label>
                <RadioGroup 
                  value={formData.consultationType} 
                  onValueChange={(value) => handleInputChange('consultationType', value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="video" id="video" />
                    <Label htmlFor="video" className="flex items-center cursor-pointer">
                      <Video className="w-4 h-4 mr-2 text-blue-600" />
                      Video Call
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="phone" id="phone" />
                    <Label htmlFor="phone" className="flex items-center cursor-pointer">
                      <Phone className="w-4 h-4 mr-2 text-green-600" />
                      Phone Call
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="in-person" id="in-person" />
                    <Label htmlFor="in-person" className="flex items-center cursor-pointer">
                      <User className="w-4 h-4 mr-2 text-purple-600" />
                      In-Person
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Date & Time */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-11 justify-start text-left font-normal",
                        !formData.consultationDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.consultationDate ? format(formData.consultationDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.consultationDate}
                      onSelect={(date) => handleInputChange('consultationDate', date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Slot Picker: Show after doctor is selected */}
              {selectedDoctor && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Select Slot *</Label>
                  {/* Calendar and slot picker UI */}
                  <div className="flex flex-col gap-4">
                    {/* Month navigation */}
                    <div className="flex items-center gap-2 mb-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => {
                        if (slotMonth === null || slotYear === null) {
                          const today = new Date();
                          setSlotMonth(today.getMonth() - 1 < 0 ? 11 : today.getMonth() - 1);
                          setSlotYear(today.getMonth() - 1 < 0 ? today.getFullYear() - 1 : today.getFullYear());
                        } else {
                          setSlotMonth(slotMonth - 1 < 0 ? 11 : slotMonth - 1);
                          setSlotYear(slotMonth - 1 < 0 ? slotYear - 1 : slotYear);
                        }
                      }}>Prev</Button>
                      <span className="font-semibold">
                        {(() => {
                          const m = slotMonth !== null ? slotMonth : new Date().getMonth();
                          const y = slotYear !== null ? slotYear : new Date().getFullYear();
                          return `${new Date(y, m, 1).toLocaleString('default', { month: 'long' })} ${y}`;
                        })()}
                      </span>
                      <Button type="button" size="sm" variant="outline" onClick={() => {
                        if (slotMonth === null || slotYear === null) {
                          const today = new Date();
                          setSlotMonth(today.getMonth() + 1 > 11 ? 0 : today.getMonth() + 1);
                          setSlotYear(today.getMonth() + 1 > 11 ? today.getFullYear() + 1 : today.getFullYear());
                        } else {
                          setSlotMonth(slotMonth + 1 > 11 ? 0 : slotMonth + 1);
                          setSlotYear(slotMonth + 1 > 11 ? slotYear + 1 : slotYear);
                        }
                      }}>Next</Button>
                    </div>
                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1 bg-gray-50 rounded-xl p-2 border border-gray-200">
                      {[ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ].map(d => (
                        <div key={d} className="font-semibold text-gray-600 py-1 text-xs">{d}</div>
                      ))}
                      {/* Empty cells for first week */}
                      {(() => {
                        const m = slotMonth !== null ? slotMonth : new Date().getMonth();
                        const y = slotYear !== null ? slotYear : new Date().getFullYear();
                        const firstDay = new Date(y, m, 1).getDay();
                        return Array(firstDay).fill(null).map((_, i) => <div key={'empty-'+i}></div>);
                      })()}
                      {/* Days */}
                      {(() => {
                        const m = slotMonth !== null ? slotMonth : new Date().getMonth();
                        const y = slotYear !== null ? slotYear : new Date().getFullYear();
                        const daysInMonth = new Date(y, m + 1, 0).getDate();
                        return Array(daysInMonth).fill(null).map((_, i) => {
                          const day = i + 1;
                          const dateKey = `${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                          const slots = doctorSlots[dateKey] || [];
                          const hasSlots = slots.length > 0;
                          return (
                            <button
                              key={day}
                              className={`rounded-lg py-2 w-full border font-semibold transition-all relative text-xs
                                ${hasSlots ? 'bg-blue-300 border-blue-400 text-blue-900' : 'bg-white border-gray-200 text-gray-900'}
                                hover:bg-[#E17726]/20
                              `}
                              onClick={() => setFormData(prev => ({ ...prev, consultationDate: new Date(y, m, day) }))}
                              type="button"
                            >
                              {day}
                            </button>
                          );
                        });
                      })()}
                    </div>
                    {/* Slot buttons for selected date */}
                    {formData.consultationDate && (() => {
                      const y = formData.consultationDate.getFullYear();
                      const m = formData.consultationDate.getMonth();
                      const d = formData.consultationDate.getDate();
                      const dateKey = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                      const slots = doctorSlots[dateKey] || [];
                      if (slotLoading) return <div>Loading slots...</div>;
                      if (!slots.length) return <div className="text-gray-500 text-xs">No available slots for this date.</div>;
                      return (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {slots.map(slot => (
                            <Button
                              key={slot.id}
                              type="button"
                              size="sm"
                              variant={selectedSlot?.id === slot.id ? 'default' : 'outline'}
                              className={selectedSlot?.id === slot.id ? 'bg-[#E17726] text-white' : ''}
                              onClick={() => {
                                setSelectedSlot(slot);
                                handleInputChange('consultationTime', slot.startTime);
                              }}
                            >
                              {slot.startTime} - {slot.endTime}
                            </Button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">Duration</Label>
                <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority Level</Label>
              <RadioGroup 
                value={formData.priority} 
                onValueChange={(value) => handleInputChange('priority', value)}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="text-green-600">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="normal" />
                  <Label htmlFor="normal" className="text-blue-600">Normal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="text-orange-600">High</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="emergency" id="emergency" />
                  <Label htmlFor="emergency" className="text-red-600">Emergency</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Emergency Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isEmergency" 
                checked={formData.isEmergency}
                onCheckedChange={(checked) => handleInputChange('isEmergency', checked)}
              />
              <Label htmlFor="isEmergency" className="text-red-600 font-medium">Mark as Emergency Consultation</Label>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500/10 to-transparent">
            <CardTitle className="flex items-center text-xl font-bold text-midnight">
              <FileText className="w-5 h-5 mr-2 text-green-600" />
              Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="chiefComplaint" className="text-sm font-medium">Chief Complaint *</Label>
              <Textarea
                id="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
                placeholder="Describe the main reason for consultation..."
                className="min-h-[80px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms" className="text-sm font-medium">Symptoms</Label>
              <Textarea
                id="symptoms"
                value={formData.symptoms}
                onChange={(e) => handleInputChange('symptoms', e.target.value)}
                placeholder="List any symptoms..."
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-transparent">
            <CardTitle className="flex items-center text-xl font-bold text-midnight">
              <DollarSign className="w-5 h-5 mr-2 text-yellow-600" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="consultationFee" className="text-sm font-medium">Consultation Fee</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    id="consultationFee"
                    value={getConsultationFee()}
                    onChange={(e) => handleInputChange('consultationFee', e.target.value)}
                    className="h-11 pl-8"
                    readOnly
                  />
                </div>
                <p className="text-xs text-gray-500">Base fee for {formData.consultationType} consultation</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Payment Method</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Follow-up & Additional Info */}
        {/* 
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent">
            <CardTitle className="flex items-center text-xl font-bold text-midnight">
              <Clock className="w-5 h-5 mr-2 text-purple-600" />
              Follow-up & Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="followUpRequired" 
                  checked={formData.followUpRequired}
                  onCheckedChange={(checked) => handleInputChange('followUpRequired', checked)}
                />
                <Label htmlFor="followUpRequired">Follow-up Required</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="referralRequired" 
                  checked={formData.referralRequired}
                  onCheckedChange={(checked) => handleInputChange('referralRequired', checked)}
                />
                <Label htmlFor="referralRequired">Referral Required</Label>
              </div>
            </div>

            {formData.followUpRequired && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Follow-up Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-11 justify-start text-left font-normal",
                        !formData.followUpDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.followUpDate ? format(formData.followUpDate, "PPP") : "Pick follow-up date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.followUpDate}
                      onSelect={(date) => handleInputChange('followUpDate', date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {formData.referralRequired && (
              <div className="space-y-2">
                <Label htmlFor="referralTo" className="text-sm font-medium">Refer to Specialist</Label>
                <Input
                  id="referralTo"
                  value={formData.referralTo}
                  onChange={(e) => handleInputChange('referralTo', e.target.value)}
                  placeholder="Specialist name or department"
                  className="h-11"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes or special instructions..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>
        */}

        {/* Emergency Contact (if emergency) */}
        {formData.isEmergency && (
          <Card className="border-0 shadow-lg border-red-200">
            <CardHeader className="bg-gradient-to-r from-red-500/10 to-transparent">
              <CardTitle className="flex items-center text-xl font-bold text-red-600">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Emergency Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="text-sm font-medium">Emergency Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="Emergency contact person name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone" className="text-sm font-medium">Emergency Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    placeholder="Emergency contact phone number"
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !selectedPatient || !selectedDoctor || !formData.consultationDate || !formData.consultationTime}
            className="bg-[#E17726] hover:bg-[#c9651e] text-white"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Consultation
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ConsultationCreationForm; 