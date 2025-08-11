import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Users,
  DollarSign,
  Activity,
  Star,
  Award,
  Target,
  Zap
} from 'lucide-react';
import { Consultation as ApiConsultation } from '@/lib/api';
import { formatDate } from '@/lib/api';

// Extend the API's Consultation type
interface Consultation extends ApiConsultation {
  doctor_meeting_link?: string;
  prescription?: {
    id: string;
    medicines: string[];
    instructions: string;
    writtenDate: string;
  }
}

interface ConsultationStatsProps {
  consultations: Consultation[];
}

const ConsultationStats: React.FC<ConsultationStatsProps> = ({ consultations }) => {
  const getStats = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      total: consultations.length,
      today: consultations.filter(c => c.scheduled_date === today).length,
      thisWeek: consultations.filter(c => new Date(c.scheduled_date) >= thisWeek).length,
      thisMonth: consultations.filter(c => new Date(c.scheduled_date) >= thisMonth).length,
      completed: consultations.filter(c => c.status === 'completed').length,
      scheduled: consultations.filter(c => c.status === 'scheduled').length,
      cancelled: consultations.filter(c => c.status === 'cancelled').length,
      inProgress: consultations.filter(c => c.status === 'in-progress').length,
      totalRevenue: consultations
        .filter(c => c.is_paid)
        .reduce((sum, c) => sum + Number(c.consultation_fee), 0),
      avgConsultationFee: consultations.length > 0 
        ? consultations.reduce((sum, c) => sum + Number(c.consultation_fee), 0) / consultations.length 
        : 0,
      completionRate: consultations.length > 0 
        ? (consultations.filter(c => c.status === 'completed').length / consultations.length) * 100 
        : 0,
      cancellationRate: consultations.length > 0 
        ? (consultations.filter(c => c.status === 'cancelled').length / consultations.length) * 100 
        : 0
    };

    return stats;
  };

  const getConsultationTypeDistribution = () => {
    const distribution = consultations.reduce((acc, consultation) => {
      const type = consultation.consultation_type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([type, count]) => ({
      type: type.replace('_', ' '),
      count,
      percentage: (count / consultations.length) * 100
    }));
  };

  const getRecentActivity = () => {
    return consultations
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  };

  const getPerformanceMetrics = () => {
    const stats = getStats();
    
    return [
      {
        label: 'Completion Rate',
        value: `${stats.completionRate.toFixed(1)}%`,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        trend: stats.completionRate > 80 ? 'up' : 'down'
      },
      {
        label: 'Avg. Consultation Fee',
        value: `₹${stats.avgConsultationFee.toFixed(0)}`,
        icon: DollarSign,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        trend: 'up'
      },
      {
        label: 'Cancellation Rate',
        value: `${stats.cancellationRate.toFixed(1)}%`,
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        trend: stats.cancellationRate < 10 ? 'down' : 'up'
      },
      {
        label: 'Total Revenue',
        value: `₹${stats.totalRevenue.toLocaleString()}`,
        icon: TrendingUp,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        trend: 'up'
      }
    ];
  };

  const stats = getStats();
  const typeDistribution = getConsultationTypeDistribution();
  const recentActivity = getRecentActivity();
  const performanceMetrics = getPerformanceMetrics();

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                </div>
                <div className={`p-3 rounded-full ${metric.bgColor}`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
              <div className="flex items-center mt-2">
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className="text-xs text-gray-500">
                  {metric.trend === 'up' ? 'Improving' : 'Needs attention'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Consultation Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultation Type Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Consultation Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {typeDistribution.map((type, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium capitalize">{type.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold">{type.count}</span>
                    <span className="text-xs text-gray-500">({type.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((consultation, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="text-sm font-medium">{consultation.patient_name}</p>
                        <p className="text-xs text-gray-500">{consultation.chief_complaint}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{formatDate(consultation.scheduled_date)}</p>
                      <Badge 
                        variant={consultation.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {consultation.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Time-based Statistics */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Time-based Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Today</span>
              <span className="text-lg font-bold text-blue-600">{stats.today}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Week</span>
              <span className="text-lg font-bold text-green-600">{stats.thisWeek}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="text-lg font-bold text-purple-600">{stats.thisMonth}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-lg font-bold text-gray-900">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">Scheduled</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats.scheduled}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-600">In Progress</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{stats.inProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600">Cancelled</span>
              </div>
              <span className="text-lg font-bold text-red-600">{stats.cancelled}</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">View Schedule</span>
              </div>
            </button>
            <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Patient List</span>
              </div>
            </button>
            <button className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Analytics</span>
              </div>
            </button>
            <button className="w-full p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Performance</span>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsultationStats;
