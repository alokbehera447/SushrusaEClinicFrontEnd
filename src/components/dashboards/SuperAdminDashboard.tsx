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
  Save,
  RefreshCw,
  Wifi,
  WifiOff,
  Shield,
  ShieldCheck,
  Database,
  Server,
  Zap,
  Sun,
  Moon,
  LogOut,
  UserPlus,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { superAdminApi, UserProfile, EClinic, CreateEClinicData } from '@/lib/api';
// import { notificationApi } from '@/lib/api';
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
import NotificationCenter from './NotificationCenter';

import EClinicManagement from './EClinicManagement';
import AnalyticsDashboard from './AnalyticsDashboard';
import SuperAdminOverview from './SuperAdminOverview';
import SuperAdminAnalytics from './SuperAdminAnalytics';
import DoctorStatusDashboard from './DoctorStatusDashboard';
import PatientManagement from './PatientManagement';


// Doctors Management Component
const DoctorsManagement = ({ isDarkMode = false }: { isDarkMode?: boolean }) => {
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
    specializations: [] as string[],
    sub_specialization: '',
    consultation_fee: '',
    experience_years: '',
    clinic_name: '',
    clinic_address: '',
    bio: '',
    languages_spoken: [] as string[],
    consultation_duration: '30',
    is_online_consultation_available: true,
    is_active: true,
    date_of_birth: '',
    date_of_anniversary: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalDoctors, setTotalDoctors] = useState(0);

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, [searchTerm, filters, currentPage, pageSize]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await doctorApi.getDoctors({
        is_active: filters.is_active, 
        search: searchTerm,
        is_verified: filters.is_verified,
        specialization: filters.specialization,
        page: currentPage,
        page_size: pageSize
      });
      if (Array.isArray(response)) {
        setDoctors(response);
        setTotalDoctors(response.length);
      } else if (response && typeof response === 'object' && 'results' in response) {
        setDoctors(response.results);
        setTotalDoctors(response.count || response.results.length);
      } else {
        setDoctors([]);
        setTotalDoctors(0);
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch doctors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateDoctorForm = () => {
    if (!doctorForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Doctor name is required",
        variant: "destructive",
      });
      return false;
    }
    if (!doctorForm.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Phone number is required",
        variant: "destructive",
      });
      return false;
    }
    if (!doctorForm.license_number.trim()) {
      toast({
        title: "Validation Error",
        description: "License number is required",
        variant: "destructive",
      });
      return false;
    }
    if (!doctorForm.qualification.trim()) {
      toast({
        title: "Validation Error",
        description: "Qualification is required",
        variant: "destructive",
      });
      return false;
    }
    if (!doctorForm.specialization) {
      toast({
        title: "Validation Error",
        description: "Specialization is required",
        variant: "destructive",
      });
      return false;
    }
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(doctorForm.phone.replace(/\s/g, ''))) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return false;
    }
    if (doctorForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doctorForm.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }
    const consultationFee = parseFloat(doctorForm.consultation_fee);
    const experienceYears = parseInt(doctorForm.experience_years);
    const consultationDuration = parseInt(doctorForm.consultation_duration);
    
    if (isNaN(consultationFee) || consultationFee < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid consultation fee",
        variant: "destructive",
      });
      return false;
    }
    

    
    if (isNaN(experienceYears) || experienceYears < 0 || experienceYears > 50) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid experience (0-50 years)",
        variant: "destructive",
      });
      return false;
    }
    
    if (isNaN(consultationDuration) || consultationDuration < 15 || consultationDuration > 120) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid consultation duration (15-120 minutes)",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleFormSubmit = async () => {
    if (!validateDoctorForm()) return;

    setLoading(true);
    try {
    if (editingDoctor) {
      await handleUpdateDoctor();
    } else {
      await handleCreateDoctor();
      }
    } catch (error) {
      console.error('Failed to submit doctor form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoctor = async () => {
    try {
      const consultationFee = parseFloat(doctorForm.consultation_fee);
      const experienceYears = parseInt(doctorForm.experience_years);
      const consultationDuration = parseInt(doctorForm.consultation_duration);

      const formData = new FormData();
      formData.append('name', doctorForm.name.trim());
      formData.append('phone', doctorForm.phone.trim());
      if (doctorForm.email.trim()) formData.append('email', doctorForm.email.trim());
      if (profileImage) {
        formData.append('profile_picture', profileImage);
      }
      formData.append('license_number', doctorForm.license_number.trim());
      formData.append('qualification', doctorForm.qualification.trim());
      
      // Handle specializations: first one as primary, rest as sub-specializations
      if (doctorForm.specializations.length > 0) {
        formData.append('specialization', doctorForm.specializations[0]);
        if (doctorForm.specializations.length > 1) {
          const additionalSpecializations = doctorForm.specializations.slice(1).join(', ');
          formData.append('sub_specialization', additionalSpecializations);
        }
      }
      
      formData.append('consultation_fee', consultationFee.toString());
      formData.append('experience_years', experienceYears.toString());
      if (doctorForm.clinic_name.trim()) formData.append('clinic_name', doctorForm.clinic_name.trim());
      if (doctorForm.clinic_address.trim()) formData.append('clinic_address', doctorForm.clinic_address.trim());
      if (doctorForm.bio.trim()) formData.append('bio', doctorForm.bio.trim());
      formData.append('languages_spoken', JSON.stringify(doctorForm.languages_spoken.filter(lang => lang.trim() !== '')));
      formData.append('consultation_duration', consultationDuration.toString());
      formData.append('is_online_consultation_available', doctorForm.is_online_consultation_available.toString());
      formData.append('is_active', doctorForm.is_active.toString());
      if (doctorForm.date_of_birth) formData.append('date_of_birth', doctorForm.date_of_birth);
      if (doctorForm.date_of_anniversary) formData.append('date_of_anniversary', doctorForm.date_of_anniversary);

      const newDoctor = await doctorApi.createDoctor(formData);
      setDoctors(prev => [newDoctor.doctor_profile, ...prev]);
      
      toast({
        title: "Success",
        description: "Doctor created successfully",
      });
      
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create doctor:', error);
      toast({
        title: "Error",
        description: "Failed to create doctor",
        variant: "destructive",
      });
    }
  };

  const loadDoctorForEdit = (doctor: DoctorProfile) => {
    setDoctorForm({
      name: doctor.user_name || '',
      phone: doctor.user_phone || '',
      email: doctor.user_email || '',
      license_number: doctor.license_number || '',
      qualification: doctor.qualification || '',
      specialization: doctor.specialization || '',
      specializations: doctor.sub_specialization 
        ? [doctor.specialization, ...doctor.sub_specialization.split(', ').filter(s => s.trim())]
        : doctor.specialization ? [doctor.specialization] : [],
      sub_specialization: doctor.sub_specialization || '',
      consultation_fee: doctor.consultation_fee?.toString() || '',
      experience_years: doctor.experience_years?.toString() || '',
      clinic_name: doctor.clinic_name || '',
      clinic_address: doctor.clinic_address || '',
      bio: doctor.bio || '',
      languages_spoken: doctor.languages_spoken || [],
      consultation_duration: doctor.consultation_duration?.toString() || '30',
      is_online_consultation_available: doctor.is_online_consultation_available || true,
      is_active: doctor.is_active || true,
      date_of_birth: doctor.date_of_birth || '',
      date_of_anniversary: doctor.date_of_anniversary || '',
    });
    
    // Set profile image preview for editing
    if (doctor.profile_picture) {
      setProfileImagePreview(doctor.profile_picture);
    } else {
      setProfileImagePreview(null);
    }
    
    // Clear any previously selected new image
    setProfileImage(null);
    
    setEditingDoctor(doctor);
    setShowAddForm(true);
  };

  const handleUpdateDoctor = async () => {
    if (!editingDoctor) return;

    try {
      const consultationFee = parseFloat(doctorForm.consultation_fee);
      const experienceYears = parseInt(doctorForm.experience_years);
      const consultationDuration = parseInt(doctorForm.consultation_duration);

      // Use FormData for file upload support
      const formData = new FormData();
      formData.append('name', doctorForm.name.trim());
      formData.append('phone', doctorForm.phone.trim());
      if (doctorForm.email.trim()) formData.append('email', doctorForm.email.trim());
      if (profileImage) {
        formData.append('profile_picture', profileImage);
      }
      formData.append('license_number', doctorForm.license_number.trim());
      formData.append('qualification', doctorForm.qualification.trim());
      
      // Handle specializations: first one as primary, rest as sub-specializations
      if (doctorForm.specializations.length > 0) {
        formData.append('specialization', doctorForm.specializations[0]);
        if (doctorForm.specializations.length > 1) {
          const additionalSpecializations = doctorForm.specializations.slice(1).join(', ');
          formData.append('sub_specialization', additionalSpecializations);
        }
      }
      
      formData.append('consultation_fee', consultationFee.toString());
      formData.append('experience_years', experienceYears.toString());
      if (doctorForm.clinic_name.trim()) formData.append('clinic_name', doctorForm.clinic_name.trim());
      if (doctorForm.clinic_address.trim()) formData.append('clinic_address', doctorForm.clinic_address.trim());
      if (doctorForm.bio.trim()) formData.append('bio', doctorForm.bio.trim());
      formData.append('languages_spoken', JSON.stringify(doctorForm.languages_spoken.filter(lang => lang.trim() !== '')));
      formData.append('consultation_duration', consultationDuration.toString());
      formData.append('is_online_consultation_available', doctorForm.is_online_consultation_available.toString());
      formData.append('is_active', doctorForm.is_active.toString());
      if (doctorForm.date_of_birth) formData.append('date_of_birth', doctorForm.date_of_birth);
      if (doctorForm.date_of_anniversary) formData.append('date_of_anniversary', doctorForm.date_of_anniversary);

      const updatedDoctor = await doctorApi.updateDoctor(editingDoctor.id.toString(), formData);
      setDoctors(prev => prev.map(doc => 
        doc.id === editingDoctor.id ? updatedDoctor : doc
      ));
      
      toast({
        title: "Success",
        description: "Doctor updated successfully",
      });
      
      resetForm();
      setShowAddForm(false);
      setEditingDoctor(null);
    } catch (error) {
      console.error('Failed to update doctor:', error);
      toast({
        title: "Error",
        description: "Failed to update doctor",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDoctor = async () => {
    if (!deletingDoctor) return;

    try {
      await doctorApi.deleteDoctor(deletingDoctor.id.toString());
      setDoctors(prev => prev.filter(doc => doc.id !== deletingDoctor.id));
      
      toast({
        title: "Success",
        description: "Doctor deleted successfully",
      });
      
      setDeletingDoctor(null);
    } catch (error) {
      console.error('Failed to delete doctor:', error);
      toast({
        title: "Error",
        description: "Failed to delete doctor",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setDoctorForm({
      name: '',
      phone: '',
      email: '',
      license_number: '',
      qualification: '',
      specialization: '',
      specializations: [],
      sub_specialization: '',
      consultation_fee: '',
      experience_years: '',
      clinic_name: '',
      clinic_address: '',
      bio: '',
      languages_spoken: [],
      consultation_duration: '30',
      is_online_consultation_available: true,
      is_active: true,
      date_of_birth: '',
      date_of_anniversary: '',
    });
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  const fetchDoctorStats = async () => {
    try {
      const stats = await doctorApi.getDoctorStats();
      return stats;
    } catch (error) {
      console.error('Failed to fetch doctor stats:', error);
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* This section was removed as per the new_code, as the stats are now fetched by EClinicManagement */}
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
      <Card className={`border-0 shadow-lg rounded-2xl backdrop-blur-sm transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90'
      }`}>
        <CardHeader>
          <CardTitle className={`flex items-center justify-between transition-colors duration-300 ${
            isDarkMode ? 'text-white' : ''
          }`}>
            <span>Doctors ({doctors.length})</span>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#E17726]" />
            </div>
          ) : doctors.length === 0 ? (
            <div className={`text-center py-8 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>
              <Stethoscope className={`w-12 h-12 mx-auto mb-4 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-300'
              }`} />
              <p>No doctors found</p>
            </div>
          ) : (
            <>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className={`flex items-center justify-between p-4 border rounded-lg transition-colors duration-300 ${
                        isDarkMode 
                          ? 'border-gray-600 hover:bg-gray-700' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                          {doctor.profile_picture ? (
                            <img 
                              src={doctor.profile_picture} 
                              alt={doctor.user_name} 
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <AvatarFallback className="bg-[#E17726] text-white">
                              {doctor.user_name?.charAt(0) || 'D'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold truncate transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-midnight'
                            }`}>
                              Dr. {doctor.user_name}
                            </h3>
                            <Badge className={doctor.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {doctor.is_verified ? 'Verified' : 'Pending'}
                            </Badge>
                            <Badge className={doctor.is_active ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}>
                              {doctor.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className={`flex items-center gap-4 text-sm transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
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
                          <div className={`flex items-center gap-4 text-xs mt-1 transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
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
                          className={`border-blue-300 text-blue-600 transition-colors duration-300 ${
                            isDarkMode ? 'hover:bg-blue-900/20' : 'hover:bg-blue-50'
                          }`}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => loadDoctorForEdit(doctor)}
                          className={`border-green-300 text-green-600 transition-colors duration-300 ${
                            isDarkMode ? 'hover:bg-green-900/20' : 'hover:bg-green-50'
                          }`}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className={`transition-colors duration-300 ${
                              isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''
                            }`}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className={`transition-colors duration-300 ${
                            isDarkMode ? 'bg-gray-800 border-gray-700' : ''
                          }`}>
                            <DropdownMenuLabel className={`transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-200' : ''
                            }`}>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className={`transition-colors duration-300 ${
                              isDarkMode ? 'bg-gray-700' : ''
                            }`} />
                            <DropdownMenuItem onClick={() => setViewingDoctor(doctor)} className={`transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-200 hover:bg-gray-700' : ''
                            }`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => loadDoctorForEdit(doctor)} className={`transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-200 hover:bg-gray-700' : ''
                            }`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Doctor
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className={`transition-colors duration-300 ${
                              isDarkMode ? 'bg-gray-700' : ''
                            }`} />
                            <DropdownMenuItem 
                              onClick={() => setDeletingDoctor(doctor)}
                              className={`text-red-600 transition-colors duration-300 ${
                                isDarkMode ? 'hover:bg-gray-700' : ''
                              }`}
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
              
              {/* Pagination */}
              {totalDoctors > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalDoctors)} of {totalDoctors} doctors
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, Math.ceil(totalDoctors / pageSize)) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= Math.ceil(totalDoctors / pageSize)}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.ceil(totalDoctors / pageSize))}
                      disabled={currentPage >= Math.ceil(totalDoctors / pageSize)}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Doctor Form Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className={`max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-900 border-gray-700' : ''
        }`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : ''
            }`}>
              <Plus className="w-5 h-5 text-[#E17726]" />
              {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
            </DialogTitle>
          </DialogHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Profile Image Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  {profileImagePreview ? (
                    <img 
                      src={profileImagePreview} 
                      alt="Profile Preview" 
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : editingDoctor && editingDoctor.profile_picture ? (
                    <img 
                      src={editingDoctor.profile_picture} 
                      alt="Current Profile" 
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-[#E17726] text-white text-xl">
                      {doctorForm.name?.charAt(0) || 'D'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="profile-image" className="cursor-pointer">
                    <div className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300 hover:text-[#E17726]' : 'text-gray-600 hover:text-[#E17726]'
                    }`}>
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
                  {profileImage && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600">✓ {profileImage.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setProfileImage(null);
                          setProfileImagePreview(null);
                        }}
                        className="text-red-600 hover:text-red-700 p-1 h-auto"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  {editingDoctor && editingDoctor.profile_picture && !profileImage && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-600">📷 Current: {editingDoctor.profile_picture.split('/').pop()?.split('?')[0]}</span>
                    </div>
                  )}

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

              {/* Specializations */}
              <div>
                <Label>Specializations *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {doctorForm.specializations.map((spec, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {spec}
                      <button
                        type="button"
                        onClick={() => setDoctorForm({
                          ...doctorForm, 
                          specializations: doctorForm.specializations.filter((_, i) => i !== index)
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
                      const newSpecialization = prompt('Enter specialization:');
                      if (newSpecialization && newSpecialization.trim()) {
                        setDoctorForm({
                          ...doctorForm,
                          specializations: [...doctorForm.specializations, newSpecialization.trim()]
                        });
                      }
                    }}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Specialization
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  First specialization will be the primary one, others will be stored as sub-specializations
                </p>
              </div>

              {/* Fees and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="duration">Duration (Minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={doctorForm.consultation_duration}
                    onChange={(e) => setDoctorForm({...doctorForm, consultation_duration: e.target.value})}
                    placeholder="30"
                    min="15"
                    max="120"
                    style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                  />
                </div>
              </div>

              {/* Date Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={doctorForm.date_of_birth}
                    onChange={(e) => setDoctorForm({...doctorForm, date_of_birth: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_anniversary">Date of Anniversary</Label>
                  <Input
                    id="date_of_anniversary"
                    type="date"
                    value={doctorForm.date_of_anniversary}
                    onChange={(e) => setDoctorForm({...doctorForm, date_of_anniversary: e.target.value})}
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
        </DialogContent>
      </Dialog>

      {/* View Doctor Modal */}
      <DoctorViewModal
        doctor={viewingDoctor}
        onClose={() => setViewingDoctor(null)}
        onEdit={(doctor) => {
          setViewingDoctor(null);
          loadDoctorForEdit(doctor);
        }}
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

interface SuperAdminDashboardProps {
  isDarkMode?: boolean;
  setIsDarkMode?: (value: boolean) => void;
}

const SuperAdminDashboard = ({ isDarkMode: externalIsDarkMode, setIsDarkMode: externalSetIsDarkMode }: SuperAdminDashboardProps = {}) => {
  const [internalIsDarkMode, setInternalIsDarkMode] = React.useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isDarkMode = externalIsDarkMode !== undefined ? externalIsDarkMode : internalIsDarkMode;
  const setIsDarkMode = externalSetIsDarkMode || setInternalIsDarkMode;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [systemStatus, setSystemStatus] = useState('online');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [lastActivity, setLastActivity] = useState('2 minutes ago');

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

  const fetchNotificationCount = async () => {
    // Commented out API call for now
    // try {
    //   const stats = await notificationApi.getNotificationStats();
    //   setNotificationCount(stats.unread);
    // } catch (error) {
    //   console.error('Failed to fetch notification count:', error);
    // }
    
    // Set mock count for now
    setNotificationCount(3);
  };

  useEffect(() => {
    fetchUserProfile();
    fetchNotificationCount();
    
    // Update last activity time
    const updateActivity = () => {
      const now = new Date();
      const startTime = new Date(now.getTime() - 2 * 60 * 1000); // 2 minutes ago
      const minutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
      setLastActivity(`${minutes} minutes ago`);
    };
    
    updateActivity();
    const interval = setInterval(updateActivity, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Listen for tab change events from quick actions
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('changeTab', handleTabChange as EventListener);
    return () => {
      window.removeEventListener('changeTab', handleTabChange as EventListener);
    };
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'doctor-status', label: 'Doctor Status', icon: Activity },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'admins', label: 'Admins', icon: UserCog },
    { id: 'clinics', label: 'E-Clinics', icon: Building2 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <SuperAdminOverview isDarkMode={isDarkMode} />;
      case 'doctors':
        return <DoctorsManagement isDarkMode={isDarkMode} />;
      case 'doctor-status':
        return <DoctorStatusDashboard isDarkMode={isDarkMode} />;
      case 'patients':
        return <PatientManagement isDarkMode={isDarkMode} />;
      case 'admins':
        return <ManageAdmins isDarkMode={isDarkMode} />;
      case 'clinics':
        return <EClinicManagement isDarkMode={isDarkMode} />;
      case 'analytics':
        return <SuperAdminAnalytics isDarkMode={isDarkMode} />;
      default:
        return <SuperAdminOverview isDarkMode={isDarkMode} />;
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
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-orange-50'
    }`}>
      {/* Enhanced Header */}
      <header className={`shadow-lg border-b transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border-gray-700' 
          : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 border-blue-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Section - Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-white'
                  }`}>Super Admin Dashboard</h1>
                  <div className={`flex items-center space-x-2 text-xs transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-blue-100'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${systemStatus === 'online' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span>{systemStatus === 'online' ? 'System Online' : 'System Offline'}</span>
                    <span>•</span>
                    <span>Last activity: {lastActivity}</span>
                  </div>
                </div>
              </div>
            </div>



            {/* Right Section - Actions and User */}
            <div className="flex items-center space-x-3">
              {/* Quick Actions Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className={`transition-colors duration-300 ${
                    isDarkMode ? 'text-white hover:bg-gray-700' : 'text-white hover:bg-white/20'
                  }`}>
                    <Plus className="w-4 h-4 mr-1" />
                    Quick Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={`w-56 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                  <DropdownMenuLabel className={isDarkMode ? 'text-gray-200' : ''}>Quick Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator className={isDarkMode ? 'bg-gray-700' : ''} />
                  <DropdownMenuItem onClick={() => setActiveTab('doctors')} className={isDarkMode ? 'text-gray-200 hover:bg-gray-700' : ''}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add New Doctor
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('clinics')} className={isDarkMode ? 'text-gray-200 hover:bg-gray-700' : ''}>
                    <Building2 className="w-4 h-4 mr-2" />
                    Add New Clinic
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('admins')} className={isDarkMode ? 'text-gray-200 hover:bg-gray-700' : ''}>
                    <UserCog className="w-4 h-4 mr-2" />
                    Manage Admins
                  </DropdownMenuItem>
                  <DropdownMenuItem className={isDarkMode ? 'text-gray-200 hover:bg-gray-700' : ''}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Reports
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className={isDarkMode ? 'bg-gray-700' : ''} />
                  <DropdownMenuItem className={isDarkMode ? 'text-gray-200 hover:bg-gray-700' : ''}>
                    <Settings className="w-4 h-4 mr-2" />
                    System Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-white hover:bg-gray-700' : 'text-white hover:bg-white/20'
                }`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              {/* Help Button */}
              <Button variant="ghost" size="sm" className={`transition-colors duration-300 ${
                isDarkMode ? 'text-white hover:bg-gray-700' : 'text-white hover:bg-white/20'
              }`}>
                <HelpCircle className="w-4 h-4" />
              </Button>

              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowNotifications(true)}
                className={`relative transition-colors duration-300 ${
                  isDarkMode ? 'text-white hover:bg-gray-700' : 'text-white hover:bg-white/20'
                }`}
              >
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 border border-white">
                    {notificationCount}
                  </Badge>
                )}
              </Button>

              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`flex items-center space-x-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-white hover:bg-gray-700' : 'text-white hover:bg-white/20'
                  }`}>
                    <Avatar className="h-8 w-8 border-2 border-white/20">
                      <AvatarFallback className="bg-white/20 text-white font-semibold">
                        {userProfile?.name?.charAt(0) || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-white">
                        {userProfile?.name || 'Super Admin'}
                      </p>
                      <p className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-blue-100'
                      }`}>
                        {userProfile?.email || 'superadmin@example.com'}
                      </p>
                    </div>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={`w-56 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                  <DropdownMenuLabel className={isDarkMode ? 'text-gray-200' : ''}>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className={isDarkMode ? 'bg-gray-700' : ''} />
                  <DropdownMenuItem className={isDarkMode ? 'text-gray-200 hover:bg-gray-700' : ''}>
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className={isDarkMode ? 'text-gray-200 hover:bg-gray-700' : ''}>
                    <Settings className="w-4 h-4 mr-2" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className={isDarkMode ? 'text-gray-200 hover:bg-gray-700' : ''}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className={isDarkMode ? 'bg-gray-700' : ''} />
                  <DropdownMenuItem className={`text-red-600 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        {/* Tabs */}
        <div className="mb-8">
          <div className={`flex space-x-1 p-1 rounded-xl shadow-sm transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-[#E17726] text-white shadow-md'
                      : isDarkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
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

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default SuperAdminDashboard; 