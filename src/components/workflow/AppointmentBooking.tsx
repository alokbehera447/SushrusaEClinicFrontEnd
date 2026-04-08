import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  User, 
  CreditCard, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Stethoscope,
  Star,
  Phone,
  Mail,
  MapPin,
  IndianRupee
} from 'lucide-react';

const AppointmentBooking = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [patientData, setPatientData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: ''
  });

  const steps = [
    { id: 1, title: 'Patient Details', icon: User },
    { id: 2, title: 'Select Doctor', icon: Stethoscope },
    { id: 3, title: 'Choose Time', icon: Clock },
    { id: 4, title: 'Payment', icon: CreditCard },
    { id: 5, title: 'Confirmation', icon: CheckCircle }
  ];

  const doctors = [
    {
      id: 1,
      name: 'Dr. Priya Singh',
      specialty: 'Cardiology',
      rating: 4.8,
      experience: '15 years',
      fee: 500,
      image: '/doctor-avatar-1.svg',
      nextAvailable: '10:30 AM'
    },
    {
      id: 2,
      name: 'Dr. Amit Kumar',
      specialty: 'General Medicine',
      rating: 4.6,
      experience: '12 years',
      fee: 400,
      image: '/doctor-avatar-2.svg',
      nextAvailable: '11:15 AM'
    },
    {
      id: 3,
      name: 'Dr. Neha Jain',
      specialty: 'Orthopedics',
      rating: 4.9,
      experience: '18 years',
      fee: 600,
      image: '/doctor-avatar-3.svg',
      nextAvailable: '2:00 PM'
    }
  ];

  const timeSlots = [
    { time: '9:00 AM', available: true },
    { time: '9:30 AM', available: false },
    { time: '10:00 AM', available: true },
    { time: '10:30 AM', available: true },
    { time: '11:00 AM', available: false },
    { time: '11:30 AM', available: true },
    { time: '2:00 PM', available: true },
    { time: '2:30 PM', available: true },
    { time: '3:00 PM', available: false },
    { time: '3:30 PM', available: true }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
    ));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-[#E17726] border-[#E17726] text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-4 transition-all duration-300 ${
                    currentStep > step.id ? 'bg-[#E17726]' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4">
            {steps.map((step) => (
              <div key={step.id} className="text-center">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-[#E17726]' : 'text-gray-400'
                }`}>
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-xl rounded-3xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold text-midnight">
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {/* Step 1: Patient Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <Input 
                      placeholder="Enter patient name"
                      value={patientData.name}
                      onChange={(e) => setPatientData({...patientData, name: e.target.value})}
                      className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <Input 
                      placeholder="+91 98765 43210"
                      value={patientData.phone}
                      onChange={(e) => setPatientData({...patientData, phone: e.target.value})}
                      className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <Input 
                      placeholder="patient@email.com"
                      value={patientData.email}
                      onChange={(e) => setPatientData({...patientData, email: e.target.value})}
                      className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <Input 
                      placeholder="25"
                      value={patientData.age}
                      onChange={(e) => setPatientData({...patientData, age: e.target.value})}
                      className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <div className="flex space-x-4">
                    {['Male', 'Female', 'Other'].map((gender) => (
                      <Button
                        key={gender}
                        variant={patientData.gender === gender ? 'default' : 'outline'}
                        onClick={() => setPatientData({...patientData, gender})}
                        className={`h-12 px-8 rounded-xl ${
                          patientData.gender === gender 
                            ? 'bg-[#E17726] hover:bg-[#c9651e] text-white' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {gender}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Select Doctor */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid gap-6">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor)}
                      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        selectedDoctor?.id === doctor.id
                          ? 'border-[#E17726] bg-[#E17726]/5'
                          : 'border-gray-200 hover:border-[#E17726]/50 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-16 h-16">
                            <AvatarFallback className="bg-[#E17726]/10 text-[#E17726] font-semibold text-lg">
                              {doctor.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-xl font-bold text-midnight">{doctor.name}</h3>
                            <p className="text-aqua font-medium">{doctor.specialty}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center">
                                {renderStars(doctor.rating)}
                                <span className="ml-2 text-sm font-medium text-gray-600">{doctor.rating}</span>
                              </div>
                              <span className="text-sm text-gray-600">{doctor.experience}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#E17726]">₹{doctor.fee}</div>
                          <p className="text-sm text-gray-600">Next: {doctor.nextAvailable}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Choose Time */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-midnight mb-2">Available Time Slots</h3>
                  <p className="text-gray-600">Select your preferred consultation time</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {timeSlots.map((slot, index) => (
                    <Button
                      key={index}
                      variant={selectedSlot?.time === slot.time ? 'default' : 'outline'}
                      disabled={!slot.available}
                      onClick={() => slot.available && setSelectedSlot(slot)}
                      className={`h-16 rounded-xl font-semibold ${
                        selectedSlot?.time === slot.time
                          ? 'bg-[#E17726] hover:bg-[#c9651e] text-white'
                          : slot.available
                          ? 'border-gray-300 text-gray-700 hover:border-[#E17726] hover:text-[#E17726]'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-sm">{slot.time}</div>
                        <div className="text-xs mt-1">
                          {slot.available ? 'Available' : 'Booked'}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-midnight mb-4">Booking Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Doctor:</span>
                      <span className="font-medium text-midnight">{selectedDoctor?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Specialty:</span>
                      <span className="font-medium text-midnight">{selectedDoctor?.specialty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium text-midnight">{selectedSlot?.time}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="text-lg font-bold text-midnight">Total Amount:</span>
                      <span className="text-2xl font-bold text-[#E17726]">₹{selectedDoctor?.fee}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-16 bg-[#E17726] hover:bg-[#c9651e] text-white rounded-xl font-semibold">
                    <IndianRupee className="w-5 h-5 mr-2" />
                    Pay with UPI
                  </Button>
                  <Button variant="outline" className="h-16 border-aqua text-aqua hover:bg-aqua hover:text-white rounded-xl font-semibold">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Debit/Credit Card
                  </Button>
                  <Button variant="outline" className="h-16 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl font-semibold">
                    Cash Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 5 && (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-midnight mb-2">Appointment Confirmed!</h3>
                  <p className="text-gray-600">Your consultation has been successfully booked</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-left">
                  <h4 className="font-bold text-midnight mb-4">Appointment Details</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Appointment ID:</span> APT-2024-001</p>
                    <p><span className="font-medium">Patient:</span> {patientData.name}</p>
                    <p><span className="font-medium">Doctor:</span> {selectedDoctor?.name}</p>
                    <p><span className="font-medium">Time:</span> {selectedSlot?.time}</p>
                    <p><span className="font-medium">Fee:</span> ₹{selectedDoctor?.fee}</p>
                  </div>
                </div>
                <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white px-8 py-3 rounded-xl">
                  Print Receipt
                </Button>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="border-gray-300 text-gray-700 hover:bg-gray-100 px-8 py-3 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < steps.length ? (
                <Button
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && (!patientData.name || !patientData.phone)) ||
                    (currentStep === 2 && !selectedDoctor) ||
                    (currentStep === 3 && !selectedSlot)
                  }
                  className="bg-[#E17726] hover:bg-[#c9651e] text-white px-8 py-3 rounded-xl"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-aqua hover:bg-aqua/90 text-white px-8 py-3 rounded-xl"
                >
                  Book Another
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentBooking; 