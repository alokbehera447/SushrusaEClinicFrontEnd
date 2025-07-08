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
  Download
} from 'lucide-react';

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
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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

        {/* Other tab contents would be similar structured components */}
        {activeTab !== 'overview' && activeTab !== 'clinics' && (
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

export default SuperAdminDashboard; 