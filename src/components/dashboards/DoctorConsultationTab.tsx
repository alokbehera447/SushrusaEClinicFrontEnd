import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Video, 
  FileText, 
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
  User,
  MoreVertical,
  PlusCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { doctorApi, Consultation as ApiConsultation, PatientNote } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from '@/components/ui/textarea';

// Extend the API's Consultation type to include potentially missing fields
interface Consultation extends ApiConsultation {
    doctor_meeting_link?: string;
    prescription?: {
        id: string;
        medicines: string[];
        instructions: string;
        writtenDate: string;
    }
}

const ConsultationCard = ({ consultation, onUpdate }: { consultation: Consultation, onUpdate: () => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [notes, setNotes] = useState<PatientNote[]>([]);
    const [newNote, setNewNote] = useState('');
    const navigate = useNavigate();

    const handleAction = async (action: 'start' | 'complete' | 'cancel') => {
        try {
            switch (action) {
                case 'start':
                    await doctorApi.startConsultation(consultation.id);
                    break;
                case 'complete':
                    await doctorApi.completeConsultation(consultation.id);
                    break;
                case 'cancel':
                    await doctorApi.cancelConsultation(consultation.id);
                    break;
            }
            onUpdate();
        } catch (error) {
            console.error(`Failed to ${action} consultation`, error);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        try {
            await doctorApi.addConsultationNote(consultation.id, { content: newNote });
            setNewNote('');
            fetchNotes();
        } catch (error) {
            console.error('Failed to add note', error);
        }
    };

    const fetchNotes = async () => {
        try {
            const fetchedNotes = await doctorApi.getConsultationNotes(consultation.id);
            setNotes(fetchedNotes);
        } catch (error) {
            console.error('Failed to fetch notes', error);
        }
    };

    useEffect(() => {
        if (isExpanded) {
            fetchNotes();
        }
    }, [isExpanded]);

    const getStatusAppearance = (status: string) => {
        switch (status) {
          case 'scheduled':
            return { icon: Calendar, color: 'text-blue-600 bg-blue-100', label: 'Scheduled' };
          case 'completed':
            return { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Completed' };
          case 'cancelled':
            return { icon: XCircle, color: 'text-red-600 bg-red-100', label: 'Cancelled' };
          case 'in-progress':
            return { icon: Clock, color: 'text-yellow-600 bg-yellow-100', label: 'In Progress' };
          default:
            return { icon: Calendar, color: 'text-gray-600 bg-gray-100', label: 'Unknown' };
        }
    };

    const { icon: Icon, color, label } = getStatusAppearance(consultation.status);

    return (
        <Card className="transition-all duration-300">
            <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback>{consultation.patient_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-lg">{consultation.patient_name}</p>
                            <p className="text-sm text-muted-foreground">{consultation.chief_complaint}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                         <Badge variant="secondary" className="hidden sm:block">{consultation.consultation_type}</Badge>
                         <Badge className={`${color} hidden sm:block`}>{label}</Badge>
                         <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
                            <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                         </Button>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {consultation.status === 'scheduled' && <DropdownMenuItem onClick={() => handleAction('start')}>Start Consultation</DropdownMenuItem>}
                                {consultation.status === 'in-progress' && <DropdownMenuItem onClick={() => handleAction('complete')}>Complete Consultation</DropdownMenuItem>}
                                {consultation.status !== 'completed' && consultation.status !== 'cancelled' && <DropdownMenuItem onClick={() => handleAction('cancel')}>Cancel Consultation</DropdownMenuItem>}
                                <DropdownMenuItem onClick={() => navigate(`/patient/${consultation.patient}/history`)}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>View Patient History</span>
                                </DropdownMenuItem>
                                {consultation.status === 'scheduled' && (
                                    <DropdownMenuItem onClick={() => navigate(`/consultation/${consultation.id}/meeting`)}>
                                        <Video className="mr-2 h-4 w-4" />
                                        <span>Join Meeting</span>
                                    </DropdownMenuItem>
                                )}
                                {consultation.status === 'completed' && (
                                     <DropdownMenuItem onClick={() => navigate(`/prescriptions/new/${consultation.id}`)}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        <span>View Prescription</span>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            {isExpanded && (
                <CardContent className="p-4 border-t">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p><strong>Date:</strong> {new Date(consultation.scheduled_date).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> {consultation.scheduled_time}</p>
                            <p><strong>Duration:</strong> {consultation.duration} minutes</p>
                             <p><strong>Consultation ID:</strong> {consultation.id}</p>
                        </div>
                        <div>
                            <p><strong>Symptoms:</strong> {consultation.symptoms || 'N/A'}</p>
                            <p><strong>Payment Status:</strong> <Badge variant={consultation.is_paid ? 'default' : 'destructive'}>{consultation.payment_status}</Badge></p>
                            <p><strong>Fee:</strong> ₹{consultation.consultation_fee}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Consultation Notes</h4>
                        <div className="space-y-2 mb-4">
                            {notes.map(note => (
                                <div key={note.id} className="text-sm p-2 bg-gray-50 rounded-md">
                                    <p>{note.note}</p>
                                    <p className="text-xs text-muted-foreground">By {note.created_by} on {new Date(note.created_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Textarea placeholder="Add a new note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                            <Button onClick={handleAddNote}><PlusCircle className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

const DoctorConsultationTab = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('scheduled'); // Default to upcoming
  const [searchTerm, setSearchTerm] = useState('');

  const fetchConsultations = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { status?: string; search?: string, ordering?: string } = { ordering: '-scheduled_date' };
      if (filter !== 'all') {
        params.status = filter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      // Assuming getAllConsultations fetches for the logged-in doctor
      const data = await doctorApi.getAllConsultations(params);
      setConsultations(data);
    } catch (err) {
      setError('Failed to fetch consultations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, [filter]);

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      fetchConsultations();
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>My Consultations</CardTitle>
                 <p className="text-sm text-muted-foreground">
                    Manage and view your patient consultations.
                </p>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <div className="flex space-x-1 p-1 bg-muted rounded-md">
                        <Button onClick={() => setFilter('all')} variant={filter === 'all' ? 'default' : 'ghost'} size="sm">All</Button>
                        <Button onClick={() => setFilter('scheduled')} variant={filter === 'scheduled' ? 'default' : 'ghost'} size="sm">Upcoming</Button>
                        <Button onClick={() => setFilter('completed')} variant={filter === 'completed' ? 'default' : 'ghost'} size="sm">Completed</Button>
                        <Button onClick={() => setFilter('cancelled')} variant={filter === 'cancelled' ? 'default' : 'ghost'} size="sm">Cancelled</Button>
                        <Button onClick={() => setFilter('in-progress')} variant={filter === 'in-progress' ? 'default' : 'ghost'} size="sm">In Progress</Button>
                    </div>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            placeholder="Search by patient name or ID..."
                            className="max-w-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button type="submit" variant="outline" size="icon">
                             <Search className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
          
                {loading && (
                    <div className="flex justify-center items-center p-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                    </div>
                )}
                {error && <div className="text-center p-8 text-red-500 bg-red-50 rounded-md">{error}</div>}

                {!loading && !error && (
                    <div className="space-y-4">
                    {consultations.length > 0 ? (
                        consultations.map((consultation) => (
                            <ConsultationCard key={consultation.id} consultation={consultation} onUpdate={fetchConsultations} />
                        ))
                    ) : (
                        <div className="col-span-full text-center p-8 bg-gray-50 rounded-md">
                        <p className="font-medium">No consultations found.</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your filters or search term.</p>
                        </div>
                    )}
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
};

export default DoctorConsultationTab;
