import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText,
  FileImage,
  BookOpen,
  Plus,
  Upload,
  Eye,
  Edit,
  XCircle,
  Download,
  Loader2
} from 'lucide-react';
import { formatDate } from '@/lib/api';

interface PatientRecordsProps {
  medicalRecords: any[];
  documents: any[];
  notes: any[];
  loading: {
    medicalRecords: boolean;
    documents: boolean;
    notes: boolean;
  };
  onCreateMedicalRecord: () => void;
  onUploadDocument: () => void;
  onCreateNote: () => void;
  onDeleteMedicalRecord: (id: string) => void;
  onDeleteDocument: (id: string) => void;
  onDeleteNote: (id: string) => void;
}

const PatientRecords: React.FC<PatientRecordsProps> = ({
  medicalRecords,
  documents,
  notes,
  loading,
  onCreateMedicalRecord,
  onUploadDocument,
  onCreateNote,
  onDeleteMedicalRecord,
  onDeleteDocument,
  onDeleteNote
}) => {
  return (
    <div className="space-y-6">
      {/* Medical Records Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Medical Records ({medicalRecords.length})
            </CardTitle>
            <Button 
              onClick={onCreateMedicalRecord}
              className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:from-[#c9651e] hover:to-[#e67e22] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading.medicalRecords ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading medical records...</span>
            </div>
          ) : medicalRecords.length > 0 ? (
            <div className="space-y-4">
              {medicalRecords.map((record: any) => (
                <Card key={record.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{record.title || 'Medical Record'}</h4>
                        <p className="text-sm text-gray-600">{record.description || 'No description'}</p>
                        <p className="text-xs text-gray-500">
                          {record.created_at ? formatDate(record.created_at) : 'Date unknown'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onDeleteMedicalRecord(record.id)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No medical records available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileImage className="w-5 h-5" />
              Documents ({documents.length})
            </CardTitle>
            <Button 
              onClick={onUploadDocument}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading.documents ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading documents...</span>
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((document: any) => (
                <Card key={document.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <FileImage className="w-8 h-8 text-blue-500" />
                      <Badge variant="secondary">{document.document_type || 'General'}</Badge>
                    </div>
                    <h4 className="font-semibold truncate">{document.name || 'Document'}</h4>
                    <p className="text-xs text-gray-500">
                      {document.created_at ? formatDate(document.created_at) : 'Date unknown'}
                    </p>
                    <div className="flex items-center space-x-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onDeleteDocument(document.id)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No documents uploaded</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Personal Notes ({notes.length})
            </CardTitle>
            <Button 
              onClick={onCreateNote}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading.notes ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading notes...</span>
            </div>
          ) : notes.length > 0 ? (
            <div className="space-y-4">
              {notes.map((note: any) => (
                <Card key={note.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{note.title || 'Note'}</h4>
                        <p className="text-sm text-gray-600 mt-1">{note.content || 'No content'}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {note.created_at ? formatDate(note.created_at) : 'Date unknown'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onDeleteNote(note.id)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No personal notes available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientRecords;