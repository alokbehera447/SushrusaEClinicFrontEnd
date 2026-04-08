import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Calendar,
  Receipt,
  Activity
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
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { paymentTrackingApi } from '@/lib/api';
import { toast } from 'sonner';

const PaymentTrackingDashboard = () => {
  const [trackingData, setTrackingData] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const loadPaymentTracking = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading payment tracking data...');
      const data = await paymentTrackingApi.getPaymentTracking();
      console.log('📊 Payment tracking response:', data);
      setTrackingData(data);
    } catch (err) {
      console.error('❌ Error loading payment tracking:', err);
      toast.error('Failed to load payment tracking data');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      setHistoryLoading(true);
      console.log('🔍 Loading payment history...');
      const data = await paymentTrackingApi.getPaymentHistory();
      console.log('📊 Payment history response:', data);
      console.log('📊 Data type:', typeof data);
      console.log('📊 Data keys:', Object.keys(data || {}));
      
      // Check if data.results exists and is an array
      if (data && data.results && Array.isArray(data.results)) {
        console.log('✅ Found results array with length:', data.results.length);
        setPaymentHistory(data.results);
      } else if (Array.isArray(data)) {
        console.log('✅ Data is directly an array with length:', data.length);
        setPaymentHistory(data);
      } else {
        console.warn('⚠️ Payment history data is not in expected format:', data);
        setPaymentHistory([]);
      }
    } catch (err) {
      console.error('❌ Error loading payment history:', err);
      toast.error('Failed to load payment history');
      setPaymentHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadReceipt = async (paymentId: string) => {
    try {
      const receipt = await paymentTrackingApi.getPaymentReceipt(paymentId);
      setSelectedPayment(receipt);
      setShowReceiptModal(true);
    } catch (err) {
      toast.error('Failed to load receipt');
    }
  };

  useEffect(() => {
    loadPaymentTracking();
    loadPaymentHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Tracking</h2>
          <p className="text-gray-600">Comprehensive payment analytics and tracking</p>
        </div>
        <Button variant="outline" onClick={loadPaymentTracking}>
          <Activity className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      {trackingData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{trackingData.overview.total_revenue.toLocaleString()}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {trackingData.overview.total_payments}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{trackingData.overview.net_revenue.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
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
                    {trackingData.overview.success_rate.toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Loading payment history...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (paymentHistory || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No payment history found
                  </TableCell>
                </TableRow>
              ) : (
                (paymentHistory || []).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>{payment.patient_name}</TableCell>
                    <TableCell>{payment.doctor_name}</TableCell>
                    <TableCell>₹{payment.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {payment.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={payment.status === 'completed' ? 'default' : 
                                payment.status === 'pending' ? 'secondary' : 'destructive'}
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(payment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadReceipt(payment.id)}
                      >
                        <Receipt className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Receipt Modal */}
      {selectedPayment && (
        <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Payment Receipt</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900">Sushrusa E-Clinic</h3>
                <p className="text-sm text-gray-600">Payment Receipt</p>
                <p className="text-xs text-gray-500 mt-1">Receipt #: {selectedPayment.receipt_number}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Patient:</span>
                  <span className="text-sm font-medium">{selectedPayment.patient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Doctor:</span>
                  <span className="text-sm font-medium">{selectedPayment.doctor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-sm font-medium">₹{selectedPayment.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Method:</span>
                  <span className="text-sm font-medium capitalize">{selectedPayment.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={selectedPayment.status === 'completed' ? 'default' : 'secondary'}>
                    {selectedPayment.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="text-sm font-medium">
                    {new Date(selectedPayment.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="text-center text-xs text-gray-500 border-t pt-4">
                <p>Thank you for choosing Sushrusa E-Clinic!</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowReceiptModal(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button 
                onClick={() => window.print()}
                className="flex-1"
              >
                Print Receipt
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PaymentTrackingDashboard; 