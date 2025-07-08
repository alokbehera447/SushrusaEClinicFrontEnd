import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from "date-fns";
import { CalendarIcon, Clock, User, Video, Phone, MapPin, DollarSign, Search, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const AppointmentBookingForm = () => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [consultationType, setConsultationType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [appointmentData, setAppointmentData] = useState({
    patientType: 'existing', // 'existing' or 'new'
    patientId: '',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    reason: '',
    urgency: 'routine',
    notes: '',
    paymentMethod: 'pay_later'
  });

  // Mock doctor data
  const doctors = [
    {
      id: 1,
      name: "Dr. Ramesh Kumar",
      specialty: "Cardiologist",
      experience: "15 years",
      rating: 4.9,
      reviews: 234,
      consultationFee: {
        inPerson: 800,
        video: 600,
        phone: 400
      },
      image: "/placeholder.svg",
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timeSlots: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00']
      },
      location: "Apollo Hospital, Mumbai"
    },
    {
      id: 2,
      name: "Dr. Priya Sharma",
      specialty: "Pediatrician",
      experience: "12 years",
      rating: 4.8,
      reviews: 189,
      consultationFee: {
        inPerson: 600,
        video: 450,
        phone: 300
      },
      image: "/placeholder.svg",
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        timeSlots: ['10:00', '10:30', '11:00', '11:30', '15:00', '15:30', '16:00', '16:30']
      },
      location: "Fortis Hospital, Delhi"
    },
    {
      id: 3,
      name: "Dr. Anil Verma",
      specialty: "Orthopedic",
      experience: "20 years",
      rating: 4.7,
      reviews: 156,
      consultationFee: {
        inPerson: 1000,
        video: 750,
        phone: 500
      },
      image: "/placeholder.svg",
      availability: {
        days: ['monday', 'wednesday', 'friday'],
        timeSlots: ['09:00', '09:30', '10:00', '14:00', '14:30', '15:00']
      },
      location: "Manipal Hospital, Bangalore"
    }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  const filteredDoctors = doctors.filter(doctor => {
    return (
      (searchTerm === '' || doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedSpecialty === '' || doctor.specialty === selectedSpecialty)
    );
  });

  const specialties = [...new Set(doctors.map(d => d.specialty))];

  const handleInputChange = (field: string, value: any) => {
    setAppointmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const appointmentDetails = {
      ...appointmentData,
      doctor: selectedDoctor,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      consultationType,
      fee: selectedDoctor?.consultationFee[consultationType as keyof typeof selectedDoctor.consultationFee]
    };

    // Simulate API call
    setTimeout(() => {
      console.log('Appointment booked:', appointmentDetails);
      alert('Appointment booked successfully!');
      setIsSubmitting(false);
      // Reset form or redirect
    }, 2000);
  };

  const getConsultationFee = () => {
    if (!selectedDoctor || !consultationType) return 0;
    return selectedDoctor.consultationFee[consultationType as keyof typeof selectedDoctor.consultationFee];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-midnight mb-2">Book Appointment</h2>
        <p className="text-gray-600">Schedule your consultation with our expert doctors</p>
      </div>

      {/* Step Progress */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3, 4].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step >= stepNum ? 'bg-[#E17726] text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNum}
            </div>
            {stepNum < 4 && (
              <div className={`w-16 h-1 mx-2 ${
                step > stepNum ? 'bg-[#E17726]' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Doctor Selection */}
      {step === 1 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-midnight">Select Doctor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Specialties</SelectItem>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Doctor List */}
            <div className="space-y-4">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => setSelectedDoctor(doctor)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedDoctor?.id === doctor.id
                      ? 'border-[#E17726] bg-[#E17726]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={doctor.image} alt={doctor.name} />
                      <AvatarFallback className="bg-[#E17726]/10 text-[#E17726] font-semibold text-lg">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg text-midnight">{doctor.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-semibold">{doctor.rating}</span>
                          <span className="text-gray-500">({doctor.reviews})</span>
                        </div>
                      </div>
                      <p className="text-[#E17726] font-semibold">{doctor.specialty}</p>
                      <p className="text-gray-600 text-sm">{doctor.experience} • {doctor.location}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="outline" className="text-xs">
                          In-person: ₹{doctor.consultationFee.inPerson}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Video: ₹{doctor.consultationFee.video}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Phone: ₹{doctor.consultationFee.phone}
                        </Badge>
                      </div>
                    </div>
                    {selectedDoctor?.id === doctor.id && (
                      <CheckCircle className="w-6 h-6 text-[#E17726]" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedDoctor}
                className="bg-[#E17726] hover:bg-[#c9651e] text-white px-8"
              >
                Next: Select Date & Time
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Date, Time & Consultation Type */}
      {step === 2 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-midnight">Select Date, Time & Consultation Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selected Doctor Info */}
            {selectedDoctor && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-[#E17726]/10 text-[#E17726] font-semibold">
                      {selectedDoctor.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-midnight">{selectedDoctor.name}</h4>
                    <p className="text-[#E17726] text-sm">{selectedDoctor.specialty}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Consultation Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Consultation Type *</Label>
              <RadioGroup value={consultationType} onValueChange={setConsultationType}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2 p-4 border rounded-xl hover:bg-gray-50">
                    <RadioGroupItem value="inPerson" id="inPerson" />
                    <Label htmlFor="inPerson" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">In-Person</span>
                        </div>
                        <span className="font-semibold text-[#E17726]">
                          ₹{selectedDoctor?.consultationFee.inPerson}
                        </span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-xl hover:bg-gray-50">
                    <RadioGroupItem value="video" id="video" />
                    <Label htmlFor="video" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Video className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Video Call</span>
                        </div>
                        <span className="font-semibold text-[#E17726]">
                          ₹{selectedDoctor?.consultationFee.video}
                        </span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-xl hover:bg-gray-50">
                    <RadioGroupItem value="phone" id="phone" />
                    <Label htmlFor="phone" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">Phone Call</span>
                        </div>
                        <span className="font-semibold text-[#E17726]">
                          ₹{selectedDoctor?.consultationFee.phone}
                        </span>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select Date *</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                  className="rounded-md border"
                />
              </div>

              {/* Time Slots */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Available Time Slots *</Label>
                <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                  {selectedDoctor?.availability.timeSlots.map((time: string) => (
                    <Button
                      key={time}
                      variant={selectedTimeSlot === time ? "default" : "outline"}
                      className={`h-10 text-sm ${
                        selectedTimeSlot === time
                          ? 'bg-[#E17726] hover:bg-[#c9651e] text-white'
                          : 'border-gray-300 hover:border-[#E17726]'
                      }`}
                      onClick={() => setSelectedTimeSlot(time)}
                    >
                      <Clock className="w-3 h-3 mr-2" />
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!consultationType || !selectedDate || !selectedTimeSlot}
                className="bg-[#E17726] hover:bg-[#c9651e] text-white px-8"
              >
                Next: Patient Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Patient Information */}
      {step === 3 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-midnight">Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Patient Type *</Label>
              <RadioGroup 
                value={appointmentData.patientType} 
                onValueChange={(value) => handleInputChange('patientType', value)}
              >
                <div className="flex space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="existing" id="existing" />
                    <Label htmlFor="existing">Existing Patient</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new">New Patient</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Patient Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appointmentData.patientType === 'existing' ? (
                <div className="space-y-2">
                  <Label htmlFor="patientId" className="text-sm font-medium">Patient ID *</Label>
                  <Input
                    id="patientId"
                    value={appointmentData.patientId}
                    onChange={(e) => handleInputChange('patientId', e.target.value)}
                    placeholder="Enter patient ID"
                    className="h-11"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="patientName" className="text-sm font-medium">Patient Name *</Label>
                    <Input
                      id="patientName"
                      value={appointmentData.patientName}
                      onChange={(e) => handleInputChange('patientName', e.target.value)}
                      placeholder="Enter patient name"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientPhone" className="text-sm font-medium">Phone Number *</Label>
                    <Input
                      id="patientPhone"
                      type="tel"
                      value={appointmentData.patientPhone}
                      onChange={(e) => handleInputChange('patientPhone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="h-11"
                    />
                  </div>
                </>
              )}
            </div>

            {appointmentData.patientType === 'new' && (
              <div className="space-y-2">
                <Label htmlFor="patientEmail" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="patientEmail"
                  type="email"
                  value={appointmentData.patientEmail}
                  onChange={(e) => handleInputChange('patientEmail', e.target.value)}
                  placeholder="patient@example.com"
                  className="h-11"
                />
              </div>
            )}

            {/* Appointment Details */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">Reason for Visit *</Label>
              <Textarea
                id="reason"
                value={appointmentData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                placeholder="Describe the reason for your visit"
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Urgency Level</Label>
                <Select 
                  value={appointmentData.urgency} 
                  onValueChange={(value) => handleInputChange('urgency', value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
              <Textarea
                id="notes"
                value={appointmentData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional information or special requests"
                className="min-h-[60px]"
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={
                  (appointmentData.patientType === 'existing' && !appointmentData.patientId) ||
                  (appointmentData.patientType === 'new' && (!appointmentData.patientName || !appointmentData.patientPhone)) ||
                  !appointmentData.reason
                }
                className="bg-[#E17726] hover:bg-[#c9651e] text-white px-8"
              >
                Next: Confirm & Pay
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirmation & Payment */}
      {step === 4 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-midnight">Confirm Appointment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Appointment Summary */}
            <div className="bg-gray-50 p-6 rounded-xl space-y-4">
              <h3 className="font-semibold text-lg text-midnight mb-4">Appointment Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Doctor</p>
                  <p className="font-semibold">{selectedDoctor?.name}</p>
                  <p className="text-sm text-[#E17726]">{selectedDoctor?.specialty}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold">
                    {selectedDate && format(selectedDate, "PPP")} at {selectedTimeSlot}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Consultation Type</p>
                  <p className="font-semibold capitalize">{consultationType?.replace(/([A-Z])/g, ' $1')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Patient</p>
                  <p className="font-semibold">
                    {appointmentData.patientType === 'existing' 
                      ? `ID: ${appointmentData.patientId}` 
                      : appointmentData.patientName
                    }
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Consultation Fee:</span>
                  <span className="text-2xl font-bold text-[#E17726]">₹{getConsultationFee()}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Payment Method *</Label>
              <RadioGroup 
                value={appointmentData.paymentMethod} 
                onValueChange={(value) => handleInputChange('paymentMethod', value)}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="pay_now" id="pay_now" />
                    <Label htmlFor="pay_now" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Pay Now (Online)</span>
                        <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="pay_later" id="pay_later" />
                    <Label htmlFor="pay_later" className="flex-1 cursor-pointer">
                      <span className="font-medium">Pay at Clinic</span>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#E17726] hover:bg-[#c9651e] text-white px-8"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Appointment
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AppointmentBookingForm; 