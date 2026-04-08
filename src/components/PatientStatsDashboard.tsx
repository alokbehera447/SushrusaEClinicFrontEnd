import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Activity, 
  BarChart3, 
  MapPin, 
  Calendar,
  TrendingUp,
  TrendingDown,
  User,
  Heart,
  Stethoscope
} from 'lucide-react';
import { 
  patientService, 
  type PatientStats 
} from '@/services/patientService';
import { toast } from '@/hooks/use-toast';

export const PatientStatsDashboard: React.FC = () => {
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await patientService.getPatientStats();
      if (response?.data) {
        setStats(response.data);
      } else {
        console.warn('No data received from patient stats API');
        setStats(null);
      }
    } catch (error) {
      console.error('Error loading patient stats:', error);
      toast({
        title: "Error",
        description: "Failed to load patient statistics",
        variant: "destructive",
      });
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const getGenderIcon = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'male':
        return <User className="h-4 w-4" />;
      case 'female':
        return <User className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getAgeRangeColor = (range: string) => {
    const colors: Record<string, string> = {
      '0-18': 'bg-blue-100 text-blue-800',
      '19-30': 'bg-green-100 text-green-800',
      '31-45': 'bg-yellow-100 text-yellow-800',
      '46-60': 'bg-orange-100 text-orange-800',
      '60+': 'bg-red-100 text-red-800'
    };
    return colors[range] || 'bg-gray-100 text-gray-800';
  };

  const getBloodGroupColor = (bloodGroup: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-50 text-red-700',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-50 text-blue-700',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-50 text-purple-700',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-green-50 text-green-700'
    };
    return colors[bloodGroup] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patient Statistics</h1>
          <p className="text-gray-600">Comprehensive overview of patient data and analytics</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Last updated: {new Date().toLocaleDateString()}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_patients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All registered patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.new_patients_this_month.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{((stats.new_patients_this_month / stats.total_patients) * 100).toFixed(1)}%</span> from total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active_patients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">{((stats.active_patients / stats.total_patients) * 100).toFixed(1)}%</span> of total patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Consultations</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.consultation_stats.avg_consultations_per_patient.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per patient
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gender Distribution
            </CardTitle>
            <CardDescription>
              Distribution of patients by gender
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.gender_distribution).map(([gender, count]) => (
                <div key={gender} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getGenderIcon(gender)}
                    <span className="capitalize">{gender}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(count / stats.total_patients) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {count.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Age Distribution
            </CardTitle>
            <CardDescription>
              Distribution of patients by age groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.age_distribution).map(([range, count]) => (
                <div key={range} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getAgeRangeColor(range)}>
                      {range}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(count / stats.total_patients) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {count.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Blood Group Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Blood Group Distribution
            </CardTitle>
            <CardDescription>
              Distribution of patients by blood group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(stats.blood_group_distribution).map(([bloodGroup, count]) => (
                <div key={bloodGroup} className="flex items-center justify-between p-2 border rounded">
                  <Badge className={getBloodGroupColor(bloodGroup)}>
                    {bloodGroup}
                  </Badge>
                  <span className="text-sm font-medium">
                    {count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Cities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Top Cities
            </CardTitle>
            <CardDescription>
              Cities with the most patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.top_cities.slice(0, 10).map(([city, count], index) => (
                <div key={city} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                    <span className="font-medium">{city}</span>
                  </div>
                  <Badge variant="outline">
                    {count.toLocaleString()} patients
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consultation Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Consultation Statistics
          </CardTitle>
          <CardDescription>
            Overview of consultation metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.consultation_stats.total_consultations.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Total Consultations</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.consultation_stats.avg_consultations_per_patient.toFixed(1)}
              </div>
              <p className="text-sm text-gray-600">Avg per Patient</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {(stats.consultation_stats.consultation_completion_rate * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Growth Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Patients This Month</span>
                <span className="text-sm font-medium text-green-600">
                  +{stats.new_patients_this_month}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Patient Rate</span>
                <span className="text-sm font-medium text-blue-600">
                  {((stats.active_patients / stats.total_patients) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Consultation Efficiency</span>
                <span className="text-sm font-medium text-purple-600">
                  {stats.consultation_stats.avg_consultations_per_patient.toFixed(1)} per patient
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Inactive Patients</span>
                <span className="text-sm font-medium text-red-600">
                  {stats.total_patients - stats.active_patients}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Consultation Completion</span>
                <span className="text-sm font-medium text-orange-600">
                  {(stats.consultation_stats.consultation_completion_rate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Patient Retention</span>
                <span className="text-sm font-medium text-yellow-600">
                  {((stats.active_patients / stats.total_patients) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
