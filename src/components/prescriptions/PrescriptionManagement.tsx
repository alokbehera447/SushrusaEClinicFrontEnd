import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from '@/lib/toast';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  MoreVertical,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { 
  prescriptionApi, 
  EnhancedPrescription,
  Consultation 
} from '@/lib/api';
import EnhancedPrescriptionWriter from './EnhancedPrescriptionWriter';

interface PrescriptionManagementProps {
  consultation?: Consultation;
}

const PrescriptionManagement: React.FC<PrescriptionManagementProps> = ({ consultation }) => {
  const [prescriptions, setPrescriptions] = useState<EnhancedPrescription[]>([]);
  const [drafts, setDrafts] = useState<EnhancedPrescription[]>([]);
  const [finalized, setFinalized] = useState<EnhancedPrescription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<EnhancedPrescription | null>(null);
  const [showPrescriptionWriter, setShowPrescriptionWriter] = useState(false);
  const [showPrescriptionView, setShowPrescriptionView] = useState(false);

  // Load prescriptions
  const loadPrescriptions = async () => {
    setIsLoading(true);
    try {
      const [allPrescriptions, draftPrescriptions, finalizedPrescriptions] = await Promise.all([
        prescriptionApi.getPrescriptions(),
        prescriptionApi.getDrafts(),
        prescriptionApi.getFinalized()
      ]);

      setPrescriptions(allPrescriptions.results || []);
      setDrafts(draftPrescriptions.results || []);
      setFinalized(finalizedPrescriptions.results || []);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  // Filter prescriptions based on search term
  const filterPrescriptions = (list: EnhancedPrescription[]) => {
    if (!searchTerm) return list;
    
    return list.filter(prescription => 
      prescription.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.primary_diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.consultation_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Download PDF
  const handleDownloadPDF = async (prescriptionId: string) => {
    try {
      const blob = await prescriptionApi.downloadPDF(prescriptionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescription_${prescriptionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  // Open prescription writer
  const openPrescriptionWriter = (prescription?: EnhancedPrescription) => {
    setSelectedPrescription(prescription || null);
    setShowPrescriptionWriter(true);
  };

  // View prescription details
  const viewPrescription = (prescription: EnhancedPrescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionView(true);
  };

  // Prescription card component
  const PrescriptionCard: React.FC<{ 
    prescription: EnhancedPrescription; 
    showActions?: boolean 
  }> = ({ prescription, showActions = true }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-gray-900">
                {prescription.patient?.name || 'Unknown Patient'}
              </h3>
              <div className="flex gap-1">
                {prescription.is_draft && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Draft
                  </Badge>
                )}
                {prescription.is_finalized && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Finalized
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                <span>{prescription.primary_diagnosis || 'No diagnosis'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{prescription.issued_date || 'Not issued'}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Consultation: {prescription.consultation_id || 'N/A'}</span>
              </div>
              {prescription.medications && prescription.medications.length > 0 && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{prescription.medications.length} medication(s)</span>
                </div>
              )}
            </div>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => viewPrescription(prescription)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {!prescription.is_finalized && (
                  <DropdownMenuItem onClick={() => openPrescriptionWriter(prescription)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {prescription.is_finalized && prescription.id && (
                  <DropdownMenuItem onClick={() => handleDownloadPDF(prescription.id!.toString())}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Prescription Management</h2>
          <p className="text-gray-600">Manage prescriptions for your patients</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowPrescriptionWriter(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Write New Prescription
          </Button>
          <Button
            onClick={loadPrescriptions}
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by patient name, diagnosis, or consultation ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prescription Lists */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            All Prescriptions ({prescriptions.length})
          </TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts ({drafts.length})
          </TabsTrigger>
          <TabsTrigger value="finalized">
            Finalized ({finalized.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading prescriptions...</span>
            </div>
          ) : filterPrescriptions(prescriptions).length > 0 ? (
            <div className="grid gap-4">
              {filterPrescriptions(prescriptions).map((prescription) => (
                <PrescriptionCard
                  key={prescription.id}
                  prescription={prescription}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No prescriptions found</p>
              <Button
                onClick={() => setShowPrescriptionWriter(true)}
                variant="outline"
                className="mt-2"
              >
                <FileText className="h-4 w-4 mr-2" />
                Write First Prescription
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          {filterPrescriptions(drafts).length > 0 ? (
            <div className="grid gap-4">
              {filterPrescriptions(drafts).map((prescription) => (
                <PrescriptionCard
                  key={prescription.id}
                  prescription={prescription}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No draft prescriptions</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="finalized" className="space-y-4">
          {filterPrescriptions(finalized).length > 0 ? (
            <div className="grid gap-4">
              {filterPrescriptions(finalized).map((prescription) => (
                <PrescriptionCard
                  key={prescription.id}
                  prescription={prescription}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No finalized prescriptions</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Prescription Writer Dialog */}
      <Dialog open={showPrescriptionWriter} onOpenChange={setShowPrescriptionWriter}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPrescription ? 'Edit Prescription' : 'Write New Prescription'}
            </DialogTitle>
          </DialogHeader>
          {consultation && (
            <EnhancedPrescriptionWriter
              consultationId={consultation.id}
              patientId={consultation.patient.toString()}
              existingPrescription={selectedPrescription || undefined}
              onClose={() => {
                setShowPrescriptionWriter(false);
                setSelectedPrescription(null);
                loadPrescriptions(); // Refresh the list
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Prescription View Dialog */}
      <Dialog open={showPrescriptionView} onOpenChange={setShowPrescriptionView}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
          </DialogHeader>
          {selectedPrescription && (
            <PrescriptionDetailsView
              prescription={selectedPrescription}
              onEdit={() => {
                setShowPrescriptionView(false);
                setShowPrescriptionWriter(true);
              }}
              onDownloadPDF={() => {
                if (selectedPrescription.id) {
                  handleDownloadPDF(selectedPrescription.id.toString());
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Prescription Details View Component
interface PrescriptionDetailsViewProps {
  prescription: EnhancedPrescription;
  onEdit: () => void;
  onDownloadPDF: () => void;
}

const PrescriptionDetailsView: React.FC<PrescriptionDetailsViewProps> = ({
  prescription,
  onEdit,
  onDownloadPDF
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Prescription Details</h3>
          <div className="flex items-center gap-2 mt-1">
            {prescription.is_draft && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <Clock className="h-3 w-3 mr-1" />
                Draft
              </Badge>
            )}
            {prescription.is_finalized && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Finalized
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {!prescription.is_finalized && (
            <Button onClick={onEdit} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {prescription.is_finalized && (
            <Button onClick={onDownloadPDF} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          )}
        </div>
      </div>

      {/* Patient & Doctor Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Name:</strong> {prescription.patient?.name || 'N/A'}</div>
              <div><strong>Age:</strong> {prescription.patient_age || 'N/A'}</div>
              <div><strong>Gender:</strong> {prescription.patient_gender || 'N/A'}</div>
              <div><strong>Consultation:</strong> {prescription.consultation_id || 'N/A'}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prescription Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Issued Date:</strong> {prescription.issued_date || 'N/A'}</div>
              <div><strong>Issued Time:</strong> {prescription.issued_time || 'N/A'}</div>
              <div><strong>Doctor:</strong> {prescription.doctor?.name || 'N/A'}</div>
              <div><strong>Status:</strong> {prescription.is_finalized ? 'Finalized' : 'Draft'}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vital Signs */}
      {(prescription.pulse || prescription.blood_pressure_systolic || prescription.temperature) && (
        <Card>
          <CardHeader>
            <CardTitle>Vital Signs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {prescription.pulse && (
                <div>
                  <div className="text-sm text-gray-500">Pulse</div>
                  <div className="font-medium">{prescription.pulse} bpm</div>
                </div>
              )}
              {prescription.blood_pressure_systolic && prescription.blood_pressure_diastolic && (
                <div>
                  <div className="text-sm text-gray-500">Blood Pressure</div>
                  <div className="font-medium">
                    {prescription.blood_pressure_systolic}/{prescription.blood_pressure_diastolic} mmHg
                  </div>
                </div>
              )}
              {prescription.temperature && (
                <div>
                  <div className="text-sm text-gray-500">Temperature</div>
                  <div className="font-medium">{prescription.temperature}°F</div>
                </div>
              )}
              {prescription.weight && (
                <div>
                  <div className="text-sm text-gray-500">Weight</div>
                  <div className="font-medium">{prescription.weight} kg</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diagnosis */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnosis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {prescription.primary_diagnosis && (
              <div>
                <div className="text-sm text-gray-500">Primary Diagnosis</div>
                <div className="font-medium">{prescription.primary_diagnosis}</div>
              </div>
            )}
            {prescription.patient_previous_history && (
              <div>
                <div className="text-sm text-gray-500">Patient Previous History</div>
                <div className="font-medium">{prescription.patient_previous_history}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medications */}
      {prescription.medications && prescription.medications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Medications ({prescription.medications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prescription.medications.map((medication, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="font-medium">{medication.medicine_name}</div>
                  {medication.composition && (
                    <div className="text-sm text-gray-600">{medication.composition}</div>
                  )}
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Dosage:</span> {medication.morning_dose}-{medication.afternoon_dose}-{medication.evening_dose}
                    </div>
                    <div>
                      <span className="text-gray-500">Frequency:</span> {medication.frequency.replace('_', ' ')}
                    </div>
                    <div>
                      <span className="text-gray-500">Timing:</span> {medication.timing.replace('_', ' ')}
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span> {medication.duration_days || 'N/A'} days
                    </div>
                  </div>
                  {medication.special_instructions && (
                    <div className="mt-2">
                      <span className="text-gray-500">Instructions:</span> {medication.special_instructions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {(prescription.general_instructions || prescription.diet_instructions || prescription.lifestyle_advice) && (
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prescription.general_instructions && (
                <div>
                  <div className="text-sm text-gray-500">General Instructions</div>
                  <div>{prescription.general_instructions}</div>
                </div>
              )}
              {prescription.diet_instructions && (
                <div>
                  <div className="text-sm text-gray-500">Diet Instructions</div>
                  <div>{prescription.diet_instructions}</div>
                </div>
              )}
              {prescription.lifestyle_advice && (
                <div>
                  <div className="text-sm text-gray-500">Lifestyle Advice</div>
                  <div>{prescription.lifestyle_advice}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Follow-up */}
      {(prescription.next_visit || prescription.follow_up_notes) && (
        <Card>
          <CardHeader>
            <CardTitle>Follow-up</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prescription.next_visit && (
                <div>
                  <div className="text-sm text-gray-500">Next Visit</div>
                  <div>{prescription.next_visit}</div>
                </div>
              )}
              {prescription.follow_up_notes && (
                <div>
                  <div className="text-sm text-gray-500">Follow-up Notes</div>
                  <div>{prescription.follow_up_notes}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PrescriptionManagement;