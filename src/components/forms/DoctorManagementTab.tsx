import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Star,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Stethoscope,
  Award,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  FileText,
  Shield,
  Eye,
  UserPlus,
  Settings,
  Activity
} from 'lucide-react';

interface DoctorUser {
  id: string;
  phone: string;
  name: string;
  email: string;
  role: 'doctor';
  password?: string;
  created_at: string;
}

interface DoctorProfile {
  id: string;
  user: string;
  license_number: string;
  qualification: string;
  specialization: string;
  sub_specialization?: string;
  consultation_fee: number;
  online_consultation_fee: number;
  experience_years: number;
  clinic_name: string;
  clinic_address: string;
  bio: string;
  languages_spoken: string[];
  consultation_duration: number;
  is_online_consultation_available: boolean;
  is_verified: boolean;
  is_active: boolean;
  is_accepting_patients: boolean;
  rating: number;
  total_reviews: number;
  total_consultations: number;
  created_at: string;
  profile_picture?: string; // Added for image upload
}

interface DoctorEducation {
  id: string;
  doctor: string;
  degree: string;
  institution: string;
  year_completed: number;
  specialization?: string;
}

interface DoctorExperience {
  id: string;
  doctor: string;
  position: string;
  hospital: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

const DoctorManagementTab = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateAccountDialog, setShowCreateAccountDialog] = useState(false);
  const [showCreateProfileDialog, setShowCreateProfileDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  // Mock data based on the flow
  const [doctorUsers, setDoctorUsers] = useState<DoctorUser[]>([
      {
        id: 'DOC001',
      phone: '+919876543211',
      name: 'Dr. John Smith',
      email: 'dr.john@example.com',
      role: 'doctor',
      password: 'aB3xK9mP',
      created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 'DOC002',
      phone: '+919876543212',
        name: 'Dr. Priya Singh',
      email: 'dr.priya@example.com',
      role: 'doctor',
      password: 'xY7zK2mN',
      created_at: '2024-01-16T11:00:00Z'
    }
  ]);

  const [doctorProfiles, setDoctorProfiles] = useState<DoctorProfile[]>([
    {
      id: '1',
      user: 'DOC001',
      license_number: 'MED123456',
      qualification: 'MBBS, MD (Cardiology)',
      specialization: 'Cardiology',
      sub_specialization: 'Interventional Cardiology',
      consultation_fee: 1500.00,
      online_consultation_fee: 1200.00,
      experience_years: 8,
      clinic_name: 'Heart Care Clinic',
      clinic_address: '123 Medical Center, City, State - 123456',
      bio: 'Experienced cardiologist with expertise in interventional procedures',
      languages_spoken: ['English', 'Hindi'],
      consultation_duration: 5,
      is_online_consultation_available: true,
      is_verified: false,
      is_active: true,
      is_accepting_patients: false,
      rating: 0.0,
      total_reviews: 0,
      total_consultations: 0,
      created_at: '2024-01-15T10:30:00Z'
    }
  ]);

  const [doctorEducation, setDoctorEducation] = useState<DoctorEducation[]>([
    {
      id: '1',
      doctor: 'DOC001',
      degree: 'MBBS',
      institution: 'Mumbai Medical College',
      year_completed: 2010,
      specialization: 'General Medicine'
    },
    {
      id: '2',
      doctor: 'DOC001',
      degree: 'MD',
      institution: 'AIIMS Delhi',
      year_completed: 2015,
      specialization: 'Cardiology'
    }
  ]);

  const [doctorExperience, setDoctorExperience] = useState<DoctorExperience[]>([
    {
      id: '1',
      doctor: 'DOC001',
      position: 'Senior Cardiologist',
      hospital: 'City Heart Hospital',
      start_date: '2015-01-01',
      end_date: null,
      is_current: true,
      description: 'Leading interventional cardiology procedures'
    }
  ]);

  const getStatusColor = (isVerified: boolean, isActive: boolean) => {
    if (!isVerified) return 'bg-yellow-100 text-yellow-800';
    if (isActive) return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (isVerified: boolean, isActive: boolean) => {
    if (!isVerified) return 'Pending Verification';
    if (isActive) return 'Active';
    return 'Inactive';
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors: { [key: string]: string } = {
      'Cardiology': 'bg-red-100 text-red-800',
      'Dermatology': 'bg-purple-100 text-purple-800',
      'Orthopedics': 'bg-blue-100 text-blue-800',
      'Pediatrics': 'bg-pink-100 text-pink-800',
      'Neurology': 'bg-indigo-100 text-indigo-800',
      'General Medicine': 'bg-green-100 text-green-800'
    };
    return colors[specialty] || 'bg-gray-100 text-gray-800';
  };

  const filteredDoctors = doctorUsers.filter(doctor => {
    const profile = doctorProfiles.find(p => p.user === doctor.id);
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (profile?.specialization.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'pending' && profile && !profile.is_verified) ||
                         (filterStatus === 'active' && profile && profile.is_verified && profile.is_active) ||
                         (filterStatus === 'inactive' && profile && profile.is_verified && !profile.is_active);
    return matchesSearch && matchesStatus;
  });

  const handleCreateAccount = (accountData: Omit<DoctorUser, 'id' | 'created_at'>) => {
    const newAccount: DoctorUser = {
      id: `DOC${Date.now()}`,
      ...accountData,
      created_at: new Date().toISOString()
    };
    setDoctorUsers([...doctorUsers, newAccount]);
    setShowCreateAccountDialog(false);
  };

  const handleCreateProfile = (profileData: Omit<DoctorProfile, 'id' | 'created_at' | 'rating' | 'total_reviews' | 'total_consultations'>) => {
    const newProfile: DoctorProfile = {
      id: Date.now().toString(),
      ...profileData,
      rating: 0.0,
      total_reviews: 0,
      total_consultations: 0,
      created_at: new Date().toISOString()
    };
    setDoctorProfiles([...doctorProfiles, newProfile]);
    setShowCreateProfileDialog(false);
  };

  const handleVerifyDoctor = (doctorId: string) => {
    setDoctorProfiles(doctorProfiles.map(profile => 
      profile.user === doctorId 
        ? { ...profile, is_verified: true, is_active: true, is_accepting_patients: true }
        : profile
    ));
    setShowVerifyDialog(false);
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setProfileImagePreview(null);
    }
  };

  const stats = {
    totalDoctors: doctorUsers.length,
    verifiedDoctors: doctorProfiles.filter(p => p.is_verified).length,
    pendingVerification: doctorProfiles.filter(p => !p.is_verified).length,
    activeDoctors: doctorProfiles.filter(p => p.is_verified && p.is_active).length,
    totalConsultations: doctorProfiles.reduce((acc, p) => acc + p.total_consultations, 0),
    averageRating: doctorProfiles.length > 0 
      ? (doctorProfiles.reduce((acc, p) => acc + p.rating, 0) / doctorProfiles.length).toFixed(1)
      : '0.0'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Doctor Management</h2>
          <p className="text-gray-600">Admin workflow: Create accounts, profiles, and verify doctors</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => setShowCreateAccountDialog(true)}
            className="border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create Account
          </Button>
        <Button 
          className="bg-[#E17726] hover:bg-[#c9651e] text-white"
            onClick={() => setShowCreateProfileDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
            Create Profile
        </Button>
        </div>
      </div>

      {/* Workflow Steps */}
      <Card className="border-0 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Admin Workflow Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
              <div>
                <h4 className="font-semibold text-blue-900">Create Account</h4>
                <p className="text-sm text-blue-700">Create doctor user account</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
              <div>
                <h4 className="font-semibold text-green-900">Create Profile</h4>
                <p className="text-sm text-green-700">Add professional details</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <div>
                <h4 className="font-semibold text-purple-900">Verify & Activate</h4>
                <p className="text-sm text-purple-700">Approve doctor profile</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E17726]/10 to-[#E17726]/5 flex items-center justify-center">
                <User className="w-6 h-6 text-[#E17726]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Verified Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verifiedDoctors}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Pending Verification</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingVerification}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
      {/* Search and Filters */}
          <Card className="border-0 shadow-lg rounded-xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E17726] focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending Verification</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <Button 
                  variant="outline" 
                  onClick={() => {
              setSearchTerm('');
              setFilterStatus('');
                  }}
                  className="border-gray-300"
                >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Doctors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => {
              const profile = doctorProfiles.find(p => p.user === doctor.id);
              const education = doctorEducation.filter(e => e.doctor === doctor.id);
              const experience = doctorExperience.filter(e => e.doctor === doctor.id);
              
              return (
                <Card key={doctor.id} className="hover:shadow-lg transition-shadow border-0 shadow-lg rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {profile?.profile_picture && (
                    <img src={profile.profile_picture} alt={profile.user} className="w-12 h-12 rounded-full object-cover" />
                  )}
                  {!profile?.profile_picture && (
                  <div className="w-12 h-12 bg-[#E17726] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  )}
                  <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">
                      {doctor.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{doctor.email}</p>
                  </div>
                </div>
                      {profile && (
                        <Badge className={getStatusColor(profile.is_verified, profile.is_active)}>
                          {getStatusText(profile.is_verified, profile.is_active)}
                </Badge>
                      )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
                    {profile ? (
                      <>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-[#E17726]" />
                            <Badge className={getSpecialtyColor(profile.specialization)}>
                              {profile.specialization}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{profile.qualification}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{profile.experience_years} years</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{profile.clinic_name}</span>
                </div>
              </div>

                        <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                          <div>
                            <span className="text-gray-600">Fee:</span>
                            <p className="font-medium">₹{profile.consultation_fee}</p>
                          </div>
                <div>
                  <span className="text-gray-600">Rating:</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{profile.rating}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Consultations:</span>
                            <p className="font-medium">{profile.total_consultations}</p>
                </div>
                <div>
                            <span className="text-gray-600">Education:</span>
                            <p className="font-medium">{education.length} records</p>
                </div>
              </div>

                        <div className="flex space-x-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                            onClick={() => setSelectedDoctor(doctor)}
                            className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                          {!profile.is_verified && (
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white flex-1"
                              onClick={() => {
                                setSelectedDoctor(doctor);
                                setShowVerifyDialog(true);
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Verify
                </Button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 mb-2">No profile created yet</p>
                        <Button 
                          size="sm" 
                          className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                          onClick={() => setShowCreateProfileDialog(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Profile
                </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <Card className="border-0 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Doctor User Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctorUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-[#E17726] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">{user.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-800">Account Created</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profiles Tab */}
        <TabsContent value="profiles" className="space-y-6">
          <Card className="border-0 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Doctor Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctorProfiles.map((profile) => {
                  const user = doctorUsers.find(u => u.id === profile.user);
                  return (
                    <div key={profile.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {profile.profile_picture && (
                            <img src={profile.profile_picture} alt={profile.user} className="w-10 h-10 rounded-full object-cover" />
                          )}
                          {!profile.profile_picture && (
                          <div className="w-10 h-10 bg-[#E17726] rounded-full flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-white" />
                          </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-900">{user?.name}</h4>
                            <p className="text-sm text-gray-600">{profile.specialization}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(profile.is_verified, profile.is_active)}>
                          {getStatusText(profile.is_verified, profile.is_active)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">License:</span>
                          <p className="font-medium">{profile.license_number}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Fee:</span>
                          <p className="font-medium">₹{profile.consultation_fee}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Experience:</span>
                          <p className="font-medium">{profile.experience_years} years</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Clinic:</span>
                          <p className="font-medium">{profile.clinic_name}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
      </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Account Dialog */}
      <Dialog open={showCreateAccountDialog} onOpenChange={setShowCreateAccountDialog}>
        <DialogContent className="max-w-md !fixed !top-4 !right-4 !left-auto !translate-x-0 !translate-y-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Step 1: Create Doctor Account
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" placeholder="Dr. John Smith" />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="dr.john@example.com" />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" placeholder="+91 98765 43210" />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateAccountDialog(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                onClick={() => {
                  handleCreateAccount({
                    phone: '+919876543213',
                    name: 'New Doctor',
                    email: 'new.doctor@example.com',
                    role: 'doctor'
                  });
                }}
              >
                Create Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Profile Dialog */}
      <Dialog open={showCreateProfileDialog} onOpenChange={setShowCreateProfileDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto !fixed !top-4 !right-4 !left-auto !translate-x-0 !translate-y-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Step 2: Create Doctor Profile
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user">Select Doctor Account *</Label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E17726] focus:border-transparent">
                  <option value="">Choose doctor account</option>
                  {doctorUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="license">License Number *</Label>
                <Input id="license" placeholder="MED123456" />
              </div>
              <div>
                <Label htmlFor="qualification">Qualification *</Label>
                <Input id="qualification" placeholder="MBBS, MD (Cardiology)" />
              </div>
              <div>
                <Label htmlFor="specialization">Specialization *</Label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E17726] focus:border-transparent">
                  <option value="">Select specialization</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>
              <div>
                <Label htmlFor="consultation_fee">Consultation Fee *</Label>
                <Input id="consultation_fee" type="number" placeholder="1500" />
              </div>
              <div>
                <Label htmlFor="experience_years">Experience (Years) *</Label>
                <Input id="experience_years" type="number" placeholder="8" />
              </div>
              <div>
                <Label htmlFor="profile_picture">Profile Image</Label>
                <Input id="profile_picture" type="file" accept="image/*" onChange={handleProfileImageChange} />
                {profileImagePreview && (
                  <img src={profileImagePreview} alt="Profile Preview" className="w-20 h-20 rounded-full mt-2" />
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="clinic_name">Clinic Name *</Label>
              <Input id="clinic_name" placeholder="Heart Care Clinic" />
            </div>

            <div>
              <Label htmlFor="clinic_address">Clinic Address *</Label>
              <Textarea id="clinic_address" placeholder="Complete clinic address" />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="Brief description about the doctor" />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateProfileDialog(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                onClick={() => {
                  const formData = new FormData();
                  formData.append('user', 'DOC003'); // Placeholder for user ID
                  formData.append('license_number', 'MED789012');
                  formData.append('qualification', 'MBBS, MD');
                  formData.append('specialization', 'General Medicine');
                  formData.append('consultation_fee', '800');
                  formData.append('online_consultation_fee', '600');
                  formData.append('experience_years', '5');
                  formData.append('clinic_name', 'General Clinic');
                  formData.append('clinic_address', '456 Health Street, City, State - 123456');
                  formData.append('bio', 'Experienced general physician');
                  formData.append('languages_spoken', JSON.stringify(['English', 'Hindi']));
                  formData.append('consultation_duration', '5');
                  formData.append('is_online_consultation_available', 'true');
                  formData.append('is_verified', 'false');
                  formData.append('is_active', 'true');
                  formData.append('is_accepting_patients', 'false');
                  if (profileImage) {
                    formData.append('profile_picture', profileImage);
                  }
                  handleCreateProfile({
                    user: 'DOC003',
                    license_number: 'MED789012',
                    qualification: 'MBBS, MD',
                    specialization: 'General Medicine',
                    consultation_fee: 800,
                    online_consultation_fee: 600,
                    experience_years: 5,
                    clinic_name: 'General Clinic',
                    clinic_address: '456 Health Street, City, State - 123456',
                    bio: 'Experienced general physician',
                    languages_spoken: ['English', 'Hindi'],
                    consultation_duration: 5,
                    is_online_consultation_available: true,
                    is_verified: false,
                    is_active: true,
                    is_accepting_patients: false
                  });
                }}
              >
                Create Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Verify Doctor Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="max-w-md !fixed !top-4 !right-4 !left-auto !translate-x-0 !translate-y-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Step 3: Verify Doctor Profile
            </DialogTitle>
          </DialogHeader>
          
          {selectedDoctor && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Pending Verification</span>
                </div>
                <p className="text-sm text-yellow-700 mt-2">
                  Verify and activate {selectedDoctor.name}'s profile to make them available for patients.
                </p>
                    </div>
              
                        <div className="space-y-2">
                <h4 className="font-semibold">Verification Checklist:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Account created</span>
                        </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Profile completed</span>
                        </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Documents verified</span>
                </div>
                </div>
                </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowVerifyDialog(false)}>
                  Cancel
                  </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleVerifyDoctor(selectedDoctor.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify & Activate
                          </Button>
                        </div>
                      </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorManagementTab; 