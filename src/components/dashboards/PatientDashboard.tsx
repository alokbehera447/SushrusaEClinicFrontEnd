import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar, 
  FileText, 
  Download, 
  Clock, 
  User,
  Heart,
  Star,
  Activity,
  Phone,
  Mail,
  MapPin,
  Edit,
  Eye,
  Search,
  Filter,
  AlertCircle,
  Settings
} from 'lucide-react';

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const patientInfo = {
    name: 'Rajesh Kumar',
    age: 42,
    gender: 'Male',
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@email.com',
    address: 'New Delhi, India',
    bloodGroup: 'B+',
    allergies: 'Penicillin, Dust'
  };

  const consultationHistory = [
    { 
      id: 'CON001', 
      doctor: 'Dr. Priya Singh',
      specialty: 'Cardiology',
      date: '2024-01-15',
      time: '10:30 AM',
      status: 'completed',
      fee: 500,
      rating: 5,
      clinic: 'Sushrusa Clinic - Delhi',
      prescription: {
        id: 'RX001',
        medicines: ['Atorvastatin 20mg', 'Metoprolol 50mg', 'Aspirin 75mg'],
        instructions: 'Take once daily after breakfast',
        status: 'active'
      }
    },
    { 
      id: 'CON002', 
      doctor: 'Dr. Amit Kumar',
      specialty: 'General Medicine',
      date: '2024-01-10',
      time: '2:15 PM',
      status: 'completed',
      fee: 400,
      rating: 4,
      clinic: 'Sushrusa Clinic - Delhi',
      prescription: {
        id: 'RX002',
        medicines: ['Paracetamol 500mg', 'Vitamin D3'],
        instructions: 'Take as needed for fever, Vitamin D3 once daily',
        status: 'completed'
      }
    },
    { 
      id: 'CON003', 
      doctor: 'Dr. Neha Jain',
      specialty: 'Orthopedics',
      date: '2024-01-05',
      time: '11:00 AM',
      status: 'completed',
      fee: 600,
      rating: 5,
      clinic: 'Sushrusa Clinic - Mumbai',
      prescription: null // No prescription for this consultation
    }
  ];



  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'consultations', label: 'Consultations', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/patient-avatar-1.svg" 
                alt="Patient" 
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold text-midnight">{patientInfo.name}</h1>
                <p className="text-sm text-gray-600">Patient ID: PAT12345</p>
              </div>
              <Badge className="bg-[#E17726]/10 text-[#E17726] border-[#E17726]/20">
                Active Patient
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
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
            {/* Health Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Total Consultations</p>
                      <p className="text-3xl font-bold text-midnight">{consultationHistory.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E17726]/10 to-[#E17726]/5 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-[#E17726]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Active Prescriptions</p>
                      <p className="text-3xl font-bold text-midnight">{consultationHistory.filter(c => c.prescription?.status === 'active').length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aqua/10 to-aqua/5 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-aqua" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Avg. Rating Given</p>
                      <div className="flex items-center">
                        <p className="text-3xl font-bold text-midnight mr-2">4.7</p>
                        <Star className="w-6 h-6 text-yellow-500 fill-current" />
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Profile Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Consultations */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-bold text-midnight">Recent Consultations</CardTitle>
                    <Button size="sm" variant="outline" className="border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white">
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {consultationHistory.slice(0, 3).map((consultation, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-semibold text-[#E17726]">{consultation.date}</div>
                            <div className="text-xs text-gray-500">{consultation.time}</div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-midnight">{consultation.doctor}</h4>
                            <p className="text-sm text-gray-600">{consultation.specialty}</p>
                            <p className="text-xs text-gray-500">{consultation.clinic}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="font-semibold text-midnight">₹{consultation.fee}</div>
                            <div className="flex items-center">
                              {renderStars(consultation.rating)}
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="rounded-lg">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Profile Summary */}
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-midnight">Profile Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-[#E17726]" />
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-semibold text-midnight">{patientInfo.age} years</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Heart className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-600">Blood Group</p>
                      <p className="font-semibold text-midnight">{patientInfo.bloodGroup}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-aqua" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-midnight">{patientInfo.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-[#E17726]" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-midnight text-xs">{patientInfo.email}</p>
                    </div>
                  </div>
                  <Button className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white rounded-xl">
                    <Edit className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                </CardContent>
              </Card>
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
                      placeholder="Search consultations by doctor, specialty..." 
                      className="pl-10 h-11 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <Button variant="outline" className="border-gray-300 h-11 px-6 rounded-xl">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter by Date
                  </Button>
                  <Button variant="outline" className="border-gray-300 h-11 px-6 rounded-xl">
                    <Download className="w-4 h-4 mr-2" />
                    Download History
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Consultations List with Prescriptions */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">Consultation History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {consultationHistory.map((consultation, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
                    {/* Consultation Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-[#E17726]">{consultation.id}</div>
                          <div className="text-xs text-gray-500">{consultation.date}</div>
                          <div className="text-xs text-gray-500">{consultation.time}</div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-midnight">{consultation.doctor}</h4>
                          <p className="text-sm text-gray-600">{consultation.specialty}</p>
                          <p className="text-xs text-gray-500">{consultation.clinic}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-semibold text-midnight">₹{consultation.fee}</div>
                          <div className="flex items-center justify-end">
                            {renderStars(consultation.rating)}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="rounded-lg">
                            View Details
                          </Button>
                          <Button size="sm" className="bg-[#E17726] hover:bg-[#c9651e] text-white rounded-lg">
                            <Download className="w-4 h-4 mr-2" />
                            Report
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Prescription Section */}
                    {consultation.prescription ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h5 className="font-semibold text-blue-800">Prescription ({consultation.prescription.id})</h5>
                            <Badge className={getStatusColor(consultation.prescription.status)}>
                              {consultation.prescription.status}
                            </Badge>
                          </div>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-blue-800">Medicines:</p>
                            <ul className="list-disc list-inside text-sm text-blue-700 ml-4 space-y-1">
                              {consultation.prescription.medicines.map((medicine, idx) => (
                                <li key={idx}>{medicine}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-800">Instructions:</p>
                            <p className="text-sm text-blue-700 ml-4">{consultation.prescription.instructions}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <FileText className="w-5 h-5" />
                          <p className="text-sm">No prescription provided for this consultation</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}



        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            {/* Profile Header */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                  {/* Profile Picture */}
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#E17726]/20 to-aqua/20 flex items-center justify-center">
                      <img 
                        src="/patient-avatar-1.svg" 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full"
                      />
                    </div>
                    <Button 
                      size="sm" 
                      className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#E17726] hover:bg-[#c9651e] text-white p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Basic Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-3xl font-bold text-midnight">{patientInfo.name}</h2>
                      <p className="text-lg text-gray-600">Patient ID: PAT12345</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-[#E17726]/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-[#E17726]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Age & Gender</p>
                          <p className="font-semibold text-midnight">{patientInfo.age} years, {patientInfo.gender}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                          <Heart className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Blood Group</p>
                          <p className="font-semibold text-midnight">{patientInfo.bloodGroup}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-midnight flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-[#E17726]" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-aqua" />
                        <div>
                          <p className="text-sm text-gray-600">Phone Number</p>
                          <p className="font-semibold text-midnight">{patientInfo.phone}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-lg">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-[#E17726]" />
                        <div>
                          <p className="text-sm text-gray-600">Email Address</p>
                          <p className="font-semibold text-midnight">{patientInfo.email}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-lg">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-semibold text-midnight">{patientInfo.address}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-lg">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Information */}
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-midnight flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-500" />
                    Medical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-[#E17726]" />
                        <div>
                          <p className="text-sm text-gray-600">Date of Birth</p>
                          <p className="font-semibold text-midnight">15th March, 1982</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-lg">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Heart className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="text-sm text-gray-600">Blood Group</p>
                          <p className="font-semibold text-midnight">{patientInfo.bloodGroup}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-lg">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="text-sm text-gray-600">Known Allergies</p>
                          <p className="font-semibold text-midnight">{patientInfo.allergies}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-lg">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Settings */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-[#E17726]" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white h-12 rounded-xl">
                    <Edit className="w-5 h-5 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full h-12 rounded-xl border-aqua text-aqua hover:bg-aqua hover:text-white">
                    <Activity className="w-5 h-5 mr-2" />
                    Privacy Settings
                  </Button>
                  <Button variant="outline" className="w-full h-12 rounded-xl border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white">
                    <Download className="w-5 h-5 mr-2" />
                    Download Data
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

export default PatientDashboard; 