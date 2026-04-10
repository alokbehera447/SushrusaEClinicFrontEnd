import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, ExternalLink } from 'lucide-react';
import { patientApi } from '@/lib/api';
import { razorpayService } from '@/services/razorpayService';
import { useToast } from '@/components/ui/use-toast';

const PatientPaymentsTab = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [payingId, setPayingId] = useState<string | null>(null);

  const handleQuickPayment = async () => {
    const amountInput = window.prompt('Enter amount to pay (in INR):', '10');
    if (!amountInput) return;
    const amount = Number(amountInput);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }
    
    try {
      await razorpayService.initiatePayment({
        amount: amount,
        description: 'Test/Quick Arbitrary Payment',
      }, {}, (status) => {
        if (status === 'success') {
           toast({ title: 'Payment Successful!' });
           patientApi.getPatientPayments().then(setPayments);
        } else if (status === 'failed') {
           toast({ title: 'Payment Failed', variant: 'destructive' });
        }
      });
    } catch (e: any) {
      toast({ title: 'Error launching payment', description: e.message, variant: 'destructive' });
    }
  };

  const handlePayNow = async (p: any) => {
    try {
      setPayingId(p.id);
      await razorpayService.initiatePayment({
        amount: Number(p.amount) || Number(p.formatted_amount),
        description: `Payment for consultation ${p.consultation_id || ''}`,
        consultation_id: p.consultation_id || p.consultation,
      }, {}, (status) => {
        if (status === 'success') {
           toast({ title: 'Payment Successful! Please refresh the page.' });
           // Optionally refresh payments
           patientApi.getPatientPayments().then(setPayments);
        } else if (status === 'failed') {
           toast({ title: 'Payment Failed', variant: 'destructive' });
        }
        if (status === 'success' || status === 'failed' || status === 'cancelled') {
           setPayingId(null);
        }
      });
    } catch (e: any) {
      toast({ title: 'Error launching payment', description: e.message, variant: 'destructive' });
      setPayingId(null);
    }
  };

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
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-500" /> Payments</CardTitle>
        <Button onClick={handleQuickPayment} variant="secondary" className="shrink-0 border bg-blue-50 hover:bg-blue-100 text-blue-600">
          Make Custom Payment (Test)
        </Button>
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
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2 font-semibold text-midnight">₹{p.amount ?? p.formatted_amount ?? '-'}</td>
                    <td className="px-4 py-2 text-gray-600">{p.payment_method || '-'}</td>
                    <td className="px-4 py-2">
                      <Badge className={
                        p.status === 'completed' || p.status === 'success' || p.status === 'paid' ? 'bg-green-100 text-green-700' :
                        p.status === 'pending' || p.status === 'created' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {p.status || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-gray-500">{p.created_at ? p.created_at.slice(0, 16).replace('T', ' ') : '-'}</td>
                    <td className="px-4 py-2 flex items-center justify-center gap-2">
                      {(p.status === 'pending' || p.status === 'created' || p.status === 'failed') && (
                        <Button 
                          size="sm" 
                          onClick={() => handlePayNow(p)}
                          disabled={payingId === p.id}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {payingId === p.id ? 'Processing...' : 'Pay Now'}
                        </Button>
                      )}
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
