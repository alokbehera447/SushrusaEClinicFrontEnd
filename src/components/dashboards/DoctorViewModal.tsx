import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Stethoscope,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Award,
  FileText,
  Edit,
  User,
  Building2,
  Globe,
  Calendar,
  Info,
  AlignLeft,
  Image,
  Languages,
  DollarSign
} from 'lucide-react';
import { DoctorProfile } from '@/lib/api';

interface DoctorViewModalProps {
  doctor: DoctorProfile | null;
  onClose: () => void;
  onEdit: (doctor: DoctorProfile) => void;
}

const DoctorViewModal: React.FC<DoctorViewModalProps> = ({ doctor, onClose, onEdit }) => {
  if (!doctor) return null;

  return (
    <Dialog open={!!doctor} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden max-h-[80vh] flex flex-col">
        <div className="bg-gradient-to-r from-blue-100/10 to-[#E17726]/10 p-4 sm:p-6 pb-0 rounded-t-2xl flex flex-col md:flex-row md:items-center gap-4 shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-midnight mb-1 flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-[#E17726]" />
              Dr. {doctor.user_name}
            </h2>
            <div className="flex flex-wrap gap-2 items-center mb-2">
              <Badge className={doctor.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {doctor.is_verified ? 'Verified' : 'Pending Verification'}
              </Badge>
              <span className="text-gray-500 text-xs">ID: {doctor.id}</span>
              <span className={`text-xs font-semibold ${doctor.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {doctor.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-blue-600">{doctor.specialization}</span>
            </div>
            <div className="text-gray-600 text-sm mb-2 flex flex-wrap gap-2 items-center">
              <MapPin className="inline w-4 h-4 mr-1 text-[#E17726]" />
              {doctor.clinic_address || 'Address not specified'}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-[#E17726] text-white text-lg">
                {doctor.user_name?.charAt(0) || 'D'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="p-4 sm:p-6 pt-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-midnight mb-1 flex items-center gap-1">
                <User className="w-4 h-4 text-blue-600" /> Personal Info
              </h3>
              <div className="text-gray-700 text-sm space-y-1">
                <div><strong>Name:</strong> {doctor.user_name}</div>
                <div><strong>License #:</strong> {doctor.license_number}</div>
                <div><strong>Qualification:</strong> {doctor.qualification}</div>
                {doctor.sub_specialization && (
                  <div><strong>Sub-Specialization:</strong> {doctor.sub_specialization}</div>
                )}
              </div>
            </div>

                         <div>
               <h3 className="font-semibold text-midnight mb-1 flex items-center gap-1">
                 <Phone className="w-4 h-4 text-[#E17726]" /> Contact
               </h3>
               <ul className="ml-1 text-gray-700 text-sm space-y-1">
                 <li><Phone className="inline w-4 h-4 mr-1" /> {doctor.user_phone}</li>
                 {doctor.user_email && <li><Mail className="inline w-4 h-4 mr-1" /> {doctor.user_email}</li>}
                 {doctor.clinic_name && <li><Building2 className="inline w-4 h-4 mr-1" /> {doctor.clinic_name}</li>}
               </ul>
             </div>

            <div>
              <h3 className="font-semibold text-midnight mb-1 flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-600" /> Fees
              </h3>
              <div className="text-gray-700 text-sm space-y-1">
                <div><strong>Consultation Fee:</strong> ₹{doctor.consultation_fee}</div>
                <div><strong>Online Consultation Fee:</strong> ₹{doctor.online_consultation_fee}</div>
                <div><strong>Duration:</strong> {doctor.consultation_duration} minutes</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-midnight mb-1 flex items-center gap-1">
                <Award className="w-4 h-4 text-purple-600" /> Experience
              </h3>
              <div className="text-gray-700 text-sm">
                <div><strong>Years:</strong> {doctor.experience_years} years</div>
                <div><strong>Specialization:</strong> {doctor.specialization}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-midnight mb-1 flex items-center gap-1">
                <Languages className="w-4 h-4 text-indigo-600" /> Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {doctor.languages_spoken && doctor.languages_spoken.length > 0 ? (
                  doctor.languages_spoken.map((lang, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-indigo-50 border-indigo-200 text-indigo-800">
                      {lang}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-midnight mb-1 flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" /> Rating
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-gray-700 text-sm ml-1">
                    {doctor.rating ? `${doctor.rating}/5` : 'No ratings yet'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-midnight mb-1 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-blue-500" /> Availability
              </h3>
              <div className="text-gray-700 text-sm space-y-1">
                <div><strong>Online Consultation:</strong> {doctor.is_online_consultation_available ? 'Available' : 'Not Available'}</div>
                <div><strong>Status:</strong> {doctor.is_active ? 'Active' : 'Inactive'}</div>
                <div><strong>Verified:</strong> {doctor.is_verified ? 'Yes' : 'No'}</div>
              </div>
            </div>

            {doctor.bio && (
              <div>
                <h3 className="font-semibold text-midnight mb-1 flex items-center gap-1">
                  <AlignLeft className="w-4 h-4 text-gray-500" /> Bio
                </h3>
                <div className="text-gray-700 text-sm whitespace-pre-line">{doctor.bio}</div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-midnight mb-1 flex items-center gap-1">
                <Info className="w-4 h-4 text-gray-500" /> Additional Info
              </h3>
              <div className="text-gray-700 text-sm space-y-1">
                <div><strong>Created:</strong> {new Date(doctor.created_at).toLocaleDateString()}</div>
                <div><strong>Last Updated:</strong> {new Date(doctor.updated_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap justify-end bg-white px-4 sm:px-6 pb-4 pt-2 border-t gap-2 shrink-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => onEdit(doctor)}
            className="bg-[#E17726] hover:bg-[#c9651e] text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Doctor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorViewModal; 