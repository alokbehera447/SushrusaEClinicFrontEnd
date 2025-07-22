import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { doctorSlotApi, DoctorSlotFrontend } from '@/lib/api';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AxiosError } from 'axios';

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

const DoctorAvailabilitySlots: React.FC = () => {
  const { user } = useAuth();
  const doctorId = user?.id;
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

  // Fetch slots for the month
  React.useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    doctorSlotApi.getSlots(doctorId, currentMonth, currentYear)
      .then(slots => {
        const grouped: Record<string, DoctorSlotFrontend[]> = {};
        slots.forEach(slot => {
          if (!grouped[slot.date]) grouped[slot.date] = [];
          grouped[slot.date].push(slot);
        });
        setSlotsByDate(grouped);
      })
      .finally(() => setLoading(false));
  }, [doctorId, currentMonth, currentYear]);

  // Add useEffect to refetch slots when selectedDate changes (for robustness)
  React.useEffect(() => {
    if (!doctorId || !selectedDate) return;
    setLoading(true);
    doctorSlotApi.getSlots(doctorId, currentMonth, currentYear)
      .then(slots => {
        setSlotsByDate(prev => {
          const grouped: Record<string, DoctorSlotFrontend[]> = { ...prev };
          slots.forEach(slot => {
            if (!grouped[slot.date]) grouped[slot.date] = [];
            grouped[slot.date].push(slot);
          });
          return grouped;
        });
      })
      .finally(() => setLoading(false));
  }, [doctorId, currentMonth, currentYear, selectedDate]);

  // Handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
    setSelectedDate(null);
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
    setSelectedDate(null);
  };
  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
  };
  const handleSlotToggle = async (slotIdx: number) => {
    if (!selectedDate || !doctorId) return;
    const key = formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const slotStart = SLOT_TIMES[slotIdx];
    const slotEnd = SLOT_TIMES[slotIdx+1] || '23:59';
    const slots = slotsByDate[key] || [];
    const existing = slots.find(s => normalizeTime(s.startTime) === slotStart && normalizeTime(s.endTime) === slotEnd);
    setLoading(true);
    if (existing) {
      // Optimistically remove slot
      setSlotsByDate(prev => {
        const updated = { ...prev };
        updated[key] = (updated[key] || []).filter(s => !(normalizeTime(s.startTime) === slotStart && normalizeTime(s.endTime) === slotEnd));
        return updated;
      });
      try {
        await doctorSlotApi.deleteSlot(doctorId, existing.id);
      } catch (err) {
        // Revert on error
        setSlotsByDate(prev => {
          const updated = { ...prev };
          updated[key] = [...(updated[key] || []), existing];
          return updated;
        });
        setError('Failed to deselect slot. Please try again.');
        setTimeout(() => setError(null), 4000);
      }
    } else {
      // Create a fake slot for optimistic update
      const fakeSlot: DoctorSlotFrontend = {
        id: -Math.floor(Math.random() * 1000000), // temp negative id
        doctor: Number(doctorId),
        date: key,
        startTime: slotStart,
        endTime: slotEnd,
        isAvailable: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        type: 'available',
      };
      setSlotsByDate(prev => {
        const updated = { ...prev };
        updated[key] = [...(updated[key] || []), fakeSlot];
        return updated;
      });
      try {
        await doctorSlotApi.createSlot(doctorId, {
          date: key,
          start_time: slotStart,
          end_time: slotEnd,
          is_available: true
        });
      } catch (err: unknown) {
        // Revert on error
        setSlotsByDate(prev => {
          const updated = { ...prev };
          updated[key] = (updated[key] || []).filter(s => !(normalizeTime(s.startTime) === slotStart && normalizeTime(s.endTime) === slotEnd));
          return updated;
        });
        if (
          err instanceof AxiosError &&
          err.response?.data?.error?.code === 'DUPLICATE_SLOT'
        ) {
          setError(err.response.data.error.message || 'Duplicate slot.');
        } else {
          setError('Failed to create slot. Please try again.');
        }
        setTimeout(() => setError(null), 4000);
      }
    }
    // Always refetch for consistency
    const updated = await doctorSlotApi.getSlots(doctorId, currentMonth, currentYear);
    const grouped: Record<string, DoctorSlotFrontend[]> = {};
    updated.forEach(slot => {
      if (!grouped[slot.date]) grouped[slot.date] = [];
      // Avoid duplicates
      if (!grouped[slot.date].some(s => normalizeTime(s.startTime) === normalizeTime(slot.startTime) && normalizeTime(s.endTime) === normalizeTime(slot.endTime))) {
        grouped[slot.date].push(slot);
      }
    });
    setSlotsByDate(grouped);
    setLoading(false);
  };
  const handleClearAll = async () => {
    if (!selectedDate || !doctorId) return;
    const key = formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const slots = slotsByDate[key] || [];
    if (slots.length === 0) return;
    setLoading(true);
    setUndoSlots(slots); // Store for undo
    setSlotsByDate(prev => ({ ...prev, [key]: [] })); // Optimistically clear
    // Start undo timer
    if (undoTimeout) clearTimeout(undoTimeout);
    const timeout = setTimeout(async () => {
      // After 5s, actually delete from backend
      await Promise.all(slots.map(slot => doctorSlotApi.deleteSlot(doctorId, slot.id)));
      setUndoSlots(null);
      setLoading(false);
    }, 5000);
    setUndoTimeout(timeout);
    setLoading(false);
  };

  const handleUndoClear = async () => {
    if (!selectedDate || !doctorId || !undoSlots) return;
    const key = formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    setLoading(true);
    // Restore slots in UI
    setSlotsByDate(prev => ({ ...prev, [key]: undoSlots }));
    // Re-create slots in backend (ignore errors for existing)
    await Promise.all(
      undoSlots.map(slot =>
        doctorSlotApi.createSlot(doctorId, {
          date: slot.date,
          start_time: slot.startTime,
          end_time: slot.endTime,
          is_available: true
        }).catch(() => {})
      )
    );
    setUndoSlots(null);
    if (undoTimeout) clearTimeout(undoTimeout);
    // Refetch for consistency
    const updated = await doctorSlotApi.getSlots(doctorId, currentMonth, currentYear);
    const grouped: Record<string, DoctorSlotFrontend[]> = {};
    updated.forEach(slot => {
      if (!grouped[slot.date]) grouped[slot.date] = [];
      if (!grouped[slot.date].some(s => normalizeTime(s.startTime) === normalizeTime(slot.startTime) && normalizeTime(s.endTime) === normalizeTime(slot.endTime))) {
        grouped[slot.date].push(slot);
      }
    });
    setSlotsByDate(grouped);
    setLoading(false);
  };

  // Highlighted dates
  const isDateHighlighted = (day: number) => {
    const key = formatDate(currentYear, currentMonth, day);
    return slotsByDate[key] && slotsByDate[key].length > 0;
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

  // Debug: log slots for selected date and all slotsByDate
  if (selectedDate) {
    const debugKey = formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    // eslint-disable-next-line no-console
    console.log('DEBUG selectedDate:', selectedDate, 'key:', debugKey, 'slots:', slotsByDate[debugKey], 'ALL slotsByDate:', slotsByDate);
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-2 sm:px-6 lg:px-8">
      <Card className="mb-8 shadow-xl border-2 border-[#E17726]/10">
        <CardContent className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}><ChevronLeft /></Button>
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-bold text-midnight tracking-tight">{monthName} {currentYear}</h2>
              <div className="flex gap-2 mt-2 text-xs">
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-[#E17726]"></span> Selected</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-blue-300"></span> Has Slots</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-green-200 border border-green-500"></span> Today</span>
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
                Mark your available slots for <span className="font-bold text-[#E17726]">{selectedDate.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleClearAll} className="border-red-300 text-red-500 hover:bg-red-50">Clear All</Button>
                {undoSlots && (
                  <Button variant="outline" size="sm" onClick={handleUndoClear} className="border-green-300 text-green-600 hover:bg-green-50">Undo</Button>
                )}
              </div>
            </div>
            <div className="mb-2 text-sm text-gray-500">Selected slots: <span className="font-bold text-[#E17726]">{
              (() => {
                const key = formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                const slots = slotsByDate[key] || [];
                // Count unique slots by startTime and endTime
                const unique = new Set(slots.map(s => `${normalizeTime(s.startTime)}-${normalizeTime(s.endTime)}`));
                return unique.size;
              })()
            }</span></div>
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
                      const isSelected = slots.some(s =>
                        normalizeTime(s.startTime) === normalizeTime(SLOT_TIMES[globalIdx]) &&
                        normalizeTime(s.endTime) === normalizeTime(SLOT_TIMES[globalIdx+1] || '23:59')
                      );
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
                            ${isSelected ? 'bg-[#E17726] text-white border-[#E17726] shadow' : 'bg-white border-gray-200 text-gray-900'}
                            hover:bg-[#E17726]/20
                            ${isPastSlot ? 'opacity-40 cursor-not-allowed line-through' : ''}
                          `}
                          onClick={() => !isPastSlot && handleSlotToggle(globalIdx)}
                          disabled={isPastSlot || loading}
                        >
                          <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: isSelected ? '#fff' : '#E17726', border: isSelected ? '2px solid #fff' : '2px solid #E17726' }}></span>
                          {slot} - {SLOT_TIMES[globalIdx+1] || 'End'}
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
  );
};

export default DoctorAvailabilitySlots; 