import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, User, FileText, Stethoscope, Upload, ArrowLeft, Settings, Video, Calendar, Clock, Phone, Mail, MapPin } from 'lucide-react';

// Mock Data Structures (matching JSON)
const mockPatients = [
  {
    id: 'PAT001',
    phone: '+919876543211',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'patient',
    date_of_birth: '1985-06-15',
    gender: 'male',
    city: 'Mumbai',
    state: 'Maharashtra',
    blood_group: 'O+',
    is_active: true,
    is_verified: true,
    date_joined: '2024-01-15T10:30:00Z',
    // Profile data
    profile: {
      allergies: 'Penicillin, Shellfish',
      chronic_conditions: ['Diabetes', 'Hypertension'],
      current_medications: ['Metformin 500mg', 'Amlodipine 5mg'],
      preferred_language: 'english',
    },
    // Notes data
    notes: [
      {
        id: 1,
        note: 'Patient prefers morning appointments. Has difficulty with English, prefers Hindi. Emergency contact is spouse who is always available.',
        is_private: true,
        created_by: 'ADM001',
        created_at: '2024-01-15T10:30:00Z',
      }
    ],
    // Consultations data
    consultations: [
      {
        id: 'CON001',
        doctor: 'Dr. Amit Kumar',
        specialty: 'Cardiology',
        date: '2024-01-16',
        time: '2:30 PM - 3:00 PM',
        status: 'completed',
        type: 'video',
        fee: 800,
        prescription: {
          id: 'RX001',
          medicines: ['Metformin 500mg', 'Glimepiride 1mg'],
          instructions: 'Take Metformin with meals twice daily. Take Glimepiride 30 minutes before breakfast.',
          writtenDate: '2024-01-16'
        }
      },
      {
        id: 'CON002',
        doctor: 'Dr. Neha Jain',
        specialty: 'Orthopedics',
        date: '2024-01-20',
        time: '10:00 AM - 10:30 AM',
        status: 'scheduled',
        type: 'phone',
        fee: 600,
        prescription: null
      }
    ]
  },
  {
    id: 'PAT002',
    phone: '+919876543213',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    role: 'patient',
    date_of_birth: '1990-03-22',
    gender: 'female',
    city: 'Delhi',
    state: 'Delhi',
    blood_group: 'A+',
    is_active: true,
    is_verified: false,
    date_joined: '2024-01-14T09:15:00Z',
    // Profile data
    profile: {
      allergies: 'None',
      chronic_conditions: ['Asthma'],
      current_medications: ['Salbutamol inhaler'],
      preferred_language: 'english',
    },
    // Notes data
    notes: [
      {
        id: 2,
        note: 'Patient is very punctual and prefers evening appointments. Good English communication.',
        is_private: false,
        created_by: 'ADM001',
        created_at: '2024-01-14T09:15:00Z',
      }
    ],
    // Consultations data
    consultations: [
      {
        id: 'CON003',
        doctor: 'Dr. Ramesh Kumar',
        specialty: 'Dermatology',
        date: '2024-01-18',
        time: '3:00 PM - 3:30 PM',
        status: 'completed',
        type: 'video',
        fee: 500,
        prescription: {
          id: 'RX002',
          medicines: ['Cetirizine 10mg', 'Hydrocortisone cream'],
          instructions: 'Take Cetirizine once daily for allergies. Apply Hydrocortisone cream twice daily on affected areas.',
          writtenDate: '2024-01-18'
        }
      }
    ]
  },
];

const PatientManagementTab: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const handleManagePatient = (patient: any) => {
    setSelectedPatient(patient);
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {!selectedPatient ? (
        // Patient List View
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Patient Management</h2>
              <p className="text-gray-600 mt-2">Manage patient accounts and their information</p>
            </div>
            <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white px-6 py-3 rounded-xl shadow-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">Create Patient Account</DialogTitle>
                  <DialogDescription>Add a new patient to the system</DialogDescription>
                </DialogHeader>
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                    <Input id="phone" placeholder="+91 98765 43210" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    <Input id="name" placeholder="Enter full name" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <Input id="email" type="email" placeholder="patient@example.com" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="blood_group" className="text-sm font-medium">Blood Group</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white py-3">
                    Create Patient
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{mockPatients.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E17726]/10 to-[#E17726]/5 flex items-center justify-center">
                    <User className="w-6 h-6 text-[#E17726]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Active Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{mockPatients.filter(p => p.is_active).length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Verified Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{mockPatients.filter(p => p.is_verified).length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Consultations</p>
                    <p className="text-2xl font-bold text-gray-900">{mockPatients.reduce((acc, p) => acc + p.consultations.length, 0)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 flex items-center justify-center">
                    <Video className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient List */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Patient Records</CardTitle>
              <CardDescription>All registered patients in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Patient</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Contact</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Blood Group</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Consultations</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPatients.map((p) => (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E17726]/10 to-[#E17726]/5 flex items-center justify-center mr-3">
                              <User className="w-5 h-5 text-[#E17726]" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{p.name}</div>
                              <div className="text-sm text-gray-500">ID: {p.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            <div className="flex items-center text-gray-900">
                              <Phone className="w-4 h-4 mr-1" />
                              {p.phone}
                            </div>
                            <div className="flex items-center text-gray-500">
                              <Mail className="w-4 h-4 mr-1" />
                              {p.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className="font-medium">{p.blood_group}</Badge>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant={p.is_verified ? 'default' : 'secondary'} className="font-medium">
                            {p.is_verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900 font-medium">{p.consultations.length}</div>
                          <div className="text-xs text-gray-500">consultations</div>
                        </td>
                        <td className="py-4 px-6">
                          <Button 
                            onClick={() => handleManagePatient(p)}
                            className="bg-[#E17726] hover:bg-[#c9651e] text-white px-4 py-2 rounded-lg shadow-sm"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Manage
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Patient Detail View
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-8">
            <Button 
              variant="outline" 
              onClick={handleBackToList}
              className="mr-4 border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Patients
            </Button>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Patient Details</h2>
              <p className="text-gray-600 mt-1">{selectedPatient.name} • {selectedPatient.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Patient Profile */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Patient Profile</CardTitle>
                    <CardDescription>Medical information</CardDescription>
                  </div>
                  <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white">
                        <Settings className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Edit Patient Profile</DialogTitle>
                        <DialogDescription>Update medical information</DialogDescription>
                      </DialogHeader>
                      <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="blood_group" className="text-sm font-medium">Blood Group</Label>
                            <Select defaultValue={selectedPatient.blood_group}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select blood group" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="preferred_language" className="text-sm font-medium">Preferred Language</Label>
                            <Select defaultValue={selectedPatient.profile?.preferred_language}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="hindi">Hindi</SelectItem>
                                <SelectItem value="marathi">Marathi</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="allergies" className="text-sm font-medium">Allergies</Label>
                          <Textarea id="allergies" defaultValue={selectedPatient.profile?.allergies} className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="chronic_conditions" className="text-sm font-medium">Chronic Conditions</Label>
                          <Textarea id="chronic_conditions" defaultValue={selectedPatient.profile?.chronic_conditions?.join(', ')} className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="current_medications" className="text-sm font-medium">Current Medications</Label>
                          <Textarea id="current_medications" defaultValue={selectedPatient.profile?.current_medications?.join(', ')} className="mt-1" />
                        </div>
                        <Button type="submit" className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white py-3">
                          Update Profile
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Blood Group:</span>
                      <div className="mt-1">
                        <Badge variant="outline" className="font-medium">{selectedPatient.blood_group}</Badge>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Language:</span>
                      <div className="mt-1 text-gray-900">{selectedPatient.profile?.preferred_language}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-sm text-gray-700">Allergies:</span>
                      <p className="text-sm text-gray-900 mt-1">{selectedPatient.profile?.allergies || 'None'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-gray-700">Chronic Conditions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedPatient.profile?.chronic_conditions?.map((condition: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            {condition}
                          </Badge>
                        )) || <span className="text-sm text-gray-500">None</span>}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-gray-700">Current Medications:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedPatient.profile?.current_medications?.map((medication: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            {medication}
                          </Badge>
                        )) || <span className="text-sm text-gray-500">None</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Consultations */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Consultations</CardTitle>
                  <CardDescription>All consultations for this patient</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPatient.consultations?.map((consultation: any) => (
                      <div key={consultation.id} className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E17726]/10 to-[#E17726]/5 flex items-center justify-center">
                              <Video className="w-6 h-6 text-[#E17726]" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{consultation.doctor}</h4>
                              <p className="text-sm text-gray-600">{consultation.specialty}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">₹{consultation.fee}</div>
                            <Badge className={`${getStatusColor(consultation.status)} font-medium`}>
                              {consultation.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {consultation.date}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {consultation.time}
                          </div>
                        </div>

                        {consultation.prescription && (
                          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                            <h5 className="font-medium text-gray-900 mb-2">Prescription</h5>
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm font-medium text-gray-700">Medicines:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {consultation.prescription.medicines.map((medicine: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                      {medicine}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-700">Instructions:</span>
                                <p className="text-sm text-gray-900 mt-1">{consultation.prescription.instructions}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-2 mt-4">
                          <Button variant="outline" size="sm" className="border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white">
                            View Details
                          </Button>
                          {consultation.status === 'scheduled' && (
                            <Button size="sm" className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                              <Video className="mr-2 h-4 w-4" />
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {selectedPatient.consultations?.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No consultations yet</p>
                        <p className="text-sm">This patient hasn't had any consultations yet.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagementTab; 