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
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

// Import dashboard pages
import SuperAdminDashboardPage from "./pages/SuperAdminDashboard";
import AdminDashboardPage from "./pages/AdminDashboard";
import DoctorDashboardPage from "./pages/DoctorDashboard";
import PatientDashboardPage from "./pages/PatientDashboard";
import ConsultationMeeting from "./pages/ConsultationMeeting";

// Import all workflow components
import AppointmentBooking from "@/components/workflow/AppointmentBooking";
import PatientRegistration from "@/components/workflow/PatientRegistration";
import PaymentProcessing from "@/components/workflow/PaymentProcessing";
import PrescriptionWriter from "@/components/workflow/PrescriptionWriter";
import QueueManagement from "@/components/workflow/QueueManagement";
import VideoConsultation from "@/components/workflow/VideoConsultation";
import DoctorSchedule from "@/components/workflow/DoctorSchedule";
import AnalyticsDashboard from "@/components/workflow/AnalyticsDashboard";
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

// Add this wrapper component for PrescriptionWriter to extract consultationId from params
const PrescriptionWriterPage = () => {
  const { consultationId } = useParams();
  return <PrescriptionWriter consultationId={consultationId || ''} onClose={() => window.history.back()} />;
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
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            
            {/* Dashboard Routes (Protected) */}
            <Route path="/superadmin/dashboard" element={
              <ProtectedRoute requiredRole="superadmin">
                <SuperAdminDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardPage />
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
            <Route path="/consultation-meeting" element={<ConsultationMeeting />} />
            
            {/* Catch-all route - must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
