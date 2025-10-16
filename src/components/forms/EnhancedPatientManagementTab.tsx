import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/context/AuthContext';
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
  UserX,
  Lock,
  Key,
  AlertTriangle
} from 'lucide-react';

// OTP Verification Modal Component
interface OTPVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingPatient: PatientProfile | null;
  otpValue: string;
  otpError: string;
  isOtpLoading: boolean;
  onOtpChange: (value: string) => void;
  onOtpSubmit: () => void;
  onOtpCancel: () => void;
}

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  open,
  onOpenChange,
  pendingPatient,
  otpValue,
  otpError,
  isOtpLoading,
  onOtpChange,
  onOtpSubmit,
  onOtpCancel
}) => {
  console.log('🎭 OTP Modal Render - open:', open, 'pendingPatient:', pendingPatient?.id);
  
  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-orange-500" />
          Security Verification Required
        </DialogTitle>
        <DialogDescription>
          To access sensitive patient medical records, please enter the 6-digit OTP sent to your registered phone number.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full">
            <Key className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Accessing medical records for:
          </p>
          <p className="font-semibold text-gray-900">
            {pendingPatient?.user_name}
          </p>
          <p className="text-xs text-gray-500">
            Patient ID: {pendingPatient?.id}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="otp" className="text-sm font-medium">
            Enter 6-digit OTP
          </Label>
          <Input
            id="otp"
            type="text"
            value={otpValue}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              onOtpChange(value);
            }}
            placeholder="000000"
            className="text-center text-lg font-mono tracking-widest"
            maxLength={6}
            disabled={isOtpLoading}
          />
          {otpError && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {otpError}
            </p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> For testing purposes, use OTP: <code className="bg-blue-100 px-1 rounded">123456</code>
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={onOtpCancel}
          disabled={isOtpLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={onOtpSubmit}
          disabled={isOtpLoading || !otpValue.trim()}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {isOtpLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Verify & Access
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  );
};

const EnhancedPatientManagementTab: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
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
    gender: '',
    blood_group: '',
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
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);

  // OTP Verification State
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [pendingPatient, setPendingPatient] = useState<PatientProfile | null>(null);
  const [otpError, setOtpError] = useState('');
  const [pageSize, setPageSize] = useState(10);

  // Patient detail states
  const [patientMedicalRecords, setPatientMedicalRecords] = useState<MedicalRecord[]>([]);
  const [patientDocuments, setPatientDocuments] = useState<PatientDocument[]>([]);
  const [patientNotes, setPatientNotes] = useState<PatientNote[]>([]);
  const [activeDetailTab, setActiveDetailTab] = useState('overview');
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadPatients();
    loadPatientStats();
  }, [currentPage, pageSize, sortBy, sortOrder]);

  // Load patients with search and filters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      loadPatients();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      // Filter out empty values
      const filteredParams = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => 
          value !== '' && value !== undefined && value !== null
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
      setTotalPages(Math.ceil((response.count || 0) / pageSize));
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

  const handlePatientCreated = (newPatient: { user_id: string; name: string; patient_profile: string | null }) => {
    // Reload the patients list to get the updated data
    loadPatients();
    loadPatientStats();
    toast({
      title: "Success",
      description: `Patient ${newPatient.name} created successfully!`,
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

  // Permission check functions
  const hasEditPermission = (patient: PatientProfile) => {
    // Super admin can edit any patient
    if (user?.role === 'superadmin') return true;
    
    // Admin can only edit patients if they have explicit permission
    if (user?.role === 'admin') {
      // Check if patient has given consent for admin editing
      return patient.can_be_edited_by_admin === true;
    }
    
    return false;
  };

  const hasDeletePermission = (patient: PatientProfile) => {
    // Super admin can delete any patient
    if (user?.role === 'superadmin') return true;
    
    // Admin can only delete patients if they have explicit permission
    if (user?.role === 'admin') {
      // Check if patient has given consent for admin deletion
      return patient.can_be_deleted_by_admin === true;
    }
    
    return false;
  };

  const requestPatientConsent = async (patient: PatientProfile, action: 'edit' | 'delete') => {
    try {
      // This would typically send a notification to the patient
      // For now, we'll show a toast message
      toast({
        title: "Permission Required",
        description: `Requesting consent from ${patient.user_name} for ${action} operation`,
      });
      
      // In a real implementation, you would:
      // 1. Send a notification to the patient
      // 2. Wait for their response
      // 3. Update the patient's consent flags
      
      return false; // For now, return false to indicate consent not given
    } catch (error) {
      console.error('Error requesting patient consent:', error);
      toast({
        title: "Error",
        description: "Failed to request patient consent",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeletePatient = async (patient: PatientProfile) => {
    // Check permissions
    if (!hasDeletePermission(patient)) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to delete this patient. Contact super admin or request patient consent.",
        variant: "destructive",
      });
      
      // Optionally request consent
      const consentGiven = await requestPatientConsent(patient, 'delete');
      if (!consentGiven) {
        return;
      }
    }

    try {
      // Delete the user account (which will cascade delete the patient profile)
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

  // OTP Verification Functions
  const handleViewPatientDetails = async (patient: PatientProfile) => {
    console.log('🔍 handleViewPatientDetails called for patient:', patient.id);
    
    // For testing - bypass API call and show modal directly
    console.log('🎯 Showing OTP modal directly for testing');
    setPendingPatient(patient);
    setShowOTPModal(true);
    setOtpValue('');
    setOtpError('');
    
    console.log('🎯 OTP Modal should be visible now');
    
    toast({
      title: "OTP Required",
      description: `Please enter OTP to access ${patient.user_name}'s medical records`,
    });
    
    // Comment out API call for now to test modal
    /*
    try {
      // First, send OTP to admin
      console.log('📤 Sending OTP for patient:', patient.id);
      const otpResponse = await adminPatientApi.sendAdminOTP(patient.id);
      console.log('✅ OTP sent successfully:', otpResponse);
      
      setPendingPatient(patient);
      setShowOTPModal(true);
      setOtpValue('');
      setOtpError('');
      
      console.log('🎯 OTP Modal should be visible now');
      
      toast({
        title: "OTP Sent",
        description: `OTP sent for accessing ${patient.user_name}'s medical records`,
      });
    } catch (error: any) {
      console.error('❌ Error sending OTP:', error);
      
      // Even if OTP fails, show the modal for testing
      console.log('🔄 Showing OTP modal despite API error for testing');
      setPendingPatient(patient);
      setShowOTPModal(true);
      setOtpValue('');
      setOtpError('API Error - Using test OTP: 123456');
      
      toast({
        title: "OTP Error",
        description: "Using test mode. Enter OTP: 123456",
        variant: "destructive"
      });
    }
    */
  };

  const handleOtpSubmit = async () => {
    if (!pendingPatient) return;
    
    if (!otpValue.trim()) {
      setOtpError('Please enter the OTP');
      return;
    }

    if (otpValue.length !== 6) {
      setOtpError('OTP must be 6 digits');
      return;
    }

    setIsOtpLoading(true);
    setOtpError('');

    // For testing - accept any 6-digit OTP
    if (otpValue === '123456' || otpValue === '000000') {
      console.log('✅ Test OTP accepted');
      setShowOTPModal(false);
      setOtpValue('');
      setOtpError('');
      // Proceed with loading patient details
      await handleManagePatient(pendingPatient);
      toast({
        title: "Access Granted",
        description: `Access granted to ${pendingPatient.user_name}'s medical records`,
      });
      setIsOtpLoading(false);
      return;
    }

    try {
      // Verify OTP with backend
      const verificationResult = await adminPatientApi.verifyAdminOTP(pendingPatient.id, otpValue);
      
      if (verificationResult.access_granted) {
        setShowOTPModal(false);
        setOtpValue('');
        setOtpError('');
        // Proceed with loading patient details
        await handleManagePatient(pendingPatient);
        toast({
          title: "Access Granted",
          description: `Access granted to ${verificationResult.patient_name}'s medical records`,
        });
      } else {
        setOtpError('Access denied. Please try again.');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to verify OTP. Please try again.';
      setOtpError(errorMessage);
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleOtpCancel = () => {
    setShowOTPModal(false);
    setOtpValue('');
    setOtpError('');
    setPendingPatient(null);
  };

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
      gender: '',
      blood_group: '',
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
                              {/* View button commented out
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              */}
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
                                {/* View button commented out
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                */}
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
      </div>
    );
  }

  // Main Patient List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Patient Management</h2>
            <p className="text-gray-600 mt-2">Manage patient accounts and their information</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-[#E17726] hover:bg-[#c9651e] text-white px-6 py-3 rounded-xl shadow-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Patient
            </Button>
            <Button
              onClick={() => window.location.href = '/dashboard/patients'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg"
            >
              <Users className="mr-2 h-5 w-5" />
              Manage Patients
            </Button>
          </div>
        </div>



        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search patients by name, phone, email, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
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
                        <SelectItem value="">All genders</SelectItem>
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
                        <SelectItem value="">All blood groups</SelectItem>
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
                            {/* View button commented out - OTP functionality disabled
                            <Button
                              onClick={() => handleViewPatientDetails(patient)}
                              variant="outline"
                              size="sm"
                              title="View Details (Requires OTP)"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            */}
                            <Button
                              onClick={() => {
                                // Check edit permissions
                                if (!hasEditPermission(patient)) {
                                  toast({
                                    title: "Permission Denied",
                                    description: "You do not have permission to edit this patient. Contact super admin or request patient consent.",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                setEditingPatient(patient);
                                setShowEditForm(true);
                              }}
                              variant="outline"
                              size="sm"
                              title={hasEditPermission(patient) ? "Edit Patient" : "Edit Patient (Permission Required)"}
                              className={!hasEditPermission(patient) ? "opacity-50 cursor-not-allowed" : ""}
                              disabled={!hasEditPermission(patient)}
                            >
                              <Edit className="w-4 h-4" />
                              {!hasEditPermission(patient) && <Lock className="w-3 h-3 ml-1 text-gray-400" />}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`text-red-600 hover:text-red-700 ${!hasDeletePermission(patient) ? "opacity-50 cursor-not-allowed" : ""}`}
                                  title={hasDeletePermission(patient) ? "Delete Patient" : "Delete Patient (Permission Required)"}
                                  disabled={!hasDeletePermission(patient)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  {!hasDeletePermission(patient) && <Lock className="w-3 h-3 ml-1 text-gray-400" />}
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
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalPatients)} of {totalPatients} patients
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <Button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        size="sm"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
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

      {/* Add OTP Modal */}
      <OTPVerificationModal
        open={showOTPModal}
        onOpenChange={setShowOTPModal}
        pendingPatient={pendingPatient}
        otpValue={otpValue}
        otpError={otpError}
        isOtpLoading={isOtpLoading}
        onOtpChange={(value) => {
          setOtpValue(value);
          if (otpError) setOtpError('');
        }}
        onOtpSubmit={handleOtpSubmit}
        onOtpCancel={handleOtpCancel}
      />
    </div>
  );
};

export default EnhancedPatientManagementTab; 