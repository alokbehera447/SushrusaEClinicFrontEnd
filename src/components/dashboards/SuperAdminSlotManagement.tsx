import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CheckCircle, Calendar as CalendarIcon, X } from 'lucide-react';
import { api, DoctorSlotFrontend } from '@/lib/api';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AxiosError } from 'axios';
import { DoctorProfile } from '@/lib/api';

// Helper to get days in month
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Helper to get first day of week (0=Sun, 1=Mon...)
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// Helper to normalize time to HH:MM
const normalizeTime = (t: string) => t.slice(0, 5);

const SLOT_TIMES = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
];

const SLOT_GROUPS = [
  { label: 'Morning', range: [0, 11] },
  { label: 'Afternoon', range: [12, 17] },
  { label: 'Evening', range: [18, 27] },
];

interface SuperAdminSlotManagementProps {
  doctor: DoctorProfile | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

const SuperAdminSlotManagement: React.FC<SuperAdminSlotManagementProps> = ({ 
  doctor, 
  isOpen, 
  onClose, 
  isDarkMode = false 
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // { 'YYYY-MM-DD': DoctorSlot[] }
  const [slotsByDate, setSlotsByDate] = useState<Record<string, DoctorSlotFrontend[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [undoSlots, setUndoSlots] = useState<DoctorSlotFrontend[] | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);

  // Calendar helpers
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);

  // Format date as YYYY-MM-DD
  const formatDate = (y: number, m: number, d: number) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  // Get doctor ID safely
  const doctorId = doctor?.user;

  // Fetch slots for the month
  React.useEffect(() => {
    if (!doctorId || !isOpen) return;
    console.log('🔍 SuperAdminSlotManagement - Fetching slots for doctor:', doctorId, 'month:', currentMonth + 1, 'year:', currentYear);
    setLoading(true);
    
    // Function to fetch all pages of slots
    const fetchAllSlots = async (url: string) => {
      let allSlots: any[] = [];
      let currentUrl = url;
      
      while (currentUrl) {
        console.log('🔍 Fetching slots from URL:', currentUrl);
        const response = await api.get(currentUrl);
        console.log('🔍 API response:', response.data);
        
        // Handle both array and paginated response formats
        let slots = [];
        if (Array.isArray(response.data)) {
          slots = response.data;
          currentUrl = null; // No pagination
        } else if (response.data && Array.isArray(response.data.results)) {
          slots = response.data.results;
          currentUrl = response.data.next; // Get next page URL
        } else if (response.data && Array.isArray(response.data.data)) {
          slots = response.data.data;
          currentUrl = response.data.next; // Get next page URL
        } else {
          console.warn('Unexpected API response format:', response.data);
          slots = [];
          currentUrl = null;
        }
        
        allSlots = allSlots.concat(slots);
        console.log('🔍 Fetched', slots.length, 'slots from this page. Total so far:', allSlots.length);
      }
      
      return allSlots;
    };
    
    fetchAllSlots(`/api/doctors/${doctorId}/slots/?month=${currentMonth + 1}&year=${currentYear}`)
      .then(slots => {
        console.log('🔍 SuperAdminSlotManagement - Total parsed slots:', slots.length);
        
        const grouped: Record<string, DoctorSlotFrontend[]> = {};
        slots.forEach((slot: { id: number; doctor: string; date: string; start_time: string; end_time: string; is_available: boolean; is_booked: boolean; booked_consultation?: any; created_at: string; updated_at: string }) => {
          console.log('🔍 Processing slot:', {
            id: slot.id,
            date: slot.date,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_available: slot.is_available,
            is_booked: slot.is_booked,
            booked_consultation: slot.booked_consultation,
            has_consultation: !!slot.booked_consultation
          });
          
          const frontendSlot: DoctorSlotFrontend = {
            id: slot.id,
            doctor: slot.doctor,
            date: slot.date,
            startTime: slot.start_time,
            endTime: slot.end_time,
            isAvailable: slot.is_available,
            isBooked: slot.is_booked || !!slot.booked_consultation,
            created_at: slot.created_at,
            updated_at: slot.updated_at,
            type: (slot.is_booked || !!slot.booked_consultation) ? 'booked' : 'available'
          };
          
          if (!grouped[frontendSlot.date]) grouped[frontendSlot.date] = [];
          grouped[frontendSlot.date].push(frontendSlot);
          console.log('🔍 Added slot to date', frontendSlot.date, {
            isBooked: frontendSlot.isBooked,
            type: frontendSlot.type,
            totalSlotsForDate: grouped[frontendSlot.date].length
          });
        });
        console.log('🔍 SuperAdminSlotManagement - Grouped slots by date:', grouped);
        setSlotsByDate(grouped);
      })
      .catch((error: AxiosError) => {
        console.error('❌ Failed to fetch slots:', {
          error: error,
          response: error.response,
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        });
        if (error.response?.status === 404) {
          setError(`Doctor with ID ${doctorId} not found. Please check if the doctor exists in the system.`);
        } else if (error.response?.status === 403) {
          setError('You do not have permission to access this doctor\'s slots.');
        } else if (error.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else if (error.response?.data && typeof error.response.data === 'object') {
          const errorData = error.response.data as Record<string, unknown>;
          if (errorData.error && typeof errorData.error === 'object') {
            const errorObj = errorData.error as Record<string, unknown>;
            if (errorObj.message && typeof errorObj.message === 'string') {
              setError(errorObj.message);
            } else {
              setError('Failed to fetch doctor slots. Please try again.');
            }
          } else {
            setError('Failed to fetch doctor slots. Please try again.');
          }
        } else {
          setError(`Failed to fetch doctor slots: ${error.message || 'Unknown error'}`);
        }
      })
      .finally(() => setLoading(false));
  }, [doctorId, currentMonth, currentYear, isOpen]);

  // Add useEffect to refetch slots when selectedDate changes (for robustness)
  React.useEffect(() => {
    if (!doctorId || !selectedDate || !isOpen) return;
    setLoading(true);
    
    // Function to fetch all pages of slots
    const fetchAllSlots = async (url: string) => {
      let allSlots: any[] = [];
      let currentUrl = url;
      
      while (currentUrl) {
        const response = await api.get(currentUrl);
        
        // Handle both array and paginated response formats
        let slots = [];
        if (Array.isArray(response.data)) {
          slots = response.data;
          currentUrl = null; // No pagination
        } else if (response.data && Array.isArray(response.data.results)) {
          slots = response.data.results;
          currentUrl = response.data.next; // Get next page URL
        } else if (response.data && Array.isArray(response.data.data)) {
          slots = response.data.data;
          currentUrl = response.data.next; // Get next page URL
        } else {
          console.warn('Unexpected API response format:', response.data);
          slots = [];
          currentUrl = null;
        }
        
        allSlots = allSlots.concat(slots);
      }
      
      return allSlots;
    };
    
    fetchAllSlots(`/api/doctors/${doctorId}/slots/?month=${currentMonth + 1}&year=${currentYear}`)
      .then(slots => {
        setSlotsByDate(prev => {
          const grouped: Record<string, DoctorSlotFrontend[]> = { ...prev };
          slots.forEach((slot: { id: number; doctor: string; date: string; start_time: string; end_time: string; is_available: boolean; is_booked: boolean; booked_consultation?: any; created_at: string; updated_at: string }) => {
            const frontendSlot: DoctorSlotFrontend = {
              id: slot.id,
              doctor: slot.doctor,
              date: slot.date,
              startTime: slot.start_time,
              endTime: slot.end_time,
              isAvailable: slot.is_available,
              isBooked: slot.is_booked || !!slot.booked_consultation,
              created_at: slot.created_at,
              updated_at: slot.updated_at,
              type: (slot.is_booked || !!slot.booked_consultation) ? 'booked' : 'available'
            };
            if (!grouped[frontendSlot.date]) grouped[frontendSlot.date] = [];
            grouped[frontendSlot.date].push(frontendSlot);
          });
          return grouped;
        });
      })
      .catch((error: AxiosError) => {
        console.error('Failed to fetch slots:', error);
        if (error.response?.status === 404) {
          setError('Doctor not found. Please check if the doctor exists in the system.');
        } else {
          setError('Failed to fetch doctor slots. Please try again.');
        }
      })
      .finally(() => setLoading(false));
  }, [doctorId, currentMonth, currentYear, selectedDate, isOpen]);

  // Early return if doctor is null or not open
  if (!doctor || !isOpen) {
    return null;
  }
  
  // Debug logging
  console.log('🔍 SuperAdminSlotManagement - Doctor Data:', {
    fullDoctorObject: doctor,
    doctorId,
    doctorName: doctor?.user_name,
    doctorEmail: doctor?.user_email,
    doctorPhone: doctor?.user_phone,
    isActive: doctor?.is_active,
    isVerified: doctor?.is_verified
  });
  
  // Validate doctor ID
  if (!doctorId || !doctorId.startsWith('DOC')) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Invalid Doctor</h2>
            <p className="text-gray-600 mb-4">The selected doctor is not valid or does not exist.</p>
            <Button onClick={onClose} className="bg-red-600 hover:bg-red-700">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
  };

  const handleSlotToggle = async (slotIdx: number) => {
    if (!selectedDate || !doctorId) return;

    const key = formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const slots = slotsByDate[key] || [];
    
    // Check if slot already exists
    const startTime = SLOT_TIMES[slotIdx];
    const endTime = SLOT_TIMES[slotIdx + 1] || '23:59';
    const existingSlot = slots.find(s => 
      normalizeTime(s.startTime) === normalizeTime(startTime) &&
      normalizeTime(s.endTime) === normalizeTime(endTime)
    );

    try {
      if (existingSlot) {
        // Remove slot
        await api.delete(`/api/doctors/${doctorId}/slots/${existingSlot.id}/`);
        setSlotsByDate(prev => ({
          ...prev,
          [key]: prev[key]?.filter(s => s.id !== existingSlot.id) || []
        }));
      } else {
        // Add slot
        const response = await api.post(`/api/doctors/${doctorId}/slots/`, {
          date: key,
          start_time: startTime,
          end_time: endTime,
          is_available: true
        });
        const newSlot = response.data;
        const frontendSlot: DoctorSlotFrontend = {
          id: newSlot.id,
          doctor: newSlot.doctor,
          date: newSlot.date,
          startTime: newSlot.start_time,
          endTime: newSlot.end_time,
          isAvailable: newSlot.is_available,
          isBooked: newSlot.is_booked || !!newSlot.booked_consultation,
          created_at: newSlot.created_at,
          updated_at: newSlot.updated_at,
          type: (newSlot.is_booked || !!newSlot.booked_consultation) ? 'booked' : 'available'
        };
        setSlotsByDate(prev => ({
          ...prev,
          [key]: [...(prev[key] || []), frontendSlot]
        }));
      }
    } catch (error) {
      console.error('Failed to toggle slot:', error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          setError('Doctor not found. Please check if the doctor exists in the system.');
        } else if (error.response?.status === 400) {
          setError('Invalid slot data. Please try again.');
        } else {
          setError('Failed to update slot. Please try again.');
        }
      } else {
        setError('Failed to update slot. Please try again.');
      }
    }
  };

  const handleClearAll = async () => {
    if (!selectedDate || !doctorId) return;

    const key = formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const slots = slotsByDate[key] || [];

    // Only clear non-booked slots
    const clearableSlots = slots.filter(slot => !slot.isBooked);

    if (clearableSlots.length === 0) return;

    // Store slots for undo
    setUndoSlots([...clearableSlots]);

    // Clear timeout if exists
    if (undoTimeout) {
      clearTimeout(undoTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      setUndoSlots(null);
    }, 10000); // 10 seconds
    setUndoTimeout(timeout);

    try {
      // Delete only non-booked slots for the date
      await Promise.all(clearableSlots.map(slot => api.delete(`/api/doctors/${doctorId}/slots/${slot.id}/`)));
      
      // Keep booked slots in the state
      const bookedSlots = slots.filter(slot => slot.isBooked);
      setSlotsByDate(prev => ({
        ...prev,
        [key]: bookedSlots
      }));
    } catch (error) {
      console.error('Failed to clear slots:', error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          setError('Doctor not found. Please check if the doctor exists in the system.');
        } else {
          setError('Failed to clear slots. Please try again.');
        }
      } else {
        setError('Failed to clear slots. Please try again.');
      }
      setUndoSlots(null);
      if (undoTimeout) clearTimeout(undoTimeout);
    }
  };

  const handleUndoClear = async () => {
    if (!selectedDate || !doctorId || !undoSlots) return;

    const key = formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

        try {
      // Recreate all slots
      const responses = await Promise.all(
        undoSlots.map(slot => 
          api.post(`/api/doctors/${doctorId}/slots/`, {
            date: slot.date,
            start_time: slot.startTime,
            end_time: slot.endTime,
            is_available: true
          })
        )
      );

      const newSlots = responses.map(response => {
        const slot = response.data;
        return {
          id: slot.id,
          doctor: slot.doctor,
          date: slot.date,
          startTime: slot.start_time,
          endTime: slot.end_time,
          isAvailable: slot.is_available,
          isBooked: slot.is_booked || !!slot.booked_consultation,
          created_at: slot.created_at,
          updated_at: slot.updated_at,
          type: (slot.is_booked || !!slot.booked_consultation) ? 'booked' : 'available'
        } as DoctorSlotFrontend;
      });

      setSlotsByDate(prev => ({
        ...prev,
        [key]: newSlots
      }));

      setUndoSlots(null);
      if (undoTimeout) {
        clearTimeout(undoTimeout);
        setUndoTimeout(null);
      }
    } catch (error) {
      console.error('Failed to undo clear:', error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          setError('Doctor not found. Please check if the doctor exists in the system.');
        } else {
          setError('Failed to undo clear. Please try again.');
        }
      } else {
        setError('Failed to undo clear. Please try again.');
      }
    }
  };

  // Highlighted dates
  const isDateHighlighted = (day: number) => {
    const key = formatDate(currentYear, currentMonth, day);
    const hasSlots = slotsByDate[key] && slotsByDate[key].length > 0;
    if (day === 18) { // Debug for today
      console.log('🔍 SuperAdminSlotManagement - Checking date', day, 'key:', key, 'hasSlots:', hasSlots, 'slots:', slotsByDate[key]);
    }
    return hasSlots;
  };
  
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };
  
  const isPastDate = (day: number) => {
    const date = new Date(currentYear, currentMonth, day, 0, 0, 0, 0);
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  };

  // Render
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('default', { month: 'long' });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Manage Slots for Dr. {doctor.user_name}
            </h2>
            <p className={`text-sm mt-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {doctor.specialization} • {doctor.experience_years} years experience
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={`hover:bg-gray-100 ${
              isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Card className="mb-8 shadow-xl border-2 border-[#E17726]/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="sm" onClick={handlePrevMonth}><ChevronLeft /></Button>
                <div className="flex flex-col items-center">
                  <h2 className="text-2xl font-bold text-midnight tracking-tight">{monthName} {currentYear}</h2>
                  <div className="flex gap-2 mt-2 text-xs flex-wrap">
                    <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-[#E17726]"></span> Selected</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-blue-300"></span> Has Slots</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-green-200 border border-green-500"></span> Today</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-red-400"></span> Booked</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleNextMonth}><ChevronRight /></Button>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center bg-gray-50 rounded-xl p-2 border border-gray-200">
                {[ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ].map(d => (
                  <div key={d} className="font-semibold text-gray-600 py-1">{d}</div>
                ))}
                {/* Empty cells for first week */}
                {Array(firstDayOfWeek).fill(null).map((_, i) => <div key={'empty-'+i}></div>)}
                {/* Days */}
                {Array(daysInMonth).fill(null).map((_, i) => {
                  const day = i + 1;
                  const highlighted = isDateHighlighted(day);
                  const selected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;
                  const todayMark = isToday(day);
                  const past = isPastDate(day);
                  return (
                    <button
                      key={day}
                      className={`rounded-lg py-2 w-full border font-semibold transition-all relative
                        ${selected ? 'bg-[#E17726] text-white border-[#E17726]' :
                          todayMark ? 'bg-green-200 border-green-500 text-green-900' :
                          highlighted ? 'bg-blue-300 border-blue-400 text-blue-900' :
                          'bg-white border-gray-200 text-gray-900'}
                        ${past ? 'opacity-40 cursor-not-allowed line-through' : ''}
                        hover:bg-[#E17726]/20
                      `}
                      onClick={() => !past && handleDateClick(day)}
                      disabled={past}
                      title={past ? 'Cannot book slots for past dates' : ''}
                    >
                      {day}
                      {todayMark && <span className="absolute top-1 right-1"><CalendarIcon className="w-3 h-3 text-green-600" /></span>}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {selectedDate && !isPastDate(selectedDate.getDate()) && (
            <Card className="shadow-lg border-2 border-[#E17726]/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-semibold text-midnight">
                    Mark available slots for <span className="font-bold text-[#E17726]">{selectedDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleClearAll} className="border-red-300 text-red-500 hover:bg-red-50">Clear All</Button>
                    {undoSlots && (
                      <Button variant="outline" size="sm" onClick={handleUndoClear} className="border-green-300 text-green-600 hover:bg-green-50">Undo</Button>
                    )}
                  </div>
                </div>
                <div className="mb-2 text-sm text-gray-500">
                  {(() => {
                    const key = formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                    const slots = slotsByDate[key] || [];
                    const availableSlots = slots.filter(s => !s.isBooked);
                    const bookedSlots = slots.filter(s => s.isBooked);
                    return (
                      <>
                        Available slots: <span className="font-bold text-[#E17726]">{availableSlots.length}</span>
                        {bookedSlots.length > 0 && (
                          <> • Booked slots: <span className="font-bold text-red-500">{bookedSlots.length}</span></>
                        )}
                      </>
                    );
                  })()}
                </div>
                <div className="space-y-6">
                  {SLOT_GROUPS.map(group => (
                    <div key={group.label}>
                      <div className="mb-2 text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#E17726]" /> {group.label}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        {SLOT_TIMES.slice(group.range[0], group.range[1]+1).map((slot, idx) => {
                          const globalIdx = group.range[0] + idx;
                          const key = formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                          const slots = slotsByDate[key] || [];
                          const matchingSlot = slots.find(s =>
                            normalizeTime(s.startTime) === normalizeTime(SLOT_TIMES[globalIdx]) &&
                            normalizeTime(s.endTime) === normalizeTime(SLOT_TIMES[globalIdx+1] || '23:59')
                          );
                          const isSelected = !!matchingSlot;
                          const isBooked = matchingSlot?.isBooked || false;
                          
                          // Debug logging for slot display
                          if (matchingSlot && isBooked) {
                            console.log('🔍 Found booked slot:', {
                              slot: `${SLOT_TIMES[globalIdx]} - ${SLOT_TIMES[globalIdx+1] || 'End'}`,
                              matchingSlot: matchingSlot,
                              isBooked: isBooked,
                              type: matchingSlot.type
                            });
                          }
                          // Disable if today and slot end time is in the past
                          let isPastSlot = false;
                          if (selectedDate) {
                            const now = new Date();
                            const slotDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                            if (
                              slotDate.toDateString() === now.toDateString() &&
                              SLOT_TIMES[globalIdx+1] // Only check if there is an end time
                            ) {
                              const [endHour, endMin] = SLOT_TIMES[globalIdx+1].split(':').map(Number);
                              const slotEnd = new Date(slotDate);
                              slotEnd.setHours(endHour, endMin, 0, 0);
                              if (now > slotEnd) {
                                isPastSlot = true;
                              }
                            }
                          }
                          return (
                            <button
                              key={slot}
                              className={`rounded-lg px-3 py-2 border text-sm font-medium transition-all flex items-center gap-2
                                ${isBooked ? 'bg-red-400 text-white border-red-400 shadow cursor-not-allowed' :
                                  isSelected ? 'bg-[#E17726] text-white border-[#E17726] shadow' : 'bg-white border-gray-200 text-gray-900'}
                                ${!isBooked && !isPastSlot ? 'hover:bg-[#E17726]/20' : ''}
                                ${isPastSlot ? 'opacity-40 cursor-not-allowed line-through' : ''}
                              `}
                              onClick={() => !isPastSlot && !isBooked && handleSlotToggle(globalIdx)}
                              disabled={isPastSlot || loading || isBooked}
                              title={isBooked ? 'This slot is already booked and cannot be modified' : ''}
                            >
                              <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ 
                                background: isBooked ? '#fff' : isSelected ? '#fff' : '#E17726', 
                                border: isBooked ? '2px solid #fff' : isSelected ? '2px solid #fff' : '2px solid #E17726' 
                              }}></span>
                              {slot} - {SLOT_TIMES[globalIdx+1] || 'End'}
                              {isBooked && <span className="ml-1 text-xs">(Booked)</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-gray-400">Click a slot to mark as available/unavailable. You can select multiple slots.</div>
              </CardContent>
            </Card>
          )}
          {selectedDate && isPastDate(selectedDate.getDate()) && (
            <div className="text-center text-red-500 mt-6 text-sm font-semibold">You cannot book or edit slots for past dates.</div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex justify-end gap-3 p-6 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSlotManagement;
