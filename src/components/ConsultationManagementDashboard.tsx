import React, { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCircle, 
  Play, 
  Filter,
  RefreshCw,
  Search,
  Eye,
  Users,
  Activity,
  AlertCircle,
  CheckSquare,
  Square,
  ArrowRight,
  CalendarDays,
  DollarSign,
  X,
  Receipt,
  Download,
  FileText,
  Printer
} from 'lucide-react';
import { 
  consultationService, 
  type Consultation, 
  type ConsultationManagementParams,
  type ClinicStatistics,
  getStatusColor, 
  getStatusText, 
  formatDateTime, 
  formatTime 
} from '@/services/consultationService';
import { api } from '@/lib/utils';

interface ConsultationManagementDashboardProps {
  onConsultationSelect?: (consultation: Consultation) => void;
  userRole?: string; // Add user role prop
  assignedClinicId?: string; // Add assigned clinic ID prop
}

interface ReceiptData {
  receipt_number: string;
  patient_name: string;
  doctor_name: string;
  clinic_name: string;
  consultation_date: string;
  consultation_time: string;
  payment_method: string;
  payment_status: string;
  formatted_amount: string;
  issued_by_name: string;
  issued_at: string;
  receipt_data: {
    consultation_date: string;
    consultation_time: string;
  };
}

export const ConsultationManagementDashboard: React.FC<ConsultationManagementDashboardProps> = ({
  onConsultationSelect,
  userRole = 'admin', // Default to admin
  assignedClinicId // Add assigned clinic ID
}) => {
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ConsultationManagementParams>({
    status: 'all',
    search: '',
    ordering: '-scheduled_date',
    page: 1,
    page_size: 20
  });
  const [stats, setStats] = useState<ClinicStatistics>({
    clinic_id: '',
    clinic_name: '',
    total: 0,
    scheduled: 0,
    checked_in: 0,
    ready: 0,
    in_progress: 0,
    completed: 0,
    timestamp: ''
  });

  // Popup state
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [loadingPrescription, setLoadingPrescription] = useState(false);

  // Load consultation details popup
  const handleViewDetails = async (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setIsPopupOpen(true);
    await loadReceipt(consultation.id);
    await loadPrescription(consultation.id);
  };

  const loadReceipt = async (consultationId: string) => {
    try {
      setLoadingReceipt(true);
      const response = await api.get(`/api/consultations/${consultationId}/receipt/`);
      if (response.data.success) {
        setReceipt(response.data.data);
      }
    } catch (error) {
      console.error('Error loading receipt:', error);
      setReceipt(null);
    } finally {
      setLoadingReceipt(false);
    }
  };

  const loadPrescription = async (consultationId: string) => {
    try {
      setLoadingPrescription(true);
      const response = await api.get(`/api/prescriptions/consultation/${consultationId}/`);
      if (response.data.success && response.data.data.length > 0) {
        const latestPrescription = response.data.data[0];
        if (latestPrescription.pdf_url) {
          setPrescriptionUrl(latestPrescription.pdf_url);
        }
      }
    } catch (error) {
      console.error('Error loading prescription:', error);
      setPrescriptionUrl(null);
    } finally {
      setLoadingPrescription(false);
    }
  };

  const handlePrintReceipt = () => {
    if (receipt) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt - ${receipt.receipt_number}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                .details { margin: 20px 0; }
                .row { display: flex; justify-content: space-between; margin: 10px 0; }
                .amount { font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Sushrusa E-Clinic</h1>
                <h2>Consultation Receipt</h2>
                <p>Receipt #: ${receipt.receipt_number}</p>
              </div>
              <div class="details">
                <div class="row"><strong>Patient:</strong> ${receipt.patient_name}</div>
                <div class="row"><strong>Doctor:</strong> ${receipt.doctor_name}</div>
                <div class="row"><strong>Clinic:</strong> ${receipt.clinic_name}</div>
                <div class="row"><strong>Date:</strong> ${new Date(receipt.consultation_date).toLocaleDateString()}</div>
                <div class="row"><strong>Time:</strong> ${receipt.consultation_time}</div>
                <div class="row"><strong>Payment Method:</strong> ${receipt.payment_method}</div>
                <div class="row"><strong>Status:</strong> ${receipt.payment_status}</div>
              </div>
              <div class="amount">Total Amount: ${receipt.formatted_amount}</div>
              <div class="footer">
                <p>Issued by: ${receipt.issued_by_name}</p>
                <p>Date: ${new Date(receipt.issued_at).toLocaleString()}</p>
                <p>Thank you for choosing Sushrusa E-Clinic!</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  // Load consultations
  const loadConsultations = async () => {
    try {
      setLoading(true);
      const response = await consultationService.getConsultationsForManagement(filters);
      
      if (response.success) {
        console.log('Processed response data:', response.data);
        
        // Ensure data is an array
        const consultationsData = Array.isArray(response.data) ? response.data : [];
        setConsultations(consultationsData);
        
        // Load clinic statistics from API
        try {
          const statsResponse = await consultationService.getClinicStatistics(assignedClinicId);
          if (statsResponse.success) {
            setStats(statsResponse.data);
          }
        } catch (error) {
          console.error('Error loading clinic statistics:', error);
          // Fallback to calculated stats
          const statsData = {
            clinic_id: '',
            clinic_name: '',
            total: consultationsData.length,
            scheduled: consultationsData.filter(c => c.status === 'scheduled').length,
            checked_in: consultationsData.filter(c => c.status === 'patient_checked_in').length,
            ready: consultationsData.filter(c => c.status === 'ready_for_consultation').length,
            in_progress: consultationsData.filter(c => c.status === 'in_progress').length,
            completed: consultationsData.filter(c => c.status === 'completed').length,
            timestamp: new Date().toISOString()
          };
          setStats(statsData);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load consultations",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading consultations:', error);
      toast({
        title: "Error",
        description: "Failed to load consultations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check in patient
  const handleCheckIn = async (consultation: Consultation) => {
    try {
      const response = await consultationService.checkInPatient(consultation.id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        loadConsultations(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to check in patient",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking in patient:', error);
      toast({
        title: "Error",
        description: "Failed to check in patient",
        variant: "destructive",
      });
    }
  };

  // Mark patient as ready
  const handleMarkReady = async (consultation: Consultation) => {
    try {
      const response = await consultationService.markPatientReady(consultation.id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        loadConsultations(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to mark patient as ready",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error marking patient ready:', error);
      toast({
        title: "Error",
        description: "Failed to mark patient as ready",
        variant: "destructive",
      });
    }
  };

  // Start consultation
  const handleStartConsultation = async (consultation: Consultation) => {
    try {
      const response = await consultationService.startConsultation(consultation.id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        loadConsultations(); // Refresh the list
        
        // Navigate to consultation workspace
        if (onConsultationSelect) {
          onConsultationSelect(consultation);
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to start consultation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error starting consultation:', error);
      toast({
        title: "Error",
        description: "Failed to start consultation",
        variant: "destructive",
      });
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof ConsultationManagementParams, value: string | number) => {
    // Handle "all" status as empty string for API
    const apiValue = key === 'status' && value === 'all' ? '' : value;
    setFilters(prev => ({
      ...prev,
      [key]: apiValue,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Load consultations when filters change
  useEffect(() => {
    loadConsultations();
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Consultation Management</h2>
          <p className="text-gray-600">Manage patient check-ins and consultation flow</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadConsultations} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {(userRole === 'admin' || userRole === 'superadmin') && (
            <Button 
              onClick={async () => {
                try {
                  const response = await consultationService.getOverdueConsultations();
                  if (response.success) {
                    toast({ title: 'Overdue Consultations', description: `Found ${response.data.length} overdue consultations` });
                    // You can add logic here to display the overdue consultations
                  }
                } catch (error) {
                  toast({ title: 'Error', description: 'Failed to load overdue consultations', variant: 'destructive' });
                }
              }} 
              variant="outline" 
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Overdue
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Checked In</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.checked_in}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ready</p>
                <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-purple-600">{stats.in_progress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-blue-600" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                                          <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="patient_checked_in">Checked In</SelectItem>
                  <SelectItem value="ready_for_consultation">Ready</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="search" className="text-sm font-medium">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Patient, doctor, complaint..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="ordering" className="text-sm font-medium">Sort By</Label>
              <Select 
                value={filters.ordering} 
                onValueChange={(value) => handleFilterChange('ordering', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-scheduled_date">Date (Newest)</SelectItem>
                  <SelectItem value="scheduled_date">Date (Oldest)</SelectItem>
                  <SelectItem value="patient_name">Patient Name</SelectItem>
                  <SelectItem value="doctor_name">Doctor Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="page-size" className="text-sm font-medium">Items per page</Label>
              <Select 
                value={filters.page_size?.toString()} 
                onValueChange={(value) => handleFilterChange('page_size', parseInt(value))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="20" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultations List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            Consultations
          </CardTitle>
          <CardDescription>
            Manage patient check-ins and consultation flow
            {userRole === 'admin' && (
              <span className="block text-xs text-gray-500 mt-1">
                Note: Admins can check-in and mark patients ready. Only doctors can start consultations.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mr-3 text-blue-600" />
              <span className="text-lg text-gray-600">Loading consultations...</span>
            </div>
          ) : consultations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations found</h3>
              <p className="text-gray-500">Try adjusting your filters or search criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {consultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-gray-500" />
                          <h3 className="font-semibold text-lg text-gray-900">{consultation.patient_name}</h3>
                        </div>
                        <Badge className={getStatusColor(consultation.status)}>
                          {getStatusText(consultation.status)}
                        </Badge>
                        <span className="text-sm text-gray-500 font-mono">#{consultation.id}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4" />
                          <span>Dr. {consultation.doctor_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDateTime(consultation.scheduled_date, consultation.scheduled_time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{consultation.duration} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>${consultation.consultation_fee}</span>
                        </div>
                      </div>
                      
                      {consultation.chief_complaint && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700">
                            <strong>Chief Complaint:</strong> {consultation.chief_complaint}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-6">
                      {/* Check-in Button */}
                      {consultation.status === 'scheduled' && (
                        <Button
                          onClick={() => handleCheckIn(consultation)}
                          variant="outline"
                          size="sm"
                          className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Check In
                        </Button>
                      )}
                      
                      {/* Mark Ready Button */}
                      {consultation.status === 'patient_checked_in' && (
                        <Button
                          onClick={() => handleMarkReady(consultation)}
                          variant="outline"
                          size="sm"
                          className="border-green-500 text-green-700 hover:bg-green-50"
                        >
                          <Activity className="h-4 w-4 mr-1" />
                          Mark Ready
                        </Button>
                      )}
                      
                      {/* Start Consultation Button - Only for Doctors */}
                      {consultation.status === 'ready_for_consultation' && userRole === 'doctor' && (
                        <Button
                          onClick={() => handleStartConsultation(consultation)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start Consultation
                        </Button>
                      )}
                      
                      {/* View Details Button */}
                      <Button
                        onClick={() => handleViewDetails(consultation)}
                        variant="outline"
                        size="sm"
                        className="border-blue-500 text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                  
                  {/* Check-in Information */}
                  {(consultation.checked_in_at || consultation.ready_for_consultation_at) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {consultation.checked_in_at && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Checked in: {new Date(consultation.checked_in_at).toLocaleString()}</span>
                          </div>
                        )}
                        {consultation.ready_for_consultation_at && (
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            <span>Ready: {new Date(consultation.ready_for_consultation_at).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consultation Details Popup */}
      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">
                Consultation Details
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsPopupOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          {selectedConsultation && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Basic Details</TabsTrigger>
                <TabsTrigger value="receipt">Receipt</TabsTrigger>
                <TabsTrigger value="prescription">Prescription</TabsTrigger>
              </TabsList>

              {/* Basic Details Tab */}
              <TabsContent value="details" className="space-y-6">
                {/* Consultation ID and Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold">#{selectedConsultation.id}</h3>
                    <Badge className={getStatusColor(selectedConsultation.status)}>
                      {getStatusText(selectedConsultation.status)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Created: {new Date(selectedConsultation.created_at).toLocaleDateString()}
                  </div>
                </div>

                <Separator />

                {/* Patient Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Patient Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Patient Name</label>
                        <p className="text-lg font-semibold">{selectedConsultation.patient_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Patient ID</label>
                        <p className="text-lg font-mono">{selectedConsultation.patient}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Doctor Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-green-600" />
                      Doctor Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Doctor Name</label>
                        <p className="text-lg font-semibold">Dr. {selectedConsultation.doctor_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Doctor ID</label>
                        <p className="text-lg font-mono">{selectedConsultation.doctor}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Consultation Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      Consultation Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Scheduled Date</label>
                        <p className="text-lg">{new Date(selectedConsultation.scheduled_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Scheduled Time</label>
                        <p className="text-lg">{formatTime(selectedConsultation.scheduled_time)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Duration</label>
                        <p className="text-lg">{selectedConsultation.duration} minutes</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Consultation Type</label>
                        <p className="text-lg capitalize">{selectedConsultation.consultation_type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Consultation Fee</label>
                        <p className="text-lg font-semibold text-green-600">${selectedConsultation.consultation_fee}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Payment Status</label>
                        <Badge variant={selectedConsultation.payment_status === 'paid' ? 'default' : 'secondary'}>
                          {selectedConsultation.payment_status}
                        </Badge>
                      </div>
                    </div>

                    {selectedConsultation.chief_complaint && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Chief Complaint</label>
                        <p className="text-lg bg-gray-50 p-3 rounded-lg">{selectedConsultation.chief_complaint}</p>
                      </div>
                    )}

                    {selectedConsultation.symptoms && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Symptoms</label>
                        <p className="text-lg bg-gray-50 p-3 rounded-lg">{selectedConsultation.symptoms}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Check-in Information */}
                {(selectedConsultation.checked_in_at || selectedConsultation.ready_for_consultation_at) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-orange-600" />
                        Check-in Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedConsultation.checked_in_at && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-600">Checked in:</span>
                          <span>{new Date(selectedConsultation.checked_in_at).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedConsultation.ready_for_consultation_at && (
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-600">Marked ready:</span>
                          <span>{new Date(selectedConsultation.ready_for_consultation_at).toLocaleString()}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Receipt Tab */}
              <TabsContent value="receipt" className="space-y-6">
                {loadingReceipt ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-lg">Loading receipt...</span>
                  </div>
                ) : receipt ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-green-600" />
                        Payment Receipt
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Receipt Header */}
                      <div className="text-center border-b pb-4">
                        <h3 className="text-xl font-semibold text-gray-900">Sushrusa E-Clinic</h3>
                        <p className="text-sm text-gray-600">Consultation Receipt</p>
                        <p className="text-xs text-gray-500 mt-1">Receipt #: {receipt.receipt_number}</p>
                      </div>
                      
                      {/* Receipt Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Patient:</span>
                            <span className="text-sm font-medium">{receipt.patient_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Doctor:</span>
                            <span className="text-sm font-medium">{receipt.doctor_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Clinic:</span>
                            <span className="text-sm font-medium">{receipt.clinic_name}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Date:</span>
                            <span className="text-sm font-medium">{new Date(receipt.consultation_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Time:</span>
                            <span className="text-sm font-medium">{receipt.consultation_time}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Payment Method:</span>
                            <span className="text-sm font-medium capitalize">{receipt.payment_method}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Payment Status */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Status:</span>
                        <Badge className={receipt.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {receipt.payment_status === 'paid' ? 'Paid' : 'Pending'}
                        </Badge>
                      </div>
                      
                      {/* Amount */}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Total Amount:</span>
                          <span className="text-2xl font-bold text-green-600">{receipt.formatted_amount}</span>
                        </div>
                      </div>
                      
                      {/* Footer */}
                      <div className="text-center text-xs text-gray-500 border-t pt-4">
                        <p>Issued by: {receipt.issued_by_name}</p>
                        <p>Date: {new Date(receipt.issued_at).toLocaleString()}</p>
                        <p className="mt-2">Thank you for choosing Sushrusa E-Clinic!</p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 justify-center">
                        <Button onClick={handlePrintReceipt} variant="outline">
                          <Printer className="h-4 w-4 mr-2" />
                          Print Receipt
                        </Button>
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-12">
                    <Receipt className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No receipt available</h3>
                    <p className="text-gray-500">Receipt data not found for this consultation</p>
                  </div>
                )}
              </TabsContent>

              {/* Prescription Tab */}
              <TabsContent value="prescription" className="space-y-6">
                {loadingPrescription ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-lg">Loading prescription...</span>
                  </div>
                ) : prescriptionUrl ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-red-600" />
                        Prescription PDF
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Button onClick={() => window.open(prescriptionUrl, '_blank')} variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View Prescription
                        </Button>
                        <Button onClick={() => window.open(prescriptionUrl, '_blank')} variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <p className="text-sm text-gray-600">
                          <strong>Note:</strong> Click "View Prescription" to open the prescription PDF in a new tab, 
                          or "Download PDF" to download the prescription file.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No prescription available</h3>
                    <p className="text-gray-500">Prescription has not been generated for this consultation yet</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
