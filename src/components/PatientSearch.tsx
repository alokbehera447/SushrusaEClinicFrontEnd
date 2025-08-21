import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  Lock,
  Key,
  AlertTriangle,
  Shield,
  Loader2
} from 'lucide-react';
import { 
  patientService, 
  type PatientProfile, 
  type PatientSearchParams 
} from '@/services/patientService';
import { adminPatientApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

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
}) => (
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

interface PatientSearchProps {
  onPatientSelect?: (patient: PatientProfile) => void;
  showActions?: boolean;
  showBookConsultation?: boolean;
}

export const PatientSearch: React.FC<PatientSearchProps> = ({ 
  onPatientSelect,
  showActions = true,
  showBookConsultation = false
}) => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<PatientSearchParams>({
    query: '',
    gender: '',
    blood_group: '',
    age_min: undefined,
    age_max: undefined,
    city: '',
    state: '',
    page: 1,
    page_size: 20
  });
  const [showFilters, setShowFilters] = useState(false);

  // OTP Verification State
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [pendingPatient, setPendingPatient] = useState<PatientProfile | null>(null);
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    if (searchParams.query || searchParams.gender || searchParams.blood_group || 
        searchParams.age_min || searchParams.age_max || searchParams.city || searchParams.state) {
      searchPatients();
    }
  }, [searchParams]);

  const searchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientService.searchPatients(searchParams);
      
      console.log('Patient search response:', response);
      
      // Handle the paginated response structure
      let patientData: PatientProfile[] = [];
      
      console.log('🔍 Processing response structure:', {
        hasData: !!response.data,
        hasResults: !!response.results,
        resultsDataType: typeof response.results,
        resultsData: response.results
      });
      
      // Check if response has results with nested data structure
      if (response.results && response.results.data && Array.isArray(response.results.data)) {
        patientData = response.results.data;
        console.log('✅ Found data in response.results.data');
      } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
        // Standard paginated response
        patientData = response.data.results;
        console.log('✅ Found data in response.data.results');
      } else if (response.data && Array.isArray(response.data)) {
        // Direct array response
        patientData = response.data;
        console.log('✅ Found data in response.data');
      } else if (response.results && Array.isArray(response.results)) {
        // Direct results array
        patientData = response.results;
        console.log('✅ Found data in response.results');
      } else if (Array.isArray(response)) {
        // Response is directly an array
        patientData = response;
        console.log('✅ Found data in response directly');
      }
      
      console.log('Extracted patient data:', patientData);
      
      setPatients(patientData);
    } catch (error) {
      console.error('Error searching patients:', error);
      toast({
        title: "Error",
        description: "Failed to search patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchPatients();
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
      if (onPatientSelect) {
        onPatientSelect(pendingPatient);
      }
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
        if (onPatientSelect) {
          onPatientSelect(pendingPatient);
        }
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

  const handlePatientClick = (patient: PatientProfile) => {
    if (onPatientSelect) {
      onPatientSelect(patient);
    }
  };

  const clearFilters = () => {
    setSearchParams({
      query: '',
      gender: '',
      blood_group: '',
      age_min: undefined,
      age_max: undefined,
      city: '',
      state: '',
      page: 1,
      page_size: 20
    });
  };

  const handleBookConsultation = (patient: PatientProfile) => {
    // Navigate to consultation creation page with patient data
            navigate('/dashboard/consultations/new', {
      state: {
        selectedPatient: {
          id: patient.id,
          user: patient.user,
          user_name: patient.user_name,
          user_phone: patient.user_phone,
          user_email: patient.user_email
        }
      }
    });
  };

  const getGenderColor = (gender: string) => {
    const colors: Record<string, string> = {
      male: 'bg-blue-100 text-blue-800',
      female: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[gender] || colors.other;
  };

  const getBloodGroupColor = (bloodGroup: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-50 text-red-700',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-50 text-blue-700',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-50 text-purple-700',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-green-50 text-green-700'
    };
    return colors[bloodGroup] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Patient Search
          </CardTitle>
          <CardDescription>
            Search and filter patients by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Basic Search */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by name, phone, or email..."
                  value={searchParams.query}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={searchParams.gender} 
                    onValueChange={(value) => setSearchParams(prev => ({ ...prev, gender: value }))}
                  >
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
                  <Label htmlFor="blood_group">Blood Group</Label>
                  <Select 
                    value={searchParams.blood_group} 
                    onValueChange={(value) => setSearchParams(prev => ({ ...prev, blood_group: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All blood groups" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All blood groups</SelectItem>
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
                </div>

                <div>
                  <Label htmlFor="age_min">Min Age</Label>
                  <Input
                    id="age_min"
                    type="number"
                    placeholder="Min age"
                    value={searchParams.age_min || ''}
                    onChange={(e) => setSearchParams(prev => ({ 
                      ...prev, 
                      age_min: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="age_max">Max Age</Label>
                  <Input
                    id="age_max"
                    type="number"
                    placeholder="Max age"
                    value={searchParams.age_max || ''}
                    onChange={(e) => setSearchParams(prev => ({ 
                      ...prev, 
                      age_max: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={searchParams.city}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={searchParams.state}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, state: e.target.value }))}
                  />
                </div>

                <div className="flex items-end gap-2">
                  <Button type="submit" className="flex-1">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button type="button" variant="outline" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {/* Search Button for Basic Search */}
            {!showFilters && (
              <div className="flex justify-end">
                <Button type="submit">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>
            {loading ? 'Searching...' : `${patients.length} patients found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : patients.length > 0 ? (
            <div className="grid gap-4">
              {patients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold truncate">{patient.user_name}</h3>
                            <Badge className={getGenderColor(patient.gender)}>
                              {patient.gender}
                            </Badge>
                            {patient.blood_group && (
                              <Badge className={getBloodGroupColor(patient.blood_group)}>
                                {patient.blood_group}
                              </Badge>
                            )}
                            <Badge variant={patient.is_active ? "default" : "secondary"}>
                              {patient.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span className="truncate">{patient.user_phone}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{patient.user_email || 'No email'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{patient.city}, {patient.state}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Age: {patient.age}</span>
                            <span>ID: {patient.user}</span>
                            {patient.chronic_conditions.length > 0 && (
                              <span>Conditions: {patient.chronic_conditions.length}</span>
                            )}
                            {patient.total_consultations !== undefined && (
                              <span>Consultations: {patient.total_consultations}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {showActions && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewPatientDetails(patient)}
                            title="View Details (Requires OTP)"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {showBookConsultation && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleBookConsultation(patient)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Book Consultation
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchParams.query || searchParams.gender || searchParams.blood_group || 
               searchParams.age_min || searchParams.age_max || searchParams.city || searchParams.state ? (
                <div>
                  <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p>No patients found matching your search criteria</p>
                  <Button variant="outline" onClick={clearFilters} className="mt-2">
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div>
                  <User className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p>Enter search criteria to find patients</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
