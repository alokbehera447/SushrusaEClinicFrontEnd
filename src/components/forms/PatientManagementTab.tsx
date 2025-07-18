import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Eye, 
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
  RefreshCw
} from 'lucide-react';

const PatientManagementTab: React.FC = () => {
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [patientStats, setPatientStats] = useState<PatientStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    gender: '',
    blood_group: '',
    city: '',
    state: '',
    is_active: undefined as boolean | undefined
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);

  // Patient detail states
  const [patientMedicalRecords, setPatientMedicalRecords] = useState<MedicalRecord[]>([]);
  const [patientDocuments, setPatientDocuments] = useState<PatientDocument[]>([]);
  const [patientNotes, setPatientNotes] = useState<PatientNote[]>([]);
  const [activeDetailTab, setActiveDetailTab] = useState('overview');

  useEffect(() => {
    loadPatients();
    loadPatientStats();
  }, [currentPage, searchQuery, filters]);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      // Filter out "all" values and empty strings
      const filteredParams = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => 
          value !== 'all' && value !== '' && value !== undefined
        )
      );

      const params = {
        page: currentPage,
        page_size: 10,
        search: searchQuery || undefined,
        ...filteredParams
      };

      // Expect response as { count, next, previous, results }
      const response = await adminPatientApi.getPatients(params);
      setPatients(response.results || []);
      setTotalPatients(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / 10));
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
    try {
      const [records, documents, notes] = await Promise.all([
        adminPatientApi.getPatientMedicalRecords(patientId),
        adminPatientApi.getPatientDocuments(patientId),
        adminPatientApi.getPatientNotes(patientId)
      ]);
      
      setPatientMedicalRecords(records.results);
      setPatientDocuments(documents.results);
      setPatientNotes(notes.results);
    } catch (error: any) {
      console.error('Error loading patient details:', error);
    }
  };

  const handlePatientCreated = (newPatient: { patient_profile: PatientProfile; user_account: { name: string } }) => {
    setPatients(prev => [newPatient.patient_profile, ...prev]);
    loadPatientStats();
    toast({
      title: "Success",
      description: `Patient ${newPatient.user_account.name} created successfully!`,
    });
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

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return;
    }

    try {
      await adminPatientApi.deletePatient(patientId);
      setPatients(prev => prev.filter(p => p.id !== patientId));
      loadPatientStats();
      toast({
        title: "Success",
        description: "Patient deleted successfully.",
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

  const handleManagePatient = async (patient: PatientProfile) => {
    setSelectedPatient(patient);
    await loadPatientDetails(patient.id);
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
    setActiveDetailTab('overview');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (selectedPatient) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBackToList}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Patients
              </Button>
            <div>
                <h2 className="text-3xl font-bold text-gray-900">{selectedPatient.user_name}</h2>
                <p className="text-gray-600 mt-1">Patient ID: {selectedPatient.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowEditForm(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Patient
              </Button>
              <Button
                onClick={() => handleDeletePatient(selectedPatient.id)}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
                </Button>
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
                        <p className="text-sm font-semibold">{selectedPatient.age || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Gender</Label>
                        <p className="text-sm font-semibold">{selectedPatient.gender || 'Not specified'}</p>
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
                        <p className="text-sm font-semibold">{selectedPatient.user}</p>
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
                  {patientMedicalRecords.length > 0 ? (
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
                                <Eye className="w-4 h-4" />
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
                  {patientDocuments.length > 0 ? (
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
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
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
                  {patientNotes.length > 0 ? (
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Patient Management</h2>
            <p className="text-gray-600 mt-2">Manage patient accounts and their information</p>
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
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{patientStats.total_patients}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E17726]/10 to-[#E17726]/5 flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#E17726]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Active Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{patientStats.active_patients}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">New This Month</p>
                    <p className="text-2xl font-bold text-gray-900">{patientStats.new_patients_this_month}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Top City</p>
                    <p className="text-2xl font-bold text-gray-900">
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
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search patients by name, phone, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                          </div>
              </div>
              <div className="flex gap-2">
                <Select value={filters.gender} onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.blood_group} onValueChange={(value) => setFilters(prev => ({ ...prev, blood_group: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Blood Group" />
                              </SelectTrigger>
                              <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
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
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({
                      gender: '',
                      blood_group: '',
                      city: '',
                      state: '',
                      is_active: ''
                    });
                  }}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

        {/* Patients Table */}
        <Card>
                <CardHeader>
            <CardTitle>Patients ({totalPatients})</CardTitle>
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
                      <TableHead>Patient</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Medical Info</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Created</TableHead>
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
                                {patient.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
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
                              {patient.user_name ? 'Location available' : 'Not specified'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDate(patient.created_at)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleManagePatient(patient)}
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingPatient(patient);
                                setShowEditForm(true);
                              }}
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="w-4 h-4" />
                          </Button>
                            <Button
                              onClick={() => handleDeletePatient(patient.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalPatients)} of {totalPatients} patients
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        size="sm"
                      >
                        Next
                      </Button>
                      </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No patients found.</p>
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