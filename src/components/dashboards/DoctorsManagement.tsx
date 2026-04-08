import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Stethoscope, 
  Plus,
  Search,
  Filter,
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
  TrendingDown,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  DollarSign,
  MoreVertical
} from 'lucide-react';
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
import { doctorApi, DoctorProfile } from '@/lib/api';
import DoctorViewModal from './DoctorViewModal';
import DoctorEditModal from './DoctorEditModal';

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

  // Handle doctor update
  const handleDoctorUpdate = (updatedDoctor: DoctorProfile) => {
    setDoctors(prev => prev.map(doc => 
      doc.id === updatedDoctor.id ? updatedDoctor : doc
    ));
    setEditingDoctor(null);
  };

  // Handle doctor delete
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-midnight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-[#E17726]" />
            Doctors Management
          </h2>
          <p className="text-gray-600 mt-1">Manage and monitor all registered doctors</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-[#E17726] hover:bg-[#c9651e] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Doctor
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search doctors by name, specialization, or license..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                  <select
                    value={filters.is_active === undefined ? '' : filters.is_active.toString()}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      is_active: e.target.value === '' ? undefined : e.target.value === 'true'
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Verification</label>
                  <select
                    value={filters.is_verified === undefined ? '' : filters.is_verified.toString()}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      is_verified: e.target.value === '' ? undefined : e.target.value === 'true'
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All</option>
                    <option value="true">Verified</option>
                    <option value="false">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Specialization</label>
                  <Input
                    placeholder="Filter by specialization"
                    value={filters.specialization}
                    onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ is_active: undefined, is_verified: undefined, specialization: '' })}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Doctors List */}
      <Card>
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
                        onClick={() => setEditingDoctor(doctor)}
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
                          <DropdownMenuItem onClick={() => setEditingDoctor(doctor)}>
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

      {/* View Doctor Modal */}
      <DoctorViewModal
        doctor={viewingDoctor}
        onClose={() => setViewingDoctor(null)}
        onEdit={(doctor) => {
          setViewingDoctor(null);
          setEditingDoctor(doctor);
        }}
      />

      {/* Edit Doctor Modal */}
      <DoctorEditModal
        doctor={editingDoctor}
        onClose={() => setEditingDoctor(null)}
        onSave={handleDoctorUpdate}
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

export default DoctorsManagement; 