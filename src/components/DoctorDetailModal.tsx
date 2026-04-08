import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Star, MapPin, Clock, Calendar, Video, Phone, Award, Languages, CheckCircle } from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  qualification: string;
  rating: number;
  reviews: number;
  image: string;
  experience: string;
  location: string;
  price: string;
  nextAvailable: string;
  languages: string[];
  specializations: string[];
}

interface DoctorDetailModalProps {
  doctor: Doctor;
  isOpen: boolean;
  onClose: () => void;
}

const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({ doctor, isOpen, onClose }) => {
  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header with Doctor Image */}
        <div className="relative bg-gradient-to-br from-[#E17726]/10 to-cyan-400/10 p-8 pb-16">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg">
                <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
              </div>
              {/* Online Badge */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl sm:text-3xl font-black text-midnight mb-2">{doctor.name}</h2>
              <div className="text-[#E17726] font-semibold text-lg mb-2">{doctor.specialty}</div>
              <div className="text-gray-600 mb-3">{doctor.qualification}</div>
              
              <div className="flex items-center justify-center sm:justify-start space-x-4 mb-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 font-semibold text-midnight">{doctor.rating}</span>
                  <span className="ml-1 text-gray-400 text-sm">({doctor.reviews} reviews)</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-1 text-[#E17726]" />
                  {doctor.experience} Experience
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-1 text-cyan-600" />
                  {doctor.location}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Specializations */}
          <div>
            <h3 className="text-lg font-bold text-midnight mb-3 flex items-center">
              <Award className="w-5 h-5 mr-2 text-[#E17726]" />
              Specializations
            </h3>
            <div className="flex flex-wrap gap-2">
              {doctor.specializations.map((spec, index) => (
                <span key={index} className="px-3 py-1 bg-gradient-to-r from-[#E17726]/10 to-[#E17726]/5 text-[#E17726] rounded-full text-sm font-medium">
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <h3 className="text-lg font-bold text-midnight mb-3 flex items-center">
              <Languages className="w-5 h-5 mr-2 text-cyan-600" />
              Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {doctor.languages.map((lang, index) => (
                <span key={index} className="px-3 py-1 bg-gradient-to-r from-cyan-400/10 to-cyan-400/5 text-cyan-600 rounded-full text-sm font-medium">
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Next Available */}
          <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-2xl p-4">
            <h3 className="text-lg font-bold text-midnight mb-2 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Next Available
            </h3>
            <div className="text-green-700 font-semibold">{doctor.nextAvailable}</div>
          </div>

          {/* Consultation Fee */}
          <div className="text-center bg-gray-50 rounded-2xl p-6">
            <div className="text-sm text-gray-600 mb-1">Consultation Fee</div>
            <div className="text-3xl font-black text-midnight">
              {doctor.price}
              <span className="text-sm font-normal text-gray-600"> per session</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:shadow-xl-colored text-white px-6 py-4 rounded-2xl font-bold text-base transition-all duration-500 hover:scale-105">
              <Calendar className="w-5 h-5 mr-2" />
              Book Consultation
            </Button>
            <Button variant="outline" className="bg-white border-2 border-[#E17726]/30 text-[#E17726] hover:bg-gradient-to-r hover:from-[#E17726] hover:to-[#FF8A56] hover:text-white px-6 py-4 rounded-2xl font-bold transition-all duration-500">
              <Video className="w-5 h-5 mr-2" />
              Video Call
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailModal;