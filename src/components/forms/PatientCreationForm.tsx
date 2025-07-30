import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { adminPatientApi, CreatePatientUserData, CreatePatientProfileData } from '@/lib/api';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Heart, 
  FileText, 
  Languages,
  Plus,
  X,
  Save,
  Loader2
} from 'lucide-react';

interface PatientCreationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientCreated?: (patient: any) => void;
}

const PatientCreationForm: React.FC<PatientCreationFormProps> = ({
  open,
  onOpenChange,
  onPatientCreated
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

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
    if (!userData.phone || !userData.name) {
      toast({
        title: "Validation Error",
        description: "Phone number and name are required fields.",
        variant: "destructive"
      });
      return false;
    }

    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return false;
    }

    if (userData.phone && !/^\+?1?\d{9,15}$/.test(userData.phone)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number.",
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
      
      toast({
        title: "Success",
        description: `Patient ${result.name} created successfully!`,
      });

      onPatientCreated?.(result);
      onOpenChange(false);
      
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6" />
            Create New Patient Account
          </DialogTitle>
          <DialogDescription>
            Fill in the patient's information to create their account. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

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

          <TabsContent value="basic" className="space-y-6">
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
                      value={userData.phone}
                      onChange={(e) => handleUserDataChange('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={userData.name}
                      onChange={(e) => handleUserDataChange('name', e.target.value)}
                      placeholder="Enter full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      onChange={(e) => handleUserDataChange('email', e.target.value)}
                      placeholder="patient@example.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth" className="text-sm font-medium">
                      Date of Birth
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
                      Gender
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="blood_group" className="text-sm font-medium">
                      Blood Group
                    </Label>
                    <Select value={profileData.blood_group} onValueChange={(value) => handleProfileDataChange('blood_group', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="marathi">Marathi</SelectItem>
                        <SelectItem value="gujarati">Gujarati</SelectItem>
                        <SelectItem value="tamil">Tamil</SelectItem>
                        <SelectItem value="telugu">Telugu</SelectItem>
                        <SelectItem value="kannada">Kannada</SelectItem>
                        <SelectItem value="malayalam">Malayalam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="allergies" className="text-sm font-medium">
                    Allergies
                  </Label>
                  <Textarea
                    id="allergies"
                    value={profileData.allergies}
                    onChange={(e) => handleProfileDataChange('allergies', e.target.value)}
                    placeholder="List any known allergies (e.g., Penicillin, Shellfish, etc.)"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Chronic Conditions
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={newChronicCondition}
                      onChange={(e) => setNewChronicCondition(e.target.value)}
                      placeholder="Add chronic condition"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChronicCondition())}
                    />
                    <Button type="button" onClick={addChronicCondition} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {profileData.chronic_conditions && profileData.chronic_conditions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profileData.chronic_conditions.map((condition, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {condition}
                          <button
                            onClick={() => removeChronicCondition(index)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Current Medications
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      placeholder="Add medication (e.g., Metformin 500mg)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                    />
                    <Button type="button" onClick={addMedication} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {profileData.current_medications && profileData.current_medications.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profileData.current_medications.map((medication, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {medication}
                          <button
                            onClick={() => removeMedication(index)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="medical_history" className="text-sm font-medium">
                    Medical History
                  </Label>
                  <Textarea
                    id="medical_history"
                    value={userData.medical_history}
                    onChange={(e) => handleUserDataChange('medical_history', e.target.value)}
                    placeholder="Any relevant medical history, surgeries, etc."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address" className="space-y-6">
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
                    value={userData.street}
                    onChange={(e) => handleUserDataChange('street', e.target.value)}
                    placeholder="Enter street address"
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
                      value={userData.city}
                      onChange={(e) => handleUserDataChange('city', e.target.value)}
                      placeholder="Enter city"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm font-medium">
                      State
                    </Label>
                    <Input
                      id="state"
                      value={userData.state}
                      onChange={(e) => handleUserDataChange('state', e.target.value)}
                      placeholder="Enter state"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode" className="text-sm font-medium">
                      Pincode
                    </Label>
                    <Input
                      id="pincode"
                      value={userData.pincode}
                      onChange={(e) => handleUserDataChange('pincode', e.target.value)}
                      placeholder="Enter pincode"
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
                    value={userData.country}
                    onChange={(e) => handleUserDataChange('country', e.target.value)}
                    placeholder="Enter country"
                    className="mt-1"
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="emergency_contact_name" className="text-sm font-medium">
                        Contact Name
                      </Label>
                      <Input
                        id="emergency_contact_name"
                        value={userData.emergency_contact_name}
                        onChange={(e) => handleUserDataChange('emergency_contact_name', e.target.value)}
                        placeholder="Emergency contact name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergency_contact_phone" className="text-sm font-medium">
                        Contact Phone
                      </Label>
                      <Input
                        id="emergency_contact_phone"
                        value={userData.emergency_contact_phone}
                        onChange={(e) => handleUserDataChange('emergency_contact_phone', e.target.value)}
                        placeholder="Emergency contact phone"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergency_contact_relationship" className="text-sm font-medium">
                        Relationship
                      </Label>
                      <Input
                        id="emergency_contact_relationship"
                        value={userData.emergency_contact_relationship}
                        onChange={(e) => handleUserDataChange('emergency_contact_relationship', e.target.value)}
                        placeholder="e.g., Spouse, Parent, etc."
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
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
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Patient
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientCreationForm; 