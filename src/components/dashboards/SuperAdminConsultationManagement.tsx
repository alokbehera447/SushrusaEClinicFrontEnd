import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileImage,
  Heart,
  Activity,
  Thermometer,
  Scale
} from 'lucide-react';
import { adminConsultationApi, superAdminApi, patientApi, prescriptionApi } from '@/lib/api';
import { formatDate, formatTime, formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';

interface Consultation {
  id: string;
  patient: string | {
    id: string;
    name: string;
    phone: string;
    email?: string;
    age?: number;
    gender?: string;
    patient_id?: string;
  };
  patient_id?: string;
  patientId?: string;
  patient_name?: string;
  patient_phone?: string;
  patient_email?: string;
  patient_age?: number;
  patient_gender?: string;
  doctor: {
    id: string;
    name: string;
    specialty: string;
    phone: string;
    email?: string;
  };
  doctor_name?: string;
  doctor_phone?: string;
  doctor_email?: string;
  doctor_specialty?: string;
  clinic: string | {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  clinic_id?: string;
  clinic_name?: string;
  clinic_phone?: string;
  clinic_email?: string;
  consultation_type: string;
  scheduled_date: string;
  scheduled_time: string;
  duration: number;
  status: string;
  payment_status: string;
  consultation_fee: number | string;
  chief_complaint: string;
  symptoms?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  meeting_link?: string;
  vital_signs?: {
    blood_pressure_systolic?: number;
    blood_pressure_diastolic?: number;
    heart_rate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    recorded_at: string;
  };
  attachments?: Array<{
    id: number;
    file: string;
    attachment_type: string;
    title: string;
  }>;
}

interface Clinic {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email?: string;
}

interface ConsultationFilters {
  search: string;
  status: string;
  payment_status: string;
  clinic_id: string;
  doctor_id: string;
  start_date: string;
  end_date: string;
}

const SuperAdminConsultationManagement: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  
  // Filter states
  const [filters, setFilters] = useState<ConsultationFilters>({
    search: '',
    status: '',
    payment_status: '',
    clinic_id: '',
    doctor_id: '',
    start_date: '',
    end_date: ''
  });
  
  // Data for dropdowns
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [clinicSearchQuery, setClinicSearchQuery] = useState('');
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
  
  // Filtered data for dropdowns
  const filteredClinics = useMemo(() => {
    if (!clinicSearchQuery) return clinics;
    const filtered = clinics.filter(clinic => 
      clinic.name.toLowerCase().includes(clinicSearchQuery.toLowerCase())
    );
    console.log('Filtering clinics:', clinicSearchQuery, 'Results:', filtered.length);
    return filtered;
  }, [clinics, clinicSearchQuery]);
  
  const filteredDoctors = useMemo(() => {
    if (!doctorSearchQuery) return doctors;
    const filtered = doctors.filter(doctor => 
      doctor.name.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(doctorSearchQuery.toLowerCase())
    );
    console.log('Filtering doctors:', doctorSearchQuery, 'Results:', filtered.length);
    return filtered;
  }, [doctors, doctorSearchQuery]);
  
  // Modal states
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Prescription states
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loadingPrescription, setLoadingPrescription] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPrescriptionUrl, setSelectedPrescriptionUrl] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadConsultations(1);
    loadClinics();
    loadDoctors();
  }, []);

  const loadConsultations = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page,
        page_size: pageSize,
        ordering: '-scheduled_date,-scheduled_time'
      };
      
      // Add filters to API call for server-side filtering
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.payment_status) params.payment_status = filters.payment_status;
      if (filters.clinic_id) params.clinic_id = filters.clinic_id;
      if (filters.doctor_id) params.doctor_id = filters.doctor_id;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      
      console.log('🔍 API call params:', params);
      
      const response = await adminConsultationApi.getAllConsultations(params);
      
      if (response && response.results) {
        console.log('Loaded consultations:', response.results.length, 'consultations');
        console.log('Sample consultation:', response.results[0]);
        setConsultations(response.results);
        setFilteredConsultations(response.results); // Set filtered consultations directly from API
        setTotalCount(response.count || 0);
        setTotalPages(response.total_pages || Math.ceil((response.count || 0) / pageSize));
        setCurrentPage(page);
      } else {
        setConsultations([]);
        setFilteredConsultations([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading consultations:', error);
      setError('Failed to load consultations');
      toast.error('Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  const loadClinics = async () => {
    try {
      setLoadingClinics(true);
      const response = await superAdminApi.getEClinics();
      const clinicsData = response?.results || [];
      console.log('🔍 Loaded clinics:', clinicsData);
      setClinics(clinicsData);
    } catch (error) {
      console.error('Error loading clinics:', error);
    } finally {
      setLoadingClinics(false);
    }
  };

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await superAdminApi.getDoctors();
      setDoctors(response?.results || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // No client-side filtering needed - backend handles all filtering

  const handleFilterChange = (key: keyof ConsultationFilters, value: string) => {
    // Convert "all" back to empty string for filtering logic
    const filterValue = value === 'all' ? '' : value;
    
    console.log(`🔍 Filter change: ${key} = "${value}" -> "${filterValue}"`);
    
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [key]: filterValue
      };
      console.log('🔍 New filters:', newFilters);
      return newFilters;
    });
    
    // Reset to first page and reload data when filters change
    setCurrentPage(1);
    loadConsultations(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      payment_status: '',
      clinic_id: '',
      doctor_id: '',
      start_date: '',
      end_date: ''
    });
    setClinicSearchQuery('');
    setDoctorSearchQuery('');
    setCurrentPage(1);
    loadConsultations(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadConsultations(page);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: Activity },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
      ready_for_consultation: { color: 'bg-purple-100 text-purple-800', icon: AlertCircle },
      overdue: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} text-xs px-2 py-1`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800' },
      paid: { color: 'bg-green-100 text-green-800' },
      failed: { color: 'bg-red-100 text-red-800' },
      refunded: { color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={`${config.color} text-xs px-2 py-1`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const handleViewDetails = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setShowDetailModal(true);
  };

  const handleViewPrescription = async (consultationId: string) => {
    try {
      setLoadingPrescription(true);
      
      // Find the consultation to get patient ID
      const consultation = consultations.find(c => c.id === consultationId);
      if (!consultation) {
        toast.error('Consultation not found');
        return;
      }
      
      // Debug: Log consultation data to see the structure
      console.log('Consultation data:', consultation);
      
      // Try to get patient ID from different possible fields
      let patientId = consultation.patient_id || 
                     consultation.patientId ||
                     (typeof consultation.patient === 'string' ? consultation.patient : consultation.patient?.id) ||
                     consultation.patient?.patient_id;
      
      console.log('Patient ID found:', patientId);
      
      if (!patientId) {
        toast.error('Patient ID not found in consultation data');
        return;
      }
      
      // Get all PDFs for this patient using the patient PDFs API
      const patientPDFsData = await prescriptionApi.getPatientPDFs(patientId);
      
      if (patientPDFsData && patientPDFsData.pdfs && patientPDFsData.pdfs.length > 0) {
        // Filter PDFs for this specific consultation
        const consultationPDFs = patientPDFsData.pdfs.filter((pdf: any) => 
          pdf.consultation_id === consultationId
        );
        
        if (consultationPDFs.length > 0) {
          // Transform PDF data to match the expected format
          const transformedVersions = consultationPDFs.map((pdf: any, index: number) => ({
            id: pdf.id,
            version: pdf.version,
            pdf_file: pdf.file_url,
            is_finalized: true,
            is_current: true, // All PDFs from patient API are current
            generated_at: pdf.generated_at,
            file_size: pdf.file_size,
            prescription_id: pdf.prescription_id,
            consultation_id: pdf.consultation_id,
            diagnosis: pdf.diagnosis || ''
          }));
          
          setPrescriptions(transformedVersions);
          setShowPrescriptionModal(true);
        } else {
          toast.error('No PDFs found for this consultation');
        }
      } else {
        toast.error('No PDFs found for this patient');
      }
    } catch (error) {
      console.error('Error loading patient PDFs:', error);
      toast.error('Failed to load patient PDFs');
    } finally {
      setLoadingPrescription(false);
    }
  };

  const handleViewSpecificPrescription = (pdfUrl: string) => {
    setSelectedPrescriptionUrl(pdfUrl);
  };

  const exportToCSV = () => {
    const headers = [
      'ID', 'Patient Name', 'Patient Phone', 'Doctor Name', 'Clinic Name',
      'Date', 'Time', 'Status', 'Payment Status', 'Fee', 'Chief Complaint'
    ];
    
    const csvData = filteredConsultations.map(consultation => [
      consultation.id,
      consultation.patient_name || consultation.patient?.name || '',
      consultation.patient_phone || consultation.patient?.phone || '',
      consultation.doctor_name || consultation.doctor?.name || '',
      consultation.clinic_name || consultation.clinic?.name || '',
      formatDate(consultation.scheduled_date),
      formatTime(consultation.scheduled_time),
      consultation.status,
      consultation.payment_status,
      consultation.consultation_fee,
      consultation.chief_complaint
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && consultations.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultation Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage all consultations across the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </Button>
          <Button
            onClick={() => loadConsultations(currentPage)}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filters</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs"
            >
              <Filter className="w-4 h-4 mr-1" />
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search" className="text-xs">Search</Label>
                <Input
                  id="search"
                  placeholder="Patient, Doctor, Clinic, ID..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              
              <div>
                <Label htmlFor="status" className="text-xs">Status</Label>
                <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="ready_for_consultation">Ready for Consultation</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="payment_status" className="text-xs">Payment Status</Label>
                <Select value={filters.payment_status || 'all'} onValueChange={(value) => handleFilterChange('payment_status', value)}>
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder="All Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="clinic_id" className="text-xs">Clinic</Label>
                <Select value={filters.clinic_id || 'all'} onValueChange={(value) => handleFilterChange('clinic_id', value)}>
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder="All Clinics" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <div className="relative">
                        <Input
                          placeholder="Search clinics..."
                          value={clinicSearchQuery}
                          onChange={(e) => setClinicSearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          className="text-xs h-7 mb-2 pr-8"
                        />
                        {clinicSearchQuery && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setClinicSearchQuery('');
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <SelectItem value="all">All Clinics</SelectItem>
                    {filteredClinics.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </SelectItem>
                    ))}
                    {filteredClinics.length === 0 && clinicSearchQuery && (
                      <div className="px-2 py-1 text-xs text-gray-500">No clinics found</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="doctor_id" className="text-xs">Doctor</Label>
                <Select value={filters.doctor_id || 'all'} onValueChange={(value) => handleFilterChange('doctor_id', value)}>
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder="All Doctors" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <div className="relative">
                        <Input
                          placeholder="Search doctors..."
                          value={doctorSearchQuery}
                          onChange={(e) => setDoctorSearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          className="text-xs h-7 mb-2 pr-8"
                        />
                        {doctorSearchQuery && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDoctorSearchQuery('');
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {filteredDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                    {filteredDoctors.length === 0 && doctorSearchQuery && (
                      <div className="px-2 py-1 text-xs text-gray-500">No doctors found</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="start_date" className="text-xs">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              
              <div>
                <Label htmlFor="end_date" className="text-xs">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Consultations</p>
                <p className="text-lg font-semibold">{totalCount}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Completed</p>
                <p className="text-lg font-semibold text-green-600">
                  {filteredConsultations.filter(c => c.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Scheduled</p>
                <p className="text-lg font-semibold text-blue-600">
                  {filteredConsultations.filter(c => c.status === 'scheduled').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Revenue</p>
                <p className="text-lg font-semibold text-green-600">
                  ₹{filteredConsultations
                    .filter(c => c.payment_status === 'paid')
                    .reduce((sum, c) => sum + (typeof c.consultation_fee === 'number' ? c.consultation_fee : parseFloat(c.consultation_fee) || 0), 0)
                  }
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consultations List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Consultations ({filteredConsultations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredConsultations.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No consultations found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredConsultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm truncate">
                          {consultation.patient_name || consultation.patient?.name || 'N/A'}
                        </h3>
                        <span className="text-xs text-gray-500 font-mono">
                          {consultation.id}
                        </span>
                        {getStatusBadge(consultation.status)}
                        {getPaymentStatusBadge(consultation.payment_status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="truncate">
                            Dr. {consultation.doctor_name || consultation.doctor?.name || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate">
                            {consultation.clinic_name || consultation.clinic?.name || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {formatDate(consultation.scheduled_date)} at {formatTime(consultation.scheduled_time)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">
                          <strong>Chief Complaint:</strong> {consultation.chief_complaint || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-600">
                          <strong>Fee:</strong> ₹{consultation.consultation_fee || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleViewDetails(consultation)}
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                      <Button
                        onClick={() => handleViewPrescription(consultation.id)}
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        disabled={loadingPrescription}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Prescription
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-xs text-gray-600">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Previous
                </Button>
                <span className="text-xs text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consultation Details Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Consultation Details</DialogTitle>
          </DialogHeader>
          
          {selectedConsultation && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Name:</span>
                      <span>{selectedConsultation.patient_name || selectedConsultation.patient?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Phone:</span>
                      <span>{selectedConsultation.patient_phone || selectedConsultation.patient?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Email:</span>
                      <span>{selectedConsultation.patient_email || selectedConsultation.patient?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Age:</span>
                      <span>{selectedConsultation.patient_age || selectedConsultation.patient?.age || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Gender:</span>
                      <span>{selectedConsultation.patient_gender || selectedConsultation.patient?.gender || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Doctor Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Name:</span>
                      <span>Dr. {selectedConsultation.doctor_name || selectedConsultation.doctor?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Specialty:</span>
                      <span>{selectedConsultation.doctor_specialty || selectedConsultation.doctor?.specialty || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Phone:</span>
                      <span>{selectedConsultation.doctor_phone || selectedConsultation.doctor?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Email:</span>
                      <span>{selectedConsultation.doctor_email || selectedConsultation.doctor?.email || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Consultation Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Consultation Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">ID:</span>
                      <span className="font-mono">{selectedConsultation.id}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Status:</span>
                      {getStatusBadge(selectedConsultation.status)}
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Payment Status:</span>
                      {getPaymentStatusBadge(selectedConsultation.payment_status)}
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Fee:</span>
                      <span>₹{selectedConsultation.consultation_fee || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Date:</span>
                      <span>{formatDate(selectedConsultation.scheduled_date)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Time:</span>
                      <span>{formatTime(selectedConsultation.scheduled_time)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Duration:</span>
                      <span>{selectedConsultation.duration} minutes</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Type:</span>
                      <span className="capitalize">{selectedConsultation.consultation_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Chief Complaint */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Chief Complaint</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-700">
                    {selectedConsultation.chief_complaint || 'No chief complaint recorded'}
                  </p>
                </CardContent>
              </Card>
              
              {/* Symptoms */}
              {selectedConsultation.symptoms && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Symptoms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-700">
                      {selectedConsultation.symptoms}
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {/* Vital Signs */}
              {selectedConsultation.vital_signs && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Vital Signs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedConsultation.vital_signs.blood_pressure_systolic && (
                        <div className="text-center">
                          <Activity className="w-6 h-6 text-red-500 mx-auto mb-1" />
                          <p className="text-xs font-medium">Blood Pressure</p>
                          <p className="text-xs text-gray-600">
                            {selectedConsultation.vital_signs.blood_pressure_systolic}/{selectedConsultation.vital_signs.blood_pressure_diastolic} mmHg
                          </p>
                        </div>
                      )}
                      {selectedConsultation.vital_signs.heart_rate && (
                        <div className="text-center">
                          <Heart className="w-6 h-6 text-red-500 mx-auto mb-1" />
                          <p className="text-xs font-medium">Heart Rate</p>
                          <p className="text-xs text-gray-600">
                            {selectedConsultation.vital_signs.heart_rate} bpm
                          </p>
                        </div>
                      )}
                      {selectedConsultation.vital_signs.temperature && (
                        <div className="text-center">
                          <Thermometer className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                          <p className="text-xs font-medium">Temperature</p>
                          <p className="text-xs text-gray-600">
                            {selectedConsultation.vital_signs.temperature}°F
                          </p>
                        </div>
                      )}
                      {selectedConsultation.vital_signs.weight && (
                        <div className="text-center">
                          <Scale className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                          <p className="text-xs font-medium">Weight</p>
                          <p className="text-xs text-gray-600">
                            {selectedConsultation.vital_signs.weight} kg
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Diagnosis */}
              {selectedConsultation.diagnosis && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Diagnosis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-700">
                      {selectedConsultation.diagnosis}
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {/* Notes */}
              {selectedConsultation.notes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-700">
                      {selectedConsultation.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Prescriptions Modal */}
      <Dialog open={showPrescriptionModal} onOpenChange={setShowPrescriptionModal}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-lg">Prescription PDF Versions</DialogTitle>
            </DialogHeader>
          
          {loadingPrescription ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E17726]"></div>
              <span className="ml-2 text-sm">Loading PDF versions...</span>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No PDF versions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Prescriptions List */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">PDF Versions ({prescriptions.length})</h3>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {prescriptions.map((prescription, index) => (
                      <div
                        key={prescription.id || index}
                        className="border rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer"
                        onClick={() => handleViewSpecificPrescription(prescription.pdf_file)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className={`w-4 h-4 ${prescription.is_finalized ? 'text-blue-600' : 'text-yellow-600'}`} />
                              <span className="font-medium text-sm">
                                Version {prescriptions.length - index}
                              </span>
                              {prescription.version && (
                                <Badge variant="outline" className="text-xs">
                                  v{prescription.version}
                                </Badge>
                              )}
                              {!prescription.is_finalized && (
                                <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                                  Draft
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div className="flex justify-between">
                                <span>Generated:</span>
                                <span>
                                  {prescription.generated_at ? 
                                    formatDateTime(prescription.generated_at) : 'N/A'
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Version:</span>
                                <span className="font-mono">v{prescription.version}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>File Size:</span>
                                <span>
                                  {prescription.file_size ? 
                                    `${(prescription.file_size / 1024).toFixed(1)} KB` : 'N/A'
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Status:</span>
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Finalized
                                </Badge>
                              </div>
                              {prescription.is_current && (
                                <div className="flex justify-between">
                                  <span>Current:</span>
                                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                                    Latest Version
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewSpecificPrescription(prescription.pdf_file);
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View PDF
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* PDF Viewer */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">PDF Preview</h3>
                  <div className="border rounded-lg h-96">
                    {selectedPrescriptionUrl ? (
                      <iframe
                        src={selectedPrescriptionUrl}
                        className="w-full h-full border rounded"
                        title="Prescription PDF"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Select a PDF version to view</p>
                          <p className="text-gray-400 text-xs mt-1">All versions shown are finalized PDFs</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* PDF Version Details */}
              {selectedPrescriptionUrl && prescriptions.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-sm mb-3">PDF Version Details</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {prescriptions
                      .filter(p => p.pdf_file === selectedPrescriptionUrl)
                      .map((prescription, index) => (
                        <Card key={prescription.id || index}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm">Version {prescription.version} Details</CardTitle>
                              {prescription.is_current && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div className="flex justify-between">
                                <span className="font-medium">Version:</span>
                                <span className="font-mono">{prescription.version}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Generated:</span>
                                <span>
                                  {prescription.generated_at ? 
                                    formatDateTime(prescription.generated_at) : 'N/A'
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">File Size:</span>
                                <span>
                                  {prescription.file_size ? 
                                    `${(prescription.file_size / 1024).toFixed(1)} KB` : 'N/A'
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Status:</span>
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Finalized
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Individual PDF Modal */}
      <Dialog open={!!selectedPrescriptionUrl} onOpenChange={() => setSelectedPrescriptionUrl(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-lg">Prescription PDF</DialogTitle>
          </DialogHeader>
          <div className="w-full h-[70vh]">
            <iframe
              src={selectedPrescriptionUrl || ''}
              className="w-full h-full border rounded"
              title="Prescription PDF"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminConsultationManagement;

