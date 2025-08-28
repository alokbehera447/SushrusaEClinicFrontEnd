import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Video,
  Phone,
  Calendar,
  Clock,
  User,
  FileText,
  Stethoscope,
  Heart,
  Thermometer,
  Activity,
  Pill,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Download,
  Printer,
  Share2,
  MessageSquare,
  Camera,
  File,
  MapPin,
  DollarSign,
  CreditCard,
  Receipt,
  History,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  adminConsultationApi,
  Consultation,
  prescriptionApi
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';



const ConsultationDetailPage = () => {
  const { consultationId } = useParams<{ consultationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPrescription, setDownloadingPrescription] = useState(false);

  useEffect(() => {
    if (consultationId) {
      loadConsultationDetails();
    }
  }, [consultationId]);

  const loadConsultationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load consultation details (includes patient and doctor info)
      const consultationData = await adminConsultationApi.getConsultationById(consultationId!);
      setConsultation(consultationData);

    } catch (error: any) {
      console.error('Error loading consultation details:', error);
      setError(error.message || 'Failed to load consultation details');
      toast({
        title: "Error",
        description: "Failed to load consultation details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <Activity className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'no_show':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (isPaid: boolean) => {
    return isPaid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
  };

  const handleConsultationAction = async (action: string) => {
    try {
      switch (action) {
        case 'start':
          await adminConsultationApi.startConsultation(consultationId!);
          toast({
            title: "Success",
            description: "Consultation started successfully",
          });
          loadConsultationDetails(); // Reload to get updated status
          break;
        case 'complete':
          await adminConsultationApi.completeConsultation(consultationId!);
          toast({
            title: "Success",
            description: "Consultation completed successfully",
          });
          loadConsultationDetails();
          break;
        case 'cancel':
          await adminConsultationApi.cancelConsultation(consultationId!);
          toast({
            title: "Success",
            description: "Consultation cancelled successfully",
          });
          loadConsultationDetails();
          break;
        case 'edit':
          navigate(`/dashboard/consultations/${consultationId}/edit`);
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this consultation?')) {
            await adminConsultationApi.deleteConsultation(consultationId!);
            toast({
              title: "Success",
              description: "Consultation deleted successfully",
            });
            navigate('/dashboard');
          }
          break;
      }
    } catch (error: any) {
      console.error('Error performing action:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to perform action",
        variant: "destructive"
      });
    }
  };

  // Handle download prescription
  const handleDownloadPrescription = async () => {
    try {
      setDownloadingPrescription(true);
      
      let prescriptionId = consultation.prescription_data?.id;
      
      // If no prescription data available, try to get it from the consultation
      if (!prescriptionId) {
        try {
          const prescriptionData = await prescriptionApi.getConsultationPrescription(consultation.id);
          prescriptionId = prescriptionData.id;
        } catch (error) {
          console.error('Error fetching prescription data:', error);
          toast({
            title: "Error",
            description: "No prescription available for this consultation",
            variant: "destructive"
          });
          return;
        }
      }
      
      if (!prescriptionId) {
        toast({
          title: "Error",
          description: "No prescription available for this consultation",
          variant: "destructive"
        });
        return;
      }
      
      const response = await prescriptionApi.downloadPDF(prescriptionId, 'latest');
      
      // The API returns a download URL, so we can open it directly
      if (response.download_url) {
        window.open(response.download_url, '_blank');
        toast({
          title: "Success",
          description: "Prescription download started",
        });
      } else {
        toast({
          title: "Error",
          description: "No download URL available",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error downloading prescription:', error);
      toast({
        title: "Error",
        description: "Failed to download prescription",
        variant: "destructive"
      });
    } finally {
      setDownloadingPrescription(false);
    }
  };

  // Handle join meeting
  const handleJoinMeeting = () => {
    if (!consultation.doctor_meeting_link) {
      toast({
        title: "Error",
        description: "No meeting link available",
        variant: "destructive"
      });
      return;
    }
    
    // Open meeting link in new tab
    window.open(consultation.doctor_meeting_link, '_blank');
    toast({
      title: "Success",
      description: "Opening meeting...",
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || 'Consultation not found'}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => navigate('/dashboard')}
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-midnight">
              Consultation #{consultation.id}
            </h1>
            <p className="text-gray-600">
              {format(new Date(consultation.scheduled_date), 'EEEE, MMMM d, yyyy')} at {consultation.scheduled_time}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(consultation.status)}>
            {getStatusIcon(consultation.status)}
            <span className="ml-1 capitalize">{consultation.status.replace('_', ' ')}</span>
          </Badge>
          
          {/* Download Prescription Button */}
          <Button
            onClick={handleDownloadPrescription}
            variant="outline"
            size="sm"
            className="flex items-center"
            disabled={downloadingPrescription}
          >
            {downloadingPrescription ? (
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {downloadingPrescription ? 'Downloading...' : 'Download Prescription'}
          </Button>
          
          {/* Join Meeting Button - Only show if consultation is not completed */}
          {consultation.status !== 'completed' && consultation.doctor_meeting_link && (
            <Button
              onClick={handleJoinMeeting}
              size="sm"
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Video className="w-4 h-4 mr-2" />
              Join Meeting
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {consultation.status === 'scheduled' && (
                <>
                  <DropdownMenuItem onClick={() => handleConsultationAction('start')}>
                    <Activity className="w-4 h-4 mr-2" />
                    Start Consultation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleConsultationAction('cancel')}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Consultation
                  </DropdownMenuItem>
                </>
              )}
              {consultation.status === 'in_progress' && (
                <DropdownMenuItem onClick={() => handleConsultationAction('complete')}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Consultation
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleConsultationAction('edit')}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Consultation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleConsultationAction('delete')}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Consultation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Consultation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-[#E17726]" />
                Consultation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Consultation Type</label>
                  <p className="text-lg font-semibold capitalize">
                    {consultation.consultation_type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <p className="text-lg font-semibold">{consultation.duration} minutes</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Scheduled Date</label>
                  <p className="text-lg font-semibold">
                    {format(new Date(consultation.scheduled_date), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Scheduled Time</label>
                  <p className="text-lg font-semibold">{consultation.scheduled_time}</p>
                </div>
                {consultation.actual_start_time && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Actual Start Time</label>
                    <p className="text-lg font-semibold">
                      {format(new Date(consultation.actual_start_time), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                {consultation.actual_end_time && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Actual End Time</label>
                    <p className="text-lg font-semibold">
                      {format(new Date(consultation.actual_end_time), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-gray-600">Chief Complaint</label>
                <p className="text-lg mt-1">{consultation.chief_complaint}</p>
              </div>

              {consultation.symptoms && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Symptoms</label>
                  <p className="text-lg mt-1">{consultation.symptoms}</p>
                </div>
              )}

              {consultation.doctor_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Doctor Notes</label>
                  <p className="text-lg mt-1">{consultation.doctor_notes}</p>
                </div>
              )}

              {consultation.patient_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Patient Notes</label>
                  <p className="text-lg mt-1">{consultation.patient_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-[#E17726]" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Consultation Fee</label>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{consultation.consultation_fee}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Status</label>
                  <Badge className={getPaymentStatusColor(consultation.is_paid)}>
                    {consultation.is_paid ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
                {consultation.payment_method && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Payment Method</label>
                    <p className="text-lg font-semibold capitalize">
                      {consultation.payment_method.replace('_', ' ')}
                    </p>
                  </div>
                )}
                {consultation.payment_status && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Payment Status</label>
                    <p className="text-lg font-semibold capitalize">
                      {consultation.payment_status.replace('_', ' ')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Follow-up Information */}
          {consultation.is_follow_up && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="w-5 h-5 mr-2 text-[#E17726]" />
                  Follow-up Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Follow-up Required</label>
                    <Badge className={consultation.follow_up_required ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}>
                      {consultation.follow_up_required ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {consultation.follow_up_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Follow-up Date</label>
                      <p className="text-lg font-semibold">
                        {format(new Date(consultation.follow_up_date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cancellation Information */}
          {consultation.status === 'cancelled' && consultation.cancellation_reason && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center text-red-800">
                  <XCircle className="w-5 h-5 mr-2" />
                  Cancellation Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium text-red-700">Cancellation Reason</label>
                  <p className="text-lg mt-1 text-red-800">{consultation.cancellation_reason}</p>
                </div>
                {consultation.cancelled_at && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-red-700">Cancelled At</label>
                    <p className="text-lg mt-1 text-red-800">
                      {format(new Date(consultation.cancelled_at), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-[#E17726]" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {consultation?.patient_name ? (
                <>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{consultation.patient_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{consultation.patient_name}</h3>
                      <p className="text-sm text-gray-600">{consultation.patient_phone || 'Phone not available'}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Email</label>
                      <p className="text-sm">{consultation.patient_email || 'Email not available'}</p>
                    </div>
                    {consultation.patient_age && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Age</label>
                        <p className="text-sm">{consultation.patient_age} years</p>
                      </div>
                    )}
                    {consultation.patient_gender && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Gender</label>
                        <p className="text-sm capitalize">{consultation.patient_gender}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-medium text-gray-600">Patient ID</label>
                      <p className="text-sm">{consultation.patient}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Patient information not available</p>
              )}
            </CardContent>
          </Card>

          {/* Doctor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="w-5 h-5 mr-2 text-[#E17726]" />
                Doctor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {consultation?.doctor_name ? (
                <>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{consultation.doctor_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{consultation.doctor_name}</h3>
                      <p className="text-sm text-gray-600">{consultation.doctor_specialty || 'Specialty not available'}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Phone</label>
                      <p className="text-sm">{consultation.doctor_phone || 'Phone not available'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Email</label>
                      <p className="text-sm">{consultation.doctor_email || 'Email not available'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Consultation Fee</label>
                      <p className="text-sm font-semibold">₹{consultation.consultation_fee || 0}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Doctor ID</label>
                      <p className="text-sm">{consultation.doctor}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Doctor information not available</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-[#E17726]" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {consultation.status === 'scheduled' && (
                <Button 
                  onClick={() => handleConsultationAction('start')}
                  className="w-full"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Start Consultation
                </Button>
              )}
              
              {consultation.status === 'in_progress' && (
                <Button 
                  onClick={() => handleConsultationAction('complete')}
                  className="w-full"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Consultation
                </Button>
              )}

              <Button variant="outline" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>

              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>

              <Button variant="outline" className="w-full">
                <Printer className="w-4 h-4 mr-2" />
                Print Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
  };
  
  export default ConsultationDetailPage; 