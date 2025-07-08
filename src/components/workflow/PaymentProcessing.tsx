import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  CreditCard, 
  IndianRupee, 
  Smartphone, 
  DollarSign,
  CheckCircle,
  Clock,
  Receipt,
  Download,
  Printer,
  QrCode,
  Wallet,
  Building,
  User,
  Calendar,
  FileText
} from 'lucide-react';

const PaymentProcessing = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, completed, failed
  const [amount, setAmount] = useState('500');

  // Mock data
  const appointmentData = {
    id: 'APT-2024-001',
    patient: {
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      email: 'rajesh.kumar@email.com'
    },
    doctor: 'Dr. Priya Singh',
    specialty: 'Cardiology',
    date: '2024-01-15',
    time: '10:30 AM',
    consultationFee: 500,
    platformFee: 50,
    taxes: 25,
    totalAmount: 575
  };

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: Smartphone,
      description: 'Pay using UPI apps like GPay, PhonePe, Paytm',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'card',
      name: 'Debit/Credit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, RuPay cards accepted',
      color: 'text-[#E17726]',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: Wallet,
      description: 'Paytm, Amazon Pay, other wallets',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: Building,
      description: 'Pay directly from your bank account',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'cash',
      name: 'Cash Payment',
      icon: IndianRupee,
      description: 'Pay in cash at the clinic',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  const recentTransactions = [
    {
      id: 'TXN001',
      patient: 'Anita Devi',
      amount: 400,
      method: 'UPI',
      status: 'completed',
      time: '09:30 AM',
      date: 'Today'
    },
    {
      id: 'TXN002', 
      patient: 'Suresh Gupta',
      amount: 600,
      method: 'Card',
      status: 'completed',
      time: '08:45 AM',
      date: 'Today'
    },
    {
      id: 'TXN003',
      patient: 'Priya Sharma',
      amount: 350,
      method: 'Cash',
      status: 'completed',
      time: '08:15 AM',
      date: 'Today'
    }
  ];

  const processPayment = () => {
    setPaymentStatus('processing');
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus('completed');
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-midnight">Payment Processing</h1>
              <Badge className="bg-[#E17726]/10 text-[#E17726] border-[#E17726]/20">
                {appointmentData.id}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-gray-300">
                <Receipt className="w-4 h-4 mr-2" />
                Transaction History
              </Button>
              <Button variant="outline" className="border-gray-300">
                <FileText className="w-4 h-4 mr-2" />
                Generate Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Summary */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">Appointment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-[#E17726]/10 text-[#E17726] font-semibold">
                        {appointmentData.patient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-midnight">{appointmentData.patient.name}</h4>
                      <p className="text-sm text-gray-600">{appointmentData.doctor} • {appointmentData.specialty}</p>
                      <p className="text-xs text-gray-500">{appointmentData.date} at {appointmentData.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#E17726]">₹{appointmentData.totalAmount}</p>
                    <p className="text-sm text-gray-600">Total Amount</p>
                  </div>
                </div>
                
                {/* Bill Breakdown */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Consultation Fee:</span>
                    <span className="font-medium">₹{appointmentData.consultationFee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform Fee:</span>
                    <span className="font-medium">₹{appointmentData.platformFee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes (GST):</span>
                    <span className="font-medium">₹{appointmentData.taxes}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total Amount:</span>
                    <span className="text-[#E17726]">₹{appointmentData.totalAmount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">Select Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      selectedPaymentMethod === method.id
                        ? 'border-[#E17726] bg-[#E17726]/5'
                        : 'border-gray-200 hover:border-[#E17726]/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl ${method.bgColor} flex items-center justify-center`}>
                        <method.icon className={`w-6 h-6 ${method.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-midnight">{method.name}</h4>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                      {selectedPaymentMethod === method.id && (
                        <CheckCircle className="w-6 h-6 text-[#E17726]" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Processing */}
            {selectedPaymentMethod && (
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-midnight">Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedPaymentMethod === 'upi' && (
                    <div className="text-center space-y-4">
                      <div className="w-48 h-48 bg-gray-100 rounded-xl mx-auto flex items-center justify-center">
                        <QrCode className="w-32 h-32 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">Scan QR code with any UPI app to pay ₹{appointmentData.totalAmount}</p>
                      <div className="text-xs text-gray-500">
                        UPI ID: sushrusa@paytm
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                        <Input 
                          placeholder="1234 5678 9012 3456"
                          className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                          <Input 
                            placeholder="MM/YY"
                            className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                          <Input 
                            placeholder="123"
                            className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                        <Input 
                          placeholder="Name on card"
                          className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                        />
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'cash' && (
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                        <IndianRupee className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold text-midnight">Cash Payment</p>
                      <p className="text-sm text-gray-600">Patient will pay ₹{appointmentData.totalAmount} in cash at the clinic</p>
                    </div>
                  )}

                  {paymentStatus === 'pending' && (
                    <Button 
                      onClick={processPayment}
                      disabled={!selectedPaymentMethod}
                      className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white h-12 rounded-xl"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Pay ₹{appointmentData.totalAmount}
                    </Button>
                  )}

                  {paymentStatus === 'processing' && (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 border-4 border-[#E17726] border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-lg font-semibold text-midnight">Processing Payment...</p>
                      <p className="text-sm text-gray-600">Please wait while we process your payment</p>
                    </div>
                  )}

                  {paymentStatus === 'completed' && (
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">Payment Successful!</p>
                      <p className="text-sm text-gray-600">Transaction ID: TXN{Date.now()}</p>
                      <div className="flex space-x-4 justify-center">
                        <Button variant="outline" className="border-gray-300">
                          <Download className="w-4 h-4 mr-2" />
                          Download Receipt
                        </Button>
                        <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                          <Printer className="w-4 h-4 mr-2" />
                          Print Receipt
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment Summary & History */}
          <div className="space-y-6">
            {/* Today's Summary */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Today's Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Collections:</span>
                  <span className="font-bold text-midnight">₹12,450</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transactions:</span>
                  <span className="font-bold text-midnight">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cash Payments:</span>
                  <span className="font-bold text-midnight">₹3,200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Digital Payments:</span>
                  <span className="font-bold text-midnight">₹9,250</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentTransactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-midnight text-sm">{transaction.patient}</h4>
                      <p className="text-xs text-gray-600">{transaction.date} • {transaction.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-midnight">₹{transaction.amount}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{transaction.method}</span>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full border-gray-300 text-gray-700">
                  View All Transactions
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white justify-start h-12 rounded-xl">
                  <Receipt className="w-5 h-5 mr-3" />
                  Generate Day Report
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-aqua text-aqua hover:bg-aqua hover:text-white">
                  <Download className="w-5 h-5 mr-3" />
                  Export Transactions
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100">
                  <IndianRupee className="w-5 h-5 mr-3" />
                  Refund Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessing;
