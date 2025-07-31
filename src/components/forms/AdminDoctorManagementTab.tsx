import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Star,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Stethoscope,
  Award,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  FileText,
  Shield,
  Eye,
  UserPlus,
  Settings,
  Activity,
  Building2,
  Users,
  DollarSign,
  Video,
  Upload,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { get, post, put, del } from '@/lib/api';

interface Doctor {
  id: number;
  user: string;
  user_name: string;
  user_phone: string;
  user_email: string;
  license_number: string;
  qualification: string;
  specialization: string;
  sub_specialization?: string;
  consultation_fee: string;
  online_consultation_fee?: string | null;
  experience_years: number;
  clinic_name?: string;
  clinic_address?: string;
  bio?: string;
  languages_spoken: string[];
  consultation_duration: number;
  is_online_consultation_available: boolean;
  is_verified: boolean;
  is_active: boolean;
  is_accepting_patients: boolean;
  rating: string;
  total_reviews: number;
  created_at: string;
  updated_at: string;
  meeting_link?: string;
  profile_picture?: string;
}

interface DoctorStats {
  total_doctors: number;
  active_doctors: number;
  new_this_month: number;
  avg_rating: string;
  verified_doctors: number;
  specialization_distribution: Record<string, number>;
  experience_distribution: Record<string, number>;
  average_consultation_fee: string;
  top_rated_doctors: Doctor[];
  consultation_stats: {
    total_consultations: number;
    avg_consultations_per_doctor: number;
    consultation_completion_rate: number;
  };
}

const AdminDoctorManagementTab = () => {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stats, setStats] = useState<DoctorStats>({
    total_doctors: 0,
    active_doctors: 0,
    new_this_month: 0,
    avg_rating: "0.0",
    verified_doctors: 0,
    specialization_distribution: {},
    experience_distribution: {},
    average_consultation_fee: "0.00",
    top_rated_doctors: [],
    consultation_stats: {
      total_consultations: 0,
      avg_consultations_per_doctor: 0,
      consultation_completion_rate: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile image state
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [currentProfileImage, setCurrentProfileImage] = useState<string | null>(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    license_number: '',
    qualification: '',
    specialization: '',
    sub_specialization: '',
    experience_years: '',
    consultation_fee: '',
    online_consultation_fee: '',
    consultation_duration: '30',
    clinic_name: '',
    clinic_address: '',
    bio: '',
    languages_spoken: '',
    is_online_consultation_available: true,
    is_accepting_patients: true
  });

  // Profile image handlers
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed:', e.target.files);
    const file = e.target.files?.[0] || null;
    console.log('Selected file:', file);
    setProfileImage(file);
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('FileReader result:', reader.result);
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
      setProfileImagePreview(null);
    }
  };

  const handleRemoveProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
    setCurrentProfileImage(null);
  };

  // Fetch doctors data
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response: any = await get('/api/doctors/superadmin/');
      // Handle the nested response structure
      const doctorsData = response.results?.data || response.results || [];
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load doctors',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response: any = await get('/api/doctors/stats/');
      // Handle the nested response structure
      const statsData = response.data || response;
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchStats();
  }, []);

  // Filter doctors based on search and status
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.user_phone.includes(searchTerm) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && doctor.is_active) ||
                         (filterStatus === 'inactive' && !doctor.is_active) ||
                         (filterStatus === 'verified' && doctor.is_verified) ||
                         (filterStatus === 'unverified' && !doctor.is_verified);

    return matchesSearch && matchesStatus;
  });

  // Handle create doctor
  const handleCreateDoctor = async () => {
    try {
      setIsSubmitting(true);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'consultation_fee') {
          formDataToSend.append(key, parseFloat(value as string).toString());
        } else if (key === 'online_consultation_fee' && value) {
          formDataToSend.append(key, parseFloat(value as string).toString());
        } else if (key === 'experience_years') {
          formDataToSend.append(key, parseInt(value as string).toString());
        } else if (key === 'consultation_duration') {
          formDataToSend.append(key, parseInt(value as string).toString());
        } else if (key === 'languages_spoken') {
          formDataToSend.append(key, (value as string).split(',').map(lang => lang.trim()).filter(lang => lang.length > 0).join(','));
        } else if (typeof value === 'boolean') {
          formDataToSend.append(key, value.toString());
        } else {
          formDataToSend.append(key, value as string);
        }
      });
      
      // Add profile image if selected
      if (profileImage) {
        formDataToSend.append('profile_picture', profileImage);
        console.log('Profile image added to FormData:', profileImage.name, profileImage.size);
      } else {
        console.log('No profile image selected');
      }
      
      // Debug: Log all FormData entries
      console.log('FormData contents:');
      for (const [key, value] of formDataToSend.entries()) {
        console.log(key, ':', value);
      }
      
      const response = await post('/api/doctors/superadmin/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast({
        title: 'Success',
        description: 'Doctor created successfully',
      });
      
      setShowCreateDialog(false);
      resetForm();
      setProfileImage(null);
      setProfileImagePreview(null);
      fetchDoctors();
      fetchStats();
    } catch (error) {
      console.error('Error creating doctor:', error);
      toast({
        title: 'Error',
        description: 'Failed to create doctor',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit doctor
  const handleEditDoctor = async () => {
    if (!selectedDoctor) return;
    
    try {
      setIsSubmitting(true);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'consultation_fee') {
          formDataToSend.append(key, parseFloat(value as string).toString());
        } else if (key === 'online_consultation_fee' && value) {
          formDataToSend.append(key, parseFloat(value as string).toString());
        } else if (key === 'experience_years') {
          formDataToSend.append(key, parseInt(value as string).toString());
        } else if (key === 'consultation_duration') {
          formDataToSend.append(key, parseInt(value as string).toString());
        } else if (key === 'languages_spoken') {
          formDataToSend.append(key, (value as string).split(',').map(lang => lang.trim()).filter(lang => lang.length > 0).join(','));
        } else if (typeof value === 'boolean') {
          formDataToSend.append(key, value.toString());
        } else {
          formDataToSend.append(key, value as string);
        }
      });
      
      // Add profile image if selected
      if (profileImage) {
        formDataToSend.append('profile_picture', profileImage);
        console.log('Profile image added to FormData (edit):', profileImage.name, profileImage.size);
      } else {
        console.log('No profile image selected for edit');
      }
      
      // Debug: Log all FormData entries
      console.log('FormData contents (edit):');
      for (const [key, value] of formDataToSend.entries()) {
        console.log(key, ':', value);
      }
      
      const response = await put(`/api/doctors/superadmin/${selectedDoctor.id}/`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast({
        title: 'Success',
        description: 'Doctor updated successfully',
      });
      
      setShowEditDialog(false);
      resetForm();
      setProfileImage(null);
      setProfileImagePreview(null);
      setCurrentProfileImage(null);
      fetchDoctors();
      fetchStats();
    } catch (error) {
      console.error('Error updating doctor:', error);
      toast({
        title: 'Error',
        description: 'Failed to update doctor',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete doctor
  const handleDeleteDoctor = async () => {
    if (!selectedDoctor) return;
    
    try {
      setIsSubmitting(true);
      await del(`/api/doctors/superadmin/${selectedDoctor.id}/`);
      
      toast({
        title: 'Success',
        description: 'Doctor deleted successfully',
      });
      
      setShowDeleteDialog(false);
      fetchDoctors();
      fetchStats();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete doctor',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      license_number: '',
      qualification: '',
      specialization: '',
      sub_specialization: '',
      experience_years: '',
      consultation_fee: '',
      online_consultation_fee: '',
      consultation_duration: '30',
      clinic_name: '',
      clinic_address: '',
      bio: '',
      languages_spoken: '',
      is_online_consultation_available: true,
      is_accepting_patients: true
    });
    setProfileImage(null);
    setProfileImagePreview(null);
    setCurrentProfileImage(null);
  };

  // Open edit dialog
  const openEditDialog = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      name: doctor.user_name,
      phone: doctor.user_phone,
      email: doctor.user_email,
      license_number: doctor.license_number,
      qualification: doctor.qualification,
      specialization: doctor.specialization,
      sub_specialization: doctor.sub_specialization || '',
      experience_years: doctor.experience_years.toString(),
      consultation_fee: doctor.consultation_fee,
      online_consultation_fee: doctor.online_consultation_fee || '',
      consultation_duration: doctor.consultation_duration.toString(),
      clinic_name: doctor.clinic_name || '',
      clinic_address: doctor.clinic_address || '',
      bio: doctor.bio || '',
      languages_spoken: doctor.languages_spoken.join(', '),
      is_online_consultation_available: doctor.is_online_consultation_available,
      is_accepting_patients: doctor.is_accepting_patients
    });
    setCurrentProfileImage(doctor.profile_picture || null);
    setProfileImage(null);
    setProfileImagePreview(null);
    setShowEditDialog(true);
  };

  // Open view dialog
  const openViewDialog = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowViewDialog(true);
  };

  // Open delete dialog
  const openDeleteDialog = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDeleteDialog(true);
  };

  const getStatusColor = (isVerified: boolean, isActive: boolean) => {
    if (!isVerified) return 'bg-yellow-100 text-yellow-800';
    if (isActive) return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (isVerified: boolean, isActive: boolean) => {
    if (!isVerified) return 'Pending Verification';
    if (isActive) return 'Active';
    return 'Inactive';
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors: { [key: string]: string } = {
      'Cardiology': 'bg-red-100 text-red-800',
      'Dermatology': 'bg-purple-100 text-purple-800',
      'Orthopedics': 'bg-blue-100 text-blue-800',
      'Pediatrics': 'bg-pink-100 text-pink-800',
      'Neurology': 'bg-indigo-100 text-indigo-800',
      'General Medicine': 'bg-green-100 text-green-800',
      'Psychiatry': 'bg-orange-100 text-orange-800',
      'Gynecology': 'bg-rose-100 text-rose-800'
    };
    return colors[specialty] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-midnight">Doctor Management</h2>
          <p className="text-gray-600">Manage doctors in your clinic</p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-[#E17726] hover:bg-[#c9651e] text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Doctor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Doctors</p>
                <p className="text-2xl font-bold text-midnight">{stats.total_doctors}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Active Doctors</p>
                <p className="text-2xl font-bold text-midnight">{stats.active_doctors}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Verified Doctors</p>
                <p className="text-2xl font-bold text-midnight">{stats.verified_doctors}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
                <p className="text-2xl font-bold text-midnight">₹{parseFloat(stats.average_consultation_fee).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E17726]/10 to-[#E17726]/5 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#E17726]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search doctors by name, phone, or specialization..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-11 px-4 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
            >
              <option value="all">All Doctors</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Doctors List */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-midnight">Doctors ({filteredDoctors.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No doctors found</p>
            </div>
          ) : (
            filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  {doctor.profile_picture ? (
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={doctor.profile_picture} alt={doctor.user_name} />
                      <AvatarFallback className="bg-[#E17726] text-white">
                        <User className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-12 h-12 bg-[#E17726] rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-midnight">{doctor.user_name}</h4>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {doctor.user_phone}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {doctor.user_email}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getSpecialtyColor(doctor.specialization)}>
                        {doctor.specialization}
                      </Badge>
                      {doctor.sub_specialization && (
                        <Badge variant="outline" className="text-xs">
                          {doctor.sub_specialization}
                        </Badge>
                      )}
                      <Badge className={getStatusColor(doctor.is_verified, doctor.is_active)}>
                        {getStatusText(doctor.is_verified, doctor.is_active)}
                      </Badge>
                    </div>
                    {doctor.clinic_name && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <Building2 className="w-3 h-3 mr-1" />
                        {doctor.clinic_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-semibold text-midnight">₹{doctor.consultation_fee}</div>
                    {doctor.online_consultation_fee && (
                      <div className="text-xs text-gray-500">Online: ₹{doctor.online_consultation_fee}</div>
                    )}
                    <div className="text-sm text-gray-600">{doctor.experience_years} years exp.</div>
                    <div className="text-xs text-gray-500">{doctor.consultation_duration} min</div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-3 h-3 mr-1 text-yellow-500" />
                      {parseFloat(doctor.rating).toFixed(1)} ({doctor.total_reviews})
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      {doctor.is_online_consultation_available && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                          Online
                        </Badge>
                      )}
                      {doctor.is_accepting_patients && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => openViewDialog(doctor)}
                      className="rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => openEditDialog(doctor)}
                      className="rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => openDeleteDialog(doctor)}
                      className="rounded-lg border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Create Doctor Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto !fixed !top-4 !right-4 !left-auto !translate-x-0 !translate-y-0">
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
            <DialogDescription>
              Register a new doctor to your clinic
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Dr. John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+91-9876543210"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="doctor@email.com"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="license">License Number *</Label>
                <Input
                  id="license"
                  value={formData.license_number}
                  onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                  placeholder="Medical license number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="qualification">Qualification *</Label>
                <Input
                  id="qualification"
                  value={formData.qualification}
                  onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                  placeholder="MD, MS, etc."
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="specialization">Specialization *</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  placeholder="Select Specialty"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sub_specialization">Sub-Specialization</Label>
                <Input
                  id="sub_specialization"
                  value={formData.sub_specialization}
                  onChange={(e) => setFormData({...formData, sub_specialization: e.target.value})}
                  placeholder="e.g., Interventional Cardiology"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience">Experience (Years)</Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({...formData, experience_years: e.target.value})}
                  placeholder="Years of experience"
                />
              </div>
              <div>
                <Label htmlFor="consultation_fee">Consultation Fee *</Label>
                <Input
                  id="consultation_fee"
                  type="number"
                  value={formData.consultation_fee}
                  onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                  placeholder="₹1500"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="online_consultation_fee">Online Consultation Fee</Label>
                <Input
                  id="online_consultation_fee"
                  type="number"
                  value={formData.online_consultation_fee}
                  onChange={(e) => setFormData({...formData, online_consultation_fee: e.target.value})}
                  placeholder="₹1200"
                />
              </div>
              <div>
                <Label htmlFor="consultation_duration">Consultation Duration (minutes)</Label>
                <Input
                  id="consultation_duration"
                  type="number"
                  value={formData.consultation_duration}
                  onChange={(e) => setFormData({...formData, consultation_duration: e.target.value})}
                  placeholder="30"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clinic_name">Clinic Name</Label>
                <Input
                  id="clinic_name"
                  value={formData.clinic_name}
                  onChange={(e) => setFormData({...formData, clinic_name: e.target.value})}
                  placeholder="Heart Care Clinic"
                />
              </div>
              <div>
                <Label htmlFor="clinic_address">Clinic Address</Label>
                <Input
                  id="clinic_address"
                  value={formData.clinic_address}
                  onChange={(e) => setFormData({...formData, clinic_address: e.target.value})}
                  placeholder="123 Medical Center, City, State"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Brief description about the doctor..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="online_consultation"
                  checked={formData.is_online_consultation_available}
                  onCheckedChange={(checked) => setFormData({...formData, is_online_consultation_available: checked as boolean})}
                />
                <Label htmlFor="online_consultation">Online Consultation Available</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accepting_patients"
                  checked={formData.is_accepting_patients}
                  onCheckedChange={(checked) => setFormData({...formData, is_accepting_patients: checked as boolean})}
                />
                <Label htmlFor="accepting_patients">Active Status</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="languages">Languages (comma separated)</Label>
              <Input
                id="languages"
                value={formData.languages_spoken}
                onChange={(e) => setFormData({...formData, languages_spoken: e.target.value})}
                placeholder="English, Hindi"
              />
            </div>
            
            {/* Profile Image Upload */}
            <div>
              <Label htmlFor="profile_picture">Profile Picture</Label>
              <div className="mt-2 space-y-4">
                {/* Debug info */}
                <div className="text-xs text-gray-500">
                  Debug: profileImage={profileImage ? 'File selected' : 'null'}, 
                  profileImagePreview={profileImagePreview ? 'Preview available' : 'null'}, 
                  currentProfileImage={currentProfileImage ? 'Current image' : 'null'}
                </div>
                {/* Current/Preview Image */}
                {(currentProfileImage || profileImagePreview) && (
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage 
                        src={profileImagePreview || currentProfileImage || ''} 
                        alt="Profile Preview" 
                      />
                      <AvatarFallback>
                        <User className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveProfileImage}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                )}
                
                {/* File Input */}
                <div className="flex items-center space-x-4">
                  <Input
                    id="profile_picture"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('profile_picture')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Upload a profile picture (JPG, PNG, GIF). Max size: 5MB
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateDoctor}
              disabled={isSubmitting}
              className="bg-[#E17726] hover:bg-[#c9651e] text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create Doctor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Doctor Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto !fixed !top-4 !right-4 !left-auto !translate-x-0 !translate-y-0">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
            <DialogDescription>
              Update doctor information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Dr. John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone *</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+91-9876543210"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="doctor@email.com"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-license">License Number *</Label>
                <Input
                  id="edit-license"
                  value={formData.license_number}
                  onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                  placeholder="Medical license number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-qualification">Qualification *</Label>
                <Input
                  id="edit-qualification"
                  value={formData.qualification}
                  onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                  placeholder="MD, MS, etc."
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-specialization">Specialization *</Label>
                <Input
                  id="edit-specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  placeholder="Select Specialty"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-sub_specialization">Sub-Specialization</Label>
                <Input
                  id="edit-sub_specialization"
                  value={formData.sub_specialization}
                  onChange={(e) => setFormData({...formData, sub_specialization: e.target.value})}
                  placeholder="e.g., Interventional Cardiology"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-experience">Experience (Years)</Label>
                <Input
                  id="edit-experience"
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({...formData, experience_years: e.target.value})}
                  placeholder="Years of experience"
                />
              </div>
              <div>
                <Label htmlFor="edit-consultation_fee">Consultation Fee *</Label>
                <Input
                  id="edit-consultation_fee"
                  type="number"
                  value={formData.consultation_fee}
                  onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                  placeholder="₹1500"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-online_consultation_fee">Online Consultation Fee</Label>
                <Input
                  id="edit-online_consultation_fee"
                  type="number"
                  value={formData.online_consultation_fee}
                  onChange={(e) => setFormData({...formData, online_consultation_fee: e.target.value})}
                  placeholder="₹1200"
                />
              </div>
              <div>
                <Label htmlFor="edit-consultation_duration">Consultation Duration (minutes)</Label>
                <Input
                  id="edit-consultation_duration"
                  type="number"
                  value={formData.consultation_duration}
                  onChange={(e) => setFormData({...formData, consultation_duration: e.target.value})}
                  placeholder="30"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-clinic_name">Clinic Name</Label>
                <Input
                  id="edit-clinic_name"
                  value={formData.clinic_name}
                  onChange={(e) => setFormData({...formData, clinic_name: e.target.value})}
                  placeholder="Heart Care Clinic"
                />
              </div>
              <div>
                <Label htmlFor="edit-clinic_address">Clinic Address</Label>
                <Input
                  id="edit-clinic_address"
                  value={formData.clinic_address}
                  onChange={(e) => setFormData({...formData, clinic_address: e.target.value})}
                  placeholder="123 Medical Center, City, State"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Brief description about the doctor..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-online_consultation"
                  checked={formData.is_online_consultation_available}
                  onCheckedChange={(checked) => setFormData({...formData, is_online_consultation_available: checked as boolean})}
                />
                <Label htmlFor="edit-online_consultation">Online Consultation Available</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-accepting_patients"
                  checked={formData.is_accepting_patients}
                  onCheckedChange={(checked) => setFormData({...formData, is_accepting_patients: checked as boolean})}
                />
                <Label htmlFor="edit-accepting_patients">Active Status</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-languages">Languages (comma separated)</Label>
              <Input
                id="edit-languages"
                value={formData.languages_spoken}
                onChange={(e) => setFormData({...formData, languages_spoken: e.target.value})}
                placeholder="English, Hindi"
              />
            </div>
            
            {/* Profile Image Upload */}
            <div>
              <Label htmlFor="edit-profile_picture">Profile Picture</Label>
              <div className="mt-2 space-y-4">
                {/* Debug info */}
                <div className="text-xs text-gray-500">
                  Debug: profileImage={profileImage ? 'File selected' : 'null'}, 
                  profileImagePreview={profileImagePreview ? 'Preview available' : 'null'}, 
                  currentProfileImage={currentProfileImage ? 'Current image' : 'null'}
                </div>
                {/* Current/Preview Image */}
                {(currentProfileImage || profileImagePreview) && (
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage 
                        src={profileImagePreview || currentProfileImage || ''} 
                        alt="Profile Preview" 
                      />
                      <AvatarFallback>
                        <User className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveProfileImage}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                )}
                
                {/* File Input */}
                <div className="flex items-center space-x-4">
                  <Input
                    id="edit-profile_picture"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('edit-profile_picture')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Upload a profile picture (JPG, PNG, GIF). Max size: 5MB
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditDoctor}
              disabled={isSubmitting}
              className="bg-[#E17726] hover:bg-[#c9651e] text-white"
            >
              {isSubmitting ? 'Updating...' : 'Update Doctor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Doctor Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto !fixed !top-4 !right-4 !left-auto !translate-x-0 !translate-y-0">
          <DialogHeader>
            <DialogTitle>Doctor Details</DialogTitle>
          </DialogHeader>
          {selectedDoctor && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {selectedDoctor.profile_picture ? (
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedDoctor.profile_picture} alt={selectedDoctor.user_name} />
                    <AvatarFallback className="bg-[#E17726] text-white">
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-16 h-16 bg-[#E17726] rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-midnight">{selectedDoctor.user_name}</h3>
                  <p className="text-gray-600">{selectedDoctor.specialization}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getStatusColor(selectedDoctor.is_verified, selectedDoctor.is_active)}>
                      {getStatusText(selectedDoctor.is_verified, selectedDoctor.is_active)}
                    </Badge>
                    <Badge className={getSpecialtyColor(selectedDoctor.specialization)}>
                      {selectedDoctor.specialization}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <p className="text-midnight">{selectedDoctor.user_phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-midnight">{selectedDoctor.user_email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">License Number</Label>
                  <p className="text-midnight">{selectedDoctor.license_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Qualification</Label>
                  <p className="text-midnight">{selectedDoctor.qualification}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Sub-Specialization</Label>
                  <p className="text-midnight">{selectedDoctor.sub_specialization || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Experience</Label>
                  <p className="text-midnight">{selectedDoctor.experience_years} years</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Consultation Fee</Label>
                  <p className="text-midnight">₹{selectedDoctor.consultation_fee}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Online Consultation Fee</Label>
                  <p className="text-midnight">₹{selectedDoctor.online_consultation_fee || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Consultation Duration</Label>
                  <p className="text-midnight">{selectedDoctor.consultation_duration} minutes</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Clinic Name</Label>
                  <p className="text-midnight">{selectedDoctor.clinic_name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Clinic Address</Label>
                  <p className="text-midnight">{selectedDoctor.clinic_address || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Languages</Label>
                  <p className="text-midnight">{selectedDoctor.languages_spoken.join(', ')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Rating</Label>
                  <p className="text-midnight flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    {parseFloat(selectedDoctor.rating).toFixed(1)} ({selectedDoctor.total_reviews} reviews)
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Online Consultation</Label>
                  <p className="text-midnight">{selectedDoctor.is_online_consultation_available ? 'Available' : 'Not Available'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Accepting Patients</Label>
                  <p className="text-midnight">{selectedDoctor.is_accepting_patients ? 'Yes' : 'No'}</p>
                </div>
              </div>
              
              {selectedDoctor.bio && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Bio</Label>
                  <p className="text-midnight">{selectedDoctor.bio}</p>
                </div>
              )}
              {selectedDoctor.meeting_link && (
                <div className="mt-4">
                  <a href={selectedDoctor.meeting_link} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                      <Video className="w-4 h-4 mr-2" />
                      Join Doctor’s Room
                    </Button>
                  </a>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="!fixed !top-4 !right-4 !left-auto !translate-x-0 !translate-y-0">
          <DialogHeader>
            <DialogTitle>Delete Doctor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedDoctor?.user_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteDoctor}
              disabled={isSubmitting}
              variant="destructive"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Doctor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDoctorManagementTab; 