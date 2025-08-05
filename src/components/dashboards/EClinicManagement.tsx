import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  X,
  Loader2,
  RefreshCw,
  Upload,
  Star,
  Clock,
  Users,
  Activity,
  Stethoscope,
  Heart,
  FileText,
  UserCheck,
  Settings,
  ImageIcon
} from 'lucide-react';
import { superAdminApi, EClinic, CreateEClinicData, UserProfile } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { ScrollArea } from '@/components/ui/scroll-area';

interface EClinicManagementProps {
  isDarkMode?: boolean;
}

const EClinicManagement: React.FC<EClinicManagementProps> = ({ isDarkMode = false }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clinics, setClinics] = useState<EClinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    is_active: undefined as boolean | undefined,
    city: '',
    state: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editingClinic, setEditingClinic] = useState<EClinic | null>(null);
  const [deletingClinic, setDeletingClinic] = useState<EClinic | null>(null);
  const [viewingClinic, setViewingClinic] = useState<EClinic | null>(null);
  const [adminUsers, setAdminUsers] = useState<UserProfile[]>([]);
  const [clinicStats, setClinicStats] = useState({
    total_clinics: 0,
    active_clinics: 0,
    online_consultations: 0
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClinics, setTotalClinics] = useState(0);
  const [pageSize, setPageSize] = useState(12); // Number of clinics per page
  
  const { toast } = useToast();

  // Clinic form state
  const [clinicForm, setClinicForm] = useState({
    name: '',
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
    specialties: [] as string[],
    services: [] as string[],
    facilities: [] as string[],
    is_active: true,
    accepts_online_consultations: true,
    consultation_duration: 15,
    admin: '',
  });

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchClinics();
    fetchAdminUsers();
    fetchClinicStats();
  }, []);

  // Refresh clinics when search or filters change
  useEffect(() => {
    fetchClinics(1); // Reset to first page when filters change
  }, [searchTerm, filters]);

  const fetchClinics = async (page: number = currentPage) => {
    console.log('Fetching clinics with params:', { searchTerm, filters, page, pageSize });
    setLoading(true);
    try {
      const response = await superAdminApi.getEClinics({
        page: page,
        page_size: pageSize,
        search: searchTerm || undefined,
        city: filters.city || undefined,
        state: filters.state || undefined,
        is_active: filters.is_active?.toString(),
      });
      console.log('Fetched clinics response:', response);
      setClinics(response.results);
      setTotalClinics(response.count);
      setTotalPages(Math.ceil(response.count / pageSize));
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch clinics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch clinics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const admins = await superAdminApi.getAdminUsers();
      setAdminUsers(admins);
    } catch (error) {
      console.error('Failed to fetch admin users:', error);
    }
  };

  const fetchClinicStats = async () => {
    try {
      const stats = await superAdminApi.getClinicStats();
      setClinicStats({
        total_clinics: stats.total_clinics.value,
        active_clinics: stats.active_clinics.value,
        online_consultations: stats.online_consultations.value
      });
    } catch (error) {
      console.error('Failed to fetch clinic stats:', error);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (20MB = 20 * 1024 * 1024 bytes)
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        toast({
          title: "File Size Error",
          description: "Cover image must be less than 20MB. Please choose a smaller file.",
          variant: "destructive",
        });
        e.target.value = ''; // Clear the input
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "File Type Error",
          description: "Please upload a valid image file (JPEG, PNG, or WebP).",
          variant: "destructive",
        });
        e.target.value = ''; // Clear the input
        return;
      }

      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateClinicForm = () => {
    console.log('Validating form:', clinicForm);
    if (!clinicForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Clinic name is required",
        variant: "destructive",
      });
      return false;
    }
    if (!clinicForm.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Phone number is required",
        variant: "destructive",
      });
      return false;
    }
    if (!clinicForm.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive",
      });
      return false;
    }
    if (!clinicForm.street.trim()) {
      toast({
        title: "Validation Error",
        description: "Street address is required",
        variant: "destructive",
      });
      return false;
    }
    if (!clinicForm.city.trim()) {
      toast({
        title: "Validation Error",
        description: "City is required",
        variant: "destructive",
      });
      return false;
    }
    if (!clinicForm.state.trim()) {
      toast({
        title: "Validation Error",
        description: "State is required",
        variant: "destructive",
      });
      return false;
    }
    if (!clinicForm.pincode.trim()) {
      toast({
        title: "Validation Error",
        description: "Pincode is required",
        variant: "destructive",
      });
      return false;
    }
    if (!clinicForm.registration_number.trim()) {
      toast({
        title: "Validation Error",
        description: "Registration number is required",
        variant: "destructive",
      });
      return false;
    }
    if (!clinicForm.admin.trim()) {
      toast({
        title: "Validation Error",
        description: "Admin assignment is required",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleFormSubmit = async () => {
    console.log('Form submission started');
    if (!validateClinicForm()) return;

    setLoading(true);
    try {
      if (editingClinic) {
        await handleUpdateClinic();
      } else {
        await handleCreateClinic();
      }
    } catch (error) {
      console.error('Failed to submit clinic form:', error);
      
      // Extract error message
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Show specific error for admin assignment
      if (errorMessage.includes('admin') && errorMessage.includes('assigned')) {
        toast({
          title: "Admin Assignment Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClinic = async () => {
    const formData = new FormData();
    
    // Add all form fields to FormData
    Object.entries(clinicForm).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Send arrays as JSON strings
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== '') {
        formData.append(key, value.toString());
      }
    });

    // Ensure boolean values are properly handled
    formData.append('is_active', clinicForm.is_active.toString());
    formData.append('accepts_online_consultations', clinicForm.accepts_online_consultations.toString());

    if (coverImage) {
      formData.append('cover_image', coverImage);
    }

    console.log('Submitting form data:', Object.fromEntries(formData));
    const response = await superAdminApi.createEClinic(formData);
    console.log('API Response:', response);
    
    if (!response) {
      throw new Error('No response received from API');
    }
    
    console.log('Clinic created successfully:', response);
    
    toast({
      title: "Success",
      description: "Clinic created successfully",
    });
    
    resetForm();
    setShowAddForm(false);
    
    // Refresh the clinics list from server
    await fetchClinics(1);
    fetchClinicStats(); // Refresh stats
  };

  const loadClinicForEdit = (clinic: EClinic) => {
    setClinicForm({
      name: clinic.name,
      description: clinic.description || '',
      phone: clinic.phone,
      email: clinic.email,
      website: clinic.website || '',
      street: clinic.street,
      city: clinic.city,
      state: clinic.state,
      pincode: clinic.pincode,
      country: clinic.country || 'India',
      registration_number: clinic.registration_number,
      license_number: clinic.license_number || '',
      accreditation: clinic.accreditation || '',
      specialties: clinic.specialties || [],
      services: clinic.services || [],
      facilities: clinic.facilities || [],
      is_active: clinic.is_active,
      accepts_online_consultations: clinic.accepts_online_consultations,
      consultation_duration: clinic.consultation_duration,
      admin: clinic.admin || '',
    });
    setEditingClinic(clinic);
    setShowAddForm(true);
  };

  const handleUpdateClinic = async () => {
    if (!editingClinic) return;

    const formData = new FormData();
    
    // Add all form fields to FormData
    Object.entries(clinicForm).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Send arrays as JSON strings
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== '') {
        formData.append(key, value.toString());
      }
    });

    // Ensure boolean values are properly handled
    formData.append('is_active', clinicForm.is_active.toString());
    formData.append('accepts_online_consultations', clinicForm.accepts_online_consultations.toString());

    if (coverImage) {
      formData.append('cover_image', coverImage);
    }

    console.log('Updating clinic with data:', Object.fromEntries(formData));
    const response = await superAdminApi.updateEClinic(editingClinic.id, formData);
    console.log('API Response:', response);
    
    if (!response) {
      throw new Error('No response received from API');
    }
    
    console.log('Clinic updated successfully:', response);
    
    toast({
      title: "Success",
      description: "Clinic updated successfully",
    });
    
    resetForm();
    setShowAddForm(false);
    setEditingClinic(null);
    
    // Refresh the clinics list from server
    await fetchClinics(1);
    fetchClinicStats(); // Refresh stats
  };

  const handleDeleteClinic = async () => {
    if (!deletingClinic) return;

    try {
      await superAdminApi.deleteEClinic(deletingClinic.id);
      
      toast({
        title: "Success",
        description: "Clinic deleted successfully",
      });
      
      setDeletingClinic(null);
      
      // Refresh the clinics list from server
      await fetchClinics(1);
      fetchClinicStats(); // Refresh stats
    } catch (error) {
      console.error('Failed to delete clinic:', error);
      toast({
        title: "Error",
        description: "Failed to delete clinic",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setClinicForm({
      name: '',
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
      specialties: [],
      services: [],
      facilities: [],
      is_active: true,
      accepts_online_consultations: true,
      consultation_duration: 15,
      admin: '',
    });
    setCoverImage(null);
    setCoverImagePreview(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-2">Total Clinics</p>
                <p className="text-2xl font-bold text-blue-900">{clinicStats.total_clinics}</p>
                <p className="text-sm text-blue-600 font-medium mt-1">All registered clinics</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-2">Active Clinics</p>
                <p className="text-2xl font-bold text-green-900">{clinicStats.active_clinics}</p>
                <p className="text-sm text-green-600 font-medium mt-1">Currently operational</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>



        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-2">Online Consultations</p>
                <p className="text-2xl font-bold text-orange-900">{clinicStats.online_consultations}</p>
                <p className="text-sm text-orange-600 font-medium mt-1">Virtual appointments</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>E-Clinic Management</h2>
          <p className={`transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Manage all e-clinics in the platform</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-[#E17726] hover:bg-[#E17726]/90">
          <Plus className="w-4 h-4 mr-2" />
          Add E-Clinic
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-400'
          }`} />
          <Input
            placeholder="Search clinics by name, city, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''
            }`}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 transition-colors duration-300 ${
            isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
        <Button onClick={() => fetchClinics(1)} variant="outline" className={`transition-colors duration-300 ${
          isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''
        }`}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Status</Label>
                <select
                  value={filters.is_active?.toString() || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    is_active: e.target.value === '' ? undefined : e.target.value === 'true'
                  }))}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div>
                <Label>City</Label>
                <Input
                  placeholder="Filter by city"
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  placeholder="Filter by state"
                  value={filters.state}
                  onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinics Grid */}
      <div className="grid gap-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#E17726]" />
          </div>
        ) : clinics.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Building2 className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No clinics found</h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                {searchTerm || Object.values(filters).some(f => f !== undefined && f !== '')
                  ? 'Try adjusting your search or filters to find clinics'
                  : 'Get started by adding your first e-clinic to the platform'}
              </p>
              {!searchTerm && !Object.values(filters).some(f => f !== undefined && f !== '') && (
                <Button onClick={() => setShowAddForm(true)} className="bg-[#E17726] hover:bg-[#E17726]/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First E-Clinic
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinics.filter(clinic => clinic && clinic.id).map((clinic) => (
              <Card key={clinic.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                {/* Cover Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                  {clinic.cover_image && clinic.cover_image !== null ? (
                    <img
                      src={clinic.cover_image}
                      alt={clinic.name || 'Clinic'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <Badge variant={clinic.is_active ? "default" : "secondary"} className="text-xs">
                      {clinic.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Action Menu */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewingClinic(clinic)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => loadClinicForEdit(clinic)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeletingClinic(clinic)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Clinic Info */}
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{clinic.name || 'Unnamed Clinic'}</h3>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{clinic.city || 'N/A'}, {clinic.state || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{clinic.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{clinic.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{clinic.consultation_duration || 15} min consultation</span>
                      </div>
                    </div>

                    {/* Assigned Admin */}
                    {clinic.admin && (
                      <div className="p-2 bg-blue-50 rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <UserCheck className="w-3 h-3 text-blue-600" />
                          <span className="text-xs font-medium text-blue-700">Assigned Admin</span>
                        </div>
                        <p className="text-sm text-blue-800 truncate">
                          {clinic.admin_name || 'Unknown Admin'} ({clinic.admin_phone || 'No phone'})
                        </p>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingClinic(clinic)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadClinicForEdit(clinic)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalClinics)} of {totalClinics} clinics
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchClinics(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => fetchClinics(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchClinics(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
            
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={pageSize.toString()}
                onChange={(e) => {
                  const newPageSize = Number(e.target.value);
                  setPageSize(newPageSize);
                  setCurrentPage(1);
                  // Update the pageSize state and then fetch with new page size
                  setTimeout(() => {
                    fetchClinics(1);
                  }, 0);
                }}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="8">8</option>
                <option value="12">12</option>
                <option value="16">16</option>
                <option value="24">24</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Clinic Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {editingClinic ? 'Edit E-Clinic' : 'Add New E-Clinic'}
            </DialogTitle>
            <DialogDescription>
              {editingClinic 
                ? 'Update the clinic information below.'
                : 'Fill in the details to create a new e-clinic.'
              }
            </DialogDescription>
          </DialogHeader>

          {/* Basic Information Section */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Basic Information
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Clinic Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={clinicForm.name}
                  onChange={(e) => setClinicForm({...clinicForm, name: e.target.value})}
                  placeholder="Enter clinic name"
                  className="mt-1 h-11"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  id="description"
                  value={clinicForm.description}
                  onChange={(e) => setClinicForm({...clinicForm, description: e.target.value})}
                  placeholder="Describe the clinic and its services"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                  <Input
                    id="phone"
                    value={clinicForm.phone}
                    onChange={(e) => setClinicForm({...clinicForm, phone: e.target.value})}
                    placeholder="+91XXXXXXXXXX"
                    className="mt-1 h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={clinicForm.email}
                    onChange={(e) => setClinicForm({...clinicForm, email: e.target.value})}
                    placeholder="clinic@example.com"
                    className="mt-1 h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="website" className="text-sm font-medium text-gray-700">Website</Label>
                  <Input
                    id="website"
                    value={clinicForm.website}
                    onChange={(e) => setClinicForm({...clinicForm, website: e.target.value})}
                    placeholder="https://clinic-website.com"
                    className="mt-1 h-11"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Specialties Section */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Medical Specialties
              </h3>
            </div>

            <div>
              <Label htmlFor="specialties" className="text-sm font-medium text-gray-700">Select Specialties</Label>
              <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100 mt-2">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-32 overflow-y-auto">
                  {[
                    "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Dermatology",
                    "Ophthalmology", "ENT", "General Medicine", "Gynecology", "Urology",
                    "Psychiatry", "Oncology", "Radiology", "Anesthesiology", "Emergency Medicine",
                    "Internal Medicine", "Surgery", "Pulmonology", "Endocrinology", "Gastroenterology"
                  ].map((specialty) => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => {
                        if (clinicForm.specialties.includes(specialty)) {
                          setClinicForm({
                            ...clinicForm,
                            specialties: clinicForm.specialties.filter(s => s !== specialty)
                          });
                        } else {
                          setClinicForm({
                            ...clinicForm,
                            specialties: [...clinicForm.specialties, specialty]
                          });
                        }
                      }}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                        clinicForm.specialties.includes(specialty)
                          ? 'bg-blue-600 text-white shadow-md transform scale-105'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:shadow-sm'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Facilities Section */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Medical Facilities
              </h3>
            </div>

            <div>
              <Label htmlFor="facilities" className="text-sm font-medium text-gray-700">Select Facilities</Label>
              <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-green-100 mt-2">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-32 overflow-y-auto">
                  {[
                    "X-Ray", "MRI", "CT Scan", "Ultrasound", "Laboratory",
                    "Pharmacy", "Emergency Room", "ICU", "Operation Theater", "Blood Bank",
                    "ECG", "EEG", "Endoscopy", "Colonoscopy", "Dental Unit",
                    "Physiotherapy", "Ambulance Service", "24/7 Emergency", "Wheelchair Access", "Parking", "Cafeteria"
                  ].map((facility) => (
                    <button
                      key={facility}
                      type="button"
                      onClick={() => {
                        if (clinicForm.facilities.includes(facility)) {
                          setClinicForm({
                            ...clinicForm,
                            facilities: clinicForm.facilities.filter(f => f !== facility)
                          });
                        } else {
                          setClinicForm({
                            ...clinicForm,
                            facilities: [...clinicForm.facilities, facility]
                          });
                        }
                      }}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                        clinicForm.facilities.includes(facility)
                          ? 'bg-green-600 text-white shadow-md transform scale-105'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-green-50 hover:border-green-400 hover:shadow-sm'
                      }`}
                    >
                      {facility}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-purple-600" />
                Medical Services
              </h3>
            </div>

            <div>
              <Label htmlFor="services" className="text-sm font-medium text-gray-700">Select Services</Label>
              <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-purple-100 mt-2">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-32 overflow-y-auto">
                  {[
                    "General Consultation", "Specialist Consultation", "Emergency Care", "Diagnostic Tests", "Surgery",
                    "Vaccination", "Health Checkup", "Preventive Care", "Chronic Disease Management", "Mental Health Services",
                    "Rehabilitation", "Home Healthcare", "Telemedicine", "Laboratory Services", "Radiology Services",
                    "Pharmacy Services", "Ambulance Services", "Blood Donation", "Health Education", "Nutrition Counseling", "Physiotherapy"
                  ].map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => {
                        if (clinicForm.services.includes(service)) {
                          setClinicForm({
                            ...clinicForm,
                            services: clinicForm.services.filter(s => s !== service)
                          });
                        } else {
                          setClinicForm({
                            ...clinicForm,
                            services: [...clinicForm.services, service]
                          });
                        }
                      }}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                        clinicForm.services.includes(service)
                          ? 'bg-purple-600 text-white shadow-md transform scale-105'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-purple-50 hover:border-purple-400 hover:shadow-sm'
                      }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                Address Information
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="street" className="text-sm font-medium text-gray-700">
                  Street Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="street"
                  value={clinicForm.street}
                  onChange={(e) => setClinicForm({...clinicForm, street: e.target.value})}
                  placeholder="Enter street address"
                  className="mt-1 h-11"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    value={clinicForm.city}
                    onChange={(e) => setClinicForm({...clinicForm, city: e.target.value})}
                    placeholder="City"
                    className="mt-1 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="state"
                    value={clinicForm.state}
                    onChange={(e) => setClinicForm({...clinicForm, state: e.target.value})}
                    placeholder="State"
                    className="mt-1 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode" className="text-sm font-medium text-gray-700">
                    Pincode <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pincode"
                    value={clinicForm.pincode}
                    onChange={(e) => setClinicForm({...clinicForm, pincode: e.target.value})}
                    placeholder="Pincode"
                    className="mt-1 h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country</Label>
                <Input
                  id="country"
                  value={clinicForm.country}
                  onChange={(e) => setClinicForm({...clinicForm, country: e.target.value})}
                  placeholder="Country"
                  className="mt-1 h-11"
                />
              </div>
            </div>
          </div>

          {/* Legal Information Section */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Legal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="registration_number" className="text-sm font-medium text-gray-700">
                  Registration Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="registration_number"
                  value={clinicForm.registration_number}
                  onChange={(e) => setClinicForm({...clinicForm, registration_number: e.target.value})}
                  placeholder="Clinic registration number"
                  className="mt-1 h-11"
                />
              </div>

              <div>
                <Label htmlFor="license_number" className="text-sm font-medium text-gray-700">License Number</Label>
                <Input
                  id="license_number"
                  value={clinicForm.license_number}
                  onChange={(e) => setClinicForm({...clinicForm, license_number: e.target.value})}
                  placeholder="Medical license number"
                  className="mt-1 h-11"
                />
              </div>

              <div>
                <Label htmlFor="accreditation" className="text-sm font-medium text-gray-700">Accreditation</Label>
                <Input
                  id="accreditation"
                  value={clinicForm.accreditation}
                  onChange={(e) => setClinicForm({...clinicForm, accreditation: e.target.value})}
                  placeholder="e.g., NABH, JCI"
                  className="mt-1 h-11"
                />
              </div>
            </div>
          </div>

          {/* Admin Assignment Section */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-600" />
                Admin Assignment
              </h3>
            </div>

            <div>
              <Label htmlFor="admin" className="text-sm font-medium text-gray-700">
                Assign Admin <span className="text-red-500">*</span>
              </Label>
              <select
                id="admin"
                value={clinicForm.admin}
                onChange={(e) => setClinicForm({...clinicForm, admin: e.target.value})}
                className={`w-full mt-1 h-11 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !clinicForm.admin.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select an admin *</option>
                {adminUsers.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name} ({admin.phone})
                  </option>
                ))}
              </select>
              {!clinicForm.admin.trim() && (
                <p className="text-sm text-red-600 mt-1">Please select an admin for this clinic</p>
              )}
            </div>
          </div>

          {/* Cover Image Section */}
          <div className="space-y-6">
            <div className="border-b pb-4">
                             <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                 <ImageIcon className="w-5 h-5 text-pink-600" />
                 Cover Image
               </h3>
            </div>

            <div>
              <Label htmlFor="cover_image" className="text-sm font-medium text-gray-700">Upload Cover Image</Label>
              <p className="text-xs text-gray-500 mt-1 mb-2">Maximum file size: 20MB. Supported formats: JPEG, PNG, WebP</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex-1">
                  <Input
                    id="cover_image"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="flex-1 h-11"
                  />
                </div>
                {coverImagePreview && (
                  <div className="relative">
                    <img
                      src={coverImagePreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg border shadow-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCoverImage(null);
                        setCoverImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 text-white hover:bg-red-600 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              {coverImage && (
                <div className="mt-2 text-xs text-gray-600">
                  <span className="font-medium">Selected file:</span> {coverImage.name} 
                  <span className="ml-2 text-green-600">
                    ({(coverImage.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status Settings Section */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Status Settings
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-6 border rounded-lg bg-gray-50">
                <div>
                  <Label htmlFor="is_active" className="font-medium text-gray-900">Active Status</Label>
                  <p className="text-sm text-gray-600 mt-1">Enable or disable the clinic</p>
                </div>
                <Switch
                  id="is_active"
                  checked={clinicForm.is_active}
                  onCheckedChange={(checked) => setClinicForm({...clinicForm, is_active: checked})}
                />
              </div>
              <div className="flex items-center justify-between p-6 border rounded-lg bg-gray-50">
                <div>
                  <Label htmlFor="accepts_online_consultations" className="font-medium text-gray-900">Online Consultations</Label>
                  <p className="text-sm text-gray-600 mt-1">Allow virtual appointments</p>
                </div>
                <Switch
                  id="accepts_online_consultations"
                  checked={clinicForm.accepts_online_consultations}
                  onCheckedChange={(checked) => setClinicForm({...clinicForm, accepts_online_consultations: checked})}
                />
              </div>
            </div>
            
            {/* Consultation Duration */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="consultation_duration" className="text-sm font-medium text-gray-700">Consultation Duration (minutes)</Label>
                <Input
                  id="consultation_duration"
                  type="number"
                  min="5"
                  max="120"
                  value={clinicForm.consultation_duration}
                  onChange={(e) => setClinicForm({...clinicForm, consultation_duration: parseInt(e.target.value) || 15})}
                  placeholder="15"
                  className="mt-1 h-11 w-full md:w-1/3"
                />
                <p className="text-sm text-gray-600 mt-1">Duration of each consultation slot in minutes (5-120 minutes)</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetForm();
              setShowAddForm(false);
              setEditingClinic(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                console.log('Button clicked');
                handleFormSubmit();
              }} 
              disabled={loading}
              className="bg-[#E17726] hover:bg-[#E17726]/90"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingClinic ? 'Update Clinic' : 'Create Clinic'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingClinic} onOpenChange={() => setDeletingClinic(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete E-Clinic
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>"{deletingClinic?.name}"</strong>? This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingClinic(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteClinic} 
              variant="destructive"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Clinic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Clinic Details Dialog */}
      <Dialog open={!!viewingClinic} onOpenChange={() => setViewingClinic(null)}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          {viewingClinic && (
            <div className="flex flex-col h-full max-h-[95vh]">
              {/* Header with Cover Image */}
              <div className="relative flex-shrink-0">
                {/* Cover Image */}
                {viewingClinic.cover_image ? (
                  <div className="h-48 w-full overflow-hidden">
                    <img
                      src={viewingClinic.cover_image}
                      alt={viewingClinic.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                ) : (
                  <div className="h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                {/* Header Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-semibold text-gray-900 truncate">{viewingClinic.name}</h2>
                        <p className="text-sm text-gray-600">{viewingClinic.city}, {viewingClinic.state}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={viewingClinic.is_active ? "default" : "secondary"} className="text-xs">
                        {viewingClinic.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {viewingClinic.accepts_online_consultations && (
                        <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">
                          <Globe className="w-3 h-3 mr-1" />
                          Online
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 12rem)' }}>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Left Column */}
                    <div className="space-y-4 sm:space-y-6">
                      {/* Contact Information */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          Contact Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                            <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">{viewingClinic.phone}</p>
                              <p className="text-sm text-gray-600">Phone Number</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                            <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">{viewingClinic.email}</p>
                              <p className="text-sm text-gray-600">Email Address</p>
                            </div>
                          </div>
                          {viewingClinic.website && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                              <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 truncate">{viewingClinic.website}</p>
                                <p className="text-sm text-gray-600">Website</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Consultation Settings */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          Consultation Settings
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                            <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900">{viewingClinic.consultation_duration || 15} minutes</p>
                              <p className="text-sm text-gray-600">Consultation Duration</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                            <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900">{viewingClinic.accepts_online_consultations ? 'Enabled' : 'Disabled'}</p>
                              <p className="text-sm text-gray-600">Online Consultations</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          Address
                        </h3>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="text-gray-700 min-w-0 flex-1">
                              <p className="font-medium text-gray-900">{viewingClinic.street}</p>
                              <p className="text-gray-700">{viewingClinic.city}, {viewingClinic.state}</p>
                              <p className="text-gray-600">Pincode: {viewingClinic.pincode}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Legal Information */}
                      {(viewingClinic.registration_number || viewingClinic.license_number || viewingClinic.accreditation) && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            Legal Information
                          </h3>
                          <div className="space-y-3">
                            {viewingClinic.registration_number && (
                              <div className="p-3 bg-gray-50 rounded-md">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Registration Number</p>
                                <p className="font-medium text-gray-900 break-words">{viewingClinic.registration_number}</p>
                              </div>
                            )}
                            {viewingClinic.license_number && (
                              <div className="p-3 bg-gray-50 rounded-md">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">License Number</p>
                                <p className="font-medium text-gray-900 break-words">{viewingClinic.license_number}</p>
                              </div>
                            )}
                            {viewingClinic.accreditation && (
                              <div className="p-3 bg-gray-50 rounded-md">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Accreditation</p>
                                <p className="font-medium text-gray-900 break-words">{viewingClinic.accreditation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Assigned Admin */}
                      {viewingClinic.admin && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            Assigned Admin
                          </h3>
                          <div className="p-3 bg-blue-50 rounded-md">
                            <div className="flex items-center gap-3">
                              <UserCheck className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="font-medium text-blue-900">{viewingClinic.admin_name || 'Unknown Admin'}</p>
                                <p className="text-sm text-blue-700">{viewingClinic.admin_phone || 'No phone'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4 sm:space-y-6">
                      {/* Description */}
                      {viewingClinic.description && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            About
                          </h3>
                          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{viewingClinic.description}</p>
                        </div>
                      )}

                      {/* Specialties */}
                      {viewingClinic.specialties && viewingClinic.specialties.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            Medical Specialties
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {viewingClinic.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs sm:text-sm">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Services */}
                      {viewingClinic.services && viewingClinic.services.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                            <Heart className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            Medical Services
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {viewingClinic.services.map((service, index) => (
                              <Badge key={index} variant="outline" className="text-xs sm:text-sm">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Facilities */}
                      {viewingClinic.facilities && viewingClinic.facilities.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            Medical Facilities
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {viewingClinic.facilities.map((facility, index) => (
                              <Badge key={index} variant="outline" className="text-xs sm:text-sm">
                                {facility}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 border-t border-gray-200 p-4 flex-shrink-0">
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <Button variant="outline" onClick={() => setViewingClinic(null)} className="w-full sm:w-auto">
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      setViewingClinic(null);
                      loadClinicForEdit(viewingClinic);
                    }}
                    className="bg-[#E17726] hover:bg-[#E17726]/90 w-full sm:w-auto"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Clinic
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EClinicManagement; 