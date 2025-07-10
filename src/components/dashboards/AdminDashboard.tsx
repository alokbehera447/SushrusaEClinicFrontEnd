import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PatientRegistrationForm from '@/components/forms/PatientRegistrationForm';
import AppointmentBookingForm from '@/components/forms/AppointmentBookingForm';
import PaymentProcessingForm from '@/components/forms/PaymentProcessingForm';
import PrescriptionWriterForm from '@/components/forms/PrescriptionWriterForm';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  FileText, 
  Clock, 
  Video,
  Plus,
  Search,
  Filter,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Activity,
  DollarSign,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-4">
                An error occurred while loading the dashboard. Please refresh the page to try again.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-[#E17726] hover:bg-[#c9651e] text-white"
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  // Shared state for appointments and consultations
  const [appointments, setAppointments] = useState([
    { 
      id: 'APT001', 
      patient: { name: 'Rahul Sharma', phone: '+91 98765 43210', age: 34 },
      doctor: 'Dr. Priya Singh',
      specialty: 'Cardiology',
      time: '10:30 AM',
      date: '2024-01-16',
      status: 'scheduled',
      fee: 500,
      consultationType: 'in-person',
      reason: 'Chest pain and shortness of breath'
    },
    { 
      id: 'APT002', 
      patient: { name: 'Anita Devi', phone: '+91 87654 32109', age: 28 },
      doctor: 'Dr. Amit Kumar',
      specialty: 'General Medicine',
      time: '11:15 AM',
      date: '2024-01-16',
      status: 'in-progress',
      fee: 400,
      consultationType: 'video',
      reason: 'Diabetes management follow-up'
    },
    { 
      id: 'APT003', 
      patient: { name: 'Suresh Gupta', phone: '+91 76543 21098', age: 45 },
      doctor: 'Dr. Neha Jain',
      specialty: 'Orthopedics',
      time: '12:00 PM',
      date: '2024-01-16',
      status: 'completed',
      fee: 600,
      consultationType: 'in-person',
      reason: 'Knee pain evaluation'
    }
  ]);

  const [consultations, setConsultations] = useState([
    { 
      id: 'CON001', 
      appointmentId: 'APT002',
      patient: 'Anita Devi', 
      doctor: 'Dr. Amit Kumar',
      time: '2:30 PM - 3:00 PM',
      status: 'ongoing',
      duration: '15 min',
      type: 'video',
      startTime: '14:30'
    },
    { 
      id: 'CON002', 
      appointmentId: 'APT004',
      patient: 'Priya Patel', 
      doctor: 'Dr. Ramesh Kumar',
      time: '3:00 PM - 3:30 PM',
      status: 'waiting',
      duration: '30 min',
      type: 'video',
      startTime: '15:00'
    },
    { 
      id: 'CON003', 
      appointmentId: 'APT005',
      patient: 'Rajesh Kumar', 
      doctor: 'Dr. Neha Jain',
      time: '3:30 PM - 4:00 PM',
      status: 'scheduled',
      duration: '30 min',
      type: 'phone',
      startTime: '15:30'
    }
  ]);

  // Mock data
  const todayStats = [
    { label: 'Today\'s Appointments', value: '24', icon: Calendar, color: 'text-[#E17726]' },
    { label: 'Walk-in Patients', value: '8', icon: Users, color: 'text-aqua' },
    { label: 'Consultations Done', value: '18', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Revenue Today', value: '₹12,450', icon: DollarSign, color: 'text-[#E17726]' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'consultations', label: 'Consultations', icon: Video },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText }
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

  // Function to add new appointment
  const addAppointment = (appointmentData: any) => {
    try {
      const newAppointment = {
        id: `APT${String(appointments.length + 1).padStart(3, '0')}`,
        ...appointmentData,
        status: 'scheduled'
      };
      setAppointments([...appointments, newAppointment]);
      setShowAppointmentForm(false);
    } catch (error) {
      console.error('Error adding appointment:', error);
      alert('An error occurred while adding the appointment. Please try again.');
    }
  };

  // Function to start consultation from appointment
  const startConsultation = (appointmentId: string) => {
    try {
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (!appointment) return;

      // Update appointment status
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: 'in-progress' } : apt
      ));

      // Create consultation
      const newConsultation = {
        id: `CON${String(consultations.length + 1).padStart(3, '0')}`,
        appointmentId: appointmentId,
        patient: appointment.patient.name,
        doctor: appointment.doctor,
        time: `${appointment.time} - ${getEndTime(appointment.time)}`,
        status: 'ongoing',
        duration: '30 min',
        type: appointment.consultationType === 'video' ? 'video' : 
              appointment.consultationType === 'phone' ? 'phone' : 'in-person',
        startTime: appointment.time
      };
      setConsultations([...consultations, newConsultation]);
      
      // Switch to consultations tab
      setActiveTab('consultations');
    } catch (error) {
      console.error('Error starting consultation:', error);
      alert('An error occurred while starting the consultation. Please try again.');
    }
  };

  // Function to end consultation
  const endConsultation = (consultationId: string) => {
    try {
      const consultation = consultations.find(con => con.id === consultationId);
      if (!consultation) return;

      // Update consultation status
      setConsultations(consultations.map(con => 
        con.id === consultationId ? { ...con, status: 'completed' } : con
      ));

      // Update corresponding appointment status
      setAppointments(appointments.map(apt => 
        apt.id === consultation.appointmentId ? { ...apt, status: 'completed' } : apt
      ));
    } catch (error) {
      console.error('Error ending consultation:', error);
      alert('An error occurred while ending the consultation. Please try again.');
    }
  };

  // Helper function to calculate end time
  const getEndTime = (startTime: string) => {
    const [time, period] = startTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let endHours = hours + 1;
    let endPeriod = period;
    if (endHours > 12) {
      endHours = 1;
      endPeriod = period === 'AM' ? 'PM' : 'AM';
    }
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${endPeriod}`;
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-midnight">Admin Dashboard</h1>
                <Badge className="bg-aqua/10 text-aqua border-aqua/20">
                  Sushrusa Clinic - Delhi
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register Patient
                </Button>
                <Button variant="outline" className="border-aqua text-aqua hover:bg-aqua hover:text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
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

              {/* Today's Appointments & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Today's Appointments */}
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-xl font-bold text-midnight">Today's Appointments</CardTitle>
                      <Button size="sm" className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Book New
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {appointments.map((appointment, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-[#E17726]/10 text-[#E17726] font-semibold">
                                {appointment.patient.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-midnight">{appointment.patient.name}</h4>
                              <p className="text-sm text-gray-600">{appointment.doctor} • {appointment.specialty}</p>
                              <p className="text-xs text-gray-500">{appointment.time} • ₹{appointment.fee}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status.replace('-', ' ')}
                            </Badge>
                            {appointment.status === 'scheduled' && (
                              <Button 
                                size="sm" 
                                className="bg-aqua hover:bg-aqua/90 text-white"
                                onClick={() => startConsultation(appointment.id)}
                              >
                                <Video className="w-4 h-4 mr-2" />
                                Start
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-midnight">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white justify-start h-12 rounded-xl">
                      <UserPlus className="w-5 h-5 mr-3" />
                      Register New Patient
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-aqua text-aqua hover:bg-aqua hover:text-white">
                      <Calendar className="w-5 h-5 mr-3" />
                      Book Appointment
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white">
                      <CreditCard className="w-5 h-5 mr-3" />
                      Process Payment
                    </Button>
                    <Button 
                      onClick={() => setShowPrescriptionForm(true)}
                      variant="outline" 
                      className="w-full justify-start h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      <FileText className="w-5 h-5 mr-3" />
                      Write Prescription
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              {!showAppointmentForm ? (
                <>
                {/* Search and Actions Bar */}
                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input 
                          placeholder="Search appointments by patient name, ID..." 
                          className="pl-10 h-11 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                        />
                      </div>
                      <Button variant="outline" className="border-gray-300 h-11 px-6 rounded-xl">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                      <Button 
                        onClick={() => setShowAppointmentForm(true)}
                        className="bg-[#E17726] hover:bg-[#c9651e] text-white h-11 px-6 rounded-xl"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Appointments List */}
                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-midnight">All Appointments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {appointments.map((appointment, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-semibold text-[#E17726]">{appointment.id}</div>
                            <div className="text-xs text-gray-500">{appointment.time}</div>
                          </div>
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-[#E17726]/10 text-[#E17726] font-semibold">
                              {appointment.patient.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-midnight">{appointment.patient.name}</h4>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {appointment.patient.phone}
                            </p>
                            <p className="text-sm text-gray-600">{appointment.doctor} • {appointment.specialty}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="font-semibold text-midnight">₹{appointment.fee}</div>
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="rounded-lg">
                              Edit
                            </Button>
                            {appointment.status === 'scheduled' && (
                              <Button 
                                size="sm" 
                                className="bg-aqua hover:bg-aqua/90 text-white rounded-lg"
                                onClick={() => startConsultation(appointment.id)}
                              >
                                <Video className="w-4 h-4 mr-2" />
                                Start
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-midnight">Book New Appointment</h2>
                    <Button 
                      onClick={() => setShowAppointmentForm(false)}
                      variant="outline"
                    >
                      Back to Appointments
                    </Button>
                  </div>
                  <div className="w-full">
                    <AppointmentBookingForm onAppointmentCreated={addAppointment} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Patients Tab */}
          {activeTab === 'patients' && (
            <div className="space-y-6">
              {!showPatientForm ? (
                <>
                  {/* Patient Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Total Patients</p>
                            <p className="text-2xl font-bold text-midnight">1,247</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E17726]/10 to-[#E17726]/5 flex items-center justify-center">
                            <Users className="w-6 h-6 text-[#E17726]" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">New This Month</p>
                            <p className="text-2xl font-bold text-midnight">89</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
                            <UserPlus className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Active Cases</p>
                            <p className="text-2xl font-bold text-midnight">156</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Follow-ups Due</p>
                            <p className="text-2xl font-bold text-midnight">23</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-yellow-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Search and Actions Bar */}
                  <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input 
                            placeholder="Search patients by name, ID, phone..." 
                            className="pl-10 h-11 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                          />
                        </div>
                        <Button variant="outline" className="border-gray-300 h-11 px-6 rounded-xl">
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                        <Button 
                          onClick={() => setShowPatientForm(true)}
                          className="bg-[#E17726] hover:bg-[#c9651e] text-white h-11 px-6 rounded-xl"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Register Patient
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Patient List */}
                  <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-midnight">Patient Records</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { 
                          id: 'PAT001', 
                          name: 'Rahul Sharma', 
                          age: 34, 
                          gender: 'Male',
                          phone: '+91 98765 43210',
                          lastVisit: '2024-01-15',
                          condition: 'Hypertension',
                          status: 'active'
                        },
                        { 
                          id: 'PAT002', 
                          name: 'Anita Devi', 
                          age: 28, 
                          gender: 'Female',
                          phone: '+91 87654 32109',
                          lastVisit: '2024-01-14',
                          condition: 'Diabetes',
                          status: 'follow-up'
                        },
                        { 
                          id: 'PAT003', 
                          name: 'Suresh Gupta', 
                          age: 45, 
                          gender: 'Male',
                          phone: '+91 76543 21098',
                          lastVisit: '2024-01-10',
                          condition: 'Arthritis',
                          status: 'recovered'
                        },
                        { 
                          id: 'PAT004', 
                          name: 'Priya Patel', 
                          age: 31, 
                          gender: 'Female',
                          phone: '+91 65432 10987',
                          lastVisit: '2024-01-16',
                          condition: 'Migraine',
                          status: 'active'
                        }
                      ].map((patient, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-sm font-semibold text-[#E17726]">{patient.id}</div>
                              <div className="text-xs text-gray-500">Age: {patient.age}</div>
                            </div>
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-[#E17726]/10 text-[#E17726] font-semibold">
                                {patient.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-midnight">{patient.name}</h4>
                              <p className="text-sm text-gray-600 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {patient.phone}
                              </p>
                              <p className="text-sm text-gray-600">{patient.gender} • Last visit: {patient.lastVisit}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="font-semibold text-midnight">{patient.condition}</div>
                              <Badge className={
                                patient.status === 'active' ? 'bg-green-100 text-green-800' :
                                patient.status === 'follow-up' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }>
                                {patient.status}
                              </Badge>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="rounded-lg">
                                <FileText className="w-4 h-4 mr-2" />
                                Records
                              </Button>
                              <Button size="sm" className="bg-aqua hover:bg-aqua/90 text-white rounded-lg">
                                <Calendar className="w-4 h-4 mr-2" />
                                Book
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-midnight">Register New Patient</h2>
                    <Button 
                      onClick={() => setShowPatientForm(false)}
                      variant="outline"
                    >
                      Back to Patient Management
                    </Button>
                  </div>
                  <PatientRegistrationForm />
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              {!showPaymentForm ? (
                <>
                  {/* Payment Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Today's Revenue</p>
                            <p className="text-2xl font-bold text-midnight">₹18,450</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E17726]/10 to-[#E17726]/5 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-[#E17726]" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Pending Payments</p>
                            <p className="text-2xl font-bold text-midnight">₹5,670</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Completed Today</p>
                            <p className="text-2xl font-bold text-midnight">24</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Cash Payments</p>
                            <p className="text-2xl font-bold text-midnight">₹12,780</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Search and Actions Bar */}
                  <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input 
                            placeholder="Search payments by patient name, transaction ID..." 
                            className="pl-10 h-11 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                          />
                        </div>
                        <Button variant="outline" className="border-gray-300 h-11 px-6 rounded-xl">
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                        <Button 
                          onClick={() => setShowPaymentForm(true)}
                          className="bg-[#E17726] hover:bg-[#c9651e] text-white h-11 px-6 rounded-xl"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Process Payment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Transactions */}
                  <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-midnight">Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { 
                          id: 'TXN001', 
                          patient: 'Rahul Sharma', 
                          amount: 800,
                          method: 'Card',
                          status: 'completed',
                          time: '2:45 PM',
                          type: 'Consultation',
                          doctor: 'Dr. Priya Singh'
                        },
                        { 
                          id: 'TXN002', 
                          patient: 'Anita Devi', 
                          amount: 1200,
                          method: 'UPI',
                          status: 'completed',
                          time: '2:30 PM',
                          type: 'Medicine + Consultation',
                          doctor: 'Dr. Amit Kumar'
                        },
                        { 
                          id: 'TXN003', 
                          patient: 'Suresh Gupta', 
                          amount: 600,
                          method: 'Cash',
                          status: 'pending',
                          time: '2:15 PM',
                          type: 'Consultation',
                          doctor: 'Dr. Neha Jain'
                        },
                        { 
                          id: 'TXN004', 
                          patient: 'Priya Patel', 
                          amount: 450,
                          method: 'Card',
                          status: 'completed',
                          time: '1:50 PM',
                          type: 'Follow-up',
                          doctor: 'Dr. Ramesh Kumar'
                        }
                      ].map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-sm font-semibold text-[#E17726]">{transaction.id}</div>
                              <div className="text-xs text-gray-500">{transaction.time}</div>
                            </div>
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-[#E17726]/10 text-[#E17726] font-semibold">
                                {transaction.patient.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-midnight">{transaction.patient}</h4>
                              <p className="text-sm text-gray-600">{transaction.type}</p>
                              <p className="text-sm text-gray-600">{transaction.doctor}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="font-semibold text-midnight text-lg">₹{transaction.amount}</div>
                              <div className="text-sm text-gray-600">{transaction.method}</div>
                              <Badge className={
                                transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {transaction.status}
                              </Badge>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="rounded-lg">
                                <FileText className="w-4 h-4 mr-2" />
                                Receipt
                              </Button>
                              {transaction.status === 'pending' && (
                                <Button size="sm" className="bg-[#E17726] hover:bg-[#c9651e] text-white rounded-lg">
                                  Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-midnight">Process Payment</h2>
                    <Button 
                      onClick={() => setShowPaymentForm(false)}
                      variant="outline"
                    >
                      Back to Payment Processing
                    </Button>
                  </div>
                  <PaymentProcessingForm />
                </div>
              )}
            </div>
          )}

          {/* Consultations Tab */}
          {activeTab === 'consultations' && (
            <div className="space-y-6">
              {/* Active Consultations */}
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold text-midnight">Active Consultations</CardTitle>
                  <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                    <Video className="w-4 h-4 mr-2" />
                    Start New Consultation
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {consultations.map((consultation, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-[#E17726]">{consultation.id}</div>
                          <div className="text-xs text-gray-500">{consultation.time}</div>
                        </div>
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-[#E17726]/10 text-[#E17726] font-semibold">
                            {consultation.patient.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-midnight">{consultation.patient}</h4>
                          <p className="text-sm text-gray-600">{consultation.doctor}</p>
                          <p className="text-xs text-gray-500 flex items-center">
                            {consultation.type === 'video' ? <Video className="w-3 h-3 mr-1" /> : <Phone className="w-3 h-3 mr-1" />}
                            {consultation.duration} • {consultation.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={
                          consultation.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                          consultation.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {consultation.status}
                        </Badge>
                        <div className="flex space-x-2">
                          {consultation.status === 'ongoing' && (
                            <Button 
                              size="sm" 
                              className="bg-red-500 hover:bg-red-600 text-white rounded-lg"
                              onClick={() => endConsultation(consultation.id)}
                            >
                              End Call
                            </Button>
                          )}
                          {consultation.status === 'waiting' && (
                            <Button size="sm" className="bg-aqua hover:bg-aqua/90 text-white rounded-lg">
                              <Video className="w-4 h-4 mr-2" />
                              Join
                            </Button>
                          )}
                          {consultation.status === 'scheduled' && (
                            <Button size="sm" className="bg-[#E17726] hover:bg-[#c9651e] text-white rounded-lg">
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Consultation Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Today's Consultations</p>
                        <p className="text-2xl font-bold text-midnight">12</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center">
                        <Video className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Average Duration</p>
                        <p className="text-2xl font-bold text-midnight">24 min</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Patient Satisfaction</p>
                        <p className="text-2xl font-bold text-midnight">4.8/5</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-midnight">Consultation Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-20 flex-col space-y-2 border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white">
                      <Video className="w-6 h-6" />
                      <span>Start Video Call</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2 border-aqua text-aqua hover:bg-aqua hover:text-white">
                      <Phone className="w-6 h-6" />
                      <span>Start Phone Call</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Calendar className="w-6 h-6" />
                      <span>Schedule Later</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <FileText className="w-6 h-6" />
                      <span>Consultation Notes</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              {!showPrescriptionForm ? (
                <>
                  {/* Prescription Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Today's Prescriptions</p>
                            <p className="text-2xl font-bold text-midnight">18</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E17726]/10 to-[#E17726]/5 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-[#E17726]" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Pending Review</p>
                            <p className="text-2xl font-bold text-midnight">3</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">This Month</p>
                            <p className="text-2xl font-bold text-midnight">456</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Digital Sent</p>
                            <p className="text-2xl font-bold text-midnight">89%</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Search and Actions Bar */}
                  <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input 
                            placeholder="Search prescriptions by patient name, prescription ID..." 
                            className="pl-10 h-11 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                          />
                        </div>
                        <Button variant="outline" className="border-gray-300 h-11 px-6 rounded-xl">
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                        <Button 
                          onClick={() => setShowPrescriptionForm(true)}
                          className="bg-[#E17726] hover:bg-[#c9651e] text-white h-11 px-6 rounded-xl"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Write Prescription
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Prescriptions */}
                  <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-midnight">Recent Prescriptions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { 
                          id: 'RX001', 
                          patient: 'Rahul Sharma', 
                          doctor: 'Dr. Priya Singh',
                          medications: 3,
                          date: '2024-01-16',
                          time: '2:45 PM',
                          status: 'sent',
                          condition: 'Hypertension'
                        },
                        { 
                          id: 'RX002', 
                          patient: 'Anita Devi', 
                          doctor: 'Dr. Amit Kumar',
                          medications: 2,
                          date: '2024-01-16',
                          time: '2:30 PM',
                          status: 'pending',
                          condition: 'Diabetes'
                        },
                        { 
                          id: 'RX003', 
                          patient: 'Suresh Gupta', 
                          doctor: 'Dr. Neha Jain',
                          medications: 4,
                          date: '2024-01-16',
                          time: '1:15 PM',
                          status: 'sent',
                          condition: 'Arthritis'
                        },
                        { 
                          id: 'RX004', 
                          patient: 'Priya Patel', 
                          doctor: 'Dr. Ramesh Kumar',
                          medications: 1,
                          date: '2024-01-16',
                          time: '12:50 PM',
                          status: 'printed',
                          condition: 'Migraine'
                        }
                      ].map((prescription, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-sm font-semibold text-[#E17726]">{prescription.id}</div>
                              <div className="text-xs text-gray-500">{prescription.time}</div>
                            </div>
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-[#E17726]/10 text-[#E17726] font-semibold">
                                {prescription.patient.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-midnight">{prescription.patient}</h4>
                              <p className="text-sm text-gray-600">{prescription.doctor}</p>
                              <p className="text-sm text-gray-600">{prescription.condition} • {prescription.medications} medications</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="font-semibold text-midnight">{prescription.date}</div>
                              <Badge className={
                                prescription.status === 'sent' ? 'bg-green-100 text-green-800' :
                                prescription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }>
                                {prescription.status}
                              </Badge>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="rounded-lg">
                                <FileText className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              {prescription.status === 'pending' && (
                                <Button size="sm" className="bg-[#E17726] hover:bg-[#c9651e] text-white rounded-lg">
                                  Send
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-midnight">Write Prescription</h2>
                    <Button 
                      onClick={() => setShowPrescriptionForm(false)}
                      variant="outline"
                    >
                      Back to Prescriptions
                    </Button>
                  </div>
                  <PrescriptionWriterForm />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AdminDashboard; 