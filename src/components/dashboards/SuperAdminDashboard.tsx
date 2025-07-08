import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  UserCog, 
  Stethoscope, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Activity,
  BarChart3,
  Plus,
  Search,
  Filter,
  Settings,
  Bell,
  Download,
  Edit,
  Trash2,
  Eye,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Award,
  FileText,
  PieChart,
  LineChart,
  BarChart,
  TrendingDown
} from 'lucide-react';

// Doctors Management Component
const DoctorsManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const mockDoctors = [
    {
      id: 1,
      name: 'Dr. Rajesh Sharma',
      email: 'dr.sharma@email.com',
      phone: '+91-9876543210',
      specialty: 'Cardiology',
      qualification: 'MD, DM Cardiology',
      experience: '15 years',
      clinic: 'Sushrusa Clinic - Delhi',
      status: 'Active',
      rating: 4.8,
      consultations: 245,
      revenue: '₹1,22,500'
    },
    {
      id: 2,
      name: 'Dr. Priya Patel',
      email: 'dr.patel@email.com',
      phone: '+91-9876543211',
      specialty: 'Neurology',
      qualification: 'MD, DM Neurology',
      experience: '12 years',
      clinic: 'Sushrusa Clinic - Mumbai',
      status: 'Active',
      rating: 4.9,
      consultations: 189,
      revenue: '₹94,500'
    },
    {
      id: 3,
      name: 'Dr. Amit Kumar',
      email: 'dr.kumar@email.com',
      phone: '+91-9876543212',
      specialty: 'Orthopedics',
      qualification: 'MS Orthopedics',
      experience: '8 years',
      clinic: 'Sushrusa Clinic - Bangalore',
      status: 'Inactive',
      rating: 4.6,
      consultations: 156,
      revenue: '₹78,000'
    }
  ];

  const doctorStats = [
    { label: 'Total Doctors', value: '156', change: '+12', icon: Stethoscope, color: 'text-[#E17726]' },
    { label: 'Active Doctors', value: '142', change: '+8', icon: Activity, color: 'text-green-600' },
    { label: 'New This Month', value: '23', change: '+15', icon: Plus, color: 'text-blue-600' },
    { label: 'Avg Rating', value: '4.7', change: '+0.2', icon: Star, color: 'text-yellow-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {doctorStats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-midnight">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium mt-1">
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color === 'text-[#E17726]' ? 'from-[#E17726]/10 to-[#E17726]/5' : 'from-blue-500/10 to-blue-500/5'} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Add Section */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search doctors by name, specialty, or clinic..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
              />
            </div>
            <Button variant="outline" className="border-gray-300 h-11 px-6 rounded-xl">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#E17726] hover:bg-[#c9651e] text-white h-11 px-6 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Doctor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Doctor Form */}
      {showAddForm && (
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-midnight flex items-center">
              <Plus className="w-5 h-5 mr-2 text-[#E17726]" />
              Add New Doctor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <Input placeholder="Dr. John Doe" className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input type="email" placeholder="doctor@email.com" className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <Input placeholder="+91-9876543210" className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                  <select className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]">
                    <option>Select Specialty</option>
                    <option>Cardiology</option>
                    <option>Neurology</option>
                    <option>Orthopedics</option>
                    <option>Pediatrics</option>
                    <option>General Medicine</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                  <Input placeholder="MD, MS, etc." className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                  <Input placeholder="Years of experience" className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                  <Input placeholder="Medical license number" className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Clinic</label>
                  <select className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]">
                    <option>Select Clinic</option>
                    <option>Sushrusa Clinic - Delhi</option>
                    <option>Sushrusa Clinic - Mumbai</option>
                    <option>Sushrusa Clinic - Bangalore</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white px-8 rounded-xl">
                Save Doctor
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
                className="border-gray-300 px-8 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctors List */}
      <div className="grid gap-6">
        {mockDoctors.filter(doctor => 
          doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.clinic.toLowerCase().includes(searchTerm.toLowerCase())
        ).map((doctor) => (
          <Card key={doctor.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#E17726]/20 to-blue-500/20 rounded-2xl flex items-center justify-center">
                    <Stethoscope className="w-8 h-8 text-[#E17726]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-midnight">{doctor.name}</h3>
                    <p className="text-gray-600">{doctor.specialty}</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{doctor.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Experience</p>
                    <p className="font-medium text-midnight">{doctor.experience}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Consultations</p>
                    <p className="font-medium text-midnight">{doctor.consultations}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Revenue</p>
                    <p className="font-medium text-midnight">{doctor.revenue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <Badge className={doctor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {doctor.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-lg">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Admins Management Component
const AdminsManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const mockAdmins = [
    {
      id: 1,
      name: 'Rohit Sharma',
      email: 'admin.delhi@sushrusa.com',
      phone: '+91-9876543210',
      clinic: 'Sushrusa Clinic - Delhi',
      role: 'Admin',
      status: 'Active',
      joinDate: '2024-01-15',
      appointmentsHandled: 342,
      revenue: '₹1,71,000'
    },
    {
      id: 2,
      name: 'Sneha Patel',
      email: 'admin.mumbai@sushrusa.com',
      phone: '+91-9876543211',
      clinic: 'Sushrusa Clinic - Mumbai',
      role: 'Admin',
      status: 'Active',
      joinDate: '2024-02-20',
      appointmentsHandled: 289,
      revenue: '₹1,44,500'
    },
    {
      id: 3,
      name: 'Amit Kumar',
      email: 'admin.bangalore@sushrusa.com',
      phone: '+91-9876543212',
      clinic: 'Sushrusa Clinic - Bangalore',
      role: 'Admin',
      status: 'Inactive',
      joinDate: '2024-03-10',
      appointmentsHandled: 156,
      revenue: '₹78,000'
    }
  ];

  const adminStats = [
    { label: 'Total Admins', value: '48', change: '+5', icon: UserCog, color: 'text-[#E17726]' },
    { label: 'Active Admins', value: '42', change: '+3', icon: Activity, color: 'text-green-600' },
    { label: 'New This Month', value: '8', change: '+60%', icon: Plus, color: 'text-blue-600' },
    { label: 'Avg Performance', value: '92%', change: '+5%', icon: Award, color: 'text-purple-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-midnight">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium mt-1">
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color === 'text-[#E17726]' ? 'from-[#E17726]/10 to-[#E17726]/5' : 'from-blue-500/10 to-blue-500/5'} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Add Section */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search admins by name, clinic, or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
              />
            </div>
            <Button variant="outline" className="border-gray-300 h-11 px-6 rounded-xl">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#E17726] hover:bg-[#c9651e] text-white h-11 px-6 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Admin Form */}
      {showAddForm && (
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-midnight flex items-center">
              <Plus className="w-5 h-5 mr-2 text-[#E17726]" />
              Add New Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <Input placeholder="John Doe" className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input type="email" placeholder="admin@email.com" className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <Input placeholder="+91-9876543210" className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <Input placeholder="Complete address" className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Clinic</label>
                  <select className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]">
                    <option>Select Clinic</option>
                    <option>Sushrusa Clinic - Delhi</option>
                    <option>Sushrusa Clinic - Mumbai</option>
                    <option>Sushrusa Clinic - Bangalore</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role Level</label>
                  <select className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]">
                    <option>Admin</option>
                    <option>Senior Admin</option>
                    <option>Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                  <select className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]">
                    <option>Full Time</option>
                    <option>Part Time</option>
                    <option>Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary</label>
                  <Input placeholder="Monthly salary" className="rounded-xl" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Patient Management</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Appointment Booking</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Payment Processing</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Reports Access</span>
                </label>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white px-8 rounded-xl">
                Save Admin
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
                className="border-gray-300 px-8 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admins List */}
      <div className="grid gap-6">
        {mockAdmins.filter(admin => 
          admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.clinic.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.email.toLowerCase().includes(searchTerm.toLowerCase())
        ).map((admin) => (
          <Card key={admin.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                    <UserCog className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-midnight">{admin.name}</h3>
                    <p className="text-gray-600">{admin.clinic}</p>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Join Date</p>
                    <p className="font-medium text-midnight">{admin.joinDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Appointments</p>
                    <p className="font-medium text-midnight">{admin.appointmentsHandled}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Revenue</p>
                    <p className="font-medium text-midnight">{admin.revenue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <Badge className={admin.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {admin.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-lg">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Analytics Management Component
const AnalyticsManagement = () => {
  const [timeRange, setTimeRange] = useState('month');

  const analyticsStats = [
    { label: 'Total Revenue', value: '₹12,45,680', change: '+18%', icon: DollarSign, color: 'text-green-600' },
    { label: 'Total Consultations', value: '2,847', change: '+24%', icon: Activity, color: 'text-[#E17726]' },
    { label: 'Success Rate', value: '94.2%', change: '+2.1%', icon: Award, color: 'text-blue-600' },
    { label: 'Avg Satisfaction', value: '4.8/5', change: '+0.3', icon: Star, color: 'text-yellow-600' }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 185000, consultations: 234 },
    { month: 'Feb', revenue: 198000, consultations: 267 },
    { month: 'Mar', revenue: 224000, consultations: 289 },
    { month: 'Apr', revenue: 267000, consultations: 334 },
    { month: 'May', revenue: 289000, consultations: 378 },
    { month: 'Jun', revenue: 324000, consultations: 423 }
  ];

  const topPerformers = [
    { name: 'Dr. Rajesh Sharma', specialty: 'Cardiology', consultations: 89, revenue: '₹44,500', rating: 4.9 },
    { name: 'Dr. Priya Patel', specialty: 'Neurology', consultations: 76, revenue: '₹38,000', rating: 4.8 },
    { name: 'Dr. Amit Kumar', specialty: 'Orthopedics', consultations: 68, revenue: '₹34,000', rating: 4.7 }
  ];

  const clinicPerformance = [
    { name: 'Sushrusa Clinic - Delhi', consultations: 342, revenue: '₹1,71,000', growth: '+15%' },
    { name: 'Sushrusa Clinic - Mumbai', consultations: 289, revenue: '₹1,44,500', growth: '+12%' },
    { name: 'Sushrusa Clinic - Bangalore', consultations: 234, revenue: '₹1,17,000', growth: '+8%' }
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-midnight">Analytics Dashboard</h2>
              <p className="text-gray-600">Monitor platform performance and insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="p-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white px-6 rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsStats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-midnight">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium mt-1">
                    {stat.change} vs last period
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color === 'text-[#E17726]' ? 'from-[#E17726]/10 to-[#E17726]/5' : 'from-blue-500/10 to-blue-500/5'} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-midnight flex items-center">
              <LineChart className="w-5 h-5 mr-2 text-[#E17726]" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {revenueData.map((data, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                  <div 
                    className="w-full bg-gradient-to-t from-[#E17726] to-orange-300 rounded-t-lg"
                    style={{ height: `${(data.revenue / 350000) * 200}px` }}
                  ></div>
                  <span className="text-xs font-medium text-gray-600">{data.month}</span>
                  <span className="text-xs text-gray-500">₹{(data.revenue / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Consultations Chart */}
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-midnight flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-blue-600" />
              Consultation Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {revenueData.map((data, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg"
                    style={{ height: `${(data.consultations / 500) * 200}px` }}
                  ></div>
                  <span className="text-xs font-medium text-gray-600">{data.month}</span>
                  <span className="text-xs text-gray-500">{data.consultations}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Doctors */}
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-midnight flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-600" />
              Top Performing Doctors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerformers.map((doctor, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#E17726] to-orange-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-midnight">{doctor.name}</h4>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-midnight">{doctor.revenue}</p>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-sm text-gray-600">{doctor.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Clinic Performance */}
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-midnight flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-600" />
              Clinic Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {clinicPerformance.map((clinic, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div>
                  <h4 className="font-semibold text-midnight">{clinic.name}</h4>
                  <p className="text-sm text-gray-600">{clinic.consultations} consultations</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-midnight">{clinic.revenue}</p>
                  <p className="text-sm text-green-600 font-medium">{clinic.growth}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-midnight flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Key Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-bold text-midnight mb-2">Revenue Growth</h3>
              <p className="text-sm text-gray-600">18% increase in monthly revenue. Consider expanding services.</p>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold text-midnight mb-2">Patient Retention</h3>
              <p className="text-sm text-gray-600">94% patient satisfaction. Focus on maintaining quality.</p>
            </div>
            <div className="text-center p-6 bg-orange-50 rounded-xl">
              <Clock className="w-12 h-12 text-[#E17726] mx-auto mb-4" />
              <h3 className="font-bold text-midnight mb-2">Peak Hours</h3>
              <p className="text-sm text-gray-600">2-6 PM are busiest. Consider adding more doctors.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const stats = [
    { label: 'Total E-Clinics', value: '24', change: '+3', icon: Building2, color: 'text-[#E17726]' },
    { label: 'Active Doctors', value: '156', change: '+12', icon: Stethoscope, color: 'text-aqua' },
    { label: 'Total Admins', value: '48', change: '+5', icon: UserCog, color: 'text-[#E17726]' },
    { label: 'Total Patients', value: '8,247', change: '+234', icon: Users, color: 'text-aqua' },
    { label: 'Monthly Revenue', value: '₹2,45,680', change: '+18%', icon: DollarSign, color: 'text-[#E17726]' },
    { label: 'Consultations', value: '1,892', change: '+45', icon: Activity, color: 'text-aqua' }
  ];

  const recentClinics = [
    { name: 'Sushrusa Clinic - Delhi', location: 'New Delhi', status: 'Active', admins: 3, doctors: 8 },
    { name: 'Sushrusa Clinic - Mumbai', location: 'Mumbai', status: 'Active', admins: 2, doctors: 6 },
    { name: 'Sushrusa Clinic - Bangalore', location: 'Bangalore', status: 'Pending', admins: 1, doctors: 4 }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'clinics', label: 'E-Clinics', icon: Building2 },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'admins', label: 'Admins', icon: UserCog },
    // { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-midnight">Super Admin Dashboard</h1>
              <Badge className="bg-[#E17726]/10 text-[#E17726] border-[#E17726]/20">
                Platform Manager
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="border-gray-300">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="border-gray-300">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-[#E17726] transition-colors" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
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

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                        <p className="text-3xl font-bold text-midnight">{stat.value}</p>
                        <p className="text-sm text-green-600 font-medium mt-1">
                          {stat.change} from last month
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color === 'text-[#E17726]' ? 'from-[#E17726]/10 to-[#E17726]/5' : 'from-aqua/10 to-aqua/5'} flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent E-Clinics */}
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-6">
                  <CardTitle className="text-xl font-bold text-midnight">Recent E-Clinics</CardTitle>
                  <Button size="sm" className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Clinic
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentClinics.map((clinic, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div>
                        <h4 className="font-semibold text-midnight">{clinic.name}</h4>
                        <p className="text-sm text-gray-600">{clinic.location}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">{clinic.admins} Admins</span>
                          <span className="text-xs text-gray-500">{clinic.doctors} Doctors</span>
                        </div>
                      </div>
                      <Badge className={clinic.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {clinic.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-midnight">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white justify-start h-12 rounded-xl">
                    <Building2 className="w-5 h-5 mr-3" />
                    Add New E-Clinic
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-aqua text-aqua hover:bg-aqua hover:text-white">
                    <Stethoscope className="w-5 h-5 mr-3" />
                    Register Doctor
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white">
                    <UserCog className="w-5 h-5 mr-3" />
                    Create Admin Account
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100">
                    <BarChart3 className="w-5 h-5 mr-3" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* E-Clinics Tab Content */}
        {activeTab === 'clinics' && (
          <div className="space-y-6">
            {/* Search and Filter Bar */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      placeholder="Search e-clinics..." 
                      className="pl-10 h-11 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <Button variant="outline" className="border-gray-300 h-11 px-6 rounded-xl">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white h-11 px-6 rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Add E-Clinic
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* E-Clinics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentClinics.map((clinic, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-[#E17726]/10 to-aqua/10 relative">
                    <div className="absolute top-4 right-4">
                      <Badge className={clinic.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {clinic.status}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                        <Building2 className="w-6 h-6 text-[#E17726]" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg text-midnight mb-2">{clinic.name}</h3>
                    <p className="text-gray-600 mb-4">{clinic.location}</p>
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <span>{clinic.admins} Admins</span>
                      <span>{clinic.doctors} Doctors</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1 rounded-lg">
                        View
                      </Button>
                      <Button size="sm" className="flex-1 bg-[#E17726] hover:bg-[#c9651e] text-white rounded-lg">
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Doctors Tab Content */}
        {activeTab === 'doctors' && (
          <DoctorsManagement />
        )}

        {/* Admins Tab Content */}
        {activeTab === 'admins' && (
          <AdminsManagement />
        )}

        {/* Analytics Tab Content */}
        {activeTab === 'analytics' && (
          <AnalyticsManagement />
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard; 