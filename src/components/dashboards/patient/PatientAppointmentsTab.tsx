import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { patientApi, Consultation } from '@/lib/api';

const PatientAppointmentsTab = () => {
  const [upcoming, setUpcoming] = useState<Consultation[]>([]);
  const [past, setPast] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    patientApi.getPatientConsultations()
      .then((data) => {
        const now = new Date();
        setUpcoming(
          data.filter(c => new Date(c.scheduled_date) >= now && c.status !== 'completed')
        );
        setPast(
          data.filter(c => new Date(c.scheduled_date) < now || c.status === 'completed')
        );
      })
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading appointments...</div>;
  }
  if (error) {
    return <div className="py-12 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500" /> Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <div className="text-gray-500 text-center py-6">No upcoming appointments.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {upcoming.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-semibold text-midnight">{c.doctor_name}</div>
                    <div className="text-sm text-gray-500">{c.consultation_type} • {c.scheduled_date} {c.scheduled_time}</div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">{c.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Past Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {past.length === 0 ? (
            <div className="text-gray-500 text-center py-6">No past appointments.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {past.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-semibold text-midnight">{c.doctor_name}</div>
                    <div className="text-sm text-gray-500">{c.consultation_type} • {c.scheduled_date} {c.scheduled_time}</div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">{c.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientAppointmentsTab;
