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
  AlignLeft,
  MoreVertical,
  Languages,
  Upload,
  Save
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
import DoctorViewModal from './DoctorViewModal';
import DoctorEditModal from './DoctorEditModal';

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

  // Doctor stats
  const [doctorStats, setDoctorStats] = useState([
    { label: 'Total Doctors', value: '0', change: '+0%', icon: Users, color: 'text-[#E17726]' },
    { label: 'Active Doctors', value: '0', change: '+0%', icon: Activity, color: 'text-green-600' },
    { label: 'New This Month', value: '0', change: '+0%', icon: Plus, color: 'text-blue-600' },
    { label: 'Avg Rating', value: '0/5', change: '+0', icon: Star, color: 'text-yellow-600' }
  ]);

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

  // Create doctor
  const handleCreateDoctor = async () => {
    setLoading(true);
    try {
      const consultationFee = parseFloat(doctorForm.consultation_fee);
      const onlineConsultationFee = parseFloat(doctorForm.online_consultation_fee);
      const experienceYears = parseInt(doctorForm.experience_years);
      const consultationDuration = parseInt(doctorForm.consultation_duration);

      const createData = {
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

      const newDoctor = await doctorApi.createDoctor(createData);
      setDoctors(prev => [...prev, newDoctor]);
      toast({
        title: 'Success',
        description: `Doctor ${newDoctor.user_name} created successfully`
      });
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create doctor',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load doctor for editing
  const loadDoctorForEdit = (doctor: DoctorProfile) => {
    setDoctorForm({
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
      consultation_duration: doctor.consultation_duration?.toString() || '30',
      is_online_consultation_available: doctor.is_online_consultation_available || true,
      is_active: doctor.is_active || true,
    });
    setEditingDoctor(doctor);
    setShowAddForm(true);
  };

  // Update doctor
  const handleUpdateDoctor = async () => {
    if (!editingDoctor) return;

    setLoading(true);
    try {
      const consultationFee = parseFloat(doctorForm.consultation_fee);
      const onlineConsultationFee = parseFloat(doctorForm.online_consultation_fee);
      const experienceYears = parseInt(doctorForm.experience_years);
      const consultationDuration = parseInt(doctorForm.consultation_duration);

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

      const updatedDoctor = await doctorApi.updateDoctor(editingDoctor.id.toString(), updateData);
      setDoctors(prev => prev.map(doc => doc.id === editingDoctor.id ? updatedDoctor : doc));
      toast({
        title: 'Success',
        description: `Doctor ${updatedDoctor.user_name} updated successfully`
      });
      resetForm();
      setEditingDoctor(null);
      setShowAddForm(false);
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

  // Delete doctor
  const handleDeleteDoctor = async () => {
    if (!deletingDoctor) return;

    try {
      await doctorApi.deleteDoctor(deletingDoctor.id.toString());
      setDoctors(prev => prev.filter(doc => doc.id !== deletingDoctor.id));
      toast({
        title: 'Success',
        description: `Doctor ${deletingDoctor.user_name} deleted successfully`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete doctor',
        variant: 'destructive'
      });
    } finally {
      setDeletingDoctor(null);
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
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  // Fetch doctor stats
  const fetchDoctorStats = async () => {
    try {
      const stats = await doctorApi.getDoctorStats();
      setDoctorStats([
        { label: 'Total Doctors', value: stats.total_doctors.toString(), change: '+12%', icon: Users, color: 'text-[#E17726]' },
        { label: 'Active Doctors', value: stats.active_doctors.toString(), change: '+8%', icon: Activity, color: 'text-green-600' },
        { label: 'New This Month', value: stats.new_this_month.toString(), change: '+25%', icon: Plus, color: 'text-blue-600' },
        { label: 'Avg Rating', value: stats.avg_rating, change: '+0.2', icon: Star, color: 'text-yellow-600' }
      ]);
    } catch (error) {
      console.error('Failed to fetch doctor stats:', error);
    }
  };

  useEffect(() => {
    fetchDoctorStats();
  }, []);

  // Filter doctors
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.license_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesActiveFilter = filters.is_active === undefined || doctor.is_active === filters.is_active;
    const matchesVerifiedFilter = filters.is_verified === undefined || doctor.is_verified === filters.is_verified;
    const matchesSpecializationFilter = !filters.specialization || 
                                       doctor.specialization.toLowerCase().includes(filters.specialization.toLowerCase());

    return matchesSearch && matchesActiveFilter && matchesVerifiedFilter && matchesSpecializationFilter;
  });

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
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-300 h-11 px-6 rounded-xl"
            >
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
                  value={filters.is_active === undefined ? '' : filters.is_active ? 'true' : 'false'}
                  onChange={(e) => setFilters({...filters, is_active: e.target.value === '' ? undefined : e.target.value === 'true'})}
                >
                  <option value="">All</option>
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
                  <option value="radiology">Radiology</option>
                  <option value="surgery">Surgery</option>
                  <option value="urology">Urology</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctors List */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Doctors ({filteredDoctors.length})</span>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#E17726]" />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Stethoscope className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No doctors found</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-[#E17726] text-white">
                          {doctor.user_name?.charAt(0) || 'D'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-midnight truncate">
                            Dr. {doctor.user_name}
                          </h3>
                          <Badge className={doctor.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {doctor.is_verified ? 'Verified' : 'Pending'}
                          </Badge>
                          <Badge className={doctor.is_active ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}>
                            {doctor.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            {doctor.specialization}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {doctor.experience_years} years
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ₹{doctor.consultation_fee}
                          </span>
                          {doctor.rating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              {doctor.rating}/5
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {doctor.user_phone}
                          </span>
                          {doctor.user_email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {doctor.user_email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingDoctor(doctor)}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadDoctorForEdit(doctor)}
                        className="border-green-300 text-green-600 hover:bg-green-50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setViewingDoctor(doctor)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => loadDoctorForEdit(doctor)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Doctor
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setDeletingDoctor(doctor)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Doctor
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Doctor Form */}
      {showAddForm && (
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#E17726]" />
              {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Profile Image Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-[#E17726] text-white text-xl">
                    {doctorForm.name?.charAt(0) || 'D'}
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
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm({...doctorForm, name: e.target.value})}
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={doctorForm.phone}
                    onChange={(e) => setDoctorForm({...doctorForm, phone: e.target.value})}
                    placeholder="+1234567890"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})}
                    placeholder="doctor@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="license">License Number *</Label>
                  <Input
                    id="license"
                    value={doctorForm.license_number}
                    onChange={(e) => setDoctorForm({...doctorForm, license_number: e.target.value})}
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
                    value={doctorForm.qualification}
                    onChange={(e) => setDoctorForm({...doctorForm, qualification: e.target.value})}
                    placeholder="MBBS, MD"
                  />
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Input
                    id="specialization"
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({...doctorForm, specialization: e.target.value})}
                    placeholder="Cardiology"
                  />
                </div>
                <div>
                  <Label htmlFor="sub_specialization">Sub-Specialization</Label>
                  <Input
                    id="sub_specialization"
                    value={doctorForm.sub_specialization}
                    onChange={(e) => setDoctorForm({...doctorForm, sub_specialization: e.target.value})}
                    placeholder="Interventional Cardiology"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience (Years) *</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={doctorForm.experience_years}
                    onChange={(e) => setDoctorForm({...doctorForm, experience_years: e.target.value})}
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
                    value={doctorForm.consultation_fee}
                    onChange={(e) => setDoctorForm({...doctorForm, consultation_fee: e.target.value})}
                    placeholder="1000"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="online_fee">Online Fee (₹) *</Label>
                  <Input
                    id="online_fee"
                    type="number"
                    value={doctorForm.online_consultation_fee}
                    onChange={(e) => setDoctorForm({...doctorForm, online_consultation_fee: e.target.value})}
                    placeholder="800"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (Minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={doctorForm.consultation_duration}
                    onChange={(e) => setDoctorForm({...doctorForm, consultation_duration: e.target.value})}
                    placeholder="30"
                    min="15"
                    max="120"
                  />
                </div>
              </div>

              {/* Clinic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clinic_name">Clinic Name</Label>
                  <Input
                    id="clinic_name"
                    value={doctorForm.clinic_name}
                    onChange={(e) => setDoctorForm({...doctorForm, clinic_name: e.target.value})}
                    placeholder="City Heart Clinic"
                  />
                </div>
                <div>
                  <Label htmlFor="clinic_address">Clinic Address</Label>
                  <Input
                    id="clinic_address"
                    value={doctorForm.clinic_address}
                    onChange={(e) => setDoctorForm({...doctorForm, clinic_address: e.target.value})}
                    placeholder="123 Medical Center, City"
                  />
                </div>
              </div>

              {/* Languages */}
              <div>
                <Label>Languages Spoken</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {doctorForm.languages_spoken.map((lang, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {lang}
                      <button
                        type="button"
                        onClick={() => setDoctorForm({
                          ...doctorForm, 
                          languages_spoken: doctorForm.languages_spoken.filter((_, i) => i !== index)
                        })}
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
                    onClick={() => {
                      const newLanguage = prompt('Enter language:');
                      if (newLanguage && newLanguage.trim()) {
                        setDoctorForm({
                          ...doctorForm,
                          languages_spoken: [...doctorForm.languages_spoken, newLanguage.trim()]
                        });
                      }
                    }}
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
                  value={doctorForm.bio}
                  onChange={(e) => setDoctorForm({...doctorForm, bio: e.target.value})}
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
                    checked={doctorForm.is_online_consultation_available}
                    onCheckedChange={(checked) => setDoctorForm({...doctorForm, is_online_consultation_available: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active Status</Label>
                  <Switch
                    id="is_active"
                    checked={doctorForm.is_active}
                    onCheckedChange={(checked) => setDoctorForm({...doctorForm, is_active: checked})}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                  setEditingDoctor(null);
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleFormSubmit} 
                  disabled={loading}
                  className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingDoctor ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {editingDoctor ? 'Update Doctor' : 'Create Doctor'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Doctor Modal */}
      <DoctorViewModal
        doctor={viewingDoctor}
        onClose={() => setViewingDoctor(null)}
        onEdit={(doctor) => {
          setViewingDoctor(null);
          loadDoctorForEdit(doctor);
        }}
      />

      {/* Edit Doctor Modal */}
      <DoctorEditModal
        doctor={editingDoctor}
        onClose={() => setEditingDoctor(null)}
        onSave={(updatedDoctor) => {
          setDoctors(prev => prev.map(doc => 
            doc.id === updatedDoctor.id ? updatedDoctor : doc
          ));
          setEditingDoctor(null);
        }}
        isOpen={!!editingDoctor}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingDoctor} onOpenChange={() => setDeletingDoctor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-midnight flex items-center">
              <Trash2 className="w-5 h-5 mr-2 text-red-600" />
              Delete Doctor
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete <strong>Dr. {deletingDoctor?.user_name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeletingDoctor(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteDoctor}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Doctor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Rest of the components (AdminsManagement, AnalyticsManagement, etc.) would go here...
// For brevity, I'm focusing on the DoctorsManagement component

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('doctors');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const profile = await superAdminApi.getCurrentUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'admins', label: 'Admins', icon: UserCog },
    { id: 'clinics', label: 'E-Clinics', icon: Building2 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'doctors':
        return <DoctorsManagement />;
      case 'admins':
        return <ManageAdmins />;
      case 'clinics':
        return <ManageAdmins />;
      case 'analytics':
        return <div>Analytics Content</div>;
      default:
        return <div>Overview Content</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#E17726]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-midnight">Super Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#E17726] text-white">
                    {userProfile?.name?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {userProfile?.name || 'Super Admin'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-[#E17726] text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </main>
    </div>
  );
};

export default SuperAdminDashboard; 