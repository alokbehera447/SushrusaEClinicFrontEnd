import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Clock, 
  Users, 
  Play, 
  Pause, 
  SkipForward,
  CheckCircle,
  AlertCircle,
  Phone,
  Video,
  User,
  Calendar,
  Timer,
  Bell,
  Stethoscope,
  AlertTriangle
} from 'lucide-react';

const QueueManagement = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isQueueActive, setIsQueueActive] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data
  const queueData = [
    {
      id: 'Q001',
      appointmentId: 'APT-2024-001',
      patient: { name: 'Rajesh Kumar', age: 42, phone: '+91 98765 43210' },
      doctor: 'Dr. Priya Singh',
      specialty: 'Cardiology',
      appointmentTime: '10:30 AM',
      status: 'current',
      waitTime: 0,
      priority: 'normal'
    },
    {
      id: 'Q002',
      appointmentId: 'APT-2024-002',
      patient: { name: 'Anita Devi', age: 28, phone: '+91 87654 32109' },
      doctor: 'Dr. Amit Kumar',
      specialty: 'General Medicine',
      appointmentTime: '11:00 AM',
      status: 'waiting',
      waitTime: 15,
      priority: 'normal'
    },
    {
      id: 'Q003',
      appointmentId: 'APT-2024-003',
      patient: { name: 'Suresh Gupta', age: 45, phone: '+91 76543 21098' },
      doctor: 'Dr. Neha Jain',
      specialty: 'Orthopedics',
      appointmentTime: '11:30 AM',
      status: 'waiting',
      waitTime: 30,
      priority: 'urgent'
    },
    {
      id: 'Q004',
      appointmentId: 'APT-2024-004',
      patient: { name: 'Priya Sharma', age: 35, phone: '+91 65432 10987' },
      doctor: 'Dr. Priya Singh',
      specialty: 'Cardiology',
      appointmentTime: '12:00 PM',
      status: 'waiting',
      waitTime: 45,
      priority: 'normal'
    },
    {
      id: 'Q005',
      appointmentId: 'APT-2024-005',
      patient: { name: 'Amit Singh', age: 52, phone: '+91 54321 09876' },
      doctor: 'Dr. Amit Kumar',
      specialty: 'General Medicine',
      appointmentTime: '12:30 PM',
      status: 'waiting',
      waitTime: 60,
      priority: 'normal'
    }
  ];

  const queueStats = {
    totalPatients: queueData.length,
    waiting: queueData.filter(p => p.status === 'waiting').length,
    current: queueData.filter(p => p.status === 'current').length,
    completed: 8,
    avgWaitTime: 25
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-800 border-green-200';
      case 'waiting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'missed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getWaitTimeColor = (waitTime: number) => {
    if (waitTime > 45) return 'text-red-600';
    if (waitTime > 30) return 'text-orange-600';
    return 'text-green-600';
  };

  const callNextPatient = () => {
    // Logic to call next patient
    console.log('Calling next patient...');
  };

  const markCompleted = (patientId: string) => {
    // Logic to mark patient as completed
    console.log('Marking patient as completed:', patientId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-midnight">Queue Management</h1>
              <Badge className={`${isQueueActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isQueueActive ? 'Queue Active' : 'Queue Paused'}
              </Badge>
              <span className="text-gray-600 text-sm">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsQueueActive(!isQueueActive)}
                className={`border-gray-300 ${isQueueActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
              >
                {isQueueActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isQueueActive ? 'Pause Queue' : 'Resume Queue'}
              </Button>
              <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                <Bell className="w-4 h-4 mr-2" />
                Call Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Queue Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Patients</p>
                  <p className="text-2xl font-bold text-midnight">{queueStats.totalPatients}</p>
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
                  <p className="text-sm font-medium text-gray-600 mb-2">Waiting</p>
                  <p className="text-2xl font-bold text-midnight">{queueStats.waiting}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Current</p>
                  <p className="text-2xl font-bold text-midnight">{queueStats.current}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
                  <Video className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Completed</p>
                  <p className="text-2xl font-bold text-midnight">{queueStats.completed}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aqua/10 to-aqua/5 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-aqua" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Avg Wait</p>
                  <p className="text-2xl font-bold text-midnight">{queueStats.avgWaitTime}m</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 flex items-center justify-center">
                  <Timer className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Patient Display */}
        {queueData.find(p => p.status === 'current') && (
          <Card className="border-0 shadow-xl rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 text-white mb-8">
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">NOW CONSULTING</h2>
                <div className="flex items-center justify-center space-x-6">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="bg-white text-green-600 font-bold text-2xl">
                      {queueData.find(p => p.status === 'current')?.patient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold">{queueData.find(p => p.status === 'current')?.patient.name}</h3>
                    <p className="text-lg opacity-90">{queueData.find(p => p.status === 'current')?.doctor}</p>
                    <p className="text-base opacity-75">{queueData.find(p => p.status === 'current')?.specialty}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Queue List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Waiting Queue */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold text-midnight">Patient Queue</CardTitle>
                <Badge className="bg-blue-100 text-blue-800">
                  {queueStats.waiting} Waiting
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {queueData.map((patient, index) => (
                  <div 
                    key={patient.id} 
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      patient.status === 'current' 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-[#E17726]/30 hover:bg-[#E17726]/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Priority Indicator */}
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(patient.priority)} mb-1`}></div>
                          <span className="text-xs font-bold text-gray-600">#{index + 1}</span>
                        </div>
                        
                        {/* Patient Avatar */}
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-[#E17726]/10 text-[#E17726] font-semibold">
                            {patient.patient.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Patient Details */}
                        <div>
                          <h4 className="font-semibold text-midnight">{patient.patient.name}</h4>
                          <p className="text-sm text-gray-600">{patient.doctor} • {patient.specialty}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {patient.appointmentTime}
                            </span>
                            <span className="text-xs text-gray-500">
                              <Phone className="w-3 h-3 inline mr-1" />
                              {patient.patient.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status and Actions */}
                      <div className="flex items-center space-x-4">
                        {/* Wait Time */}
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getWaitTimeColor(patient.waitTime)}`}>
                            {patient.waitTime}m
                          </div>
                          <div className="text-xs text-gray-500">wait time</div>
                        </div>
                        
                        {/* Status Badge */}
                        <Badge className={getStatusColor(patient.status)}>
                          {patient.status}
                        </Badge>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          {patient.status === 'waiting' && index === 0 && (
                            <Button 
                              size="sm" 
                              onClick={callNextPatient}
                              className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                            >
                              <Video className="w-4 h-4 mr-1" />
                              Call
                            </Button>
                          )}
                          {patient.status === 'current' && (
                            <Button 
                              size="sm" 
                              onClick={() => markCompleted(patient.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-gray-300"
                          >
                            <SkipForward className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Doctor Status Panel */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Doctor Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Dr. Priya Singh', specialty: 'Cardiology', status: 'busy', patients: 2 },
                  { name: 'Dr. Amit Kumar', specialty: 'General Medicine', status: 'available', patients: 1 },
                  { name: 'Dr. Neha Jain', specialty: 'Orthopedics', status: 'available', patients: 1 }
                ].map((doctor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-[#E17726]/10 text-[#E17726] font-semibold">
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-midnight text-sm">{doctor.name}</h4>
                        <p className="text-xs text-gray-600">{doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={doctor.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {doctor.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{doctor.patients} patients</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white justify-start h-12 rounded-xl">
                  <Bell className="w-5 h-5 mr-3" />
                  Call Next Patient
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-aqua text-aqua hover:bg-aqua hover:text-white">
                  <User className="w-5 h-5 mr-3" />
                  Add Walk-in Patient
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100">
                  <AlertCircle className="w-5 h-5 mr-3" />
                  Mark Patient Absent
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100">
                  <Stethoscope className="w-5 h-5 mr-3" />
                  Emergency Override
                </Button>
              </CardContent>
            </Card>

            {/* Real-time Updates */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Patient Ramesh completed consultation</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">2 minutes ago</p>
                </div>
                <div className="text-sm">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Clock className="w-4 h-4" />
                    <span>New walk-in patient added</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">5 minutes ago</p>
                </div>
                <div className="text-sm">
                  <div className="flex items-center space-x-2 text-orange-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Patient Sunita marked as urgent</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">8 minutes ago</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueManagement;
