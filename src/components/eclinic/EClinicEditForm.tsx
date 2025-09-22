import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Stethoscope, 
  Shield, 
  Save, 
  X, 
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Video,
  FileText
} from 'lucide-react';
import { EClinic } from '@/lib/api';
import { superAdminApi } from '@/lib/api';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface EClinicEditFormProps {
  clinicId: string;
  onSave?: (clinic: EClinic) => void;
  onCancel?: () => void;
  initialData?: EClinic;
}

interface EClinicFormData {
  name: string;
  clinic_type: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: string;
  longitude: string;
  operating_hours: Record<string, string>;
  consultation_fee: string;
  consultation_duration: string;
  specialties: string[];
  services: string[];
  facilities: string[];
  registration_number: string;
  license_number: string;
  accreditation: string;
  cover_image: string;
  accepts_online_consultations: boolean;
  is_active: boolean;
  is_verified: boolean;
}

const EClinicEditForm: React.FC<EClinicEditFormProps> = ({ 
  clinicId, 
  onSave, 
  onCancel,
  initialData 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<EClinicFormData>({
    name: '',
    clinic_type: 'virtual_clinic',
    description: '',
    phone: '',
    email: '',
    website: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    latitude: '',
    longitude: '',
    operating_hours: {},
    consultation_fee: '',
    consultation_duration: '15',
    specialties: [],
    services: [],
    facilities: [],
    registration_number: '',
    license_number: '',
    accreditation: '',
    cover_image: '',
    accepts_online_consultations: true,
    is_active: true,
    is_verified: false
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newService, setNewService] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  // Common Indian states
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
    'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep',
    'Puducherry'
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        clinic_type: initialData.clinic_type || 'virtual_clinic',
        description: initialData.description || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        website: initialData.website || '',
        street: initialData.street || '',
        city: initialData.city || '',
        state: initialData.state || '',
        pincode: initialData.pincode || '',
        country: initialData.country || 'India',
        latitude: initialData.latitude?.toString() || '',
        longitude: initialData.longitude?.toString() || '',
        operating_hours: initialData.operating_hours || {},
        consultation_fee: initialData.consultation_fee?.toString() || '',
        consultation_duration: initialData.consultation_duration?.toString() || '15',
        specialties: initialData.specialties || [],
        services: initialData.services || [],
        facilities: initialData.facilities || [],
        registration_number: initialData.registration_number || '',
        license_number: initialData.license_number || '',
        accreditation: initialData.accreditation || '',
        cover_image: initialData.cover_image || '',
        accepts_online_consultations: initialData.accepts_online_consultations ?? true,
        is_active: initialData.is_active,
        is_verified: initialData.is_verified
      });
    } else if (clinicId) {
      fetchClinicData();
    }
  }, [clinicId, initialData]);

  const fetchClinicData = async () => {
    try {
      setLoading(true);
      setError(null);
      const clinicData = await superAdminApi.getEClinic(clinicId);
      setFormData({
        name: clinicData.name || '',
        clinic_type: clinicData.clinic_type || 'virtual_clinic',
        description: clinicData.description || '',
        phone: clinicData.phone || '',
        email: clinicData.email || '',
        website: clinicData.website || '',
        street: clinicData.street || '',
        city: clinicData.city || '',
        state: clinicData.state || '',
        pincode: clinicData.pincode || '',
        country: clinicData.country || 'India',
        latitude: clinicData.latitude?.toString() || '',
        longitude: clinicData.longitude?.toString() || '',
        operating_hours: clinicData.operating_hours || {},
        consultation_fee: clinicData.consultation_fee?.toString() || '',
        consultation_duration: clinicData.consultation_duration?.toString() || '15',
        specialties: clinicData.specialties || [],
        services: clinicData.services || [],
        facilities: clinicData.facilities || [],
        registration_number: clinicData.registration_number || '',
        license_number: clinicData.license_number || '',
        accreditation: clinicData.accreditation || '',
        accepts_online_consultations: clinicData.accepts_online_consultations ?? true,
        is_active: clinicData.is_active,
        is_verified: clinicData.is_verified
      });
    } catch (error) {
      console.error('Error fetching clinic data:', error);
      setError('Failed to load clinic data');
      toast.error('Failed to load clinic data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EClinicFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }));
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('Clinic name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.street.trim()) {
      toast.error('Street address is required');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('City is required');
      return false;
    }
    if (!formData.state.trim()) {
      toast.error('State is required');
      return false;
    }
    if (!formData.pincode.trim()) {
      toast.error('Pincode is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);

      let updateData: any = {
        name: formData.name.trim(),
        clinic_type: formData.clinic_type,
        description: formData.description.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        website: formData.website.trim() || undefined,
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        country: formData.country.trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        operating_hours: formData.operating_hours,
        consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : undefined,
        consultation_duration: formData.consultation_duration ? parseInt(formData.consultation_duration) : undefined,
        specialties: formData.specialties,
        services: formData.services,
        facilities: formData.facilities,
        registration_number: formData.registration_number.trim(),
        license_number: formData.license_number.trim() || undefined,
        accreditation: formData.accreditation.trim() || undefined,
        accepts_online_consultations: formData.accepts_online_consultations,
        is_active: formData.is_active,
        is_verified: formData.is_verified,
        admin: user?.id // Include the current logged-in admin's ID
      };

      // Handle cover image - either file upload or URL
      if (coverImageFile) {
        // Create FormData for file upload
        const formDataToSend = new FormData();
        Object.keys(updateData).forEach(key => {
          if (updateData[key] !== undefined && updateData[key] !== null) {
            if (typeof updateData[key] === 'object' && !Array.isArray(updateData[key])) {
              formDataToSend.append(key, JSON.stringify(updateData[key]));
            } else if (Array.isArray(updateData[key])) {
              updateData[key].forEach((item: any, index: number) => {
                formDataToSend.append(`${key}[${index}]`, item);
              });
            } else {
              formDataToSend.append(key, updateData[key]);
            }
          }
        });
        formDataToSend.append('cover_image', coverImageFile);
        updateData = formDataToSend;
      } else {
        // Use URL if no file is selected
        updateData.cover_image = formData.cover_image.trim() || undefined;
      }

      const updatedClinic = await superAdminApi.updateEClinic(clinicId, updateData);
      
      toast.success('Clinic profile updated successfully!');
      onSave?.(updatedClinic);
    } catch (error) {
      console.error('Error updating clinic:', error);
      setError('Failed to update clinic profile');
      toast.error('Failed to update clinic profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Error Loading Form</AlertTitle>
        <AlertDescription className="text-red-700">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="w-6 h-6 text-[#E17726]" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Edit E-Clinic Profile</h1>
                <p className="text-sm text-gray-600">Update clinic information and settings</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel} disabled={saving}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-[#E17726] hover:bg-[#c9651e] text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                <Building2 className="w-5 h-5 mr-2 text-[#E17726]" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Clinic Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter clinic name"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic_type" className="text-sm font-medium text-gray-700">
                    Clinic Type
                  </Label>
                  <Select value={formData.clinic_type} onValueChange={(value) => handleInputChange('clinic_type', value)}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select clinic type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="virtual_clinic" className="text-sm">Virtual Clinic</SelectItem>
                      <SelectItem value="hospital" className="text-sm">Hospital</SelectItem>
                      <SelectItem value="clinic" className="text-sm">Clinic</SelectItem>
                      <SelectItem value="diagnostic_center" className="text-sm">Diagnostic Center</SelectItem>
                      <SelectItem value="specialty_center" className="text-sm">Specialty Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="consultation_fee" className="text-sm font-medium text-gray-700">
                    Consultation Fee (₹)
                  </Label>
                  <Input
                    id="consultation_fee"
                    type="number"
                    value={formData.consultation_fee}
                    onChange={(e) => handleInputChange('consultation_fee', e.target.value)}
                    placeholder="Enter consultation fee"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consultation_duration" className="text-sm font-medium text-gray-700">
                    Consultation Duration (minutes)
                  </Label>
                  <Input
                    id="consultation_duration"
                    type="number"
                    value={formData.consultation_duration}
                    onChange={(e) => handleInputChange('consultation_duration', e.target.value)}
                    placeholder="Enter consultation duration"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter clinic description"
                  rows={3}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                <Phone className="w-5 h-5 mr-2 text-[#E17726]" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-medium text-gray-700">
                  Website
                </Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="Enter website URL"
                  className="text-sm"
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label htmlFor="cover_image" className="text-sm font-medium text-gray-700">
                  Cover Image
                </Label>
                <div className="space-y-3">
                  {/* File Upload Input */}
                  <div className="flex items-center space-x-3">
                    <Input
                      id="cover_image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Store the actual file for upload
                          setCoverImageFile(file);
                          // Create a preview URL for the selected file
                          const previewUrl = URL.createObjectURL(file);
                          handleInputChange('cover_image', previewUrl);
                        }
                      }}
                      className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E17726] file:text-white hover:file:bg-[#c9651e]"
                    />
                    <span className="text-xs text-gray-500">or</span>
                    <Input
                      type="url"
                      value={formData.cover_image}
                      onChange={(e) => {
                        // Clear the file when URL is entered
                        setCoverImageFile(null);
                        handleInputChange('cover_image', e.target.value);
                      }}
                      placeholder="Enter image URL"
                      className="text-sm flex-1"
                    />
                  </div>
                  
                  {/* Image Preview */}
                  {formData.cover_image && (
                    <div className="mt-2">
                      <img 
                        src={formData.cover_image} 
                        alt="Cover image preview"
                        className="w-full h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                <MapPin className="w-5 h-5 mr-2 text-[#E17726]" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street" className="text-sm font-medium text-gray-700">
                  Street Address *
                </Label>
                <Textarea
                  id="street"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="Enter street address"
                  rows={2}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                    City *
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Enter city"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                    State *
                  </Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((state) => (
                        <SelectItem key={state} value={state} className="text-sm">
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode" className="text-sm font-medium text-gray-700">
                    Pincode *
                  </Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    placeholder="Enter pincode"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Enter country"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coordinates" className="text-sm font-medium text-gray-700">
                    Coordinates (Lat, Lng)
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      value={formData.latitude}
                      onChange={(e) => handleInputChange('latitude', e.target.value)}
                      placeholder="Latitude"
                      className="text-sm"
                    />
                    <Input
                      value={formData.longitude}
                      onChange={(e) => handleInputChange('longitude', e.target.value)}
                      placeholder="Longitude"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                <Stethoscope className="w-5 h-5 mr-2 text-[#E17726]" />
                Services Offered
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  placeholder="Add a service"
                  className="text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addService()}
                />
                <Button onClick={addService} size="sm" className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.services.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.services.map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs flex items-center space-x-1">
                      <span>{service}</span>
                      <button
                        onClick={() => removeService(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Registration Information */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                <FileText className="w-5 h-5 mr-2 text-[#E17726]" />
                Registration Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registration_number" className="text-sm font-medium text-gray-700">
                    Registration Number *
                  </Label>
                  <Input
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={(e) => handleInputChange('registration_number', e.target.value)}
                    placeholder="Enter registration number"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_number" className="text-sm font-medium text-gray-700">
                    License Number
                  </Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => handleInputChange('license_number', e.target.value)}
                    placeholder="Enter license number"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accreditation" className="text-sm font-medium text-gray-700">
                  Accreditation
                </Label>
                <Input
                  id="accreditation"
                  value={formData.accreditation}
                  onChange={(e) => handleInputChange('accreditation', e.target.value)}
                  placeholder="Enter accreditation details"
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Settings */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                <Shield className="w-5 h-5 mr-2 text-[#E17726]" />
                Status Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${formData.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium text-gray-700">Active Status</span>
                </div>
                <Select 
                  value={formData.is_active.toString()} 
                  onValueChange={(value) => handleInputChange('is_active', value === 'true')}
                >
                  <SelectTrigger className="w-24 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true" className="text-sm">Active</SelectItem>
                    <SelectItem value="false" className="text-sm">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className={`w-4 h-4 ${formData.is_verified ? 'text-green-600' : 'text-yellow-600'}`} />
                  <span className="text-sm font-medium text-gray-700">Verification</span>
                </div>
                <Select 
                  value={formData.is_verified.toString()} 
                  onValueChange={(value) => handleInputChange('is_verified', value === 'true')}
                >
                  <SelectTrigger className="w-24 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true" className="text-sm">Verified</SelectItem>
                    <SelectItem value="false" className="text-sm">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Video className={`w-4 h-4 ${formData.accepts_online_consultations ? 'text-green-600' : 'text-red-600'}`} />
                  <span className="text-sm font-medium text-gray-700">Online Consultations</span>
                </div>
                <Select 
                  value={formData.accepts_online_consultations.toString()} 
                  onValueChange={(value) => handleInputChange('accepts_online_consultations', value === 'true')}
                >
                  <SelectTrigger className="w-24 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true" className="text-sm">Enabled</SelectItem>
                    <SelectItem value="false" className="text-sm">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Save Actions */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              {onCancel && (
                <Button 
                  variant="outline" 
                  onClick={onCancel} 
                  disabled={saving}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EClinicEditForm;
