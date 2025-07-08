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
  PlayCircle
} from 'lucide-react';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

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
      status: 'scheduled',
      type: 'Follow-up',
      symptoms: 'Chest pain, shortness of breath'
    },
    { 
      id: 'CON002', 
      patient: { name: 'Priya Sharma', age: 28, gender: 'Female' },
      time: '11:15 AM',
      status: 'in-progress',
      type: 'New Patient',
      symptoms: 'Fever, headache, body ache'
    },
    { 
      id: 'CON003', 
      patient: { name: 'Amit Singh', age: 35, gender: 'Male' },
      time: '12:00 PM',
      status: 'completed',
      type: 'Routine Check',
      symptoms: 'Regular health checkup'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'consultations', label: 'Consultations', icon: Video },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
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
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-[#E17726] text-white font-semibold">
                  DR
                </AvatarFallback>
              </Avatar>
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
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-[#E17726]/10 text-[#E17726] font-semibold">
                              {consultation.patient.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
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
                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-aqua text-aqua hover:bg-aqua hover:text-white">
                      <FileText className="w-5 h-5 mr-3" />
                      Write Prescription
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white">
                      <Calendar className="w-5 h-5 mr-3" />
                      Update Schedule
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

            {/* Consultations List */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">All Consultations</CardTitle>
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
                          {consultation.patient.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
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
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="rounded-lg">
                          View History
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
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Other tabs placeholder */}
        {activeTab !== 'overview' && activeTab !== 'consultations' && (
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