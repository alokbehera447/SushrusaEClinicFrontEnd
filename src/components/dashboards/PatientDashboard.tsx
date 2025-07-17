import React, { useState, useEffect } from 'react';
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
  Settings,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  patientApi,
  UserProfile,
  formatDate,
  formatDateTime
} from '@/lib/api';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface EditProfileForm {
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  allergies: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();

  // State for data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState<EditProfileForm>({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    allergies: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
  });

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await patientApi.getCurrentUserProfile();
      setUserProfile(profile);
    } catch (err) {
      setError('Failed to load profile data');
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile) {
      setEditForm({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        date_of_birth: userProfile.date_of_birth || '',
        gender: userProfile.gender || '',
        blood_group: userProfile.blood_group || '',
        allergies: userProfile.allergies || '',
        street: userProfile.street || '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        pincode: userProfile.pincode || '',
        country: userProfile.country || '',
      });
    }
  }, [userProfile]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await patientApi.updateUserProfile(editForm);
      toast({ title: 'Profile updated', description: 'Your profile was updated successfully.' });
      setEditOpen(false);
      fetchUserProfile();
    } catch (err) {
      toast({ title: 'Update failed', description: 'Could not update profile.', variant: 'destructive' });
    } finally {
      setEditLoading(false);
    }
  };

  // Get patient info from user profile
  const getPatientInfo = () => {
    if (userProfile) {
      return {
        name: userProfile.name || 'Unknown',
        age: userProfile.age || null,
        gender: userProfile.gender || 'Not specified',
        phone: userProfile.phone || 'Not specified',
        email: userProfile.email || 'Not specified',
        address: userProfile.full_address || 'Not specified',
        bloodGroup: userProfile.blood_group || 'Not specified',
        allergies: userProfile.allergies || 'None'
      };
    }

    return {
      name: 'Loading...',
      age: null,
      gender: 'Loading...',
      phone: 'Loading...',
      email: 'Loading...',
      address: 'Loading...',
      bloodGroup: 'Loading...',
      allergies: 'Loading...'
    };
  };

  const patientInfo = getPatientInfo();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'consultations', label: 'Consultations', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
    ));
  };

  // Loading component
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#E17726]" />
          <p className="text-gray-600">Loading patient dashboard...</p>
        </div>
      </div>
    );
  }

  // Error component
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchUserProfile} className="bg-[#E17726] hover:bg-[#c9651e] text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Edit Profile Modal */}
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
                <p className="text-sm text-gray-600">Patient ID: {userProfile?.id || 'Loading...'}</p>
              </div>
              <Badge className="bg-[#E17726]/10 text-[#E17726] border-[#E17726]/20">
                Active Patient
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>Update your profile information below.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input name="name" value={editForm.name} onChange={handleEditChange} className="w-full border rounded px-3 py-2" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input name="email" value={editForm.email} onChange={handleEditChange} className="w-full border rounded px-3 py-2" type="email" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input name="phone" value={editForm.phone} onChange={handleEditChange} className="w-full border rounded px-3 py-2" disabled />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Date of Birth</label>
                        <input name="date_of_birth" value={editForm.date_of_birth} onChange={handleEditChange} className="w-full border rounded px-3 py-2" type="date" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Gender</label>
                        <select name="gender" value={editForm.gender} onChange={handleEditChange} className="w-full border rounded px-3 py-2">
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Blood Group</label>
                        <input name="blood_group" value={editForm.blood_group} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Allergies</label>
                        <input name="allergies" value={editForm.allergies} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Street</label>
                        <input name="street" value={editForm.street} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <input name="city" value={editForm.city} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">State</label>
                        <input name="state" value={editForm.state} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Pincode</label>
                        <input name="pincode" value={editForm.pincode} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Country</label>
                        <input name="country" value={editForm.country} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="bg-[#E17726] text-white" disabled={editLoading}>
                        {editLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-[#E17726] text-[#E17726]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <Card className="bg-gradient-to-r from-[#E17726] to-[#f7931e] text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Welcome back, {patientInfo.name}!</h2>
                    <p className="text-[#E17726]/90">Your health journey starts here. Manage your profile and health information.</p>
                  </div>
                  <div className="hidden md:block">
                    <img src="/healthcare-consultation.svg" alt="Healthcare" className="w-32 h-32 opacity-20" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Consultations</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Prescriptions</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Heart className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Health Score</p>
                      <p className="text-2xl font-bold text-gray-900">85%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity to display</p>
                  <p className="text-sm">Your consultations and prescriptions will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'consultations' && (
          <div className="space-y-6">
            {/* Consultations Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-midnight">My Consultations</h2>
                <p className="text-gray-600">Track your consultation history and upcoming appointments</p>
              </div>
              <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Book New Consultation
              </Button>
            </div>

            {/* Consultation Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">2</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Upcoming</p>
                      <p className="text-2xl font-bold text-gray-900">1</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Star className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Average Rating</p>
                      <p className="text-2xl font-bold text-gray-900">4.8</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Consultations List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Consultations</span>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Consultation 1 - Upcoming */}
                  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-midnight">Dr. Sarah Johnson</h3>
                          <p className="text-sm text-gray-600">Cardiologist • Video Consultation</p>
                          <p className="text-sm text-gray-500">Scheduled for Dec 25, 2024 at 2:00 PM</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 mb-2">
                          Upcoming
                        </Badge>
                        <p className="text-sm font-medium text-gray-900">₹800</p>
                        <div className="flex items-center mt-1">
                          {renderStars(5)}
                          <span className="text-xs text-gray-500 ml-1">(4.9)</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Clock className="w-4 h-4 mr-2" />
                          Reschedule
                        </Button>
                      </div>
                      <Button size="sm" className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                        Join Meeting
                      </Button>
                    </div>
                  </div>

                  {/* Consultation 2 - Completed */}
                  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-midnight">Dr. Michael Chen</h3>
                          <p className="text-sm text-gray-600">General Physician • In-Person</p>
                          <p className="text-sm text-gray-500">Completed on Dec 20, 2024 at 10:30 AM</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800 border-green-200 mb-2">
                          Completed
                        </Badge>
                        <p className="text-sm font-medium text-gray-900">₹600</p>
                        <div className="flex items-center mt-1">
                          {renderStars(5)}
                          <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          View Prescription
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download Report
                        </Button>
                      </div>
                      <Button size="sm" variant="outline">
                        Book Follow-up
                      </Button>
                    </div>
                  </div>

                  {/* Consultation 3 - Completed */}
                  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-midnight">Dr. Emily Rodriguez</h3>
                          <p className="text-sm text-gray-600">Dermatologist • Video Consultation</p>
                          <p className="text-sm text-gray-500">Completed on Dec 15, 2024 at 3:00 PM</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800 border-green-200 mb-2">
                          Completed
                        </Badge>
                        <p className="text-sm font-medium text-gray-900">₹900</p>
                        <div className="flex items-center mt-1">
                          {renderStars(4)}
                          <span className="text-xs text-gray-500 ml-1">(4.7)</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          View Prescription
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download Report
                        </Button>
                      </div>
                      <Button size="sm" variant="outline">
                        Book Follow-up
                      </Button>
                    </div>
                  </div>
                </div>

                {/* No Consultations State */}
                <div className="text-center py-8 text-gray-500 hidden">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No consultations found</p>
                  <p className="text-sm">Book your first consultation to get started</p>
                  <Button className="mt-4 bg-[#E17726] hover:bg-[#c9651e] text-white">
                    Book Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Personal Information</span>
                  <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>Update your profile information below.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input name="name" value={editForm.name} onChange={handleEditChange} className="w-full border rounded px-3 py-2" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input name="email" value={editForm.email} onChange={handleEditChange} className="w-full border rounded px-3 py-2" type="email" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Phone</label>
                            <input name="phone" value={editForm.phone} onChange={handleEditChange} className="w-full border rounded px-3 py-2" disabled />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Date of Birth</label>
                            <input name="date_of_birth" value={editForm.date_of_birth} onChange={handleEditChange} className="w-full border rounded px-3 py-2" type="date" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Gender</label>
                            <select name="gender" value={editForm.gender} onChange={handleEditChange} className="w-full border rounded px-3 py-2">
                              <option value="">Select</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Blood Group</label>
                            <input name="blood_group" value={editForm.blood_group} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Allergies</label>
                            <input name="allergies" value={editForm.allergies} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Street</label>
                            <input name="street" value={editForm.street} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">City</label>
                            <input name="city" value={editForm.city} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">State</label>
                            <input name="state" value={editForm.state} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Pincode</label>
                            <input name="pincode" value={editForm.pincode} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Country</label>
                            <input name="country" value={editForm.country} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="bg-[#E17726] text-white" disabled={editLoading}>
                            {editLoading ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                          </DialogClose>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <p className="text-gray-900">{patientInfo.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <p className="text-gray-900">{patientInfo.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <p className="text-gray-900">{patientInfo.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <p className="text-gray-900">{userProfile?.date_of_birth ? formatDate(userProfile.date_of_birth) : 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <p className="text-gray-900">{patientInfo.gender}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                      <p className="text-gray-900">{patientInfo.bloodGroup}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                      <p className="text-gray-900">{patientInfo.allergies}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                      <p className="text-gray-900">{patientInfo.age || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Address Information</span>
                  <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>Update your profile information below.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input name="name" value={editForm.name} onChange={handleEditChange} className="w-full border rounded px-3 py-2" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input name="email" value={editForm.email} onChange={handleEditChange} className="w-full border rounded px-3 py-2" type="email" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Phone</label>
                            <input name="phone" value={editForm.phone} onChange={handleEditChange} className="w-full border rounded px-3 py-2" disabled />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Date of Birth</label>
                            <input name="date_of_birth" value={editForm.date_of_birth} onChange={handleEditChange} className="w-full border rounded px-3 py-2" type="date" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Gender</label>
                            <select name="gender" value={editForm.gender} onChange={handleEditChange} className="w-full border rounded px-3 py-2">
                              <option value="">Select</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Blood Group</label>
                            <input name="blood_group" value={editForm.blood_group} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Allergies</label>
                            <input name="allergies" value={editForm.allergies} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Street</label>
                            <input name="street" value={editForm.street} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">City</label>
                            <input name="city" value={editForm.city} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">State</label>
                            <input name="state" value={editForm.state} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Pincode</label>
                            <input name="pincode" value={editForm.pincode} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Country</label>
                            <input name="country" value={editForm.country} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="bg-[#E17726] text-white" disabled={editLoading}>
                            {editLoading ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                          </DialogClose>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                    <p className="text-gray-900">{patientInfo.address}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <p className="text-gray-900">{userProfile?.city || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <p className="text-gray-900">{userProfile?.state || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <p className="text-gray-900">{userProfile?.pincode || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
                    <p className="text-gray-900">{userProfile?.id || 'Not available'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                    <p className="text-gray-900">{userProfile?.role || 'Patient'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                    <p className="text-gray-900">{userProfile?.date_joined ? formatDate(userProfile.date_joined) : 'Not available'}</p>
                  </div>
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