import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, CheckCircle, Activity } from 'lucide-react';
import { patientApi, PatientProfile, Consultation } from '@/lib/api';
import PatientIDCard from '@/components/patient/PatientIDCard';

const PatientOverviewTab = () => {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      patientApi.getCurrentUserProfile(),
      patientApi.getPatientStats(),
      patientApi.getPatientConsultations()
    ])
      .then(([profileData, statsData, consultData]) => {
        setProfile(profileData as PatientProfile);
        setStats(statsData);
        // Take only the first 5 consultations for recent activity
        setRecent(consultData.slice(0, 5) || []);
      })
      .catch((e) => setError('Failed to load patient overview.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading overview...</div>;
  }
  if (error) {
    return <div className="py-12 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {profile && (
        <PatientIDCard
          name={profile.user_name || profile.name || 'Patient'}
          patientId={profile.id || profile.user_id || 'ID'}
          dateOfBirth={profile.date_of_birth}
          age={undefined}
          gender={profile.gender}
          phone={profile.user_phone || profile.phone}
          profilePicture={profile.profile_picture}
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Welcome Card */}
        <Card className="md:col-span-1 flex flex-col items-center justify-center p-6">
          <Avatar className="w-20 h-20 mb-4">
            <AvatarFallback>{profile?.user_name?.[0] || 'P'}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-bold mb-1">{profile?.user_name || 'Patient'}</CardTitle>
          <p className="text-gray-600 mb-2">{profile?.user_email}</p>
          <Badge variant="outline" className="mb-2">{profile?.gender}</Badge>
          <div className="text-sm text-gray-500">{profile?.city}, {profile?.state}</div>
        </Card>
        {/* Stats Cards */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="flex flex-col items-center p-4">
            <Users className="w-8 h-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{stats?.total_consultations ?? 0}</div>
            <div className="text-gray-600">Total Consultations</div>
          </Card>
          <Card className="flex flex-col items-center p-4">
            <Calendar className="w-8 h-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{stats?.upcoming_appointments ?? 0}</div>
            <div className="text-gray-600">Upcoming Appointments</div>
          </Card>
          <Card className="flex flex-col items-center p-4">
            <CheckCircle className="w-8 h-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">{stats?.completed_consultations ?? 0}</div>
            <div className="text-gray-600">Completed</div>
          </Card>
        </div>
        {/* Recent Activity */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Recent Consultations</CardTitle>
            </CardHeader>
            <CardContent>
              {recent.length === 0 ? (
                <div className="text-gray-500 text-center py-6">No recent consultations.</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {recent.map((c) => (
                    <li key={c.id} className="flex items-center justify-between py-3">
                      <div>
                        <div className="font-semibold text-midnight">{c.doctor_name}</div>
                        <div className="text-sm text-gray-500">{c.consultation_type} • {c.scheduled_date}</div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">{c.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientOverviewTab;
