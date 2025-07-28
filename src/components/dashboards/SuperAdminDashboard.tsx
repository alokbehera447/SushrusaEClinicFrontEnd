import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Building2, 
  UserCog, 
  Stethoscope, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Activity,
  BarChart3,
  Plus,
  Search,
  Filter,
  Settings,
  Bell,
  Download,
  Edit,
  Trash2,
  Eye,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Award,
  FileText,
  PieChart,
  LineChart,
  BarChart,
  TrendingDown,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Globe,
  ClipboardList,
  Image,
  AlignLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { superAdminApi, UserProfile, EClinic, CreateEClinicData } from '@/lib/api';
import { api } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { doctorApi, CreateDoctorUserData, CreateDoctorProfileData, DoctorProfile } from '@/lib/api';
import ManageAdmins from './ManageAdmins';

// Doctors Management Component
const DoctorsManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    is_active: undefined as boolean | undefined,
    is_verified: undefined as boolean | undefined,
    specialization: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorProfile | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<DoctorProfile | null>(null);
  const [viewingDoctor, setViewingDoctor] = useState<DoctorProfile | null>(null);
  const { toast } = useToast();

  // Doctor form state
  const [doctorForm, setDoctorForm] = useState({
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
    consultation_duration: '30',
    is_online_consultation_available: true,
    is_active: true,
  });

  // Add state for profile image
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  // Handler for profile image change
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

  // Fetch doctors list
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const data = await doctorApi.getDoctors({ 
        is_active: filters.is_active, 
        search: searchTerm,
        is_verified: filters.is_verified,
        specialization: filters.specialization
      });
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load doctors', variant: 'destructive' });
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [searchTerm, filters]);

  // Enhanced validation helper
  const validateDoctorForm = () => {
    const errors: string[] = [];
    
    // Required field validation
    if (!doctorForm.name.trim()) errors.push('Full name is required');
    if (!doctorForm.phone.trim()) errors.push('Phone number is required');
    if (!doctorForm.license_number.trim()) errors.push('License number is required');
    if (!doctorForm.qualification.trim()) errors.push('Qualification is required');
    if (!doctorForm.specialization) errors.push('Specialization is required');
    
    // Phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(doctorForm.phone.replace(/\s/g, ''))) {
      errors.push('Please enter a valid phone number');
    }
    
    // Email validation
    if (doctorForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doctorForm.email)) {
      errors.push('Please enter a valid email address');
    }
    
    // Numeric field validation
    const consultationFee = parseFloat(doctorForm.consultation_fee);
    const onlineConsultationFee = parseFloat(doctorForm.online_consultation_fee);
    const experienceYears = parseInt(doctorForm.experience_years);
    const consultationDuration = parseInt(doctorForm.consultation_duration);
    
    if (isNaN(consultationFee) || consultationFee < 0) {
      errors.push('Please enter a valid consultation fee');
    }
    
    if (isNaN(onlineConsultationFee) || onlineConsultationFee < 0) {
      errors.push('Please enter a valid online consultation fee');
    }
    
    if (isNaN(experienceYears) || experienceYears < 0 || experienceYears > 50) {
      errors.push('Please enter a valid experience (0-50 years)');
    }
    
    if (isNaN(consultationDuration) || consultationDuration < 15 || consultationDuration > 120) {
      errors.push('Please enter a valid consultation duration (15-120 minutes)');
    }
    
    return errors;
  };

  // Enhanced form submission with validation
  const handleFormSubmit = async () => {
    const validationErrors = validateDoctorForm();
    
    if (validationErrors.length > 0) {
      toast({ 
        title: 'Validation Error', 
        description: validationErrors.join(', '), 
        variant: 'destructive' 
      });
      return;
    }
    
    if (editingDoctor) {
      await handleUpdateDoctor();
    } else {
      await handleCreateDoctor();
    }
  };

  // Handle doctor creation
  const handleCreateDoctor = async () => {
    try {
      setLoading(true);
      const combinedData = {
        ...doctorForm,
        consultation_fee: parseFloat(doctorForm.consultation_fee),
        online_consultation_fee: parseFloat(doctorForm.online_consultation_fee),
        experience_years: parseInt(doctorForm.experience_years),
        consultation_duration: parseInt(doctorForm.consultation_duration),
      };
      const formData = new FormData();
      Object.entries(combinedData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value as any);
        }
      });
      if (profileImage) {
        formData.append('profile_picture', profileImage);
      }
      const result = await doctorApi.createDoctor(formData);
      
      toast({ 
        title: 'Doctor Created', 
        description: `Doctor account and profile created successfully. Password: ${result.user_account.password}` 
      });
      
      setShowAddForm(false);
      resetForm();
      setProfileImage(null);
      setProfileImagePreview(null);
      fetchDoctors();
    } catch (error: unknown) {
      let message = 'Failed to create doctor';
      const err = error as any;
      if (err && err.response && err.response.data && err.response.data.error && err.response.data.error.message) {
        message = err.response.data.error.message;
      }
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Load doctor data for editing
  const loadDoctorForEdit = (doctor: DoctorProfile) => {
    console.log('Editing doctor:', doctor); // DEBUG
    
    // Ensure we have all the required fields with proper defaults
    const formData = {
      name: doctor.user_name || '',
      phone: doctor.user_phone || '',
      email: doctor.user_email || '',
      license_number: doctor.license_number || '',
      qualification: doctor.qualification || '',
      specialization: doctor.specialization || '',
      sub_specialization: doctor.sub_specialization || '',
      consultation_fee: doctor.consultation_fee ? doctor.consultation_fee.toString() : '0',
      online_consultation_fee: doctor.online_consultation_fee ? doctor.online_consultation_fee.toString() : (doctor.consultation_fee ? doctor.consultation_fee.toString() : '0'),
      experience_years: doctor.experience_years ? doctor.experience_years.toString() : '0',
      clinic_name: doctor.clinic_name || '',
      clinic_address: doctor.clinic_address || '',
      bio: doctor.bio || '',
      languages_spoken: Array.isArray(doctor.languages_spoken) ? doctor.languages_spoken : [],
      consultation_duration: doctor.consultation_duration ? doctor.consultation_duration.toString() : '30',
      is_online_consultation_available: doctor.is_online_consultation_available ?? true,
      is_active: doctor.is_active ?? true,
    };
    
    console.log('Form data to set:', formData); // DEBUG
    setEditingDoctor(doctor);
    setDoctorForm(formData);
    setShowAddForm(true); // Show the form immediately
  };

  // Handle doctor update
  const handleUpdateDoctor = async () => {
    if (!editingDoctor) {
      toast({ title: 'Error', description: 'No doctor selected for editing', variant: 'destructive' });
      return;
    }
    
    try {
      setLoading(true);
      
      // Enhanced validation
      const requiredFields = ['name', 'phone', 'license_number', 'qualification', 'specialization'];
      const missingFields = requiredFields.filter(field => !doctorForm[field as keyof typeof doctorForm]);
      
      if (missingFields.length > 0) {
        toast({ 
          title: 'Validation Error', 
          description: `Please fill in all required fields: ${missingFields.join(', ')}`, 
          variant: 'destructive' 
        });
        return;
      }

      // Validate phone number format
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(doctorForm.phone.replace(/\s/g, ''))) {
        toast({ 
          title: 'Validation Error', 
          description: 'Please enter a valid phone number', 
          variant: 'destructive' 
        });
        return;
      }

      // Validate email format if provided
      if (doctorForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doctorForm.email)) {
        toast({ 
          title: 'Validation Error', 
          description: 'Please enter a valid email address', 
          variant: 'destructive' 
        });
        return;
      }

      // Validate numeric fields
      const consultationFee = parseFloat(doctorForm.consultation_fee);
      const onlineConsultationFee = parseFloat(doctorForm.online_consultation_fee);
      const experienceYears = parseInt(doctorForm.experience_years);
      const consultationDuration = parseInt(doctorForm.consultation_duration);

      if (isNaN(consultationFee) || consultationFee < 0) {
        toast({ 
          title: 'Validation Error', 
          description: 'Please enter a valid consultation fee', 
          variant: 'destructive' 
        });
        return;
      }

      if (isNaN(onlineConsultationFee) || onlineConsultationFee < 0) {
        toast({ 
          title: 'Validation Error', 
          description: 'Please enter a valid online consultation fee', 
          variant: 'destructive' 
        });
        return;
      }

      if (isNaN(experienceYears) || experienceYears < 0 || experienceYears > 50) {
        toast({ 
          title: 'Validation Error', 
          description: 'Please enter a valid experience (0-50 years)', 
          variant: 'destructive' 
        });
        return;
      }

      if (isNaN(consultationDuration) || consultationDuration < 15 || consultationDuration > 120) {
        toast({ 
          title: 'Validation Error', 
          description: 'Please enter a valid consultation duration (15-120 minutes)', 
          variant: 'destructive' 
        });
        return;
      }
      
      const updateData = {
        name: doctorForm.name.trim(),
        phone: doctorForm.phone.trim(),
        email: doctorForm.email.trim() || undefined,
        license_number: doctorForm.license_number.trim(),
        qualification: doctorForm.qualification.trim(),
        specialization: doctorForm.specialization,
        sub_specialization: doctorForm.sub_specialization.trim() || undefined,
        consultation_fee: consultationFee,
        online_consultation_fee: onlineConsultationFee,
        experience_years: experienceYears,
        clinic_name: doctorForm.clinic_name.trim() || undefined,
        clinic_address: doctorForm.clinic_address.trim() || undefined,
        bio: doctorForm.bio.trim() || undefined,
        languages_spoken: doctorForm.languages_spoken.filter(lang => lang.trim() !== ''),
        consultation_duration: consultationDuration,
        is_online_consultation_available: doctorForm.is_online_consultation_available,
        is_active: doctorForm.is_active,
      };
      
      console.log('Updating doctor:', editingDoctor.id, updateData); // DEBUG
      
      const updatedDoctor = await doctorApi.updateDoctor(editingDoctor.id.toString(), updateData);
      
      toast({ 
        title: 'Success', 
        description: `Doctor ${updatedDoctor.user_name} updated successfully` 
      });
      
      setEditingDoctor(null);
      resetForm();
      setShowAddForm(false);
      fetchDoctors(); // Refresh the list
      fetchDoctorStats(); // Refresh stats
    } catch (error: unknown) {
      console.error('Update error:', error); // DEBUG
      let message = 'Failed to update doctor';
      const err = error as any;
      if (err?.response?.data?.error?.message) {
        message = err.response.data.error.message;
      } else if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.message) {
        message = err.message;
      }
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Handle doctor deletion
  const handleDeleteDoctor = async () => {
    if (!deletingDoctor) return;
    
    try {
      setLoading(true);
      await doctorApi.deleteDoctor(deletingDoctor.id.toString());
      
      toast({ 
        title: 'Doctor Deleted', 
        description: 'Doctor account deactivated successfully' 
      });
      
      setDeletingDoctor(null);
      fetchDoctors();
    } catch (error: unknown) {
      let message = 'Failed to delete doctor';
      const err = error as any;
      if (err && err.response && err.response.data && err.response.data.error && err.response.data.error.message) {
        message = err.response.data.error.message;
      }
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setDoctorForm({
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
      languages_spoken: [],
      consultation_duration: '30',
      is_online_consultation_available: true,
      is_active: true,
    });
  };

  const [doctorStats, setDoctorStats] = useState([
    { label: 'Total Doctors', value: '0', change: '+0', icon: Stethoscope, color: 'text-[#E17726]' },
    { label: 'Active Doctors', value: '0', change: '+0', icon: Activity, color: 'text-green-600' },
    { label: 'Verified Doctors', value: '0', change: '+0', icon: CheckCircle, color: 'text-purple-600' },
    { label: 'Avg Consultation Fee', value: '₹0', change: '+0', icon: DollarSign, color: 'text-emerald-600' }
  ]);

  // Fetch doctor statistics
  const fetchDoctorStats = async () => {
    try {
      const stats = await doctorApi.getDoctorStats();
      setDoctorStats([
        { label: 'Total Doctors', value: stats.total_doctors.toString(), change: '+0', icon: Stethoscope, color: 'text-[#E17726]' },
        { label: 'Active Doctors', value: stats.active_doctors.toString(), change: '+0', icon: Activity, color: 'text-green-600' },
        { label: 'Verified Doctors', value: stats.verified_doctors.toString(), change: '+0', icon: CheckCircle, color: 'text-purple-600' },
        { label: 'Avg Consultation Fee', value: `₹${parseFloat(stats.average_consultation_fee).toFixed(0)}`, change: '+0', icon: DollarSign, color: 'text-emerald-600' }
      ]);
    } catch (error) {
      console.error('Failed to fetch doctor stats:', error);
    }
  };

  useEffect(() => {
    fetchDoctorStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {doctorStats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-midnight">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium mt-1">
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color === 'text-[#E17726]' ? 'from-[#E17726]/10 to-[#E17726]/5' : 'from-blue-500/10 to-blue-500/5'} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Add Section */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search doctors by name, specialty, or clinic..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
              />
            </div>
            <Button variant="outline" className="border-gray-300 h-11 px-6 rounded-xl">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#E17726] hover:bg-[#c9651e] text-white h-11 px-6 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Doctor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters Section */}
      {showFilters && (
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                  className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                  value={filters.is_active ? 'true' : 'false'}
                  onChange={(e) => setFilters({...filters, is_active: e.target.value === 'true'})}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification</label>
                <select 
                  className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                  value={filters.is_verified === undefined ? '' : filters.is_verified ? 'true' : 'false'}
                  onChange={(e) => setFilters({...filters, is_verified: e.target.value === '' ? undefined : e.target.value === 'true'})}
                >
                  <option value="">All</option>
                  <option value="true">Verified</option>
                  <option value="false">Not Verified</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <select 
                  className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                  value={filters.specialization}
                  onChange={(e) => setFilters({...filters, specialization: e.target.value})}
                >
                  <option value="">All Specializations</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="dermatology">Dermatology</option>
                  <option value="endocrinology">Endocrinology</option>
                  <option value="gastroenterology">Gastroenterology</option>
                  <option value="general_medicine">General Medicine</option>
                  <option value="gynecology">Gynecology</option>
                  <option value="neurology">Neurology</option>
                  <option value="oncology">Oncology</option>
                  <option value="orthopedics">Orthopedics</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="psychiatry">Psychiatry</option>
                  <option value="pulmonology">Pulmonology</option>
                  <option value="urology">Urology</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Doctor Form */}
      {showAddForm && (
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-midnight flex items-center">
              {editingDoctor ? (
                <>
                  <Edit className="w-5 h-5 mr-2 text-[#E17726]" />
                  Edit Doctor: {editingDoctor.user_name}
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2 text-[#E17726]" />
                  Add New Doctor
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <Input 
                    placeholder="Dr. John Doe" 
                    className="rounded-xl"
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm({...doctorForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                  <Input id="profile_picture" type="file" accept="image/*" onChange={handleProfileImageChange} />
                  {profileImagePreview && (
                    <img src={profileImagePreview} alt="Profile Preview" className="w-20 h-20 rounded-full mt-2 border border-gray-300" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input 
                    type="email" 
                    placeholder="doctor@email.com" 
                    className="rounded-xl"
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <Input 
                    placeholder="+91-9876543210" 
                    className="rounded-xl"
                    value={doctorForm.phone}
                    onChange={(e) => setDoctorForm({...doctorForm, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
                  <Input 
                    placeholder="Medical license number" 
                    className="rounded-xl"
                    value={doctorForm.license_number}
                    onChange={(e) => setDoctorForm({...doctorForm, license_number: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Qualification *</label>
                  <Input 
                    placeholder="MD, MS, etc." 
                    className="rounded-xl"
                    value={doctorForm.qualification}
                    onChange={(e) => setDoctorForm({...doctorForm, qualification: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization *</label>
                  <select 
                    className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({...doctorForm, specialization: e.target.value})}
                  >
                    <option value="">Select Specialty</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="endocrinology">Endocrinology</option>
                    <option value="gastroenterology">Gastroenterology</option>
                    <option value="general_medicine">General Medicine</option>
                    <option value="gynecology">Gynecology</option>
                    <option value="neurology">Neurology</option>
                    <option value="oncology">Oncology</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="psychiatry">Psychiatry</option>
                    <option value="pulmonology">Pulmonology</option>
                    <option value="urology">Urology</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sub-Specialization</label>
                  <Input 
                    placeholder="e.g., Interventional Cardiology" 
                    className="rounded-xl"
                    value={doctorForm.sub_specialization}
                    onChange={(e) => setDoctorForm({...doctorForm, sub_specialization: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
                  <Input 
                    type="number"
                    placeholder="Years of experience" 
                    className="rounded-xl"
                    value={doctorForm.experience_years}
                    onChange={(e) => setDoctorForm({...doctorForm, experience_years: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee *</label>
                  <Input 
                    type="number"
                    placeholder="₹1500" 
                    className="rounded-xl"
                    value={doctorForm.consultation_fee}
                    onChange={(e) => setDoctorForm({...doctorForm, consultation_fee: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Online Consultation Fee</label>
                  <Input 
                    type="number"
                    placeholder="₹1200" 
                    className="rounded-xl"
                    value={doctorForm.online_consultation_fee}
                    onChange={(e) => setDoctorForm({...doctorForm, online_consultation_fee: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Duration (minutes)</label>
                  <Input 
                    type="number"
                    placeholder="30" 
                    className="rounded-xl"
                    value={doctorForm.consultation_duration}
                    onChange={(e) => setDoctorForm({...doctorForm, consultation_duration: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Name</label>
                <Input 
                  placeholder="Heart Care Clinic" 
                  className="rounded-xl"
                  value={doctorForm.clinic_name}
                  onChange={(e) => setDoctorForm({...doctorForm, clinic_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Address</label>
                <Input 
                  placeholder="123 Medical Center, City, State" 
                  className="rounded-xl"
                  value={doctorForm.clinic_address}
                  onChange={(e) => setDoctorForm({...doctorForm, clinic_address: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <Textarea 
                placeholder="Brief description about the doctor..." 
                className="rounded-xl"
                value={doctorForm.bio}
                onChange={(e) => setDoctorForm({...doctorForm, bio: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Online Consultation Available</label>
                  <p className="text-xs text-gray-500">Allow patients to book online consultations</p>
                </div>
                <Switch
                  checked={doctorForm.is_online_consultation_available}
                  onCheckedChange={(checked) => setDoctorForm({...doctorForm, is_online_consultation_available: checked})}
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Active Status</label>
                  <p className="text-xs text-gray-500">Doctor can accept new patients</p>
                </div>
                <Switch
                  checked={doctorForm.is_active}
                  onCheckedChange={(checked) => setDoctorForm({...doctorForm, is_active: checked})}
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleFormSubmit}
                disabled={loading}
                className="bg-[#E17726] hover:bg-[#c9651e] text-white px-8 rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingDoctor ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingDoctor ? 'Update Doctor' : 'Create Doctor'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingDoctor(null);
                  resetForm();
                }}
                className="border-gray-300 px-8 rounded-xl"
              >
                {editingDoctor ? 'Cancel Edit' : 'Cancel'}
              </Button>
              {editingDoctor && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    console.log('Current form state:', doctorForm);
                    console.log('Editing doctor:', editingDoctor);
                  }}
                  className="border-blue-300 text-blue-600 px-4 rounded-xl"
                >
                  Debug
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctors List */}
      <div className="grid gap-6">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#E17726]/20 to-blue-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {doctor.profile_picture ? (
                      <img 
                        src={doctor.profile_picture} 
                        alt={doctor.user_name} 
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                    <Stethoscope className="w-8 h-8 text-[#E17726]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-midnight truncate" title={doctor.user_name}>
                      {doctor.user_name}
                    </h3>
                    <p className="text-gray-600 truncate" title={doctor.specialization}>
                      {doctor.specialization}
                    </p>
                    <p className="text-sm text-gray-500 truncate" title={doctor.qualification}>
                      {doctor.qualification}
                    </p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 min-w-0">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Experience</p>
                    <p className="font-medium text-midnight truncate">{doctor.experience_years} years</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Consultation Fee</p>
                    <p className="font-medium text-midnight truncate">₹{doctor.consultation_fee}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Clinic</p>
                    <p className="font-medium text-midnight truncate" title={doctor.clinic_name || '-'}>
                      {doctor.clinic_name || '-'}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <Badge className={doctor.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {doctor.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="rounded-lg"
                    onClick={() => setViewingDoctor(doctor)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg"
                    onClick={() => loadDoctorForEdit(doctor)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-red-300 text-red-600 hover:bg-red-50 rounded-lg"
                    onClick={() => setDeletingDoctor(doctor)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Doctor Details Modal */}
      {viewingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-midnight">Doctor Details</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewingDoctor(null)}
                className="border-gray-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-midnight font-medium">{viewingDoctor.user_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-midnight">{viewingDoctor.user_phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-midnight">{viewingDoctor.user_email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <p className="text-midnight">{viewingDoctor.license_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <p className="text-midnight">{viewingDoctor.qualification}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <p className="text-midnight">{viewingDoctor.specialization}</p>
                </div>
                {viewingDoctor.sub_specialization && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Specialization</label>
                    <p className="text-midnight">{viewingDoctor.sub_specialization}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <p className="text-midnight">{viewingDoctor.experience_years} years</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee</label>
                  <p className="text-midnight">₹{viewingDoctor.consultation_fee}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Online Consultation Fee</label>
                  <p className="text-midnight">₹{viewingDoctor.online_consultation_fee || viewingDoctor.consultation_fee}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Duration</label>
                  <p className="text-midnight">{viewingDoctor.consultation_duration || 30} minutes</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                  <p className="text-midnight">{viewingDoctor.clinic_name || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Address</label>
                  <p className="text-midnight">{viewingDoctor.clinic_address || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Languages Spoken</label>
                  <div className="flex flex-wrap gap-1">
                    {viewingDoctor.languages_spoken && viewingDoctor.languages_spoken.length > 0 ? (
                      viewingDoctor.languages_spoken.map((lang, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-500">Not specified</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex gap-2">
                    <Badge className={viewingDoctor.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {viewingDoctor.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge className={viewingDoctor.is_verified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                      {viewingDoctor.is_verified ? 'Verified' : 'Pending Verification'}
                    </Badge>
                    <Badge className={viewingDoctor.is_online_consultation_available ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}>
                      {viewingDoctor.is_online_consultation_available ? 'Online Available' : 'Offline Only'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${star <= viewingDoctor.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({viewingDoctor.rating.toFixed(1)})</span>
                    <span className="text-sm text-gray-500">({viewingDoctor.total_reviews} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
            {viewingDoctor.bio && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <p className="text-midnight whitespace-pre-line">{viewingDoctor.bio}</p>
              </div>
            )}
            <div className="flex gap-4 mt-6">
              <Button 
                onClick={() => {
                  setViewingDoctor(null);
                  loadDoctorForEdit(viewingDoctor);
                }}
                className="bg-[#E17726] hover:bg-[#c9651e] text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Doctor
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setViewingDoctor(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-midnight mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to deactivate Dr. {deletingDoctor.user_name}? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <Button 
                onClick={handleDeleteDoctor}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-6 rounded-xl"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setDeletingDoctor(null)}
                className="border-gray-300 px-6 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Admins Management Component
const AdminsManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const mockAdmins = [
    {
      id: 1,
      name: 'Rohit Sharma',
      email: 'admin.delhi@sushrusa.com',
      phone: '+91-9876543210',
      clinic: 'Sushrusa Clinic - Delhi',
      role: 'Admin',
      status: 'Active',
      joinDate: '2024-01-15',
      appointmentsHandled: 342,
      revenue: '₹1,71,000'
    },
    {
      id: 2,
      name: 'Sneha Patel',
      email: 'admin.mumbai@sushrusa.com',
      phone: '+91-9876543211',
      clinic: 'Sushrusa Clinic - Mumbai',
      role: 'Admin',
      status: 'Active',
      joinDate: '2024-02-20',
      appointmentsHandled: 289,
      revenue: '₹1,44,500'
    },
    {
      id: 3,
      name: 'Amit Kumar',
      email: 'admin.bangalore@sushrusa.com',
      phone: '+91-9876543212',
      clinic: 'Sushrusa Clinic - Bangalore',
      role: 'Admin',
      status: 'Inactive',
      joinDate: '2024-03-10',
      appointmentsHandled: 156,
      revenue: '₹78,000'
    }
  ];

  const adminStats = [
    { label: 'Total Admins', value: '48', change: '+5', icon: UserCog, color: 'text-[#E17726]' },
    { label: 'Active Admins', value: '42', change: '+3', icon: Activity, color: 'text-green-600' },
    { label: 'New This Month', value: '8', change: '+60%', icon: Plus, color: 'text-blue-600' },
    { label: 'Avg Performance', value: '92%', change: '+5%', icon: Award, color: 'text-purple-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-midnight">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium mt-1">
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color === 'text-[#E17726]' ? 'from-[#E17726]/10 to-[#E17726]/5' : 'from-blue-500/10 to-blue-500/5'} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Add Section */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search admins by name, clinic, or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
              />
            </div>
            <Button variant="outline" className="border-gray-300 h-11 px-6 rounded-xl">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#E17726] hover:bg-[#c9651e] text-white h-11 px-6 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Admin Form */}
      {showAddForm && (
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-midnight flex items-center">
              <Plus className="w-5 h-5 mr-2 text-[#E17726]" />
              Add New Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <Input placeholder="John Doe" className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input type="email" placeholder="admin@email.com" className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <Input placeholder="+91-9876543210" className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <Input placeholder="Complete address" className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Clinic</label>
                  <select className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]">
                    <option>Select Clinic</option>
                    <option>Sushrusa Clinic - Delhi</option>
                    <option>Sushrusa Clinic - Mumbai</option>
                    <option>Sushrusa Clinic - Bangalore</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role Level</label>
                  <select className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]">
                    <option>Admin</option>
                    <option>Senior Admin</option>
                    <option>Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                  <select className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]">
                    <option>Full Time</option>
                    <option>Part Time</option>
                    <option>Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary</label>
                  <Input placeholder="Monthly salary" className="rounded-xl" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Patient Management</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Appointment Booking</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Payment Processing</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Reports Access</span>
                </label>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white px-8 rounded-xl">
                Save Admin
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
                className="border-gray-300 px-8 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admins List */}
      <div className="grid gap-6">
        {mockAdmins.filter(admin => 
          admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.clinic.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.email.toLowerCase().includes(searchTerm.toLowerCase())
        ).map((admin) => (
          <Card key={admin.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                    <UserCog className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-midnight">{admin.name}</h3>
                    <p className="text-gray-600">{admin.clinic}</p>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Join Date</p>
                    <p className="font-medium text-midnight">{admin.joinDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Appointments</p>
                    <p className="font-medium text-midnight">{admin.appointmentsHandled}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Revenue</p>
                    <p className="font-medium text-midnight">{admin.revenue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <Badge className={admin.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {admin.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-lg">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Analytics Management Component
const AnalyticsManagement = () => {
  const [timeRange, setTimeRange] = useState('month');

  const analyticsStats = [
    { label: 'Total Revenue', value: '₹12,45,680', change: '+18%', icon: DollarSign, color: 'text-green-600' },
    { label: 'Total Consultations', value: '2,847', change: '+24%', icon: Activity, color: 'text-[#E17726]' },
    { label: 'Success Rate', value: '94.2%', change: '+2.1%', icon: Award, color: 'text-blue-600' },
    { label: 'Avg Satisfaction', value: '4.8/5', change: '+0.3', icon: Star, color: 'text-yellow-600' }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 185000, consultations: 234 },
    { month: 'Feb', revenue: 198000, consultations: 267 },
    { month: 'Mar', revenue: 224000, consultations: 289 },
    { month: 'Apr', revenue: 267000, consultations: 334 },
    { month: 'May', revenue: 289000, consultations: 378 },
    { month: 'Jun', revenue: 324000, consultations: 423 }
  ];

  const topPerformers = [
    { name: 'Dr. Rajesh Sharma', specialty: 'Cardiology', consultations: 89, revenue: '₹44,500', rating: 4.9 },
    { name: 'Dr. Priya Patel', specialty: 'Neurology', consultations: 76, revenue: '₹38,000', rating: 4.8 },
    { name: 'Dr. Amit Kumar', specialty: 'Orthopedics', consultations: 68, revenue: '₹34,000', rating: 4.7 }
  ];

  const clinicPerformance = [
    { name: 'Sushrusa Clinic - Delhi', consultations: 342, revenue: '₹1,71,000', growth: '+15%' },
    { name: 'Sushrusa Clinic - Mumbai', consultations: 289, revenue: '₹1,44,500', growth: '+12%' },
    { name: 'Sushrusa Clinic - Bangalore', consultations: 234, revenue: '₹1,17,000', growth: '+8%' }
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-midnight">Analytics Dashboard</h2>
              <p className="text-gray-600">Monitor platform performance and insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="p-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white px-6 rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsStats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-midnight">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium mt-1">
                    {stat.change} vs last period
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color === 'text-[#E17726]' ? 'from-[#E17726]/10 to-[#E17726]/5' : 'from-blue-500/10 to-blue-500/5'} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-midnight flex items-center">
              <LineChart className="w-5 h-5 mr-2 text-[#E17726]" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {revenueData.map((data, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                  <div 
                    className="w-full bg-gradient-to-t from-[#E17726] to-orange-300 rounded-t-lg"
                    style={{ height: `${(data.revenue / 350000) * 200}px` }}
                  ></div>
                  <span className="text-xs font-medium text-gray-600">{data.month}</span>
                  <span className="text-xs text-gray-500">₹{(data.revenue / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Consultations Chart */}
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-midnight flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-blue-600" />
              Consultation Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {revenueData.map((data, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg"
                    style={{ height: `${(data.consultations / 500) * 200}px` }}
                  ></div>
                  <span className="text-xs font-medium text-gray-600">{data.month}</span>
                  <span className="text-xs text-gray-500">{data.consultations}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Doctors */}
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-midnight flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-600" />
              Top Performing Doctors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerformers.map((doctor, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#E17726] to-orange-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-midnight">{doctor.name}</h4>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-midnight">{doctor.revenue}</p>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-sm text-gray-600">{doctor.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Clinic Performance */}
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-midnight flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-600" />
              Clinic Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {clinicPerformance.map((clinic, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div>
                  <h4 className="font-semibold text-midnight">{clinic.name}</h4>
                  <p className="text-sm text-gray-600">{clinic.consultations} consultations</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-midnight">{clinic.revenue}</p>
                  <p className="text-sm text-green-600 font-medium">{clinic.growth}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-midnight flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Key Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-bold text-midnight mb-2">Revenue Growth</h3>
              <p className="text-sm text-gray-600">18% increase in monthly revenue. Consider expanding services.</p>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold text-midnight mb-2">Patient Retention</h3>
              <p className="text-sm text-gray-600">94% patient satisfaction. Focus on maintaining quality.</p>
            </div>
            <div className="text-center p-6 bg-orange-50 rounded-xl">
              <Clock className="w-12 h-12 text-[#E17726] mx-auto mb-4" />
              <h3 className="font-bold text-midnight mb-2">Peak Hours</h3>
              <p className="text-sm text-gray-600">2-6 PM are busiest. Consider adding more doctors.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// E-Clinics Management Component
const EClinicsManagement = ({ onClinicChange }: { onClinicChange?: () => void }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clinics, setClinics] = useState<EClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 20
  });
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    is_verified: '',
    is_active: '',
    ordering: '-created_at'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clinicToDelete, setClinicToDelete] = useState<EClinic | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clinicStats, setClinicStats] = useState({
    total_clinics: { value: 0, change: '+0' },
    active_clinics: { value: 0, change: '+0' },
    online_consultations: { value: 0, change: '+0' },
    inactive_clinics: { value: 0, change: '+0' }
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
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
    registration_number: '',
    license_number: '',
    accreditation: '',
    operating_hours: {} as Record<string, string>,
    specialties: [] as string[],
    services: [] as string[],
    facilities: [] as string[],
    is_active: true,
    accepts_online_consultations: true
  });

  // Admin selection state
  const [availableAdmins, setAvailableAdmins] = useState<UserProfile[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  const availableFacilities = [
    'X-Ray', 'ECG', 'Lab Tests', 'Pharmacy', 'Ultrasound', 
    'Blood Bank', 'ICU', 'Emergency Care', 'Physiotherapy', 
    'Dental Care', 'Eye Care', 'Cardiology', 'Neurology'
  ];

  const workingDaysOptions = [
    { value: 'Mon', label: 'Monday' },
    { value: 'Tue', label: 'Tuesday' },
    { value: 'Wed', label: 'Wednesday' },
    { value: 'Thu', label: 'Thursday' },
    { value: 'Fri', label: 'Friday' },
    { value: 'Sat', label: 'Saturday' },
    { value: 'Sun', label: 'Sunday' }
  ];

  // Fetch clinics on component mount
  useEffect(() => {
    fetchClinics();
    fetchClinicStats();
  }, []);

  // Fetch available admins when add form is shown
  useEffect(() => {
    if (showAddForm) {
      fetchAvailableAdmins();
    }
  }, [showAddForm]);

  const fetchClinicStats = async () => {
    try {
      setStatsLoading(true);
      const stats = await superAdminApi.getClinicStats();
      setClinicStats(stats);
    } catch (error) {
      console.error('Error fetching clinic stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load clinic statistics',
        variant: 'destructive'
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchClinics(1, pagination.pageSize);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, pagination.pageSize]);

  // Apply filters when filters change
  useEffect(() => {
    // Skip initial load to avoid double fetching
    if (Object.values(filters).some(value => value !== '')) {
      fetchClinics(1, pagination.pageSize);
    }
  }, [filters.city, filters.state, filters.is_verified, filters.is_active, filters.ordering, pagination.pageSize]);

  const fetchAvailableAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const admins = await superAdminApi.getAdminUsers();
      setAvailableAdmins(admins);
      if (admins.length > 0) {
        setSelectedAdminId(admins[0].id);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available admins',
        variant: 'destructive'
      });
    } finally {
      setLoadingAdmins(false);
    }
  };

  const fetchClinics = async (page = 1, pageSize = 20) => {
    try {
      setLoading(true);
      // Only show initial load skeleton on first load
      if (initialLoad) {
        setInitialLoad(false);
      }
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString()
      });

      // Add search parameter
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      // Add filter parameters
      if (filters.city) params.append('city', filters.city);
      if (filters.state) params.append('state', filters.state);
      if (filters.is_verified) params.append('is_verified', filters.is_verified);
      if (filters.is_active) params.append('is_active', filters.is_active);
      if (filters.ordering) params.append('ordering', filters.ordering);

      const response = await api.get(`/api/eclinic/?${params.toString()}`);
      
      if (response.data.results) {
        // Paginated response
        setClinics(response.data.results);
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(response.data.count / pageSize),
          totalCount: response.data.count,
          pageSize: pageSize
        });
      } else if (Array.isArray(response.data)) {
        // Direct array response (fallback)
        setClinics(response.data);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalCount: response.data.length,
          pageSize: response.data.length
        });
      }
    } catch (error) {
      console.error('Error fetching clinics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load e-clinics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFacilityToggle = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  // Handle search with debouncing
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle filter changes
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    // Reset to first page when filtering
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Apply filters and search
  const applyFilters = () => {
    fetchClinics(1, pagination.pageSize);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      city: '',
      state: '',
      is_verified: '',
      is_active: '',
      ordering: '-created_at'
    });
    setSearchTerm('');
    fetchClinics(1, pagination.pageSize);
  };

  // Add state for clinic images
  const [clinicCoverImage, setClinicCoverImage] = useState<File | null>(null);
  const [clinicCoverPreview, setClinicCoverPreview] = useState<string | null>(null);

  // Handle clinic cover image change
  const handleClinicCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setClinicCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setClinicCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
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
      registration_number: '',
      license_number: '',
      accreditation: '',
      operating_hours: {},
      specialties: [],
      services: [],
      facilities: [],
      is_active: true,
      accepts_online_consultations: true
    });
    setSelectedAdminId('');
    setClinicCoverImage(null);
    setClinicCoverPreview(null);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!formData.name || !formData.phone || !formData.email || !formData.street || !formData.city || !formData.state || !formData.pincode || !formData.registration_number) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      // Validate admin selection
      if (!selectedAdminId) {
        toast({
          title: 'Validation Error',
          description: 'Please select an admin for the clinic',
          variant: 'destructive'
        });
        return;
      }

      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (typeof value === 'object' && value !== null) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value as any);
        }
      });
      
      // Add image files
      if (clinicCoverImage) {
        formDataToSend.append('cover_image', clinicCoverImage);
      }
      
      // Add admin
      formDataToSend.append('admin', selectedAdminId);

      await superAdminApi.createEClinic(formDataToSend);
      
      toast({
        title: 'Success',
        description: 'E-Clinic created successfully and verified automatically',
      });
      
      setShowAddForm(false);
      resetForm();
      fetchClinics(); // Refresh the list
      fetchClinicStats(); // Refresh clinic stats
      onClinicChange?.(); // Refresh overview stats
    } catch (error: any) {
      console.error('Error creating clinic:', error);
      // Check for admin assignment error from backend
      const backendMsg = error?.response?.data?.admin?.[0] || error?.response?.data?.message || error?.message;
      if (backendMsg && backendMsg.includes('already assigned to another clinic')) {
        toast({
          title: 'Admin Assignment Error',
          description: backendMsg,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create e-clinic',
          variant: 'destructive'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClinic = async () => {
    if (!clinicToDelete) return;
    
    try {
      setIsDeleting(true);
      await superAdminApi.deleteEClinic(clinicToDelete.id);
      
      toast({
        title: 'Success',
        description: 'E-Clinic deleted successfully',
      });
      
      setDeleteDialogOpen(false);
      setClinicToDelete(null);
      fetchClinics(); // Refresh the list
      fetchClinicStats(); // Refresh clinic stats
      onClinicChange?.(); // Refresh overview stats
    } catch (error) {
      console.error('Error deleting clinic:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete e-clinic',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (clinic: EClinic) => {
    setClinicToDelete(clinic);
    setDeleteDialogOpen(true);
  };

  // Create stats array from API data
  const statsArray = [
    { 
      label: 'Total E-Clinics', 
      value: clinicStats.total_clinics.value.toString(), 
      change: clinicStats.total_clinics.change, 
      icon: Building2, 
      color: 'text-[#E17726]' 
    },
    { 
      label: 'Active Clinics', 
      value: clinicStats.active_clinics.value.toString(), 
      change: clinicStats.active_clinics.change, 
      icon: Activity, 
      color: 'text-green-600' 
    },
    { 
      label: 'Online Consultations', 
      value: clinicStats.online_consultations.value.toString(), 
      change: clinicStats.online_consultations.change, 
      icon: Globe, 
      color: 'text-blue-600' 
    },
    { 
      label: 'Inactive Clinics', 
      value: clinicStats.inactive_clinics.value.toString(), 
      change: clinicStats.inactive_clinics.change, 
      icon: Clock, 
      color: 'text-yellow-600' 
    }
  ];

  // 1. Add state for editing
  const [editingClinic, setEditingClinic] = useState<EClinic | null>(null);

  // 2. Add function to handle edit submit (in-page)
  const handleEditSubmit = async () => {
    if (!editingClinic) return;
    try {
      setIsSubmitting(true);
      
      // Create FormData for file uploads (same as create form)
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (typeof value === 'object' && value !== null) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value as any);
        }
      });
      
      // Add image files
      if (clinicCoverImage) {
        formDataToSend.append('cover_image', clinicCoverImage);
      }
      
      // Add admin
      formDataToSend.append('admin', selectedAdminId);
      
      await superAdminApi.updateEClinic(editingClinic.id, formDataToSend);
      toast({ title: 'Success', description: 'E-Clinic updated successfully' });
      setEditingClinic(null);
      fetchClinics();
      fetchClinicStats();
      onClinicChange?.();
    } catch (error) {
      console.error('Error updating clinic:', error);
      let message = 'Failed to update e-clinic';
      if (error && error.response && error.response.data) {
        if (error.response.data.admin && Array.isArray(error.response.data.admin)) {
          message = error.response.data.admin[0];
        } else if (typeof error.response.data.detail === 'string') {
          message = error.response.data.detail;
        } else if (typeof error.response.data === 'string') {
          message = error.response.data;
        }
      }
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add function to start editing in-page
  const startEditClinic = (clinic: EClinic) => {
    setEditingClinic(clinic);
    setFormData({
      name: clinic.name || '',
      clinic_type: clinic.clinic_type || 'virtual_clinic',
      description: clinic.description || '',
      phone: clinic.phone || '',
      email: clinic.email || '',
      website: clinic.website || '',
      street: clinic.street || '',
      city: clinic.city || '',
      state: clinic.state || '',
      pincode: clinic.pincode || '',
      country: clinic.country || 'India',
      registration_number: clinic.registration_number || '',
      license_number: clinic.license_number || '',
      accreditation: clinic.accreditation || '',
      operating_hours: clinic.operating_hours || {},
      specialties: clinic.specialties || [],
      services: clinic.services || [],
      facilities: clinic.facilities || [],
      is_active: clinic.is_active ?? true,
      accepts_online_consultations: clinic.accepts_online_consultations ?? true
    });
    
    // Set cover image preview if it exists
    if (clinic.cover_image) {
      setClinicCoverPreview(clinic.cover_image);
    } else {
      setClinicCoverPreview(null);
    }
    
    // Reset file input
    setClinicCoverImage(null);
  };

  // Days of the week for operating hours
  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  // Ensure operating_hours is always an object with correct structure
  const getOperatingHours = () => {
    const base: Record<string, { open: string; close: string }> = {};
    daysOfWeek.forEach(day => {
      const val = formData.operating_hours?.[day];
      if (val && typeof val === 'object' && 'open' in val && 'close' in val) {
        base[day] = { open: val.open || '', close: val.close || '' };
      } else {
        base[day] = { open: '', close: '' };
      }
    });
    return base;
  };

  // In EClinicsManagement:
  // 1. Fetch available admins when entering edit mode
  useEffect(() => {
    if (editingClinic) {
      fetchAvailableAdmins().then(() => {
        // Set the current admin as selected
        if (editingClinic.admin) {
          setSelectedAdminId(editingClinic.admin.toString());
        }
      });
    }
  }, [editingClinic]);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          // Loading skeleton for stats
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          statsArray.map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                    <p className="text-2xl font-bold text-midnight">{stat.value}</p>
                    <p className="text-sm text-green-600 font-medium mt-1">
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color === 'text-[#E17726]' ? 'from-[#E17726]/10 to-[#E17726]/5' : 'from-blue-500/10 to-blue-500/5'} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Search and Add Section */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search e-clinics by name, location, or status..." 
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-11 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
              />
            </div>
            <Button 
              variant="outline" 
              className={`border-gray-300 h-11 px-6 rounded-xl ${showFilters ? 'bg-[#E17726]/10 border-[#E17726]' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
              {(filters.city || filters.state || filters.is_verified || filters.is_active) && (
                <Badge className="ml-2 bg-[#E17726] text-white text-xs">Active</Badge>
              )}
            </Button>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#E17726] hover:bg-[#c9651e] text-white h-11 px-6 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add E-Clinic
            </Button>
          </div>
          
          {/* Active Filters Display */}
          {(searchTerm || filters.city || filters.state || filters.is_verified || filters.is_active) && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <Badge variant="outline" className="text-xs">
                  Search: "{searchTerm}"
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleSearchChange('')} />
                </Badge>
              )}
              {filters.city && (
                <Badge variant="outline" className="text-xs">
                  City: {filters.city}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleFilterChange('city', '')} />
                </Badge>
              )}
              {filters.state && (
                <Badge variant="outline" className="text-xs">
                  State: {filters.state}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleFilterChange('state', '')} />
                </Badge>
              )}
              {filters.is_verified && (
                <Badge variant="outline" className="text-xs">
                  {filters.is_verified === 'true' ? 'Verified' : 'Pending'}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleFilterChange('is_verified', '')} />
                </Badge>
              )}
              {filters.is_active && (
                <Badge variant="outline" className="text-xs">
                  {filters.is_active === 'true' ? 'Active' : 'Inactive'}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleFilterChange('is_active', '')} />
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 text-xs"
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-midnight flex items-center justify-between">
              <div className="flex items-center">
                <Filter className="w-5 h-5 mr-2 text-[#E17726]" />
                Advanced Filters
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">City</Label>
                <Input 
                  placeholder="Filter by city"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">State</Label>
                <Input 
                  placeholder="Filter by state"
                  value={filters.state}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Verification Status</Label>
                <select 
                  value={filters.is_verified}
                  onChange={(e) => handleFilterChange('is_verified', e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                >
                  <option value="">All</option>
                  <option value="true">Verified</option>
                  <option value="false">Pending</option>
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Status</Label>
                <select 
                  value={filters.is_active}
                  onChange={(e) => handleFilterChange('is_active', e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</Label>
              <select 
                value={filters.ordering}
                onChange={(e) => handleFilterChange('ordering', e.target.value)}
                className="w-full md:w-64 h-11 px-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
              >
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="-name">Name Z-A</option>
                <option value="city">City A-Z</option>
                <option value="-city">City Z-A</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add E-Clinic Form */}
      {showAddForm && !editingClinic && (
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-midnight flex items-center">
              <Plus className="w-5 h-5 mr-2 text-[#E17726]" />
              Add New E-Clinic
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              New clinics are automatically verified and assigned to the selected admin
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-midnight mb-4 flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-[#E17726]" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Clinic Name <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        placeholder="Sushrusa Clinic - City Name" 
                        className="rounded-xl"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <Textarea 
                        placeholder="Enter clinic description"
                        className="rounded-xl min-h-[80px]"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <Input 
                        placeholder="https://clinic-website.com" 
                        className="rounded-xl"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Image
                      </label>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleClinicCoverChange}
                        className="rounded-xl"
                      />
                      {clinicCoverPreview && (
                        <img 
                          src={clinicCoverPreview} 
                          alt="Cover Preview" 
                          className="w-32 h-20 rounded-lg mt-2 border border-gray-300 object-cover" 
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        placeholder="Enter street address"
                        className="rounded-xl"
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="Enter city name" 
                          className="rounded-xl"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="Enter state name" 
                          className="rounded-xl"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="Enter pincode" 
                          className="rounded-xl"
                          value={formData.pincode}
                          onChange={(e) => handleInputChange('pincode', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <Input 
                          placeholder="India" 
                          className="rounded-xl"
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Registration Number <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="Enter registration number" 
                          className="rounded-xl"
                          value={formData.registration_number}
                          onChange={(e) => handleInputChange('registration_number', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          License Number
                        </label>
                        <Input 
                          placeholder="Enter license number" 
                          className="rounded-xl"
                          value={formData.license_number}
                          onChange={(e) => handleInputChange('license_number', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Accreditation
                      </label>
                      <Input 
                        placeholder="Enter accreditation details" 
                        className="rounded-xl"
                        value={formData.accreditation}
                        onChange={(e) => handleInputChange('accreditation', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="+91-XX-XXXX-XXXX" 
                          className="rounded-xl"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          type="email" 
                          placeholder="clinic@sushrusa.com" 
                          className="rounded-xl"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Admin Assignment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign Admin <span className="text-red-500">*</span>
                      </label>
                      {loadingAdmins ? (
                        <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-xl">
                          <Loader2 className="w-4 h-4 animate-spin text-[#E17726]" />
                          <span className="text-sm text-gray-600">Loading admins...</span>
                        </div>
                      ) : (
                        <select 
                          value={selectedAdminId}
                          onChange={(e) => setSelectedAdminId(e.target.value)}
                          className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                        >
                          <option value="">Select an Admin</option>
                          {availableAdmins.map((admin) => (
                            <option key={admin.id} value={admin.id}>
                              {admin.name} - {admin.city}, {admin.state}
                            </option>
                          ))}
                        </select>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        The selected admin will manage this e-clinic
                      </p>
                    </div>

                    {/* Status Settings */}
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={formData.is_active}
                            onChange={(e) => handleInputChange('is_active', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Active Status</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Only active clinics will be visible to patients
                        </p>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={formData.accepts_online_consultations}
                            onChange={(e) => handleInputChange('accepts_online_consultations', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Accepts Online Consultations</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Allow patients to book online consultations
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operating Details */}
                <div>
                  <h3 className="text-lg font-semibold text-midnight mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-600" />
                    Operating Details
                  </h3>
                  <div className="space-y-2">
                    {daysOfWeek.map(day => (
                      <div key={day} className="flex items-center gap-2 mb-1">
                        <span className="w-24 capitalize">{day}:</span>
                        <input
                          type="time"
                          value={getOperatingHours()[day].open}
                          onChange={e => {
                            const newHours = getOperatingHours();
                            newHours[day] = { ...newHours[day], open: e.target.value };
                            handleInputChange('operating_hours', { ...newHours });
                          }}
                          className="border rounded px-2"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={getOperatingHours()[day].close}
                          onChange={e => {
                            const newHours = getOperatingHours();
                            newHours[day] = { ...newHours[day], close: e.target.value };
                            handleInputChange('operating_hours', { ...newHours });
                          }}
                          className="border rounded px-2"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                    <Input 
                      placeholder="Cardiology, Neurology, Pediatrics (comma separated)" 
                      className="rounded-xl"
                      value={formData.specialties.join(', ')}
                      onChange={(e) => handleInputChange('specialties', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
                    <Input 
                      placeholder="Consultation, X-Ray, Lab Tests (comma separated)" 
                      className="rounded-xl"
                      value={formData.services.join(', ')}
                      onChange={(e) => handleInputChange('services', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    />
                  </div>
                </div>
              </div>

              {/* Facilities */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-midnight mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-green-600" />
                    Facilities & Equipment
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Available Facilities</label>
                      <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                        {availableFacilities.map((facility) => (
                          <label 
                            key={facility} 
                            className={`flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors ${
                              formData.facilities.includes(facility) 
                                ? 'bg-[#E17726]/10 border border-[#E17726]/20' 
                                : 'bg-gray-50'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={formData.facilities.includes(facility)}
                              onChange={() => handleFacilityToggle(facility)}
                              className="rounded" 
                            />
                            <span className="text-sm">{facility}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#E17726] hover:bg-[#c9651e] text-white px-8 rounded-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 mr-2" />
                    Create E-Clinic
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                disabled={isSubmitting}
                className="border-gray-300 px-8 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit E-Clinic Form */}
      {editingClinic && (
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-midnight flex items-center">
              <Settings className="w-5 h-5 mr-2 text-[#E17726]" />
              Edit E-Clinic
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Update the details for this e-clinic. Changes will be saved immediately.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-midnight mb-4 flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-[#E17726]" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Clinic Name <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        placeholder="Sushrusa Clinic - City Name" 
                        className="rounded-xl"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <Textarea 
                        placeholder="Enter clinic description"
                        className="rounded-xl min-h-[80px]"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <Input 
                        placeholder="https://clinic-website.com" 
                        className="rounded-xl"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Image
                      </label>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleClinicCoverChange}
                        className="rounded-xl"
                      />
                      {clinicCoverPreview && (
                        <img 
                          src={clinicCoverPreview} 
                          alt="Cover Preview" 
                          className="w-32 h-20 rounded-lg mt-2 border border-gray-300 object-cover" 
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        placeholder="Enter street address"
                        className="rounded-xl"
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="Enter city name" 
                          className="rounded-xl"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="Enter state name" 
                          className="rounded-xl"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="Enter pincode" 
                          className="rounded-xl"
                          value={formData.pincode}
                          onChange={(e) => handleInputChange('pincode', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <Input 
                          placeholder="India" 
                          className="rounded-xl"
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Registration Number <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="Enter registration number" 
                          className="rounded-xl"
                          value={formData.registration_number}
                          onChange={(e) => handleInputChange('registration_number', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          License Number
                        </label>
                        <Input 
                          placeholder="Enter license number" 
                          className="rounded-xl"
                          value={formData.license_number}
                          onChange={(e) => handleInputChange('license_number', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Accreditation
                      </label>
                      <Input 
                        placeholder="Enter accreditation details" 
                        className="rounded-xl"
                        value={formData.accreditation}
                        onChange={(e) => handleInputChange('accreditation', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="+91-XX-XXXX-XXXX" 
                          className="rounded-xl"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          type="email" 
                          placeholder="clinic@sushrusa.com" 
                          className="rounded-xl"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                      </div>
                    </div>
                    {/* Status Settings */}
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={formData.is_active}
                            onChange={(e) => handleInputChange('is_active', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Active Status</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Only active clinics will be visible to patients
                        </p>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={formData.accepts_online_consultations}
                            onChange={(e) => handleInputChange('accepts_online_consultations', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Accepts Online Consultations</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Allow patients to book online consultations
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Operating Details */}
                <div>
                  <h3 className="text-lg font-semibold text-midnight mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-600" />
                    Operating Details
                  </h3>
                  <div className="space-y-2">
                    {daysOfWeek.map(day => (
                      <div key={day} className="flex items-center gap-2 mb-1">
                        <span className="w-24 capitalize">{day}:</span>
                        <input
                          type="time"
                          value={getOperatingHours()[day].open}
                          onChange={e => {
                            const newHours = getOperatingHours();
                            newHours[day] = { ...newHours[day], open: e.target.value };
                            handleInputChange('operating_hours', { ...newHours });
                          }}
                          className="border rounded px-2"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={getOperatingHours()[day].close}
                          onChange={e => {
                            const newHours = getOperatingHours();
                            newHours[day] = { ...newHours[day], close: e.target.value };
                            handleInputChange('operating_hours', { ...newHours });
                          }}
                          className="border rounded px-2"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                    <Input 
                      placeholder="Cardiology, Neurology, Pediatrics (comma separated)" 
                      className="rounded-xl"
                      value={formData.specialties.join(', ')}
                      onChange={(e) => handleInputChange('specialties', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
                    <Input 
                      placeholder="Consultation, X-Ray, Lab Tests (comma separated)" 
                      className="rounded-xl"
                      value={formData.services.join(', ')}
                      onChange={(e) => handleInputChange('services', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    />
                  </div>
                </div>
              </div>
              {/* Facilities */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-midnight mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-green-600" />
                    Facilities & Equipment
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Available Facilities</label>
                      <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                        {availableFacilities.map((facility) => (
                          <label 
                            key={facility} 
                            className={`flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors ${
                              formData.facilities.includes(facility) 
                                ? 'bg-[#E17726]/10 border border-[#E17726]/20' 
                                : 'bg-gray-50'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={formData.facilities.includes(facility)}
                              onChange={() => handleFacilityToggle(facility)}
                              className="rounded" 
                            />
                            <span className="text-sm">{facility}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Assign Admin <span className="text-red-500">*</span>
  </label>
  {loadingAdmins ? (
    <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-xl">
      <Loader2 className="w-4 h-4 animate-spin text-[#E17726]" />
      <span className="text-sm text-gray-600">Loading admins...</span>
    </div>
  ) : (
    <select 
      value={selectedAdminId}
      onChange={(e) => setSelectedAdminId(e.target.value)}
      className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
    >
      <option value="">Select an Admin</option>
      {availableAdmins.map((admin) => (
        <option key={admin.id} value={admin.id}>
          {admin.name} - {admin.city}, {admin.state}
        </option>
      ))}
    </select>
  )}
  <p className="text-xs text-gray-500 mt-1">
    The selected admin will manage this e-clinic
  </p>
</div>
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button 
                onClick={handleEditSubmit}
                disabled={isSubmitting}
                className="bg-[#E17726] hover:bg-[#c9651e] text-white px-8 rounded-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingClinic(null);
                  resetForm();
                }}
                disabled={isSubmitting}
                className="border-gray-300 px-8 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* E-Clinics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && initialLoad ? (
          // Initial loading skeleton - more detailed and seamless
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              {/* Header skeleton */}
              <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse relative">
                <div className="absolute top-4 right-4 w-16 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-14 h-14 bg-gray-300 rounded-2xl animate-pulse"></div>
                <div className="absolute bottom-4 right-4 w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Title and location skeleton */}
                  <div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                  
                  {/* Contact info skeleton */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  
                  {/* Status skeleton */}
                  <div className="bg-gray-100 p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                  </div>
                  
                  {/* Description skeleton */}
                  <div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2"></div>
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6"></div>
                    </div>
                  </div>
                  
                  {/* Action buttons skeleton */}
                  <div className="flex gap-2 pt-2">
                    <div className="flex-1 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : loading ? (
          // Subsequent loading - show existing content with overlay
          <>
            {clinics.map((clinic) => (
              <Card key={clinic.id} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden relative">
                {/* Loading overlay */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#E17726]" />
                    <span className="text-sm text-gray-600">Updating...</span>
                  </div>
                </div>
                
                {/* Existing clinic content */}
                <div className="h-32 bg-gradient-to-br from-[#E17726]/10 to-cyan-400/10 relative">
                  <div className="absolute top-4 right-4">
                    <Badge className={clinic.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {clinic.is_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                      <Building2 className="w-8 h-8 text-[#E17726]" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-midnight">{clinic.is_verified ? 'Verified' : 'Pending'}</span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-midnight mb-1">{clinic.name}</h3>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {clinic.city}, {clinic.state}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {clinic.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {clinic.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="w-4 h-4 mr-2" />
                        {clinic.website || 'No website'}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-[#E17726]/10 to-cyan-400/10 p-3 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Status</span>
                        <span className={`text-lg font-bold ${clinic.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {clinic.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Description:</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{clinic.description}</p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 rounded-lg"
                        onClick={() => setSelectedClinic(clinic)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1 bg-[#E17726] hover:bg-[#c9651e] text-white rounded-lg" onClick={() => startEditClinic(clinic)}>
                        <Settings className="w-4 h-4 mr-1" />
                        Manage
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-300 text-red-600 hover:bg-red-50 rounded-lg"
                        onClick={() => openDeleteDialog(clinic)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : clinics.length === 0 ? (
          // Empty state
          <div className="col-span-full text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No E-Clinics Found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first e-clinic</p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-[#E17726] hover:bg-[#c9651e] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First E-Clinic
            </Button>
          </div>
        ) : (
          clinics.map((clinic) => (
          <Card key={clinic.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
            {/* Clinic Header */}
            <div className="h-32 relative overflow-hidden">
              {clinic.cover_image ? (
                <img 
                  src={clinic.cover_image} 
                  alt={`${clinic.name} Cover`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#E17726]/10 to-cyan-400/10" />
              )}
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-4 right-4">
                <Badge className={clinic.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {clinic.is_verified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                  <Building2 className="w-8 h-8 text-[#E17726]" />
                </div>
              </div>
              <div className="absolute bottom-4 right-4 flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-midnight">{clinic.is_verified ? 'Verified' : 'Pending'}</span>
              </div>
            </div>

            {/* Clinic Info */}
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-midnight mb-1">{clinic.name}</h3>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {clinic.city}, {clinic.state}
                  </div>
                </div>



                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {clinic.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {clinic.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="w-4 h-4 mr-2" />
                    {clinic.website || 'No website'}
                  </div>
                </div>

                {/* Status */}
                <div className="bg-gradient-to-r from-[#E17726]/10 to-cyan-400/10 p-3 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <span className={`text-lg font-bold ${clinic.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {clinic.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Description:</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{clinic.description}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 rounded-lg"
                    onClick={() => setSelectedClinic(clinic)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1 bg-[#E17726] hover:bg-[#c9651e] text-white rounded-lg" onClick={() => startEditClinic(clinic)}>
                    <Settings className="w-4 h-4 mr-1" />
                    Manage
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-red-300 text-red-600 hover:bg-red-50 rounded-lg"
                    onClick={() => openDeleteDialog(clinic)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#E17726]" />
                  <span>Updating...</span>
                </div>
              ) : (
                `Showing ${((pagination.currentPage - 1) * pagination.pageSize) + 1} to ${Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of ${pagination.totalCount} clinics`
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchClinics(pagination.currentPage - 1, pagination.pageSize)}
                disabled={pagination.currentPage === 1 || loading}
                className="rounded-lg"
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => fetchClinics(pageNum, pagination.pageSize)}
                      disabled={loading}
                      className="w-8 h-8 rounded-lg"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {pagination.totalPages > 5 && (
                  <span className="text-gray-500">...</span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchClinics(pagination.currentPage + 1, pagination.pageSize)}
                disabled={pagination.currentPage === pagination.totalPages || loading}
                className="rounded-lg"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Clinic Details Modal */}
      {selectedClinic && (
        <Dialog open={!!selectedClinic} onOpenChange={() => setSelectedClinic(null)}>
          <DialogContent className="max-w-3xl w-full p-0 overflow-hidden max-h-[80vh] flex flex-col">
            <div className="bg-gradient-to-r from-[#E17726]/10 to-blue-100/10 p-4 sm:p-6 pb-0 rounded-t-2xl flex flex-col md:flex-row md:items-center gap-4 shrink-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-midnight mb-1 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-[#E17726]" />
                  {selectedClinic.name}
                </h2>
                <div className="flex flex-wrap gap-2 items-center mb-2">
                  <Badge className={selectedClinic.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {selectedClinic.is_verified ? 'Verified' : 'Pending'}
                  </Badge>
                  <span className="text-gray-500 text-xs">ID: {selectedClinic.id}</span>
                  <span className={`text-xs font-semibold ${selectedClinic.is_active ? 'text-green-600' : 'text-red-600'}`}>{selectedClinic.is_active ? 'Active' : 'Inactive'}</span>
                  <span className="text-xs text-blue-600">{selectedClinic.clinic_type.replace('_', ' ')}</span>
                </div>
                <div className="text-gray-600 text-sm mb-2 flex flex-wrap gap-2 items-center">
                  <MapPin className="inline w-4 h-4 mr-1 text-[#E17726]" />
                  {selectedClinic.street}, {selectedClinic.city}, {selectedClinic.state}, {selectedClinic.pincode}, {selectedClinic.country}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {selectedClinic.cover_image && <img src={selectedClinic.cover_image} alt="Cover" className="h-16 w-32 object-cover rounded shadow" />}
              </div>
            </div>
            <div className="p-4 sm:p-6 pt-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 flex-1 min-h-0 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-midnight mb-1 flex items-center gap-1"><UserCog className="w-4 h-4 text-blue-600" /> Admin</h3>
                  <span className="text-gray-700 text-sm font-medium">{selectedClinic.admin_name || selectedClinic.admin}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-midnight mb-1 flex items-center gap-1"><Phone className="w-4 h-4 text-[#E17726]" /> Contact</h3>
                  <ul className="ml-1 text-gray-700 text-sm space-y-1">
                    <li><Phone className="inline w-4 h-4 mr-1" /> {selectedClinic.phone || '—'}</li>
                    <li><Mail className="inline w-4 h-4 mr-1" /> {selectedClinic.email || '—'}</li>
                    <li><Globe className="inline w-4 h-4 mr-1" /> {selectedClinic.website || '—'}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-midnight mb-1 flex items-center gap-1"><Award className="w-4 h-4 text-green-600" /> Facilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedClinic.facilities && selectedClinic.facilities.length ? selectedClinic.facilities.map((f, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-green-50 border-green-200 text-green-800">{f}</Badge>
                    )) : <span className="text-gray-400">—</span>}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-midnight mb-1 flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /> Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedClinic.specialties && selectedClinic.specialties.length ? selectedClinic.specialties.map((s, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-yellow-50 border-yellow-200 text-yellow-800">{s}</Badge>
                    )) : <span className="text-gray-400">—</span>}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-midnight mb-1 flex items-center gap-1"><ClipboardList className="w-4 h-4 text-blue-500" /> Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedClinic.services && selectedClinic.services.length ? selectedClinic.services.map((s, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-800">{s}</Badge>
                    )) : <span className="text-gray-400">—</span>}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-midnight mb-1 flex items-center gap-1"><Calendar className="w-4 h-4 text-purple-600" /> Operating Hours</h3>
                  <div className="overflow-x-auto">
                    {selectedClinic.operating_hours && Object.keys(selectedClinic.operating_hours).length > 0 ? (
                      <table className="min-w-max text-xs mt-2 border rounded overflow-hidden w-full">
                        <tbody>
                          {Object.entries(selectedClinic.operating_hours).map(([day, hours]) => (
                            <tr key={day} className="even:bg-gray-50">
                              <td className="pr-2 font-medium capitalize py-1 w-24 whitespace-nowrap">{day}:</td>
                              <td className="py-1">
                                {hours.open && hours.close ? (
                                  <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">{hours.open} - {hours.close}</span>
                                ) : <span className="text-gray-400">Closed</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-midnight mb-1 flex items-center gap-1"><Info className="w-4 h-4 text-indigo-600" /> Clinic Info</h3>
                  <div className="text-gray-700 text-sm space-y-1">
                    <div><strong>Registration #:</strong> {selectedClinic.registration_number || '—'}</div>
                    <div><strong>License #:</strong> {selectedClinic.license_number || '—'}</div>
                    <div><strong>Accreditation:</strong> {selectedClinic.accreditation || '—'}</div>
                    <div><strong>Created At:</strong> {new Date(selectedClinic.created_at).toLocaleString()}</div>
                    <div><strong>Updated At:</strong> {new Date(selectedClinic.updated_at).toLocaleString()}</div>
                    <div><strong>Accepts Online Consultations:</strong> {selectedClinic.accepts_online_consultations ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                {selectedClinic.gallery_images && selectedClinic.gallery_images.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-midnight mb-1 flex items-center gap-1"><Image className="w-4 h-4 text-pink-600" /> Gallery</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selectedClinic.gallery_images.map((img, idx) => (
                        <img key={idx} src={img} alt={`Gallery ${idx + 1}`} className="h-20 w-full object-cover rounded shadow" />
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-midnight mb-1 flex items-center gap-1"><AlignLeft className="w-4 h-4 text-gray-500" /> Description</h3>
                  <div className="text-gray-700 text-sm whitespace-pre-line">{selectedClinic.description || '—'}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap justify-end bg-white px-4 sm:px-6 pb-4 pt-2 border-t gap-2 shrink-0">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setSelectedClinic(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-midnight flex items-center">
              <Trash2 className="w-5 h-5 mr-2 text-red-600" />
              Delete E-Clinic
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete <strong>{clinicToDelete?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setClinicToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteClinic}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Clinic
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Notification Component
const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'New E-Clinic Registration',
      message: 'Sushrusa Clinic - Chennai has been successfully registered',
      time: '2 minutes ago',
      read: false,
      icon: Building2
    },
    {
      id: 2,
      type: 'warning',
      title: 'Doctor Verification Required',
      message: 'Dr. Priya Patel needs verification for neurology specialty',
      time: '15 minutes ago',
      read: false,
      icon: Stethoscope
    },
    {
      id: 3,
      type: 'info',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight at 2:00 AM',
      time: '1 hour ago',
      read: true,
      icon: Settings
    },
    {
      id: 4,
      type: 'success',
      title: 'Payment Processed',
      message: 'Payment of ₹15,000 has been processed for Clinic Mumbai',
      time: '2 hours ago',
      read: true,
      icon: DollarSign
    },
    {
      id: 5,
      type: 'warning',
      title: 'Low Doctor Availability',
      message: 'Cardiology department has low doctor availability this week',
      time: '3 hours ago',
      read: true,
      icon: AlertCircle
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2 hover:bg-gray-100 rounded-lg">
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <DropdownMenuLabel className="text-base font-semibold text-midnight">
              Notifications
            </DropdownMenuLabel>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs text-[#E17726] hover:text-[#c9651e]"
              >
                Mark all as read
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-80">
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id}
                  className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          !notification.read ? 'text-midnight' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="p-3 border-t border-gray-200">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-[#E17726] hover:text-[#c9651e] hover:bg-[#E17726]/5"
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Profile Dropdown Component
const ProfileDropdown = ({ userProfile }: { userProfile: UserProfile }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { logout } = useAuth();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: userProfile.name || '',
    email: userProfile.email || '',
    phone: userProfile.phone || '',
    date_of_birth: userProfile.date_of_birth || '',
    gender: userProfile.gender || '',
    street: userProfile.street || '',
    city: userProfile.city || '',
    state: userProfile.state || '',
    pincode: userProfile.pincode || '',
    country: userProfile.country || '',
    emergency_contact_name: userProfile.emergency_contact_name || '',
    emergency_contact_phone: userProfile.emergency_contact_phone || '',
    emergency_contact_relationship: userProfile.emergency_contact_relationship || '',
    blood_group: userProfile.blood_group || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      const updatedProfile = await superAdminApi.updateUserProfile(formData);
      
      // Update the parent component's profile data
      // This would need to be passed down as a prop or through context
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
      setShowEditModal(false);
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your account',
      });
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: 'There was an error logging out',
        variant: 'destructive',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg">
          <Avatar className="w-10 h-10 border-2 border-[#E17726]/20">
            <AvatarFallback className="bg-[#E17726] text-white text-sm font-semibold">
              {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'S'}
            </AvatarFallback>
          </Avatar>
          <div className="text-right">
            <p className="text-sm font-semibold text-midnight">{userProfile.name}</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 border-2 border-[#E17726]/20">
              <AvatarFallback className="bg-[#E17726] text-white text-lg font-semibold">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'S'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-midnight">{userProfile.name}</h3>
              <p className="text-xs text-gray-500">{userProfile.email}</p>
              <p className="text-xs text-[#E17726] font-medium">Super Administrator</p>
            </div>
          </div>
        </div>
        
        <div className="p-2">
          {/* Profile Information */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
              <Mail className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-midnight">{userProfile.email}</p>
              </div>
            </div>
            
            {userProfile.phone && (
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <Phone className="w-4 h-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-midnight">{userProfile.phone}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
              <User className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Role</p>
                <p className="text-sm font-medium text-midnight">Super Administrator</p>
              </div>
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          {/* Action Buttons */}
          <div className="space-y-1">
            <DropdownMenuItem 
              className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-50 rounded-lg"
              onClick={() => setShowEditModal(true)}
            >
              <Edit className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Edit Profile</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-50 rounded-lg"
            >
              <Settings className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-50 rounded-lg"
            >
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Activity Log</span>
            </DropdownMenuItem>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-red-50 rounded-lg text-red-600"
            onClick={handleLogout}
          >
            <X className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-midnight">
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update your profile information. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-midnight border-b border-gray-200 pb-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="text-sm font-medium">
                    Date of Birth
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth || ''}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Gender
                  </Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blood_group" className="text-sm font-medium">
                    Blood Group
                  </Label>
                  <select
                    id="blood_group"
                    value={formData.blood_group}
                    onChange={(e) => handleInputChange('blood_group', e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-midnight border-b border-gray-200 pb-2">
                Address Information
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-sm font-medium">
                    Street Address
                  </Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    placeholder="Enter street address"
                    className="rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city"
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">
                      State
                    </Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Enter state"
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="text-sm font-medium">
                      Pincode
                    </Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      placeholder="Enter pincode"
                      className="rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium">
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Enter country"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-midnight border-b border-gray-200 pb-2">
                Emergency Contact
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name" className="text-sm font-medium">
                    Emergency Contact Name
                  </Label>
                  <Input
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                    placeholder="Enter emergency contact name"
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone" className="text-sm font-medium">
                    Emergency Contact Phone
                  </Label>
                  <Input
                    id="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                    placeholder="Enter emergency contact phone"
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_relationship" className="text-sm font-medium">
                    Relationship
                  </Label>
                  <Input
                    id="emergency_contact_relationship"
                    value={formData.emergency_contact_relationship}
                    onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
                    placeholder="e.g., Spouse, Parent, Friend"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>


          </div>

          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProfile}
              disabled={isUpdating}
              className="bg-[#E17726] hover:bg-[#c9651e] text-white"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
};

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  const { toast } = useToast();

  // State for profile data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for overview stats
  const [overviewStats, setOverviewStats] = useState({
    total_clinics: { value: 0, change: '+0' },
    active_clinics: { value: 0, change: '+0' },
    total_doctors: { value: 0, change: '+0' },
    active_doctors: { value: 0, change: '+0' },
    total_admins: { value: 0, change: '+0' },
    total_patients: { value: 0, change: '+0' },
    total_consultations: { value: 0, change: '+0' },
    total_revenue: { value: 0, change: '+0' }
  });
  const [overviewStatsLoading, setOverviewStatsLoading] = useState(true);

  // State for recent clinics
  const [recentClinics, setRecentClinics] = useState<EClinic[]>([]);
  const [recentClinicsLoading, setRecentClinicsLoading] = useState(true);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await superAdminApi.getCurrentUserProfile();
      setUserProfile(profile);
    } catch (err) {
      setError('Failed to load profile data');
      console.error('Error fetching SuperAdmin profile:', err);
      toast({
        title: 'Profile Error',
        description: 'Failed to load profile information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch overview stats
  const fetchOverviewStats = async () => {
    try {
      setOverviewStatsLoading(true);
      const stats = await superAdminApi.getOverviewStats();
      setOverviewStats(stats);
    } catch (error) {
      console.error('Error fetching overview stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load overview statistics',
        variant: 'destructive'
      });
    } finally {
      setOverviewStatsLoading(false);
    }
  };

  // Fetch recent clinics
  const fetchRecentClinics = async () => {
    try {
      setRecentClinicsLoading(true);
      const response = await superAdminApi.getEClinics({ page: 1, page_size: 5, ordering: '-created_at' });
      // Handle the paginated response structure
      const clinics = response?.results || [];
      setRecentClinics(clinics.slice(0, 3));
    } catch (error) {
      console.error('Error fetching recent clinics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recent clinics',
        variant: 'destructive'
      });
    } finally {
      setRecentClinicsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchOverviewStats();
    fetchRecentClinics();
  }, []);

  // Real data from API - comprehensive platform overview
  const stats = [
    { label: 'Total E-Clinics', value: (overviewStats.total_clinics.value || 0).toString(), change: overviewStats.total_clinics.change || '+0', icon: Building2, color: 'text-[#E17726]' },
    { label: 'Total Doctors', value: (overviewStats.total_doctors.value || 0).toString(), change: overviewStats.total_doctors.change || '+0', icon: Stethoscope, color: 'text-aqua' },
    { label: 'Total Admins', value: (overviewStats.total_admins.value || 0).toString(), change: overviewStats.total_admins.change || '+0', icon: UserCog, color: 'text-[#E17726]' },
    { label: 'Total Patients', value: (overviewStats.total_patients.value || 0).toString(), change: overviewStats.total_patients.change || '+0', icon: Users, color: 'text-aqua' },
    { label: 'Total Consultations', value: (overviewStats.total_consultations.value || 0).toString(), change: overviewStats.total_consultations.change || '+0', icon: Activity, color: 'text-[#E17726]' },
    { label: 'Total Revenue', value: `₹${(overviewStats.total_revenue.value || 0).toLocaleString('en-IN')}`, change: overviewStats.total_revenue.change || '+0', icon: DollarSign, color: 'text-aqua' }
  ];

  // Removed static recentClinics - now using dynamic data from API

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'clinics', label: 'E-Clinics', icon: Building2 },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'admins', label: 'Manage Admins', icon: UserCog },
    // { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-midnight">Super Admin Dashboard</h1>
              <Badge className="bg-[#E17726]/10 text-[#E17726] border-[#E17726]/20">
                Platform Manager
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notification Dropdown */}
              <NotificationDropdown />

              {/* Profile Section */}
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#E17726]" />
                  <span className="text-sm text-gray-600">Loading...</span>
                </div>
              ) : userProfile ? (
                <ProfileDropdown userProfile={userProfile} />
              ) : (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Profile not available</span>
                </div>
              )}
              
              {/* Commented out Export and Settings buttons for now */}
              {/* <Button variant="outline" size="sm" className="border-gray-300">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="border-gray-300">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-white rounded-xl p-2 shadow-sm border border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-[#E17726] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#E17726] hover:bg-[#E17726]/5'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {overviewStatsLoading ? (
                // Loading skeleton for stats
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        </div>
                        <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                stats.map((stat, index) => (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                          <p className="text-3xl font-bold text-midnight">{stat.value}</p>
                          <p className="text-sm text-green-600 font-medium mt-1">
                            {stat.change} from last month
                          </p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color === 'text-[#E17726]' ? 'from-[#E17726]/10 to-[#E17726]/5' : 'from-aqua/10 to-aqua/5'} flex items-center justify-center`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* SuperAdmin Profile Card */}
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-bold text-midnight">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[#E17726]" />
                    </div>
                  ) : userProfile ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-[#E17726] text-white text-lg font-semibold">
                            {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-midnight">{userProfile.name}</h4>
                          <p className="text-sm text-gray-600">Super Administrator</p>
                          <Badge className="bg-[#E17726]/10 text-[#E17726] text-xs">
                            Platform Manager
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{userProfile.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{userProfile.phone}</span>
                        </div>
                        {userProfile.city && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {userProfile.city}, {userProfile.state}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            Joined: {new Date(userProfile.date_joined).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Profile information not available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent E-Clinics */}
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-bold text-midnight">Recent E-Clinics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentClinicsLoading ? (
                    // Loading skeleton for recent clinics
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                        </div>
                        <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))
                  ) : recentClinics.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No clinics found</p>
                    </div>
                  ) : (
                    recentClinics.map((clinic, index) => (
                      <div key={clinic.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div>
                          <h4 className="font-semibold text-midnight">{clinic.name}</h4>
                          <p className="text-sm text-gray-600">{clinic.city}, {clinic.state}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500">{clinic.admin ? '1 Admin' : 'No Admin'}</span>
                            <span className="text-xs text-gray-500">{clinic.clinic_type === 'virtual_clinic' ? 'Virtual Clinic' : clinic.clinic_type || 'E-Clinic'}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge className={clinic.is_active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {clinic.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {clinic.is_verified && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-midnight">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white justify-start h-12 rounded-xl"
                    onClick={() => setActiveTab('clinics')}
                  >
                    <Building2 className="w-5 h-5 mr-3" />
                    Add New E-Clinic
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12 rounded-xl border-aqua text-aqua hover:bg-aqua hover:text-white"
                    onClick={() => setActiveTab('doctors')}
                  >
                    <Stethoscope className="w-5 h-5 mr-3" />
                    Register Doctor
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12 rounded-xl border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white"
                    onClick={() => setActiveTab('admins')}
                  >
                    <UserCog className="w-5 h-5 mr-3" />
                    Manage Admin Accounts
                  </Button>
                  {/* Removed Generate Report button */}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* E-Clinics Tab Content */}
        {activeTab === 'clinics' && (
          <EClinicsManagement onClinicChange={fetchOverviewStats} />
        )}

        {/* Doctors Tab Content */}
        {activeTab === 'doctors' && (
          <DoctorsManagement />
        )}

        {/* Admins Tab Content */}
        {activeTab === 'admins' && (
          <ManageAdmins />
        )}

        {/* Analytics Tab Content */}
        {activeTab === 'analytics' && (
          <AnalyticsManagement />
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard; 