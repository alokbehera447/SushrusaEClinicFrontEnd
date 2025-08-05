import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  FileText,
  Upload,
  Plus,
  Edit,
  Trash2,
  Download,
  Eye,
  Calendar,
  User,
  File,
  StickyNote,
  Loader2,
  Search,
  MoreVertical,
  FileImage,
  Save,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { patientApi, MedicalRecord, PatientDocument, PatientNote, formatDate } from '@/lib/api';

interface PatientRecordsManagerProps {
  patientId: string;
}

// Form interfaces
interface MedicalRecordForm {
  record_type: string;
  title: string;
  description: string;
  date_recorded: string;
  document?: File;
}

interface DocumentForm {
  document_type: string;
  title: string;
  description: string;
  file: File | null;
}

interface NoteForm {
  note: string;
  is_private: boolean;
}

const PatientRecordsManager: React.FC<PatientRecordsManagerProps> = ({ patientId }) => {
  const { toast } = useToast();
  
  // Data states
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [notes, setNotes] = useState<PatientNote[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    medicalRecords: false,
    documents: false,
    notes: false,
    submitting: false
  });
  
  // UI states
  const [activeTab, setActiveTab] = useState('medical-records');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Modal states
  const [medicalRecordModalOpen, setMedicalRecordModalOpen] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  // Selected item states
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedItemType, setSelectedItemType] = useState<'medical-record' | 'document' | 'note'>('medical-record');
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form states
  const [medicalRecordForm, setMedicalRecordForm] = useState<MedicalRecordForm>({
    record_type: '',
    title: '',
    description: '',
    date_recorded: new Date().toISOString().split('T')[0],
    document: undefined
  });
  
  const [documentForm, setDocumentForm] = useState<DocumentForm>({
    document_type: '',
    title: '',
    description: '',
    file: null
  });
  
  const [noteForm, setNoteForm] = useState<NoteForm>({
    note: '',
    is_private: false
  });

  // File input refs
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const documentFileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch functions
  const fetchMedicalRecords = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, medicalRecords: true }));
      const records = await patientApi.getPatientMedicalRecords(patientId);
      setMedicalRecords(records);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch medical records',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, medicalRecords: false }));
    }
  }, [patientId, toast]);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, documents: true }));
      const docs = await patientApi.getPatientDocuments(patientId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch documents',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, documents: false }));
    }
  }, [patientId, toast]);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, notes: true }));
      const patientNotes = await patientApi.getPatientNotes(patientId);
      setNotes(patientNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch notes',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, notes: false }));
    }
  }, [patientId, toast]);

  // Initial data fetch
  useEffect(() => {
    if (patientId) {
      fetchMedicalRecords();
      fetchDocuments();
      fetchNotes();
    }
  }, [patientId, fetchMedicalRecords, fetchDocuments, fetchNotes]);

  // Reset forms
  const resetForms = () => {
    setMedicalRecordForm({
      record_type: '',
      title: '',
      description: '',
      date_recorded: new Date().toISOString().split('T')[0],
      document: undefined
    });
    setDocumentForm({
      document_type: '',
      title: '',
      description: '',
      file: null
    });
    setNoteForm({
      note: '',
      is_private: false
    });
    setEditingItem(null);
  };

  // CRUD Operations
  const handleCreateMedicalRecord = async () => {
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      
      const formData = new FormData();
      formData.append('record_type', medicalRecordForm.record_type);
      formData.append('title', medicalRecordForm.title);
      formData.append('description', medicalRecordForm.description);
      formData.append('date_recorded', medicalRecordForm.date_recorded);
      
      if (medicalRecordForm.document) {
        formData.append('document', medicalRecordForm.document);
      }
      
      await patientApi.createMedicalRecord(patientId, formData as any);
      
      toast({
        title: 'Success',
        description: 'Medical record created successfully!',
        variant: 'default'
      });
      
      setMedicalRecordModalOpen(false);
      resetForms();
      fetchMedicalRecords();
    } catch (error) {
      console.error('Error creating medical record:', error);
      toast({
        title: 'Error',
        description: 'Failed to create medical record. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleUploadDocument = async () => {
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      
      if (!documentForm.file) {
        toast({
          title: 'Error',
          description: 'Please select a file to upload',
          variant: 'destructive'
        });
        return;
      }
      
      const formData = new FormData();
      formData.append('document_type', documentForm.document_type);
      formData.append('title', documentForm.title);
      formData.append('description', documentForm.description);
      formData.append('file', documentForm.file);
      
      await patientApi.uploadDocument(patientId, formData);
      
      toast({
        title: 'Success',
        description: 'Document uploaded successfully!',
        variant: 'default'
      });
      
      setDocumentModalOpen(false);
      resetForms();
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleCreateNote = async () => {
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      
      await patientApi.createNote(patientId, noteForm);
      
      toast({
        title: 'Success',
        description: 'Note created successfully!',
        variant: 'default'
      });
      
      setNoteModalOpen(false);
      resetForms();
      fetchNotes();
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: 'Error',
        description: 'Failed to create note. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleEditItem = async () => {
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      
      switch (selectedItemType) {
        case 'medical-record':
          await patientApi.updateMedicalRecord(patientId, editingItem.id.toString(), editingItem);
          fetchMedicalRecords();
          break;
        case 'document':
          await patientApi.updateDocument(patientId, editingItem.id.toString(), editingItem);
          fetchDocuments();
          break;
        case 'note':
          await patientApi.updateNote(patientId, editingItem.id.toString(), editingItem);
          fetchNotes();
          break;
      }
      
      toast({
        title: 'Success',
        description: `${selectedItemType.replace('-', ' ')} updated successfully!`,
        variant: 'default'
      });
      
      setEditModalOpen(false);
      resetForms();
    } catch (error) {
      console.error(`Error updating ${selectedItemType}:`, error);
      toast({
        title: 'Error',
        description: `Failed to update ${selectedItemType.replace('-', ' ')}. Please try again.`,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleDeleteItem = async (id: string, type: 'medical-record' | 'document' | 'note') => {
    try {
      switch (type) {
        case 'medical-record':
          await patientApi.deleteMedicalRecord(patientId, id);
          fetchMedicalRecords();
          break;
        case 'document':
          await patientApi.deleteDocument(patientId, id);
          fetchDocuments();
          break;
        case 'note':
          await patientApi.deleteNote(patientId, id);
          fetchNotes();
          break;
      }
      
      toast({
        title: 'Success',
        description: `${type.replace('-', ' ')} deleted successfully!`,
        variant: 'default'
      });
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast({
        title: 'Error',
        description: `Failed to delete ${type.replace('-', ' ')}. Please try again.`,
        variant: 'destructive'
      });
    }
  };

  // File handling
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'medical-record' | 'document') => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'File size must be less than 10MB',
          variant: 'destructive'
        });
        return;
      }
      
      if (type === 'medical-record') {
        setMedicalRecordForm(prev => ({ ...prev, document: file }));
      } else {
        setDocumentForm(prev => ({ ...prev, file }));
      }
    }
  };

  // Utility functions
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileImage className="w-4 h-4 text-green-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFilteredItems = () => {
    let items: any[] = [];
    
    switch (activeTab) {
      case 'medical-records':
        items = medicalRecords;
        break;
      case 'documents':
        items = documents;
        break;
      case 'notes':
        items = notes;
        break;
    }
    
    if (searchTerm) {
      items = items.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.record_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.document_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.note?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      items = items.filter(item => 
        item.record_type === filterType || item.document_type === filterType
      );
    }
    
    return items;
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Medical Records & Documents</h2>
          <p className="text-gray-600">Manage your medical records, documents, and personal notes</p>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="lab_report">Lab Report</SelectItem>
              <SelectItem value="prescription">Prescription</SelectItem>
              <SelectItem value="xray">X-Ray</SelectItem>
              <SelectItem value="mri">MRI</SelectItem>
              <SelectItem value="blood_test">Blood Test</SelectItem>
              <SelectItem value="vaccination">Vaccination</SelectItem>
              <SelectItem value="medical_certificate">Medical Certificate</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="medical-records" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Medical Records ({medicalRecords.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <File className="w-4 h-4" />
            Documents ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <StickyNote className="w-4 h-4" />
            Notes ({notes.length})
          </TabsTrigger>
        </TabsList>

        {/* Medical Records Tab */}
        <TabsContent value="medical-records" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Medical Records</h3>
            <Button onClick={() => setMedicalRecordModalOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Record
            </Button>
          </div>

          {loading.medicalRecords ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-3">Loading medical records...</span>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((record) => (
                <Card key={record.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <CardTitle className="text-lg">{record.title}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setSelectedItem(record);
                            setSelectedItemType('medical-record');
                            setViewModalOpen(true);
                          }}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setEditingItem({ ...record });
                            setSelectedItemType('medical-record');
                            setEditModalOpen(true);
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {record.document && (
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Medical Record</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this medical record? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteItem(record.id.toString(), 'medical-record')}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{record.record_type}</Badge>
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(record.date_recorded)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2">{record.description}</p>
                    {record.document && (
                      <div className="flex items-center gap-2 mt-3">
                        <File className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">Document attached</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Medical Records Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'No records match your search criteria.' : 'You don\'t have any medical records yet.'}
                </p>
                <Button onClick={() => setMedicalRecordModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Record
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Documents</h3>
            <Button onClick={() => setDocumentModalOpen(true)} className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Document
            </Button>
          </div>

          {loading.documents ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-3">Loading documents...</span>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((document) => (
                <Card key={document.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getFileIcon(document.file)}
                        <CardTitle className="text-lg">{document.title}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setSelectedItem(document);
                            setSelectedItemType('document');
                            setViewModalOpen(true);
                          }}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setEditingItem({ ...document });
                            setSelectedItemType('document');
                            setEditModalOpen(true);
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this document? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteItem(document.id.toString(), 'document')}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{document.document_type}</Badge>
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(document.uploaded_at)}
                      </Badge>
                      {document.is_verified && (
                        <Badge variant="default">Verified</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2">{document.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      {getFileIcon(document.file)}
                      <span className="text-xs text-gray-500">{document.file.split('/').pop()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Uploaded</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'No documents match your search criteria.' : 'You haven\'t uploaded any documents yet.'}
                </p>
                <Button onClick={() => setDocumentModalOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First Document
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Personal Notes</h3>
            <Button onClick={() => setNoteModalOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Note
            </Button>
          </div>

          {loading.notes ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-3">Loading notes...</span>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((note) => (
                <Card key={note.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StickyNote className="w-5 h-5 text-yellow-500" />
                        <CardTitle className="text-lg">Note #{note.id}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setSelectedItem(note);
                            setSelectedItemType('note');
                            setViewModalOpen(true);
                          }}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setEditingItem({ ...note });
                            setSelectedItemType('note');
                            setEditModalOpen(true);
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Note</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this note? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteItem(note.id.toString(), 'note')}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2">
                      {note.is_private && (
                        <Badge variant="secondary">
                          <User className="w-3 h-3 mr-1" />
                          Private
                        </Badge>
                      )}
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(note.created_at)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3">{note.note}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <StickyNote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Personal Notes Available</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'No notes match your search criteria.' : 'You haven\'t created any personal notes yet.'}
                </p>
                <Button onClick={() => setNoteModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Note
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Medical Record Modal */}
      <Dialog open={medicalRecordModalOpen} onOpenChange={setMedicalRecordModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Medical Record</DialogTitle>
            <DialogDescription>
              Create a new medical record with details and optional document attachment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Record Type *</label>
                <Select value={medicalRecordForm.record_type} onValueChange={(value) => setMedicalRecordForm(prev => ({ ...prev, record_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select record type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab_report">Lab Report</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="xray">X-Ray</SelectItem>
                    <SelectItem value="mri">MRI</SelectItem>
                    <SelectItem value="blood_test">Blood Test</SelectItem>
                    <SelectItem value="vaccination">Vaccination</SelectItem>
                    <SelectItem value="medical_certificate">Medical Certificate</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Recorded *</label>
                <Input
                  type="date"
                  value={medicalRecordForm.date_recorded}
                  onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, date_recorded: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={medicalRecordForm.title}
                onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter record title"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                value={medicalRecordForm.description}
                onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter record description"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Document (Optional)</label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Choose File
                </Button>
                {medicalRecordForm.document && (
                  <span className="text-sm text-gray-600">{medicalRecordForm.document.name}</span>
                )}
              </div>
              <p className="text-xs text-gray-500">Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max: 10MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleFileSelect(e, 'medical-record')}
                className="hidden"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setMedicalRecordModalOpen(false);
              resetForms();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateMedicalRecord} 
              disabled={loading.submitting || !medicalRecordForm.title || !medicalRecordForm.record_type || !medicalRecordForm.description}
            >
              {loading.submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Record
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Document Modal */}
      <Dialog open={documentModalOpen} onOpenChange={setDocumentModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document with details and categorization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Document Type *</label>
                <Select value={documentForm.document_type} onValueChange={(value) => setDocumentForm(prev => ({ ...prev, document_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="lab_report">Lab Report</SelectItem>
                    <SelectItem value="medical_certificate">Medical Certificate</SelectItem>
                    <SelectItem value="insurance">Insurance Document</SelectItem>
                    <SelectItem value="vaccination">Vaccination Record</SelectItem>
                    <SelectItem value="xray">X-Ray</SelectItem>
                    <SelectItem value="mri">MRI</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">File *</label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => documentFileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </Button>
                  {documentForm.file && (
                    <span className="text-sm text-gray-600">{documentForm.file.name}</span>
                  )}
                </div>
                <input
                  ref={documentFileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileSelect(e, 'document')}
                  className="hidden"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={documentForm.title}
                onChange={(e) => setDocumentForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                value={documentForm.description}
                onChange={(e) => setDocumentForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter document description"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDocumentModalOpen(false);
              resetForms();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUploadDocument} 
              disabled={loading.submitting || !documentForm.title || !documentForm.document_type || !documentForm.file || !documentForm.description}
            >
              {loading.submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Note Modal */}
      <Dialog open={noteModalOpen} onOpenChange={setNoteModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Personal Note</DialogTitle>
            <DialogDescription>
              Create a new personal note for your health records.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Note *</label>
              <Textarea
                value={noteForm.note}
                onChange={(e) => setNoteForm(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Enter your note here..."
                rows={6}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="private"
                checked={noteForm.is_private}
                onChange={(e) => setNoteForm(prev => ({ ...prev, is_private: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="private" className="text-sm font-medium">
                Make this note private (only visible to you)
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setNoteModalOpen(false);
              resetForms();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateNote} 
              disabled={loading.submitting || !noteForm.note.trim()}
            >
              {loading.submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Note
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Item Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItemType === 'medical-record' && 'Medical Record Details'}
              {selectedItemType === 'document' && 'Document Details'}
              {selectedItemType === 'note' && 'Note Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              {selectedItemType === 'medical-record' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Title</label>
                      <p className="text-sm">{selectedItem.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Type</label>
                      <p className="text-sm">{selectedItem.record_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date Recorded</label>
                      <p className="text-sm">{formatDate(selectedItem.date_recorded)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <Badge variant={selectedItem.is_active ? "default" : "secondary"}>
                        {selectedItem.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-sm">{selectedItem.description}</p>
                  </div>
                  {selectedItem.document && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Attached Document</label>
                      <div className="flex items-center gap-2 mt-1">
                        <File className="w-4 h-4" />
                        <span className="text-sm">{selectedItem.document.split('/').pop()}</span>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {selectedItemType === 'document' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Title</label>
                      <p className="text-sm">{selectedItem.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Type</label>
                      <p className="text-sm">{selectedItem.document_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Uploaded</label>
                      <p className="text-sm">{formatDate(selectedItem.uploaded_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <Badge variant={selectedItem.is_verified ? "default" : "secondary"}>
                        {selectedItem.is_verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-sm">{selectedItem.description}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">File</label>
                    <div className="flex items-center gap-2 mt-1">
                      {getFileIcon(selectedItem.file)}
                      <span className="text-sm">{selectedItem.file.split('/').pop()}</span>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </>
              )}
              
              {selectedItemType === 'note' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Created</label>
                      <p className="text-sm">{formatDate(selectedItem.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Privacy</label>
                      <Badge variant={selectedItem.is_private ? "secondary" : "default"}>
                        {selectedItem.is_private ? "Private" : "Public"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Note</label>
                    <p className="text-sm whitespace-pre-wrap">{selectedItem.note}</p>
                  </div>
                </>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit {selectedItemType === 'medical-record' ? 'Medical Record' : selectedItemType === 'document' ? 'Document' : 'Note'}
            </DialogTitle>
          </DialogHeader>
          
          {editingItem && (
            <div className="space-y-4">
              {selectedItemType === 'medical-record' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Record Type</label>
                      <Select 
                        value={editingItem.record_type} 
                        onValueChange={(value) => setEditingItem(prev => ({ ...prev, record_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lab_report">Lab Report</SelectItem>
                          <SelectItem value="prescription">Prescription</SelectItem>
                          <SelectItem value="xray">X-Ray</SelectItem>
                          <SelectItem value="mri">MRI</SelectItem>
                          <SelectItem value="blood_test">Blood Test</SelectItem>
                          <SelectItem value="vaccination">Vaccination</SelectItem>
                          <SelectItem value="medical_certificate">Medical Certificate</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date Recorded</label>
                      <Input
                        type="date"
                        value={editingItem.date_recorded}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, date_recorded: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={editingItem.title}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={editingItem.description}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </>
              )}

              {selectedItemType === 'document' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Document Type</label>
                    <Select 
                      value={editingItem.document_type} 
                      onValueChange={(value) => setEditingItem(prev => ({ ...prev, document_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prescription">Prescription</SelectItem>
                        <SelectItem value="lab_report">Lab Report</SelectItem>
                        <SelectItem value="medical_certificate">Medical Certificate</SelectItem>
                        <SelectItem value="insurance">Insurance Document</SelectItem>
                        <SelectItem value="vaccination">Vaccination Record</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={editingItem.title}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={editingItem.description}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </>
              )}

              {selectedItemType === 'note' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Note</label>
                    <Textarea
                      value={editingItem.note}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, note: e.target.value }))}
                      rows={6}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-private"
                      checked={editingItem.is_private}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, is_private: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="edit-private" className="text-sm font-medium">
                      Make this note private
                    </label>
                  </div>
                </>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditModalOpen(false);
              resetForms();
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditItem} disabled={loading.submitting}>
              {loading.submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientRecordsManager;