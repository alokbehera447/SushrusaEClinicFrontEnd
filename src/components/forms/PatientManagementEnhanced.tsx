import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  FileText
} from 'lucide-react';
import { 
  adminPatientApi,
  PatientProfile,
  PatientStats,
  CreatePatientUserData,
  CreatePatientProfileData
} from '@/lib/api';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

// Patient Management Enhanced Component
interface PatientManagementEnhancedProps {
  isAssignedToClinic?: boolean;
}

const PatientManagementEnhanced = ({ isAssignedToClinic = true }: PatientManagementEnhancedProps) => {
  const navigate = useNavigate();
  
  // State management
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [patientStats, setPatientStats] = useState<PatientStats | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Error states
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPatients, setTotalPatients] = useState(0);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all');
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);

  // Fetch patient statistics
  const fetchPatientStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      setStatsError(null);
      const stats = await adminPatientApi.getPatientStats();
      setPatientStats(stats);
    } catch (error) {
      console.error('Error fetching patient stats:', error);
      setStatsError('Failed to load patient statistics');
      toast.error('Failed to load patient statistics');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch patients with pagination and filters
  const fetchPatients = useCallback(async () => {
    try {
      setLoadingPatients(true);
      setPatientsError(null);
      
      const params: Record<string, string | number> = {
        page: currentPage,
        page_size: pageSize,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active' ? 'true' : 'false';
      if (genderFilter !== 'all') params.gender = genderFilter;
      if (bloodGroupFilter !== 'all') params.blood_group = bloodGroupFilter;
      
      const response = await adminPatientApi.getPatients(params);
      setPatients(response.results);
      setTotalPatients(response.count);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatientsError('Failed to load patients');
      toast.error('Failed to load patients');
    } finally {
      setLoadingPatients(false);
    }
  }, [currentPage, pageSize, searchQuery, statusFilter, genderFilter, bloodGroupFilter]);

  // Initialize data on component mount
  useEffect(() => {
    fetchPatientStats();
    fetchPatients();
  }, [fetchPatientStats, fetchPatients]);

  // Handle patient actions
  const handlePatientAction = async (action: string, patient: PatientProfile) => {
    try {
      switch (action) {
        case 'view':
          navigate(`/dashboard/patients/${patient.id}`);
          break;
        case 'edit':
          navigate(`/dashboard/patients/${patient.id}/edit`);
          break;
        case 'delete':
          setSelectedPatient(patient);
          setShowDeleteDialog(true);
          break;
        case 'consultation':
          navigate(`/dashboard/consultations/new?patient=${patient.id}`);
          break;
        case 'medical-records':
          navigate(`/dashboard/patients/${patient.id}/medical-records`);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action} on patient:`, error);
      toast.error(`Failed to ${action} patient`);
    }
  };

  // Handle patient deletion
  const handleDeletePatient = async () => {
    if (!selectedPatient) return;
    
    try {
      await adminPatientApi.deletePatient(selectedPatient.id);
      toast.success('Patient deleted successfully');
      setShowDeleteDialog(false);
      setSelectedPatient(null);
      fetchPatients(); // Refresh the list
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient');
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Patient statistics cards
  const statsCards = [
    {
      title: "Total Patients",
      value: patientStats?.total_patients || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: "New This Month",
      value: patientStats?.new_patients_this_month || 0,
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: "Active Patients",
      value: patientStats?.active_patients || 0,
      icon: UserCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: "Follow-ups Due",
      value: 23, // Mock data - can be calculated from patient data
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* No Clinic Assignment Warning */}
      {!isAssignedToClinic && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">No E-Clinic Assignment</AlertTitle>
          <AlertDescription className="text-orange-700">
            You have not been assigned to any e-clinic. Patient management features are disabled. 
            Please contact the super admin to get assigned to an e-clinic.
          </AlertDescription>
        </Alert>
      )}

      {/* Patient Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Error Alerts */}
      {statsError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Statistics Error</AlertTitle>
          <AlertDescription className="text-red-700">{statsError}</AlertDescription>
        </Alert>
      )}

      {patientsError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Patients Error</AlertTitle>
          <AlertDescription className="text-red-700">{patientsError}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search patients by name, phone, or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                disabled={!isAssignedToClinic}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter} disabled={!isAssignedToClinic}>
              <SelectTrigger className="w-full lg:w-40 h-11 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={genderFilter} onValueChange={setGenderFilter} disabled={!isAssignedToClinic}>
              <SelectTrigger className="w-full lg:w-40 h-11 rounded-xl">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gender</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter} disabled={!isAssignedToClinic}>
              <SelectTrigger className="w-full lg:w-40 h-11 rounded-xl">
                <SelectValue placeholder="Blood Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blood Groups</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => navigate('/dashboard/patients/new')}
              className="bg-[#E17726] hover:bg-[#c9651e] text-white h-11 px-6 rounded-xl"
              disabled={!isAssignedToClinic}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Patient Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPatients ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                  <Skeleton className="h-8 w-[100px]" />
                  <Skeleton className="h-8 w-[80px]" />
                </div>
              ))}
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== 'all' || genderFilter !== 'all' || bloodGroupFilter !== 'all'
                  ? 'No patients match your search criteria.'
                  : 'No patients have been registered yet.'
                }
              </p>
              <Button 
                onClick={() => navigate('/dashboard/patients/new')}
                className="bg-[#E17726] hover:bg-[#c9651e] text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add First Patient
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Age/Gender</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src="/patient-avatar-1.svg" />
                            <AvatarFallback>{patient.user_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{patient.user_name}</div>
                            <div className="text-sm text-gray-500">ID: {patient.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center text-gray-900">
                            <Phone className="w-3 h-3 mr-1" />
                            {patient.user_phone}
                          </div>
                          {patient.user_email && (
                            <div className="flex items-center text-gray-500">
                              <Mail className="w-3 h-3 mr-1" />
                              {patient.user_email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">
                          {patient.age || 'N/A'} years • {patient.gender || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">
                          {patient.blood_group || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePatientAction('view', patient)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePatientAction('edit', patient)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Patient
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePatientAction('consultation', patient)}>
                              <Calendar className="w-4 h-4 mr-2" />
                              Book Consultation
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePatientAction('medical-records', patient)}>
                              <FileText className="w-4 h-4 mr-2" />
                              Medical Records
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handlePatientAction('delete', patient)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Patient
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalPatients)} of {totalPatients} patients
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {Math.ceil(totalPatients / pageSize)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(totalPatients / pageSize)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Patient</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedPatient?.user_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePatient}
            >
              Delete Patient
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientManagementEnhanced; 