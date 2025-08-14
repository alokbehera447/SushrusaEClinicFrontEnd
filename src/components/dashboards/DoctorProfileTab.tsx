import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Upload, 
  Download,
  Camera,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  GraduationCap,
  Languages,
  DollarSign,
  Clock,
  Building,
  FileSignature
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/utils';
import { DoctorProfile, doctorApi } from '@/lib/api';

interface DoctorProfileTabProps {
  profile: DoctorProfile | null;
  onProfileUpdate: (updatedProfile: DoctorProfile) => void;
}

const DoctorProfileTab: React.FC<DoctorProfileTabProps> = ({ profile, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [formData, setFormData] = useState<Partial<DoctorProfile>>({});
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 DoctorProfileTab - Profile prop changed:', profile);
    if (profile) {
      setFormData({
        user_name: profile.user_name || '',
        user_email: profile.user_email || '',
        license_number: profile.license_number || '',
        qualification: profile.qualification || '',
        specialization: profile.specialization || '',
        sub_specialization: profile.sub_specialization || '',
        experience_years: profile.experience_years || 0,
        consultation_fee: profile.consultation_fee || 0,
        online_consultation_fee: profile.online_consultation_fee || 0,
        languages_spoken: profile.languages_spoken || [],
        bio: profile.bio || '',
        achievements: profile.achievements || '',
        consultation_duration: profile.consultation_duration || 30,
        is_online_consultation_available: profile.is_online_consultation_available || false,
        clinic_name: profile.clinic_name || '',
        clinic_address: profile.clinic_address || '',
        date_of_birth: profile.date_of_birth || '',
        date_of_anniversary: profile.date_of_anniversary || '',
        is_accepting_patients: profile.is_accepting_patients || true,
      });
    }
  }, [profile]);

  const specializations = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'General Medicine',
    'Gynecology',
    'Neurology',
    'Oncology',
    'Ophthalmology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Pulmonology',
    'Radiology',
    'Surgery',
    'Urology',
    'Other'
  ];

  const qualifications = [
    'MBBS',
    'MD',
    'MS',
    'DM',
    'MCh',
    'DNB',
    'FRCS',
    'MRCP',
    'Other'
  ];

  const languages = [
    'English',
    'Hindi',
    'Odia',
    'Bengali',
    'Telugu',
    'Tamil',
    'Kannada',
    'Malayalam',
    'Marathi',
    'Gujarati',
    'Punjabi',
    'Urdu',
    'Other'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLanguageChange = (language: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      languages_spoken: checked
        ? [...(prev.languages_spoken || []), language]
        : (prev.languages_spoken || []).filter(lang => lang !== language)
    }));
  };

  const handleSignatureUpload = async (file: File) => {
    setUploadingSignature(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('signature', file);
      formData.append('type', 'doctor_signature');

      // Upload to Digital Ocean with signed URL
      const response = await api.post('/api/utils/signature/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Signature uploaded successfully');
        // Update formData with the signature file path for the profile update
        setFormData(prev => ({
          ...prev,
          signature: response.data.data.file_path
        }));
        return response.data.data.file_path;
      }
    } catch (error: any) {
      console.error('Failed to upload signature:', error);
      toast.error('Failed to upload signature');
      throw error;
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
        toast.error('Please select an image or PDF file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSignatureFile(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSignaturePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // First upload signature if selected
      if (signatureFile) {
        await handleSignatureUpload(signatureFile);
      }

      // Update profile data
      const updatedProfile = await doctorApi.updateCurrentDoctorProfile(formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      
      // Clear signature file and preview
      setSignatureFile(null);
      setSignaturePreview(null);
      
      // Refresh the profile data to ensure we have the latest information
      try {
        const refreshedProfile = await doctorApi.getCurrentDoctorProfile();
        onProfileUpdate(refreshedProfile);
      } catch (refreshError) {
        console.log('Failed to refresh profile, using updated data:', refreshError);
        onProfileUpdate(updatedProfile);
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      
      // Handle validation errors
      if (error.response?.status === 400) {
        const errorData = error.response?.data;
        if (errorData?.error?.details) {
          // Display specific field validation errors
          const fieldErrors = errorData.error.details;
          Object.keys(fieldErrors).forEach(field => {
            const fieldError = fieldErrors[field];
            if (Array.isArray(fieldError)) {
              toast.error(`${field}: ${fieldError[0]}`);
            } else {
              toast.error(`${field}: ${fieldError}`);
            }
          });
        } else if (errorData?.error?.message) {
          toast.error(errorData.error.message);
        } else {
          toast.error('Invalid profile data. Please check your input.');
        }
      } else if (error.response?.status === 404) {
        toast.error('Profile update endpoint not found. Please contact support.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to update your profile.');
      } else if (error.response?.data?.error?.message) {
        toast.error(error.response.data.error.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSignatureFile(null);
    setSignaturePreview(null);
    // Reset form data to original profile
    if (profile) {
      setFormData({
        user_name: profile.user_name || '',
        user_email: profile.user_email || '',
        license_number: profile.license_number || '',
        qualification: profile.qualification || '',
        specialization: profile.specialization || '',
        sub_specialization: profile.sub_specialization || '',
        experience_years: profile.experience_years || 0,
        consultation_fee: profile.consultation_fee || 0,
        online_consultation_fee: profile.online_consultation_fee || 0,
        languages_spoken: profile.languages_spoken || [],
        bio: profile.bio || '',
        achievements: profile.achievements || '',
        consultation_duration: profile.consultation_duration || 30,
        is_online_consultation_available: profile.is_online_consultation_available || false,
        clinic_name: profile.clinic_name || '',
        clinic_address: profile.clinic_address || '',
        date_of_birth: profile.date_of_birth || '',
        date_of_anniversary: profile.date_of_anniversary || '',
        is_accepting_patients: profile.is_accepting_patients || true,
      });
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Profile</h1>
          <p className="text-muted-foreground">Manage your professional profile and settings</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="relative mx-auto mb-4">
                                 <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-lg">
                   <AvatarImage src={profile.profile_picture} alt={profile.user_name || 'Doctor'} />
                   <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-[#E17726] to-[#c9651e] text-white">
                     {(profile.user_name || 'Doctor').charAt(0)}
                   </AvatarFallback>
                 </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-white border-2 border-[#E17726]"
                  >
                    <Camera className="w-4 h-4 text-[#E17726]" />
                  </Button>
                )}
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">
                {isEditing ? (
                  <Input
                    value={formData.user_name || ''}
                    onChange={(e) => handleInputChange('user_name', e.target.value)}
                    className="text-center text-xl font-bold"
                  />
                                 ) : (
                   profile.user_name || 'Doctor'
                 )}
              </CardTitle>
                             <div className="flex items-center justify-center gap-2 mt-2">
                 <Star className="w-4 h-4 text-yellow-500 fill-current" />
                 <span className="font-semibold">{(typeof profile.rating === 'number' ? profile.rating : 0).toFixed(1)}</span>
                 <span className="text-gray-600">({profile.total_reviews || 0} reviews)</span>
               </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 justify-center">
                {profile.is_verified && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {profile.is_active && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    Active
                  </Badge>
                )}
                {profile.is_accepting_patients && (
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    Accepting Patients
                  </Badge>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{profile.user_phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{profile.user_email || 'No email'}</span>
                </div>
                {profile.clinic_address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{profile.clinic_address}</span>
                  </div>
                )}
              </div>

              {/* Signature Section */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileSignature className="w-4 h-4" />
                  Digital Signature
                </h4>
                {profile.signature_url ? (
                  <div className="text-center">
                    <img 
                      src={profile.signature_url} 
                      alt="Doctor Signature" 
                      className="max-w-full h-16 mx-auto border rounded"
                    />
                    <p className="text-xs text-gray-500 mt-1">Current Signature</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center">No signature uploaded</p>
                )}
                
                {isEditing && (
                  <div className="mt-3">
                    <input
                      type="file"
                      id="signature-upload"
                      accept="image/*,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="signature-upload"
                      className="block w-full text-center px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      {uploadingSignature ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        <Upload className="w-4 h-4 mx-auto" />
                      )}
                      <span className="text-sm">Upload Signature</span>
                    </label>
                    {signaturePreview && (
                      <div className="mt-2 text-center">
                        <img 
                          src={signaturePreview} 
                          alt="Signature Preview" 
                          className="max-w-full h-12 mx-auto border rounded"
                        />
                        <p className="text-xs text-gray-500">Preview</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>License Number</Label>
                  {isEditing ? (
                    <Input
                      value={formData.license_number || ''}
                      onChange={(e) => handleInputChange('license_number', e.target.value)}
                      placeholder="Enter license number"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.license_number || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <Label>Qualification</Label>
                  {isEditing ? (
                    <Select value={formData.qualification || ''} onValueChange={(value) => handleInputChange('qualification', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        {qualifications.map(qual => (
                          <SelectItem key={qual} value={qual}>{qual}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.qualification || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <Label>Specialization</Label>
                  {isEditing ? (
                    <Select value={formData.specialization || ''} onValueChange={(value) => handleInputChange('specialization', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {specializations.map(spec => (
                          <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.specialization || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <Label>Sub-specialization</Label>
                  {isEditing ? (
                    <Input
                      value={formData.sub_specialization || ''}
                      onChange={(e) => handleInputChange('sub_specialization', e.target.value)}
                      placeholder="Enter sub-specialization"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.sub_specialization || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <Label>Experience (Years)</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.experience_years || 0}
                      onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value))}
                      min="0"
                      max="50"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.experience_years} years</p>
                  )}
                </div>

                <div>
                  <Label>Date of Birth</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={formData.date_of_birth || ''}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Consultation Fee (₹)</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.consultation_fee || 0}
                      onChange={(e) => handleInputChange('consultation_fee', parseInt(e.target.value))}
                      min="0"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">₹{profile.consultation_fee}</p>
                  )}
                </div>

                <div>
                  <Label>Online Consultation Fee (₹)</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.online_consultation_fee || 0}
                      onChange={(e) => handleInputChange('online_consultation_fee', parseInt(e.target.value))}
                      min="0"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">₹{profile.online_consultation_fee || profile.consultation_fee}</p>
                  )}
                </div>

                <div>
                  <Label>Consultation Duration (minutes)</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.consultation_duration || 30}
                      onChange={(e) => handleInputChange('consultation_duration', parseInt(e.target.value))}
                      min="15"
                      max="120"
                      step="15"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.consultation_duration || 30} minutes</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="online_consultation"
                    checked={formData.is_online_consultation_available || false}
                    onChange={(e) => handleInputChange('is_online_consultation_available', e.target.checked)}
                    disabled={!isEditing}
                    className="rounded"
                  />
                  <Label htmlFor="online_consultation">Available for Online Consultation</Label>
                </div>
              </div>

              <div>
                <Label>Languages Spoken</Label>
                {isEditing ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {languages.map(language => (
                      <div key={language} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`lang-${language}`}
                          checked={(formData.languages_spoken || []).includes(language)}
                          onChange={(e) => handleLanguageChange(language, e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor={`lang-${language}`} className="text-sm">{language}</Label>
                      </div>
                    ))}
                  </div>
                                 ) : (
                   <div className="flex flex-wrap gap-2 mt-2">
                     {(profile.languages_spoken || []).map(lang => (
                       <Badge key={lang} variant="outline">{lang}</Badge>
                     ))}
                   </div>
                 )}
              </div>
            </CardContent>
          </Card>

          {/* Clinic Information */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Clinic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Clinic Name</Label>
                  {isEditing ? (
                    <Input
                      value={formData.clinic_name || ''}
                      onChange={(e) => handleInputChange('clinic_name', e.target.value)}
                      placeholder="Enter clinic name"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.clinic_name || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <Label>Clinic Address</Label>
                  {isEditing ? (
                    <Textarea
                      value={formData.clinic_address || ''}
                      onChange={(e) => handleInputChange('clinic_address', e.target.value)}
                      placeholder="Enter clinic address"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.clinic_address || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio and Achievements */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Bio & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Bio</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell patients about your experience and approach..."
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700">{profile.bio || 'No bio provided'}</p>
                )}
              </div>

              <div>
                <Label>Achievements & Awards</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.achievements || ''}
                    onChange={(e) => handleInputChange('achievements', e.target.value)}
                    placeholder="List your achievements, awards, and recognitions..."
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700">{profile.achievements || 'No achievements listed'}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileTab;
