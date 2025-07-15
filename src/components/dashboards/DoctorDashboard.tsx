import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar, 
  Video, 
  FileText, 
  Clock, 
  Users,
  DollarSign,
  Star,
  Activity,
  Settings,
  Search,
  Phone,
  Mail,
  Edit,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Plus,
  Eye
} from 'lucide-react';
import DoctorAvailabilitySlots from '@/components/workflow/DoctorAvailabilitySlots';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedConsultation, setExpandedConsultation] = useState<string | null>(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('2024-01-16');
  const [consultationFilter, setConsultationFilter] = useState('all');
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    type: 'available',
    maxPatients: 1,
    notes: ''
  });

  // Mock data
  const todayStats = [
    { label: 'Today\'s Consultations', value: '12', icon: Video, color: 'text-[#E17726]' },
    { label: 'Scheduled Appointments', value: '6', icon: Calendar, color: 'text-aqua' },
    { label: 'Completed Today', value: '8', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Today\'s Earnings', value: '₹4,800', icon: DollarSign, color: 'text-[#E17726]' },
  ];

  const consultations = [
    { 
      id: 'CON001', 
      patient: { name: 'Rajesh Kumar', age: 42, gender: 'Male' },
      time: '10:30 AM',
      date: '2024-01-15',
      status: 'completed',
      type: 'Follow-up',
      symptoms: 'Chest pain, shortness of breath',
      prescription: {
        id: 'RX001',
        medicines: ['Atorvastatin 20mg', 'Metoprolol 50mg', 'Aspirin 75mg'],
        instructions: 'Take once daily after breakfast',
        status: 'active',
        writtenDate: '2024-01-15'
      }
    },
    { 
      id: 'CON002', 
      patient: { name: 'Priya Sharma', age: 28, gender: 'Female' },
      time: '11:15 AM',
      date: '2024-01-12',
      status: 'completed',
      type: 'New Patient',
      symptoms: 'Fever, headache, body ache',
      prescription: {
        id: 'RX002',
        medicines: ['Paracetamol 500mg', 'Vitamin D3'],
        instructions: 'Take as needed for fever, Vitamin D3 once daily',
        status: 'completed',
        writtenDate: '2024-01-12'
      }
    },
    { 
      id: 'CON003', 
      patient: { name: 'Amit Singh', age: 35, gender: 'Male' },
      time: '12:00 PM',
      date: '2024-01-10',
      status: 'completed',
      type: 'Routine Check',
      symptoms: 'Regular health checkup',
      prescription: null // No prescription for this consultation
    },
    { 
      id: 'CON004', 
      patient: { name: 'Neha Patel', age: 31, gender: 'Female' },
      time: '2:30 PM',
      date: '2024-01-16',
      status: 'scheduled',
      type: 'Follow-up',
      symptoms: 'Diabetes management',
      prescription: null // Consultation not completed yet
    }
  ];

  const scheduleSlots = [
    // January 16, 2024
    {
      id: 'SLOT001',
      date: '2024-01-16',
      startTime: '09:00',
      endTime: '09:30',
      type: 'available',
      maxPatients: 1,
      currentPatients: 0,
      notes: 'Morning consultation slot'
    },
    {
      id: 'SLOT002',
      date: '2024-01-16',
      startTime: '09:30',
      endTime: '10:00',
      type: 'booked',
      maxPatients: 1,
      currentPatients: 1,
      patientName: 'Rajesh Kumar',
      notes: 'Follow-up consultation'
    },
    {
      id: 'SLOT003',
      date: '2024-01-16',
      startTime: '10:00',
      endTime: '10:30',
      type: 'available',
      maxPatients: 1,
      currentPatients: 0,
      notes: 'Available for new patients'
    },
    {
      id: 'SLOT004',
      date: '2024-01-16',
      startTime: '14:00',
      endTime: '14:30',
      type: 'booked',
      maxPatients: 1,
      currentPatients: 1,
      patientName: 'Priya Sharma',
      notes: 'Diabetes management'
    },
    {
      id: 'SLOT005',
      date: '2024-01-16',
      startTime: '15:00',
      endTime: '16:00',
      type: 'break',
      maxPatients: 0,
      currentPatients: 0,
      notes: 'Lunch break'
    },
    {
      id: 'SLOT006',
      date: '2024-01-16',
      startTime: '18:00',
      endTime: '18:30',
      type: 'available',
      maxPatients: 1,
      currentPatients: 0,
      notes: 'Evening consultation'
    },
    // January 17, 2024
    {
      id: 'SLOT007',
      date: '2024-01-17',
      startTime: '09:00',
      endTime: '09:30',
      type: 'booked',
      maxPatients: 1,
      currentPatients: 1,
      patientName: 'Amit Singh',
      notes: 'Routine checkup'
    },
    {
      id: 'SLOT008',
      date: '2024-01-17',
      startTime: '10:00',
      endTime: '10:30',
      type: 'available',
      maxPatients: 1,
      currentPatients: 0,
      notes: 'Available slot'
    },
    {
      id: 'SLOT009',
      date: '2024-01-17',
      startTime: '14:00',
      endTime: '14:30',
      type: 'available',
      maxPatients: 1,
      currentPatients: 0,
      notes: 'Afternoon consultation'
    },
    {
      id: 'SLOT010',
      date: '2024-01-17',
      startTime: '16:00',
      endTime: '17:00',
      type: 'break',
      maxPatients: 0,
      currentPatients: 0,
      notes: 'Tea break'
    },
    // January 18, 2024
    {
      id: 'SLOT011',
      date: '2024-01-18',
      startTime: '09:00',
      endTime: '09:30',
      type: 'available',
      maxPatients: 1,
      currentPatients: 0,
      notes: 'Morning slot'
    },
    {
      id: 'SLOT012',
      date: '2024-01-18',
      startTime: '11:00',
      endTime: '11:30',
      type: 'booked',
      maxPatients: 1,
      currentPatients: 1,
      patientName: 'Neha Patel',
      notes: 'Cardiology consultation'
    },
    {
      id: 'SLOT013',
      date: '2024-01-18',
      startTime: '15:00',
      endTime: '15:30',
      type: 'available',
      maxPatients: 1,
      currentPatients: 0,
      notes: 'Afternoon availability'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'consultations', label: 'Consultations', icon: Video },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'slot-booking', label: 'Slot Booking', icon: Clock },
    { id: 'earnings', label: 'Earnings', icon: DollarSign }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/doctor-avatar-1.svg" 
                alt="Doctor" 
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold text-midnight">Dr. Rajesh Verma</h1>
                <p className="text-sm text-gray-600">Cardiologist • Sushrusa Clinic</p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                Available
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-aqua text-aqua hover:bg-aqua hover:text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Set Schedule
              </Button>
              <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                <Settings className="w-4 h-4 mr-2" />
                Profile Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-white rounded-xl p-2 shadow-sm border border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-[#E17726] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#E17726] hover:bg-[#E17726]/5'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Slot Booking Tab */}
        {activeTab === 'slot-booking' && (
          <DoctorAvailabilitySlots />
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Today's Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {todayStats.map((stat, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                        <p className="text-2xl font-bold text-midnight">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color === 'text-[#E17726]' ? 'from-[#E17726]/10 to-[#E17726]/5' : stat.color === 'text-aqua' ? 'from-aqua/10 to-aqua/5' : 'from-green-500/10 to-green-500/5'} flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Next Consultations & Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Next Consultations */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-bold text-midnight">Next Consultations</CardTitle>
                    <Badge className="bg-[#E17726]/10 text-[#E17726]">
                      {consultations.filter(c => c.status === 'scheduled').length} Pending
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {consultations.map((consultation, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-semibold text-[#E17726]">{consultation.time}</div>
                            <div className="text-xs text-gray-500">{consultation.type}</div>
                          </div>
                          <img 
                            src="/patient-avatar-1.svg" 
                            alt="Patient" 
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <h4 className="font-semibold text-midnight">{consultation.patient.name}</h4>
                            <p className="text-sm text-gray-600">{consultation.patient.age}yr, {consultation.patient.gender}</p>
                            <p className="text-xs text-gray-500">{consultation.symptoms}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(consultation.status)}>
                            {consultation.status.replace('-', ' ')}
                          </Badge>
                          {consultation.status === 'scheduled' && (
                            <Button size="sm" className="bg-aqua hover:bg-aqua/90 text-white">
                              <Video className="w-4 h-4 mr-2" />
                              Join Call
                            </Button>
                          )}
                          {consultation.status === 'in-progress' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Continue
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Performance & Quick Stats */}
              <div className="space-y-6">
                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-midnight">This Week</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Consultations</span>
                      <span className="font-semibold text-midnight">42</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Avg. Rating</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold text-midnight ml-1">4.8</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Earnings</span>
                      <span className="font-semibold text-midnight">₹21,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-semibold text-green-600">98%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-midnight">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white justify-start h-12 rounded-xl">
                      <Video className="w-5 h-5 mr-3" />
                      Join Video Call
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white">
                      <Calendar className="w-5 h-5 mr-3" />
                      Update Schedule
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-aqua text-aqua hover:bg-aqua hover:text-white">
                      <FileText className="w-5 h-5 mr-3" />
                      View Consultations
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Consultations Tab */}
        {activeTab === 'consultations' && (
          <div className="space-y-6">
            {/* Search and Filter Bar */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      placeholder="Search consultations by patient name..." 
                      className="pl-10 h-11 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <Button variant="outline" className="border-gray-300 h-11 px-6 rounded-xl">
                    Filter by Date
                  </Button>
                  <Button variant="outline" className="border-gray-300 h-11 px-6 rounded-xl">
                    Export History
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Consultation Filter Tabs */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={consultationFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setConsultationFilter('all')}
                    className={`${
                      consultationFilter === 'all' 
                        ? 'bg-[#E17726] text-white hover:bg-[#c9651e]' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All Consultations ({consultations.length})
                  </Button>
                  <Button 
                    variant={consultationFilter === 'upcoming' ? 'default' : 'outline'}
                    onClick={() => setConsultationFilter('upcoming')}
                    className={`${
                      consultationFilter === 'upcoming' 
                        ? 'bg-[#E17726] text-white hover:bg-[#c9651e]' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Upcoming ({consultations.filter(c => c.status === 'scheduled').length})
                  </Button>
                  <Button 
                    variant={consultationFilter === 'completed' ? 'default' : 'outline'}
                    onClick={() => setConsultationFilter('completed')}
                    className={`${
                      consultationFilter === 'completed' 
                        ? 'bg-[#E17726] text-white hover:bg-[#c9651e]' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Completed ({consultations.filter(c => c.status === 'completed').length})
                  </Button>
                  <Button 
                    variant={consultationFilter === 'in-progress' ? 'default' : 'outline'}
                    onClick={() => setConsultationFilter('in-progress')}
                    className={`${
                      consultationFilter === 'in-progress' 
                        ? 'bg-[#E17726] text-white hover:bg-[#c9651e]' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    In Progress ({consultations.filter(c => c.status === 'in-progress').length})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Consultations List */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">
                  {consultationFilter === 'all' && 'All Consultations'}
                  {consultationFilter === 'upcoming' && 'Upcoming Consultations'}
                  {consultationFilter === 'completed' && 'Completed Consultations'}
                  {consultationFilter === 'in-progress' && 'In Progress Consultations'}
                </CardTitle>
                <div className="text-sm text-gray-600">
                  {(() => {
                    const filteredConsultations = consultations.filter(c => {
                      if (consultationFilter === 'all') return true;
                      if (consultationFilter === 'upcoming') return c.status === 'scheduled';
                      if (consultationFilter === 'completed') return c.status === 'completed';
                      if (consultationFilter === 'in-progress') return c.status === 'in-progress';
                      return true;
                    });
                    return `${filteredConsultations.length} consultation${filteredConsultations.length !== 1 ? 's' : ''} found`;
                  })()}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {(() => {
                  const filteredConsultations = consultations.filter(consultation => {
                    if (consultationFilter === 'all') return true;
                    if (consultationFilter === 'upcoming') return consultation.status === 'scheduled';
                    if (consultationFilter === 'completed') return consultation.status === 'completed';
                    if (consultationFilter === 'in-progress') return consultation.status === 'in-progress';
                    return true;
                  });

                  if (filteredConsultations.length === 0) {
                    return (
                      <div key="empty-state" className="text-center py-12 text-gray-500">
                        <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">
                          No {consultationFilter === 'all' ? '' : consultationFilter} consultations found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {consultationFilter === 'upcoming' && 'You have no upcoming consultations scheduled.'}
                          {consultationFilter === 'completed' && 'You have no completed consultations yet.'}
                          {consultationFilter === 'in-progress' && 'You have no consultations in progress.'}
                          {consultationFilter === 'all' && 'No consultations found.'}
                        </p>
                        {consultationFilter === 'upcoming' && (
                          <Button 
                            className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                            onClick={() => setActiveTab('schedule')}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Check Schedule
                          </Button>
                        )}
                      </div>
                    );
                  }

                  return filteredConsultations.map((consultation, index) => (
                  <div key={index} className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    {/* Consultation Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-[#E17726]">{consultation.id}</div>
                          <div className="text-xs text-gray-500">{consultation.date}</div>
                          <div className="text-xs text-gray-500">{consultation.time}</div>
                        </div>
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-[#E17726]/10 text-[#E17726] font-semibold">
                            {consultation.patient.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-midnight">{consultation.patient.name}</h4>
                          <p className="text-sm text-gray-600">{consultation.patient.age}yr, {consultation.patient.gender}</p>
                          <p className="text-xs text-gray-500">{consultation.symptoms}</p>
                          <p className="text-xs text-gray-500">{consultation.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(consultation.status)}>
                          {consultation.status.replace('-', ' ')}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white rounded-lg"
                            onClick={() => setExpandedConsultation(expandedConsultation === consultation.id ? null : consultation.id)}
                          >
                            {expandedConsultation === consultation.id ? 'Hide Details' : 'Manage'}
                          </Button>
                          {consultation.status === 'scheduled' && (
                            <Button size="sm" className="bg-aqua hover:bg-aqua/90 text-white rounded-lg">
                              <Video className="w-4 h-4 mr-2" />
                              Join
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Management Section */}
                    {expandedConsultation === consultation.id && (
                      <div className="mt-4 p-6 bg-white rounded-lg border border-gray-200 shadow-lg">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Consultation Details */}
                          <div className="space-y-4">
                            <h5 className="font-semibold text-midnight text-lg border-b pb-2">Consultation Details</h5>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Patient Name:</span>
                                <span className="font-medium">{consultation.patient.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Age & Gender:</span>
                                <span className="font-medium">{consultation.patient.age}yr, {consultation.patient.gender}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Consultation Type:</span>
                                <span className="font-medium">{consultation.type}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Date & Time:</span>
                                <span className="font-medium">{consultation.date} at {consultation.time}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <Badge className={getStatusColor(consultation.status)}>
                                  {consultation.status.replace('-', ' ')}
                                </Badge>
                              </div>
                              <div>
                                <span className="text-gray-600">Symptoms:</span>
                                <p className="font-medium mt-1">{consultation.symptoms}</p>
                              </div>
                            </div>
                          </div>

                          {/* Prescription Management */}
                          <div className="space-y-4">
                            <h5 className="font-semibold text-midnight text-lg border-b pb-2">Prescription Management</h5>
                            
                            {consultation.prescription ? (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h6 className="font-medium text-midnight">Prescription {consultation.prescription.id}</h6>
                                  <Badge className={`${
                                    consultation.prescription.status === 'active' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {consultation.prescription.status}
                                  </Badge>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <div className="space-y-3">
                                    <div>
                                      <p className="font-medium text-gray-700 mb-2">Medicines:</p>
                                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                                        {consultation.prescription.medicines.map((medicine, idx) => (
                                          <li key={idx}>{medicine}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-700 mb-2">Instructions:</p>
                                      <p className="text-gray-600">{consultation.prescription.instructions}</p>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Written on: {consultation.prescription.writtenDate}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <Button size="sm" className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Prescription
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-aqua text-aqua hover:bg-aqua hover:text-white">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Download PDF
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark Complete
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Discontinue
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                  <div className="flex items-center mb-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                                    <span className="text-yellow-800 font-medium">No prescription written</span>
                                  </div>
                                  <p className="text-yellow-700 text-sm">Write a prescription for this consultation to provide medication and treatment instructions.</p>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                  <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Write New Prescription
                                  </Button>
                                  <Button variant="outline" className="border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Use Template
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Additional Actions */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h5 className="font-semibold text-midnight mb-3">Additional Actions</h5>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                              <Video className="w-4 h-4 mr-2" />
                              Schedule Follow-up
                            </Button>
                            <Button size="sm" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white">
                              <FileText className="w-4 h-4 mr-2" />
                              Add Notes
                            </Button>
                            <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Reviewed
                            </Button>
                            <Button size="sm" variant="outline" className="border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white">
                              <Settings className="w-4 h-4 mr-2" />
                              Export Data
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ));
                })()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-8">
            {/* Schedule Management Header */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold text-midnight">Schedule Management</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                    onClick={() => {
                      setNewSlot({
                        ...newSlot,
                        date: selectedDate
                      });
                      setShowAddSlot(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Availability Slot
                  </Button>
                  <Button variant="outline" className="border-aqua text-aqua hover:bg-aqua hover:text-white">
                    <Settings className="w-4 h-4 mr-2" />
                    Schedule Settings
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Schedule Filter and Display */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CardTitle className="text-xl font-bold text-midnight">Schedule</CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const today = new Date();
                          setSelectedDate(today.toISOString().split('T')[0]);
                        }}
                        className="border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white"
                      >
                        Today
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          setSelectedDate(tomorrow.toISOString().split('T')[0]);
                        }}
                        className="border-aqua text-aqua hover:bg-aqua hover:text-white"
                      >
                        Tomorrow
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Or select date:</label>
                      <Input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-40"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-[#E17726]/10 text-[#E17726]">
                    {scheduleSlots.filter(slot => slot.date === selectedDate && slot.type === 'available').length} Available
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    {scheduleSlots.filter(slot => slot.date === selectedDate && slot.type === 'booked').length} Booked
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-midnight mb-2">
                    Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  {scheduleSlots.filter(slot => slot.date === selectedDate).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No slots scheduled for this date</p>
                      <Button 
                        className="mt-2 bg-[#E17726] hover:bg-[#c9651e] text-white"
                        onClick={() => setShowAddSlot(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Slots for This Date
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {scheduleSlots
                    .filter(slot => slot.date === selectedDate)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((slot, index) => (
                    <div 
                      key={slot.id} 
                      className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                        slot.type === 'available' 
                          ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                          : slot.type === 'booked' 
                          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="font-semibold text-midnight">{slot.startTime} - {slot.endTime}</div>
                            <div className="text-sm text-gray-500">
                              {slot.maxPatients} patient{slot.maxPatients > 1 ? 's' : ''} max
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge className={`${
                                slot.type === 'available' 
                                  ? 'bg-green-100 text-green-800' 
                                  : slot.type === 'booked' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {slot.type === 'available' ? 'Available' : slot.type === 'booked' ? 'Booked' : 'Break'}
                              </Badge>
                              {slot.type === 'booked' && (
                                <span className="text-sm text-blue-600 font-medium">{slot.patientName}</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{slot.notes}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {slot.type === 'available' && (
                            <Button size="sm" variant="outline" className="border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add Slot Modal */}
            {showAddSlot && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-midnight">Add Availability Slot</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAddSlot(false)}
                      className="border-gray-300"
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <Input 
                        type="date" 
                        value={newSlot.date}
                        onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                        <Input 
                          type="time" 
                          value={newSlot.startTime}
                          onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                        <Input 
                          type="time" 
                          value={newSlot.endTime}
                          onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Slot Type</label>
                      <select 
                        value={newSlot.type}
                        onChange={(e) => setNewSlot({...newSlot, type: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-[#E17726] focus:ring-[#E17726]"
                      >
                        <option value="available">Available for Consultation</option>
                        <option value="break">Break Time</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>
                    
                    {newSlot.type === 'available' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Patients</label>
                        <Input 
                          type="number" 
                          min="1" 
                          max="5"
                          value={newSlot.maxPatients}
                          onChange={(e) => setNewSlot({...newSlot, maxPatients: parseInt(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                      <textarea 
                        value={newSlot.notes}
                        onChange={(e) => setNewSlot({...newSlot, notes: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-[#E17726] focus:ring-[#E17726]"
                        rows={3}
                        placeholder="Add any notes about this slot..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddSlot(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-[#E17726] hover:bg-[#c9651e] text-white flex-1"
                      onClick={() => {
                        // Here you would add the slot to the schedule
                        console.log('Adding slot:', newSlot);
                        setShowAddSlot(false);
                        setNewSlot({
                          date: '',
                          startTime: '',
                          endTime: '',
                          type: 'available',
                          maxPatients: 1,
                          notes: ''
                        });
                      }}
                    >
                      Add Slot
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Slot Details Modal */}
            {selectedSlot && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-midnight">Slot Details</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedSlot(null)}
                      className="border-gray-300"
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <p className="text-midnight font-medium">{selectedSlot.date}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Time</label>
                        <p className="text-midnight font-medium">{selectedSlot.startTime} - {selectedSlot.endTime}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <Badge className={`${
                          selectedSlot.type === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : selectedSlot.type === 'booked' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedSlot.type === 'available' ? 'Available' : selectedSlot.type === 'booked' ? 'Booked' : 'Break'}
                        </Badge>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Max Patients</label>
                        <p className="text-midnight font-medium">{selectedSlot.maxPatients}</p>
                      </div>
                    </div>
                    
                    {selectedSlot.type === 'booked' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Booked Patient</label>
                        <p className="text-midnight font-medium">{selectedSlot.patientName}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="text-gray-600">{selectedSlot.notes}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedSlot(null)}
                      className="flex-1"
                    >
                      Close
                    </Button>
                    {selectedSlot.type === 'available' && (
                      <Button 
                        className="bg-[#E17726] hover:bg-[#c9651e] text-white flex-1"
                        onClick={() => {
                          // Here you would edit the slot
                          console.log('Editing slot:', selectedSlot);
                          setSelectedSlot(null);
                        }}
                      >
                        Edit Slot
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="space-y-8">
            {/* Earnings Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Total Consultations</p>
                      <p className="text-3xl font-bold text-midnight">156</p>
                      <p className="text-sm text-green-600 mt-1">+12% this month</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E17726]/10 to-[#E17726]/5 flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#E17726]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Total Earnings</p>
                      <p className="text-3xl font-bold text-midnight">₹78,000</p>
                      <p className="text-sm text-green-600 mt-1">+8% this month</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Avg. per Consultation</p>
                      <p className="text-3xl font-bold text-midnight">₹500</p>
                      <p className="text-sm text-aqua mt-1">Standard rate</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aqua/10 to-aqua/5 flex items-center justify-center">
                      <Star className="w-6 h-6 text-aqua" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Earnings Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-midnight">Monthly Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-midnight">January 2024</p>
                      <p className="text-sm text-gray-600">42 consultations</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#E17726]">₹21,000</p>
                      <p className="text-sm text-green-600">+15%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-midnight">December 2023</p>
                      <p className="text-sm text-gray-600">38 consultations</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#E17726]">₹19,000</p>
                      <p className="text-sm text-gray-600">-2%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-midnight">November 2023</p>
                      <p className="text-sm text-gray-600">45 consultations</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#E17726]">₹22,500</p>
                      <p className="text-sm text-green-600">+8%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-midnight">Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-800">Received Payments</p>
                        <p className="text-sm text-green-600">Last 30 days</p>
                      </div>
                    </div>
                    <p className="font-bold text-green-800">₹68,500</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-semibold text-yellow-800">Pending Payments</p>
                        <p className="text-sm text-yellow-600">Processing</p>
                      </div>
                    </div>
                    <p className="font-bold text-yellow-800">₹9,500</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-blue-800">Next Payout</p>
                        <p className="text-sm text-blue-600">15th February</p>
                      </div>
                    </div>
                    <p className="font-bold text-blue-800">₹9,500</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Other tabs placeholder */}
        {!['overview', 'consultations', 'schedule', 'earnings'].includes(activeTab) && (
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-2xl font-bold text-midnight mb-2">
                {tabs.find(t => t.id === activeTab)?.label} Section
              </h3>
              <p className="text-gray-600">This section is under development and will be available soon.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard; 