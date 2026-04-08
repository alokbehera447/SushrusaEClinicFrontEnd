import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  User, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { EClinic } from '@/lib/api';

interface AdminAssignmentInfoProps {
  assignedClinic: EClinic;
  adminName: string;
  onManageClinic?: () => void;
}

const AdminAssignmentInfo: React.FC<AdminAssignmentInfoProps> = ({ 
  assignedClinic, 
  adminName,
  onManageClinic 
}) => {
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

  const StatusIcon = getStatusIcon(assignedClinic.is_active, assignedClinic.is_verified);

  return (
    <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                E-Clinic Assignment
              </CardTitle>
              <p className="text-sm text-gray-600">
                You are assigned to manage this e-clinic
              </p>
            </div>
          </div>
          <Badge className={`${getStatusColor(assignedClinic.is_active, assignedClinic.is_verified)} text-xs px-3 py-1`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {getStatusText(assignedClinic.is_active, assignedClinic.is_verified)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Clinic Basic Info */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {assignedClinic.name}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {assignedClinic.description || 'No description available'}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>ID: {assignedClinic.id}</span>
              </span>
              <span className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>Admin: {adminName}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 p-2 bg-white/60 rounded-lg">
            <MapPin className="w-4 h-4 text-gray-600" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-700">Location</p>
              <p className="text-xs text-gray-600 truncate">
                {assignedClinic.city}, {assignedClinic.state}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-white/60 rounded-lg">
            <Phone className="w-4 h-4 text-gray-600" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-700">Phone</p>
              <p className="text-xs text-gray-600 truncate">
                {assignedClinic.phone}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-white/60 rounded-lg">
            <Mail className="w-4 h-4 text-gray-600" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-700">Email</p>
              <p className="text-xs text-gray-600 truncate">
                {assignedClinic.email}
              </p>
            </div>
          </div>
          {assignedClinic.consultation_fee && (
            <div className="flex items-center space-x-2 p-2 bg-white/60 rounded-lg">
              <CheckCircle className="w-4 h-4 text-gray-600" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-700">Consultation Fee</p>
                <p className="text-xs text-gray-600">
                  ₹{assignedClinic.consultation_fee}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <p className="text-lg font-bold text-blue-600">
              {assignedClinic.services?.length || 0}
            </p>
            <p className="text-xs text-gray-600">Services</p>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <p className="text-lg font-bold text-green-600">
              {assignedClinic.rating || 'N/A'}
            </p>
            <p className="text-xs text-gray-600">Rating</p>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <p className="text-lg font-bold text-purple-600">
              {assignedClinic.total_reviews || 0}
            </p>
            <p className="text-xs text-gray-600">Reviews</p>
          </div>
        </div>

        {/* Action Button */}
        {onManageClinic && (
          <div className="pt-2">
            <Button 
              onClick={onManageClinic}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Manage E-Clinic Profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAssignmentInfo;
