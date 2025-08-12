import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, MapPin, Phone, Mail, Calendar, Video, User, Award, Languages } from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  sub_specialization?: string;
  experience_years: number | string;
  consultation_fee: number | string;
  online_consultation_fee?: number | string;
  languages_spoken?: string | string[];
  bio?: string;
  rating: number | string;
  total_reviews: number | string;
  clinic_name?: string;
  clinic_address?: string;
  consultation_types: string[];
  is_online_consultation_available: boolean;
  consultation_duration: number;
  profile_picture?: string;
}

interface DoctorDetailsModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: (doctor: Doctor) => void;
}

// Utility function to safely convert string to number
const safeNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

const DoctorDetailsModal: React.FC<DoctorDetailsModalProps> = ({
  doctor,
  isOpen,
  onClose,
  onBookNow
}) => {
  if (!doctor) return null;

  const formatLanguages = (languages: string | string[] | undefined): string => {
    if (!languages) return 'Not specified';
    if (Array.isArray(languages)) {
      return languages.length > 0 ? languages.join(', ') : 'Not specified';
    }
    return languages || 'Not specified';
  };

  const formatConsultationTypes = (types: string[]): string => {
    return types.map(type => 
      type === 'in-person' ? 'In-Person' : 
      type === 'video' ? 'Video Consultation' : 
      type
    ).join(', ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-midnight">
            Doctor Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start space-x-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                {doctor.profile_picture ? (
                  <img 
                    src={doctor.profile_picture} 
                    alt={doctor.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#E17726] to-[#FF8A56] flex items-center justify-center text-white font-bold text-2xl">
                    {doctor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
              {doctor.is_online_consultation_available && (
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-midnight mb-2">{doctor.name}</h2>
              <div className="text-xl text-[#E17726] font-semibold mb-2">
                {doctor.specialization}
                {doctor.sub_specialization && (
                  <span className="text-gray-600 ml-2">• {doctor.sub_specialization}</span>
                )}
              </div>
              
              {/* Stats Row */}
              <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
                  <span className="font-semibold text-lg">{safeNumber(doctor.rating).toFixed(1)}</span>
                  <span className="text-gray-600 ml-1">({safeNumber(doctor.total_reviews)} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-[#E17726] mr-2" />
                  <span className="font-semibold">{safeNumber(doctor.experience_years)} Years Experience</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-cyan-600 mr-2" />
                  <span>{doctor.clinic_address || 'Location not specified'}</span>
                </div>
              </div>

              {/* Consultation Types */}
              <div className="flex flex-wrap gap-2 mb-4">
                {doctor.consultation_types.map((type, index) => (
                  <Badge 
                    key={index} 
                    variant={type === 'video' ? 'default' : 'secondary'}
                    className={type === 'video' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}
                  >
                    {type === 'in-person' ? 'In-Person' : type === 'video' ? 'Video' : type}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex flex-col space-y-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white"
              >
                Close
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* About */}
              <div>
                <h3 className="text-xl font-bold text-midnight mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  About
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {doctor.bio || 'No bio available for this doctor.'}
                </p>
              </div>

              {/* Languages */}
              <div>
                <h3 className="text-xl font-bold text-midnight mb-3 flex items-center">
                  <Languages className="w-5 h-5 mr-2" />
                  Languages Spoken
                </h3>
                <div className="flex flex-wrap gap-2">
                  {formatLanguages(doctor.languages_spoken).split(', ').map((language, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-50">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Clinic Information */}
              {doctor.clinic_name && (
                <div>
                  <h3 className="text-xl font-bold text-midnight mb-3 flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Clinic Information
                  </h3>
                  <div className="space-y-2">
                    <p className="font-semibold">{doctor.clinic_name}</p>
                    {doctor.clinic_address && (
                      <p className="text-gray-700 flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                        {doctor.clinic_address}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Consultation Fees */}
              <div>
                <h3 className="text-xl font-bold text-midnight mb-3">Consultation Fees</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-[#E17726]" />
                      <span className="font-semibold">In-Person Consultation</span>
                    </div>
                    <span className="text-2xl font-bold text-midnight">
                      ₹{safeNumber(doctor.consultation_fee).toLocaleString()}
                    </span>
                  </div>
                  
                  {doctor.online_consultation_fee && (
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <Video className="w-5 h-5 mr-2 text-blue-600" />
                        <span className="font-semibold">Video Consultation</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-700">
                        ₹{safeNumber(doctor.online_consultation_fee).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Consultation Duration */}
              <div>
                <h3 className="text-xl font-bold text-midnight mb-3">Consultation Details</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Duration</span>
                    <span className="text-lg">{doctor.consultation_duration} minutes</span>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-xl font-bold text-midnight mb-3">Availability</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${doctor.is_online_consultation_available ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="font-semibold">Online Consultation</span>
                    <span className="ml-auto text-gray-600">
                      {doctor.is_online_consultation_available ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${doctor.consultation_types.includes('in-person') ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="font-semibold">In-Person Consultation</span>
                    <span className="ml-auto text-gray-600">
                      {doctor.consultation_types.includes('in-person') ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorDetailsModal;
