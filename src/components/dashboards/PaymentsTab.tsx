import React, { useEffect, useState } from 'react';
import { adminConsultationApi, paymentApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

const PaymentsTab = () => {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    adminConsultationApi.getAllConsultations({ payment_status: 'pending', page_size: 50 })
      .then((res: any) => {
        console.log('PaymentsTab API response:', res);
        // Correct extraction: { count, next, previous, results: { success, data: [ ... ] } }
        let arr: any[] = [];
        if (res && res.results && Array.isArray(res.results.data)) {
          arr = res.results.data;
        } else if (res && Array.isArray(res)) {
          arr = res;
        }
        console.log('Extracted consultations array:', arr);
        setConsultations(arr);
      })
      .catch(() => setError('Failed to load consultations'))
      .finally(() => setLoading(false));
  }, []);

  const handlePayNow = async (consultation: any) => {
    setPayingId(consultation.id);
    setError('');
    try {
      const res = await paymentApi.initiatePayment({ consultation_id: consultation.id, amount: consultation.consultation_fee });
      setPaymentUrl(res.payment_url || '');
    } catch (e) {
      setError('Failed to initiate payment');
    } finally {
      setPayingId(null);
    }
  };

  const checkPaymentStatus = async (consultationId: string) => {
    setError('');
    try {
      const res = await paymentApi.getPaymentStatus({ consultation_id: consultationId });
      setPaymentStatus(res.status || '');
    } catch (e) {
      setError('Failed to fetch payment status');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-midnight">Consultation Payments</h2>
      {loading ? <Skeleton className="w-full h-16 my-8" /> : error ? <div className="text-red-600 mb-4">{error}</div> : (
        <div className="overflow-x-auto rounded-xl shadow border border-gray-200 bg-white">
          <Table>
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left">Patient</th>
                <th className="px-4 py-3 text-left">Doctor</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3">{c.patient_name}</td>
                  <td className="px-4 py-3">{c.doctor_name}</td>
                  <td className="px-4 py-3">{c.scheduled_date}</td>
                  <td className="px-4 py-3">₹{c.consultation_fee}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${c.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{c.payment_status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {c.payment_status === 'pending' ? (
                      <Button onClick={() => handlePayNow(c)} loading={payingId === c.id} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                        Pay Now
                      </Button>
                    ) : (
                      <Button onClick={() => checkPaymentStatus(c.id)} variant="outline" className="rounded-lg">View</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
      {/* Modal for paymentUrl/QR, etc. */}
      {paymentUrl && (
        <Dialog open={!!paymentUrl} onOpenChange={(open) => { if (!open) setPaymentUrl(''); }}>
          <DialogContent className="max-w-2xl w-full">
            <iframe src={paymentUrl} style={{ width: '100%', height: 600, border: 'none' }} title="PhonePe Payment" />
          </DialogContent>
        </Dialog>
      )}
      {/* Payment status display */}
      {paymentStatus && (
        <div className="mt-4 p-4 rounded bg-blue-50 text-blue-800 font-semibold">
          Payment Status: {paymentStatus}
        </div>
      )}
    </div>
  );
};

export default PaymentsTab; 