import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';

// Helper to get days in month
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Helper to get first day of week (0=Sun, 1=Mon...)
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

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
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // { 'YYYY-MM-DD': Set of slot indices }
  const [availableSlots, setAvailableSlots] = useState<Record<string, Set<number>>>({});

  // Calendar helpers
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);

  // Format date as YYYY-MM-DD
  const formatDate = (y: number, m: number, d: number) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

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
  const handleSlotToggle = (slotIdx: number) => {
    if (!selectedDate) return;
    const key = formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    setAvailableSlots(prev => {
      const prevSet = prev[key] ? new Set<number>(prev[key]) : new Set<number>();
      if (prevSet.has(slotIdx)) {
        prevSet.delete(slotIdx);
      } else {
        prevSet.add(slotIdx);
      }
      return { ...prev, [key]: prevSet };
    });
  };
  const handleClearAll = () => {
    if (!selectedDate) return;
    const key = formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    setAvailableSlots(prev => ({ ...prev, [key]: new Set() }));
  };

  // Highlighted dates
  const isDateHighlighted = (day: number) => {
    const key = formatDate(currentYear, currentMonth, day);
    return availableSlots[key] && availableSlots[key].size > 0;
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
    <div className="max-w-3xl mx-auto py-8">
      <Card className="mb-8 shadow-xl border-2 border-[#E17726]/10">
        <CardContent className="p-6">
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
              <Button variant="outline" size="sm" onClick={handleClearAll} className="border-red-300 text-red-500 hover:bg-red-50">Clear All</Button>
            </div>
            <div className="mb-2 text-sm text-gray-500">Selected slots: <span className="font-bold text-[#E17726]">{availableSlots[formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())]?.size || 0}</span></div>
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
                      const isSelected = availableSlots[key]?.has(globalIdx);
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
                          disabled={isPastSlot}
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