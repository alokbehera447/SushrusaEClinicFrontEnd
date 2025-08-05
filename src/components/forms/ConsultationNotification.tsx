import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Clock, User, Stethoscope, X, Bell } from 'lucide-react';
import { toast } from 'sonner';

interface ConsultationNotificationProps {
  consultation: any;
  meetingLink?: string;
  onClose: () => void;
  onJoinMeeting: () => void;
}

const ConsultationNotification: React.FC<ConsultationNotificationProps> = ({
  consultation,
  meetingLink,
  onClose,
  onJoinMeeting
}) => {
  const [timeUntilConsultation, setTimeUntilConsultation] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      if (!consultation?.scheduled_date || !consultation?.scheduled_time) return;

      const now = new Date();
      const consultationDate = new Date(consultation.scheduled_date);
      const [hours, minutes] = consultation.scheduled_time.split(':');
      consultationDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const timeDiff = consultationDate.getTime() - now.getTime();
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));

      if (minutesDiff > 0) {
        const hours = Math.floor(minutesDiff / 60);
        const minutes = minutesDiff % 60;
        if (hours > 0) {
          setTimeUntilConsultation(`${hours}h ${minutes}m until consultation`);
        } else {
          setTimeUntilConsultation(`${minutes}m until consultation`);
        }
      } else if (Math.abs(minutesDiff) <= 15) {
        setTimeUntilConsultation('Consultation time!');
      } else {
        setTimeUntilConsultation('Consultation time has passed');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [consultation]);

  const isConsultationTimeNow = () => {
    if (!consultation?.scheduled_date || !consultation?.scheduled_time) return false;
    
    const now = new Date();
    const consultationDate = new Date(consultation.scheduled_date);
    const [hours, minutes] = consultation.scheduled_time.split(':');
    consultationDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const timeDiff = consultationDate.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    return Math.abs(minutesDiff) <= 15;
  };

  const canJoinMeeting = isConsultationTimeNow() && meetingLink && consultation?.consultation_type === 'video_call';

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-500">
      <Card className="w-80 shadow-2xl border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-full">
                <Bell className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-slate-800">
                  Consultation Reminder
                </CardTitle>
                <p className="text-xs text-slate-600">{timeUntilConsultation}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-slate-500" />
              <span className="text-slate-700">{consultation?.patient_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Stethoscope className="h-4 w-4 text-slate-500" />
              <span className="text-slate-700">{consultation?.doctor_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-slate-700">
                {consultation?.scheduled_date && consultation?.scheduled_time && 
                  `${new Date(consultation.scheduled_date).toLocaleDateString()} at ${consultation.scheduled_time}`
                }
              </span>
            </div>
            
            {canJoinMeeting && (
              <div className="pt-2">
                <Button
                  onClick={onJoinMeeting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Join Meeting Now
                </Button>
              </div>
            )}
            
            {!canJoinMeeting && consultation?.consultation_type === 'video_call' && meetingLink && (
              <div className="pt-2">
                <Button
                  onClick={onJoinMeeting}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                  size="sm"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsultationNotification; 