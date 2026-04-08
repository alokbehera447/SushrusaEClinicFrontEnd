import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus,
  Settings,
  BarChart3
} from 'lucide-react';
import DoctorSlotManagement from '@/components/forms/DoctorSlotManagement';
import EnhancedConsultationBooking from '@/components/forms/EnhancedConsultationBooking';

const SlotManagementPage = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-midnight mb-2">Slot Management</h1>
            <p className="text-gray-600">Manage consultation slots and bookings</p>
          </div>
          <div className="flex space-x-4">
            <Button 
              onClick={() => setShowBookingForm(true)}
              className="bg-[#E17726] hover:bg-[#E17726]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Book Consultation
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Slots</p>
                  <p className="text-2xl font-bold text-midnight">1,234</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Slots</p>
                  <p className="text-2xl font-bold text-midnight">567</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Booked Slots</p>
                  <p className="text-2xl font-bold text-midnight">89</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilization</p>
                  <p className="text-2xl font-bold text-midnight">72%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="slot-management" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="slot-management" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Slot Management</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="slot-management" className="space-y-6">
            <DoctorSlotManagement />
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-bold text-midnight">
                  <Clock className="w-5 h-5 mr-2 text-[#E17726]" />
                  Recent Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent bookings</p>
                  <p className="text-sm">Bookings will appear here once consultations are scheduled</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-bold text-midnight">
                  <Settings className="w-5 h-5 mr-2 text-[#E17726]" />
                  Slot Management Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">How it works</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Doctors can generate slots based on their availability</li>
                      <li>• Slots are automatically divided based on clinic consultation duration</li>
                      <li>• Patients can book available slots for consultations</li>
                      <li>• System prevents double-booking and conflicts</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Benefits</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Efficient time management</li>
                      <li>• No scheduling conflicts</li>
                      <li>• Automated slot generation</li>
                      <li>• Real-time availability updates</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <EnhancedConsultationBooking onClose={() => setShowBookingForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotManagementPage; 