import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CreditCard, Smartphone, Banknote, Receipt, Search, Plus, Minus, Calculator, DollarSign, CheckCircle, AlertCircle, Printer } from 'lucide-react';

interface PaymentItem {
  id: string;
  type: 'consultation' | 'medicine' | 'test' | 'procedure' | 'other';
  description: string;
  amount: number;
  quantity: number;
  doctorName?: string;
}

const PaymentProcessingForm = () => {
  const [paymentData, setPaymentData] = useState({
    patientId: '',
    patientName: '',
    patientPhone: '',
    paymentMethod: '',
    
    // Card Details
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    
    // UPI Details
    upiId: '',
    
    // Cash Details
    cashReceived: '',
    
    // Additional
    notes: '',
    sendSMS: true,
    sendEmail: false,
    generateInvoice: true
  });

  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([
    {
      id: '1',
      type: 'consultation',
      description: 'Consultation - Dr. Ramesh Kumar (Cardiology)',
      amount: 800,
      quantity: 1,
      doctorName: 'Dr. Ramesh Kumar'
    }
  ]);

  const [searchPatient, setSearchPatient] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock patient data
  const patients = [
    { id: 'PAT001', name: 'Rahul Sharma', phone: '+91 98765 43210' },
    { id: 'PAT002', name: 'Anita Devi', phone: '+91 87654 32109' },
    { id: 'PAT003', name: 'Suresh Gupta', phone: '+91 76543 21098' }
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchPatient.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchPatient.toLowerCase()) ||
    patient.phone.includes(searchPatient)
  );

  const selectPatient = (patient: any) => {
    setPaymentData(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone
    }));
    setSearchPatient('');
  };

  const addPaymentItem = () => {
    const newItem: PaymentItem = {
      id: Date.now().toString(),
      type: 'other',
      description: '',
      amount: 0,
      quantity: 1
    };
    setPaymentItems([...paymentItems, newItem]);
  };

  const updatePaymentItem = (id: string, field: keyof PaymentItem, value: any) => {
    setPaymentItems(items =>
      items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removePaymentItem = (id: string) => {
    setPaymentItems(items => items.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => {
    return paymentItems.reduce((total, item) => total + (item.amount * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // 18% GST
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const calculateChange = () => {
    if (paymentData.paymentMethod === 'cash' && paymentData.cashReceived) {
      return parseFloat(paymentData.cashReceived) - calculateTotal();
    }
    return 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    const paymentDetails = {
      ...paymentData,
      items: paymentItems,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      change: calculateChange(),
      timestamp: new Date().toISOString()
    };

    // Simulate payment processing
    setTimeout(() => {
      console.log('Payment processed:', paymentDetails);
      alert('Payment processed successfully!');
      setIsProcessing(false);
      // Reset form or generate receipt
    }, 3000);
  };

  const paymentMethods = [
    { id: 'phonepe', name: 'PhonePe', icon: Smartphone, color: 'text-[#5F259F]' },
    { id: 'cash', name: 'Cash', icon: Banknote, color: 'text-green-600' },
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, color: 'text-blue-600' },
    { id: 'upi', name: 'UPI', icon: Smartphone, color: 'text-purple-600' }
  ];

  const itemTypes = [
    'consultation',
    'medicine',
    'test',
    'procedure',
    'other'
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-midnight mb-2">Payment Processing</h2>
        <p className="text-gray-600">Process payments and generate invoices</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Patient & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Selection */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold text-midnight">
                <Search className="w-5 h-5 mr-2 text-[#E17726]" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search patient by name, ID, or phone..."
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              {searchPatient && filteredPatients.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                  {filteredPatients.map(patient => (
                    <div
                      key={patient.id}
                      onClick={() => selectPatient(patient)}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-[#E17726]/10 text-[#E17726] text-xs">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{patient.name}</p>
                        <p className="text-xs text-gray-500">{patient.id} • {patient.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {paymentData.patientName && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-green-100 text-green-700">
                        {paymentData.patientName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-green-800">{paymentData.patientName}</h4>
                      <p className="text-sm text-green-600">{paymentData.patientId} • {paymentData.patientPhone}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Items */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center text-xl font-bold text-midnight">
                <Receipt className="w-5 h-5 mr-2 text-[#E17726]" />
                Billing Items
              </CardTitle>
              <Button onClick={addPaymentItem} size="sm" className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentItems.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-midnight">Item {index + 1}</h4>
                    {paymentItems.length > 1 && (
                      <Button
                        onClick={() => removePaymentItem(item.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Type</Label>
                      <Select
                        value={item.type}
                        onValueChange={(value) => updatePaymentItem(item.id, 'type', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {itemTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updatePaymentItem(item.id, 'description', e.target.value)}
                        placeholder="Item description"
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Amount (₹)</Label>
                      <Input
                        type="number"
                        value={item.amount}
                        onChange={(e) => updatePaymentItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Qty</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updatePaymentItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        min="1"
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm text-gray-600">Total: </span>
                    <span className="font-semibold text-[#E17726]">₹{(item.amount * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment Details */}
        <div className="space-y-6">
          {/* Bill Summary */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold text-midnight">
                <Calculator className="w-5 h-5 mr-2 text-[#E17726]" />
                Bill Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST (18%):</span>
                  <span>₹{calculateTax().toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span className="text-[#E17726]">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold text-midnight">
                <DollarSign className="w-5 h-5 mr-2 text-[#E17726]" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={paymentData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                {paymentMethods.map(method => (
                  <div key={method.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="flex items-center space-x-2 cursor-pointer flex-1">
                      <method.icon className={`w-5 h-5 ${method.color}`} />
                      <span className="font-medium">{method.name}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Card Payment Details */}
              {paymentData.paymentMethod === 'card' && (
                <div className="space-y-3 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cardholder Name</Label>
                    <Input
                      value={paymentData.cardholderName}
                      onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                      placeholder="Name on card"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Card Number</Label>
                    <Input
                      value={paymentData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="h-9"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Expiry</Label>
                      <Input
                        value={paymentData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        placeholder="MM/YY"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">CVV</Label>
                      <Input
                        value={paymentData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        placeholder="123"
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Payment Details */}
              {paymentData.paymentMethod === 'upi' && (
                <div className="space-y-3 mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">UPI ID</Label>
                    <Input
                      value={paymentData.upiId}
                      onChange={(e) => handleInputChange('upiId', e.target.value)}
                      placeholder="patient@upi"
                      className="h-9"
                    />
                  </div>
                </div>
              )}

              {/* Cash Payment Details */}
              {paymentData.paymentMethod === 'cash' && (
                <div className="space-y-3 mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cash Received (₹)</Label>
                    <Input
                      type="number"
                      value={paymentData.cashReceived}
                      onChange={(e) => handleInputChange('cashReceived', e.target.value)}
                      placeholder="0"
                      className="h-9"
                    />
                  </div>
                  {paymentData.cashReceived && calculateChange() !== 0 && (
                    <div className="p-2 bg-white rounded border">
                      <div className="flex justify-between text-sm">
                        <span>Change to return:</span>
                        <span className={`font-semibold ${calculateChange() < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{Math.abs(calculateChange()).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Options */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-midnight">Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendSMS"
                  checked={paymentData.sendSMS}
                  onCheckedChange={(checked) => handleInputChange('sendSMS', checked)}
                />
                <Label htmlFor="sendSMS" className="text-sm">Send SMS receipt</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendEmail"
                  checked={paymentData.sendEmail}
                  onCheckedChange={(checked) => handleInputChange('sendEmail', checked)}
                />
                <Label htmlFor="sendEmail" className="text-sm">Send email receipt</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generateInvoice"
                  checked={paymentData.generateInvoice}
                  onCheckedChange={(checked) => handleInputChange('generateInvoice', checked)}
                />
                <Label htmlFor="generateInvoice" className="text-sm">Generate invoice</Label>
              </div>
            </CardContent>
          </Card>

          {/* Process Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={
              isProcessing || 
              !paymentData.patientName || 
              !paymentData.paymentMethod || 
              paymentItems.length === 0 ||
              (paymentData.paymentMethod === 'cash' && parseFloat(paymentData.cashReceived || '0') < calculateTotal())
            }
            className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white h-12 text-lg font-semibold"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Process Payment - ₹{calculateTotal().toFixed(2)}
              </>
            )}
          </Button>

          {paymentData.generateInvoice && (
            <Button variant="outline" className="w-full border-gray-300">
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessingForm; 