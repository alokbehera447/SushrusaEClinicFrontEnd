import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Stethoscope, 
  UserCog, 
  Users, 
  Video, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Loader2,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Clock,
  Star,
  MapPin,
  Globe,
  Zap
} from 'lucide-react';
import { superAdminApi, SuperAdminOverviewStats } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const SuperAdminOverview = () => {
  const [overviewStats, setOverviewStats] = useState<SuperAdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchOverviewStats = async () => {
    try {
      setLoading(true);
      const stats = await superAdminApi.getOverviewStats();
      setOverviewStats(stats);
    } catch (error) {
      console.error('Failed to fetch overview stats:', error);
      toast({
        title: "Error",
        description: "Failed to load overview statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOverviewStats();
    setRefreshing(false);
    toast({
      title: "Success",
      description: "Overview statistics refreshed",
    });
  };

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  const statsCards = [
    {
      title: 'Total Clinics',
      value: overviewStats?.total_clinics.value || 0,
      change: overviewStats?.total_clinics.change || '+0',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: overviewStats?.total_clinics.change?.startsWith('+') ? 'up' : 'down'
    },
    {
      title: 'Active Clinics',
      value: overviewStats?.active_clinics.value || 0,
      change: overviewStats?.active_clinics.change || '+0',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: overviewStats?.active_clinics.change?.startsWith('+') ? 'up' : 'down'
    },
    {
      title: 'Total Doctors',
      value: overviewStats?.total_doctors.value || 0,
      change: overviewStats?.total_doctors.change || '+0',
      icon: Stethoscope,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: overviewStats?.total_doctors.change?.startsWith('+') ? 'up' : 'down'
    },
    {
      title: 'Active Doctors',
      value: overviewStats?.active_doctors.value || 0,
      change: overviewStats?.active_doctors.change || '+0',
      icon: Stethoscope,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      trend: overviewStats?.active_doctors.change?.startsWith('+') ? 'up' : 'down'
    },
    {
      title: 'Total Admins',
      value: overviewStats?.total_admins.value || 0,
      change: overviewStats?.total_admins.change || '+0',
      icon: UserCog,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: overviewStats?.total_admins.change?.startsWith('+') ? 'up' : 'down'
    },
    {
      title: 'Total Patients',
      value: overviewStats?.total_patients.value || 0,
      change: overviewStats?.total_patients.change || '+0',
      icon: Users,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      trend: overviewStats?.total_patients.change?.startsWith('+') ? 'up' : 'down'
    },
    {
      title: 'Total Consultations',
      value: overviewStats?.total_consultations.value || 0,
      change: overviewStats?.total_consultations.change || '+0',
      icon: Video,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      trend: overviewStats?.total_consultations.change?.startsWith('+') ? 'up' : 'down'
    },
    {
      title: 'Total Revenue',
      value: `₹${(overviewStats?.total_revenue.value || 0).toLocaleString()}`,
      change: `₹${overviewStats?.total_revenue.change || '+0'}`,
      icon: DollarSign,
      color: 'text-[#E17726]',
      bgColor: 'bg-[#E17726]/10',
      trend: overviewStats?.total_revenue.change?.startsWith('+') ? 'up' : 'down'
    }
  ];

  const quickActions = [
    {
      title: 'View Analytics',
      description: 'Detailed platform analytics',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '#analytics'
    },
    {
      title: 'Manage Clinics',
      description: 'E-Clinic management',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '#clinics'
    },
    {
      title: 'Doctor Management',
      description: 'Doctor profiles & verification',
      icon: Stethoscope,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '#doctors'
    },
    {
      title: 'Admin Panel',
      description: 'Admin user management',
      icon: UserCog,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: '#admins'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#E17726] mx-auto mb-4" />
          <p className="text-gray-600">Loading platform overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-midnight mb-2">Platform Overview</h2>
          <p className="text-gray-600">Comprehensive statistics and insights for the entire platform</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-midnight mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#E17726]" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  className={`p-4 rounded-xl ${action.bgColor} hover:shadow-md transition-all duration-200 text-left group`}
                  onClick={() => {
                    // Handle navigation to different tabs
                    const event = new CustomEvent('changeTab', { detail: action.href.replace('#', '') });
                    window.dispatchEvent(event);
                  }}
                >
                  <div className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <h3 className="font-semibold text-midnight mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Platform Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Platform Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Status</span>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Response Time</span>
                <span className="text-sm font-medium">~120ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm font-medium">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <span className="text-sm font-medium">156</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New clinic registered</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Doctor verification completed</p>
                  <p className="text-xs text-gray-500">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New consultation scheduled</p>
                  <p className="text-xs text-gray-500">8 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment processed</p>
                  <p className="text-xs text-gray-500">12 minutes ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminOverview; 