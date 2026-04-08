import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Stethoscope,
  X,
  Plus,
  Loader2,
  User,
  Phone,
  Mail,
  GraduationCap,
  Award,
  DollarSign,
  Clock,
  MapPin,
  Building2,
  Globe,
  Languages,
  AlignLeft,
  Save,
  Upload
} from 'lucide-react';
import { DoctorProfile, CreateDoctorProfileData } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface DoctorEditModalProps {
  doctor: DoctorProfile | null;
  onClose: () => void;
  onSave: (updatedDoctor: DoctorProfile) => void;
  isOpen: boolean;
}

const DoctorEditModal: React.FC<DoctorEditModalProps> = ({ 
  doctor, 
  onClose, 
  onSave, 
  isOpen 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    license_number: '',
    qualification: '',
    specialization: '',
    sub_specialization: '',
    consultation_fee: '',
    online_consultation_fee: '',
    experience_years: '',
    clinic_name: '',
    clinic_address: '',
    bio: '',
    languages_spoken: [] as string[],
    consultation_duration: '5',
    is_online_consultation_available: true,
    is_active: true,
  });

  // Load doctor data when modal opens
  useEffect(() => {
    if (doctor && isOpen) {
      setFormData({
        name: doctor.user_name || '',
        phone: doctor.user_phone || '',
        email: doctor.user_email || '',
        license_number: doctor.license_number || '',
        qualification: doctor.qualification || '',
        specialization: doctor.specialization || '',
        sub_specialization: doctor.sub_specialization || '',
        consultation_fee: doctor.consultation_fee?.toString() || '',
        online_consultation_fee: doctor.online_consultation_fee?.toString() || '',
        experience_years: doctor.experience_years?.toString() || '',
        clinic_name: doctor.clinic_name || '',
        clinic_address: doctor.clinic_address || '',
        bio: doctor.bio || '',
        languages_spoken: doctor.languages_spoken || [],
        consultation_duration: doctor.consultation_duration?.toString() || '5',
        is_online_consultation_available: doctor.is_online_consultation_available || true,
        is_active: doctor.is_active || true,
      });
    }
  }, [doctor, isOpen]);

  // Handle profile image change
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setProfileImagePreview(null);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle language addition
  const handleAddLanguage = () => {
    const newLanguage = prompt('Enter language:');
    if (newLanguage && newLanguage.trim()) {
      setFormData(prev => ({
        ...prev,
        languages_spoken: [...prev.languages_spoken, newLanguage.trim()]
      }));
    }
  };

  // Handle language removal
  const handleRemoveLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languages_spoken: prev.languages_spoken.filter((_, i) => i !== index)
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) errors.push('Full name is required');
    if (!formData.phone.trim()) errors.push('Phone number is required');
    if (!formData.license_number.trim()) errors.push('License number is required');
    if (!formData.qualification.trim()) errors.push('Qualification is required');
    if (!formData.specialization) errors.push('Specialization is required');
    
    // Phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      errors.push('Please enter a valid phone number');
    }
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    // Numeric field validation
    const consultationFee = parseFloat(formData.consultation_fee);
    const onlineConsultationFee = parseFloat(formData.online_consultation_fee);
    const experienceYears = parseInt(formData.experience_years);
    const consultationDuration = parseInt(formData.consultation_duration);
    
    if (isNaN(consultationFee) || consultationFee < 0) {
      errors.push('Please enter a valid consultation fee');
    }
    
    if (isNaN(onlineConsultationFee) || onlineConsultationFee < 0) {
      errors.push('Please enter a valid online consultation fee');
    }
    
    if (isNaN(experienceYears) || experienceYears < 0 || experienceYears > 50) {
      errors.push('Please enter a valid experience (0-50 years)');
    }
    
    if (isNaN(consultationDuration) || consultationDuration < 5 || consultationDuration > 15) {
      errors.push('Please enter a valid consultation duration (5-15 minutes)');
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: 'Validation Error',
        description: validationErrors.join(', '),
        variant: 'destructive'
      });
      return;
    }

    if (!doctor) return;

    setLoading(true);
    try {
      const updateData: Partial<CreateDoctorProfileData> = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        license_number: formData.license_number.trim(),
        qualification: formData.qualification.trim(),
        specialization: formData.specialization,
        sub_specialization: formData.sub_specialization.trim() || undefined,
        consultation_fee: parseFloat(formData.consultation_fee),
        online_consultation_fee: parseFloat(formData.online_consultation_fee),
        experience_years: parseInt(formData.experience_years),
        clinic_name: formData.clinic_name.trim() || undefined,
        clinic_address: formData.clinic_address.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        languages_spoken: formData.languages_spoken.filter(lang => lang.trim() !== ''),
        consultation_duration: parseInt(formData.consultation_duration),
        is_online_consultation_available: formData.is_online_consultation_available,
        is_active: formData.is_active,
      };

      // Here you would call your API to update the doctor
      // For now, we'll simulate the update
      const updatedDoctor: DoctorProfile = {
        ...doctor,
        user_name: formData.name,
        user_phone: formData.phone,
        user_email: formData.email,
        license_number: formData.license_number,
        qualification: formData.qualification,
        specialization: formData.specialization,
        sub_specialization: formData.sub_specialization,
        consultation_fee: parseFloat(formData.consultation_fee),
        online_consultation_fee: parseFloat(formData.online_consultation_fee),
        experience_years: parseInt(formData.experience_years),
        clinic_name: formData.clinic_name,
        clinic_address: formData.clinic_address,
        bio: formData.bio,
        languages_spoken: formData.languages_spoken,
        consultation_duration: parseInt(formData.consultation_duration),
        is_online_consultation_available: formData.is_online_consultation_available,
        is_active: formData.is_active,
      };

      onSave(updatedDoctor);
      toast({
        title: 'Success',
        description: `Doctor ${formData.name} updated successfully`
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update doctor',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-midnight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-[#E17726]" />
            Edit Doctor: Dr. {doctor.user_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Image Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-[#E17726] text-white text-xl">
                {formData.name?.charAt(0) || 'D'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="profile-image" className="cursor-pointer">
                <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#E17726]">
                  <Upload className="w-4 h-4" />
                  Upload Profile Picture
                </div>
              </Label>
              <Input
                id="profile-image"
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Dr. John Doe"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="doctor@example.com"
              />
            </div>
            <div>
              <Label htmlFor="license">License Number *</Label>
              <Input
                id="license"
                value={formData.license_number}
                onChange={(e) => handleInputChange('license_number', e.target.value)}
                placeholder="MD123456"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="qualification">Qualification *</Label>
              <Input
                id="qualification"
                value={formData.qualification}
                onChange={(e) => handleInputChange('qualification', e.target.value)}
                placeholder="MBBS, MD"
              />
            </div>
            <div>
              <Label htmlFor="specialization">Specialization *</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
                placeholder="Cardiology"
              />
            </div>
            <div>
              <Label htmlFor="sub_specialization">Sub-Specialization</Label>
              <Input
                id="sub_specialization"
                value={formData.sub_specialization}
                onChange={(e) => handleInputChange('sub_specialization', e.target.value)}
                placeholder="Interventional Cardiology"
              />
            </div>
            <div>
              <Label htmlFor="experience">Experience (Years) *</Label>
              <Input
                id="experience"
                type="number"
                value={formData.experience_years}
                onChange={(e) => handleInputChange('experience_years', e.target.value)}
                placeholder="5"
                min="0"
                max="50"
              />
            </div>
          </div>

          {/* Fees and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="consultation_fee">Consultation Fee (₹) *</Label>
              <Input
                id="consultation_fee"
                type="number"
                value={formData.consultation_fee}
                onChange={(e) => handleInputChange('consultation_fee', e.target.value)}
                placeholder="1000"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="online_fee">Online Fee (₹) *</Label>
              <Input
                id="online_fee"
                type="number"
                value={formData.online_consultation_fee}
                onChange={(e) => handleInputChange('online_consultation_fee', e.target.value)}
                placeholder="800"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (Minutes) *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.consultation_duration}
                onChange={(e) => handleInputChange('consultation_duration', e.target.value)}
                placeholder="5"
                min="5"
                max="15"
                step="1"
              />
            </div>
          </div>

          {/* Clinic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clinic_name">Clinic Name</Label>
              <Input
                id="clinic_name"
                value={formData.clinic_name}
                onChange={(e) => handleInputChange('clinic_name', e.target.value)}
                placeholder="City Heart Clinic"
              />
            </div>
            <div>
              <Label htmlFor="clinic_address">Clinic Address</Label>
              <Input
                id="clinic_address"
                value={formData.clinic_address}
                onChange={(e) => handleInputChange('clinic_address', e.target.value)}
                placeholder="123 Medical Center, City"
              />
            </div>
          </div>

          {/* Languages */}
          <div>
            <Label>Languages Spoken</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.languages_spoken.map((lang, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {lang}
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(index)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLanguage}
                className="flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Language
              </Button>
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about the doctor's background, expertise, and approach to patient care..."
              rows={4}
            />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="online_consultation">Online Consultation Available</Label>
              <Switch
                id="online_consultation"
                checked={formData.is_online_consultation_available}
                onCheckedChange={(checked) => handleInputChange('is_online_consultation_available', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active Status</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-[#E17726] hover:bg-[#c9651e] text-white"
          >
            {loading ? (
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
      </DialogContent>
    </Dialog>
  );
};

export default DoctorEditModal; 