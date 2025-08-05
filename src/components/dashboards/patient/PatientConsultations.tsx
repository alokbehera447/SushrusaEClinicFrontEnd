import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock, 
  Search,
  Filter,
  Video,
  Stethoscope,
  Phone,
  Users,
  CalendarDays,
  Loader2
} from 'lucide-react';
import { Consultation, formatDate, formatDateTime } from '@/lib/api';

interface PatientConsultationsProps {
  consultations: Consultation[];
  loading: boolean;
  searchTerm: string;
  filter: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onBookConsultation: () => void;
  onJoinConsultation: (consultationId: string) => void;
}

const PatientConsultations: React.FC<PatientConsultationsProps> = ({
  consultations,
  loading,
  searchTerm,
  filter,
  onSearchChange,
  onFilterChange,
  onBookConsultation,
  onJoinConsultation
}) => {
  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = consultation.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.chief_complaint?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || consultation.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Phone className="w-4 h-4" />;
      case 'in_person': return <Users className="w-4 h-4" />;
      default: return <Stethoscope className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Consultations</h2>
          <p className="text-gray-600">Manage your appointments and consultation history</p>
        </div>
        <Button 
          onClick={onBookConsultation}
          className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:from-[#c9651e] hover:to-[#e67e22] text-white"
        >
          <CalendarDays className="w-4 h-4 mr-2" />
          Book New Consultation
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by doctor name or concern..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Consultations</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Consultations List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-3">Loading consultations...</span>
        </div>
      ) : filteredConsultations.length > 0 ? (
        <div className="space-y-4">
          {filteredConsultations.map((consultation) => (
            <Card key={consultation.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {getConsultationIcon(consultation.consultation_type)}
                        <h3 className="font-semibold text-lg">{consultation.doctor_name}</h3>
                      </div>
                      <Badge className={getStatusColor(consultation.status)}>
                        {consultation.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(consultation.scheduled_date)} at {consultation.scheduled_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{consultation.duration} minutes</span>
                      </div>
                      {consultation.chief_complaint && (
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4" />
                          <span>{consultation.chief_complaint}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <span className="text-green-600 font-medium">
                        Fee: ₹{consultation.consultation_fee}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        consultation.payment_status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {consultation.payment_status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row gap-2">
                    {consultation.status === 'scheduled' && (
                      <Button 
                        onClick={() => onJoinConsultation(consultation.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Now
                      </Button>
                    )}
                    <Button variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Consultations Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'No consultations match your search criteria.' 
                : 'You haven\'t booked any consultations yet.'}
            </p>
            <Button 
              onClick={onBookConsultation}
              className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:from-[#c9651e] hover:to-[#e67e22] text-white"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Book Your First Consultation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientConsultations;