import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PatientOverviewTab from './PatientOverviewTab';
import PatientAppointmentsTab from './PatientAppointmentsTab';
import PatientRecordsTab from './PatientRecordsTab';
import PatientPaymentsTab from './PatientPaymentsTab';
import PatientProfileTab from './PatientProfileTab';

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  return (
    <div className="container mx-auto py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><PatientOverviewTab /></TabsContent>
        <TabsContent value="appointments"><PatientAppointmentsTab /></TabsContent>
        <TabsContent value="records"><PatientRecordsTab /></TabsContent>
        <TabsContent value="payments"><PatientPaymentsTab /></TabsContent>
        <TabsContent value="profile"><PatientProfileTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDashboard;
