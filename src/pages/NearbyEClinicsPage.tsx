import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  CheckCircle,
  ArrowLeft,
  Navigation,
  Star,
  Users,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import NearbyEClinics from '@/components/NearbyEClinics';
import { EClinic } from '@/lib/api';

const NearbyEClinicsPage: React.FC = () => {
  const [selectedClinic, setSelectedClinic] = useState<EClinic | null>(null);
  const navigate = useNavigate();

  const handleClinicSelect = (clinic: EClinic) => {
    setSelectedClinic(clinic);
  };

  const handleBookConsultation = (clinic: EClinic) => {
    // Navigate to consultation booking with clinic pre-selected
    navigate('/consultation/create', { 
      state: { selectedClinic: clinic }
    });
  };

  const handleViewClinicDetails = (clinic: EClinic) => {
    // Navigate to clinic details page
    navigate(`/eclinic/${clinic.id}`, { 
      state: { clinic }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 border-b border-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-bold text-white">Find Nearby E-Clinics</h1>
                <p className="text-xs text-blue-100">Discover healthcare providers in your area</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified Clinics
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selected Clinic Modal */}
        {selectedClinic && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedClinic.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedClinic.street}, {selectedClinic.city}, {selectedClinic.state} {selectedClinic.pincode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedClinic.is_verified && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {selectedClinic.accepts_online_consultations && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          <Clock className="w-3 h-3 mr-1" />
                          Online Consultations
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedClinic(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Description */}
                {selectedClinic.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                    <p className="text-gray-600">{selectedClinic.description}</p>
                  </div>
                )}

                {/* Specialties */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedClinic.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedClinic.services.map((service, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Facilities */}
                {selectedClinic.facilities.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Facilities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedClinic.facilities.map((facility, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <Award className="w-4 h-4 text-blue-500" />
                          <span>{facility}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    {selectedClinic.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{selectedClinic.phone}</span>
                      </div>
                    )}
                    {selectedClinic.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{selectedClinic.email}</span>
                      </div>
                    )}
                    {selectedClinic.website && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Globe className="w-4 h-4" />
                        <a href={selectedClinic.website} target="_blank" rel="noopener noreferrer">
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operating Hours */}
                {selectedClinic.operating_hours && Object.keys(selectedClinic.operating_hours).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Operating Hours</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(selectedClinic.operating_hours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700 capitalize">{day}</span>
                          <span className="text-gray-600">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    className="flex-1"
                    onClick={() => handleBookConsultation(selectedClinic)}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Book Consultation
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleViewClinicDetails(selectedClinic)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <NearbyEClinics onClinicSelect={handleClinicSelect} />
      </div>
    </div>
  );
};

export default NearbyEClinicsPage;
