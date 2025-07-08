import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  User,
  MapPin,
  Phone
} from 'lucide-react';

const DoctorSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // week, month
  const [editingSlot, setEditingSlot] = useState<any>(null);

  // Mock data
  const doctorInfo = {
    name: 'Dr. Priya Singh',
    specialty: 'Cardiology',
    clinic: 'Sushrusa Clinic - Delhi',
    phone: '+91 98765 43210',
    consultationFee: 500
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const scheduleData = {
    'Mon': {
      available: true,
      slots: [
        { time: '09:00', status: 'available', duration: 30 },
        { time: '09:30', status: 'booked', patient: 'Rajesh Kumar', duration: 30 },
        { time: '10:00', status: 'available', duration: 30 },
        { time: '10:30', status: 'booked', patient: 'Anita Devi', duration: 30 },
        { time: '14:00', status: 'available', duration: 30 },
        { time: '14:30', status: 'blocked', reason: 'Break', duration: 60 },
        { time: '15:30', status: 'available', duration: 30 },
        { time: '16:00', status: 'available', duration: 30 }
      ]
    },
    'Tue': {
      available: true,
      slots: [
        { time: '09:00', status: 'available', duration: 30 },
        { time: '09:30', status: 'available', duration: 30 },
        { time: '10:00', status: 'booked', patient: 'Suresh Gupta', duration: 30 },
        { time: '14:00', status: 'available', duration: 30 },
        { time: '14:30', status: 'available', duration: 30 },
        { time: '15:00', status: 'available', duration: 30 }
      ]
    },
    'Wed': {
      available: true,
      slots: [
        { time: '09:00', status: 'available', duration: 30 },
        { time: '09:30', status: 'available', duration: 30 },
        { time: '10:00', status: 'available', duration: 30 },
        { time: '14:00', status: 'blocked', reason: 'Surgery', duration: 120 }
      ]
    },
    'Thu': {
      available: true,
      slots: [
        { time: '09:00', status: 'booked', patient: 'Priya Sharma', duration: 30 },
        { time: '09:30', status: 'available', duration: 30 },
        { time: '10:00', status: 'available', duration: 30 },
        { time: '14:00', status: 'available', duration: 30 },
        { time: '14:30', status: 'available', duration: 30 }
      ]
    },
    'Fri': {
      available: true,
      slots: [
        { time: '09:00', status: 'available', duration: 30 },
        { time: '09:30', status: 'available', duration: 30 },
        { time: '10:00', status: 'booked', patient: 'Amit Singh', duration: 30 },
        { time: '14:00', status: 'available', duration: 30 }
      ]
    },
    'Sat': {
      available: true,
      slots: [
        { time: '09:00', status: 'available', duration: 30 },
        { time: '09:30', status: 'available', duration: 30 },
        { time: '10:00', status: 'available', duration: 30 }
      ]
    },
    'Sun': {
      available: false,
      slots: []
    }
  };

  const getSlotColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'booked': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const addTimeSlot = (day: string, time: string) => {
    // Logic to add a new time slot
    console.log('Adding slot:', day, time);
  };

  const editTimeSlot = (day: string, slot: any) => {
    setEditingSlot({ day, ...slot });
  };

  const deleteTimeSlot = (day: string, time: string) => {
    // Logic to delete time slot
    console.log('Deleting slot:', day, time);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-midnight">Schedule Management</h1>
              <Badge className="bg-[#E17726]/10 text-[#E17726] border-[#E17726]/20">
                {doctorInfo.name}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className={viewMode === 'week' ? 'bg-[#E17726] text-white' : ''}
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                  className={viewMode === 'month' ? 'bg-[#E17726] text-white' : ''}
                >
                  Month
                </Button>
              </div>
              <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                <Settings className="w-4 h-4 mr-2" />
                Schedule Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Schedule Calendar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Calendar Navigation */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" className="border-gray-300">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="text-xl font-bold text-midnight">
                      January 2024
                    </h2>
                    <Button variant="outline" size="sm" className="border-gray-300">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button variant="outline" className="border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white">
                    <Calendar className="w-4 h-4 mr-2" />
                    Today
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Schedule Grid */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">Weekly Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-8 gap-2">
                  {/* Time column header */}
                  <div className="font-medium text-gray-600 text-sm">Time</div>
                  
                  {/* Day headers */}
                  {weekDays.map((day) => (
                    <div key={day} className="text-center">
                      <div className="font-medium text-gray-900">{day}</div>
                      <div className="text-xs text-gray-500">Jan {15 + weekDays.indexOf(day)}</div>
                      <div className="mt-2">
                        {scheduleData[day as keyof typeof scheduleData]?.available ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">Available</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 text-xs">Off</Badge>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Time slots */}
                  {timeSlots.map((time) => (
                    <React.Fragment key={time}>
                      {/* Time label */}
                      <div className="text-sm text-gray-600 py-2 border-t border-gray-100">
                        {time}
                      </div>
                      
                      {/* Day slots */}
                      {weekDays.map((day) => {
                        const dayData = scheduleData[day as keyof typeof scheduleData];
                        const slot = dayData?.slots?.find(s => s.time === time);
                        
                        return (
                          <div key={`${day}-${time}`} className="border-t border-gray-100 p-1">
                            {slot ? (
                              <div
                                className={`p-2 rounded-lg text-xs cursor-pointer hover:opacity-80 transition-opacity ${getSlotColor(slot.status)}`}
                                onClick={() => editTimeSlot(day, slot)}
                              >
                                <div className="font-medium">{slot.status}</div>
                                {slot.patient && (
                                  <div className="truncate">{slot.patient}</div>
                                )}
                                {slot.reason && (
                                  <div className="truncate">{slot.reason}</div>
                                )}
                                <div className="text-xs opacity-75">{slot.duration}m</div>
                              </div>
                            ) : dayData?.available ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => addTimeSlot(day, time)}
                                className="w-full h-16 border-2 border-dashed border-gray-300 hover:border-[#E17726] text-gray-400 hover:text-[#E17726]"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            ) : (
                              <div className="h-16 bg-gray-50 rounded-lg flex items-center justify-center">
                                <span className="text-xs text-gray-400">Off</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Doctor Info */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Doctor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarFallback className="bg-[#E17726] text-white font-semibold text-lg">
                      {doctorInfo.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-midnight">{doctorInfo.name}</h3>
                  <p className="text-sm text-gray-600">{doctorInfo.specialty}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-[#E17726]" />
                    <span className="text-sm text-gray-700">{doctorInfo.clinic}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-aqua" />
                    <span className="text-sm text-gray-700">{doctorInfo.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">₹{doctorInfo.consultationFee} per consultation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Slots:</span>
                  <span className="font-bold text-midnight">42</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booked:</span>
                  <span className="font-bold text-blue-600">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-bold text-green-600">28</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Blocked:</span>
                  <span className="font-bold text-red-600">6</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-gray-600">Occupancy:</span>
                  <span className="font-bold text-[#E17726]">19%</span>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Templates */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Schedule Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white justify-start h-12 rounded-xl">
                  <Calendar className="w-5 h-5 mr-3" />
                  Apply Weekly Template
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-aqua text-aqua hover:bg-aqua hover:text-white">
                  <Clock className="w-5 h-5 mr-3" />
                  Set Default Hours
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100">
                  <Settings className="w-5 h-5 mr-3" />
                  Slot Duration
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white">
                  <Plus className="w-5 h-5 mr-3" />
                  Block Time Slot
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                  <Calendar className="w-5 h-5 mr-3" />
                  Copy Schedule
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100">
                  <Settings className="w-5 h-5 mr-3" />
                  Bulk Update
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Slot Modal */}
        {editingSlot && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 border-0 shadow-xl rounded-2xl bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold text-midnight">Edit Time Slot</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setEditingSlot(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <Input 
                    value={editingSlot.time}
                    className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <Input 
                    value={editingSlot.duration}
                    className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select 
                    value={editingSlot.status}
                    className="w-full h-12 rounded-xl border border-gray-300 px-3 focus:border-[#E17726] focus:ring-[#E17726] focus:outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="blocked">Blocked</option>
                    <option value="booked">Booked</option>
                  </select>
                </div>
                {editingSlot.status === 'blocked' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                    <Input 
                      placeholder="Enter reason for blocking"
                      className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                )}
                <div className="flex space-x-4 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setEditingSlot(null)}
                    className="flex-1 border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => setEditingSlot(null)}
                    className="flex-1 bg-[#E17726] hover:bg-[#c9651e] text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSchedule; 