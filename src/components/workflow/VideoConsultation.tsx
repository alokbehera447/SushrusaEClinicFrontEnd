import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Settings,
  FileText,
  Clock,
  User,
  Heart,
  Thermometer,
  Activity,
  Plus,
  Send,
  Camera,
  Monitor,
  Volume2,
  VolumeX
} from 'lucide-react';

const VideoConsultation = () => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [activeTab, setActiveTab] = useState('patient-info');

  // Mock data
  const patientInfo = {
    id: 'PAT12345',
    name: 'Rajesh Kumar',
    age: 42,
    gender: 'Male',
    phone: '+91 98765 43210',
    bloodGroup: 'B+',
    allergies: 'Penicillin, Dust',
    appointmentId: 'APT-2024-001',
    symptoms: 'Chest pain, shortness of breath, fatigue',
    duration: '3 days'
  };

  const vitals = [
    { label: 'Blood Pressure', value: '140/90 mmHg', status: 'high' },
    { label: 'Heart Rate', value: '85 bpm', status: 'normal' },
    { label: 'Temperature', value: '98.6°F', status: 'normal' },
    { label: 'Oxygen Saturation', value: '97%', status: 'normal' }
  ];

  const consultationHistory = [
    { date: '2024-01-10', doctor: 'Dr. Amit Kumar', diagnosis: 'Hypertension', prescription: 'Amlodipine 5mg' },
    { date: '2023-12-15', doctor: 'Dr. Priya Singh', diagnosis: 'Routine Checkup', prescription: 'Vitamin D3' }
  ];

  const getVitalStatus = (status: string) => {
    switch (status) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'normal': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'patient-info', label: 'Patient Info', icon: User },
    { id: 'vitals', label: 'Vitals', icon: Activity },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'prescription', label: 'Prescription', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-500 text-white">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                Live Consultation
              </Badge>
              <span className="text-white font-medium">{patientInfo.appointmentId}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">Duration: 00:15:23</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Video Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Main Video Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-3/4">
              {/* Doctor Video */}
              <Card className="border-0 shadow-xl rounded-2xl bg-gray-900 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E17726]/20 to-transparent"></div>
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-[#E17726] text-white">Dr. Priya Singh</Badge>
                </div>
                <div className="absolute bottom-4 right-4 z-10">
                  <div className="flex space-x-2">
                    {!isVideoOn && (
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <VideoOff className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {!isAudioOn && (
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <MicOff className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-center h-full">
                  {isVideoOn ? (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Avatar className="w-32 h-32">
                        <AvatarFallback className="bg-[#E17726] text-white text-4xl font-bold">
                          DR
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  ) : (
                    <div className="text-center text-white">
                      <VideoOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Camera is off</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Patient Video */}
              <Card className="border-0 shadow-xl rounded-2xl bg-gray-900 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-aqua/20 to-transparent"></div>
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-aqua text-white">{patientInfo.name}</Badge>
                </div>
                <div className="flex items-center justify-center h-full">
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <Avatar className="w-32 h-32">
                      <AvatarFallback className="bg-aqua text-white text-4xl font-bold">
                        {patientInfo.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </Card>
            </div>

            {/* Video Controls */}
            <Card className="border-0 shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant={isVideoOn ? "default" : "destructive"}
                    size="lg"
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className="rounded-full w-14 h-14"
                  >
                    {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                  </Button>
                  
                  <Button
                    variant={isAudioOn ? "default" : "destructive"}
                    size="lg"
                    onClick={() => setIsAudioOn(!isAudioOn)}
                    className="rounded-full w-14 h-14"
                  >
                    {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                  </Button>

                  <Button
                    variant={isSpeakerOn ? "default" : "outline"}
                    size="lg"
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                    className="rounded-full w-14 h-14"
                  >
                    {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full w-14 h-14 border-gray-300"
                  >
                    <Monitor className="w-6 h-6" />
                  </Button>

                  <Button
                    variant="destructive"
                    size="lg"
                    className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="grid grid-cols-2 gap-1 bg-white rounded-xl p-1 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                    activeTab === tab.id
                      ? 'bg-[#E17726] text-white shadow-md'
                      : 'text-gray-600 hover:text-[#E17726] hover:bg-[#E17726]/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-1" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <Card className="border-0 shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm flex-1">
              <CardContent className="p-6 h-full overflow-y-auto">
                {/* Patient Info Tab */}
                {activeTab === 'patient-info' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <Avatar className="w-16 h-16 mx-auto mb-3">
                        <AvatarFallback className="bg-[#E17726]/10 text-[#E17726] font-semibold text-lg">
                          {patientInfo.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-midnight">{patientInfo.name}</h3>
                      <p className="text-sm text-gray-600">{patientInfo.id}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Age:</span>
                        <span className="font-medium">{patientInfo.age} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-medium">{patientInfo.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Blood Group:</span>
                        <span className="font-medium">{patientInfo.bloodGroup}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium text-sm">{patientInfo.phone}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-midnight mb-2">Chief Complaints</h4>
                      <p className="text-sm text-gray-700">{patientInfo.symptoms}</p>
                      <p className="text-xs text-gray-500 mt-1">Duration: {patientInfo.duration}</p>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-midnight mb-2">Allergies</h4>
                      <p className="text-sm text-red-600">{patientInfo.allergies}</p>
                    </div>
                  </div>
                )}

                {/* Vitals Tab */}
                {activeTab === 'vitals' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-midnight">Current Vitals</h3>
                    {vitals.map((vital, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-midnight">{vital.label}</p>
                          <p className="text-sm text-gray-600">{vital.value}</p>
                        </div>
                        <Badge className={getVitalStatus(vital.status)}>
                          {vital.status}
                        </Badge>
                      </div>
                    ))}
                    <Button className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Vital
                    </Button>
                  </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-midnight">Consultation History</h3>
                    {consultationHistory.map((consultation, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-midnight">{consultation.date}</p>
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            Completed
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{consultation.doctor}</p>
                        <p className="text-sm font-medium text-midnight">{consultation.diagnosis}</p>
                        <p className="text-xs text-gray-500">{consultation.prescription}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Prescription Tab */}
                {activeTab === 'prescription' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-midnight">Write Prescription</h3>
                    <Textarea
                      placeholder="Enter prescription details..."
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      className="min-h-32 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                    <Button className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white rounded-xl">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Prescription
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Consultation Notes */}
            <Card className="border-0 shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-midnight">Consultation Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Add consultation notes..."
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  className="min-h-24 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                />
                <Button className="w-full bg-aqua hover:bg-aqua/90 text-white rounded-xl">
                  <Send className="w-4 h-4 mr-2" />
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoConsultation;
