import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WorkflowDemo from "./pages/WorkflowDemo";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FindDoctors from "./pages/FindDoctors";
import TestDoctors from "./pages/TestDoctors";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

// Import dashboard pages
import SuperAdminDashboardPage from "./pages/SuperAdminDashboard";
import AdminDashboardPage from "./pages/AdminDashboard";
import DoctorDashboardPage from "./pages/DoctorDashboard";
import PatientDashboardPage from "./pages/PatientDashboard";
import ConsultationMeeting from "./pages/ConsultationMeeting";
import ConsultationWorkspace from "./pages/ConsultationWorkspace";
import SlotManagementPage from "./pages/SlotManagementPage";
import ConsultationDetails from "./pages/ConsultationDetails";

// Import all workflow components
import AppointmentBooking from "@/components/workflow/AppointmentBooking";
import PatientRegistration from "@/components/workflow/PatientRegistration";
import PaymentProcessing from "@/components/workflow/PaymentProcessing";
import { default as WorkflowPrescriptionWriter } from "@/components/workflow/PrescriptionWriter";
import QueueManagement from "@/components/workflow/QueueManagement";
import VideoConsultation from "@/components/workflow/VideoConsultation";
import DoctorSchedule from "@/components/workflow/DoctorSchedule";
import AnalyticsDashboard from "@/components/workflow/AnalyticsDashboard";
import ConsultationCreationPage from "./pages/ConsultationCreationPage";
import AddPatientPage from "./pages/AddPatientPage";
import PrescriptionManagement from "./pages/PrescriptionManagement";
import PrescriptionWriter from "./pages/PrescriptionWriter";
import NearbyEClinicsPage from "./pages/NearbyEClinicsPage";
import MedicationSearchDemo from "./pages/MedicationSearchDemo";
import PatientManagement from "./pages/PatientManagement";
import ConsultationManagement from "./pages/ConsultationManagement";
import OverdueConsultations from "./pages/OverdueConsultations";
import BookingStyleReschedule from "./components/forms/BookingStyleReschedule";
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

// Add this wrapper component for PrescriptionWriter to extract consultationId from params
const PrescriptionWriterPage = () => {
  const { consultationId } = useParams();
  return <WorkflowPrescriptionWriter consultationId={consultationId || ''} onClose={() => window.history.back()} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/find-doctors" element={<FindDoctors />} />
            <Route path="/test-doctors" element={<TestDoctors />} />
            <Route path="/nearby-eclinics" element={<NearbyEClinicsPage />} />
            <Route path="/medication-search-demo" element={<MedicationSearchDemo />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            
            {/* Dashboard Routes (Protected) */}
            <Route path="/superadmin/dashboard" element={
              <ProtectedRoute requiredRole="superadmin">
                <SuperAdminDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/slot-management" element={
              <ProtectedRoute requiredRole="admin">
                <SlotManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/consultations/:consultationId" element={
              <ProtectedRoute requiredRole="admin">
                <ConsultationDetails />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/consultations/:consultationId/reschedule" element={
              <ProtectedRoute requiredRole={["admin", "superadmin"]}>
                <BookingStyleReschedule />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/consultations/new" element={
              <ProtectedRoute requiredRole="admin">
                <ConsultationCreationPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/patients/new" element={
              <ProtectedRoute requiredRole={["admin", "superadmin"]}>
                <AddPatientPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/patients" element={
              <ProtectedRoute requiredRole={["admin", "superadmin"]}>
                <PatientManagement />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/consultations" element={
              <ProtectedRoute requiredRole={["admin", "superadmin"]}>
                <ConsultationManagement />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/consultations/overdue" element={
              <ProtectedRoute requiredRole={["admin", "superadmin"]}>
                <OverdueConsultations />
              </ProtectedRoute>
            } />
            <Route path="/doctor/consultations" element={
              <ProtectedRoute requiredRole="doctor">
                <ConsultationManagement />
              </ProtectedRoute>
            } />
            <Route path="/doctor/dashboard" element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/patient/dashboard" element={
              <ProtectedRoute requiredRole="patient">
                <PatientDashboardPage />
              </ProtectedRoute>
            } />
            
            {/* Workflow Demo Routes */}
            <Route path="/workflow-demo" element={<WorkflowDemo />} />
            <Route path="/workflow/appointment-booking" element={<AppointmentBooking />} />
            <Route path="/workflow/patient-registration" element={<PatientRegistration />} />
            <Route path="/workflow/payment-processing" element={<PaymentProcessing />} />
            <Route path="/workflow/queue-management" element={<QueueManagement />} />
            <Route path="/workflow/video-consultation" element={<VideoConsultation />} />
            <Route path="/workflow/doctor-schedule" element={<DoctorSchedule />} />
            <Route path="/workflow/analytics" element={<AnalyticsDashboard />} />
            <Route path="/prescriptions/new/:consultationId" element={<PrescriptionWriterPage />} />
            
            {/* Prescription Management Routes */}
            <Route path="/prescriptions" element={
              <ProtectedRoute requiredRole="doctor">
                <PrescriptionManagement />
              </ProtectedRoute>
            } />
            <Route path="/prescriptions/:consultationId" element={
              <ProtectedRoute requiredRole="doctor">
                <PrescriptionManagement />
              </ProtectedRoute>
            } />
            <Route path="/prescriptions/:prescriptionId/write" element={
              <ProtectedRoute requiredRole="doctor">
                <PrescriptionWriter />
              </ProtectedRoute>
            } />
            
            <Route path="/consultation/:consultationId/meeting" element={
              <ProtectedRoute requiredRole="doctor">
                <ConsultationMeeting />
              </ProtectedRoute>
            } />
            <Route path="/consultation/:consultationId/workspace" element={
              <ProtectedRoute requiredRole="doctor">
                <ConsultationWorkspace />
              </ProtectedRoute>
            } />
            
            {/* Patient Consultation Routes */}
            <Route path="/patient/consultation/:consultationId/meeting" element={
              <ProtectedRoute requiredRole="patient">
                <ConsultationMeeting />
              </ProtectedRoute>
            } />
            <Route path="/patient/consultation/:consultationId/workspace" element={
              <ProtectedRoute requiredRole="patient">
                <ConsultationWorkspace />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route - must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
