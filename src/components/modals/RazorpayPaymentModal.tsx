import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { razorpayService } from '@/services/razorpayService';
import { adminConsultationApi, extractErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

interface RazorpayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: any;
  onSuccess?: () => void;
}

const RazorpayPaymentModal: React.FC<RazorpayPaymentModalProps> = ({
  isOpen,
  onClose,
  consultation,
  onSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('online');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'popup' | 'verifying' | 'success' | 'failed' | 'cancelled'>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!consultation) return null;

  const handleOnlinePayment = async () => {
    try {
      setPaymentStatus('loading');
      setPaymentError(null);

      const fee = parseFloat(consultation.consultation_fee) || 0;
      
      // Basic amount validation for online payments
      if (fee < 1) {
        setPaymentStatus('failed');
        setPaymentError('Online payments must be at least ₹1.00. Please use Cash payment.');
        return;
      }

      await razorpayService.initiatePayment(
        {
          amount: fee,
          currency: 'INR',
          consultation_id: consultation.id,
          description: `Consultation Payment for ${consultation.id}`,
        },
        {
          name: consultation.patient_name || '',
          email: '', // Backend will get it from user profile if needed
          contact: '', 
        },
        (status) => setPaymentStatus(status)
      );

      // Success
      toast.success('Payment successful!');
      if (onSuccess) onSuccess();
      
      // Delay closing to show success state
      setTimeout(() => {
        onClose();
        setPaymentStatus('idle');
      }, 2000);

    } catch (err: any) {
      const msg = extractErrorMessage(err);
      if (msg === 'Payment cancelled by user') {
        setPaymentStatus('cancelled');
        setPaymentError('Payment was cancelled. You can retry.');
      } else {
        setPaymentStatus('failed');
        setPaymentError(msg || 'Payment failed. Please retry.');
      }
    }
  };

  const handleCashPayment = async () => {
    setIsSubmitting(true);
    try {
      // Use the general update endpoint or a specific payment endpoint
      // Assuming adminConsultationApi.updateConsultation exists
      const updatedConsultation = await adminConsultationApi.updateConsultation(consultation.id, {
        payment_method: 'cash',
        payment_status: 'paid',
        is_paid: true,
        scheduled_date: consultation.scheduled_date,
        scheduled_time: consultation.scheduled_time
      });
      
      console.log('✅ Cash payment update response:', updatedConsultation);

      setPaymentStatus('success');
      toast.success('Payment recorded as Cash successfully!');
      
      // Give backend a moment to settle before refresh
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);

      setTimeout(() => {
        onClose();
        setPaymentStatus('idle');
      }, 2000);
    } catch (err) {
      const msg = extractErrorMessage(err);
      toast.error(msg || 'Failed to update payment status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setPaymentStatus('idle');
    setPaymentError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        {/* Progress Header */}
        <div className="h-2 bg-gray-100 w-full">
          <div 
            className="h-full bg-[#E17726] transition-all duration-500" 
            style={{ width: paymentStatus === 'success' ? '100%' : paymentStatus === 'idle' ? '0%' : '50%' }}
          />
        </div>

        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <CreditCard className="w-6 h-6 mr-2 text-[#E17726]" />
              Process Payment
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Confirm payment for consultation {consultation.id}
            </DialogDescription>
          </DialogHeader>

          {paymentStatus === 'idle' ? (
            <div className="space-y-6">
              {/* Consultation Summary */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Patient</span>
                  <span className="text-sm font-semibold text-gray-900">{consultation.patient_name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Doctor</span>
                  <span className="text-sm font-semibold text-gray-900">{consultation.doctor_name}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-base font-medium text-gray-900">Total Fee</span>
                  <span className="text-xl font-bold text-[#E17726]">₹{consultation.consultation_fee}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('online')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    paymentMethod === 'online' 
                      ? 'border-[#E17726] bg-orange-50' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <Smartphone className={`w-6 h-6 ${paymentMethod === 'online' ? 'text-[#E17726]' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${paymentMethod === 'online' ? 'text-gray-900' : 'text-gray-500'}`}>Online / UPI</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    paymentMethod === 'cash' 
                      ? 'border-[#E17726] bg-orange-50' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <Banknote className={`w-6 h-6 ${paymentMethod === 'cash' ? 'text-[#E17726]' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${paymentMethod === 'cash' ? 'text-gray-900' : 'text-gray-500'}`}>Cash Payment</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Secure payment processed via Razorpay. All transactions are encrypted.</span>
              </div>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              {paymentStatus === 'loading' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center animate-pulse">
                    <Loader2 className="w-8 h-8 text-[#E17726] animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Creating Order...</h3>
                    <p className="text-gray-500">Please wait while we set up your secure payment.</p>
                  </div>
                </>
              )}

              {paymentStatus === 'popup' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <Smartphone className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Payment Window Open</h3>
                    <p className="text-gray-500">Please complete the payment in the Razorpay popup window.</p>
                  </div>
                </>
              )}

              {paymentStatus === 'verifying' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Verifying Payment...</h3>
                    <p className="text-gray-500">Confirming your transaction with the bank.</p>
                  </div>
                </>
              )}

              {paymentStatus === 'success' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Payment Successful!</h3>
                    <p className="text-green-600">The consultation has been marked as paid.</p>
                  </div>
                </>
              )}

              {(paymentStatus === 'failed' || paymentStatus === 'cancelled') && (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    {paymentStatus === 'cancelled' ? <Clock className="w-8 h-8 text-red-600" /> : <XCircle className="w-8 h-8 text-red-600" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {paymentStatus === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
                    </h3>
                    <p className="text-red-500 max-w-xs mx-auto">{paymentError || 'An error occurred during payment.'}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </>
              )}
            </div>
          )}

          <div className="mt-8 flex gap-3">
            {paymentStatus === 'idle' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  className="flex-1 h-12 rounded-xl"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={paymentMethod === 'online' ? handleOnlinePayment : handleCashPayment}
                  className="flex-1 h-12 rounded-xl bg-[#E17726] hover:bg-[#c9651e] text-white font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    `Pay ₹${consultation.consultation_fee}`
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RazorpayPaymentModal;
