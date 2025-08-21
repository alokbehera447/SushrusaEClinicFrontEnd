import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Stethoscope,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Receipt,
  Download,
  Eye,
  X,
  CheckCircle,
  Activity,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  MapPin,
  FilePdf,
  Printer
} from 'lucide-react';
import { type Consultation } from '@/services/consultationService';
import { getStatusColor, getStatusText, formatDateTime, formatTime } from '@/services/consultationService';
import { api } from '@/lib/utils';

interface ConsultationDetailsPopupProps {
  consultation: Consultation | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ReceiptData {
  receipt_number: string;
  patient_name: string;
  doctor_name: string;
  clinic_name: string;
  consultation_date: string;
  consultation_time: string;
  payment_method: string;
  payment_status: string;
  formatted_amount: string;
  issued_by_name: string;
  issued_at: string;
  receipt_data: {
    consultation_date: string;
    consultation_time: string;
  };
}

export const ConsultationDetailsPopup: React.FC<ConsultationDetailsPopupProps> = ({
  consultation,
  isOpen,
  onClose
}) => {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [loadingPrescription, setLoadingPrescription] = useState(false);

  // Load receipt data
  useEffect(() => {
    if (consultation && isOpen) {
      loadReceipt();
      loadPrescription();
    }
  }, [consultation, isOpen]);

  const loadReceipt = async () => {
    if (!consultation) return;
    
    try {
      setLoadingReceipt(true);
      const response = await api.get(`/api/consultations/${consultation.id}/receipt/`);
      if (response.data.success) {
        setReceipt(response.data.data);
      }
    } catch (error) {
      console.error('Error loading receipt:', error);
      setReceipt(null);
    } finally {
      setLoadingReceipt(false);
    }
  };

  const loadPrescription = async () => {
    if (!consultation) return;
    
    try {
      setLoadingPrescription(true);
      const response = await api.get(`/api/prescriptions/consultation/${consultation.id}/`);
      if (response.data.success && response.data.data.length > 0) {
        // Get the latest prescription
        const latestPrescription = response.data.data[0];
        if (latestPrescription.pdf_url) {
          setPrescriptionUrl(latestPrescription.pdf_url);
        }
      }
    } catch (error) {
      console.error('Error loading prescription:', error);
      setPrescriptionUrl(null);
    } finally {
      setLoadingPrescription(false);
    }
  };

  const handlePrintReceipt = () => {
    if (receipt) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt - ${receipt.receipt_number}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                .details { margin: 20px 0; }
                .row { display: flex; justify-content: space-between; margin: 10px 0; }
                .amount { font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Sushrusa E-Clinic</h1>
                <h2>Consultation Receipt</h2>
                <p>Receipt #: ${receipt.receipt_number}</p>
              </div>
              <div class="details">
                <div class="row"><strong>Patient:</strong> ${receipt.patient_name}</div>
                <div class="row"><strong>Doctor:</strong> ${receipt.doctor_name}</div>
                <div class="row"><strong>Clinic:</strong> ${receipt.clinic_name}</div>
                <div class="row"><strong>Date:</strong> ${new Date(receipt.consultation_date).toLocaleDateString()}</div>
                <div class="row"><strong>Time:</strong> ${receipt.consultation_time}</div>
                <div class="row"><strong>Payment Method:</strong> ${receipt.payment_method}</div>
                <div class="row"><strong>Status:</strong> ${receipt.payment_status}</div>
              </div>
              <div class="amount">Total Amount: ${receipt.formatted_amount}</div>
              <div class="footer">
                <p>Issued by: ${receipt.issued_by_name}</p>
                <p>Date: ${new Date(receipt.issued_at).toLocaleString()}</p>
                <p>Thank you for choosing Sushrusa E-Clinic!</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (!consultation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Consultation Details
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Basic Details</TabsTrigger>
            <TabsTrigger value="receipt">Receipt</TabsTrigger>
            <TabsTrigger value="prescription">Prescription</TabsTrigger>
          </TabsList>

          {/* Basic Details Tab */}
          <TabsContent value="details" className="space-y-6">
            {/* Consultation ID and Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">#{consultation.id}</h3>
                <Badge className={getStatusColor(consultation.status)}>
                  {getStatusText(consultation.status)}
                </Badge>
              </div>
              <div className="text-sm text-gray-500">
                Created: {new Date(consultation.created_at).toLocaleDateString()}
              </div>
            </div>

            <Separator />

            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Patient Name</label>
                    <p className="text-lg font-semibold">{consultation.patient_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Patient ID</label>
                    <p className="text-lg font-mono">{consultation.patient}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Doctor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-green-600" />
                  Doctor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Doctor Name</label>
                    <p className="text-lg font-semibold">Dr. {consultation.doctor_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Doctor ID</label>
                    <p className="text-lg font-mono">{consultation.doctor}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consultation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Consultation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Scheduled Date</label>
                    <p className="text-lg">{new Date(consultation.scheduled_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Scheduled Time</label>
                    <p className="text-lg">{formatTime(consultation.scheduled_time)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Duration</label>
                    <p className="text-lg">{consultation.duration} minutes</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Consultation Type</label>
                    <p className="text-lg capitalize">{consultation.consultation_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Consultation Fee</label>
                    <p className="text-lg font-semibold text-green-600">${consultation.consultation_fee}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Payment Status</label>
                    <Badge variant={consultation.payment_status === 'paid' ? 'default' : 'secondary'}>
                      {consultation.payment_status}
                    </Badge>
                  </div>
                </div>

                {consultation.chief_complaint && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Chief Complaint</label>
                    <p className="text-lg bg-gray-50 p-3 rounded-lg">{consultation.chief_complaint}</p>
                  </div>
                )}

                {consultation.symptoms && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Symptoms</label>
                    <p className="text-lg bg-gray-50 p-3 rounded-lg">{consultation.symptoms}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Check-in Information */}
            {(consultation.checked_in_at || consultation.ready_for_consultation_at) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange-600" />
                    Check-in Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {consultation.checked_in_at && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-600">Checked in:</span>
                      <span>{new Date(consultation.checked_in_at).toLocaleString()}</span>
                    </div>
                  )}
                  {consultation.ready_for_consultation_at && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-600">Marked ready:</span>
                      <span>{new Date(consultation.ready_for_consultation_at).toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Receipt Tab */}
          <TabsContent value="receipt" className="space-y-6">
            {loadingReceipt ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-lg">Loading receipt...</span>
              </div>
            ) : receipt ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-green-600" />
                    Payment Receipt
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Receipt Header */}
                  <div className="text-center border-b pb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Sushrusa E-Clinic</h3>
                    <p className="text-sm text-gray-600">Consultation Receipt</p>
                    <p className="text-xs text-gray-500 mt-1">Receipt #: {receipt.receipt_number}</p>
                  </div>
                  
                  {/* Receipt Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Patient:</span>
                        <span className="text-sm font-medium">{receipt.patient_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Doctor:</span>
                        <span className="text-sm font-medium">{receipt.doctor_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Clinic:</span>
                        <span className="text-sm font-medium">{receipt.clinic_name}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Date:</span>
                        <span className="text-sm font-medium">{new Date(receipt.consultation_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Time:</span>
                        <span className="text-sm font-medium">{receipt.consultation_time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment Method:</span>
                        <span className="text-sm font-medium capitalize">{receipt.payment_method}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Status */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={receipt.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {receipt.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                  
                  {/* Amount */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount:</span>
                      <span className="text-2xl font-bold text-green-600">{receipt.formatted_amount}</span>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="text-center text-xs text-gray-500 border-t pt-4">
                    <p>Issued by: {receipt.issued_by_name}</p>
                    <p>Date: {new Date(receipt.issued_at).toLocaleString()}</p>
                    <p className="mt-2">Thank you for choosing Sushrusa E-Clinic!</p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handlePrintReceipt} variant="outline">
                      <Printer className="h-4 w-4 mr-2" />
                      Print Receipt
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <Receipt className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No receipt available</h3>
                <p className="text-gray-500">Receipt data not found for this consultation</p>
              </div>
            )}
          </TabsContent>

          {/* Prescription Tab */}
          <TabsContent value="prescription" className="space-y-6">
            {loadingPrescription ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-lg">Loading prescription...</span>
              </div>
            ) : prescriptionUrl ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FilePdf className="h-5 w-5 text-red-600" />
                    Prescription PDF
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={() => window.open(prescriptionUrl, '_blank')} variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Prescription
                    </Button>
                    <Button onClick={() => window.open(prescriptionUrl, '_blank')} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-sm text-gray-600">
                      <strong>Note:</strong> Click "View Prescription" to open the prescription PDF in a new tab, 
                      or "Download PDF" to download the prescription file.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <FilePdf className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No prescription available</h3>
                <p className="text-gray-500">Prescription has not been generated for this consultation yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
