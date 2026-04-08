import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Activity, 
  UserCheck, 
  Video, 
  Coffee, 
  UserX, 
  Briefcase, 
  Circle,
  Clock,
  MessageSquare
} from 'lucide-react';
import { doctorStatusApi } from '@/lib/api';
import { toast } from 'sonner';

interface DoctorStatusUpdateProps {
  isDarkMode?: boolean;
}

const DoctorStatusUpdate: React.FC<DoctorStatusUpdateProps> = ({ isDarkMode = false }) => {
  const [currentStatus, setCurrentStatus] = useState<string>('available');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [statusNote, setStatusNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mark as offline when user closes browser/tab
  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        await doctorStatusApi.markOffline();
      } catch (error) {
        console.error('Error marking as offline:', error);
      }
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        try {
          await doctorStatusApi.markOffline();
        } catch (error) {
          console.error('Error marking as offline:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const statusOptions = [
    { value: 'available', label: 'Available', icon: UserCheck, color: 'bg-green-100 text-green-800' },
    { value: 'consulting', label: 'In Consultation', icon: Video, color: 'bg-blue-100 text-blue-800' },
    { value: 'busy', label: 'Busy', icon: Briefcase, color: 'bg-orange-100 text-orange-800' },
    { value: 'away', label: 'Away', icon: Coffee, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'break', label: 'On Break', icon: Coffee, color: 'bg-purple-100 text-purple-800' },
    { value: 'offline', label: 'Offline', icon: UserX, color: 'bg-gray-100 text-gray-800' },
  ];

  const getStatusIcon = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? <option.icon className="h-4 w-4" /> : <Circle className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : 'bg-gray-100 text-gray-800';
  };

  const updateStatus = async () => {
    setLoading(true);
    try {
      const response = await doctorStatusApi.updateDoctorStatus({
        current_status: currentStatus,
        status_note: statusNote,
        is_available: isAvailable,
      });

      if (response.data) {
        toast.success('Status updated successfully');
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const quickStatusUpdate = async (status: string) => {
    setCurrentStatus(status);
    setStatusNote('');
    setLoading(true);
    
    try {
      const response = await doctorStatusApi.updateDoctorStatus({
        current_status: status,
        status_note: '',
        is_available: status === 'available',
      });

      if (response.data) {
        toast.success(`Status updated to ${statusOptions.find(opt => opt.value === status)?.label}`);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Activity className="h-5 w-5" />
          <span>Update Your Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status Display */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center space-x-3">
            {getStatusIcon(currentStatus)}
            <div>
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Current Status
              </p>
              <Badge variant="outline" className={getStatusColor(currentStatus)}>
                {statusOptions.find(opt => opt.value === currentStatus)?.label}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Last updated
            </p>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Quick Status Buttons */}
        <div>
          <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Quick Status Update
          </p>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                size="sm"
                onClick={() => quickStatusUpdate(option.value)}
                disabled={loading}
                className={`justify-start ${currentStatus === option.value ? 'border-2' : ''}`}
              >
                <option.icon className="h-4 w-4 mr-2" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Detailed Status Update */}
        <div className="space-y-3">
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Detailed Status Update
          </p>
          
          <div className="space-y-2">
            <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Status
            </label>
            <Select value={currentStatus} onValueChange={setCurrentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <option.icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Status Note (Optional)
            </label>
            <Textarea
              placeholder="Add a note about your current status..."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              rows={3}
              className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAvailable"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="rounded"
            />
            <label 
              htmlFor="isAvailable" 
              className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Available for consultations
            </label>
          </div>

          <Button 
            onClick={updateStatus} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 animate-spin" />
                <span>Updating...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Update Status</span>
              </div>
            )}
          </Button>
        </div>

        {/* Status Tips */}
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <strong>Tip:</strong> Use quick status buttons for common updates, or use the detailed form for custom status notes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorStatusUpdate; 