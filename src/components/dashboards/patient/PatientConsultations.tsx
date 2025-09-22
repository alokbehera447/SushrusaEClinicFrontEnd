import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock, 
  Search,
  Filter,
  Video,
  Stethoscope,
  Phone,
  Users,
  CalendarDays,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Pill,
  Eye,
  Download,
  ExternalLink,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock as ClockIcon,
  User,
  DollarSign,
  Calendar as CalendarIcon,
  FileDown,
  BookOpen,
  MessageSquare,
  Zap,
  CalendarRange
} from 'lucide-react';
import { Consultation, Prescription, formatDate, formatDateTime, patientApi, prescriptionApi } from '@/lib/api';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface PatientConsultationsProps {
  consultations: Consultation[];
  loading: boolean;
  searchTerm: string;
  filter: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onBookConsultation: () => void;
  onJoinConsultation: (consultationId: string) => void;
  // Date filter props
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  // Pagination props
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

interface ConsultationWithPrescriptions extends Consultation {
  prescriptions?: Prescription[];
}

const PatientConsultations: React.FC<PatientConsultationsProps> = ({
  consultations,
  loading,
  searchTerm,
  filter,
  onSearchChange,
  onFilterChange,
  onBookConsultation,
  onJoinConsultation,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange
}) => {
  const [consultationsWithPrescriptions, setConsultationsWithPrescriptions] = useState<ConsultationWithPrescriptions[]>([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState<Record<string, boolean>>({});
  const [expandedConsultations, setExpandedConsultations] = useState<Set<string>>(new Set());
  const [latestPdfVersions, setLatestPdfVersions] = useState<Record<string, {
    prescriptionId: string;
    version: number;
    downloadUrl: string;
    generatedBy: string;
    generatedAt: string;
  }>>({});
  const [loadingPdfVersions, setLoadingPdfVersions] = useState<Record<string, boolean>>({});

  // Debug logging
  console.log('PatientConsultations received:', {
    consultations,
    loading,
    consultationsLength: consultations?.length,
    consultationsType: typeof consultations,
    isArray: Array.isArray(consultations),
    currentPage,
    totalPages,
    totalCount,
    startDate,
    endDate,
    filter,
    searchTerm
  });
  
  // Log first few consultations to verify data
  if (consultations && consultations.length > 0) {
    console.log('First 3 consultations data:', consultations.slice(0, 3).map(c => ({
      id: c.id,
      scheduled_date: c.scheduled_date,
      doctor_name: c.doctor_name,
      status: c.status
    })));
  }

  // Fetch latest PDF version for a consultation
  const fetchLatestPdfVersion = useCallback(async (consultationId: string) => {
    // Check if PDF version is already loaded
    if (latestPdfVersions[consultationId]) {
      return; // Already loaded
    }

    try {
      setLoadingPdfVersions(prev => ({ ...prev, [consultationId]: true }));
      
      // First get prescriptions for this consultation
      const prescriptions = await patientApi.getConsultationPrescriptions(consultationId);
      
      if (prescriptions && prescriptions.length > 0) {
        // Find the first finalized prescription
        const finalizedPrescription = prescriptions.find(p => p.status !== 'draft');
        
        if (finalizedPrescription) {
          try {
            // Get PDF versions for this prescription
            const pdfVersions = await prescriptionApi.getPrescriptionPdfVersions(finalizedPrescription.id);
            
            if (pdfVersions && pdfVersions.length > 0) {
              // Get the latest version (first in array)
              const latestVersion = pdfVersions[0];
              setLatestPdfVersions(prev => ({
                ...prev,
                [consultationId]: {
                  prescriptionId: finalizedPrescription.id,
                  version: latestVersion.version,
                  downloadUrl: latestVersion.file_url,
                  generatedBy: latestVersion.generated_by?.name || 'Doctor',
                  generatedAt: latestVersion.generated_at
                }
              }));
            }
          } catch (pdfError) {
            console.error(`Error fetching PDF versions for prescription ${finalizedPrescription.id}:`, pdfError);
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching latest PDF version for consultation ${consultationId}:`, error);
    } finally {
      setLoadingPdfVersions(prev => ({ ...prev, [consultationId]: false }));
    }
  }, [latestPdfVersions]);

  // Initialize consultations with prescriptions (lazy loading)
  useEffect(() => {
    // Only set consultations without fetching prescriptions upfront
    // Prescriptions will be fetched when consultation is expanded
    const consultationsWithPrescriptionsData = consultations.map(consultation => ({
      ...consultation,
      prescriptions: [] // Initialize empty, will be loaded on demand
    }));
    setConsultationsWithPrescriptions(consultationsWithPrescriptionsData);
    
    // Fetch latest PDF versions for all consultations
    consultations.forEach(consultation => {
      fetchLatestPdfVersion(consultation.id);
    });
  }, [consultations, fetchLatestPdfVersion]);

  // Fetch prescriptions for a specific consultation when expanded
  const fetchPrescriptionsForConsultation = async (consultationId: string) => {
    // Check if prescriptions are already loaded
    const existingConsultation = consultationsWithPrescriptions.find(c => c.id === consultationId);
    if (existingConsultation && existingConsultation.prescriptions.length > 0) {
      return; // Already loaded
    }

    try {
      setLoadingPrescriptions(prev => ({ ...prev, [consultationId]: true }));
      const prescriptions = await patientApi.getConsultationPrescriptions(consultationId);
      
      // Update the specific consultation with prescriptions
      setConsultationsWithPrescriptions(prev => 
        prev.map(consultation => 
          consultation.id === consultationId 
            ? { ...consultation, prescriptions: prescriptions || [] }
            : consultation
        )
      );
    } catch (error) {
      console.error(`Error fetching prescriptions for consultation ${consultationId}:`, error);
    } finally {
      setLoadingPrescriptions(prev => ({ ...prev, [consultationId]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'active': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'scheduled': return <ClockIcon className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case 'video':
      case 'video_call': return <Video className="w-4 h-4" />;
      case 'audio':
      case 'audio_call': return <Phone className="w-4 h-4" />;
      case 'in_person':
      case 'in_person_consultation': return <Users className="w-4 h-4" />;
      default: return <Stethoscope className="w-4 h-4" />;
    }
  };

  const getConsultationTypeLabel = (type: string) => {
    switch (type) {
      case 'video_call': return 'Video Call';
      case 'audio_call': return 'Audio Call';
      case 'in_person': return 'In-Person';
      default: return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const handleViewPrescription = async (prescription: Prescription) => {
    try {
      // Use the downloadPrescriptionPDF method which returns { download_url: string; filename: string }
      const response = await patientApi.downloadPrescriptionPDF(prescription.id, 'latest');
      
      if (response && response.download_url) {
        // Open the PDF in a new tab
        window.open(response.download_url, '_blank');
      } else {
        console.error('No download URL received from API');
        alert('Unable to open PDF. Please try downloading instead.');
      }
    } catch (error: unknown) {
      console.error('Error downloading prescription PDF:', error);
      
      // Handle different types of errors with specific messages
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number } };
        if (apiError.response?.status === 404) {
          alert('Prescription PDF not found. The prescription may not be finalized yet or the PDF has not been generated.');
        } else if (apiError.response?.status === 403) {
          alert('Access denied. You do not have permission to view this prescription.');
        } else if (apiError.response?.status && apiError.response.status >= 500) {
          alert('Server error. Please try again later or contact support if the problem persists.');
        } else if (apiError.response?.status && apiError.response.status >= 400 && apiError.response.status < 500) {
          alert('Request error. Please try again or contact support.');
        } else {
          alert('Error opening PDF. Please try downloading instead or contact support.');
        }
      } else if (error && typeof error === 'object' && 'code' in error) {
        const networkError = error as { code?: string };
        if (networkError.code === 'NETWORK_ERROR' || !navigator.onLine) {
          alert('Network error. Please check your internet connection and try again.');
        } else {
          alert('Error opening PDF. Please try downloading instead or contact support.');
        }
      } else {
        alert('Error opening PDF. Please try downloading instead or contact support.');
      }
    }
  };

  // Handle viewing latest PDF version for a consultation
  const handleViewLatestPdf = async (consultationId: string) => {
    const pdfVersion = latestPdfVersions[consultationId];
    if (pdfVersion && pdfVersion.downloadUrl) {
      window.open(pdfVersion.downloadUrl, '_blank');
    } else {
      alert('PDF not available. Please try again later.');
    }
  };

  // Helper function to check if consultation can be joined
  const canJoinConsultation = (consultation: Consultation) => {
    // Only allow joining for scheduled or in-progress consultations
    if (consultation.status !== 'scheduled' && consultation.status !== 'in_progress') {
      return false;
    }
    
    // Check if the consultation is within a reasonable time window
    const consultationDate = new Date(consultation.scheduled_date);
    const consultationDateTime = new Date(
      consultationDate.getFullYear(),
      consultationDate.getMonth(),
      consultationDate.getDate(),
      parseInt(consultation.scheduled_time.split(':')[0]),
      parseInt(consultation.scheduled_time.split(':')[1])
    );
    
    const now = new Date();
    const timeDiff = Math.abs(consultationDateTime.getTime() - now.getTime());
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Allow joining if consultation is within 2 hours before or after scheduled time
    return hoursDiff <= 2;
  };

  const toggleConsultationExpansion = (consultationId: string) => {
    const newExpanded = new Set(expandedConsultations);
    if (newExpanded.has(consultationId)) {
      newExpanded.delete(consultationId);
    } else {
      newExpanded.add(consultationId);
      // Fetch prescriptions when expanding a consultation
      fetchPrescriptionsForConsultation(consultationId);
    }
    setExpandedConsultations(newExpanded);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getConsultationStats = () => {
    const stats = {
      total: consultations.length,
      completed: consultations.filter(c => c.status === 'completed').length,
      scheduled: consultations.filter(c => c.status === 'scheduled').length,
      inProgress: consultations.filter(c => c.status === 'in_progress').length,
      cancelled: consultations.filter(c => c.status === 'cancelled').length,
    };
    return stats;
  };

  const stats = getConsultationStats();

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Consultations</h2>
          <p className="text-gray-600 mt-1">Manage your appointments and consultation history</p>
        </div>
        <Button 
          onClick={onBookConsultation}
          className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:from-[#c9651e] hover:to-[#e67e22] text-white shadow-lg"
        >
          <CalendarDays className="w-4 h-4 mr-2" />
          Book New Consultation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Stethoscope className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-900">{stats.scheduled}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.inProgress}</p>
              </div>
              <Play className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-900">{stats.cancelled}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search and Status Filter Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by doctor name or consultation details..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                />
              </div>
              <Select value={filter} onValueChange={onFilterChange}>
                <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Consultations</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Filter Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2 flex-1">
                <CalendarRange className="w-4 h-4 text-[#E17726]" />
                <span className="text-sm font-medium text-gray-700">Date Range:</span>
                {(startDate || endDate) && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs bg-[#E17726]/10 text-[#E17726] border-[#E17726]/20">
                      Filter Applied
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        onStartDateChange('');
                        onEndDateChange('');
                      }}
                      className="text-xs h-6 px-2 text-gray-500 hover:text-[#E17726]"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => onStartDateChange(e.target.value)}
                      className="border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                    {loading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#E17726]" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => onEndDateChange(e.target.value)}
                      className="border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                    {loading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#E17726]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultations List */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-[#E17726]" />
              <span className="text-lg font-medium text-gray-600">Loading consultations...</span>
            </div>
          </CardContent>
        </Card>
      ) : consultationsWithPrescriptions.length > 0 ? (
        <>
          <div className="space-y-4">
            {consultationsWithPrescriptions.map((consultation) => (
              <Card key={consultation.id} className="hover:shadow-lg transition-all duration-200 border-gray-200">
                <CardContent className="p-0">
                  {/* Main Consultation Info */}
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#E17726] to-[#FF8A56] rounded-full flex items-center justify-center">
                              {getConsultationIcon(consultation.consultation_type)}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900 truncate">
                                Dr. {consultation.doctor_name}
                              </h3>
                              <Badge className={`${getStatusColor(consultation.status)} border flex items-center gap-1`}>
                                {getStatusIcon(consultation.status)}
                                {consultation.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            {/* Scheduled Date Display */}
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className="w-4 h-4 text-[#E17726]" />
                              <span className="text-sm font-medium text-gray-700">
                                Scheduled: {formatDate(consultation.scheduled_date)} at {formatTime(consultation.scheduled_time)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4 text-[#E17726]" />
                                <span>{consultation.duration} minutes</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <DollarSign className="w-4 h-4 text-[#E17726]" />
                                <span>₹{consultation.consultation_fee}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Video className="w-4 h-4 text-[#E17726]" />
                                <span>{consultation.consultation_type}</span>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-green-600">
                                  {consultation.payment_status}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Video className="w-4 h-4 text-[#E17726]" />
                                <span className="text-sm text-gray-600">
                                  {getConsultationTypeLabel(consultation.consultation_type)}
                                </span>
                              </div>
                            </div>
                            
                            {/* Latest PDF Version Display */}
                            <div className="mt-3">
                              {loadingPdfVersions[consultation.id] ? (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>Loading PDF...</span>
                                </div>
                              ) : latestPdfVersions[consultation.id] ? (
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-[#E17726]" />
                                  <span className="text-sm text-gray-600">Latest PDF:</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewLatestPdf(consultation.id)}
                                    className="h-6 px-2 text-xs border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white"
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    View PDF
                                  </Button>
                                  <span className="text-xs text-gray-500">
                                    v{latestPdfVersions[consultation.id].version}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <FileText className="w-4 h-4 text-gray-400" />
                                  <span>No PDF available</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row gap-2">
                        {/* Show Join/Continue buttons only for active consultations */}
                        {canJoinConsultation(consultation) ? (
                          <Button 
                            onClick={() => onJoinConsultation(consultation.id)}
                            className={`${
                              consultation.status === 'scheduled' 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-[#E17726] hover:bg-[#c9651e]'
                            } text-white shadow-md`}
                          >
                            {consultation.status === 'scheduled' ? (
                              <>
                                <Video className="w-4 h-4 mr-2" />
                                Join Now
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Continue
                              </>
                            )}
                          </Button>
                        ) : (consultation.status === 'scheduled' || consultation.status === 'in_progress') ? (
                          <Button 
                            disabled
                            className="bg-gray-400 text-white shadow-md cursor-not-allowed"
                            title="Consultation is not available for joining at this time"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Not Available
                          </Button>
                        ) : null}
                        
                        {/* Show completed status badge for completed consultations */}
                        {consultation.status === 'completed' && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Completed
                          </Badge>
                        )}
                        
                        {/* Show cancelled status badge for cancelled consultations */}
                        {consultation.status === 'cancelled' && (
                          <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
                            <XCircle className="w-4 h-4" />
                            Cancelled
                          </Badge>
                        )}
                        
                        <Button 
                          variant="outline"
                          onClick={() => toggleConsultationExpansion(consultation.id)}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {expandedConsultations.has(consultation.id) ? 'Hide' : 'View'} Details
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedConsultations.has(consultation.id) && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Consultation Details */}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-[#E17726]" />
                              Consultation Details
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Consultation ID:</span>
                                <span className="font-medium">{consultation.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Patient:</span>
                                <span className="font-medium">{consultation.patient_name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Created:</span>
                                <span className="font-medium">{formatDateTime(consultation.created_at)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Prescriptions Section */}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-[#E17726]" />
                              Prescriptions
                            </h4>
                            
                            {loadingPrescriptions[consultation.id] ? (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading prescriptions...
                              </div>
                            ) : consultation.prescriptions && consultation.prescriptions.length > 0 ? (
                              <div className="space-y-3">
                                {consultation.prescriptions.map((prescription) => (
                                  <div key={prescription.id} className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-medium text-gray-900">
                                        Prescription #{prescription.id}
                                      </h5>
                                      <Badge variant="secondary" className="text-xs">
                                        {prescription.status}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-3">
                                      <p>Issued: {formatDate(prescription.issued_date)}</p>
                                      {prescription.diagnosis && (
                                        <p className="mt-1">Diagnosis: {prescription.diagnosis}</p>
                                      )}
                                    </div>
                                    
                                    {/* View PDF Button */}
                                    <div className="mb-3">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleViewPrescription(prescription)}
                                        disabled={prescription.status === 'draft'}
                                        className="w-full"
                                      >
                                        <Eye className="w-3 h-3 mr-2" />
                                        {prescription.status === 'draft' ? 'PDF Not Ready' : 'View PDF'}
                                      </Button>
                                    </div>
                                    
                                    {prescription.status === 'draft' && (
                                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <p className="text-xs text-yellow-700">
                                          <strong>Note:</strong> This prescription is still in draft mode. PDF will be available once the doctor finalizes the prescription.
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">No prescriptions available</p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Prescriptions will appear here after consultation
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} consultations
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Page Size Selector */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Show:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:border-[#E17726] focus:ring-[#E17726]"
                      >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                      </select>
                    </div>
                    
                    {/* Pagination Buttons */}
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {/* Page Numbers */}
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
                            onClick={() => onPageChange(pageNum)}
                            className={`h-8 w-8 p-0 ${
                              currentPage === pageNum 
                                ? 'bg-[#E17726] hover:bg-[#c9651e]' 
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-16">
            <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Consultations Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || filter !== 'all' 
                ? 'No consultations match your search criteria. Try adjusting your filters.' 
                : 'You haven\'t booked any consultations yet. Start your healthcare journey today!'}
            </p>
            <Button 
              onClick={onBookConsultation}
              className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:from-[#c9651e] hover:to-[#e67e22] text-white shadow-lg px-8 py-3"
            >
              <CalendarDays className="w-5 h-5 mr-2" />
              Book Your First Consultation
            </Button>
          </CardContent>
        </Card>
      )}


    </div>
  );
};

export default PatientConsultations;