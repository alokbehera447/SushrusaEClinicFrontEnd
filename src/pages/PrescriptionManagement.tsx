import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  Plus, 
  Edit, 
  Eye, 
  Download, 
  Search, 
  Filter,
  Calendar,
  User,
  Pill,
  Heart,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  ArrowLeft,
  Save,
  Printer
} from 'lucide-react';
import { prescriptionApi } from '@/lib/api';
import { toast } from '@/lib/toast';

// Types
interface Prescription {
  id: string | number;
  patient: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role?: string;
    date_of_birth?: string | null;
    gender?: string;
  };
  doctor: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    role?: string;
    date_of_birth?: string | null;
    gender?: string;
  };
  consultation: string | {
    id: string;
    scheduled_date?: string;
    scheduled_time?: string;
  };
  primary_diagnosis: string;
  issued_date: string;
  issued_time: string;
  is_draft: boolean;
  is_finalized: boolean;
  medication_count?: number;
  medications?: Array<{
    id: string;
    medicine_name: string;
    dosage_display: string;
    frequency: string;
    duration_days: number;
  }>;
  vital_signs?: {
    blood_pressure_systolic: number;
    blood_pressure_diastolic: number;
    pulse: number;
    temperature: number;
    weight: number;
  };
  general_instructions?: string;
  created_at: string;
  updated_at: string;
}

interface PrescriptionPDF {
  id: string;
  version_number: number;
  is_current: boolean;
  generated_at: string;
  file_url: string;
  file_size: number;
}

const PrescriptionManagement: React.FC = () => {
  const navigate = useNavigate();
  const { consultationId } = useParams<{ consultationId?: string }>();
  
  // State
  const [activeTab, setActiveTab] = useState("all");
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [pdfVersions, setPdfVersions] = useState<PrescriptionPDF[]>([]);

  // Form state for new prescription
  const [newPrescription, setNewPrescription] = useState({
    consultation: consultationId || "",
    patient: "",
    primary_diagnosis: "",
    is_draft: true,
    medications: [],
    vital_signs: {
      blood_pressure_systolic: "",
      blood_pressure_diastolic: "",
      pulse: "",
      temperature: "",
      weight: ""
    },
    general_instructions: ""
  });

  // Load prescriptions based on active tab
  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      let response;
      switch (activeTab) {
        case "drafts":
          response = await prescriptionApi.getDrafts();
          break;
        case "finalized":
          response = await prescriptionApi.getFinalized();
          break;
        default:
          response = await prescriptionApi.getPrescriptions();
      }
      
      console.log('API Response:', response);
      
      // Handle different response structures
      let prescriptionsData = [];
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          prescriptionsData = response;
          console.log('Extracted from Array response:', prescriptionsData.length, 'prescriptions');
        } else if (response.results && response.results.data && Array.isArray(response.results.data)) {
          // Handle nested structure: { results: { data: [...] } }
          prescriptionsData = response.results.data;
          console.log('Extracted from response.results.data:', prescriptionsData.length, 'prescriptions');
        } else if (response.results && Array.isArray(response.results)) {
          // Handle direct structure: { results: [...] }
          prescriptionsData = response.results;
          console.log('Extracted from response.results:', prescriptionsData.length, 'prescriptions');
        } else if (response.data && Array.isArray(response.data)) {
          // Handle direct structure: { data: [...] }
          prescriptionsData = response.data;
          console.log('Extracted from response.data:', prescriptionsData.length, 'prescriptions');
        } else {
          console.warn('Unexpected response structure:', response);
          prescriptionsData = [];
        }
      }
      
      console.log('Final prescriptionsData:', prescriptionsData);
      
      setPrescriptions(prescriptionsData);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      toast.error("Error loading prescriptions");
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Load prescriptions on component mount and tab change
  useEffect(() => {
    loadPrescriptions();
  }, [activeTab]);

  // Create new prescription
  const handleCreatePrescription = async () => {
    try {
      const response = await prescriptionApi.createPrescription(newPrescription);
      toast.success("Prescription created successfully");
      setShowCreateDialog(false);
      loadPrescriptions();
      // Navigate to prescription writer
      navigate(`/prescriptions/${response.data.id}/write`);
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error("Error creating prescription");
    }
  };

  // Load PDF versions for a prescription
  const loadPdfVersions = async (prescriptionId: string) => {
    try {
      const response = await prescriptionApi.getPDFVersions(prescriptionId);
      setPdfVersions(response.versions || []);
    } catch (error) {
      console.error('Error loading PDF versions:', error);
      toast.error("Error loading PDF versions");
    }
  };

  // Download PDF
  const handleDownloadPDF = async (prescriptionId: string, version: string = 'latest') => {
    try {
      const blob = await prescriptionApi.downloadPDF(prescriptionId, version);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescription-${prescriptionId}-v${version}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error("Error downloading PDF");
    }
  };

  // Finalize prescription
  const handleFinalizePrescription = async (prescriptionId: string) => {
    try {
      const response = await prescriptionApi.finalizeAndGeneratePDF(prescriptionId);
      toast.success("Prescription finalized and PDF generated successfully");
      loadPrescriptions();
    } catch (error) {
      console.error('Error finalizing prescription:', error);
      toast.error("Error finalizing prescription");
    }
  };

  // Filter prescriptions based on search term
  const filteredPrescriptions = Array.isArray(prescriptions) ? prescriptions.filter(prescription =>
    prescription.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.primary_diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // View prescription details
  const viewPrescriptionDetails = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    loadPdfVersions(prescription.id);
    setShowDetailsDialog(true);
  };

  // Edit prescription
  const editPrescription = (prescriptionId: string) => {
    navigate(`/prescriptions/${prescriptionId}/write`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prescription Management</h1>
            <p className="text-gray-600">Manage and create prescriptions for consultations</p>
          </div>
        </div>
        
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          Create Prescription
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search prescriptions by patient name, diagnosis, or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            All Prescriptions
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            Drafts
          </TabsTrigger>
          <TabsTrigger value="finalized" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            Finalized
          </TabsTrigger>
          <TabsTrigger value="consultation" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            Consultation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <PrescriptionList 
            prescriptions={filteredPrescriptions}
            loading={loading}
            onViewDetails={viewPrescriptionDetails}
            onEdit={editPrescription}
            onDownloadPDF={handleDownloadPDF}
            onFinalize={handleFinalizePrescription}
          />
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <PrescriptionList 
            prescriptions={filteredPrescriptions}
            loading={loading}
            onViewDetails={viewPrescriptionDetails}
            onEdit={editPrescription}
            onDownloadPDF={handleDownloadPDF}
            onFinalize={handleFinalizePrescription}
          />
        </TabsContent>

        <TabsContent value="finalized" className="space-y-4">
          <PrescriptionList 
            prescriptions={filteredPrescriptions}
            loading={loading}
            onViewDetails={viewPrescriptionDetails}
            onEdit={editPrescription}
            onDownloadPDF={handleDownloadPDF}
            onFinalize={handleFinalizePrescription}
          />
        </TabsContent>

        <TabsContent value="consultation" className="space-y-4">
          <ConsultationPrescriptions 
            consultationId={consultationId}
            onViewDetails={viewPrescriptionDetails}
            onEdit={editPrescription}
            onDownloadPDF={handleDownloadPDF}
            onFinalize={handleFinalizePrescription}
          />
        </TabsContent>
      </Tabs>

      {/* Create Prescription Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Prescription</DialogTitle>
            <DialogDescription>
              Create a new prescription for a consultation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="consultation">Consultation ID</Label>
                <Input
                  id="consultation"
                  value={newPrescription.consultation}
                  onChange={(e) => setNewPrescription({
                    ...newPrescription,
                    consultation: e.target.value
                  })}
                  placeholder="Enter consultation ID"
                />
              </div>
              <div>
                <Label htmlFor="patient">Patient ID</Label>
                <Input
                  id="patient"
                  value={newPrescription.patient}
                  onChange={(e) => setNewPrescription({
                    ...newPrescription,
                    patient: e.target.value
                  })}
                  placeholder="Enter patient ID"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="diagnosis">Primary Diagnosis</Label>
              <Textarea
                id="diagnosis"
                value={newPrescription.primary_diagnosis}
                onChange={(e) => setNewPrescription({
                  ...newPrescription,
                  primary_diagnosis: e.target.value
                })}
                placeholder="Enter primary diagnosis"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="instructions">General Instructions</Label>
              <Textarea
                id="instructions"
                value={newPrescription.general_instructions}
                onChange={(e) => setNewPrescription({
                  ...newPrescription,
                  general_instructions: e.target.value
                })}
                placeholder="Enter general instructions"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePrescription}>
              Create Prescription
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prescription Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>
              View prescription details and PDF versions
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="space-y-6">
              {/* Patient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Patient Name</Label>
                      <p className="font-medium">{selectedPrescription.patient.name}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="font-medium">{selectedPrescription.patient.phone}</p>
                    </div>
                    <div>
                      <Label>Doctor</Label>
                      <p className="font-medium">{selectedPrescription.doctor.name}</p>
                    </div>
                    <div>
                      <Label>Issued Date</Label>
                      <p className="font-medium">
                        {new Date(selectedPrescription.issued_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Diagnosis */}
              <Card>
                <CardHeader>
                  <CardTitle>Diagnosis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{selectedPrescription.primary_diagnosis}</p>
                </CardContent>
              </Card>

              {/* Vital Signs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5" />
                    Vital Signs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Blood Pressure</Label>
                      <p className="font-medium">
                        {selectedPrescription.vital_signs.blood_pressure_systolic}/
                        {selectedPrescription.vital_signs.blood_pressure_diastolic} mmHg
                      </p>
                    </div>
                    <div>
                      <Label>Pulse</Label>
                      <p className="font-medium">{selectedPrescription.vital_signs.pulse} bpm</p>
                    </div>
                    <div>
                      <Label>Temperature</Label>
                      <p className="font-medium">{selectedPrescription.vital_signs.temperature}°C</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Pill className="w-5 h-5" />
                    Medications ({selectedPrescription.medications.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedPrescription.medications.map((medication, index) => (
                      <div key={medication.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{medication.medicine_name}</h4>
                            <p className="text-sm text-gray-600">
                              Dosage: {medication.dosage_display} | Frequency: {medication.frequency}
                            </p>
                            <p className="text-sm text-gray-600">
                              Duration: {medication.duration_days} days
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              {selectedPrescription.general_instructions && (
                <Card>
                  <CardHeader>
                    <CardTitle>General Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedPrescription.general_instructions}</p>
                  </CardContent>
                </Card>
              )}

              {/* PDF Versions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    PDF Versions ({pdfVersions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pdfVersions.map((pdf) => (
                      <div key={pdf.id} className="flex items-center justify-between border rounded-lg p-3">
                        <div>
                          <h4 className="font-medium">Version {pdf.version_number}</h4>
                          <p className="text-sm text-gray-600">
                            Generated: {new Date(pdf.generated_at).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Size: {(pdf.file_size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {pdf.is_current && (
                            <Badge variant="default">Current</Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPDF(selectedPrescription.id, pdf.version_number.toString())}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            {selectedPrescription && (
              <Button onClick={() => editPrescription(selectedPrescription.id)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Prescription
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Prescription List Component
interface PrescriptionListProps {
  prescriptions: Prescription[];
  loading: boolean;
  onViewDetails: (prescription: Prescription) => void;
  onEdit: (prescriptionId: string) => void;
  onDownloadPDF: (prescriptionId: string, version?: string) => void;
  onFinalize: (prescriptionId: string) => void;
}

const PrescriptionList: React.FC<PrescriptionListProps> = ({
  prescriptions,
  loading,
  onViewDetails,
  onEdit,
  onDownloadPDF,
  onFinalize
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  // Ensure prescriptions is an array
  const prescriptionsArray = Array.isArray(prescriptions) ? prescriptions : [];
  console.log('PrescriptionList - prescriptions:', prescriptionsArray);

  if (prescriptionsArray.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
            <p className="text-gray-600">Create your first prescription to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {prescriptionsArray.map((prescription) => (
        <Card key={prescription.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>{prescription.patient.name}</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  {prescription.primary_diagnosis}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={prescription.is_finalized ? "default" : "secondary"}>
                  {prescription.is_finalized ? "Finalized" : "Draft"}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(prescription)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(prescription.id)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {prescription.is_finalized && (
                      <DropdownMenuItem onClick={() => onDownloadPDF(prescription.id)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </DropdownMenuItem>
                    )}
                    {!prescription.is_finalized && (
                      <DropdownMenuItem onClick={() => onFinalize(prescription.id)}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Finalize
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Doctor:</span>
                <p className="text-gray-600">{prescription.doctor.name}</p>
              </div>
              <div>
                <span className="font-medium">Date:</span>
                <p className="text-gray-600">
                  {new Date(prescription.issued_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="font-medium">Medications:</span>
                <p className="text-gray-600">{prescription.medication_count || (prescription.medications ? prescription.medications.length : 0)}</p>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <p className="text-gray-600">
                  {prescription.is_draft ? "Draft" : "Finalized"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Consultation Prescriptions Component
interface ConsultationPrescriptionsProps {
  consultationId?: string;
  onViewDetails: (prescription: Prescription) => void;
  onEdit: (prescriptionId: string) => void;
  onDownloadPDF: (prescriptionId: string, version?: string) => void;
  onFinalize: (prescriptionId: string) => void;
}

const ConsultationPrescriptions: React.FC<ConsultationPrescriptionsProps> = ({
  consultationId,
  onViewDetails,
  onEdit,
  onDownloadPDF,
  onFinalize
}) => {
  const [consultationPrescriptions, setConsultationPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConsultationPrescriptions = async () => {
      if (!consultationId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await prescriptionApi.getPrescriptions();
        
        // Handle nested response structure
        let prescriptionsData = [];
        if (response && typeof response === 'object') {
          if (response.results && response.results.data && Array.isArray(response.results.data)) {
            prescriptionsData = response.results.data;
          } else if (response.results && Array.isArray(response.results)) {
            prescriptionsData = response.results;
          } else if (response.data && Array.isArray(response.data)) {
            prescriptionsData = response.data;
          }
        }
        
        const filtered = prescriptionsData.filter(
          (p: Prescription) => {
            if (typeof p.consultation === 'string') {
              return p.consultation === consultationId;
            } else if (p.consultation && typeof p.consultation === 'object') {
              return p.consultation.id === consultationId;
            }
            return false;
          }
        );
        setConsultationPrescriptions(filtered);
      } catch (error) {
        console.error('Error loading consultation prescriptions:', error);
        toast.error("Error loading consultation prescriptions");
      } finally {
        setLoading(false);
      }
    };

    loadConsultationPrescriptions();
  }, [consultationId]);

  if (!consultationId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No consultation selected</h3>
            <p className="text-gray-600">Select a consultation to view its prescriptions.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <PrescriptionList
      prescriptions={consultationPrescriptions}
      loading={loading}
      onViewDetails={onViewDetails}
      onEdit={onEdit}
      onDownloadPDF={onDownloadPDF}
      onFinalize={onFinalize}
    />
  );
};

export default PrescriptionManagement; 