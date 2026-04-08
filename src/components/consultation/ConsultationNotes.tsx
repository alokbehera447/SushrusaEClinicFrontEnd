import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Save, 
  Clock, 
  Edit, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Trash2,
  Download,
  Share,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ConsultationNote {
  id: string;
  content: string;
  timestamp: Date;
  isPrivate: boolean;
  category: string;
}

interface ConsultationNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  consultationId: string;
}

const ConsultationNotes: React.FC<ConsultationNotesProps> = ({ 
  notes, 
  onNotesChange, 
  consultationId 
}) => {
  const [isPrivate, setIsPrivate] = useState(false);
  const [category, setCategory] = useState('general');
  const [savedNotes, setSavedNotes] = useState<ConsultationNote[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  const { toast } = useToast();

  // Auto-save notes every 30 seconds
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (notes.trim()) {
        saveNote();
      }
    }, 30000);

    return () => clearTimeout(autoSave);
  }, [notes]);

  const saveNote = async () => {
    if (!notes.trim()) return;
    
    setIsSaving(true);
    try {
      // Simulate API call to save note
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newNote: ConsultationNote = {
        id: Date.now().toString(),
        content: notes,
        timestamp: new Date(),
        isPrivate,
        category
      };
      
      setSavedNotes(prev => [newNote, ...prev]);
      setLastSaved(new Date());
      
      toast({
        title: "Note Saved",
        description: "Consultation note has been saved successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const clearNotes = () => {
    onNotesChange('');
    setIsPrivate(false);
    setCategory('general');
  };

  const exportNotes = () => {
    const notesText = savedNotes
      .map(note => `[${note.timestamp.toLocaleString()}] ${note.content}`)
      .join('\n\n');
    
    const blob = new Blob([notesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultation-notes-${consultationId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'symptoms':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'diagnosis':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'treatment':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'followup':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Note Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">Consultation Notes</span>
            {lastSaved && (
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Saved {lastSaved.toLocaleTimeString()}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPrivate(!isPrivate)}
              className={isPrivate ? 'text-red-600' : 'text-gray-600'}
            >
              {isPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <Clock className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Category Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Category:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="general">General</option>
            <option value="symptoms">Symptoms</option>
            <option value="diagnosis">Diagnosis</option>
            <option value="treatment">Treatment</option>
            <option value="followup">Follow-up</option>
          </select>
          <Badge className={`text-xs ${getCategoryColor(category)}`}>
            {category}
          </Badge>
        </div>

        {/* Note Textarea */}
        <Textarea
          placeholder="Enter consultation notes here... (Auto-saves every 30 seconds)"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="min-h-[200px] resize-none"
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={saveNote}
              disabled={isSaving || !notes.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Note
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={clearNotes}
              disabled={!notes.trim()}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={exportNotes}
              disabled={savedNotes.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button
              size="sm"
              variant="outline"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Privacy Indicator */}
        {isPrivate && (
          <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800">Private note - only visible to you</span>
          </div>
        )}
      </div>

      {/* Note History */}
      {showHistory && savedNotes.length > 0 && (
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm">Note History</h4>
              <Badge variant="outline" className="text-xs">
                {savedNotes.length} saved
              </Badge>
            </div>
            
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {savedNotes.map((note) => (
                <div key={note.id} className="p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${getCategoryColor(note.category)}`}>
                        {note.category}
                      </Badge>
                      {note.isPrivate && (
                        <Badge variant="destructive" className="text-xs">
                          Private
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {note.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{note.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Templates */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-semibold mb-2">Quick Templates</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNotesChange(notes + '\n\nChief Complaint:\nSymptoms:\nDuration:\nSeverity:')}
            className="text-xs h-8"
          >
            <Plus className="w-3 h-3 mr-1" />
            Symptoms Template
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNotesChange(notes + '\n\nDiagnosis:\nDifferential Diagnosis:\nClinical Findings:')}
            className="text-xs h-8"
          >
            <Plus className="w-3 h-3 mr-1" />
            Diagnosis Template
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNotesChange(notes + '\n\nTreatment Plan:\nMedications:\nInstructions:\nFollow-up:')}
            className="text-xs h-8"
          >
            <Plus className="w-3 h-3 mr-1" />
            Treatment Template
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNotesChange(notes + '\n\nFollow-up Plan:\nNext Visit:\nTests Required:\nInstructions:')}
            className="text-xs h-8"
          >
            <Plus className="w-3 h-3 mr-1" />
            Follow-up Template
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationNotes;
