import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  adminPatientApi, 
  PatientProfile, 
  PatientStats, 
  MedicalRecord, 
  PatientDocument, 
  PatientNote,
  formatDate,
  formatDateTime,
  getStatusColor
} from '@/lib/api';
import PatientCreationForm from './PatientCreationForm';
import PatientEditForm from './PatientEditForm';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  FileText, 
  Stethoscope, 
  Upload, 
  ArrowLeft, 
  Settings, 
  Video, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MapPin,
  Heart,
  Shield,
  User,
  Activity,
  Loader2,
  RefreshCw,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  FilterX,
  SortAsc,
  SortDesc,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  Users2,
  UserPlus,
  UserCheck,
  UserX
} from 'lucide-react';


interface PatientManagementTabProps {
  isDarkMode?: boolean;
}

const PatientManagementTab: React.FC<PatientManagementTabProps> = ({ isDarkMode = false }) => {
  const { toast } = useToast();
  
  // Main states
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [patientStats, setPatientStats] = useState<PatientStats | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    gender: 'all',
    blood_group: 'all',
    city: '',
    state: '',
    age_min: '',
    age_max: '',
    is_active: '',
    preferred_language: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Patient detail states
  const [patientMedicalRecords, setPatientMedicalRecords] = useState<MedicalRecord[]>([]);
  const [patientDocuments, setPatientDocuments] = useState<PatientDocument[]>([]);
  const [patientNotes, setPatientNotes] = useState<PatientNote[]>([]);
  const [activeDetailTab, setActiveDetailTab] = useState('overview');
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);


  // Load patients with pagination, search, filters, and sorting
  useEffect(() => {
    loadPatients();
    loadPatientStats();
  }, [searchQuery, filters, currentPage, pageSize, sortBy, sortOrder]);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      // Filter out empty values and "all" values
      const filteredParams = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => 
          value !== '' && value !== 'all' && value !== undefined && value !== null
        )
      );

      const params = {
        page: currentPage,
        page_size: pageSize,
        search: searchQuery || undefined,
        ordering: sortOrder === 'desc' ? `-${sortBy}` : sortBy,
        ...filteredParams
      };

      const response = await adminPatientApi.getPatients(params);
      setPatients(response.results || []);
      setTotalPatients(response.count || 0);
    } catch (error: any) {
      console.error('Error loading patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatientStats = async () => {
    try {
      const stats = await adminPatientApi.getPatientStats();
      setPatientStats(stats);
    } catch (error: any) {
      console.error('Error loading patient stats:', error);
    }
  };

  const loadPatientDetails = async (patientId: string) => {
    setIsLoadingDetails(true);
    try {
      const [records, documents, notes] = await Promise.all([
        adminPatientApi.getPatientMedicalRecords(patientId),
        adminPatientApi.getPatientDocuments(patientId),
        adminPatientApi.getPatientNotes(patientId)
      ]);
      
      setPatientMedicalRecords(records || []);
      setPatientDocuments(documents || []);
      setPatientNotes(notes || []);
    } catch (error: any) {
      console.error('Error loading patient details:', error);
      toast({
        title: "Error",
        description: "Failed to load patient details.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handlePatientCreated = async (newPatient: {
    user_id: string;
    phone: string;
    name: string;
    email: string;
    role: string;
    password: string;
    patient_profile: string | null;
  }) => {
    try {
      // Get the full patient profile data
      const patientProfile = await adminPatientApi.getPatient(newPatient.user_id);
      setPatients(prev => [patientProfile, ...prev]);
      loadPatientStats();
      toast({
        title: "Success",
        description: `Patient ${newPatient.name} created successfully!`,
      });
    } catch (error) {
      console.error('Error loading created patient:', error);
      toast({
        title: "Success",
        description: `Patient ${newPatient.name} created successfully!`,
      });
    }
  };

  const handlePatientUpdated = (updatedPatient: PatientProfile) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    if (selectedPatient?.id === updatedPatient.id) {
      setSelectedPatient(updatedPatient);
    }
    toast({
      title: "Success",
      description: `Patient ${updatedPatient.user_name} updated successfully!`,
    });
  };

  const handleDeletePatient = async (patient: PatientProfile) => {
    try {
      await adminPatientApi.deletePatient(patient.id);
      setPatients(prev => prev.filter(p => p.id !== patient.id));
      if (selectedPatient?.id === patient.id) {
        setSelectedPatient(null);
      }
      loadPatientStats();
      toast({
        title: "Success",
        description: `Patient ${patient.user_name} deleted successfully.`,
      });
    } catch (error: any) {
      console.error('Error deleting patient:', error);
      toast({
        title: "Error",
        description: "Failed to delete patient. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Modified handleManagePatient - now only called after OTP verification
  const handleManagePatient = async (patient: PatientProfile) => {
    setSelectedPatient(patient);
    await loadPatientDetails(patient.id);
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
    setActiveDetailTab('overview');
  };

  const clearFilters = () => {
    setFilters({
      gender: 'all',
      blood_group: 'all',
      city: '',
      state: '',
      age_min: '',
      age_max: '',
      is_active: '',
      preferred_language: ''
    });
    setSearchQuery('');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;
  };

  const getStatusBadge = (patient: PatientProfile) => {
    const isActive = patient.is_active !== false;
    return (
      <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const getAgeFromDateOfBirth = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };





  // Patient Detail View
  if (selectedPatient) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-gray-50 to-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBackToList}
                variant="outline"
                className={`flex items-center gap-2 transition-colors duration-300 ${
                  isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Patients
              </Button>
              <div>
                <h2 className={`text-3xl font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{selectedPatient.user_name}</h2>
                <p className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                } mt-1`}>Patient ID: {selectedPatient.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  setEditingPatient(selectedPatient);
                  setShowEditForm(true);
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Patient
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Patient</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedPatient.user_name}? This action cannot be undone and will permanently remove all patient data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeletePatient(selectedPatient)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Patient
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Patient Details Tabs */}
          <Tabs value={activeDetailTab} onValueChange={setActiveDetailTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="medical">Medical Records</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="consultations">Consultations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Name</Label>
                        <p className="text-sm font-semibold">{selectedPatient.user_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Phone</Label>
                        <p className="text-sm font-semibold">{selectedPatient.user_phone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Email</Label>
                        <p className="text-sm font-semibold">{selectedPatient.user_email || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Age</Label>
                        <p className="text-sm font-semibold">
                          {getAgeFromDateOfBirth(selectedPatient.date_of_birth) || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Gender</Label>
                        <p className="text-sm font-semibold capitalize">{selectedPatient.gender || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Blood Group</Label>
                        <p className="text-sm font-semibold">{selectedPatient.blood_group || 'Not specified'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Medical Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Medical Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Allergies</Label>
                      <p className="text-sm">{selectedPatient.allergies || 'None reported'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Chronic Conditions</Label>
                      {selectedPatient.chronic_conditions && selectedPatient.chronic_conditions.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedPatient.chronic_conditions.map((condition, index) => (
                            <Badge key={index} variant="secondary">{condition}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm">None reported</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Current Medications</Label>
                      {selectedPatient.current_medications && selectedPatient.current_medications.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedPatient.current_medications.map((medication, index) => (
                            <Badge key={index} variant="outline">{medication}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm">None reported</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Patient ID</Label>
                        <p className="text-sm font-semibold">{selectedPatient.id}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">User ID</Label>
                        <p className="text-sm font-semibold">{selectedPatient.id}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Preferred Language</Label>
                        <p className="text-sm font-semibold capitalize">{selectedPatient.preferred_language || 'English'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Created</Label>
                        <p className="text-sm font-semibold">{formatDateTime(selectedPatient.created_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Insurance Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Insurance Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Provider</Label>
                        <p className="text-sm font-semibold">{selectedPatient.insurance_provider || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Policy Number</Label>
                        <p className="text-sm font-semibold">{selectedPatient.insurance_policy_number || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Expiry Date</Label>
                        <p className="text-sm font-semibold">
                          {selectedPatient.insurance_expiry ? formatDate(selectedPatient.insurance_expiry) : 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" />
                    Medical Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingDetails ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-[#E17726]" />
                    </div>
                  ) : patientMedicalRecords.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Recorded By</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patientMedicalRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <Badge variant="outline">{record.record_type}</Badge>
                            </TableCell>
                            <TableCell>{record.title}</TableCell>
                            <TableCell>{formatDate(record.date_recorded)}</TableCell>
                            <TableCell>{record.recorded_by || 'Unknown'}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No medical records found for this patient.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Patient Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingDetails ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-[#E17726]" />
                    </div>
                  ) : patientDocuments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Uploaded</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patientDocuments.map((document) => (
                          <TableRow key={document.id}>
                            <TableCell>
                              <Badge variant="outline">{document.document_type}</Badge>
                            </TableCell>
                            <TableCell>{document.title}</TableCell>
                            <TableCell>{formatDateTime(document.uploaded_at)}</TableCell>
                            <TableCell>
                              <Badge className={document.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {document.is_verified ? 'Verified' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No documents found for this patient.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Patient Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingDetails ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-[#E17726]" />
                    </div>
                  ) : patientNotes.length > 0 ? (
                    <div className="space-y-4">
                      {patientNotes.map((note) => (
                        <Card key={note.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm text-gray-900">{note.note}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span>By: {note.created_by}</span>
                                  <span>{formatDateTime(note.created_at)}</span>
                                  {note.is_private && (
                                    <Badge variant="secondary" className="text-xs">Private</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No notes found for this patient.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consultations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Consultations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Consultation history will be displayed here.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Patient Edit Form */}
        <PatientEditForm
          open={showEditForm}
          onOpenChange={(open) => {
            setShowEditForm(open);
            if (!open) setEditingPatient(null);
          }}
          patient={editingPatient}
          onPatientUpdated={handlePatientUpdated}
        />
      </div>
    );
  }

  // Main Patient List View
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 to-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className={`text-3xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Patient Management</h2>
            <p className={`transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            } mt-2`}>Manage patient accounts and their information</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-[#E17726] hover:bg-[#c9651e] text-white px-6 py-3 rounded-xl shadow-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Patient
          </Button>
        </div>

        {/* Statistics Cards */}
        {patientStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className={`border-0 shadow-lg rounded-2xl backdrop-blur-sm transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Total Patients</p>
                    <p className={`text-2xl font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{patientStats.total_patients}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E17726]/10 to-[#E17726]/5 flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#E17726]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className={`border-0 shadow-lg rounded-2xl backdrop-blur-sm transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Active Patients</p>
                    <p className={`text-2xl font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{patientStats.active_patients}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className={`border-0 shadow-lg rounded-2xl backdrop-blur-sm transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>New This Month</p>
                    <p className={`text-2xl font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{patientStats.new_patients_this_month}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className={`border-0 shadow-lg rounded-2xl backdrop-blur-sm transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Top City</p>
                    <p className={`text-2xl font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {patientStats.top_cities.length > 0 ? patientStats.top_cities[0].city : 'N/A'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className={`mb-6 transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800/90 border-gray-700' : ''
        }`}>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <Input
                    placeholder="Search patients by name, phone, email, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 transition-colors duration-300 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''
                    }`}
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FilterX className="w-4 h-4" />
                  Clear
                </Button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <Label className="text-sm font-medium">Gender</Label>
                    <Select value={filters.gender} onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All genders" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All genders</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Blood Group</Label>
                    <Select value={filters.blood_group} onValueChange={(value) => setFilters(prev => ({ ...prev, blood_group: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All blood groups" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All blood groups</SelectItem>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">City</Label>
                    <Input
                      placeholder="Filter by city"
                      value={filters.city}
                      onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">State</Label>
                    <Input
                      placeholder="Filter by state"
                      value={filters.state}
                      onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Patients ({totalPatients})</CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Page size:</Label>
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#E17726]" />
              </div>
            ) : patients.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('user_name')}
                          className="flex items-center gap-1 p-0 h-auto font-semibold"
                        >
                          Patient
                          {getSortIcon('user_name')}
                        </Button>
                      </TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Medical Info</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('created_at')}
                          className="flex items-center gap-1 p-0 h-auto font-semibold"
                        >
                          Created
                          {getSortIcon('created_at')}
                        </Button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                                                          <AvatarFallback>
                              {patient.user_name ? patient.user_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'N/A'}
                            </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{patient.user_name}</p>
                              <p className="text-sm text-gray-500">ID: {patient.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="text-sm">{patient.user_phone}</span>
                            </div>
                            {patient.user_email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="text-sm">{patient.user_email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {patient.blood_group && (
                              <Badge variant="outline">{patient.blood_group}</Badge>
                            )}
                            {patient.age && (
                              <p className="text-sm text-gray-600">{patient.age} years</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">
                              {patient.city ? `${patient.city}, ${patient.state || ''}` : 'Not specified'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDate(patient.created_at)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(patient)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => {
                                setEditingPatient(patient);
                                setShowEditForm(true);
                              }}
                              variant="outline"
                              size="sm"
                              title="Edit Patient"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  title="Delete Patient"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Patient</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {patient.user_name}? This action cannot be undone and will permanently remove all patient data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePatient(patient)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Patient
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPatients > 0 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-700">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalPatients)} of {totalPatients} patients
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Show:</span>
                        <select
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1); // Reset to first page when changing page size
                          }}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <span className="text-sm text-gray-600">per page</span>
                      </div>
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
                        {Array.from({ length: Math.min(5, Math.ceil(totalPatients / pageSize)) }, (_, i) => {
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
                        disabled={currentPage >= Math.ceil(totalPatients / pageSize)}
                      >
                        Next
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.ceil(totalPatients / pageSize))}
                        disabled={currentPage >= Math.ceil(totalPatients / pageSize)}
                      >
                        Last
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No patients found.</p>
                {searchQuery || Object.values(filters).some(v => v !== '') && (
                  <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Patient Creation Form */}
      <PatientCreationForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onPatientCreated={handlePatientCreated}
      />

      {/* Patient Edit Form */}
      <PatientEditForm
        open={showEditForm}
        onOpenChange={(open) => {
          setShowEditForm(open);
          if (!open) setEditingPatient(null);
        }}
        patient={editingPatient}
        onPatientUpdated={handlePatientUpdated}
      />

    </div>
  );
};

export default PatientManagementTab; 