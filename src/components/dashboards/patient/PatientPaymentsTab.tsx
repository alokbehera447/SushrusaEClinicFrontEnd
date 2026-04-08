import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download } from 'lucide-react';
import { patientApi } from '@/lib/api';

const PatientPaymentsTab = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    patientApi.getPatientPayments()
      .then(setPayments)
      .catch(() => setError('Failed to load payments.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading payments...</div>;
  }
  if (error) {
    return <div className="py-12 text-center text-red-500">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-500" /> Payments</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-gray-500 text-center py-6">No payments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2 font-semibold text-midnight">₹{p.amount ?? p.formatted_amount ?? '-'}</td>
                    <td className="px-4 py-2 text-gray-600">{p.payment_method || '-'}</td>
                    <td className="px-4 py-2">
                      <Badge className={
                        p.payment_status === 'completed' ? 'bg-green-100 text-green-700' :
                        p.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {p.payment_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-gray-500">{p.created_at ? p.created_at.slice(0, 16).replace('T', ' ') : '-'}</td>
                    <td className="px-4 py-2">
                      {p.receipt_url ? (
                        <Button asChild variant="outline" size="icon">
                          <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" title="Download Receipt">
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

export default PatientPaymentsTab;
