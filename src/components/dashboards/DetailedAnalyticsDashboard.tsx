import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard, 
  Calendar,
  Users,
  Building2,
  Stethoscope,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
  MapPin,
  Star,
  Target,
  Zap,
  Award,
  TrendingUpIcon,
  TrendingDownIcon
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { adminAnalyticsApi, DetailedAnalytics } from '@/lib/api';
import { toast } from 'sonner';

const DetailedAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<DetailedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedClinic, setSelectedClinic] = useState('all');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading detailed analytics...');
      const data = await adminAnalyticsApi.getDetailedAnalytics();
      console.log('📊 Analytics response:', data);
      setAnalyticsData(data);
    } catch (err) {
      console.error('❌ Error loading analytics:', err);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-500">Unable to load analytics data at this time.</p>
      </div>
    );
  }

  const { overview, today, this_month, clinic_performance, consultation_analytics, payment_analytics, doctor_performance, patient_analytics } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clinic Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into your e-clinic operations, consultations, and payments</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{overview.total_revenue.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    +{this_month.growth_rate}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Consultations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.total_consultations.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
                  <span className="text-sm font-medium text-blue-600">
                    +{today.consultations} today
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clinics</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.active_clinics}
                </p>
                <div className="flex items-center mt-2">
                  <Building2 className="w-4 h-4 text-purple-600 mr-1" />
                  <span className="text-sm font-medium text-purple-600">
                    of {overview.total_clinics} total
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.success_rate.toFixed(1)}%
                </p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    Excellent
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Today's Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{today.consultations}</div>
              <div className="text-sm text-gray-600">Consultations</div>
              <div className="text-xs text-green-600 mt-1">
                {today.completed_consultations} completed
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">₹{today.revenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Revenue</div>
              <div className="text-xs text-blue-600 mt-1">
                {payment_analytics.successful_payments} payments
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{today.new_patients}</div>
              <div className="text-sm text-gray-600">New Patients</div>
              <div className="text-xs text-purple-600 mt-1">
                {patient_analytics.active_patients} active
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{today.cancelled_consultations}</div>
              <div className="text-sm text-gray-600">Cancelled</div>
              <div className="text-xs text-red-600 mt-1">
                {((today.cancelled_consultations / today.consultations) * 100).toFixed(1)}% rate
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinic Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Your Clinic Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clinic Name</TableHead>
                <TableHead>Consultations</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Active Doctors</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinic_performance.map((clinic) => (
                <TableRow key={clinic.id}>
                  <TableCell className="font-medium">{clinic.name}</TableCell>
                  <TableCell>{clinic.consultations.toLocaleString()}</TableCell>
                  <TableCell>₹{clinic.revenue.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={clinic.success_rate >= 90 ? 'default' : 'secondary'}>
                      {clinic.success_rate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>{clinic.active_doctors}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {clinic.success_rate >= 90 ? (
                        <Award className="w-4 h-4 text-yellow-500 mr-1" />
                      ) : clinic.success_rate >= 75 ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-orange-500 mr-1" />
                      )}
                      <span className="text-sm">
                        {clinic.success_rate >= 90 ? 'Excellent' : 
                         clinic.success_rate >= 75 ? 'Good' : 'Needs Attention'}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Doctor Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Stethoscope className="w-5 h-5 mr-2" />
            Top Performing Doctors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Consultations</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Success Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctor_performance.slice(0, 10).map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">{doctor.name}</TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>{doctor.consultations.toLocaleString()}</TableCell>
                  <TableCell>₹{doctor.revenue.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span>{doctor.rating.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={doctor.success_rate >= 90 ? 'default' : 'secondary'}>
                      {doctor.success_rate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Payments</span>
                <span className="text-lg font-bold">{payment_analytics.total_payments.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Successful</span>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-lg font-bold text-green-600">
                    {payment_analytics.successful_payments.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Failed</span>
                <div className="flex items-center">
                  <XCircle className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-lg font-bold text-red-600">
                    {payment_analytics.failed_payments.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending</span>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-lg font-bold text-orange-600">
                    {payment_analytics.pending_payments.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Transaction</span>
                <span className="text-lg font-bold">₹{payment_analytics.average_transaction_value.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Patient Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Patients</span>
                <span className="text-lg font-bold">{patient_analytics.total_patients.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">New This Month</span>
                <div className="flex items-center">
                  <UserCheck className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-lg font-bold text-green-600">
                    {patient_analytics.new_patients_this_month.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Patients</span>
                <div className="flex items-center">
                  <Activity className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-lg font-bold text-blue-600">
                    {patient_analytics.active_patients.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Top Cities</span>
                <div className="space-y-1">
                  {patient_analytics.top_cities.slice(0, 3).map((city, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                        <span>{city.city}</span>
                      </div>
                      <span className="font-medium">{city.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consultation Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Consultation Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">By Status</h4>
              <div className="space-y-2">
                {Object.entries(consultation_analytics.by_status).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{status}</span>
                    <Badge variant="outline">{count.toLocaleString()}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">By Type</h4>
              <div className="space-y-2">
                {Object.entries(consultation_analytics.by_type).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{type}</span>
                    <Badge variant="outline">{count.toLocaleString()}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Peak Hours</h4>
              <div className="space-y-2">
                {consultation_analytics.peak_hours.slice(0, 5).map((hour, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{hour.hour}:00</span>
                    <Badge variant="outline">{hour.count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailedAnalyticsDashboard; 