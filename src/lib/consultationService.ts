import { api } from './api';

// Interface for the actual backend response structure
export interface ConsultationResponse {
  id: string;
  patient: string; // Patient ID
  doctor: string; // Doctor ID
  patient_name: string;
  doctor_name: string;
  consultation_type: 'video_call' | 'voice_call' | 'chat' | 'in_person';
  scheduled_date: string;
  scheduled_time: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  consultation_fee: string; // Backend returns as string
  is_paid: boolean;
  created_at: string;
  doctor_meeting_link?: string;
}

// Interface for the frontend (with nested objects for compatibility)
export interface Consultation {
  id: string;
  consultation_id: string;
  patient: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    profile_picture?: string;
  };
  doctor: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    profile_picture?: string;
  };
  scheduled_date: string;
  scheduled_time: string;
  duration: number;
  consultation_type: 'video_call' | 'voice_call' | 'chat' | 'in_person';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  chief_complaint?: string;
  symptoms?: string;
  consultation_fee: number;
  is_paid: boolean;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  actual_start_time?: string;
  actual_end_time?: string;
  actual_duration?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  clinic?: {
    id: string;
    name: string;
    address?: string;
  };
  slot?: {
    id: string;
    start_time: string;
    end_time: string;
  };
  prescription?: {
    id: string;
    medicines: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>;
    instructions: string;
    written_date: string;
  };
  vital_signs?: {
    blood_pressure?: string;
    heart_rate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    oxygen_saturation?: number;
  };
  diagnosis?: Array<{
    diagnosis: string;
    diagnosis_type: 'primary' | 'secondary' | 'differential';
    icd_code?: string;
    confidence_level: 'low' | 'medium' | 'high';
  }>;
}

export interface ConsultationStats {
  total_consultations: number;
  scheduled_consultations: number;
  completed_consultations: number;
  cancelled_consultations: number;
  total_revenue: number;
  consultation_trends: Array<{
    month: string;
    consultations: number;
  }>;
  doctor_consultation_stats: {
    average_duration: number;
    average_rating: number;
    consultation_type_distribution: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    revenue_stats: {
      total_revenue: number;
      average_consultation_fee: number;
      pending_payments: number;
    };
  };
}

export interface ConsultationAnalytics {
  daily_stats: Array<{
    date: string;
    consultations: number;
    revenue: number;
    completion_rate: number;
  }>;
  status_distribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  consultation_types: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  revenue_trends: Array<{
    date: string;
    revenue: number;
    consultations: number;
  }>;
}

export interface RealTimeUpdate {
  type: 'consultation_created' | 'consultation_updated' | 'consultation_status_changed' | 'new_message' | 'payment_received';
  consultation_id: string;
  data: any;
  timestamp: string;
}

class ConsultationService {
  private baseUrl = 'http://localhost:8000/api/consultations';

  // Get all consultations for a doctor
  async getDoctorConsultations(params: {
    status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
    page?: number;
    page_size?: number;
  } = {}): Promise<{ consultations: Consultation[]; total: number; page: number; total_pages: number }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`${this.baseUrl}/doctor/consultations/?${queryParams}`);
    
    // Handle the backend response structure: { success: true, data: {...}, message: "...", timestamp: "..." }
    const data = response.data.success ? response.data.data : response.data;
    
    // Transform backend response to frontend format
    const transformConsultation = (consultationResponse: ConsultationResponse): Consultation => ({
      id: consultationResponse.id,
      consultation_id: consultationResponse.id,
      patient: {
        id: consultationResponse.patient,
        name: consultationResponse.patient_name,
        phone: '', // Not provided in response
        email: undefined,
        profile_picture: undefined
      },
      doctor: {
        id: consultationResponse.doctor,
        name: consultationResponse.doctor_name,
        phone: '', // Not provided in response
        email: undefined,
        profile_picture: undefined
      },
      scheduled_date: consultationResponse.scheduled_date,
      scheduled_time: consultationResponse.scheduled_time,
      duration: consultationResponse.duration,
      consultation_type: consultationResponse.consultation_type,
      status: consultationResponse.status,
      payment_status: consultationResponse.payment_status,
      consultation_fee: parseFloat(consultationResponse.consultation_fee) || 0,
      is_paid: consultationResponse.is_paid,
      created_at: consultationResponse.created_at,
      updated_at: consultationResponse.created_at, // Use created_at as fallback
      doctor_meeting_link: consultationResponse.doctor_meeting_link
    });
    
    // Handle paginated response structure: { count, next, previous, results: [...] }
    if (data && data.results) {
      const transformedConsultations = data.results.map(transformConsultation);
      return {
        consultations: transformedConsultations,
        total: data.count || 0,
        page: params.page || 1,
        total_pages: Math.ceil((data.count || 0) / (params.page_size || 20))
      };
    }
    
    // Fallback for non-paginated response
    const consultationsArray = Array.isArray(data) ? data : [];
    const transformedConsultations = consultationsArray.map(transformConsultation);
    return {
      consultations: transformedConsultations,
      total: consultationsArray.length,
      page: params.page || 1,
      total_pages: 1
    };
  }

  // Get consultation details
  async getConsultationDetail(consultationId: string): Promise<Consultation> {
    const response = await api.get(`${this.baseUrl}/${consultationId}/`);
    return response.data;
  }

  // Create new consultation
  async createConsultation(data: {
    patient_id: string;
    scheduled_date: string;
    scheduled_time: string;
    duration: number;
    consultation_type: string;
    chief_complaint?: string;
    symptoms?: string;
    consultation_fee: number;
    clinic_id?: string;
    slot_id?: string;
  }): Promise<Consultation> {
    const response = await api.post(`${this.baseUrl}/create-dynamic/`, data);
    return response.data;
  }

  // Update consultation status
  async updateConsultationStatus(consultationId: string, status: string, notes?: string): Promise<Consultation> {
    const response = await api.patch(`${this.baseUrl}/${consultationId}/status/`, {
      status,
      notes
    });
    return response.data;
  }

  // Start consultation
  async startConsultation(consultationId: string): Promise<Consultation> {
    const response = await api.post(`${this.baseUrl}/${consultationId}/start/`);
    return response.data;
  }

  // Complete consultation
  async completeConsultation(consultationId: string, notes?: string): Promise<Consultation> {
    const response = await api.post(`${this.baseUrl}/${consultationId}/complete/`, {
      notes
    });
    return response.data;
  }

  // Cancel consultation
  async cancelConsultation(consultationId: string, reason: string): Promise<Consultation> {
    const response = await api.post(`${this.baseUrl}/${consultationId}/cancel/`, {
      reason
    });
    return response.data;
  }

  // Reschedule consultation
  async rescheduleConsultation(consultationId: string, data: {
    new_date: string;
    new_time: string;
    reason?: string;
  }): Promise<Consultation> {
    const response = await api.post(`${this.baseUrl}/${consultationId}/reschedule/`, data);
    return response.data;
  }

  // Get consultation statistics
  async getConsultationStats(params: {
    date_from?: string;
    date_to?: string;
  } = {}): Promise<ConsultationStats> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`${this.baseUrl}/statistics/?${queryParams}`);
    // Handle the backend response structure: { success: true, data: {...}, message: "...", timestamp: "..." }
    return response.data.success ? response.data.data : response.data;
  }

  // Get consultation analytics
  async getConsultationAnalytics(params: {
    date_from: string;
    date_to: string;
    group_by?: 'day' | 'week' | 'month';
  }): Promise<ConsultationAnalytics> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`${this.baseUrl}/analytics/?${queryParams}`);
    // Handle the backend response structure: { success: true, data: {...}, message: "...", timestamp: "..." }
    return response.data.success ? response.data.data : response.data;
  }

  // Get real-time updates
  async getRealTimeUpdates(): Promise<{
    today_consultations: Consultation[];
    upcoming_consultations: Consultation[];
    recent_updates: RealTimeUpdate[];
    notifications: Array<{
      id: string;
      type: string;
      message: string;
      timestamp: string;
      read: boolean;
    }>;
  }> {
    const response = await api.get(`${this.baseUrl}/real-time-updates/`);
    // Handle the backend response structure: { success: true, data: {...}, message: "...", timestamp: "..." }
    return response.data.success ? response.data.data : response.data;
  }

  // Get today's consultations
  async getTodayConsultations(): Promise<Consultation[]> {
    const response = await api.get(`${this.baseUrl}/today/`);
    return response.data;
  }

  // Get upcoming consultations
  async getUpcomingConsultations(days: number = 7): Promise<Consultation[]> {
    const response = await api.get(`${this.baseUrl}/upcoming/?days=${days}`);
    return response.data;
  }

  // Add consultation note
  async addConsultationNote(consultationId: string, data: {
    note_type: string;
    content: string;
  }): Promise<any> {
    const response = await api.post(`${this.baseUrl}/${consultationId}/notes/`, data);
    return response.data;
  }

  // Get consultation notes
  async getConsultationNotes(consultationId: string): Promise<any[]> {
    const response = await api.get(`${this.baseUrl}/${consultationId}/notes/`);
    return response.data;
  }

  // Record vital signs
  async recordVitalSigns(consultationId: string, vitalSigns: {
    blood_pressure?: string;
    heart_rate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    oxygen_saturation?: number;
  }): Promise<any> {
    const response = await api.post(`${this.baseUrl}/${consultationId}/vital-signs/`, vitalSigns);
    return response.data;
  }

  // Add diagnosis
  async addDiagnosis(consultationId: string, diagnosis: {
    diagnosis: string;
    diagnosis_type: 'primary' | 'secondary' | 'differential';
    icd_code?: string;
    notes?: string;
    confidence_level: 'low' | 'medium' | 'high';
  }): Promise<any> {
    const response = await api.post(`${this.baseUrl}/${consultationId}/diagnosis/`, diagnosis);
    return response.data;
  }

  // Get available slots for a date
  async getAvailableSlots(date: string, doctorId?: string): Promise<any[]> {
    const params = new URLSearchParams({ date });
    if (doctorId) {
      params.append('doctor_id', doctorId);
    }
    
    const response = await api.get(`${this.baseUrl}/available-slots/?${params}`);
    return response.data;
  }

  // Send WhatsApp notification
  async sendWhatsAppNotification(consultationId: string, messageType: 'reminder' | 'confirmation' | 'cancellation'): Promise<any> {
    const response = await api.post(`${this.baseUrl}/${consultationId}/whatsapp/`, {
      message_type: messageType
    });
    return response.data;
  }

  // Get consultation trends
  async getConsultationTrends(days: number = 30): Promise<any[]> {
    const response = await api.get(`${this.baseUrl}/trends/?days=${days}`);
    return response.data;
  }

  // Get revenue analytics
  async getRevenueAnalytics(params: {
    start_date: string;
    end_date: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value.toString());
    });

    const response = await api.get(`${this.baseUrl}/revenue-analytics/?${queryParams}`);
    return response.data;
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await api.patch(`/api/notifications/${notificationId}/read/`);
  }

  // Get consultation performance metrics
  async getPerformanceMetrics(params: {
    start_date: string;
    end_date: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value.toString());
    });

    const response = await api.get(`${this.baseUrl}/performance-metrics/?${queryParams}`);
    return response.data;
  }
}

export const consultationService = new ConsultationService();
