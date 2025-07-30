import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  RefreshCw,
  Loader2,
  Building2,
  Stethoscope,
  UserCog,
  Video,
  PieChart,
  LineChart,
  BarChart,
  MapPin,
  Globe,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { superAdminApi, SuperAdminAnalytics as AnalyticsData } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const SuperAdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [showCharts, setShowCharts] = useState(true);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await superAdminApi.getComprehensiveAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
    toast({
      title: "Success",
      description: "Analytics data refreshed",
    });
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Mock data for charts (replace with real chart components)
  const chartData = {
    revenue: [
      { month: 'Jan', value: 45000 },
      { month: 'Feb', value: 52000 },
      { month: 'Mar', value: 48000 },
      { month: 'Apr', value: 61000 },
      { month: 'May', value: 55000 },
      { month: 'Jun', value: 67000 }
    ],
    consultations: [
      { month: 'Jan', value: 120 },
      { month: 'Feb', value: 145 },
      { month: 'Mar', value: 138 },
      { month: 'Apr', value: 167 },
      { month: 'May', value: 189 },
      { month: 'Jun', value: 234 }
    ],
    patients: [
      { month: 'Jan', value: 45 },
      { month: 'Feb', value: 52 },
      { month: 'Mar', value: 48 },
      { month: 'Apr', value: 61 },
      { month: 'May', value: 55 },
      { month: 'Jun', value: 67 }
    ]
  };

  const kpiData = [
    {
      title: 'Total Revenue',
      value: `₹${(analytics?.revenue_analytics.total_revenue || 0).toLocaleString()}`,
      change: `${analytics?.revenue_analytics.growth_rate || 0}%`,
      trend: (analytics?.revenue_analytics.growth_rate || 0) >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'text-[#E17726]',
      bgColor: 'bg-[#E17726]/10'
    },
    {
      title: 'Total Consultations',
      value: analytics?.consultation_analytics.total_consultations || 0,
      change: `${((analytics?.consultation_analytics.completed_consultations || 0) / (analytics?.consultation_analytics.total_consultations || 1) * 100).toFixed(1)}%`,
      trend: 'up',
      icon: Video,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Patients',
      value: analytics?.patient_analytics.total_patients || 0,
      change: `${analytics?.patient_analytics.new_patients_this_month || 0}`,
      trend: 'up',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Active Clinics',
      value: analytics?.clinic_analytics.active_clinics || 0,
      change: `${analytics?.clinic_analytics.verified_clinics || 0}`,
      trend: 'up',
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Active Doctors',
      value: analytics?.doctor_analytics.active_doctors || 0,
      change: `${analytics?.doctor_analytics.verified_doctors || 0}`,
      trend: 'up',
      icon: Stethoscope,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Avg. Consultation Duration',
      value: `${Math.round(analytics?.consultation_analytics.average_duration || 0)} min`,
      change: '23 min',
      trend: 'down',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#E17726] mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-midnight mb-2">Platform Analytics</h2>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setShowCharts(!showCharts)}
            variant="outline"
            size="sm"
          >
            {showCharts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${kpi.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${kpi.color}`} />
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
          );
        })}
      </div>

      {/* Charts Section */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#E17726]" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Revenue chart will be displayed here</p>
                  <p className="text-sm text-gray-400">Chart component integration needed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consultations Chart */}
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                Consultation Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Consultation chart will be displayed here</p>
                  <p className="text-sm text-gray-400">Chart component integration needed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Revenue Sources */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#E17726]" />
              Top Revenue Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.revenue_analytics.top_revenue_sources.slice(0, 5).map((source, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#E17726] text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-midnight">{source.doctor_name}</p>
                      <p className="text-sm text-gray-500">Doctor</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#E17726]">₹{source.total_revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Doctors */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-purple-600" />
              Top Performing Doctors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.doctor_analytics.top_doctors.slice(0, 5).map((doctor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-midnight">{doctor.doctor_name}</p>
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-500">{doctor.rating}/5</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-purple-600">{doctor.consultations}</p>
                    <p className="text-xs text-gray-500">Consultations</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Geographic Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Top Cities */}
            <div>
              <h4 className="font-semibold text-midnight mb-3">Top Cities</h4>
              <div className="space-y-2">
                {analytics?.patient_analytics.top_cities.slice(0, 5).map((city, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{city.city}</span>
                    <Badge variant="secondary">{city.count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Consultation Types */}
            <div>
              <h4 className="font-semibold text-midnight mb-3">Consultation Types</h4>
              <div className="space-y-2">
                {Object.entries(analytics?.consultation_analytics.consultation_types || {}).map(([type, count], index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Hours */}
            <div>
              <h4 className="font-semibold text-midnight mb-3">Peak Hours</h4>
              <div className="space-y-2">
                {analytics?.consultation_analytics.peak_hours.slice(0, 5).map((hour, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{hour.hour}:00</span>
                    <Badge variant="secondary">{hour.count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consultation Performance */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Consultation Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Consultations</span>
                <span className="font-semibold">{analytics?.consultation_analytics.total_consultations || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="font-semibold text-green-600">{analytics?.consultation_analytics.completed_consultations || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cancelled</span>
                <span className="font-semibold text-red-600">{analytics?.consultation_analytics.cancelled_consultations || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Duration</span>
                <span className="font-semibold">{Math.round(analytics?.consultation_analytics.average_duration || 0)} min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Demographics */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Patient Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Patients</span>
                <span className="font-semibold">{analytics?.patient_analytics.total_patients || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New This Month</span>
                <span className="font-semibold text-green-600">{analytics?.patient_analytics.new_patients_this_month || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Patients</span>
                <span className="font-semibold text-blue-600">{analytics?.patient_analytics.active_patients || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Growth Rate</span>
                <span className="font-semibold text-[#E17726]">+12.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Health */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              Platform Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Clinics</span>
                <span className="font-semibold text-green-600">{analytics?.clinic_analytics.active_clinics || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Verified Clinics</span>
                <span className="font-semibold text-blue-600">{analytics?.clinic_analytics.verified_clinics || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Doctors</span>
                <span className="font-semibold text-purple-600">{analytics?.doctor_analytics.active_doctors || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Status</span>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminAnalytics; 