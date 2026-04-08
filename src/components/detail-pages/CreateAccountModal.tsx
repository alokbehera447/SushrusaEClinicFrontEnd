import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, User, Phone, Mail, MapPin, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { publicApi, extractErrorMessage, type PublicPatientRegistrationData, type PublicPatientRegistrationResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAccountModal: React.FC<CreateAccountModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationResponse, setRegistrationResponse] = useState<PublicPatientRegistrationResponse | null>(null);
  const { toast } = useToast();

  if (!isOpen) return null;

  // Reset form when modal is closed
  const handleClose = () => {
    setStep(1);
    setFormData({
      name: '',
      email: '',
      phone: '',
      age: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    });
    setErrors({});
    setRegistrationResponse(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[1-9]\d{9,14}$/.test(formData.phone.replace(/\s+/g, ''))) newErrors.phone = 'Please enter a valid phone number';
    if (!formData.age.trim()) newErrors.age = 'Age is required';
    else if (parseInt(formData.age) < 1 || parseInt(formData.age) > 120) newErrors.age = 'Please enter a valid age';
    if (!formData.gender) newErrors.gender = 'Please select gender';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Please enter a valid 6-digit pincode';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare the registration data
      const registrationData: PublicPatientRegistrationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        age: parseInt(formData.age),
        gender: formData.gender,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        country: 'India'
      };

      // Call the API
      const response = await publicApi.registerPatient(registrationData);
      setRegistrationResponse(response);
      
      // Show success toast
      toast({
        title: "Account Created Successfully!",
        description: "Welcome to Sushrusa eClinic. Please visit your nearest eClinic to book consultations.",
      });
      
      setStep(3);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Extract error message
      const errorMessage = extractErrorMessage(error);
      
      // Show error toast
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });

      // Handle field-specific errors
      if (error.response?.data) {
        const responseData = error.response.data;
        if (typeof responseData === 'object') {
          const fieldErrors: Record<string, string> = {};
          
          // Map backend field errors to frontend field names
          Object.entries(responseData).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              fieldErrors[key] = value[0] as string;
            }
          });
          
          setErrors(fieldErrors);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-midnight mb-2">Personal Information</h3>
        <p className="text-gray-600">Please provide your basic details to create your account</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-midnight mb-2">Full Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-[#E17726]'} focus:ring-2 focus:ring-[#E17726]/20 outline-none transition-all`}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-midnight mb-2">Age *</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${errors.age ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-[#E17726]'} focus:ring-2 focus:ring-[#E17726]/20 outline-none transition-all`}
            placeholder="Your age"
            min="1"
            max="120"
          />
          {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-midnight mb-2">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-[#E17726]'} focus:ring-2 focus:ring-[#E17726]/20 outline-none transition-all`}
            placeholder="your.email@example.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-midnight mb-2">Phone Number *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-[#E17726]'} focus:ring-2 focus:ring-[#E17726]/20 outline-none transition-all`}
            placeholder="+91 9876543210"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-midnight mb-2">Gender *</label>
        <div className="grid grid-cols-3 gap-3">
          {['Male', 'Female', 'Other'].map((gender) => (
            <label key={gender} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.gender === gender ? 'border-[#E17726] bg-[#E17726]/5' : errors.gender ? 'border-red-300 hover:border-red-400' : 'border-gray-300 hover:border-[#E17726]'}`}>
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
        {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-midnight mb-2">Address Information</h3>
        <p className="text-gray-600">Help us locate the nearest eClinic for you</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-midnight mb-2">Full Address *</label>
        <textarea
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          rows={3}
          className={`w-full px-4 py-3 rounded-xl border ${errors.address ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-[#E17726]'} focus:ring-2 focus:ring-[#E17726]/20 outline-none transition-all resize-none`}
          placeholder="Enter your complete address"
        />
        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-midnight mb-2">City *</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${errors.city ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-[#E17726]'} focus:ring-2 focus:ring-[#E17726]/20 outline-none transition-all`}
            placeholder="Enter your city"
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-midnight mb-2">State *</label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${errors.state ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-[#E17726]'} focus:ring-2 focus:ring-[#E17726]/20 outline-none transition-all`}
            placeholder="Enter your state"
          />
          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-midnight mb-2">Pincode *</label>
        <input
          type="text"
          value={formData.pincode}
          onChange={(e) => handleInputChange('pincode', e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border ${errors.pincode ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-[#E17726]'} focus:ring-2 focus:ring-[#E17726]/20 outline-none transition-all`}
          placeholder="Enter 6-digit pincode"
          maxLength={6}
        />
        {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-12 h-12 text-green-500" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-midnight mb-2">Account Created Successfully!</h3>
        <p className="text-gray-600 mb-6">
          Welcome to Sushrusa eClinic, {registrationResponse?.name || formData.name}!
        </p>
        {registrationResponse?.message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-green-800 text-sm">{registrationResponse.message}</p>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <Calendar className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-orange-900 mb-2">Next Steps</h4>
            <p className="text-orange-800 text-sm leading-relaxed">
              <strong>Please visit your nearest eClinic to book a consultation.</strong><br/>
              Our healthcare professionals will verify your details and help you schedule an appointment with our specialist doctors.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#E17726]/10 to-cyan-400/10 rounded-2xl p-6">
        <h4 className="font-bold text-midnight mb-4">Your Account Details</h4>
        <div className="space-y-3 text-sm text-left">
          <div className="flex items-center">
            <User className="w-4 h-4 text-[#E17726] mr-3 flex-shrink-0" />
            <span><strong>Name:</strong> {registrationResponse?.name || formData.name}</span>
          </div>
          <div className="flex items-center">
            <Mail className="w-4 h-4 text-[#E17726] mr-3 flex-shrink-0" />
            <span><strong>Email:</strong> {registrationResponse?.email || formData.email}</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-4 h-4 text-[#E17726] mr-3 flex-shrink-0" />
            <span><strong>Phone:</strong> {registrationResponse?.phone || formData.phone}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 text-[#E17726] mr-3 flex-shrink-0" />
            <span><strong>Location:</strong> {formData.city}, {formData.state} - {formData.pincode}</span>
          </div>
          {registrationResponse?.id && (
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
              <span><strong>Account ID:</strong> {registrationResponse.id}</span>
            </div>
          )}
        </div>
      </div>

      {/* Display nearest eClinics if available */}
      {registrationResponse?.nearest_eclinics && registrationResponse.nearest_eclinics.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h4 className="font-bold text-blue-900 mb-4">Nearest eClinics</h4>
          <div className="space-y-3">
            {registrationResponse.nearest_eclinics.slice(0, 3).map((clinic, index) => (
              <div key={clinic.id} className="flex items-center space-x-3 text-sm">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-xs">{index + 1}</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-blue-900">{clinic.name}</p>
                  <p className="text-blue-700 text-xs">{clinic.city}, {clinic.state}</p>
                  {clinic.phone && <p className="text-blue-600 text-xs">📞 {clinic.phone}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          You'll receive a confirmation email shortly with your account details and nearest eClinic information.
        </p>
        <Button 
          onClick={handleClose}
          className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
        >
          Get Started
        </Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-[#E17726]/10 to-cyan-400/10 p-8 pb-6">
          <h2 className="text-3xl font-black text-midnight mb-2">Create Your Account</h2>
          
          {/* Progress Steps */}
          {step < 3 && (
            <div className="flex items-center space-x-2 mt-6">
              {[1, 2].map((stepNum) => (
                <div key={stepNum} className="flex-1">
                  <div className={`h-2 rounded-full transition-colors ${step >= stepNum ? 'bg-[#E17726]' : 'bg-gray-200'}`}></div>
                  <div className={`text-xs font-medium mt-1 ${step >= stepNum ? 'text-[#E17726]' : 'text-gray-400'}`}>
                    {stepNum === 1 ? 'Personal Info' : 'Address'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Navigation Buttons */}
          {step < 3 && (
            <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
              {step > 1 ? (
                <Button 
                  onClick={() => setStep(step - 1)}
                  variant="outline"
                  className="px-6 py-2 rounded-xl"
                  disabled={isSubmitting}
                >
                  Previous
                </Button>
              ) : <div></div>}
              
              <Button 
                onClick={handleNext}
                className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] text-white px-8 py-2 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  step === 2 ? 'Create Account' : 'Next'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAccountModal;
