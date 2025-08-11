import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { patientApi, MedicalRecord } from '@/lib/api';

const PatientRecordsTab = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    patientApi.getPatientMedicalRecords()
      .then(setRecords)
      .catch(() => setError('Failed to load medical records.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading medical records...</div>;
  }
  if (error) {
    return <div className="py-12 text-center text-red-500">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-blue-500" /> Medical Records</CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-gray-500 text-center py-6">No medical records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {records.map((rec) => (
                  <tr key={rec.id}>
                    <td className="px-4 py-2 font-semibold text-midnight">{rec.title}</td>
                    <td className="px-4 py-2 text-gray-600">{rec.record_type}</td>
                    <td className="px-4 py-2 text-gray-500">{rec.date_recorded}</td>
                    <td className="px-4 py-2">
                      {rec.document ? (
                        <Button asChild variant="outline" size="icon">
                          <a href={rec.document} target="_blank" rel="noopener noreferrer" title="Download">
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientRecordsTab;
