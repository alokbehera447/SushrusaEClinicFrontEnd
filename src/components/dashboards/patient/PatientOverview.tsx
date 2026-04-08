import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  FileText, 
  Pill, 
  CheckCircle, 
  Bell, 
  Smartphone, 
  TrendingUp,
  Activity,
  Heart,
  HeartPulse
} from 'lucide-react';

interface PatientOverviewProps {
  stats: {
    totalConsultations: number;
    upcomingConsultations: number;
    completedConsultations: number;
    activePrescriptions: number;
    totalMedicalRecords: number;
    totalDocuments: number;
    totalNotes: number;
    totalPayments: number;
    unreadNotifications: number;
    activeSessions: number;
  };
  healthMetrics: any[];
  recentActivity: any[];
}

const PatientOverview: React.FC<PatientOverviewProps> = ({ 
  stats, 
  healthMetrics, 
  recentActivity 
}) => {
  return (
    <div className="space-y-6">
      {/* Quick Stats - Enhanced with All APIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Consultations</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalConsultations}</p>
                <p className="text-xs text-blue-500">{stats.upcomingConsultations} upcoming</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Medical Records</p>
                <p className="text-2xl font-bold text-green-900">{stats.totalMedicalRecords}</p>
                <p className="text-xs text-green-500">{stats.totalDocuments} documents</p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Prescriptions</p>
                <p className="text-2xl font-bold text-purple-900">{stats.activePrescriptions}</p>
                <p className="text-xs text-purple-500">Active medicines</p>
              </div>
              <Pill className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Payments</p>
                <p className="text-2xl font-bold text-orange-900">{stats.totalPayments}</p>
                <p className="text-xs text-orange-500">{stats.totalNotes} notes</p>
              </div>
              <CheckCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-600">Notifications</p>
                <p className="text-2xl font-bold text-teal-900">{stats.unreadNotifications + stats.totalPayments}</p>
                <p className="text-xs text-teal-500">{stats.unreadNotifications} unread</p>
              </div>
              <Bell className="w-8 h-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-600">Active Sessions</p>
                <p className="text-2xl font-bold text-pink-900">{stats.activeSessions}</p>
                <p className="text-xs text-pink-500">Logged in devices</p>
              </div>
              <Smartphone className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">Health Score</p>
                <p className="text-2xl font-bold text-indigo-900">85%</p>
                <p className="text-xs text-indigo-500">Based on metrics</p>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              Health Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthMetrics.map((metric) => (
                <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <HeartPulse className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="font-medium capitalize">{metric.type.replace('_', ' ')}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{metric.value} {metric.unit}</span>
                    <div className={`text-xs ${
                      metric.status === 'normal' ? 'text-green-600' :
                      metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {metric.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border-l-4 border-l-blue-500 bg-blue-50 rounded-r-lg">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientOverview;