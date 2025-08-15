import { api } from '@/lib/utils';

// Types
export interface Consultation {
  id: string;
  patient: string;
  patient_name: string;
  doctor: string;
  doctor_name: string;
  consultation_type: string;
  scheduled_date: string;
  scheduled_time: string;
  duration: number;
  status: 'scheduled' | 'patient_checked_in' | 'ready_for_consultation' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  chief_complaint: string;
  symptoms: string;
  consultation_fee: number;
  payment_status: string;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
  checked_in_at?: string;
  checked_in_by?: string;
  ready_for_consultation_at?: string;
  ready_marked_by?: string;
  is_checked_in: boolean;
  is_ready_for_consultation: boolean;
  clinic?: string;
  clinic_name?: string;
}

export interface ConsultationManagementParams {
  status?: string;
  date?: string;
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

export interface ConsultationResponse {
  success: boolean;
  data: Consultation[];
  message: string;
  timestamp: string;
  count?: number;
  next?: string;
  previous?: string;
}

export interface CheckInResponse {
  success: boolean;
  data: Consultation;
  message: string;
  timestamp: string;
}

// Consultation Service
export const consultationService = {
  // Get consultations for admin management (using existing ConsultationViewSet)
  async getConsultationsForManagement(params: ConsultationManagementParams = {}): Promise<ConsultationResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.ordering) queryParams.append('ordering', params.ordering);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    
    const response = await api.get(`/api/consultations/?${queryParams.toString()}`);
    console.log('Raw API response:', response.data);
    
    // Handle nested response structure
    const responseData = response.data;
    const consultationsData = responseData.results?.data || responseData.results || responseData;
    
    return {
      success: true,
      data: consultationsData,
      message: 'Consultations retrieved successfully',
      timestamp: new Date().toISOString(),
      count: responseData.count,
      next: responseData.next,
      previous: responseData.previous
    };
  },

  // Get consultations for doctor (using existing DoctorConsultationViewSet)
  async getDoctorConsultations(params: ConsultationManagementParams = {}): Promise<ConsultationResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.ordering) queryParams.append('ordering', params.ordering);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    
    const response = await api.get(`/api/consultations/doctor/?${queryParams.toString()}`);
    console.log('Raw doctor API response:', response.data);
    
    // Handle nested response structure
    const responseData = response.data;
    const consultationsData = responseData.results?.data || responseData.results || responseData;
    
    return {
      success: true,
      data: consultationsData,
      message: 'Doctor consultations retrieved successfully',
      timestamp: new Date().toISOString(),
      count: responseData.count,
      next: responseData.next,
      previous: responseData.previous
    };
  },

  // Check in a patient (using the new check-in endpoint we created)
  async checkInPatient(consultationId: string): Promise<CheckInResponse> {
    const response = await api.post(`/api/consultations/${consultationId}/check-in/`);
    return response.data;
  },

  // Mark patient as ready for consultation (using the new ready endpoint we created)
  async markPatientReady(consultationId: string): Promise<CheckInResponse> {
    const response = await api.post(`/api/consultations/${consultationId}/ready/`);
    return response.data;
  },

  // Start consultation (using the new start endpoint we created)
  async startConsultation(consultationId: string): Promise<CheckInResponse> {
    const response = await api.post(`/api/consultations/${consultationId}/start/`);
    return response.data;
  },

  // Get consultation by ID (using existing endpoint)
  async getConsultationById(consultationId: string): Promise<Consultation> {
    const response = await api.get(`/api/consultations/${consultationId}/`);
    return response.data.data || response.data;
  },

  // Get ready patients for doctor (filter by status)
  async getReadyPatients(): Promise<ConsultationResponse> {
    return this.getDoctorConsultations({ status: 'ready_for_consultation' });
  },

  // Get ready patients for admin (filter by status)
  async getAdminReadyPatients(): Promise<ConsultationResponse> {
    return this.getConsultationsForManagement({ status: 'ready_for_consultation' });
  },

  // Get scheduled consultations for admin
  async getScheduledConsultations(): Promise<ConsultationResponse> {
    return this.getConsultationsForManagement({ status: 'scheduled' });
  },

  // Get checked in consultations for admin
  async getCheckedInConsultations(): Promise<ConsultationResponse> {
    return this.getConsultationsForManagement({ status: 'patient_checked_in' });
  }
};

// Utility functions
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'patient_checked_in':
      return 'bg-yellow-100 text-yellow-800';
    case 'ready_for_consultation':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-purple-100 text-purple-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'no_show':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'scheduled':
      return 'Scheduled';
    case 'patient_checked_in':
      return 'Checked In';
    case 'ready_for_consultation':
      return 'Ready';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'no_show':
      return 'No Show';
    default:
      return status;
  }
};

export const formatDateTime = (date: string, time: string): string => {
  const dateObj = new Date(`${date}T${time}`);
  return dateObj.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};
