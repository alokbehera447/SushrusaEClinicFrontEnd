import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PatientRegistrationForm from '@/components/forms/PatientRegistrationForm';
import AppointmentBookingForm from '@/components/forms/AppointmentBookingForm';
import PaymentProcessingForm from '@/components/forms/PaymentProcessingForm';
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

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Mock data
  const todayStats = [
    { label: 'Today\'s Appointments', value: '24', icon: Calendar, color: 'text-[#E17726]' },
    { label: 'Walk-in Patients', value: '8', icon: Users, color: 'text-aqua' },
    { label: 'Consultations Done', value: '18', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Revenue Today', value: '₹12,450', icon: DollarSign, color: 'text-[#E17726]' },
  ];

  const appointments = [
    { 
      id: 'APT001', 
      patient: { name: 'Rahul Sharma', phone: '+91 98765 43210', age: 34 },
      doctor: 'Dr. Priya Singh',
      specialty: 'Cardiology',
      time: '10:30 AM',
      status: 'scheduled',
      fee: 500
    },
    { 
      id: 'APT002', 
      patient: { name: 'Anita Devi', phone: '+91 87654 32109', age: 28 },
      doctor: 'Dr. Amit Kumar',
      specialty: 'General Medicine',
      time: '11:15 AM',
      status: 'in-progress',
      fee: 400
    },
    { 
      id: 'APT003', 
      patient: { name: 'Suresh Gupta', phone: '+91 76543 21098', age: 45 },
      doctor: 'Dr. Neha Jain',
      specialty: 'Orthopedics',
      time: '12:00 PM',
      status: 'completed',
      fee: 600
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'consultations', label: 'Consultations', icon: Video }
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
                            <Button size="sm" className="bg-aqua hover:bg-aqua/90 text-white">
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
                  <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100">
                    <FileText className="w-5 h-5 mr-3" />
                    Print Prescription
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
                          <Button size="sm" className="bg-aqua hover:bg-aqua/90 text-white rounded-lg">
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
                <AppointmentBookingForm />
              </div>
            )}
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            {!showPatientForm ? (
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold text-midnight">Patient Management</CardTitle>
                  <Button 
                    onClick={() => setShowPatientForm(true)}
                    className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register New Patient
                  </Button>
                </CardHeader>
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-2xl font-bold text-midnight mb-2">Patient Management</h3>
                  <p className="text-gray-600 mb-6">Register new patients, view patient records, and manage patient information.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <Button 
                      onClick={() => setShowPatientForm(true)}
                      variant="outline" 
                      className="h-20 flex-col space-y-2 border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white"
                    >
                      <UserPlus className="w-6 h-6" />
                      <span>New Patient</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Search className="w-6 h-6" />
                      <span>Search Patients</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <FileText className="w-6 h-6" />
                      <span>Patient Records</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold text-midnight">Payment Processing</CardTitle>
                  <Button 
                    onClick={() => setShowPaymentForm(true)}
                    className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Process Payment
                  </Button>
                </CardHeader>
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">💳</div>
                  <h3 className="text-2xl font-bold text-midnight mb-2">Payment Processing</h3>
                  <p className="text-gray-600 mb-6">Process payments, generate invoices, and manage billing.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <Button 
                      onClick={() => setShowPaymentForm(true)}
                      variant="outline" 
                      className="h-20 flex-col space-y-2 border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white"
                    >
                      <CreditCard className="w-6 h-6" />
                      <span>Process Payment</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <FileText className="w-6 h-6" />
                      <span>Generate Invoice</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <DollarSign className="w-6 h-6" />
                      <span>Payment History</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📹</div>
              <h3 className="text-2xl font-bold text-midnight mb-2">Video Consultations</h3>
              <p className="text-gray-600 mb-6">Manage video consultations and virtual appointments.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <Button variant="outline" className="h-20 flex-col space-y-2 border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white">
                  <Video className="w-6 h-6" />
                  <span>Start Consultation</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Calendar className="w-6 h-6" />
                  <span>Schedule Video Call</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Clock className="w-6 h-6" />
                  <span>Consultation History</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 