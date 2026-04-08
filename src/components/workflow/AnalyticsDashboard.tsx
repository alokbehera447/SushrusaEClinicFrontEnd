import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign,
  Calendar,
  Activity,
  Heart,
  Clock,
  Star,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 3m, 1y
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Mock data
  const kpiData = [
    {
      title: 'Total Revenue',
      value: '₹2,45,680',
      change: '+18.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-[#E17726]',
      bgColor: 'bg-[#E17726]/10'
    },
    {
      title: 'Total Patients',
      value: '1,247',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-aqua',
      bgColor: 'bg-aqua/10'
    },
    {
      title: 'Consultations',
      value: '892',
      change: '+8.3%',
      trend: 'up',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Avg. Wait Time',
      value: '23 min',
      change: '-15.2%',
      trend: 'down',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Patient Satisfaction',
      value: '4.8/5',
      change: '+0.3',
      trend: 'up',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Cancellation Rate',
      value: '5.2%',
      change: '-2.1%',
      trend: 'down',
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  const topDoctors = [
    {
      name: 'Dr. Priya Singh',
      specialty: 'Cardiology',
      consultations: 156,
      revenue: '₹78,000',
      rating: 4.9,
      growth: '+15%'
    },
    {
      name: 'Dr. Amit Kumar',
      specialty: 'General Medicine',
      consultations: 142,
      revenue: '₹56,800',
      rating: 4.7,
      growth: '+12%'
    },
    {
      name: 'Dr. Neha Jain',
      specialty: 'Orthopedics',
      consultations: 134,
      revenue: '₹80,400',
      rating: 4.8,
      growth: '+18%'
    },
    {
      name: 'Dr. Rajesh Verma',
      specialty: 'Dermatology',
      consultations: 128,
      revenue: '₹51,200',
      rating: 4.6,
      growth: '+9%'
    }
  ];

  const revenueData = [
    { period: 'Jan', revenue: 45000, consultations: 156 },
    { period: 'Feb', revenue: 52000, consultations: 178 },
    { period: 'Mar', revenue: 48000, consultations: 162 },
    { period: 'Apr', revenue: 61000, consultations: 203 },
    { period: 'May', revenue: 58000, consultations: 189 },
    { period: 'Jun', revenue: 67000, consultations: 218 }
  ];

  const patientFlow = [
    { hour: '9 AM', patients: 12 },
    { hour: '10 AM', patients: 18 },
    { hour: '11 AM', patients: 24 },
    { hour: '12 PM', patients: 15 },
    { hour: '1 PM', patients: 8 },
    { hour: '2 PM', patients: 22 },
    { hour: '3 PM', patients: 28 },
    { hour: '4 PM', patients: 25 },
    { hour: '5 PM', patients: 20 }
  ];

  const specialtyDistribution = [
    { specialty: 'General Medicine', count: 342, percentage: 38.4, color: 'bg-[#E17726]' },
    { specialty: 'Cardiology', count: 234, percentage: 26.2, color: 'bg-aqua' },
    { specialty: 'Orthopedics', count: 178, percentage: 19.9, color: 'bg-green-500' },
    { specialty: 'Dermatology', count: 138, percentage: 15.5, color: 'bg-purple-500' }
  ];

  const timeRanges = [
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '3m', label: 'Last 3 Months' },
    { id: '1y', label: 'Last Year' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-midnight">Analytics Dashboard</h1>
              <Badge className="bg-[#E17726]/10 text-[#E17726] border-[#E17726]/20">
                Real-time Data
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {timeRanges.map((range) => (
                  <Button
                    key={range.id}
                    variant={timeRange === range.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTimeRange(range.id)}
                    className={timeRange === range.id ? 'bg-[#E17726] text-white' : ''}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
              <Button variant="outline" className="border-gray-300">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {kpiData.map((kpi, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${kpi.bgColor} flex items-center justify-center`}>
                    <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                  <div className={`flex items-center text-sm font-medium ${
                    kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {kpi.change}
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-midnight mb-1">{kpi.value}</p>
                  <p className="text-sm text-gray-600">{kpi.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold text-midnight">Revenue Trend</CardTitle>
              <Button variant="outline" size="sm" className="border-gray-300">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {revenueData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-[#E17726] to-[#E17726]/60 rounded-t-lg relative"
                      style={{ height: `${(data.revenue / 70000) * 200}px` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                        ₹{(data.revenue / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 font-medium">{data.period}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#E17726]">₹3.31L</p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-aqua">1,106</p>
                  <p className="text-sm text-gray-600">Total Consultations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Flow Chart */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-midnight">Patient Flow (Today)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {patientFlow.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-aqua to-aqua/60 rounded-t-lg relative"
                      style={{ height: `${(data.patients / 30) * 200}px` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                        {data.patients}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 font-medium">{data.hour}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <p className="text-2xl font-bold text-aqua">172</p>
                <p className="text-sm text-gray-600">Total Patients Today</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Performing Doctors */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-midnight">Top Performing Doctors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topDoctors.map((doctor, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#E17726] text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-midnight text-sm">{doctor.name}</h4>
                      <p className="text-xs text-gray-600">{doctor.specialty}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600">{doctor.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-midnight">{doctor.revenue}</p>
                    <p className="text-xs text-gray-600">{doctor.consultations} consultations</p>
                    <p className="text-xs text-green-600 font-medium">{doctor.growth}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Specialty Distribution */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-midnight">Consultations by Specialty</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {specialtyDistribution.map((specialty, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{specialty.specialty}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-midnight">{specialty.count}</span>
                      <span className="text-xs text-gray-500">({specialty.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${specialty.color}`}
                      style={{ width: `${specialty.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Consultations:</span>
                  <span className="text-sm font-bold text-midnight">892</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Insights */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-midnight">Key Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800">Revenue Growth</h4>
                    <p className="text-sm text-green-700 mt-1">
                      18.2% increase in revenue compared to last month, driven by higher consultation volume.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800">Wait Time Improvement</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Average wait time reduced by 15.2% through better queue management.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <Heart className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-800">Patient Satisfaction</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      High satisfaction rate of 4.8/5 maintained across all specialties.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-purple-800">Peak Hours</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Highest patient flow between 3-4 PM. Consider optimizing staff allocation.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 