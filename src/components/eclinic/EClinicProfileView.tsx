import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Star, 
  Users, 
  User,
  Stethoscope, 
  Shield, 
  ShieldCheck, 
  Edit, 
  Settings, 
  Calendar,
  FileText,
  Award,
  Activity,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2
} from 'lucide-react';
import { EClinic } from '@/lib/api';
import { superAdminApi } from '@/lib/api';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface EClinicProfileViewProps {
  clinicId: string;
  onEdit?: () => void;
  isEditable?: boolean;
}

const EClinicProfileView: React.FC<EClinicProfileViewProps> = ({ 
  clinicId, 
  onEdit, 
  isEditable = true 
}) => {
  const [clinic, setClinic] = useState<EClinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClinicProfile();
  }, [clinicId]);

  const fetchClinicProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const clinicData = await superAdminApi.getEClinic(clinicId);
      setClinic(clinicData);
    } catch (error) {
      console.error('Error fetching clinic profile:', error);
      setError('Failed to load clinic profile');
      toast.error('Failed to load clinic profile');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'bg-red-100 text-red-800';
    if (!isVerified) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'Inactive';
    if (!isVerified) return 'Pending Verification';
    return 'Active & Verified';
  };

  const getStatusIcon = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return AlertCircle;
    if (!isVerified) return Clock;
    return CheckCircle;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-10 w-24" />
            </div>
          </CardHeader>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Error Loading Clinic Profile</AlertTitle>
        <AlertDescription className="text-red-700">
          {error || 'Clinic profile not found'}
        </AlertDescription>
      </Alert>
    );
  }

  const StatusIcon = getStatusIcon(clinic.is_active, clinic.is_verified);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                  <AvatarImage src={clinic.logo || '/clinic-avatar.svg'} alt={clinic.name} />
                  <AvatarFallback className="bg-emerald-600 text-white text-xl font-bold">
                    {clinic.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1">
                  <Badge className={`${getStatusColor(clinic.is_active, clinic.is_verified)} text-xs px-2 py-1`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {getStatusText(clinic.is_active, clinic.is_verified)}
                  </Badge>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{clinic.name}</h1>
                <p className="text-gray-600 text-sm mb-2">{clinic.description || 'No description available'}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Building2 className="w-4 h-4" />
                    <span>ID: {clinic.id}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {new Date(clinic.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            {isEditable && onEdit && (
              <Button 
                onClick={onEdit}
                className="bg-[#E17726] hover:bg-[#c9651e] text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Cover Image Section */}
      {clinic.cover_image && (
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <div className="relative">
            <img 
              src={clinic.cover_image} 
              alt={`${clinic.name} cover image`}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                <Phone className="w-5 h-5 mr-2 text-[#E17726]" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">{clinic.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{clinic.email}</p>
                  </div>
                </div>
                {clinic.website && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                    <Globe className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Website</p>
                      <a 
                        href={clinic.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {clinic.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                <MapPin className="w-5 h-5 mr-2 text-[#E17726]" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {clinic.street}<br />
                  {clinic.city}, {clinic.state} {clinic.pincode}<br />
                  {clinic.country}
                </p>
                {(clinic.latitude && clinic.longitude) && (
                  <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>Coordinates: {clinic.latitude}, {clinic.longitude}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Services & Specialties */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                <Stethoscope className="w-5 h-5 mr-2 text-[#E17726]" />
                Services & Specialties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clinic.specialties && clinic.specialties.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {clinic.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {clinic.services && clinic.services.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Services Offered</h4>
                    <div className="flex flex-wrap gap-2">
                      {clinic.services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {clinic.facilities && clinic.facilities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Facilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {clinic.facilities.map((facility, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {(!clinic.specialties || clinic.specialties.length === 0) && 
                 (!clinic.services || clinic.services.length === 0) && 
                 (!clinic.facilities || clinic.facilities.length === 0) && (
                  <p className="text-sm text-gray-500">No services, specialties, or facilities listed</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          {clinic.operating_hours && Object.keys(clinic.operating_hours).length > 0 && (
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                  <Clock className="w-5 h-5 mr-2 text-[#E17726]" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    {Object.entries(clinic.operating_hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700 capitalize">{day}:</span>
                        <span className="text-gray-600">
                          {typeof hours === 'string' ? hours : 
                           typeof hours === 'object' && hours !== null && 'open' in hours && 'close' in hours ? 
                           `${hours.open} - ${hours.close}` : 
                           'Closed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Verification */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                <Shield className="w-5 h-5 mr-2 text-[#E17726]" />
                Status & Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${clinic.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium text-gray-700">Active Status</span>
                </div>
                <Badge className={clinic.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {clinic.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className={`w-4 h-4 ${clinic.is_verified ? 'text-green-600' : 'text-yellow-600'}`} />
                  <span className="text-sm font-medium text-gray-700">Verification</span>
                </div>
                <Badge className={clinic.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {clinic.is_verified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                <TrendingUp className="w-5 h-5 mr-2 text-[#E17726]" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clinic.rating && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-700">Rating</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">{clinic.rating}/5</span>
                </div>
              )}
              {clinic.total_reviews && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Reviews</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{clinic.total_reviews}</span>
                </div>
              )}
              {clinic.consultation_fee && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Consultation Fee</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">₹{clinic.consultation_fee}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Information */}
          {clinic.admin_name && (
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                  <User className="w-5 h-5 mr-2 text-[#E17726]" />
                  Admin Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900 mb-1">Admin Name</p>
                  <p className="text-gray-600 text-xs">{clinic.admin_name}</p>
                </div>
                {clinic.admin_phone && (
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 mb-1">Admin Phone</p>
                    <p className="text-gray-600 text-xs">{clinic.admin_phone}</p>
                  </div>
                )}
                <div className="text-sm">
                  <p className="font-medium text-gray-900 mb-1">Admin ID</p>
                  <p className="text-gray-600 font-mono text-xs">{clinic.admin}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Registration Info */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                <FileText className="w-5 h-5 mr-2 text-[#E17726]" />
                Registration Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="font-medium text-gray-900 mb-1">Clinic ID</p>
                <p className="text-gray-600 font-mono text-xs">{clinic.id}</p>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900 mb-1">Registration Number</p>
                <p className="text-gray-600 font-mono text-xs">{clinic.registration_number}</p>
              </div>
              {clinic.license_number && (
                <div className="text-sm">
                  <p className="font-medium text-gray-900 mb-1">License Number</p>
                  <p className="text-gray-600 font-mono text-xs">{clinic.license_number}</p>
                </div>
              )}
              {clinic.accreditation && (
                <div className="text-sm">
                  <p className="font-medium text-gray-900 mb-1">Accreditation</p>
                  <p className="text-gray-600 text-xs">{clinic.accreditation}</p>
                </div>
              )}
              <div className="text-sm">
                <p className="font-medium text-gray-900 mb-1">Clinic Type</p>
                <p className="text-gray-600 text-xs capitalize">{clinic.clinic_type.replace('_', ' ')}</p>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900 mb-1">Created</p>
                <p className="text-gray-600 text-xs">
                  {new Date(clinic.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900 mb-1">Last Updated</p>
                <p className="text-gray-600 text-xs">
                  {new Date(clinic.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EClinicProfileView;
