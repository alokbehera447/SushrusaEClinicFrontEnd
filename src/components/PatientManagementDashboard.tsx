import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  FileImage, 
  StickyNote, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  User,
  Eye
} from 'lucide-react';
import { 
  patientService, 
  type PatientProfile, 
  type MedicalRecord, 
  type PatientDocument, 
  type PatientNote, 
  type Consultation,
  type PatientStats 
} from '@/services/patientService';
import { toast } from '@/hooks/use-toast';

interface PatientManagementDashboardProps {
  patientId: string;
}

export const PatientManagementDashboard: React.FC<PatientManagementDashboardProps> = ({ 
  patientId 
}) => {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Form states
  const [showMedicalRecordDialog, setShowMedicalRecordDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [editingDocument, setEditingDocument] = useState<PatientDocument | null>(null);
  const [editingNote, setEditingNote] = useState<PatientNote | null>(null);
  
  const [medicalRecordForm, setMedicalRecordForm] = useState({
    record_type: 'lab_report' as 'lab_report' | 'prescription' | 'diagnosis' | 'vaccination' | 'surgery' | 'allergy' | 'other',
    title: '',
    description: '',
    date_recorded: new Date().toISOString().split('T')[0],
    document: null as File | null
  });

  const [documentForm, setDocumentForm] = useState({
    document_type: 'medical_report' as 'id_proof' | 'address_proof' | 'insurance_card' | 'medical_report' | 'prescription' | 'lab_report' | 'other',
    title: '',
    description: '',
    file: null as File | null
  });

  const [noteForm, setNoteForm] = useState({
    note: '',
    is_private: false
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async (page = currentPage) => {
    try {
      setLoading(true);
      
      console.log('🔍 Loading patient data for ID:', patientId, 'Page:', page);
      
      const [patientRes, recordsRes, docsRes, notesRes, consultationsRes] = await Promise.all([
        patientService.getPatient(patientId),
        patientService.getMedicalRecords(patientId, { page, page_size: pageSize }),
        patientService.getPatientDocuments(patientId),
        patientService.getPatientNotes(patientId),
        patientService.getPatientConsultations(patientId)
      ]);

      console.log('📊 API Responses:', {
        patientRes,
        recordsRes,
        docsRes,
        notesRes,
        consultationsRes
      });

      // Safely set patient data
      if (patientRes?.data) {
        setPatient(patientRes.data);
      }

      // Safely set medical records with paginated response handling
      let medicalRecordsData: MedicalRecord[] = [];
      
      const recordsResponse = recordsRes as { results?: MedicalRecord[] | { data?: MedicalRecord[] } };
      console.log('🔍 Processing medical records response:', {
        hasData: !!recordsRes?.data,
        hasResults: !!recordsResponse?.results,
        resultsDataType: typeof recordsResponse?.results,
        resultsData: recordsResponse?.results
      });
      
      if (recordsResponse?.results && Array.isArray(recordsResponse.results)) {
        // Direct array in results
        medicalRecordsData = recordsResponse.results;
        console.log('✅ Found medical records in recordsRes.results (direct array)');
      } else if (recordsResponse?.results && recordsResponse.results.data && Array.isArray(recordsResponse.results.data)) {
        // Nested structure: results.data
        medicalRecordsData = recordsResponse.results.data;
        console.log('✅ Found medical records in recordsRes.results.data');
      } else if (recordsRes?.data) {
        if (Array.isArray(recordsRes.data)) {
          medicalRecordsData = recordsRes.data;
          console.log('✅ Found medical records in recordsRes.data (array)');
        } else if (recordsRes.data?.results && Array.isArray(recordsRes.data.results)) {
          medicalRecordsData = recordsRes.data.results;
          console.log('✅ Found medical records in recordsRes.data.results');
        } else {
          medicalRecordsData = [];
          console.log('❌ No valid medical records data found');
        }
      } else {
        medicalRecordsData = [];
        console.log('❌ No medical records response data');
      }
      
      console.log('🏥 Setting Medical Records:', {
        count: medicalRecordsData.length,
        records: medicalRecordsData.map(r => ({ id: r.id, title: r.title }))
      });
      
      setMedicalRecords(medicalRecordsData);

      // Safely set other data with paginated response handling
      if ((docsRes as any)?.results && Array.isArray((docsRes as any).results)) {
        setDocuments((docsRes as any).results);
      } else if ((docsRes as any)?.results?.data && Array.isArray((docsRes as any).results.data)) {
        setDocuments((docsRes as any).results.data);
      } else if (docsRes?.data) {
        if (Array.isArray(docsRes.data)) {
          setDocuments(docsRes.data);
        } else if (docsRes.data?.results && Array.isArray(docsRes.data.results)) {
          setDocuments(docsRes.data.results);
        } else {
          setDocuments([]);
        }
      } else {
        setDocuments([]);
      }

      const notesResponse = notesRes as { results?: PatientNote[] | { data?: PatientNote[] } };
      if (notesResponse?.results && Array.isArray(notesResponse.results)) {
        setNotes(notesResponse.results);
        console.log('✅ Found notes in notesRes.results (direct array)');
      } else if (notesResponse?.results && typeof notesResponse.results === 'object' && notesResponse.results.data && Array.isArray(notesResponse.results.data)) {
        setNotes(notesResponse.results.data);
        console.log('✅ Found notes in notesRes.results.data');
      } else if (notesRes?.data) {
        if (Array.isArray(notesRes.data)) {
          setNotes(notesRes.data);
        } else if (notesRes.data?.results && Array.isArray(notesRes.data.results)) {
          setNotes(notesRes.data.results);
        } else {
          setNotes([]);
        }
      } else {
        setNotes([]);
      }

      const consultationsResponse = consultationsRes as { results?: Consultation[] | { data?: Consultation[] } };
      if (consultationsResponse?.results && Array.isArray(consultationsResponse.results)) {
        setConsultations(consultationsResponse.results);
        console.log('✅ Found consultations in consultationsRes.results (direct array)');
      } else if (consultationsResponse?.results && typeof consultationsResponse.results === 'object' && consultationsResponse.results.data && Array.isArray(consultationsResponse.results.data)) {
        setConsultations(consultationsResponse.results.data);
        console.log('✅ Found consultations in consultationsRes.results.data');
      } else if (consultationsRes?.data) {
        if (Array.isArray(consultationsRes.data)) {
          setConsultations(consultationsRes.data);
        } else if (consultationsRes.data?.results && Array.isArray(consultationsRes.data.results)) {
          setConsultations(consultationsRes.data.results);
        } else {
          setConsultations([]);
        }
      } else {
        setConsultations([]);
      }

    } catch (error) {
      console.error('Error loading patient data:', error);
      toast({
        title: "Error",
        description: "Failed to load patient data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMedicalRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = patientService.createFormData(medicalRecordForm);
      
      if (editingRecord) {
        // Update existing record
        const updateData = {
          record_type: medicalRecordForm.record_type,
          title: medicalRecordForm.title,
          description: medicalRecordForm.description,
          date_recorded: medicalRecordForm.date_recorded
        };
        await patientService.updateMedicalRecord(patientId, editingRecord.id, updateData);
        toast({
          title: "Success",
          description: "Medical record updated successfully",
        });
      } else {
        // Create new record
        await patientService.createMedicalRecord(patientId, formData);
        toast({
          title: "Success",
          description: "Medical record created successfully",
        });
      }
      
      setShowMedicalRecordDialog(false);
      setEditingRecord(null);
      setMedicalRecordForm({
        record_type: 'lab_report',
        title: '',
        description: '',
        date_recorded: new Date().toISOString().split('T')[0],
        document: null
      });
      loadPatientData();
    } catch (error) {
      console.error('Error saving medical record:', error);
      toast({
        title: "Error",
        description: editingRecord ? "Failed to update medical record" : "Failed to create medical record",
        variant: "destructive",
      });
    }
  };

  const handleEditMedicalRecord = (record: MedicalRecord) => {
    setEditingRecord(record);
    setMedicalRecordForm({
      record_type: record.record_type,
      title: record.title,
      description: record.description,
      date_recorded: record.date_recorded,
      document: null
    });
    setShowMedicalRecordDialog(true);
  };

  const handleDeleteMedicalRecord = async (recordId: number) => {
    if (window.confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
      try {
        await patientService.deleteMedicalRecord(patientId, recordId);
        toast({
          title: "Success",
          description: "Medical record deleted successfully",
        });
        loadPatientData();
      } catch (error) {
        console.error('Error deleting medical record:', error);
        toast({
          title: "Error",
          description: "Failed to delete medical record",
          variant: "destructive",
        });
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadPatientData(page);
  };

  // Document handling functions
  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = patientService.createFormData(documentForm);
      
      if (editingDocument) {
        // Update existing document
        const updateData = {
          document_type: documentForm.document_type,
          title: documentForm.title,
          description: documentForm.description
        };
        await patientService.updatePatientDocument(patientId, editingDocument.id, updateData);
        toast({
          title: "Success",
          description: "Document updated successfully",
        });
      } else {
        // Upload new document
        await patientService.uploadPatientDocument(patientId, formData);
        toast({
          title: "Success",
          description: "Document uploaded successfully",
        });
      }
      
      setShowDocumentDialog(false);
      setEditingDocument(null);
      setDocumentForm({
        document_type: 'medical_report',
        title: '',
        description: '',
        file: null
      });
      loadPatientData();
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "Error",
        description: editingDocument ? "Failed to update document" : "Failed to upload document",
        variant: "destructive",
      });
    }
  };

  const handleEditDocument = (document: PatientDocument) => {
    setEditingDocument(document);
    setDocumentForm({
      document_type: document.document_type,
      title: document.title,
      description: document.description,
      file: null
    });
    setShowDocumentDialog(true);
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      try {
        await patientService.deletePatientDocument(patientId, documentId);
        toast({
          title: "Success",
          description: "Document deleted successfully",
        });
        loadPatientData();
      } catch (error) {
        console.error('Error deleting document:', error);
        toast({
          title: "Error",
          description: "Failed to delete document",
          variant: "destructive",
        });
      }
    }
  };

  // Note handling functions
  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNote) {
        // Update existing note
        const updateData = {
          note: noteForm.note,
          is_private: noteForm.is_private
        };
        await patientService.updatePatientNote(patientId, editingNote.id, updateData);
        toast({
          title: "Success",
          description: "Note updated successfully",
        });
      } else {
        // Create new note
        await patientService.createPatientNote(patientId, noteForm);
        toast({
          title: "Success",
          description: "Note created successfully",
        });
      }
      
      setShowNoteDialog(false);
      setEditingNote(null);
      setNoteForm({ note: '', is_private: false });
      loadPatientData();
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error",
        description: editingNote ? "Failed to update note" : "Failed to create note",
        variant: "destructive",
      });
    }
  };

  const handleEditNote = (note: PatientNote) => {
    setEditingNote(note);
    setNoteForm({
      note: note.note,
      is_private: note.is_private
    });
    setShowNoteDialog(true);
  };

  const handleDeleteNote = async (noteId: number) => {
    if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      try {
        await patientService.deletePatientNote(patientId, noteId);
        toast({
          title: "Success",
          description: "Note deleted successfully",
        });
        loadPatientData();
      } catch (error) {
        console.error('Error deleting note:', error);
        toast({
          title: "Error",
          description: "Failed to delete note",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedicalRecordForm(prev => ({ ...prev, document: file }));
    }
  };

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentForm(prev => ({ ...prev, file }));
    }
  };

  const getRecordTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      lab_report: 'bg-blue-100 text-blue-800',
      prescription: 'bg-green-100 text-green-800',
      diagnosis: 'bg-purple-100 text-purple-800',
      vaccination: 'bg-yellow-100 text-yellow-800',
      surgery: 'bg-red-100 text-red-800',
      allergy: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      id_proof: 'bg-blue-100 text-blue-800',
      address_proof: 'bg-green-100 text-green-800',
      insurance_card: 'bg-purple-100 text-purple-800',
      medical_report: 'bg-red-100 text-red-800',
      prescription: 'bg-yellow-100 text-yellow-800',
      lab_report: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {patient.user_name}
              </CardTitle>
              <CardDescription>
                Patient ID: {patient.user} | Age: {patient.age} | {patient.gender}
              </CardDescription>
            </div>
            <Badge variant="default">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Contact</Label>
              <p className="text-sm">{patient.user_phone}</p>
              <p className="text-sm text-gray-600">{patient.user_email || 'No email'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Blood Group</Label>
              <p className="text-sm">{patient.blood_group}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Location</Label>
              <p className="text-sm">{patient.city}, {patient.state}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Emergency Contact</Label>
              <p className="text-sm">{patient.emergency_contact_name}</p>
              <p className="text-sm text-gray-600">{patient.emergency_contact_phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medical-records">Medical Records</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{medicalRecords.length}</div>
                <p className="text-xs text-muted-foreground">Total records</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <FileImage className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documents.length}</div>
                <p className="text-xs text-muted-foreground">Uploaded files</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notes</CardTitle>
                <StickyNote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{notes.length}</div>
                <p className="text-xs text-muted-foreground">Clinical notes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consultations</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{consultations.length}</div>
                <p className="text-xs text-muted-foreground">Total visits</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Medical Records Tab */}
        <TabsContent value="medical-records" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Medical Records ({totalRecords})</h3>
            <Dialog open={showMedicalRecordDialog} onOpenChange={setShowMedicalRecordDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingRecord(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingRecord ? 'Edit Medical Record' : 'Add Medical Record'}</DialogTitle>
                  <DialogDescription>
                    {editingRecord ? 'Update the medical record details.' : 'Create a new medical record for this patient.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleMedicalRecordSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="record_type">Record Type</Label>
                    <Select 
                      value={medicalRecordForm.record_type} 
                      onValueChange={(value) => setMedicalRecordForm(prev => ({ ...prev, record_type: value as 'lab_report' | 'prescription' | 'diagnosis' | 'vaccination' | 'surgery' | 'allergy' | 'other' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lab_report">Lab Report</SelectItem>
                        <SelectItem value="prescription">Prescription</SelectItem>
                        <SelectItem value="diagnosis">Diagnosis</SelectItem>
                        <SelectItem value="vaccination">Vaccination</SelectItem>
                        <SelectItem value="surgery">Surgery</SelectItem>
                        <SelectItem value="allergy">Allergy</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={medicalRecordForm.title}
                      onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={medicalRecordForm.description}
                      onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_recorded">Date Recorded</Label>
                    <Input
                      id="date_recorded"
                      type="date"
                      value={medicalRecordForm.date_recorded}
                      onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, date_recorded: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="document">Document (Optional)</Label>
                    <Input
                      id="document"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowMedicalRecordDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingRecord ? 'Update Record' : 'Create Record'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {medicalRecords.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getRecordTypeColor(record.record_type)}>
                        {record.record_type.replace('_', ' ')}
                      </Badge>
                      <CardTitle className="text-lg">{record.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {record.document_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={record.document_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditMedicalRecord(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteMedicalRecord(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Recorded by {record.recorded_by_name} on {new Date(record.date_recorded).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{record.description}</p>
                </CardContent>
              </Card>
            ))}
            {medicalRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No medical records found
              </div>
            )}

            {/* Pagination */}
            {totalRecords > pageSize && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {Math.ceil(totalRecords / pageSize)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(totalRecords / pageSize)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Patient Documents ({documents.length})</h3>
            <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingDocument(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingDocument ? 'Edit Document' : 'Upload Document'}</DialogTitle>
                  <DialogDescription>
                    {editingDocument ? 'Update the document details.' : 'Upload a new document for this patient.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleDocumentSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="document_type">Document Type</Label>
                    <Select 
                      value={documentForm.document_type} 
                      onValueChange={(value) => setDocumentForm(prev => ({ ...prev, document_type: value as 'id_proof' | 'address_proof' | 'insurance_card' | 'medical_report' | 'prescription' | 'lab_report' | 'other' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id_proof">ID Proof</SelectItem>
                        <SelectItem value="address_proof">Address Proof</SelectItem>
                        <SelectItem value="insurance_card">Insurance Card</SelectItem>
                        <SelectItem value="medical_report">Medical Report</SelectItem>
                        <SelectItem value="prescription">Prescription</SelectItem>
                        <SelectItem value="lab_report">Lab Report</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="doc_title">Title</Label>
                    <Input
                      id="doc_title"
                      value={documentForm.title}
                      onChange={(e) => setDocumentForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="doc_description">Description</Label>
                    <Textarea
                      id="doc_description"
                      value={documentForm.description}
                      onChange={(e) => setDocumentForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  {!editingDocument && (
                    <div>
                      <Label htmlFor="doc_file">File</Label>
                      <Input
                        id="doc_file"
                        type="file"
                        onChange={handleDocumentFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                        required
                      />
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowDocumentDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingDocument ? 'Update Document' : 'Upload Document'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getDocumentTypeColor(doc.document_type)}>
                        {doc.document_type.replace('_', ' ')}
                      </Badge>
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      {doc.is_verified && (
                        <Badge variant="default">Verified</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.file_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditDocument(doc)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Uploaded on {new Date(doc.uploaded_at).toLocaleDateString()}
                    {doc.verified_by_name && ` • Verified by ${doc.verified_by_name}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{doc.description}</p>
                </CardContent>
              </Card>
            ))}
            {documents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No documents found
              </div>
            )}
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Clinical Notes ({notes.length})</h3>
            <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingNote(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingNote ? 'Edit Note' : 'Add Clinical Note'}</DialogTitle>
                  <DialogDescription>
                    {editingNote ? 'Update the note details.' : 'Create a new clinical note for this patient.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleNoteSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="note">Note</Label>
                    <Textarea
                      id="note"
                      value={noteForm.note}
                      onChange={(e) => setNoteForm(prev => ({ ...prev, note: e.target.value }))}
                      required
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_private"
                      checked={noteForm.is_private}
                      onChange={(e) => setNoteForm(prev => ({ ...prev, is_private: e.target.checked }))}
                    />
                    <Label htmlFor="is_private">Private note (only visible to doctors)</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowNoteDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingNote ? 'Update Note' : 'Create Note'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">Note #{note.id}</CardTitle>
                      {note.is_private && (
                        <Badge variant="secondary">Private</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditNote(note)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Created by {note.created_by_name} on {new Date(note.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{note.note}</p>
                </CardContent>
              </Card>
            ))}
            {notes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No notes found
              </div>
            )}
          </div>
        </TabsContent>

        {/* Consultations Tab */}
        <TabsContent value="consultations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Consultation History ({consultations.length})</h3>
          </div>

          <div className="grid gap-4">
            {consultations.map((consultation) => (
              <Card key={consultation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={consultation.status === 'completed' ? 'default' : 'secondary'}>
                        {consultation.status}
                      </Badge>
                      <CardTitle className="text-lg">
                        Consultation with {consultation.doctor_name}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {new Date(consultation.scheduled_at).toLocaleDateString()} • {consultation.consultation_type} • ${consultation.consultation_fee}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-500">Duration</Label>
                      <p>{consultation.duration} minutes</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Payment Status</Label>
                      <Badge variant={consultation.payment_status === 'paid' ? 'default' : 'secondary'}>
                        {consultation.payment_status}
                      </Badge>
                    </div>
                    {consultation.primary_diagnosis && (
                      <div>
                        <Label className="text-gray-500">Diagnosis</Label>
                        <p>{consultation.primary_diagnosis}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-gray-500">Prescription Required</Label>
                      <p>{consultation.prescription_required ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {consultations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No consultations found
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
