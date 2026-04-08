import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Video, 
  FileText, 
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
  User,
  MoreVertical,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  AlertCircle,
  Play,
  Square,
  CalendarDays,
  Users,
  TrendingUp,
  BarChart3,
  Settings,
  Bell,
  Star,
  Heart,
  Activity,
  Zap,
  Shield,
  Award,
  Clock3,
  Timer,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  UserCheck,
  UserX,
  VideoOff,
  MessageSquare,
  FileImage,
  Stethoscope,
  Pill,
  Thermometer,
  Scale,
  HeartPulse,
  Brain,
  Eye as EyeIcon,
  Ear,
  Tooth,
  Baby,
  Senior,
  Male,
  Female,
  Users2,
  Building2,
  Home,
  Car,
  Plane,
  Train,
  Bus,
  Bike,
  Walk,
  Bed,
  Coffee,
  Utensils,
  Wine,
  Cigarette,
  Pill as PillIcon,
  Syringe,
  Bandage,
  Microscope,
  XRay,
  Scan,
  TestTube,
  Droplets,
  DNA,
  Brain as BrainIcon,
  Heart as HeartIcon,
  Lungs,
  Stomach,
  Liver,
  Kidney,
  Bone,
  Muscle,
  Skin,
  Hair,
  Nail,
  Tooth as ToothIcon,
  Eye as EyeIcon2,
  Ear as EarIcon,
  Nose,
  Throat,
  Neck,
  Shoulder,
  Arm,
  Hand,
  Finger,
  Chest,
  Back,
  Waist,
  Hip,
  Leg,
  Foot,
  Toe,
  Head,
  Face,
  Mouth,
  Tongue,
  Lip,
  Chin,
  Cheek,
  Forehead,
  Temple,
  Jaw,
  Neck as NeckIcon,
  Throat as ThroatIcon,
  Chest as ChestIcon,
  Back as BackIcon,
  Waist as WaistIcon,
  Hip as HipIcon,
  Leg as LegIcon,
  Foot as FootIcon,
  Toe as ToeIcon,
  Head as HeadIcon,
  Face as FaceIcon,
  Mouth as MouthIcon,
  Tongue as TongueIcon,
  Lip as LipIcon,
  Chin as ChinIcon,
  Cheek as CheekIcon,
  Forehead as ForeheadIcon,
  Temple as TempleIcon,
  Jaw as JawIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { doctorApi, Consultation as ApiConsultation, PatientNote } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { formatDate, formatDateTime, getStatusColor } from '@/lib/api';

// Extend the API's Consultation type to include potentially missing fields
interface Consultation extends ApiConsultation {
    doctor_meeting_link?: string;
    prescription?: {
        id: string;
        medicines: string[];
        instructions: string;
        writtenDate: string;
    }
}

// Enhanced consultation card with modern design
const ConsultationCard = ({ consultation, onUpdate }: { consultation: Consultation, onUpdate: () => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [notes, setNotes] = useState<PatientNote[]>([]);
    const [newNote, setNewNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleAction = async (action: 'start' | 'complete' | 'cancel') => {
        setIsLoading(true);
        try {
            switch (action) {
                case 'start':
                    await doctorApi.startConsultation(consultation.id);
                    toast({
                        title: "Consultation Started",
                        description: "The consultation has been successfully started.",
                        variant: "default",
                    });
                    break;
                case 'complete':
                    await doctorApi.completeConsultation(consultation.id);
                    toast({
                        title: "Consultation Completed",
                        description: "The consultation has been successfully completed.",
                        variant: "default",
                    });
                    break;
                case 'cancel':
                    await doctorApi.cancelConsultation(consultation.id);
                    toast({
                        title: "Consultation Cancelled",
                        description: "The consultation has been cancelled.",
                        variant: "default",
                    });
                    break;
            }
            onUpdate();
        } catch (error) {
            console.error(`Failed to ${action} consultation`, error);
            toast({
                title: "Error",
                description: `Failed to ${action} consultation. Please try again.`,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        try {
            await doctorApi.addConsultationNote(consultation.id, { content: newNote });
            setNewNote('');
            fetchNotes();
            toast({
                title: "Note Added",
                description: "Consultation note has been added successfully.",
                variant: "default",
            });
        } catch (error) {
            console.error('Failed to add note', error);
            toast({
                title: "Error",
                description: "Failed to add note. Please try again.",
                variant: "destructive",
            });
        }
    };

    const fetchNotes = async () => {
        try {
            const fetchedNotes = await doctorApi.getConsultationNotes(consultation.id);
            setNotes(fetchedNotes);
        } catch (error) {
            console.error('Failed to fetch notes', error);
        }
    };

    useEffect(() => {
        if (isExpanded) {
            fetchNotes();
        }
    }, [isExpanded]);

    const getStatusAppearance = (status: string) => {
        switch (status) {
          case 'scheduled':
            return { 
                icon: CalendarClock, 
                color: 'text-blue-600 bg-blue-50 border-blue-200', 
                label: 'Scheduled',
                bgColor: 'bg-blue-50',
                textColor: 'text-blue-700'
            };
          case 'completed':
            return { 
                icon: CheckCircle, 
                color: 'text-green-600 bg-green-50 border-green-200', 
                label: 'Completed',
                bgColor: 'bg-green-50',
                textColor: 'text-green-700'
            };
          case 'cancelled':
            return { 
                icon: XCircle, 
                color: 'text-red-600 bg-red-50 border-red-200', 
                label: 'Cancelled',
                bgColor: 'bg-red-50',
                textColor: 'text-red-700'
            };
          case 'in-progress':
            return { 
                icon: Clock, 
                color: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
                label: 'In Progress',
                bgColor: 'bg-yellow-50',
                textColor: 'text-yellow-700'
            };
          default:
            return { 
                icon: Calendar, 
                color: 'text-gray-600 bg-gray-50 border-gray-200', 
                label: 'Unknown',
                bgColor: 'bg-gray-50',
                textColor: 'text-gray-700'
            };
        }
    };

    const { icon: Icon, color, label, bgColor, textColor } = getStatusAppearance(consultation.status);

    const getConsultationTypeIcon = (type: string) => {
        switch (type) {
            case 'video_call':
                return Video;
            case 'in_person':
                return User;
            case 'phone':
                return Phone;
            default:
                return Stethoscope;
        }
    };

    const ConsultationTypeIcon = getConsultationTypeIcon(consultation.consultation_type);

    return (
        <Card className="transition-all duration-300 hover:shadow-lg border-0 shadow-sm bg-white/95 backdrop-blur-sm">
            <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-14 w-14 border-2 border-gray-100 shadow-sm">
                            <AvatarImage src={`/api/patients/${consultation.patient}/avatar`} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                                {consultation.patient_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-lg text-gray-900">{consultation.patient_name}</h3>
                                <Badge variant="outline" className="text-xs">
                                    <ConsultationTypeIcon className="w-3 h-3 mr-1" />
                                    {consultation.consultation_type.replace('_', ' ')}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{consultation.chief_complaint}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(consultation.scheduled_date)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{consultation.scheduled_time}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Timer className="w-3 h-3" />
                                    <span>{consultation.duration} min</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <DollarSign className="w-3 h-3" />
                                    <span>₹{consultation.consultation_fee}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Badge className={`${color} border font-medium px-3 py-1`}>
                            <Icon className="w-3 h-3 mr-1" />
                            {label}
                        </Badge>
                        
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="h-8 w-8 hover:bg-gray-100"
                                    >
                                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                         </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{isExpanded ? 'Hide details' : 'Show details'}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Consultation Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuGroup>
                                    {consultation.status === 'scheduled' && (
                                        <DropdownMenuItem 
                                            onClick={() => handleAction('start')}
                                            disabled={isLoading}
                                            className="text-green-600 focus:text-green-600"
                                        >
                                            <Play className="mr-2 h-4 w-4" />
                                            Start Consultation
                                        </DropdownMenuItem>
                                    )}
                                    {consultation.status === 'in-progress' && (
                                        <DropdownMenuItem 
                                            onClick={() => handleAction('complete')}
                                            disabled={isLoading}
                                            className="text-blue-600 focus:text-blue-600"
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Complete Consultation
                                        </DropdownMenuItem>
                                    )}
                                    {consultation.status !== 'completed' && consultation.status !== 'cancelled' && (
                                        <DropdownMenuItem 
                                            onClick={() => handleAction('cancel')}
                                            disabled={isLoading}
                                            className="text-red-600 focus:text-red-600"
                                        >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Cancel Consultation
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator />
                                
                                <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => navigate(`/patient/${consultation.patient}/history`)}>
                                    <User className="mr-2 h-4 w-4" />
                                        View Patient History
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(`/patient/${consultation.patient}/profile`)}>
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Patient Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(`/patient/${consultation.patient}/medical-records`)}>
                                        <FileImage className="mr-2 h-4 w-4" />
                                        Medical Records
                                </DropdownMenuItem>
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator />
                                
                                <DropdownMenuGroup>
                                {consultation.status === 'scheduled' && (
                                    <DropdownMenuItem onClick={() => navigate(`/consultation/${consultation.id}/meeting`)}>
                                        <Video className="mr-2 h-4 w-4" />
                                            Join Meeting
                                    </DropdownMenuItem>
                                )}
                                {consultation.status === 'completed' && (
                                     <DropdownMenuItem onClick={() => navigate(`/prescriptions/new/${consultation.id}`)}>
                                        <FileText className="mr-2 h-4 w-4" />
                                            View/Create Prescription
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => navigate(`/consultation/${consultation.id}/notes`)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Manage Notes
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(`/consultation/${consultation.id}/documents`)}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Documents
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator />
                                
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => navigate(`/consultation/${consultation.id}/reschedule`)}>
                                        <CalendarCheck className="mr-2 h-4 w-4" />
                                        Reschedule
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(`/consultation/${consultation.id}/follow-up`)}>
                                        <CalendarDays className="mr-2 h-4 w-4" />
                                        Schedule Follow-up
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(`/consultation/${consultation.id}/billing`)}>
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        Billing Details
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            
            {isExpanded && (
                <CardContent className="p-6 pt-0 border-t border-gray-100">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Consultation Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Consultation ID:</span>
                                        <span className="font-medium">{consultation.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Date:</span>
                                        <span className="font-medium">{formatDate(consultation.scheduled_date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Time:</span>
                                        <span className="font-medium">{consultation.scheduled_time}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Duration:</span>
                                        <span className="font-medium">{consultation.duration} minutes</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Type:</span>
                                        <span className="font-medium capitalize">{consultation.consultation_type.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <Stethoscope className="w-4 h-4 mr-2" />
                                    Medical Information
                                </h4>
                                <div className="space-y-2 text-sm">
                        <div>
                                        <span className="text-gray-600">Chief Complaint:</span>
                                        <p className="font-medium mt-1">{consultation.chief_complaint}</p>
                        </div>
                                    {consultation.symptoms && (
                        <div>
                                            <span className="text-gray-600">Symptoms:</span>
                                            <p className="font-medium mt-1">{consultation.symptoms}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    Payment Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Fee:</span>
                                        <span className="font-medium">₹{consultation.consultation_fee}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <Badge variant={consultation.is_paid ? 'default' : 'destructive'} className="text-xs">
                                            {consultation.payment_status}
                                        </Badge>
                                    </div>
                                    {consultation.payment_method && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Method:</span>
                                            <span className="font-medium capitalize">{consultation.payment_method}</span>
                    </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Consultation Notes
                                </h4>
                                <div className="space-y-3 mb-4 max-h-32 overflow-y-auto">
                                    {notes.length > 0 ? (
                                        notes.map(note => (
                                            <div key={note.id} className="text-sm p-3 bg-white rounded-md border border-gray-200">
                                                <p className="text-gray-800">{note.note}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    By {note.created_by} on {formatDateTime(note.created_at)}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No notes yet</p>
                                    )}
                        </div>
                        <div className="flex gap-2">
                                    <Textarea 
                                        placeholder="Add a new note..." 
                                        value={newNote} 
                                        onChange={(e) => setNewNote(e.target.value)}
                                        className="min-h-[60px] text-sm"
                                    />
                                    <Button 
                                        onClick={handleAddNote} 
                                        size="sm"
                                        className="px-3"
                                        disabled={!newNote.trim()}
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

// Enhanced pagination component
const Pagination = ({ 
    currentPage, 
    totalPages, 
    totalCount, 
    pageSize, 
    onPageChange, 
    onPageSizeChange 
}: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}) => {
    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
                    <span className="font-medium">{totalCount}</span> consultations
                </div>
                
                <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="20">20 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                        <SelectItem value="100">100 per page</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {getVisiblePages().map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <span className="px-3 py-1 text-sm text-gray-500">...</span>
                        ) : (
                            <Button
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => onPageChange(page as number)}
                                className="h-8 w-8 p-0"
                            >
                                {page}
                            </Button>
                        )}
                    </React.Fragment>
                ))}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

// Main component
const DoctorConsultationTab = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchConsultations = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params: { 
        status?: string; 
        search?: string; 
        ordering?: string; 
        page?: number; 
        page_size?: number;
      } = { 
        ordering: '-scheduled_date',
        page: page,
        page_size: pageSize
      };
      
      if (filter !== 'all') {
        params.status = filter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await doctorApi.getAllConsultations(params);
      
      // Handle paginated response
      if (response.results) {
        setConsultations(response.results);
        setTotalCount(response.count || 0);
        setTotalPages(Math.ceil((response.count || 0) / pageSize));
        setCurrentPage(page);
      } else {
        // Fallback for non-paginated response
        setConsultations(response);
        setTotalCount(response.length || 0);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (err) {
      setError('Failed to fetch consultations. Please try again.');
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to fetch consultations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filter, pageSize, searchTerm, toast]);

  useEffect(() => {
    fetchConsultations(1);
  }, [fetchConsultations]);

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      fetchConsultations(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchConsultations(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchConsultations(currentPage);
    setIsRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Consultation list has been refreshed.",
      variant: "default",
    });
  };

  const getFilterStats = () => {
    const stats = {
      all: totalCount,
      scheduled: consultations.filter(c => c.status === 'scheduled').length,
      completed: consultations.filter(c => c.status === 'completed').length,
      cancelled: consultations.filter(c => c.status === 'cancelled').length,
      'in-progress': consultations.filter(c => c.status === 'in-progress').length,
    };
    return stats;
  };

  const filterStats = getFilterStats();

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <Video className="w-6 h-6 mr-3 text-blue-600" />
                My Consultations
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Manage and view your patient consultations with comprehensive tools and insights.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
            </CardHeader>
      </Card>

      {/* Filters and Search Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => setFilter('all')} 
                variant={filter === 'all' ? 'default' : 'outline'} 
                size="sm"
                className="flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>All</span>
                <Badge variant="secondary" className="ml-1">{filterStats.all}</Badge>
              </Button>
              <Button 
                onClick={() => setFilter('scheduled')} 
                variant={filter === 'scheduled' ? 'default' : 'outline'} 
                size="sm"
                className="flex items-center space-x-2"
              >
                <CalendarClock className="w-4 h-4" />
                <span>Upcoming</span>
                <Badge variant="secondary" className="ml-1">{filterStats.scheduled}</Badge>
              </Button>
              <Button 
                onClick={() => setFilter('completed')} 
                variant={filter === 'completed' ? 'default' : 'outline'} 
                size="sm"
                className="flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Completed</span>
                <Badge variant="secondary" className="ml-1">{filterStats.completed}</Badge>
              </Button>
              <Button 
                onClick={() => setFilter('cancelled')} 
                variant={filter === 'cancelled' ? 'default' : 'outline'} 
                size="sm"
                className="flex items-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancelled</span>
                <Badge variant="secondary" className="ml-1">{filterStats.cancelled}</Badge>
              </Button>
              <Button 
                onClick={() => setFilter('in-progress')} 
                variant={filter === 'in-progress' ? 'default' : 'outline'} 
                size="sm"
                className="flex items-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>In Progress</span>
                <Badge variant="secondary" className="ml-1">{filterStats['in-progress']}</Badge>
              </Button>
                    </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                  placeholder="Search by patient name, ID, or complaint..."
                  className="pl-10 pr-4 w-full lg:w-80"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
              </div>
                        <Button type="submit" variant="outline" size="icon">
                             <Search className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
        </CardContent>
      </Card>
          
      {/* Consultations List */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
                {loading && (
            <div className="flex justify-center items-center p-12">
              <div className="flex flex-col items-center space-y-4">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-gray-600">Loading consultations...</p>
                        </div>
                    </div>
                )}

          {error && (
            <div className="text-center p-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Consultations</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => fetchConsultations(1)} variant="outline">
                Try Again
              </Button>
            </div>
          )}

                {!loading && !error && (
            <>
                    {consultations.length > 0 ? (
                <div className="space-y-4 p-6">
                            {consultations.map((consultation) => (
                    <ConsultationCard 
                      key={consultation.id} 
                      consultation={consultation} 
                      onUpdate={() => fetchConsultations(currentPage)} 
                    />
                  ))}
                                    </div>
              ) : (
                <div className="text-center p-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-gray-400" />
                                        </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Consultations Found</h3>
                  <p className="text-gray-600 mb-4">
                                {currentPage > 1 
                                    ? "No consultations on this page. Try going back to the first page." 
                                    : "Try adjusting your filters or search term."
                                }
                            </p>
                            {currentPage > 1 && (
                                <Button 
                                    onClick={() => handlePageChange(1)} 
                                    variant="outline" 
                      className="mr-2"
                                >
                                    Go to First Page
                                </Button>
                            )}
                  <Button onClick={handleRefresh} variant="outline">
                    Refresh
                  </Button>
                        </div>
                    )}

              {/* Pagination */}
              {totalPages > 1 && consultations.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </>
                )}
            </CardContent>
        </Card>
    </div>
  );
};

export default DoctorConsultationTab;
