import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  FileText, 
  UserPlus,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Calendar,
  AlertTriangle,
  Camera,
  Upload
} from 'lucide-react';

const PatientRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    maritalStatus: '',
    
    // Contact Information
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Medical History
    allergies: '',
    currentMedications: '',
    pastSurgeries: '',
    chronicConditions: '',
    familyHistory: '',
    
    // Emergency Contact
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    
    // Insurance & Documents
    insuranceProvider: '',
    policyNumber: '',
    idProof: '',
    profilePhoto: null
  });

  const steps = [
    { id: 1, title: 'Personal Info', icon: User, description: 'Basic personal details' },
    { id: 2, title: 'Contact Details', icon: Phone, description: 'Address and contact info' },
    { id: 3, title: 'Medical History', icon: Heart, description: 'Health background' },
    { id: 4, title: 'Emergency Contact', icon: UserPlus, description: 'Emergency contact person' },
    { id: 5, title: 'Documents', icon: FileText, description: 'Upload required documents' },
    { id: 6, title: 'Review', icon: CheckCircle, description: 'Review and confirm' }
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other'];
  const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
  const relations = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'];

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.dateOfBirth && formData.gender;
      case 2:
        return formData.phone && formData.address && formData.city;
      case 3:
        return true; // Medical history is optional
      case 4:
        return formData.emergencyName && formData.emergencyPhone;
      case 5:
        return true; // Documents are optional
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center min-w-0">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-[#E17726] border-[#E17726] text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 mx-2 transition-all duration-300 ${
                    currentStep > step.id ? 'bg-[#E17726]' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 overflow-x-auto">
            {steps.map((step) => (
              <div key={step.id} className="text-center min-w-0 flex-1">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-[#E17726]' : 'text-gray-400'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card className="border-0 shadow-xl rounded-3xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold text-midnight">
              {steps[currentStep - 1].title}
            </CardTitle>
            <p className="text-gray-600 mt-2">{steps[currentStep - 1].description}</p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <Input 
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <Input 
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                    <Input 
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                      className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                    <div className="flex space-x-3">
                      {genders.map((gender) => (
                        <Button
                          key={gender}
                          variant={formData.gender === gender ? 'default' : 'outline'}
                          onClick={() => updateFormData('gender', gender)}
                          className={`flex-1 h-12 rounded-xl ${
                            formData.gender === gender 
                              ? 'bg-[#E17726] hover:bg-[#c9651e] text-white' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {gender}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                    <select 
                      value={formData.bloodGroup}
                      onChange={(e) => updateFormData('bloodGroup', e.target.value)}
                      className="w-full h-12 rounded-xl border border-gray-300 px-3 focus:border-[#E17726] focus:ring-[#E17726] focus:outline-none"
                    >
                      <option value="">Select blood group</option>
                      {bloodGroups.map((group) => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                    <select 
                      value={formData.maritalStatus}
                      onChange={(e) => updateFormData('maritalStatus', e.target.value)}
                      className="w-full h-12 rounded-xl border border-gray-300 px-3 focus:border-[#E17726] focus:ring-[#E17726] focus:outline-none"
                    >
                      <option value="">Select status</option>
                      {maritalStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <Input 
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <Input 
                      type="email"
                      placeholder="patient@email.com"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <Textarea 
                    placeholder="Enter complete address"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    className="min-h-24 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <Input 
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <Input 
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={(e) => updateFormData('state', e.target.value)}
                      className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                    <Input 
                      placeholder="123456"
                      value={formData.pincode}
                      onChange={(e) => updateFormData('pincode', e.target.value)}
                      className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Medical History */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Medical History Information</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Please provide accurate medical history. This information helps doctors provide better care.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Known Allergies</label>
                    <Textarea 
                      placeholder="List any allergies to medicines, food, or other substances"
                      value={formData.allergies}
                      onChange={(e) => updateFormData('allergies', e.target.value)}
                      className="min-h-20 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
                    <Textarea 
                      placeholder="List current medications with dosage"
                      value={formData.currentMedications}
                      onChange={(e) => updateFormData('currentMedications', e.target.value)}
                      className="min-h-20 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Past Surgeries</label>
                    <Textarea 
                      placeholder="List any previous surgeries with dates"
                      value={formData.pastSurgeries}
                      onChange={(e) => updateFormData('pastSurgeries', e.target.value)}
                      className="min-h-20 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chronic Conditions</label>
                    <Textarea 
                      placeholder="List any chronic conditions (diabetes, hypertension, etc.)"
                      value={formData.chronicConditions}
                      onChange={(e) => updateFormData('chronicConditions', e.target.value)}
                      className="min-h-20 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Family Medical History</label>
                    <Textarea 
                      placeholder="List significant family medical history"
                      value={formData.familyHistory}
                      onChange={(e) => updateFormData('familyHistory', e.target.value)}
                      className="min-h-20 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Emergency Contact */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <UserPlus className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">Emergency Contact</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Provide details of a person we can contact in case of emergency.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name *</label>
                    <Input 
                      placeholder="Enter contact person name"
                      value={formData.emergencyName}
                      onChange={(e) => updateFormData('emergencyName', e.target.value)}
                      className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                    <select 
                      value={formData.emergencyRelation}
                      onChange={(e) => updateFormData('emergencyRelation', e.target.value)}
                      className="w-full h-12 rounded-xl border border-gray-300 px-3 focus:border-[#E17726] focus:ring-[#E17726] focus:outline-none"
                    >
                      <option value="">Select relationship</option>
                      {relations.map((relation) => (
                        <option key={relation} value={relation}>{relation}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <Input 
                      placeholder="+91 98765 43210"
                      value={formData.emergencyPhone}
                      onChange={(e) => updateFormData('emergencyPhone', e.target.value)}
                      className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Documents */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Provider</label>
                    <Input 
                      placeholder="Enter insurance company name"
                      value={formData.insuranceProvider}
                      onChange={(e) => updateFormData('insuranceProvider', e.target.value)}
                      className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Policy Number</label>
                    <Input 
                      placeholder="Enter policy number"
                      value={formData.policyNumber}
                      onChange={(e) => updateFormData('policyNumber', e.target.value)}
                      className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Proof Type</label>
                    <select 
                      value={formData.idProof}
                      onChange={(e) => updateFormData('idProof', e.target.value)}
                      className="w-full h-12 rounded-xl border border-gray-300 px-3 focus:border-[#E17726] focus:ring-[#E17726] focus:outline-none"
                    >
                      <option value="">Select ID proof</option>
                      <option value="aadhaar">Aadhaar Card</option>
                      <option value="pan">PAN Card</option>
                      <option value="passport">Passport</option>
                      <option value="driving_license">Driving License</option>
                      <option value="voter_id">Voter ID</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-2 border-dashed border-gray-300 hover:border-[#E17726] transition-colors cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-700">Upload ID Proof</p>
                      <p className="text-xs text-gray-500 mt-1">Click to upload document</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-dashed border-gray-300 hover:border-[#E17726] transition-colors cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-700">Profile Photo</p>
                      <p className="text-xs text-gray-500 mt-1">Click to upload photo</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 6: Review */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-midnight mb-2">Review Information</h3>
                  <p className="text-gray-600">Please review all information before submitting</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border border-gray-200 rounded-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-midnight">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">DOB:</span>
                        <span className="font-medium">{formData.dateOfBirth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-medium">{formData.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Blood Group:</span>
                        <span className="font-medium">{formData.bloodGroup || 'Not specified'}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-gray-200 rounded-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-midnight">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{formData.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{formData.email || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">City:</span>
                        <span className="font-medium">{formData.city}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="border border-gray-200 rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-midnight">Emergency Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-medium">{formData.emergencyName} ({formData.emergencyRelation})</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{formData.emergencyPhone}</span>
                    </div>
                  </CardContent>
                </Card>
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
                  disabled={!validateStep()}
                  className="bg-[#E17726] hover:bg-[#c9651e] text-white px-8 py-3 rounded-xl"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    // Handle form submission
                    alert('Patient registered successfully!');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Register Patient
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientRegistration; 