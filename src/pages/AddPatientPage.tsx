import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserPlus, CheckCircle, User, Heart, MapPin, Phone, Mail, Calendar, Languages, Plus, X, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { adminPatientApi, CreatePatientUserData, CreatePatientProfileData } from '@/lib/api';

const AddPatientPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdPatient, setCreatedPatient] = useState<any>(null);

  // Form state for user data
  const [userData, setUserData] = useState<CreatePatientUserData>({
    phone: '',
    name: '',
    email: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    allergies: '',
    medical_history: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: ''
  });

  // Form state for patient profile data
  const [profileData, setProfileData] = useState<CreatePatientProfileData>({
    blood_group: '',
    allergies: '',
    chronic_conditions: [],
    current_medications: [],
    preferred_language: 'english'
  });

  // Temporary state for arrays
  const [newChronicCondition, setNewChronicCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');

  const handleUserDataChange = (field: keyof CreatePatientUserData, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileDataChange = (field: keyof CreatePatientProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const addChronicCondition = () => {
    if (newChronicCondition.trim()) {
      setProfileData(prev => ({
        ...prev,
        chronic_conditions: [...(prev.chronic_conditions || []), newChronicCondition.trim()]
      }));
      setNewChronicCondition('');
    }
  };

  const removeChronicCondition = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      chronic_conditions: prev.chronic_conditions?.filter((_, i) => i !== index) || []
    }));
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      setProfileData(prev => ({
        ...prev,
        current_medications: [...(prev.current_medications || []), newMedication.trim()]
      }));
      setNewMedication('');
    }
  };

  const removeMedication = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      current_medications: prev.current_medications?.filter((_, i) => i !== index) || []
    }));
  };

  const validateForm = () => {
    if (!userData.phone || !userData.name || !userData.email || !userData.date_of_birth || !userData.gender) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (marked with *)",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const combinedData = {
        ...userData,
        ...profileData
      };

      const result = await adminPatientApi.createPatient(combinedData);
      
      setCreatedPatient(result);
      setShowSuccess(true);
      
      toast({
        title: "Success",
        description: `Patient ${result.name} created successfully!`,
      });
    } catch (error: any) {
      console.error('Error creating patient:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error?.message || "Failed to create patient. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToDashboard = () => {
          navigate('/dashboard');
  };

  const handleAddAnotherPatient = () => {
    setShowSuccess(false);
    setCreatedPatient(null);
    // Reset form
    setUserData({
      phone: '',
      name: '',
      email: '',
      date_of_birth: '',
      gender: '',
      blood_group: '',
      allergies: '',
      medical_history: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: ''
    });
    setProfileData({
      blood_group: '',
      allergies: '',
      chronic_conditions: [],
      current_medications: [],
      preferred_language: 'english'
    });
    setActiveTab('basic');
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        {/* Header */}
        <div className="shadow-lg border-b bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 border-emerald-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToDashboard}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Patient Created</h1>
                    <p className="text-xs text-emerald-100">Successfully added to system</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Patient Created Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                {createdPatient?.name} has been added to the system and can now be managed through the dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleAddAnotherPatient}
                  className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Another Patient
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBackToDashboard}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <div className="shadow-lg border-b bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 border-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Add New Patient</h1>
                  <p className="text-xs text-emerald-100">Create a new patient profile</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center">
              <UserPlus className="w-6 h-6 mr-2 text-[#E17726]" />
              Create New Patient Account
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Fill in the patient's information to create their account. All fields marked with * are required.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="medical" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Medical
                </TabsTrigger>
                <TabsTrigger value="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium">
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter phone number"
                          value={userData.phone}
                          onChange={(e) => handleUserDataChange('phone', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium">
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter full name"
                          value={userData.name}
                          onChange={(e) => handleUserDataChange('name', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email address"
                          value={userData.email}
                          onChange={(e) => handleUserDataChange('email', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="date_of_birth" className="text-sm font-medium">
                          Date of Birth *
                        </Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={userData.date_of_birth}
                          onChange={(e) => handleUserDataChange('date_of_birth', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender" className="text-sm font-medium">
                          Gender *
                        </Label>
                        <Select value={userData.gender} onValueChange={(value) => handleUserDataChange('gender', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="blood_group" className="text-sm font-medium">
                          Blood Group
                        </Label>
                        <Select value={userData.blood_group} onValueChange={(value) => handleUserDataChange('blood_group', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medical" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Medical Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="allergies" className="text-sm font-medium">
                        Allergies
                      </Label>
                      <Textarea
                        id="allergies"
                        placeholder="Enter any known allergies"
                        value={userData.allergies}
                        onChange={(e) => handleUserDataChange('allergies', e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="medical_history" className="text-sm font-medium">
                        Medical History
                      </Label>
                      <Textarea
                        id="medical_history"
                        placeholder="Enter medical history"
                        value={userData.medical_history}
                        onChange={(e) => handleUserDataChange('medical_history', e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Chronic Conditions</Label>
                      <div className="mt-1 space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add chronic condition"
                            value={newChronicCondition}
                            onChange={(e) => setNewChronicCondition(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addChronicCondition()}
                          />
                          <Button type="button" onClick={addChronicCondition} size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profileData.chronic_conditions?.map((condition, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {condition}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeChronicCondition(index)}
                                className="h-auto p-0 ml-1"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Current Medications</Label>
                      <div className="mt-1 space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add medication"
                            value={newMedication}
                            onChange={(e) => setNewMedication(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                          />
                          <Button type="button" onClick={addMedication} size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profileData.current_medications?.map((medication, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {medication}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMedication(index)}
                                className="h-auto p-0 ml-1"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="preferred_language" className="text-sm font-medium">
                        Preferred Language
                      </Label>
                      <Select value={profileData.preferred_language} onValueChange={(value) => handleProfileDataChange('preferred_language', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="hindi">Hindi</SelectItem>
                          <SelectItem value="odia">Odia</SelectItem>
                          <SelectItem value="bengali">Bengali</SelectItem>
                          <SelectItem value="telugu">Telugu</SelectItem>
                          <SelectItem value="tamil">Tamil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="address" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Address Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="street" className="text-sm font-medium">
                        Street Address
                      </Label>
                      <Input
                        id="street"
                        type="text"
                        placeholder="Enter street address"
                        value={userData.street}
                        onChange={(e) => handleUserDataChange('street', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-sm font-medium">
                          City
                        </Label>
                        <Input
                          id="city"
                          type="text"
                          placeholder="Enter city"
                          value={userData.city}
                          onChange={(e) => handleUserDataChange('city', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-sm font-medium">
                          State
                        </Label>
                        <Input
                          id="state"
                          type="text"
                          placeholder="Enter state"
                          value={userData.state}
                          onChange={(e) => handleUserDataChange('state', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode" className="text-sm font-medium">
                          Pincode
                        </Label>
                        <Input
                          id="pincode"
                          type="text"
                          placeholder="Enter pincode"
                          value={userData.pincode}
                          onChange={(e) => handleUserDataChange('pincode', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-sm font-medium">
                        Country
                      </Label>
                      <Input
                        id="country"
                        type="text"
                        placeholder="Enter country"
                        value={userData.country}
                        onChange={(e) => handleUserDataChange('country', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      Emergency Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="emergency_contact_name" className="text-sm font-medium">
                          Emergency Contact Name
                        </Label>
                        <Input
                          id="emergency_contact_name"
                          type="text"
                          placeholder="Enter emergency contact name"
                          value={userData.emergency_contact_name}
                          onChange={(e) => handleUserDataChange('emergency_contact_name', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergency_contact_phone" className="text-sm font-medium">
                          Emergency Contact Phone
                        </Label>
                        <Input
                          id="emergency_contact_phone"
                          type="tel"
                          placeholder="Enter emergency contact phone"
                          value={userData.emergency_contact_phone}
                          onChange={(e) => handleUserDataChange('emergency_contact_phone', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="emergency_contact_relationship" className="text-sm font-medium">
                        Relationship
                      </Label>
                      <Input
                        id="emergency_contact_relationship"
                        type="text"
                        placeholder="Enter relationship (e.g., Spouse, Parent, Sibling)"
                        value={userData.emergency_contact_relationship}
                        onChange={(e) => handleUserDataChange('emergency_contact_relationship', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBackToDashboard}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-[#E17726] hover:bg-[#c9651e] text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Patient...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Patient
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddPatientPage; 