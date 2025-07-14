import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ConsultationDetailsModal from './ConsultationDetailsModal';
import { 
  Video, 
  Phone, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  DollarSign,
  Send,
  Bell,
  Calendar,
  MessageSquare,
  Download,
  Eye,
  Edit,
  Play,
  Square,
  RotateCcw
} from 'lucide-react';

interface Consultation {
  id: string;
  patient: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  doctor: {
    id: string;
    name: string;
    specialty: string;
    phone: string;
  };
  consultationType: 'video' | 'phone' | 'in-person';
  consultationDate: string;
  consultationTime: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  chiefComplaint: string;
  symptoms?: string;
  consultationFee: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'refunded';
  meetingLink?: string;
  prescription?: {
    id: string;
    status: 'pending' | 'active' | 'completed';
    medicines: string[];
    instructions: string;
    writtenDate: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const ConsultationManagementFlow = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([
    {
      id: 'CON001',
      patient: {
        id: 'PAT001',
        name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        email: 'rahul@example.com'
      },
      doctor: {
        id: 'DOC001',
        name: 'Dr. Amit Kumar',
        specialty: 'Cardiology',
        phone: '+91 87654 32109'
      },
      consultationType: 'video',
      consultationDate: '2024-01-20',
      consultationTime: '14:30',
      duration: 30,
      status: 'scheduled',
      chiefComplaint: 'Chest pain and shortness of breath',
      symptoms: 'Pain in left chest, difficulty breathing',
      consultationFee: 800,
      paymentMethod: 'card',
      paymentStatus: 'pending',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      createdAt: '2024-01-19T10:00:00Z',
      updatedAt: '2024-01-19T10:00:00Z'
    },
    {
      id: 'CON002',
      patient: {
        id: 'PAT002',
        name: 'Anita Devi',
        phone: '+91 87654 32109',
        email: 'anita@example.com'
      },
      doctor: {
        id: 'DOC002',
        name: 'Dr. Priya Singh',
        specialty: 'Dermatology',
        phone: '+91 76543 21098'
      },
      consultationType: 'phone',
      consultationDate: '2024-01-20',
      consultationTime: '15:00',
      duration: 20,
      status: 'ongoing',
      chiefComplaint: 'Skin rash and itching',
      symptoms: 'Red patches on arms and legs',
      consultationFee: 600,
      paymentMethod: 'upi',
      paymentStatus: 'completed',
      createdAt: '2024-01-19T11:00:00Z',
      updatedAt: '2024-01-20T15:00:00Z'
    },
    {
      id: 'CON003',
      patient: {
        id: 'PAT003',
        name: 'Suresh Gupta',
        phone: '+91 76543 21098',
        email: 'suresh@example.com'
      },
      doctor: {
        id: 'DOC003',
        name: 'Dr. Ramesh Kumar',
        specialty: 'Orthopedics',
        phone: '+91 65432 10987'
      },
      consultationType: 'in-person',
      consultationDate: '2024-01-19',
      consultationTime: '16:00',
      duration: 45,
      status: 'completed',
      chiefComplaint: 'Knee pain and swelling',
      symptoms: 'Pain in right knee, difficulty walking',
      consultationFee: 1000,
      paymentMethod: 'cash',
      paymentStatus: 'completed',
      prescription: {
        id: 'RX001',
        status: 'active',
        medicines: ['Ibuprofen 400mg', 'Paracetamol 500mg', 'Vitamin D3 1000IU'],
        instructions: 'Take Ibuprofen for pain relief as needed. Take Paracetamol for fever. Take Vitamin D3 once daily.',
        writtenDate: '2024-01-19'
      },
      notes: 'Patient advised to rest and avoid strenuous activities. Follow-up in 2 weeks.',
      createdAt: '2024-01-18T14:00:00Z',
      updatedAt: '2024-01-19T16:45:00Z'
    }
  ]);

  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedConsultationForDetails, setSelectedConsultationForDetails] = useState<Consultation | null>(null);

  // API Functions aligned with endpoints
  const updateConsultationStatus = async (consultationId: string, status: string) => {
    try {
      // API Call: PUT /api/consultations/{id}/
      console.log(`Updating consultation ${consultationId} status to ${status}`);
      
      setConsultations(prev => prev.map(con => 
        con.id === consultationId 
          ? { ...con, status: status as any, updatedAt: new Date().toISOString() }
          : con
      ));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating consultation status:', error);
      return { success: false, error };
    }
  };

  const sendNotification = async (consultationId: string, type: 'patient' | 'doctor', message: string) => {
    try {
      // API Call: POST /api/notifications/ (if you have notifications endpoint)
      console.log(`Sending ${type} notification for consultation ${consultationId}: ${message}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error };
    }
  };

  const createPrescription = async (consultationId: string, prescriptionData: any) => {
    try {
      // API Call: POST /api/prescriptions/
      console.log(`Creating prescription for consultation ${consultationId}:`, prescriptionData);
      
      const newPrescription = {
        id: `RX${Date.now()}`,
        status: 'active',
        medicines: prescriptionData.medicines,
        instructions: prescriptionData.instructions,
        writtenDate: new Date().toISOString().split('T')[0]
      };

      setConsultations(prev => prev.map(con => 
        con.id === consultationId 
          ? { ...con, prescription: newPrescription }
          : con
      ));
      
      return { success: true, prescription: newPrescription };
    } catch (error) {
      console.error('Error creating prescription:', error);
      return { success: false, error };
    }
  };

  const updatePaymentStatus = async (consultationId: string, paymentStatus: string) => {
    try {
      // API Call: PUT /api/payments/{id}/
      console.log(`Updating payment status for consultation ${consultationId} to ${paymentStatus}`);
      
      setConsultations(prev => prev.map(con => 
        con.id === consultationId 
          ? { ...con, paymentStatus: paymentStatus as any }
          : con
      ));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating payment status:', error);
      return { success: false, error };
    }
  };

  // Workflow Actions
  const handleStartConsultation = async (consultation: Consultation) => {
    const result = await updateConsultationStatus(consultation.id, 'ongoing');
    if (result.success) {
      // Send notifications
      await sendNotification(consultation.id, 'patient', 'Your consultation has started. Please join the call.');
      await sendNotification(consultation.id, 'doctor', 'Consultation has started. Patient is waiting.');
    }
  };

  const handleEndConsultation = async (consultation: Consultation) => {
    const result = await updateConsultationStatus(consultation.id, 'completed');
    if (result.success) {
      // Send completion notifications
      await sendNotification(consultation.id, 'patient', 'Your consultation has ended. Check your email for prescription.');
      await sendNotification(consultation.id, 'doctor', 'Consultation completed. Please write prescription if needed.');
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'ongoing': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getConsultationTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'in-person': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-midnight mb-2">Consultation Management</h2>
        <p className="text-gray-600">Complete workflow management for consultations</p>
      </div>

      {/* Workflow Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['scheduled', 'ongoing', 'completed', 'cancelled'].map((status) => (
          <Card key={status} className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon(status)}
              </div>
              <p className="text-sm font-medium text-gray-600 capitalize">{status}</p>
              <p className="text-2xl font-bold text-midnight">
                {consultations.filter(c => c.status === status).length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Consultation List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-midnight">All Consultations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {consultations.map((consultation) => (
            <div key={consultation.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-[#E17726]">{consultation.id}</div>
                    <div className="text-xs text-gray-500">{consultation.consultationDate} {consultation.consultationTime}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getConsultationTypeIcon(consultation.consultationType)}
                    <span className="text-sm text-gray-600 capitalize">{consultation.consultationType}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(consultation.status)}>
                    {getStatusIcon(consultation.status)}
                    <span className="ml-1 capitalize">{consultation.status}</span>
                  </Badge>
                  <Badge className={consultation.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    <DollarSign className="w-3 h-3 mr-1" />
                    {consultation.paymentStatus}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Patient</p>
                  <p className="font-semibold text-midnight">{consultation.patient.name}</p>
                  <p className="text-sm text-gray-600">{consultation.patient.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Doctor</p>
                  <p className="font-semibold text-midnight">{consultation.doctor.name}</p>
                  <p className="text-sm text-gray-600">{consultation.doctor.specialty}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Chief Complaint</p>
                  <p className="text-sm text-midnight">{consultation.chiefComplaint}</p>
                </div>
              </div>

              {/* Action Buttons based on Status */}
              <div className="flex flex-wrap gap-2">
                {consultation.status === 'scheduled' && (
                  <>
                    <Button 
                      size="sm" 
                      className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                      onClick={() => handleStartConsultation(consultation)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Consultation
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedConsultation(consultation);
                        setShowNotificationDialog(true);
                      }}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Send Reminder
                    </Button>
                  </>
                )}

                {consultation.status === 'ongoing' && (
                  <>
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleEndConsultation(consultation)}
                    >
                      <Square className="w-4 h-4 mr-2" />
                      End Consultation
                    </Button>
                    {consultation.consultationType === 'video' && consultation.meetingLink && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-blue-600 text-blue-600"
                        onClick={() => window.open('https://meet.diracai.com/office', '_blank')}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Meeting
                      </Button>
                    )}
                  </>
                )}

                {consultation.status === 'completed' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedConsultation(consultation);
                        setShowPrescriptionDialog(true);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {consultation.prescription ? 'View Prescription' : 'Write Prescription'}
                    </Button>
                    {consultation.paymentStatus === 'pending' && (
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => updatePaymentStatus(consultation.id, 'completed')}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Mark Payment Complete
                      </Button>
                    )}
                  </>
                )}

                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setSelectedConsultationForDetails(consultation);
                    setShowDetailsModal(true);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notification Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Send reminder to {selectedConsultation?.patient.name} about their consultation scheduled for {selectedConsultation?.consultationDate} at {selectedConsultation?.consultationTime}.
            </p>
            <div className="flex space-x-2">
              <Button 
                onClick={() => {
                  if (selectedConsultation) {
                    sendNotification(selectedConsultation.id, 'patient', 'Reminder: Your consultation is scheduled for tomorrow.');
                  }
                  setShowNotificationDialog(false);
                }}
              >
                <Send className="w-4 h-4 mr-2" />
                Send SMS
              </Button>
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prescription Dialog */}
      <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prescription Management</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedConsultation?.prescription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Prescription {selectedConsultation.prescription.id}</h4>
                  <Badge className="bg-green-100 text-green-800">
                    {selectedConsultation.prescription.status}
                  </Badge>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-700 mb-2">Medicines:</p>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {selectedConsultation.prescription.medicines.map((medicine, idx) => (
                          <li key={idx}>{medicine}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-2">Instructions:</p>
                      <p className="text-gray-600">{selectedConsultation.prescription.instructions}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Written on: {selectedConsultation.prescription.writtenDate}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline">
                    <Send className="w-4 h-4 mr-2" />
                    Send to Patient
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No prescription written yet</p>
                <Button 
                  onClick={() => {
                    if (selectedConsultation) {
                      createPrescription(selectedConsultation.id, {
                        medicines: ['Sample Medicine 500mg'],
                        instructions: 'Take as prescribed by doctor'
                      });
                    }
                    setShowPrescriptionDialog(false);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Write Prescription
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Consultation Details Modal */}
      <ConsultationDetailsModal 
        consultation={selectedConsultationForDetails}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedConsultationForDetails(null);
        }}
        userRole="admin"
      />
    </div>
  );
};

export default ConsultationManagementFlow; 