import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Stethoscope, 
  Activity, 
  Users, 
  Building2, 
  Globe,
  Calendar,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Plus
} from 'lucide-react';
import { superAdminApi, ClinicAnalytics } from '@/lib/api';

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<ClinicAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await superAdminApi.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-4">{error || 'Failed to load analytics data'}</p>
          <Button onClick={fetchAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    color = "blue",
    subtitle 
  }: {
    title: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: string;
    color?: string;
    subtitle?: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <TrendingUp className={`h-4 w-4 mr-1 ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-sm font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {trend}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`h-8 w-8 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProgressBar = ({ value, max, label, color = "blue" }: {
    value: number;
    max: number;
    label: string;
    color?: string;
  }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`bg-${color}-600 h-2 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into e-clinic performance</p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clinics"
          value={analytics.overview.total_clinics}
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Active Clinics"
          value={analytics.overview.active_clinics}
          icon={CheckCircle}
          color="green"
          subtitle={`${analytics.overview.activation_rate}% activation rate`}
        />
        <StatCard
          title="Verified Clinics"
          value={analytics.overview.verified_clinics}
          icon={CheckCircle}
          color="purple"
          subtitle={`${analytics.overview.verification_rate}% verification rate`}
        />
        <StatCard
          title="Online Clinics"
          value={analytics.overview.online_clinics}
          icon={Globe}
          color="orange"
          subtitle={`${analytics.overview.online_rate}% online rate`}
        />
      </div>

      {/* No Data Message */}
      {analytics.overview.total_clinics === 0 && (
        <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
          <CardContent className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Clinics Found</h3>
            <p className="text-gray-600 mb-4">
              There are currently no e-clinics in the system. Create some clinics to start seeing analytics data.
            </p>
            <Button 
              onClick={() => window.location.href = '/superadmin?tab=clinics'} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Clinic
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Growth Metrics - Only show if there are clinics */}
      {analytics.overview.total_clinics > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Growth Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  +{analytics.growth.new_clinics_7d}
                </div>
                <div className="text-sm text-gray-600">New Clinics (7 days)</div>
                <div className="text-xs text-green-500 mt-1">
                  {analytics.growth.growth_rate_7d}% growth rate
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  +{analytics.growth.new_clinics_30d}
                </div>
                <div className="text-sm text-gray-600">New Clinics (30 days)</div>
                <div className="text-xs text-blue-500 mt-1">
                  {analytics.growth.growth_rate_30d}% growth rate
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  +{analytics.growth.new_clinics_90d}
                </div>
                <div className="text-sm text-gray-600">New Clinics (90 days)</div>
                <div className="text-xs text-purple-500 mt-1">
                  {analytics.growth.growth_rate_90d}% growth rate
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analytics Tabs - Only show if there are clinics */}
      {analytics.overview.total_clinics > 0 && (
        <Tabs defaultValue="geographic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geographic" className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Geographic
          </TabsTrigger>
          <TabsTrigger value="specializations" className="flex items-center">
            <Stethoscope className="h-4 w-4 mr-2" />
            Specializations
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Recent Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geographic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Cities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Top Cities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.geographic.cities.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.geographic.cities.map((city, index) => (
                      <div key={city.city} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge variant="secondary" className="mr-3">
                            #{index + 1}
                          </Badge>
                          <span className="font-medium">{city.city}</span>
                        </div>
                        <span className="text-lg font-semibold text-blue-600">
                          {city.count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No geographic data available</p>
                    <p className="text-sm text-gray-400">Create some clinics to see geographic distribution</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top States */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-green-600" />
                  Top States
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.geographic.states.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.geographic.states.map((state, index) => (
                      <div key={state.state} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge variant="secondary" className="mr-3">
                            #{index + 1}
                          </Badge>
                          <span className="font-medium">{state.state}</span>
                        </div>
                        <span className="text-lg font-semibold text-green-600">
                          {state.count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No state data available</p>
                    <p className="text-sm text-gray-400">Create some clinics to see state distribution</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="specializations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2 text-purple-600" />
                  Top Specializations
                </div>
                <Badge variant="outline">
                  {analytics.specializations.total_specialties} Total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.specializations.top_specialties.length > 0 ? (
                <div className="space-y-4">
                  {analytics.specializations.top_specialties.map((specialty, index) => (
                    <div key={specialty.specialty} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-3">
                          #{index + 1}
                        </Badge>
                        <span className="font-medium">{specialty.specialty}</span>
                      </div>
                      <span className="text-lg font-semibold text-purple-600">
                        {specialty.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No specialization data available</p>
                  <p className="text-sm text-gray-400">Create clinics with specialties to see this data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
                  Monthly Growth Trends
                </div>
                <span className="text-sm text-gray-500">
                  Last updated: {analytics.trends.last_updated}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.trends.monthly_growth.map((month, index) => (
                  <div key={month.period} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                      <span className="font-medium">{month.month}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-semibold text-orange-600">
                        {month.count}
                      </span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min((month.count / Math.max(...analytics.trends.monthly_growth.map(m => m.count))) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.recent_activity.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recent_activity.map((clinic) => (
                    <div key={clinic.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {clinic.is_verified ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          {clinic.is_active ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{clinic.name}</h4>
                          <p className="text-sm text-gray-600">
                            {clinic.city}, {clinic.state}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{clinic.created_at}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400">Create some clinics to see recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AnalyticsDashboard; 