import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Video, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Play,
  Calendar,
  Timer,
  Phone,
  MessageSquare,
  Eye,
  MoreVertical,
  ChevronRight,
  Star,
  Heart,
  Activity,
  Zap
} from 'lucide-react';
import { Consultation as ApiConsultation, PatientProfile } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

// Extend the API's Consultation type
interface Consultation extends ApiConsultation {
  doctor_meeting_link?: string;
  prescription?: {
    id: string;
    medicines: string[];
    instructions: string;
    writtenDate: string;
  }
}

interface ConsultationSession {
  consultation: Consultation;
  patient: PatientProfile;
  isActive: boolean;
  startTime?: Date;
  endTime?: Date;
  currentStep?: string;
}

interface ConsultationQueueProps {
  consultations: Consultation[];
  onSelectConsultation: (consultation: Consultation) => void;
  onStartConsultation: (consultation: Consultation) => void;
  activeSession: ConsultationSession | null;
}

const ConsultationQueue: React.FC<ConsultationQueueProps> = ({
  consultations,
  onSelectConsultation,
  onStartConsultation,
  activeSession
}) => {
  const [expandedConsultation, setExpandedConsultation] = useState<string | null>(null);

  const getStatusAppearance = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { 
          icon: Clock, 
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
          icon: AlertCircle, 
          color: 'text-red-600 bg-red-50 border-red-200', 
          label: 'Cancelled',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700'
        };
      case 'in-progress':
        return { 
          icon: Activity, 
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
          label: 'In Progress',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700'
        };
      default:
        return { 
          icon: Clock, 
          color: 'text-gray-600 bg-gray-50 border-gray-200', 
          label: 'Unknown',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700'
        };
    }
  };

  const getConsultationTypeIcon = (type: string) => {
    switch (type) {
      case 'video_call':
        return Video;
      case 'in_person':
        return User;
      case 'phone':
        return Phone;
      default:
        return MessageSquare;
    }
  };

  const getPriorityColor = (consultation: Consultation) => {
    const now = new Date();
    const consultationDate = new Date(consultation.scheduled_date);
    const [hours, minutes] = consultation.scheduled_time.split(':');
    consultationDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const timeDiff = consultationDate.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    if (minutesDiff < 0) return 'border-red-500 bg-red-50'; // Overdue
    if (minutesDiff <= 15) return 'border-orange-500 bg-orange-50'; // Due soon
    if (minutesDiff <= 30) return 'border-yellow-500 bg-yellow-50'; // Coming up
    return 'border-gray-200 bg-white'; // Normal
  };

  const isConsultationActive = (consultation: Consultation) => {
    return activeSession?.consultation.id === consultation.id;
  };

  const isConsultationOverdue = (consultation: Consultation) => {
    const now = new Date();
    const consultationDate = new Date(consultation.scheduled_date);
    const [hours, minutes] = consultation.scheduled_time.split(':');
    consultationDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    return consultationDate < now && consultation.status === 'scheduled';
  };

  const getTimeUntilConsultation = (consultation: Consultation) => {
    const now = new Date();
    const consultationDate = new Date(consultation.scheduled_date);
    const [hours, minutes] = consultation.scheduled_time.split(':');
    consultationDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const timeDiff = consultationDate.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    if (minutesDiff < 0) {
      const hoursOverdue = Math.abs(minutesDiff) / 60;
      if (hoursOverdue >= 1) {
        return `${Math.floor(hoursOverdue)}h overdue`;
      }
      return `${Math.abs(Math.floor(minutesDiff))}m overdue`;
    }
    
    if (minutesDiff < 60) {
      return `${Math.floor(minutesDiff)}m`;
    }
    
    const hours = Math.floor(minutesDiff / 60);
    const remainingMinutes = Math.floor(minutesDiff % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const sortedConsultations = [...consultations].sort((a, b) => {
    // Active consultation first
    if (isConsultationActive(a)) return -1;
    if (isConsultationActive(b)) return 1;
    
    // Then by scheduled time
    const dateA = new Date(`${a.scheduled_date} ${a.scheduled_time}`);
    const dateB = new Date(`${b.scheduled_date} ${b.scheduled_time}`);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {sortedConsultations.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">No consultations in queue</p>
        </div>
      ) : (
        sortedConsultations.map((consultation) => {
          const { icon: StatusIcon, color, label } = getStatusAppearance(consultation.status);
          const ConsultationTypeIcon = getConsultationTypeIcon(consultation.consultation_type);
          const priorityColor = getPriorityColor(consultation);
          const isActive = isConsultationActive(consultation);
          const isOverdue = isConsultationOverdue(consultation);
          const timeUntil = getTimeUntilConsultation(consultation);
          const isExpanded = expandedConsultation === consultation.id;

          return (
            <div
              key={consultation.id}
              className={`relative border rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
                isActive ? 'border-blue-500 bg-blue-50 shadow-md' : priorityColor
              } ${isOverdue ? 'border-red-500 bg-red-50' : ''}`}
              onClick={() => onSelectConsultation(consultation)}
            >
              {/* Priority Indicator */}
              {isOverdue && (
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="text-xs">
                    Overdue
                  </Badge>
                </div>
              )}

              {/* Active Session Indicator */}
              {isActive && (
                <div className="absolute top-2 left-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                {/* Patient Avatar */}
                <Avatar className="h-10 w-10 border-2 border-gray-200">
                  <AvatarImage src={`/api/patients/${consultation.patient}/avatar`} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {consultation.patient_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Consultation Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                      {consultation.patient_name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${color} border text-xs px-2 py-1`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {label}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {consultation.status === 'scheduled' && !isActive && (
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartConsultation(consultation);
                              }}
                              className="text-green-600 focus:text-green-600"
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Start Consultation
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedConsultation(isExpanded ? null : consultation.id);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {isExpanded ? 'Hide Details' : 'Show Details'}
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Send Message
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            Call Patient
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-gray-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <ConsultationTypeIcon className="w-3 h-3" />
                      <span className="capitalize">{consultation.consultation_type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Timer className="w-3 h-3" />
                      <span>{consultation.duration} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(consultation.scheduled_date)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                    {consultation.chief_complaint}
                  </p>

                  {/* Time Information */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs">
                      <Clock className="w-3 h-3" />
                      <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {consultation.scheduled_time}
                      </span>
                      {!isActive && (
                        <span className="text-gray-500">
                          ({timeUntil})
                        </span>
                      )}
                    </div>

                    {/* Start Button for Scheduled Consultations */}
                    {consultation.status === 'scheduled' && !isActive && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartConsultation(consultation);
                        }}
                        className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Start
                      </Button>
                    )}

                    {/* Active Session Indicator */}
                    {isActive && (
                      <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                        <Activity className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Consultation ID:</span>
                      <p className="font-medium">{consultation.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Fee:</span>
                      <p className="font-medium">₹{consultation.consultation_fee}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment Status:</span>
                      <Badge 
                        variant={consultation.is_paid ? 'default' : 'destructive'} 
                        className="text-xs"
                      >
                        {consultation.payment_status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <p className="font-medium">{formatDateTime(consultation.created_at)}</p>
                    </div>
                  </div>

                  {consultation.symptoms && (
                    <div>
                      <span className="text-gray-500 text-xs">Symptoms:</span>
                      <p className="text-xs text-gray-700 mt-1">{consultation.symptoms}</p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectConsultation(consultation);
                      }}
                      className="flex-1 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                    
                    {consultation.status === 'scheduled' && !isActive && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartConsultation(consultation);
                        }}
                        className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Start Now
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ConsultationQueue;
