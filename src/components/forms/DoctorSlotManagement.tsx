import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  CalendarIcon, 
  Clock, 
  Plus, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { generateDoctorSlots, getDoctorSlots, DoctorSlot } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Clinic {
  id: string;
  name: string;
  consultation_duration: number;
}

const DoctorSlotManagement = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slots, setSlots] = useState<DoctorSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const { toast } = useToast();

  // Mock clinics data - replace with actual API call
  useEffect(() => {
    setClinics([
      { id: '1', name: 'General Clinic', consultation_duration: 15 },
      { id: '2', name: 'Specialty Clinic', consultation_duration: 30 },
      { id: '3', name: 'Emergency Clinic', consultation_duration: 20 },
    ]);
  }, []);

  const timeOptions = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const fetchSlots = async (date: Date) => {
    if (!selectedClinic) return;
    
    setLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const fetchedSlots = await getDoctorSlots('current', { date: formattedDate });
      setSlots(fetchedSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch slots",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSlots = async () => {
    if (!selectedDate || !selectedClinic) {
      toast({
        title: "Missing Information",
        description: "Please select a date and clinic",
        variant: "destructive"
      });
      return;
    }

    if (startTime >= endTime) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const generatedSlots = await generateDoctorSlots('current', {
        clinic: parseInt(selectedClinic),
        date: formattedDate,
        start_time: startTime,
        end_time: endTime
      });
      
      setSlots(generatedSlots);
      toast({
        title: "Success",
        description: `Generated ${generatedSlots.length} slots successfully`,
      });
    } catch (error) {
      console.error('Error generating slots:', error);
      toast({
        title: "Error",
        description: "Failed to generate slots",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      fetchSlots(date);
    }
  };

  const getSlotStatus = (slot: DoctorSlot) => {
    if (slot.is_booked) {
      return { label: 'Booked', variant: 'destructive' as const, icon: XCircle };
    }
    if (slot.is_available) {
      return { label: 'Available', variant: 'default' as const, icon: CheckCircle };
    }
    return { label: 'Unavailable', variant: 'secondary' as const, icon: AlertCircle };
  };

  const selectedClinicData = clinics.find(c => c.id === selectedClinic);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-midnight mb-2">Slot Management</h2>
          <p className="text-gray-600">Manage your consultation slots and availability</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Slot Generation Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold text-midnight">
              <Plus className="w-5 h-5 mr-2 text-[#E17726]" />
              Generate Slots
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border"
                disabled={(date) => date < new Date()}
              />
            </div>

            <Separator />

            {/* Clinic Selection */}
            <div className="space-y-2">
              <Label>Select Clinic</Label>
              <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a clinic" />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      {clinic.name} ({clinic.consultation_duration} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Range */}
            <div className="space-y-2">
              <Label>Time Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Start Time</Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">End Time</Label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Clinic Info */}
            {selectedClinicData && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{selectedClinicData.name}</strong><br />
                  Consultation Duration: {selectedClinicData.consultation_duration} minutes
                </p>
              </div>
            )}

            <Button 
              onClick={handleGenerateSlots}
              disabled={!selectedDate || !selectedClinic || generating}
              className="w-full"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Slots
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Slots Display */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold text-midnight">
              <Clock className="w-5 h-5 mr-2 text-[#E17726]" />
              Available Slots
              {selectedDate && (
                <span className="ml-2 text-sm font-normal text-gray-600">
                  for {format(selectedDate, 'MMMM d, yyyy')}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-[#E17726]" />
                <span className="ml-2">Loading slots...</span>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No slots available for this date</p>
                <p className="text-sm">Generate slots to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {slots.map((slot) => {
                  const status = getSlotStatus(slot);
                  const IconComponent = status.icon;
                  
                  return (
                    <div
                      key={slot.id}
                      className={cn(
                        "p-4 border rounded-lg transition-all",
                        slot.is_booked 
                          ? "bg-red-50 border-red-200" 
                          : slot.is_available 
                            ? "bg-green-50 border-green-200 hover:shadow-md"
                            : "bg-gray-50 border-gray-200"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-4 h-4" />
                          <Badge variant={status.variant} className="text-xs">
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-semibold text-midnight">
                          {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {slot.clinic_name}
                        </div>
                      </div>

                      {slot.is_booked && slot.booked_consultation && (
                        <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800">
                          Consultation #{slot.booked_consultation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorSlotManagement; 