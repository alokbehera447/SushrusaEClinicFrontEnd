import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Calendar, Clock, User, Phone, Mail, MapPin, CreditCard, ArrowRight, CheckCircle, Star } from 'lucide-react';

interface BookConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookConsultationModal: React.FC<BookConsultationModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    symptoms: '',
    specialty: '',
    date: '',
    time: '',
    consultationType: 'video'
  });

  const specialties = [
    'General Medicine', 'Cardiology', 'Dermatology', 'Pediatrics', 
    'Orthopedics', 'Neurology', 'Gynecology', 'Psychiatry'
  ];

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'
  ];

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-midnight mb-2">Personal Information</h3>
        <p className="text-gray-600">Please provide your basic details</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-midnight mb-2">Full Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-2 focus:ring-[#E17726]/20 outline-none transition-all"
            placeholder="Enter your full name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-midnight mb-2">Age *</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-2 focus:ring-[#E17726]/20 outline-none transition-all"
            placeholder="Your age"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-midnight mb-2">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-2 focus:ring-[#E17726]/20 outline-none transition-all"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-midnight mb-2">Phone Number *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-2 focus:ring-[#E17726]/20 outline-none transition-all"
            placeholder="+91 9876543210"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-midnight mb-2">Gender *</label>
        <div className="grid grid-cols-3 gap-3">
          {['Male', 'Female', 'Other'].map((gender) => (
            <label key={gender} className="flex items-center p-3 rounded-xl border border-gray-300 cursor-pointer hover:border-[#E17726] transition-colors">
              <input
                type="radio"
                name="gender"
                value={gender}
                checked={formData.gender === gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 mr-3 ${formData.gender === gender ? 'bg-[#E17726] border-[#E17726]' : 'border-gray-300'}`}></div>
              <span className="text-sm font-medium">{gender}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-midnight mb-2">Medical Information</h3>
        <p className="text-gray-600">Help us understand your health concerns</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-midnight mb-2">Select Specialty *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {specialties.map((specialty) => (
            <label key={specialty} className="flex items-center p-3 rounded-xl border border-gray-300 cursor-pointer hover:border-[#E17726] transition-colors">
              <input
                type="radio"
                name="specialty"
                value={specialty}
                checked={formData.specialty === specialty}
                onChange={(e) => handleInputChange('specialty', e.target.value)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 mr-3 ${formData.specialty === specialty ? 'bg-[#E17726] border-[#E17726]' : 'border-gray-300'}`}></div>
              <span className="text-xs font-medium">{specialty}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-midnight mb-2">Describe Your Symptoms *</label>
        <textarea
          value={formData.symptoms}
          onChange={(e) => handleInputChange('symptoms', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-2 focus:ring-[#E17726]/20 outline-none transition-all resize-none"
          placeholder="Please describe your symptoms, duration, and any specific concerns..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-midnight mb-2">Consultation Type *</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { type: 'video', label: 'Video Call', icon: '📹', price: '₹800' },
            { type: 'audio', label: 'Voice Call', icon: '📞', price: '₹600' }
          ].map(({ type, label, icon, price }) => (
            <label key={type} className="flex items-center p-4 rounded-xl border border-gray-300 cursor-pointer hover:border-[#E17726] transition-colors">
              <input
                type="radio"
                name="consultationType"
                value={type}
                checked={formData.consultationType === type}
                onChange={(e) => handleInputChange('consultationType', e.target.value)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 mr-3 ${formData.consultationType === type ? 'bg-[#E17726] border-[#E17726]' : 'border-gray-300'}`}></div>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-xl mr-2">{icon}</span>
                  <span className="font-semibold">{label}</span>
                </div>
                <div className="text-[#E17726] font-bold">{price}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-midnight mb-2">Schedule Appointment</h3>
        <p className="text-gray-600">Choose your preferred date and time</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-midnight mb-2">Select Date *</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-2 focus:ring-[#E17726]/20 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-midnight mb-2">Select Time Slot *</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
          {timeSlots.map((time) => (
            <label key={time} className="flex items-center justify-center p-3 rounded-xl border border-gray-300 cursor-pointer hover:border-[#E17726] transition-colors">
              <input
                type="radio"
                name="time"
                value={time}
                checked={formData.time === time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="sr-only"
              />
              <div className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${formData.time === time ? 'bg-[#E17726] text-white' : 'text-gray-700'}`}>
                {time}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-midnight mb-2">Booking Confirmed!</h3>
        <p className="text-gray-600">Your consultation has been successfully booked</p>
      </div>

      <div className="bg-gradient-to-r from-[#E17726]/10 to-cyan-400/10 rounded-2xl p-6">
        <h4 className="font-bold text-midnight mb-4">Appointment Details</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-center">
            <User className="w-4 h-4 text-[#E17726] mr-3" />
            <span><strong>Patient:</strong> {formData.name}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-[#E17726] mr-3" />
            <span><strong>Date:</strong> {formData.date}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-[#E17726] mr-3" />
            <span><strong>Time:</strong> {formData.time}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 text-[#E17726] mr-3" />
            <span><strong>Type:</strong> {formData.consultationType === 'video' ? 'Video Call' : 'Voice Call'}</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          You'll receive a confirmation email with the meeting link shortly.
        </p>
        <Button 
          onClick={onClose}
          className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] text-white px-8 py-3 rounded-xl font-bold"
        >
          Done
        </Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-[#E17726]/10 to-cyan-400/10 p-8 pb-6">
          <h2 className="text-3xl font-black text-midnight mb-2">Book Consultation</h2>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-2 mt-6">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex-1">
                <div className={`h-2 rounded-full transition-colors ${step >= stepNum ? 'bg-[#E17726]' : 'bg-gray-200'}`}></div>
                <div className={`text-xs font-medium mt-1 ${step >= stepNum ? 'text-[#E17726]' : 'text-gray-400'}`}>
                  {stepNum === 1 ? 'Personal' : stepNum === 2 ? 'Medical' : stepNum === 3 ? 'Schedule' : 'Confirm'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          {/* Navigation Buttons */}
          {step < 4 && (
            <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
              {step > 1 ? (
                <Button 
                  onClick={prevStep}
                  variant="outline"
                  className="px-6 py-2 rounded-xl"
                >
                  Previous
                </Button>
              ) : <div></div>}
              
              <Button 
                onClick={step === 3 ? () => setStep(4) : nextStep}
                className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] text-white px-8 py-2 rounded-xl font-bold"
              >
                {step === 3 ? 'Book Now' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookConsultationModal;