import { api } from './utils';

// Export the api instance for use in other modules
export { api };

// Utility function to extract error messages from backend responses
export const extractErrorMessage = (error: unknown): string => {
  console.log('Error object:', error);
  
  // If it's an axios error with response data
  if (error.response) {
    // Handle specific HTTP status codes
    if (error.response.status === 401) {
      return 'Your session has expired. Please log in again to save your changes.';
    }
    
    if (error.response.status === 403) {
      return 'You do not have permission to perform this action.';
    }

    if (error.response.data) {
      const responseData = error.response.data;
      
      // Handle Django REST Framework validation errors
      if (responseData.admin && Array.isArray(responseData.admin)) {
        return responseData.admin[0]; // Return first admin error
      }
      
      // Handle field-specific errors
      if (typeof responseData === 'object') {
        const fieldErrors = Object.entries(responseData)
          .filter(([key, value]) => Array.isArray(value) && value.length > 0)
          .map(([key, value]) => `${key}: ${(value as string[])[0]}`)
          .join(', ');
        
        if (fieldErrors) {
          return fieldErrors;
        }
      }
      
      if (responseData.error && typeof responseData.error === 'object') {
        // Handle Razorpay specific error structure
        if (responseData.error.detail?.error?.description) {
          return responseData.error.detail.error.description;
        }
        if (responseData.error.message) {
          return responseData.error.message;
        }
      }
      
      // Handle general error message
      if (responseData.message) {
        return responseData.message;
      }
      
      // Handle non-field error
      if (responseData.error && typeof responseData.error === 'string') {
        return responseData.error;
      }
    }
  }
  
  // Handle network errors
  if (error && typeof error === 'object' && 'message' in error) {
    const err = error as { message: string };
    if (err.message.includes('Network Error')) {
      return 'Network error. Please check your connection.';
    }
    return err.message;
  }
  
  // Default error message
  return 'An unexpected error occurred. Please try again.';
};

// HTTP method helpers
export const get = <T = unknown>(url: string, config?: Record<string, unknown>) => api.get<T>(url, config).then(res => res.data);
export const post = <T = unknown>(url: string, data?: unknown, config?: Record<string, unknown>) => api.post<T>(url, data, config).then(res => res.data);
export const put = <T = unknown>(url: string, data?: unknown, config?: Record<string, unknown>) => api.put<T>(url, data, config).then(res => res.data);
export const del = <T = unknown>(url: string, config?: Record<string, unknown>) => api.delete<T>(url, config).then(res => res.data);

// Types for e-clinic data
export interface EClinic {
  id: string;
  name: string;
  clinic_type: string;
  description?: string;
  phone: string;
  email: string;
  website?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude?: string;
  longitude?: string;
  operating_hours?: Record<string, string>;
  specialties?: string[];
  services?: string[];
  facilities?: string[];
  registration_number: string;
  license_number?: string;
  accreditation?: string;
  cover_image?: string;
  gallery_images?: string[];
  is_active: boolean;
  is_verified: boolean;
  accepts_online_consultations?: boolean;
  consultation_duration?: number;
  admin: string;
  admin_name?: string;
  admin_phone?: string;
  rating?: number;
  total_reviews?: number;
  consultation_fee?: number;
  created_at: string;
  updated_at: string;
}

// Types for patient data
export interface PatientClinic {
  clinic_id: string;
  clinic_name: string;
  registered_at: string;
  registration_source: 'admin_created' | 'consultation' | 'self_registered' | 'migrated';
}

export interface PatientProfile {
  id: string;
  user: string;
  user_name: string;
  user_phone: string;
  user_email: string;
  date_of_birth: string | null;
  gender: string;
  blood_group: string;
  allergies: string;
  chronic_conditions: string[];
  current_medications: string[];
  insurance_provider: string;
  insurance_policy_number: string;
  insurance_expiry: string | null;
  preferred_language: string;
  emergency_contact?: string;
  medical_history?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  age: number | null;
  clinics?: PatientClinic[];
}

export interface UserProfile {
  id: string;
  phone: string;
  email: string;
  name: string;
  role: string;
  date_of_birth: string | null;
  gender: string;
  profile_picture: string | null;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  blood_group: string;
  allergies: string;
  medical_history: string;
  is_verified: boolean;
  date_joined: string;
  age: number | null;
  full_address: string;
}

// Public patient registration interfaces
export interface PublicPatientRegistrationData {
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface PublicPatientRegistrationResponse {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  success: boolean;
  nearest_eclinics?: EClinic[];
}

export interface Consultation {
  id: string;
  patient: string;
  doctor: string;
  patient_name: string;
  doctor_name: string;
  consultation_type: string;
  scheduled_date: string;
  scheduled_time: string;
  duration: number;
  status: string;
  payment_status: string;
  consultation_fee: number | string;
  is_paid: boolean;
  payment_method?: string;
  chief_complaint: string;
  symptoms?: string;
  doctor_notes?: string;
  patient_notes?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  is_follow_up?: boolean;
  follow_up_required?: boolean;
  follow_up_date?: string;
  parent_consultation?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  booked_slot?: number;
  created_at: string;
  updated_at: string;
  doctor_meeting_link?: string;
}

// Enhanced consultation details interface with all related data
export interface ConsultationDetails extends Consultation {
  patient_phone?: string;
  patient_email?: string;
  patient_age?: number;
  patient_gender?: string;
  doctor_phone?: string;
  doctor_email?: string;
  doctor_specialty?: string;
  recorded_symptoms?: ConsultationSymptom[];
  diagnoses?: ConsultationDiagnosis[];
  vital_signs?: ConsultationVitalSigns;
  attachments?: ConsultationAttachment[];
  notes?: ConsultationNote[];
  reschedules?: ConsultationReschedule[];
  prescription_data?: PrescriptionDetails;
}

export interface ConsultationSymptom {
  id: number;
  consultation: string;
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  notes: string;
  created_at: string;
}

export interface ConsultationDiagnosis {
  id: number;
  consultation: string;
  diagnosis: string;
  diagnosis_type: 'primary' | 'secondary' | 'differential' | 'provisional';
  icd_code: string;
  notes: string;
  confidence_level: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface ConsultationVitalSigns {
  id: number;
  consultation: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  height?: number;
  weight?: number;
  bmi?: number;
  blood_glucose?: number;
  notes: string;
  recorded_at: string;
  recorded_by?: string;
}

export interface ConsultationAttachment {
  id: number;
  consultation: string;
  file: string;
  attachment_type: 'image' | 'document' | 'lab_report' | 'prescription' | 'xray' | 'scan' | 'other';
  title: string;
  description: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface ConsultationNote {
  id: number;
  consultation: string;
  note_type: 'general' | 'examination' | 'treatment' | 'advice' | 'follow_up';
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ConsultationReschedule {
  id: number;
  consultation: string;
  old_date: string;
  old_time: string;
  new_date: string;
  new_time: string;
  reason: string;
  requested_by: string;
  created_at: string;
}

export interface PrescriptionDetails {
  id: string;
  issued_date: string;
  issued_time: string;
  primary_diagnosis: string;
  patient_previous_history: string;
  general_instructions: string;
  diet_instructions: string;
  lifestyle_advice: string;
  next_visit: string;
  follow_up_notes: string;
  is_finalized: boolean;
  medications: PrescriptionMedication[];
}

export interface PrescriptionMedication {
  id: string;
  prescription: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  order: number;
}

export interface Prescription {
  id: string;
  consultation: string;
  doctor: string;
  patient: string;
  patient_name: string;
  doctor_name: string;
  diagnosis: string;
  symptoms: string;
  general_instructions: string;
  header: string;
  body: string;
  footer: string;
  issued_date: string;
  valid_until: string;
  status: string;
  follow_up_required: boolean;
  follow_up_date: string | null;
  follow_up_instructions: string;
  digital_signature: string;
  is_verified: boolean;
  verification_code: string;
  total_medications: number;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: number;
  prescription: string;
  name: string;
  generic_name: string;
  brand_name: string;
  strength: string;
  dosage_form: string;
  dosage: string;
  frequency: string;
  custom_frequency: string;
  timing: string;
  duration_days: number;
  total_quantity: number;
  special_instructions: string;
  side_effects_warning: string;
  substitution_allowed: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: number;
  patient: string;
  patient_name?: string;
  record_type: string;
  title: string;
  description: string;
  date_recorded: string;
  document: string | null;
  document_url?: string;
  recorded_by: string | null;
  recorded_by_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientDocument {
  id: number;
  patient: string;
  document_type: string;
  title: string;
  description: string;
  file: string;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  uploaded_at: string;
  updated_at: string;
}

export interface PatientNote {
  id: number;
  patient: string;
  note: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// E-Clinic interfaces

export interface CreateEClinicData {
  name: string;
  clinic_type?: string;
  description?: string;
  phone: string;
  email: string;
  website?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  operating_hours?: Record<string, string>;
  specialties?: string[];
  services?: string[];
  facilities?: string[];
  registration_number: string;
  license_number?: string;
  accreditation?: string;
  cover_image?: File;
  gallery_images?: string[];
  is_active?: boolean;
  accepts_online_consultations?: boolean;
  consultation_duration?: number; // Duration in minutes
  admin?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Comprehensive Patient API service functions - 45+ endpoints
export const patientApi = {
  // ===== AUTHENTICATION APIs (5 endpoints) =====
  
  // Get current user's profile
  getCurrentUserProfile: async (): Promise<UserProfile> => {
    const response = await api.get<ApiResponse<UserProfile>>('/api/auth/profile/');
    return response.data.data;
  },

  // Update user profile
  updateUserProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put<ApiResponse<UserProfile>>('/api/auth/profile/', profileData);
    return response.data.data;
  },

  // Change password
  changePassword: async (passwordData: { old_password: string; new_password: string }): Promise<void> => {
    await api.post('/api/auth/change-password/', passwordData);
  },

  // Get active sessions
  getActiveSessions: async (): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>('/api/auth/sessions/');
    return response.data.data;
  },

  // Terminate session
  terminateSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/api/auth/sessions/${sessionId}/`);
  },

  // ===== PROFILE MANAGEMENT APIs (3 endpoints) =====
  
  // Get patient profile
  getPatientProfile: async (patientId?: string): Promise<PatientProfile> => {
    const url = patientId ? `/api/patients/${patientId}/` : '/api/patients/';
    const response = await api.get<ApiResponse<PatientProfile>>(url);
    return response.data.data;
  },

  // Update patient profile
  updatePatientProfile: async (patientId: string, profileData: Partial<PatientProfile>): Promise<PatientProfile> => {
    const response = await api.put<ApiResponse<PatientProfile>>(`/api/patients/${patientId}/`, profileData);
    return response.data.data;
  },

  // Partial update patient profile
  partialUpdatePatientProfile: async (patientId: string, profileData: Partial<PatientProfile>): Promise<PatientProfile> => {
    const response = await api.patch<ApiResponse<PatientProfile>>(`/api/patients/${patientId}/`, profileData);
    return response.data.data;
  },

  // ===== SEARCH & ANALYTICS APIs (2 endpoints) =====
  
  // Search patients
  searchPatients: async (searchParams: any): Promise<PaginatedResponse<PatientProfile>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<PatientProfile>>>('/api/patients/search/', { params: searchParams });
    return response.data.data;
  },

  // Get patient statistics
  getPatientStats: async (): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/api/patients/stats/');
    return response.data.data;
  },

  // ===== MEDICAL RECORDS APIs (6 endpoints) =====
  
  // Get patient medical records
  getPatientMedicalRecords: async (patientId?: string, params?: any): Promise<MedicalRecord[]> => {
    try {
      const url = patientId 
        ? `/api/patients/${patientId}/medical-records/` 
        : '/api/patients/medical-records/';
      const response = await api.get(url, { params });
      
      // Handle paginated response (direct format from DRF)
      if (response.data && response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      
      // Handle wrapped response (non-paginated)
      if (response.data && response.data.data && response.data.data.results) {
        return response.data.data.results;
      }
      
      // Handle direct array response
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Return empty array if no data
      return [];
    } catch (error) {
      console.error('Error fetching medical records:', error);
      return [];
    }
  },

  // Create medical record
  createMedicalRecord: async (patientId: string, recordData: FormData): Promise<MedicalRecord> => {
    const response = await api.post<ApiResponse<MedicalRecord>>(`/api/patients/${patientId}/medical-records/`, recordData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Get specific medical record
  getMedicalRecord: async (patientId: string, recordId: string): Promise<MedicalRecord> => {
    const response = await api.get<ApiResponse<MedicalRecord>>(`/api/patients/${patientId}/medical-records/${recordId}/`);
    return response.data.data;
  },

  // Update medical record
  updateMedicalRecord: async (patientId: string, recordId: string, recordData: FormData): Promise<MedicalRecord> => {
    const response = await api.put<ApiResponse<MedicalRecord>>(`/api/patients/${patientId}/medical-records/${recordId}/`, recordData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Partial update medical record
  partialUpdateMedicalRecord: async (patientId: string, recordId: string, recordData: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    const response = await api.patch<ApiResponse<MedicalRecord>>(`/api/patients/${patientId}/medical-records/${recordId}/`, recordData);
    return response.data.data;
  },

  // Delete medical record
  deleteMedicalRecord: async (patientId: string, recordId: string): Promise<void> => {
    await api.delete(`/api/patients/${patientId}/medical-records/${recordId}/`);
  },

  // ===== DOCUMENTS APIs (6 endpoints) =====
  
  // Get patient documents
  getPatientDocuments: async (patientId: string, params?: any): Promise<PatientDocument[]> => {
    try {
      const response = await api.get(`/api/patients/${patientId}/documents/`, { params });
      
      // Handle paginated response (direct format from DRF)
      if (response.data && response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      
      // Handle wrapped response (non-paginated)
      if (response.data && response.data.data && response.data.data.results) {
        return response.data.data.results;
      }
      
      // Handle direct array response
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Return empty array if no data
      return [];
    } catch (error) {
      console.error('Error fetching patient documents:', error);
      return [];
    }
  },

  // Upload document
  uploadDocument: async (patientId: string, documentData: FormData): Promise<PatientDocument> => {
    const response = await api.post<ApiResponse<PatientDocument>>(`/api/patients/${patientId}/documents/`, documentData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Get specific document
  getDocument: async (patientId: string, documentId: string): Promise<PatientDocument> => {
    const response = await api.get<ApiResponse<PatientDocument>>(`/api/patients/${patientId}/documents/${documentId}/`);
    return response.data.data;
  },

  // Update document
  updateDocument: async (patientId: string, documentId: string, documentData: FormData): Promise<PatientDocument> => {
    const response = await api.put<ApiResponse<PatientDocument>>(`/api/patients/${patientId}/documents/${documentId}/`, documentData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Partial update document
  partialUpdateDocument: async (patientId: string, documentId: string, documentData: Partial<PatientDocument>): Promise<PatientDocument> => {
    const response = await api.patch<ApiResponse<PatientDocument>>(`/api/patients/${patientId}/documents/${documentId}/`, documentData);
    return response.data.data;
  },

  // Delete document
  deleteDocument: async (patientId: string, documentId: string): Promise<void> => {
    await api.delete(`/api/patients/${patientId}/documents/${documentId}/`);
  },

  // ===== PATIENT NOTES APIs (6 endpoints) =====
  
  // Get patient notes
  getPatientNotes: async (patientId: string, params?: any): Promise<any[]> => {
    try {
      const response = await api.get(`/api/patients/${patientId}/notes/`, { params });
      
      // Handle paginated response (direct format from DRF)
      if (response.data && response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      
      // Handle wrapped response (non-paginated)
      if (response.data && response.data.data && response.data.data.results) {
        return response.data.data.results;
      }
      
      // Handle direct array response
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Return empty array if no data
      return [];
    } catch (error) {
      console.error('Error fetching patient notes:', error);
      return [];
    }
  },

  // Create note
  createNote: async (patientId: string, noteData: any): Promise<any> => {
    const response = await api.post<ApiResponse<any>>(`/api/patients/${patientId}/notes/`, noteData);
    return response.data.data;
  },

  // Get specific note
  getNote: async (patientId: string, noteId: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(`/api/patients/${patientId}/notes/${noteId}/`);
    return response.data.data;
  },

  // Update note
  updateNote: async (patientId: string, noteId: string, noteData: any): Promise<any> => {
    const response = await api.put<ApiResponse<any>>(`/api/patients/${patientId}/notes/${noteId}/`, noteData);
    return response.data.data;
  },

  // Partial update note
  partialUpdateNote: async (patientId: string, noteId: string, noteData: any): Promise<any> => {
    const response = await api.patch<ApiResponse<any>>(`/api/patients/${patientId}/notes/${noteId}/`, noteData);
    return response.data.data;
  },

  // Delete note
  deleteNote: async (patientId: string, noteId: string): Promise<void> => {
    await api.delete(`/api/patients/${patientId}/notes/${noteId}/`);
  },

  // Get signed URL for file download
  getSignedUrl: async (filePath: string): Promise<string> => {
    try {
      const response = await api.get(`/api/utils/signed-url/?file_path=${encodeURIComponent(filePath)}`);
      return response.data.data.signed_url;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return filePath; // Fallback to original path
    }
  },

  // ===== CONSULTATIONS APIs (8 endpoints) =====
  
  // Get patient consultations
  getPatientConsultations: async (patientId?: string, params?: any): Promise<{ consultations: Consultation[]; pagination: { count: number; next: string | null; previous: string | null } }> => {
    try {
      // Use the patient-specific endpoint
      const url = '/api/consultations/patient/consultations/';
      const response = await api.get(url, { params });
      
      console.log('Patient consultations API response:', response);
      console.log('Response data structure:', response.data);
      
      // Handle Django REST Framework paginated response structure
      // Response structure: { count, next, previous, results: [...] }
      if (response && response.data && response.data.results && Array.isArray(response.data.results)) {
        console.log('Using paginated response structure');
        return {
          consultations: response.data.results,
          pagination: {
            count: response.data.count || 0,
            next: response.data.next,
            previous: response.data.previous
          }
        };
      }
      
      // Handle direct data response (non-paginated)
      if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('Using direct data response structure');
        return {
          consultations: response.data.data,
          pagination: { count: response.data.data.length, next: null, previous: null }
        };
      }
      
      // Fallback: if response.data exists and is an array
      if (response && response.data && Array.isArray(response.data)) {
        console.log('Using fallback array response structure');
        return {
          consultations: response.data,
          pagination: { count: response.data.length, next: null, previous: null }
        };
      }
      
      // Fallback: if response is directly an array
      if (response && Array.isArray(response)) {
        return {
          consultations: response,
          pagination: { count: response.length, next: null, previous: null }
        };
      }
      
      // Return empty array if no data
      return { consultations: [], pagination: { count: 0, next: null, previous: null } };
    } catch (error) {
      console.error('Error fetching consultations:', error);
      return { consultations: [], pagination: { count: 0, next: null, previous: null } };
    }
  },

  // Create consultation
  createConsultation: async (consultationData: Partial<Consultation>): Promise<Consultation> => {
    const response = await api.post<ApiResponse<Consultation>>('/api/consultations/', consultationData);
    return response.data.data;
  },

  // Get consultation details
  getConsultation: async (consultationId: string): Promise<Consultation> => {
    const response = await api.get<ApiResponse<Consultation>>(`/api/consultations/${consultationId}/`);
    return response.data.data;
  },

  // Update consultation
  updateConsultation: async (consultationId: string, consultationData: Partial<Consultation>): Promise<Consultation> => {
    const response = await api.patch<ApiResponse<Consultation>>(`/api/consultations/${consultationId}/`, consultationData);
    return response.data.data;
  },

  // Partial update consultation
  partialUpdateConsultation: async (consultationId: string, consultationData: Partial<Consultation>): Promise<Consultation> => {
    const response = await api.patch<ApiResponse<Consultation>>(`/api/consultations/${consultationId}/`, consultationData);
    return response.data.data;
  },

  // Cancel consultation
  cancelConsultation: async (consultationId: string): Promise<void> => {
    await api.delete(`/api/consultations/${consultationId}/`);
  },

  // Search consultations
  searchConsultations: async (searchParams: any): Promise<PaginatedResponse<Consultation>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Consultation>>>('/api/consultations/search/', { params: searchParams });
    return response.data.data;
  },

  // Get consultation statistics
  getConsultationStats: async (): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/api/consultations/stats/');
    return response.data.data;
  },

  // ===== PRESCRIPTIONS APIs (3 endpoints) =====
  
  // Get patient prescriptions
  getPatientPrescriptions: async (params?: any): Promise<Prescription[]> => {
    try {
      const response = await api.get('/api/prescriptions/', { params });
      
      // Handle paginated response (direct format from DRF)
      if (response.data && response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      
      // Handle wrapped response (non-paginated)
      if (response.data && response.data.data && response.data.data.results) {
        return response.data.data.results;
      }
      
      // Handle direct array response
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Return empty array if no data
      return [];
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      return [];
    }
  },

  // Get consultation prescriptions
  getConsultationPrescriptions: async (consultationId: string): Promise<Prescription[]> => {
    try {
      const response = await api.get<ApiResponse<Prescription>>(
        `/api/consultations/${consultationId}/prescription/`
      );
      
      // The backend returns a single prescription object, not an array
      if (response.data && response.data.data) {
        return [response.data.data]; // Wrap in array for consistency
      }
      
      // Return empty array if no data
      return [];
    } catch (error) {
      console.error('Error fetching consultation prescriptions:', error);
      return [];
    }
  },

  // Download prescription PDF
  downloadPrescriptionPDF: async (prescriptionId: string, version: string | number = 'latest'): Promise<{ download_url: string; filename: string }> => {
    try {
      const response = await api.get(`/api/prescriptions/${prescriptionId}/pdf/${version}/`);
      return response.data.data;
    } catch (error) {
      console.error('Error downloading prescription PDF:', error);
      throw error;
    }
  },

  // Auto-complete overdue consultations
  autoCompleteOverdueConsultations: async (hoursOverdue: number = 1, statusFilter: string = 'both'): Promise<any> => {
    try {
      const response = await api.post('/api/consultations/patient/consultations/', {
        hours_overdue: hoursOverdue,
        status_filter: statusFilter
      });
      return response.data;
    } catch (error) {
      console.error('Error auto-completing overdue consultations:', error);
      throw error;
    }
  },

  // Get prescription medications
  getPrescriptionMedications: async (prescriptionId: string): Promise<Medication[]> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Medication>>>(
      `/api/prescriptions/${prescriptionId}/medications/`
    );
    return response.data.data.results;
  },

  // ===== PAYMENTS APIs (3 endpoints) =====
  
  // Get patient payments
  getPatientPayments: async (params?: any): Promise<any[]> => {
    try {
      const response = await api.get('/api/payments/patient/payments/', { params });
      
      // Handle paginated response (direct format from DRF)
      if (response.data && response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      
      // Handle wrapped response (non-paginated)
      if (response.data && response.data.data && response.data.data.results) {
        return response.data.data.results;
      }
      
      // Handle direct array response
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Return empty array if no data
      return [];
    } catch (error) {
      console.error('Error fetching patient payments:', error);
      return [];
    }
  },

  // Create payment
  createPayment: async (paymentData: any): Promise<any> => {
    const response = await api.post<ApiResponse<any>>('/api/payments/', paymentData);
    return response.data.data;
  },

  // Get payment details
  getPayment: async (paymentId: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(`/api/payments/${paymentId}/`);
    return response.data.data;
  },

  // ===== NOTIFICATIONS APIs (2 endpoints) =====
  
  // Get patient notifications
  getPatientNotifications: async (params?: any): Promise<any[]> => {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<any>>>('/api/notifications/', { params });
      
      // Check if response has the expected structure
      if (response.data && response.data.data && response.data.data.results) {
        return response.data.data.results;
      }
      
      // If data structure is different, try direct results
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Return empty array if no data
      return [];
    } catch (error) {
      console.error('Error fetching patient notifications:', error);
      return [];
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId: string): Promise<any> => {
    const response = await api.put<ApiResponse<any>>(`/api/notifications/${notificationId}/`, { is_read: true });
    return response.data.data;
  },

  // ===== ANALYTICS APIs (1 endpoint) =====
  
  // Get patient analytics
  getPatientAnalytics: async (params?: any): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/api/analytics/patient/', { params });
    return response.data.data;
  },


};

// --- Patient Interfaces ---
export interface Patient {
  id: string;
  user: string;
  user_name: string;
  user_phone: string;
  user_email: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  allergies: string;
  chronic_conditions: string[];
  current_medications: string[];
  insurance_provider: string;
  insurance_policy_number: string;
  insurance_expiry: string;
  preferred_language: string;
  medical_history: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  created_at: string;
  updated_at: string;
  age: number;
  total_consultations?: number;
  last_consultation_date?: string;
}

export interface PatientFilters {
  search?: string;
  gender?: string;
  blood_group?: string;
  age_min?: number;
  age_max?: number;
  city?: string;
  state?: string;
  page?: number;
  page_size?: number;
}

export interface CreatePatientData {
  blood_group?: string;
  allergies?: string;
  chronic_conditions?: string[];
  current_medications?: string[];
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_expiry?: string;
  preferred_language?: string;
}

// --- SuperAdmin Patient API ---
export const superAdminPatientApi = {
  getPatients: async (filters: PatientFilters = {}): Promise<{ results: Patient[]; count: number }> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, value.toString());
      }
    });
    const response = await api.get(`/api/patients/?${params.toString()}`);
    return response.data;
  },
  getPatient: async (id: string): Promise<Patient> => {
    const response = await api.get(`/api/patients/${id}/`);
    return response.data.data || response.data;
  },
  createPatient: async (data: CreatePatientData): Promise<Patient> => {
    const response = await api.post(`/api/patients/`, data);
    return response.data.data || response.data;
  },
  updatePatient: async (id: string, data: Partial<CreatePatientData>): Promise<Patient> => {
    const response = await api.put(`/api/patients/${id}/`, data);
    return response.data.data || response.data;
  },
};

// Admin Patient Management API functions
export interface CreatePatientUserData {
  phone: string;
  name: string;
  email?: string;
  password?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  allergies?: string;
  medical_history?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

export interface CreatePatientProfileData {
  blood_group?: string;
  allergies?: string;
  chronic_conditions?: string[];
  current_medications?: string[];
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_expiry?: string;
  preferred_language?: string;
}

export interface PatientListResponse {
  results: PatientProfile[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface PatientStats {
  total_patients: number;
  new_patients_this_month: number;
  active_patients: number;
  gender_distribution: Record<string, number>;
  age_distribution: Record<string, number>;
  blood_group_distribution: Record<string, number>;
  top_cities: Array<{ city: string; count: number }>;
  consultation_stats: Record<string, number>;
}

export const adminPatientApi = {
  // Create patient account and profile in one call (Admin only)
  createPatient: async (data: CreatePatientUserData & CreatePatientProfileData): Promise<{
    user_id: string;
    phone: string;
    name: string;
    email: string;
    role: string;
    password: string;
    patient_profile: string | null;
  }> => {
    const response = await api.post<ApiResponse<{
      user_id: string;
      phone: string;
      name: string;
      email: string;
      role: string;
      password: string;
      patient_profile: string | null;
    }>>('/api/auth/admin/users/', {
      ...data,
      role: 'patient',
    });
    return response.data.data;
  },

  // List all patients (Admin only)
  getPatients: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    gender?: string;
    blood_group?: string;
    age_min?: number;
    age_max?: number;
    city?: string;
    state?: string;
    is_active?: boolean;
    ordering?: string;
  }): Promise<PatientListResponse> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    // Return the response as { count, next, previous, results }
    const response = await api.get(`/api/patients/?${queryParams.toString()}`);
    return response.data;
  },

  // Get patient details by ID (Admin only)
  getPatient: async (patientId: string): Promise<PatientProfile> => {
    const response = await api.get<ApiResponse<PatientProfile>>(`/api/patients/${patientId}/`);
    return response.data.data;
  },

  // Update patient user account (Admin only)
  updatePatientUser: async (patientId: string, userData: Partial<CreatePatientUserData>): Promise<UserProfile> => {
    const response = await api.put<ApiResponse<UserProfile>>(`/api/auth/admin/users/${patientId}/`, userData);
    return response.data.data;
  },

  // Update patient profile (Admin only)
  updatePatientProfile: async (patientId: string, profileData: Partial<CreatePatientProfileData>): Promise<PatientProfile> => {
    const response = await api.put<ApiResponse<PatientProfile>>(`/api/patients/${patientId}/`, profileData);
    return response.data.data;
  },

  // Delete/deactivate patient (Admin only)
  deletePatient: async (patientId: string): Promise<{
    patient_id: string;
    user_id: string;
    status: string;
  }> => {
    const response = await api.delete<ApiResponse<{
      patient_id: string;
      user_id: string;
      status: string;
    }>>(`/api/auth/admin/users/${patientId}/`);
    return response.data.data;
  },

  // Search patients with advanced filters (Admin only)
  searchPatients: async (params: {
    query?: string;
    gender?: string;
    blood_group?: string;
    age_min?: number;
    age_max?: number;
    city?: string;
    state?: string;
  }): Promise<PatientProfile[]> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await api.get<ApiResponse<PatientProfile[]>>(`/api/patients/search/?${queryParams.toString()}`);
    return response.data.data;
  },

  // Get patient statistics (Admin only)
  getPatientStats: async (): Promise<PatientStats> => {
    const response = await api.get<ApiResponse<PatientStats>>('/api/patients/stats/');
    return response.data.data;
  },

  // Create medical record for patient (Admin only)
  createMedicalRecord: async (patientId: string, recordData: {
    record_type: string;
    title: string;
    description: string;
    date_recorded: string;
    document?: File;
  }): Promise<MedicalRecord> => {
    const formData = new FormData();
    Object.entries(recordData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'document' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await api.post<ApiResponse<MedicalRecord>>(
      `/api/patients/${patientId}/medical-records/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  // Upload patient document (Admin only)
  uploadPatientDocument: async (patientId: string, documentData: {
    document_type: string;
    title: string;
    description?: string;
    file: File;
  }): Promise<PatientDocument> => {
    const formData = new FormData();
    Object.entries(documentData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'file' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await api.post<ApiResponse<PatientDocument>>(
      `/api/patients/${patientId}/documents/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  // Create patient note (Admin only)
  createPatientNote: async (patientId: string, noteData: {
    note: string;
    is_private?: boolean;
  }): Promise<PatientNote> => {
    const response = await api.post<ApiResponse<PatientNote>>(
      `/api/patients/${patientId}/notes/`,
      noteData
    );
    return response.data.data;
  },

  // Get patient medical records (Admin only)
  getPatientMedicalRecords: async (patientId: string, params?: {
    page?: number;
    page_size?: number;
    record_type?: string;
    search?: string;
  }): Promise<MedicalRecord[]> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get<ApiResponse<MedicalRecord[]>>(
      `/api/patients/${patientId}/medical-records/?${queryParams.toString()}`
    );
    return response.data.data;
  },



  // Get patient notes (Admin only)
  getPatientNotes: async (patientId: string, params?: {
    page?: number;
    page_size?: number;
    search?: string;
  }): Promise<PatientNote[]> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get<ApiResponse<PatientNote[]>>(
      `/api/patients/${patientId}/notes/?${queryParams.toString()}`
    );
    return response.data.data;
  },

  // Delete medical record (Admin only)
  deleteMedicalRecord: async (patientId: string, recordId: number): Promise<{ medical_record_id: string; status: string }> => {
    const response = await api.delete<ApiResponse<{ medical_record_id: string; status: string }>>(
      `/api/patients/${patientId}/medical-records/${recordId}/`
    );
    return response.data.data;
  },

  // Delete patient document (Admin only)
  deletePatientDocument: async (patientId: string, documentId: number): Promise<{ document_id: string; status: string }> => {
    const response = await api.delete<ApiResponse<{ document_id: string; status: string }>>(
      `/api/patients/${patientId}/documents/${documentId}/`
    );
    return response.data.data;
  },

  // Delete patient note (Admin only)
  deletePatientNote: async (patientId: string, noteId: number): Promise<{ note_id: string; status: string }> => {
    const response = await api.delete<ApiResponse<{ note_id: string; status: string }>>(
      `/api/patients/${patientId}/notes/${noteId}/`
    );
    return response.data.data;
  },

  // Get patient documents (Admin only)
  getPatientDocuments: async (patientId: string, params?: {
    page?: number;
    page_size?: number;
    document_type?: string;
    is_verified?: boolean;
  }): Promise<PatientDocument[]> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get<ApiResponse<PatientDocument[]>>(
      `/api/patients/${patientId}/documents/?${queryParams.toString()}`
    );
    return response.data.data;
  },

  // Admin OTP verification for patient access
  sendAdminOTP: async (patientId: string): Promise<{
    patient_id: string;
    patient_name: string;
    expires_in: number;
    otp_code?: string; // Only for testing
  }> => {
    const response = await api.post<ApiResponse<{
      patient_id: string;
      patient_name: string;
      expires_in: number;
      otp_code?: string;
    }>>('/api/auth/admin/patient-access-otp/', {
      action: 'send',
      patient_id: patientId
    });
    return response.data.data;
  },

  verifyAdminOTP: async (patientId: string, otp: string): Promise<{
    patient_id: string;
    patient_name: string;
    access_granted: boolean;
    access_type: string;
    expires_at: string;
  }> => {
    const response = await api.post<ApiResponse<{
      patient_id: string;
      patient_name: string;
      access_granted: boolean;
      access_type: string;
      expires_at: string;
    }>>('/api/auth/admin/patient-access-otp/', {
      action: 'verify',
      patient_id: patientId,
      otp: otp
    });
    return response.data.data;
  },

};

// User Session interface
export interface Notification {
  id: string;
  type: 'critical' | 'important' | 'info' | 'success';
  title: string;
  message: string;
  category: 'system' | 'doctors' | 'clinics' | 'payments' | 'analytics' | 'security';
  timestamp: string;
  isRead: boolean;
  actionRequired?: boolean;
  actionUrl?: string;
  metadata?: {
    doctorId?: string;
    clinicId?: string;
    paymentId?: string;
    userId?: string;
    amount?: number;
    errorCode?: string;
  };
}

export interface UserSession {
  id: string;
  user: string;
  refresh_token: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClinicAnalytics {
  overview: {
    total_clinics: number;
    active_clinics: number;
    verified_clinics: number;
    online_clinics: number;
    verification_rate: number;
    activation_rate: number;
    online_rate: number;
  };
  growth: {
    new_clinics_7d: number;
    new_clinics_30d: number;
    new_clinics_90d: number;
    growth_rate_7d: number;
    growth_rate_30d: number;
    growth_rate_90d: number;
  };
  geographic: {
    cities: Array<{ city: string; count: number }>;
    states: Array<{ state: string; count: number }>;
  };
  specializations: {
    top_specialties: Array<{ specialty: string; count: number }>;
    total_specialties: number;
  };
  trends: {
    monthly_growth: Array<{ month: string; count: number; period: string }>;
    last_updated: string;
  };
  recent_activity: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    created_at: string;
    is_verified: boolean;
    is_active: boolean;
  }>;
}

// SuperAdmin Analytics Interfaces
export interface SuperAdminOverviewStats {
  total_clinics: { value: number; change: string };
  active_clinics: { value: number; change: string };
  total_doctors: { value: number; change: string };
  active_doctors: { value: number; change: string };
  total_admins: { value: number; change: string };
  total_patients: { value: number; change: string };
  total_consultations: { value: number; change: string };
  total_revenue: { value: number; change: string };
}

export interface SuperAdminAnalytics {
  overview: SuperAdminOverviewStats;
  revenue_analytics: {
    total_revenue: number;
    revenue_breakdown: Record<string, number>;
    growth_rate: number;
    top_revenue_sources: Array<{
      doctor_name: string;
      total_revenue: number;
    }>;
  };
  consultation_analytics: {
    total_consultations: number;
    completed_consultations: number;
    cancelled_consultations: number;
    average_duration: number;
    consultation_types: Record<string, number>;
    peak_hours: Array<{ hour: number; count: number }>;
    doctor_performance: Array<{
      doctor_name: string;
      total_consultations: number;
      avg_rating: number;
    }>;
  };
  patient_analytics: {
    total_patients: number;
    new_patients_this_month: number;
    active_patients: number;
    gender_distribution: Record<string, number>;
    age_distribution: Record<string, number>;
    top_cities: Array<{ city: string; count: number }>;
  };
  clinic_analytics: {
    total_clinics: number;
    active_clinics: number;
    verified_clinics: number;
    top_clinics: Array<{
      id: string;
      name: string;
      consultations: number;
      revenue: number;
    }>;
  };
  doctor_analytics: {
    total_doctors: number;
    active_doctors: number;
    verified_doctors: number;
    top_doctors: Array<{
      doctor_name: string;
      consultations: number;
      revenue: number;
      rating: number;
    }>;
  };
}

// Notification API functions - Commented out for now
// export const notificationApi = {
//   // Get all notifications
//   getNotifications: async (params?: {
//     page?: number;
//     page_size?: number;
//     category?: string;
//     type?: string;
//     is_read?: boolean;
//   }): Promise<PaginatedResponse<Notification>> => {
//     const queryParams = new URLSearchParams();
//     if (params?.page) queryParams.append('page', params.page.toString());
//     if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
//     if (params?.category) queryParams.append('category', params.category);
//     if (params?.type) queryParams.append('type', params.type);
//     if (params?.is_read !== undefined) queryParams.append('is_read', params.is_read.toString());
//     
//     const response = await api.get<ApiResponse<PaginatedResponse<Notification>>>(`/api/notifications/?${queryParams}`);
//     return response.data.data;
//   },

//   // Mark notification as read
//   markAsRead: async (notificationId: string): Promise<void> => {
//     await api.patch<ApiResponse<void>>(`/api/notifications/${notificationId}/mark-read/`);
//   },

//   // Mark all notifications as read
//   markAllAsRead: async (): Promise<void> => {
//     await api.post<ApiResponse<void>>('/api/notifications/mark-all-read/');
//   },

//   // Delete notification
//   deleteNotification: async (notificationId: string): Promise<void> => {
//     await api.delete<ApiResponse<void>>(`/api/notifications/${notificationId}/`);
//   },

//   // Get notification stats
//   getNotificationStats: async (): Promise<{
//     total: number;
//     unread: number;
//     critical: number;
//     action_required: number;
//   }> => {
//     const response = await api.get<ApiResponse<{
//       total: number;
//       unread: number;
//       critical: number;
//       action_required: number;
//     }>>('/api/notifications/stats/');
//     return response.data.data;
//   },
// };

// SuperAdmin API service functions
export const superAdminApi = {
  // Analytics
  getAnalytics: async (): Promise<ClinicAnalytics> => {
    const response = await api.get<ApiResponse<ClinicAnalytics>>('/api/eclinic/analytics/');
    return response.data.data;
  },

  // Get SuperAdmin overview statistics
  getOverviewStats: async (): Promise<SuperAdminOverviewStats> => {
    const response = await api.get<ApiResponse<SuperAdminOverviewStats>>('/api/analytics/superadmin/overview/');
    return response.data.data;
  },

  // Get comprehensive SuperAdmin analytics
  getComprehensiveAnalytics: async (): Promise<SuperAdminAnalytics> => {
    const response = await api.get<ApiResponse<SuperAdminAnalytics>>('/api/analytics/superadmin/comprehensive/');
    return response.data.data;
  },

  // Get revenue analytics
  getRevenueAnalytics: async (): Promise<SuperAdminAnalytics['revenue_analytics']> => {
    const response = await api.get<ApiResponse<SuperAdminAnalytics['revenue_analytics']>>('/api/analytics/superadmin/revenue/');
    return response.data.data;
  },

  // Get consultation analytics
  getConsultationAnalytics: async (): Promise<SuperAdminAnalytics['consultation_analytics']> => {
    const response = await api.get<ApiResponse<SuperAdminAnalytics['consultation_analytics']>>('/api/analytics/superadmin/consultations/');
    return response.data.data;
  },

  // Get patient analytics
  getPatientAnalytics: async (): Promise<SuperAdminAnalytics['patient_analytics']> => {
    const response = await api.get<ApiResponse<SuperAdminAnalytics['patient_analytics']>>('/api/analytics/superadmin/patients/');
    return response.data.data;
  },

  // Get clinic analytics
  getClinicAnalytics: async (): Promise<SuperAdminAnalytics['clinic_analytics']> => {
    const response = await api.get<ApiResponse<SuperAdminAnalytics['clinic_analytics']>>('/api/analytics/superadmin/clinics/');
    return response.data.data;
  },

  // Get doctor analytics
  getDoctorAnalytics: async (): Promise<SuperAdminAnalytics['doctor_analytics']> => {
    const response = await api.get<ApiResponse<SuperAdminAnalytics['doctor_analytics']>>('/api/analytics/superadmin/doctors/');
    return response.data.data;
  },

  // Get real-time metrics
  getRealTimeMetrics: async (): Promise<{
    active_users: number;
    ongoing_consultations: number;
    pending_payments: number;
    system_status: string;
    api_calls_per_minute: number;
    error_rate_last_hour: number;
    database_connections: number;
    queue_size: number;
  }> => {
    const response = await api.get<ApiResponse<{
      active_users: number;
      ongoing_consultations: number;
      pending_payments: number;
      system_status: string;
      api_calls_per_minute: number;
      error_rate_last_hour: number;
      database_connections: number;
      queue_size: number;
    }>>('/api/analytics/realtime/');
    return response.data.data;
  },

  // Get current SuperAdmin profile
  getCurrentUserProfile: async (): Promise<UserProfile> => {
    const response = await api.get<ApiResponse<UserProfile>>('/api/auth/profile/');
    return response.data.data;
  },

  // Update SuperAdmin profile
  updateUserProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put<ApiResponse<UserProfile>>('/api/auth/profile/', profileData);
    return response.data.data;
  },

  // Change password
  changePassword: async (passwordData: { old_password: string; new_password: string }): Promise<void> => {
    await api.post('/api/auth/change-password/', passwordData);
  },

  // Get user sessions
  getUserSessions: async (): Promise<UserSession[]> => {
    const response = await api.get<ApiResponse<UserSession[]>>('/api/auth/sessions/');
    return response.data.data;
  },

  // Terminate session
  terminateSession: async (sessionId: string): Promise<void> => {
    await api.delete('/api/auth/sessions/', { data: { session_id: sessionId } });
  },

  // Logout
  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/api/auth/logout/', { refresh: refreshToken });
  },

  // E-Clinic Management
  // Get all e-clinics
  getEClinics: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    city?: string;
    state?: string;
    is_verified?: string;
    is_active?: string;
    ordering?: string;
  }): Promise<{ results: EClinic[]; count: number }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/api/eclinic/?${queryParams.toString()}`);
    console.log('Raw getEClinics response:', response.data);
    
    // Handle different response formats
    if (response.data && response.data.results) {
      // If response is in paginated format
      return response.data;
    } else if (Array.isArray(response.data)) {
      // If response is direct array
      return { results: response.data, count: response.data.length };
    } else {
      throw new Error('Invalid response format from getEClinics API');
    }
  },

  // Get clinic statistics for dashboard
  getClinicStats: async (): Promise<{
    total_clinics: { value: number; change: string };
    active_clinics: { value: number; change: string };
    online_consultations: { value: number; change: string };
    inactive_clinics: { value: number; change: string };
  }> => {
    const response = await api.get('/api/eclinic/stats/');
    return response.data.data;
  },

  // Get single e-clinic
  getEClinic: async (clinicId: string): Promise<EClinic> => {
    const response = await api.get(`/api/eclinic/${clinicId}/`);
    console.log('Raw getEClinic response:', response.data);
    
    // Handle different response formats
    if (response.data && response.data.data) {
      // If response is wrapped in ApiResponse format
      return response.data.data;
    } else if (response.data) {
      // If response is direct clinic data
      return response.data;
    } else {
      throw new Error('Invalid response format from API');
    }
  },

  // Create new e-clinic
  createEClinic: async (clinicData: CreateEClinicData | FormData): Promise<EClinic> => {
    try {
      const config = clinicData instanceof FormData ? {
        headers: { 'Content-Type': 'multipart/form-data' }
      } : {};
      const response = await api.post('/api/eclinic/', clinicData, config);
      console.log('Raw API Response:', response);
      
      // Handle different response formats
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  // Update e-clinic
  updateEClinic: async (clinicId: string, clinicData: Partial<CreateEClinicData> | FormData): Promise<EClinic> => {
    try {
      const config = clinicData instanceof FormData ? {
        headers: { 'Content-Type': 'multipart/form-data' }
      } : {};
      const response = await api.put(`/api/eclinic/${clinicId}/`, clinicData, config);
      console.log('Raw API Response:', response);
      
      // Handle different response formats
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  // Delete e-clinic
  deleteEClinic: async (clinicId: string): Promise<void> => {
    await api.delete(`/api/eclinic/${clinicId}/`);
  },

  // Get nearby clinics
  getNearbyClinics: async (params: {
    latitude: number;
    longitude: number;
    radius?: number; // in km
    page?: number;
    page_size?: number;
  }): Promise<{ results: EClinic[]; count: number }> => {
    const queryParams = new URLSearchParams();
    queryParams.append('latitude', params.latitude.toString());
    queryParams.append('longitude', params.longitude.toString());
    if (params.radius) queryParams.append('radius', params.radius.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    
    const response = await api.get(`/api/eclinic/nearby/?${queryParams.toString()}`);
    return response.data;
  },

  // Search clinics
  searchEClinics: async (params: {
    query: string;
    page?: number;
    page_size?: number;
  }): Promise<{ results: EClinic[]; count: number }> => {
    const queryParams = new URLSearchParams();
    queryParams.append('q', params.query);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    
    const response = await api.get(`/api/eclinic/search/?${queryParams.toString()}`);
    return response.data;
  },

  // Get admin users for e-clinic assignment
  getAdminUsers: async (): Promise<UserProfile[]> => {
    const response = await api.get('/api/auth/admin/users/?type=admins');
    return response.data.data || [];
  }
};

// Public API functions (no authentication required)
export const publicApi = {
  // Get public e-clinics
  getPublicEClinics: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    is_active?: string;
    is_verified?: string;
    city?: string;
    state?: string;
  }): Promise<{ results: EClinic[]; count: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active) queryParams.append('is_active', params.is_active);
    if (params?.is_verified) queryParams.append('is_verified', params.is_verified);
    if (params?.city) queryParams.append('city', params.city);
    if (params?.state) queryParams.append('state', params.state);
    
    const response = await api.get(`/api/eclinic/public/?${queryParams.toString()}`);
    return response.data.data;
  },

  // Public patient registration (no authentication required)
  registerPatient: async (patientData: PublicPatientRegistrationData): Promise<PublicPatientRegistrationResponse> => {
    const response = await api.post<ApiResponse<PublicPatientRegistrationResponse>>('/api/auth/public/register/', patientData);
    return response.data.data;
  }
};

// Admin Analytics API
export interface AdminDashboardStats {
  consultations_today: number;
  total_consultations: number;
  revenue_today: number;
  total_revenue: number;
  patients_today: number;
  total_patients: number;
  doctors_online: number;
  active_doctors: number;
  [key: string]: number;
}

// Enhanced Analytics Interfaces
export interface DetailedAnalytics {
  overview: {
    total_clinics: number;
    active_clinics: number;
    total_doctors: number;
    active_doctors: number;
    total_patients: number;
    total_consultations: number;
    total_revenue: number;
    success_rate: number;
  };
  today: {
    consultations: number;
    new_patients: number;
    revenue: number;
    completed_consultations: number;
    cancelled_consultations: number;
  };
  this_month: {
    consultations: number;
    new_patients: number;
    revenue: number;
    growth_rate: number;
  };
  clinic_performance: Array<{
    id: string;
    name: string;
    consultations: number;
    revenue: number;
    success_rate: number;
    active_doctors: number;
  }>;
  consultation_analytics: {
    by_status: Record<string, number>;
    by_type: Record<string, number>;
    peak_hours: Array<{ hour: number; count: number }>;
    daily_trends: Array<{ date: string; consultations: number; revenue: number }>;
  };
  payment_analytics: {
    total_payments: number;
    successful_payments: number;
    failed_payments: number;
    pending_payments: number;
    average_transaction_value: number;
    payment_methods: Record<string, number>;
    revenue_trends: Array<{ date: string; revenue: number }>;
  };
  doctor_performance: Array<{
    id: string;
    name: string;
    specialization: string;
    consultations: number;
    revenue: number;
    rating: number;
    success_rate: number;
  }>;
  patient_analytics: {
    total_patients: number;
    new_patients_this_month: number;
    active_patients: number;
    gender_distribution: Record<string, number>;
    age_distribution: Record<string, number>;
    top_cities: Array<{ city: string; count: number }>;
  };
}

export const adminAnalyticsApi = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await api.get('/api/analytics/dashboard/');
    return response.data.data;
  },

  getDetailedAnalytics: async (): Promise<DetailedAnalytics> => {
    const response = await api.get('/api/analytics/detailed/');
    return response.data.data;
  },

  getClinicAnalytics: async (): Promise<ClinicAnalytics> => {
    const response = await api.get('/api/analytics/clinics/');
    return response.data.data;
  },

  getConsultationAnalytics: async (params?: {
    start_date?: string;
    end_date?: string;
    clinic_id?: string;
  }): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/api/analytics/consultations/?${queryParams.toString()}`);
    return response.data.data;
  },

  getPaymentAnalytics: async (params?: {
    start_date?: string;
    end_date?: string;
    status?: string;
  }): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/api/analytics/payments/?${queryParams.toString()}`);
    return response.data.data;
  },

  getDoctorPerformance: async (): Promise<DoctorPerformanceStats[]> => {
    const response = await api.get('/api/analytics/doctors/performance/');
    return response.data.data;
  }
};

// Admin Consultation API
export const adminConsultationApi = {
  getTodaysConsultations: async (): Promise<Consultation[]> => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const response = await api.get(`/api/consultations/?scheduled_date=${today}`);
    
    // Handle different response structures
    if (response.data && response.data.data && response.data.data.results) {
      return response.data.data.results;
    } else if (response.data && response.data.results) {
      return response.data.results;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn('Unexpected response structure for getTodaysConsultations:', response.data);
      return [];
    }
  },
  
  // Fetch all consultations using new SuperAdmin endpoint (paginated with advanced filtering)
  getAllConsultations: async (params?: { 
    page?: number; 
    page_size?: number; 
    search?: string; 
    status?: string; 
    payment_status?: string;
    clinic_id?: string;
    doctor_id?: string;
    start_date?: string;
    end_date?: string;
    ordering?: string;
  }): Promise<PaginatedResponse<Consultation>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && (typeof value !== 'string' || value !== '')) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/api/consultations/superadmin/management/?${queryParams.toString()}`);
    
    // Handle the new SuperAdmin endpoint response structure
    if (response.data && response.data.success && response.data.results) {
      return {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        results: response.data.results,
        page: response.data.page,
        page_size: response.data.page_size,
        total_pages: response.data.total_pages,
        has_next: response.data.has_next,
        has_previous: response.data.has_previous
      };
    } else {
      console.warn('Unexpected response structure for SuperAdmin getAllConsultations:', response.data);
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
        page: 1,
        page_size: 50,
        total_pages: 1,
        has_next: false,
        has_previous: false
      };
    }
  },

  // Fetch consultations for a specific clinic
  getClinicConsultations: async (clinicId: string, params?: { 
    page?: number; 
    page_size?: number; 
    search?: string; 
    status?: string; 
    consultation_type?: string;
    scheduled_date?: string;
    ordering?: string;
  }): Promise<PaginatedResponse<Consultation>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && (typeof value !== 'string' || value !== '')) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/api/consultations/clinic/${clinicId}/?${queryParams.toString()}`);
    
    // Handle the specific response structure from the API
    if (response.data && response.data.results && response.data.results.data && Array.isArray(response.data.results.data)) {
      // Structure: { count, next, previous, results: { success, data: [...], message, timestamp } }
      return {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        results: response.data.results.data
      };
    } else if (response.data && response.data.data && typeof response.data.data === 'object' && 'results' in response.data.data) {
      return response.data.data;
    } else if (response.data && 'results' in response.data) {
      return response.data;
    } else if (Array.isArray(response.data)) {
      // If response is a direct array, wrap it in paginated format
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data
      };
    } else {
      console.warn('Unexpected response structure for getClinicConsultations:', response.data);
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      };
    }
  },

  // Get single consultation
  getConsultation: async (consultationId: string): Promise<Consultation> => {
    const response = await api.get<ApiResponse<Consultation>>(`/api/consultations/${consultationId}/`);
    return response.data.data;
  },

  // Get consultation by ID (alias for getConsultation)
  getConsultationById: async (consultationId: string): Promise<Consultation> => {
    const response = await api.get<ApiResponse<Consultation>>(`/api/consultations/${consultationId}/`);
    return response.data.data;
  },

  // Get detailed consultation information with all related data
  getConsultationDetails: async (consultationId: string): Promise<ConsultationDetails> => {
    const response = await api.get<ApiResponse<ConsultationDetails>>(`/api/consultations/${consultationId}/`);
    return response.data.data;
  },

  // Get consultation vital signs
  getConsultationVitalSigns: async (consultationId: string): Promise<ConsultationVitalSigns> => {
    const response = await api.get<ApiResponse<ConsultationVitalSigns>>(`/api/consultations/${consultationId}/vital-signs/`);
    return response.data.data;
  },

  // Get consultation attachments/documents
  getConsultationAttachments: async (consultationId: string): Promise<ConsultationAttachment[]> => {
    const response = await api.get<ApiResponse<ConsultationAttachment[]>>(`/api/consultations/${consultationId}/documents/`);
    return response.data.data;
  },

  // Get consultation notes
  getConsultationNotes: async (consultationId: string): Promise<ConsultationNote[]> => {
    const response = await api.get<ApiResponse<ConsultationNote[]>>(`/api/consultations/${consultationId}/notes/`);
    return response.data.data;
  },

  // Get consultation diagnoses
  getConsultationDiagnoses: async (consultationId: string): Promise<ConsultationDiagnosis[]> => {
    const response = await api.get<ApiResponse<ConsultationDiagnosis[]>>(`/api/consultations/${consultationId}/diagnosis/`);
    return response.data.data;
  },

  // Create new consultation
  createConsultation: async (consultationData: {
    patient: string | number;
    doctor: string | number;
    consultation_type: string;
    scheduled_date: string;
    scheduled_time: string;
    duration: number | string;
    chief_complaint: string;
    symptoms?: string;
    consultation_fee?: number | string;
  }): Promise<Consultation> => {
    const response = await api.post<ApiResponse<Consultation>>('/api/consultations/', consultationData);
    return response.data.data;
  },

  // Update consultation
  updateConsultation: async (consultationId: string, consultationData: Partial<Consultation>): Promise<Consultation> => {
    const response = await api.patch<ApiResponse<Consultation>>(`/api/consultations/${consultationId}/`, consultationData);
    return response.data.data;
  },

  // Delete consultation
  deleteConsultation: async (consultationId: string): Promise<void> => {
    await api.delete(`/api/consultations/${consultationId}/`);
  },

  // Start consultation
  startConsultation: async (consultationId: string): Promise<Consultation> => {
    const response = await api.post<ApiResponse<Consultation>>(`/api/consultations/${consultationId}/start/`);
    return response.data.data;
  },

  // Complete consultation
  completeConsultation: async (consultationId: string): Promise<Consultation> => {
    const response = await api.post<ApiResponse<Consultation>>(`/api/consultations/${consultationId}/complete/`);
    return response.data.data;
  },

  // Cancel consultation
  cancelConsultation: async (consultationId: string, reason?: string): Promise<Consultation> => {
    const response = await api.post<ApiResponse<Consultation>>(`/api/consultations/${consultationId}/cancel/`, { reason });
    return response.data.data;
  },

  // Reschedule consultation
  rescheduleConsultation: async (consultationId: string, newDate: string, newTime: string): Promise<Consultation> => {
    const response = await api.post<ApiResponse<Consultation>>(`/api/consultations/${consultationId}/reschedule/`, {
      new_date: newDate,
      new_time: newTime
    });
    return response.data.data;
  },

  // Get consultation statistics
  getConsultationStats: async (): Promise<{
    total_consultations: number;
    scheduled_consultations: number;
    completed_consultations: number;
    cancelled_consultations: number;
    total_revenue: number;
    pending_revenue: number;
  }> => {
    const response = await api.get<ApiResponse<{
      total_consultations: number;
      scheduled_consultations: number;
      completed_consultations: number;
      cancelled_consultations: number;
      total_revenue: number;
      pending_revenue: number;
    }>>('/api/consultations/stats/');
    return response.data.data;
  },

  // Generate receipt for consultation
  generateReceipt: async (consultationId: string): Promise<{
    id: number;
    receipt_number: string;
    consultation_id: string;
    patient_name: string;
    doctor_name: string;
    clinic_name: string;
    amount: string;
    formatted_amount: string;
    payment_method: string;
    payment_status: string;
    issued_by: string;
    issued_by_name: string;
    issued_at: string;
    receipt_data: any;
  }> => {
    const response = await api.post<ApiResponse<{
      id: number;
      receipt_number: string;
      consultation_id: string;
      patient_name: string;
      doctor_name: string;
      clinic_name: string;
      amount: string;
      formatted_amount: string;
      payment_method: string;
      payment_status: string;
      issued_by: string;
      issued_by_name: string;
      issued_at: string;
      receipt_data: any;
    }>>(`/api/consultations/${consultationId}/receipt/`);
    return response.data.data;
  },

  // Get receipt for consultation
  getReceipt: async (consultationId: string): Promise<{
    id: number;
    receipt_number: string;
    consultation_id: string;
    patient_name: string;
    doctor_name: string;
    clinic_name: string;
    amount: string;
    formatted_amount: string;
    payment_method: string;
    payment_status: string;
    issued_by: string;
    issued_by_name: string;
    issued_at: string;
    receipt_data: any;
  }> => {
    const response = await api.get<ApiResponse<{
      id: number;
      receipt_number: string;
      consultation_id: string;
      patient_name: string;
      doctor_name: string;
      clinic_name: string;
      amount: string;
      formatted_amount: string;
      payment_method: string;
      payment_status: string;
      issued_by: string;
      issued_by_name: string;
      issued_at: string;
      receipt_data: any;
    }>>(`/api/consultations/${consultationId}/receipt/`);
    return response.data.data;
  },
};

// Payment Tracking APIs
export const paymentTrackingApi = {
  // Get comprehensive payment tracking data
  getPaymentTracking: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{
    overview: {
      total_payments: number;
      successful_payments: number;
      failed_payments: number;
      pending_payments: number;
      total_revenue: number;
      total_refunds: number;
      net_revenue: number;
      success_rate: number;
    };
    payment_method_breakdown: Array<{
      payment_method: string;
      count: number;
      total_amount: number;
    }>;
    daily_revenue: Array<{
      date: string;
      revenue: number;
      count: number;
    }>;
    top_revenue_sources: Array<{
      consultation__doctor__name: string;
      total_revenue: number;
      consultation_count: number;
    }>;
    recent_payments: Array<any>;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    const response = await api.get<ApiResponse<any>>(`/api/payments/tracking/?${queryParams}`);
    return response.data.data;
  },

  // Get payment history with filters
  getPaymentHistory: async (params?: {
    start_date?: string;
    end_date?: string;
    status?: string;
    payment_method?: string;
    min_amount?: number;
    max_amount?: number;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<any>> => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.payment_method) queryParams.append('payment_method', params.payment_method);
    if (params?.min_amount) queryParams.append('min_amount', params.min_amount.toString());
    if (params?.max_amount) queryParams.append('max_amount', params.max_amount.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    
    const response = await api.get<ApiResponse<PaginatedResponse<any>>>(`/api/payments/history/?${queryParams}`);
    return response.data.data;
  },

  // Get payment analytics
  getPaymentAnalytics: async (period?: 'week' | 'month' | 'quarter' | 'year'): Promise<{
    period: string;
    revenue_trends: Array<{
      date?: string;
      period?: string;
      revenue: number;
    }>;
    method_performance: Array<{
      payment_method: string;
      total_amount: number;
      count: number;
      success_rate: number;
    }>;
    top_doctors: Array<{
      consultation__doctor__name: string;
      total_revenue: number;
      consultation_count: number;
      avg_amount: number;
    }>;
    failure_analysis: Array<{
      payment_method: string;
      failure_count: number;
      total_attempts: number;
    }>;
    summary: {
      total_revenue: number;
      total_transactions: number;
      success_rate: number;
      avg_transaction_value: number;
    };
  }> => {
    const queryParams = new URLSearchParams();
    if (period) queryParams.append('period', period);
    
    const response = await api.get<ApiResponse<any>>(`/api/payments/analytics/?${queryParams}`);
    return response.data.data;
  },

  // Get payment receipt
  getPaymentReceipt: async (paymentId: string): Promise<{
    payment_id: string;
    receipt_number: string;
    patient_name: string;
    doctor_name: string;
    consultation_id: string;
    amount: number;
    currency: string;
    payment_method: string;
    status: string;
    description: string;
    created_at: string;
    completed_at: string;
    gateway_transaction_id: string;
    clinic_name: string;
  }> => {
    const response = await api.get<ApiResponse<any>>(`/api/payments/receipt/${paymentId}/`);
    return response.data.data;
  },

  // Get payment statistics
  getPaymentStats: async (): Promise<{
    total_payments: number;
    successful_payments: number;
    failed_payments: number;
    pending_payments: number;
    total_revenue: number;
    total_refunds: number;
    payment_method_distribution: Record<string, number>;
    monthly_revenue: Array<{
      month: string;
      revenue: number;
    }>;
    average_transaction_amount: number;
  }> => {
    const response = await api.get<ApiResponse<any>>('/api/payments/stats/');
    return response.data.data;
  },
};

// Doctor Analytics API
export interface DoctorPerformanceStats {
  id: number;
  doctor: number;
  doctor_name: string;
  date: string;
  total_consultations: number;
  completed_consultations: number;
  cancelled_consultations: number;
  no_show_consultations: number;
  total_revenue: string;
  avg_consultation_fee: string;
  avg_rating: string;
  total_reviews: number;
  avg_consultation_duration: string | null;
  on_time_percentage: string;
  new_patients: number;
  returning_patients: number;
  created_at: string;
  updated_at: string;
}

export interface DoctorEarnings {
  overview: {
    total_earnings: number;
    total_consultations: number;
    avg_per_consultation: number;
    earnings_growth: number;
    growth_type: 'positive' | 'negative';
  };
  monthly_breakdown: Array<{
    month: string;
    month_key: string;
    earnings: number;
    consultations: number;
    growth: number;
    growth_type: 'positive' | 'negative';
  }>;
  payment_status: {
    received_payments: number;
    pending_payments: number;
    processing_payments: number;
    next_payout_amount: number;
    next_payout_date: string;
  };
  payment_methods: Record<string, number>;
  recent_transactions: Array<{
    id: string;
    amount: number;
    payment_method: string;
    status: string;
    processed_at: string;
    patient_name: string;
    consultation_type: string;
  }>;
  period: {
    start_date: string;
    end_date: string;
    period_type: string;
  };
}

export const doctorAnalyticsApi = {
  // Get doctor performance statistics
  getDoctorPerformance: async (date?: string): Promise<DoctorPerformanceStats> => {
    const params = date ? { date } : {};
    return get<DoctorPerformanceStats>('/api/analytics/doctor-performance/', { params });
  },

  // Get doctor earnings analytics
  getDoctorEarnings: async (params?: {
    period?: 'week' | 'month' | 'year';
    start_date?: string;
    end_date?: string;
  }): Promise<DoctorEarnings> => {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    const response = await api.get(`/api/analytics/doctor/earnings/?${queryParams.toString()}`);
    
    // Handle the API response structure: { success: true, data: {...}, message: "...", timestamp: "..." }
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Fallback: return the response directly if it doesn't follow the expected structure
    return response.data;
  },
};

// Doctor API service functions
export interface CreateDoctorUserData {
  phone: string;
  name: string;
  email?: string;
  password?: string;
}

export interface CreateDoctorProfileData {
  license_number: string;
  qualification: string;
  specialization: string;
  sub_specialization?: string;
  consultation_fee: number;
  online_consultation_fee?: number;
  languages_spoken: string[];
  bio?: string;
  achievements?: string;
  consultation_duration?: number;
  is_online_consultation_available?: boolean;
  clinic_name?: string;
  clinic_address?: string;
  is_active?: boolean;
  date_of_birth?: string;
  date_of_anniversary?: string;
}

export interface DoctorStatus {
  id: number;
  doctor: number;
  doctor_name: string;
  doctor_email: string;
  doctor_specialization: string;
  doctor_profile_picture: string;
  is_online: boolean;
  is_logged_in: boolean;
  is_available: boolean;
  current_status: 'available' | 'consulting' | 'busy' | 'away' | 'offline' | 'break' | 'unavailable';
  status_display: string;
  is_active: boolean;
  last_activity: string;
  last_activity_formatted: string;
  last_login: string;
  last_login_formatted: string;
  current_consultation: any;
  current_consultation_info: any;
  status_updated_at: string;
  status_note: string;
  auto_away_threshold: number;
}

export interface DoctorProfile {
  id: number;
  user: string;
  user_name: string;
  user_phone: string;
  user_email: string;
  profile_picture?: string;
  signature_url?: string;
  license_number: string;
  qualification: string;
  specialization: string;
  sub_specialization?: string;
  experience_years: number;
  consultation_fee: number;
  online_consultation_fee?: number;
  languages_spoken: string[];
  bio?: string;
  achievements?: string;
  consultation_duration?: number;
  is_online_consultation_available?: boolean;
  clinic_name?: string;
  clinic_address?: string;
  is_verified: boolean;
  is_active: boolean;
  is_accepting_patients: boolean;
  rating: number;
  total_reviews: number;
  date_of_birth?: string;
  date_of_anniversary?: string;
  is_available?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicDoctorProfile {
  id: number;
  name: string;
  profile_picture?: string;
  specialization: string;
  sub_specialization?: string;
  experience_years: number;
  consultation_fee: number;
  online_consultation_fee?: number;
  languages_spoken: string[];
  bio?: string;
  rating: number;
  total_reviews: number;
  clinic_name?: string;
  clinic_address?: string;
  consultation_types: ('in-person' | 'video')[];
  is_online_consultation_available: boolean;
  consultation_duration?: number;
}

export const doctorApi = {
  // Public doctor listing (no authentication required)
  getPublicDoctors: async (params?: {
    search?: string;
    specialization?: string;
    pincode?: string;
    city?: string;
    min_experience?: number;
    max_experience?: number;
    min_fee?: number;
    max_fee?: number;
    rating_min?: number;
    consultation_type?: 'in_person' | 'online' | 'both';
    page?: number;
    page_size?: number;
    ordering?: 'rating' | 'experience' | 'fee' | 'name';
  }): Promise<PaginatedResponse<PublicDoctorProfile[]>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.search) queryParams.append('search', params.search);
      if (params.specialization) queryParams.append('specialization', params.specialization);
      if (params.pincode) queryParams.append('pincode', params.pincode);
      if (params.city) queryParams.append('city', params.city);
      if (params.min_experience) queryParams.append('min_experience', params.min_experience.toString());
      if (params.max_experience) queryParams.append('max_experience', params.max_experience.toString());
      if (params.min_fee) queryParams.append('min_fee', params.min_fee.toString());
      if (params.max_fee) queryParams.append('max_fee', params.max_fee.toString());
      if (params.rating_min) queryParams.append('rating_min', params.rating_min.toString());
      if (params.consultation_type) queryParams.append('consultation_type', params.consultation_type);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.page_size) queryParams.append('page_size', params.page_size.toString());
      if (params.ordering) queryParams.append('ordering', params.ordering);
    }
    const response = await api.get(`/api/doctors/public/?${queryParams.toString()}`);
    return response.data.data;
  },

  // Create doctor account and profile in one call (SuperAdmin only)
  createDoctor: async (data: FormData): Promise<{
    doctor_profile: DoctorProfile;
    user_account: {
      user_id: string;
      phone: string;
      name: string;
      email: string;
      role: string;
      password: string;
    };
  }> => {
    const response = await api.post<ApiResponse<{
      doctor_profile: DoctorProfile;
      user_account: {
        user_id: string;
        phone: string;
        name: string;
        email: string;
        role: string;
        password: string;
      };
    }>>('/api/doctors/superadmin/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Create doctor user (account) as admin/superadmin (legacy)
  createDoctorUser: async (data: CreateDoctorUserData): Promise<UserProfile> => {
    const response = await api.post<ApiResponse<UserProfile>>('/api/auth/admin/users/', {
      ...data,
      role: 'doctor',
    });
    return response.data.data;
  },

  // Create doctor profile (must be called as the doctor user)
  createDoctorProfile: async (profileData: CreateDoctorProfileData): Promise<DoctorProfile> => {
    const response = await api.post<ApiResponse<DoctorProfile>>('/api/doctors/', profileData);
    return response.data.data;
  },

  // List all doctors (SuperAdmin only)
  getDoctors: async (params?: { 
    search?: string; 
    is_active?: boolean; 
    is_verified?: boolean;
    specialization?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ results: DoctorProfile[]; count: number; next: string | null; previous: string | null }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.search) queryParams.append('search', params.search);
      if (typeof params.is_active === 'boolean' || typeof params.is_active === 'number') queryParams.append('is_active', params.is_active ? 'true' : 'false');
      if (typeof params.is_verified === 'boolean' || typeof params.is_verified === 'number') queryParams.append('is_verified', params.is_verified ? 'true' : 'false');
      if (params.specialization) queryParams.append('specialization', params.specialization);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    }
    const response = await api.get(`/api/doctors/superadmin/?${queryParams.toString()}`);
    
    // Handle paginated response structure
    if (response.data && response.data.results && Array.isArray(response.data.results)) {
      return {
        results: response.data.results,
        count: response.data.count || 0,
        next: response.data.next || null,
        previous: response.data.previous || null
      };
    }
    
    // Handle legacy response structures
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return {
        results: response.data.data,
        count: response.data.data.length,
        next: null,
        previous: null
      };
    }
    if (response.data && Array.isArray(response.data)) {
      return {
        results: response.data,
        count: response.data.length,
        next: null,
        previous: null
      };
    }
    
    // Fallback to empty response
    return {
      results: [],
      count: 0,
      next: null,
      previous: null
    };
  },

  // Get doctor details by ID (SuperAdmin only)
  getDoctor: async (doctorId: string): Promise<DoctorProfile> => {
    const response = await api.get<ApiResponse<DoctorProfile>>(`/api/doctors/superadmin/${doctorId}/`);
    return response.data.data;
  },

  // Get doctor by ID (alias for getDoctor)
  getDoctorById: async (doctorId: string): Promise<DoctorProfile> => {
    const response = await api.get<ApiResponse<DoctorProfile>>(`/api/doctors/superadmin/${doctorId}/`);
    return response.data.data;
  },

  // Update doctor profile (SuperAdmin only)
  updateDoctor: async (doctorId: string, data: Partial<CreateDoctorProfileData> | FormData): Promise<DoctorProfile> => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await api.put<ApiResponse<DoctorProfile>>(`/api/doctors/superadmin/${doctorId}/`, data, config);
    return response.data.data;
  },

  // Delete/deactivate doctor (SuperAdmin only)
  deleteDoctor: async (doctorId: string): Promise<{
    doctor_id: string;
    user_id: string;
    status: string;
  }> => {
    const response = await api.delete<ApiResponse<{
      doctor_id: string;
      user_id: string;
      status: string;
    }>>(`/api/doctors/superadmin/${doctorId}/`);
    return response.data.data;
  },

  // Get current doctor's profile
  getCurrentDoctorProfile: async (): Promise<DoctorProfile> => {
    const response = await api.get<ApiResponse<DoctorProfile>>('/api/doctors/me/');
    return response.data.data;
  },

  // Update current doctor's profile
  updateCurrentDoctorProfile: async (data: Partial<DoctorProfile>): Promise<DoctorProfile> => {
    // Clean and format the data before sending
    const cleanedData: any = {};
    
    // Only include fields that have actual values
    Object.entries(data).forEach(([key, value]) => {
      // Skip undefined and null values
      if (value === undefined || value === null) {
        return;
      }
      
      // Handle string fields - only include non-empty strings
      if (typeof value === 'string') {
        if (value.trim() !== '') {
          cleanedData[key] = value.trim();
        }
      }
      // Handle date fields
      else if (key === 'date_of_birth' || key === 'date_of_anniversary') {
        if (value && typeof value === 'string' && value.trim() !== '') {
          cleanedData[key] = value.trim();
        }
      }
      // Handle arrays - only include non-empty arrays
      else if (Array.isArray(value)) {
        if (value.length > 0) {
          cleanedData[key] = value;
        }
      }
      // Handle numbers - include all numbers (including 0)
      else if (typeof value === 'number') {
        cleanedData[key] = value;
      }
      // Handle booleans - include all boolean values
      else if (typeof value === 'boolean') {
        cleanedData[key] = value;
      }
      // Handle other types
      else {
        cleanedData[key] = value;
      }
    });

    try {
      // Use PATCH for partial updates (more appropriate than PUT)
      const response = await api.patch<ApiResponse<DoctorProfile>>('/api/doctors/update_me/', cleanedData);
      return response.data.data;
    } catch (error: any) {
      console.log('Update endpoint failed, trying auth profile endpoint:', error);
      
      // Fallback to auth profile endpoint for basic fields
      const basicFields = {
        name: data.user_name,
        email: data.user_email,
        phone: data.user_phone,
      };
      const response = await api.put<ApiResponse<DoctorProfile>>('/api/auth/profile/', basicFields);
      return response.data.data;
    }
  },

  // Update current doctor's profile with file upload
  updateCurrentDoctorProfileWithFile: async (formData: FormData): Promise<DoctorProfile> => {
    try {
      // Use PATCH for partial updates with FormData (includes file upload)
      const response = await api.patch<ApiResponse<DoctorProfile>>('/api/doctors/update_me/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.log('Update with file failed:', error);
      throw error;
    }
  },

  // Get doctor statistics (SuperAdmin only)
  getDoctorStats: async (): Promise<{
    total_doctors: number;
    active_doctors: number;
    new_this_month: number;
    avg_rating: string;
    verified_doctors: number;
    specialization_distribution: Record<string, number>;
    experience_distribution: Record<string, number>;
    average_consultation_fee: string;
    top_rated_doctors: unknown[];
    consultation_stats: Record<string, unknown>;
  }> => {
    const response = await api.get<ApiResponse<{
      total_doctors: number;
      active_doctors: number;
      new_this_month: number;
      avg_rating: string;
      verified_doctors: number;
      specialization_distribution: Record<string, number>;
      experience_distribution: Record<string, number>;
      average_consultation_fee: string;
      top_rated_doctors: unknown[];
      consultation_stats: Record<string, unknown>;
    }>>('/api/doctors/stats/');
    return response.data.data;
  },

  // Get consultations for the logged-in doctor (NEW API)
  getUpcomingConsultations: async (): Promise<Consultation[]> => {
    const response = await api.get<ApiResponse<Consultation[]>>(
      '/api/consultations/doctor/my-consultations/?status=scheduled'
    );
    return response.data.data || [];
  },

  // Get all consultations for the logged-in doctor (with optional filters)
  getAllConsultations: async (params?: { page?: number; page_size?: number; status?: string; ordering?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/api/consultations/doctor/consultations/?${queryParams.toString()}`);
    // Return the full paginated response
    return response.data;
  },

  startConsultation: async (consultationId: string): Promise<Consultation> => {
    const response = await post<Consultation>(`/api/doctor/consultations/${consultationId}/start/`);
    return response;
  },

  completeConsultation: async (consultationId: string): Promise<Consultation> => {
    const response = await post<Consultation>(`/api/doctor/consultations/${consultationId}/complete/`);
    return response;
  },

  cancelConsultation: async (consultationId: string): Promise<Consultation> => {
    const response = await post<Consultation>(`/api/doctor/consultations/${consultationId}/cancel/`);
    return response;
  },

  addConsultationNote: async (consultationId: string, note: { content: string }): Promise<PatientNote> => {
    const response = await post<PatientNote>(`/api/doctor/consultations/${consultationId}/notes/`, note);
    return response;
  },

  getConsultationNotes: async (consultationId: string): Promise<PatientNote[]> => {
    const response = await get<PatientNote[]>(`/api/doctor/consultations/${consultationId}/notes/`);
    return response;
  },

  // Upload signature (new method)
  uploadSignature: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('signature', file);
    formData.append('type', 'doctor_signature');
    
    const response = await api.post<ApiResponse<{ url: string }>>('/api/utils/signature/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
};

// Create a new consultation
export const createConsultation = async (data: {
  patient: string | number;
  doctor: string | number;
  consultation_type: string;
  scheduled_date: string;
  scheduled_time: string;
  duration: number | string;
  chief_complaint: string;
  symptoms?: string;
  consultation_fee?: number | string;
  clinic_id?: number;
  slot_id?: number; // Optional field for slot-based booking
}): Promise<Consultation> => {
  // Remove slot_id for dynamic slot consultations
  const { slot_id, ...consultationData } = data;
  const response = await api.post<ApiResponse<Consultation>>('/api/consultations/create-dynamic/', consultationData);
  return response.data.data;
};

// New API functions for slot-based consultation system
export const getAvailableSlots = async (params: {
  doctor_id: string | number;
  clinic_id: string | number;
  date: string; // YYYY-MM-DD
}): Promise<DoctorSlot[]> => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, value.toString());
  });
  
  const response = await api.get<ApiResponse<DoctorSlot[]>>(`/api/consultations/available_slots/?${queryParams.toString()}`);
  return response.data.data;
};

export const calculateAvailableSlots = async (params: {
  doctor_id: string | number;
  date: string; // YYYY-MM-DD
  clinic_id?: string | number; // Optional clinic ID
}): Promise<{
  slots: Array<{
    start_time: string;
    end_time: string;
    duration_minutes: number;
    clinic_name: string;
    doctor_name: string;
    is_available: boolean;
  }>;
  clinic_duration: number;
  date: string;
  doctor_name: string;
  clinic_name: string;
}> => {
  const queryParams = new URLSearchParams();
  queryParams.append('doctor_id', params.doctor_id.toString());
  queryParams.append('clinic_id', params.clinic_id?.toString() || 'CLI002'); // Use provided clinic_id or fallback
  queryParams.append('date', params.date);
  
  const response = await api.get(`/api/consultations/calculate_available_slots/?${queryParams.toString()}`);
  return response.data.data;
};

export const generateDoctorSlots = async (doctorId: string | number, data: {
  clinic: number;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
}): Promise<DoctorSlot[]> => {
  const response = await api.post<ApiResponse<DoctorSlot[]>>(`/api/doctors/${doctorId}/slots/generate_slots/`, data);
  return response.data.data;
};

export const getDoctorSlots = async (doctorId: string | number, params?: {
  month?: number;
  year?: number;
  date?: string;
}): Promise<DoctorSlot[]> => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  const response = await api.get<ApiResponse<DoctorSlot[]>>(`/api/doctors/${doctorId}/slots/?${queryParams.toString()}`);
  return response.data.data;
};

// Doctor Slot & Schedule API
export interface DoctorSlot {
  id: number;
  doctor: number;
  clinic: number;
  clinic_name: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  is_available: boolean;
  is_booked: boolean;
  booked_consultation: number | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorSchedule {
  id: number;
  doctor: number;
  day_of_week: string; // e.g., 'Monday'
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Add a type for frontend slot objects
export interface DoctorSlotFrontend {
  id: number;
  doctor: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  created_at: string;
  updated_at: string;
  type: string;
}

export const doctorSlotApi = {
  // Fetch slots for a doctor for a given month/year
  getSlots: async (doctorId: string | number, month: number, year: number): Promise<DoctorSlotFrontend[]> => {
    let url = `/api/doctors/${doctorId}/slots/?month=${month+1}&year=${year}`;
    let allSlots: DoctorSlot[] = [];
    while (url) {
      const response = await api.get(url);
      // Debug: print raw data from slots API
      // eslint-disable-next-line no-console
      console.log('RAW slots API data:', response.data);
      let slotList: DoctorSlot[] = [];
      const data = response.data;
      if (Array.isArray(data)) {
        slotList = data;
        url = null;
      } else if (data && Array.isArray(data.results)) {
        slotList = data.results;
        url = data.next;
      } else {
        url = null;
      }
      allSlots = allSlots.concat(slotList);
    }
    return allSlots.map((slot) => ({
      id: slot.id,
      doctor: slot.doctor,
      date: slot.date,
      startTime: slot.start_time.slice(0, 5),
      endTime: slot.end_time.slice(0, 5),
      isAvailable: slot.is_available,
      created_at: slot.created_at,
      updated_at: slot.updated_at,
      type: slot.is_available ? 'available' : 'booked',
    }));
  },
  // Create a new slot
  createSlot: async (doctorId: string | number, slotData: Partial<DoctorSlot>): Promise<DoctorSlotFrontend> => {
    const response = await api.post<ApiResponse<DoctorSlot>>(
      `/api/doctors/${doctorId}/slots/`,
      slotData
    );
    const slot = response.data.data;
    return {
      id: slot.id,
      doctor: slot.doctor,
      date: slot.date,
      startTime: slot.start_time,
      endTime: slot.end_time,
      isAvailable: slot.is_available,
      created_at: slot.created_at,
      updated_at: slot.updated_at,
      type: slot.is_available ? 'available' : 'booked',
    };
  },
  // Delete a slot
  deleteSlot: async (doctorId: string | number, slotId: number): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/api/doctors/${doctorId}/slots/${slotId}/`);
  }
};

export const doctorScheduleApi = {
  // Fetch weekly schedule for a doctor
  getSchedule: async (doctorId: string | number): Promise<DoctorSchedule[]> => {
    const response = await api.get<ApiResponse<PaginatedResponse<DoctorSchedule>>>(
      `/api/doctors/${doctorId}/schedule/`
    );
    return response.data.data.results;
  },
  // Create a new weekly schedule entry
  createSchedule: async (doctorId: string | number, scheduleData: Partial<DoctorSchedule>): Promise<DoctorSchedule> => {
    const response = await api.post<ApiResponse<DoctorSchedule>>(
      `/api/doctors/${doctorId}/schedule/`,
      scheduleData
    );
    return response.data.data;
  },
  // Delete a schedule entry
  deleteSchedule: async (doctorId: string | number, scheduleId: number): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/api/doctors/${doctorId}/schedule/${scheduleId}/`);
  }
};

// Utility functions
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}; 

export const paymentApi = {
  // Create a payment record
  createPayment: async (paymentData: {
    consultation_id?: string;
    patient_id?: string;
    doctor_id?: string;
    amount: number;
    payment_type?: string;
    description?: string;
    payment_method?: string;
  }) => {
    const response = await api.post('/api/payments/', paymentData);
    return response.data;
  },
  
  // Process payment with a specific gateway
  processPayment: async (paymentId: string, gateway: 'stripe' | 'razorpay' | 'payu' | 'phonepe', data?: {
    payment_token?: string;
    return_url?: string;
    cancel_url?: string;
  }) => {
    const response = await api.post(`/api/payments/${paymentId}/process/`, {
      gateway,
      ...data
    });
    return response.data;
  },
  
  // Initiate a payment for a consultation
  initiatePayment: async ({ consultation_id, amount }: { consultation_id: string; amount: number | string }) => {
    // Placeholder endpoint, update as per backend
    const response = await api.post('/api/payments/initiate/', { consultation_id, amount });
    return response.data;
  },
  
  // Get payment status for a consultation
  getPaymentStatus: async ({ consultation_id }: { consultation_id: string }) => {
    // Placeholder endpoint, update as per backend
    const response = await api.get(`/api/payments/status/?consultation_id=${consultation_id}`);
    return response.data;
  },
}; 

// Doctor Status API functions
export const doctorStatusApi = {
  // Get all doctor statuses
  getDoctorStatuses: async (params?: {
    status?: string;
    online?: boolean;
    available?: boolean;
  }): Promise<ApiResponse<DoctorStatus[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.online !== undefined) queryParams.append('online', params.online.toString());
    if (params?.available !== undefined) queryParams.append('available', params.available.toString());
    
    const url = queryParams.toString() ? `/api/doctors/status/?${queryParams}` : '/api/doctors/status/';
    const response = await api.get<ApiResponse<DoctorStatus[]>>(url);
    return response.data;
  },

  // Get specific doctor status
  getDoctorStatus: async (doctorId: string): Promise<ApiResponse<DoctorStatus>> => {
    const response = await api.get<ApiResponse<DoctorStatus>>(`/api/doctors/status/${doctorId}/`);
    return response.data;
  },

  // Update doctor status (for doctors to update their own status)
  updateDoctorStatus: async (data: {
    current_status?: string;
    status_note?: string;
    is_available?: boolean;
  }): Promise<ApiResponse<DoctorStatus>> => {
    const response = await api.put<ApiResponse<DoctorStatus>>('/api/doctors/status/update/', data);
    return response.data;
  },

  // Get doctor status statistics
  getDoctorStatusStats: async (): Promise<ApiResponse<{
    total_doctors: number;
    online_doctors: number;
    available_doctors: number;
    consulting_doctors: number;
    away_doctors: number;
    offline_doctors: number;
    recent_activity: number;
    status_breakdown: Record<string, number>;
    online_percentage: number;
    available_percentage: number;
  }>> => {
    const response = await api.get<ApiResponse<any>>('/api/doctors/status/stats/');
    return response.data;
  },

  // Mark doctor as offline
  markOffline: async (): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>('/api/doctors/status/offline/');
    return response.data;
  },
};

// ===== PRESCRIPTION APIs =====

// Enhanced Prescription interfaces to match backend
export interface PrescriptionPDF {
  id: string;
  version: number;
  is_current: boolean;
  generated_at: string;
  generated_by: {
    id: string;
    name: string;
  };
  file_url: string;
  file_size: number;
}

export interface PrescriptionMedication {
  id?: number;
  medicine_name: string;
  composition?: string;
  dosage_form?: string;
  morning_dose: number;
  afternoon_dose: number;
  evening_dose: number;
  frequency: 'once_daily' | 'twice_daily' | 'thrice_daily' | 'four_times_daily' | 'sos' | 'custom';
  timing: 'before_breakfast' | 'after_breakfast' | 'before_lunch' | 'after_lunch' | 'before_dinner' | 'after_dinner' | 'bedtime' | 'empty_stomach' | 'with_food' | 'custom';
  custom_timing?: string;
  duration_days?: number;
  duration_weeks?: number;
  duration_months?: number;
  is_continuous: boolean;
  special_instructions?: string;
  notes?: string;
  order: number;
}

export interface PrescriptionVitalSigns {
  id?: number;
  pulse?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  oxygen_saturation?: number;
  respiratory_rate?: number;
}

export interface EnhancedPrescription {
  id?: number;
  consultation?: string;
  patient?: string;
  doctor?: any;
  consultation_id?: string;
  consultation_date?: string;
  consultation_time?: string;
  patient_age?: number;
  patient_gender?: string;
  issued_date?: string;
  issued_time?: string;
  
  // Vital Signs
  pulse?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  blood_pressure_display?: string;
  temperature?: number;
  weight?: number;
  height?: number;
  
  // Diagnosis
  primary_diagnosis?: string;
  secondary_diagnosis?: string;
  clinical_classification?: string;
  
  // Instructions
  general_instructions?: string;
  fluid_intake?: string;
  diet_instructions?: string;
  lifestyle_advice?: string;
  
  // Follow-up
  next_visit?: string;
  follow_up_notes?: string;
  
  // Status
  is_draft?: boolean;
  is_finalized?: boolean;
  
  // Related data
  medications?: PrescriptionMedication[];
  vital_signs?: PrescriptionVitalSigns;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
}

export interface CreatePrescriptionData {
  consultation: string;
  patient: string;
  
  // Vital Signs
  pulse?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  
  // Diagnosis
  primary_diagnosis?: string;
  secondary_diagnosis?: string;
  clinical_classification?: string;
  
  // Instructions
  general_instructions?: string;
  fluid_intake?: string;
  diet_instructions?: string;
  lifestyle_advice?: string;
  
  // Follow-up
  next_visit?: string;
  follow_up_notes?: string;
  
  // Related data
  medications?: Omit<PrescriptionMedication, 'id'>[];
  vital_signs?: Omit<PrescriptionVitalSigns, 'id'>;
}

export const prescriptionApi = {
  // Get all prescriptions (with filtering)
  getPrescriptions: async (params?: {
    consultation?: string;
    patient?: string;
    is_draft?: boolean;
    is_finalized?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<{ results: EnhancedPrescription[]; count: number; next: string | null; previous: string | null }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/api/prescriptions/?${queryParams.toString()}`);
    return response.data.data || response.data;
  },

  // Get prescription by ID
  getPrescription: async (prescriptionId: string): Promise<EnhancedPrescription> => {
    const response = await api.get(`/api/prescriptions/${prescriptionId}/`);
    return response.data.data;
  },

  // Get PDF versions for a prescription
  getPrescriptionPdfVersions: async (prescriptionId: string): Promise<PrescriptionPDF[]> => {
    const response = await api.get(`/api/prescriptions/${prescriptionId}/pdf-versions/`);
    // The backend returns { success: true, data: { versions: [...] } }
    return response.data.data?.versions || response.data.versions || [];
  },

  // Get prescription for a specific consultation
  getConsultationPrescription: async (consultationId: string): Promise<EnhancedPrescription> => {
    const response = await api.get(`/api/consultations/${consultationId}/prescription/`);
    return response.data.data;
  },

  // Create new prescription
  createPrescription: async (prescriptionData: CreatePrescriptionData): Promise<EnhancedPrescription> => {
    const response = await api.post('/api/prescriptions/', prescriptionData);
    return response.data.data;
  },

  // Update prescription
  updatePrescription: async (prescriptionId: string, prescriptionData: Partial<CreatePrescriptionData>): Promise<EnhancedPrescription> => {
    const response = await api.put(`/api/prescriptions/${prescriptionId}/`, prescriptionData);
    return response.data.data;
  },

  // Partial update prescription
  partialUpdatePrescription: async (prescriptionId: string, prescriptionData: Partial<CreatePrescriptionData>): Promise<EnhancedPrescription> => {
    const response = await api.patch(`/api/prescriptions/${prescriptionId}/`, prescriptionData);
    return response.data.data;
  },

  // Save prescription as draft
  saveDraft: async (prescriptionId: string, prescriptionData?: Partial<CreatePrescriptionData>): Promise<EnhancedPrescription> => {
    const response = await api.post(`/api/prescriptions/${prescriptionId}/save-draft/`, prescriptionData || {});
    return response.data.data;
  },

  // Finalize prescription
  finalizePrescription: async (prescriptionId: string): Promise<EnhancedPrescription> => {
    const response = await api.post(`/api/prescriptions/${prescriptionId}/finalize/`);
    return response.data.data;
  },

  // Delete prescription
  deletePrescription: async (prescriptionId: string): Promise<void> => {
    await api.delete(`/api/prescriptions/${prescriptionId}/`);
  },

  // Get draft prescriptions
  getDraftPrescriptions: async (): Promise<EnhancedPrescription[]> => {
    const response = await api.get('/api/prescriptions/drafts/');
    return response.data.data;
  },

  // Get finalized prescriptions
  getFinalizedPrescriptions: async (): Promise<EnhancedPrescription[]> => {
    const response = await api.get('/api/prescriptions/finalized/');
    return response.data.data;
  },

  // Medication management
  addMedication: async (prescriptionId: string, medicationData: Omit<PrescriptionMedication, 'id'>): Promise<PrescriptionMedication> => {
    const response = await api.post(`/api/prescriptions/${prescriptionId}/medications/`, medicationData);
    return response.data.data;
  },

  updateMedication: async (prescriptionId: string, medicationId: string, medicationData: Partial<PrescriptionMedication>): Promise<PrescriptionMedication> => {
    const response = await api.put(`/api/prescriptions/${prescriptionId}/medications/${medicationId}/`, medicationData);
    return response.data.data;
  },

  deleteMedication: async (prescriptionId: string, medicationId: string): Promise<void> => {
    await api.delete(`/api/prescriptions/${prescriptionId}/medications/${medicationId}/`);
  },

  // Vital signs management
  updateVitalSigns: async (prescriptionId: string, vitalSignsData: PrescriptionVitalSigns): Promise<PrescriptionVitalSigns> => {
    const response = await api.put(`/api/prescriptions/${prescriptionId}/vital-signs/`, vitalSignsData);
    return response.data.data;
  },

  // Auto-save functionality
  autoSave: async (prescriptionId: string, prescriptionData: Partial<CreatePrescriptionData>): Promise<{ id: string; auto_saved_at: string }> => {
    const response = await api.post(`/api/prescriptions/${prescriptionId}/auto-save/`, prescriptionData);
    return response.data.data;
  },

  // Finalize and generate PDF
  finalizeAndGeneratePDF: async (prescriptionId: string, prescriptionData?: Partial<CreatePrescriptionData>): Promise<{
    prescription: EnhancedPrescription;
    pdf: {
      id: string;
      version: number;
      url: string;
      generated_at: string;
    };
  }> => {
    const response = await api.post(`/api/prescriptions/${prescriptionId}/finalize-and-generate-pdf/`, prescriptionData || {});
    return response.data.data;
  },

  // Get PDF versions
  getPDFVersions: async (prescriptionId: string): Promise<{
    prescription_id: string;
    total_versions: number;
    versions: Array<{
      id: string;
      version: number;
      is_current: boolean;
      generated_at: string;
      generated_by: {
        id: string;
        name: string;
      };
      file_url: string;
      file_size: number;
    }>;
  }> => {
    const response = await api.get(`/api/prescriptions/${prescriptionId}/pdf-versions/`);
    return response.data.data;
  },

  // Download PDF
  downloadPDF: async (prescriptionId: string, version: string | number = 'latest'): Promise<{
    success: boolean;
    data: {
      download_url: string;
      filename: string;
    };
    message: string;
    timestamp: string;
  }> => {
    const response = await api.get(`/api/prescriptions/${prescriptionId}/pdf/${version}/`);
    return response.data;
  },

  // Get patient PDFs
  getPatientPDFs: async (patientId: string): Promise<{
    patient_id: string;
    total_pdfs: number;
    pdfs: Array<{
      id: string;
      prescription_id: string;
      consultation_id?: string;
      version: number;
      generated_at: string;
      generated_by: {
        id: string;
        name: string;
      };
      file_url: string;
      file_size: number;
      prescription_date: string;
      diagnosis: string;
    }>;
  }> => {
    const response = await api.get(`/api/prescriptions/patient/${patientId}/pdfs/`);
    return response.data.data;
  },

  // Get draft prescriptions
  getDrafts: async (): Promise<{ results: EnhancedPrescription[]; count: number }> => {
    const response = await api.get('/api/prescriptions/drafts/');
    return response.data.data || response.data;
  },

  // Get finalized prescriptions
  getFinalized: async (): Promise<{ results: EnhancedPrescription[]; count: number }> => {
    const response = await api.get('/api/prescriptions/finalized/');
    return response.data.data || response.data;
  },
};

// Consultation Workflow API Functions
export const startConsultation = async (consultationId: string): Promise<Consultation> => {
  const response = await api.post(`/api/consultations/doctor/consultations/${consultationId}/start/`);
  return response.data;
};

export const completeConsultation = async (consultationId: string): Promise<Consultation> => {
  const response = await api.post(`/api/consultations/${consultationId}/complete/`);
  return response.data;
};

export const saveConsultationNotes = async (consultationId: string, data: {
  content: string;
  is_private?: boolean;
  category?: string;
}): Promise<any> => {
  const response = await api.post(`/api/consultations/doctor/consultations/${consultationId}/notes/`, data);
  return response.data;
};

export const getConsultationNotes = async (consultationId: string): Promise<any[]> => {
  const response = await api.get(`/api/consultations/doctor/consultations/${consultationId}/notes/`);
  return response.data;
};

export const saveVitalSigns = async (consultationId: string, data: {
  pulse?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  oxygen_saturation?: number;
}): Promise<any> => {
  const response = await api.post(`/api/consultations/doctor/consultations/${consultationId}/vital-signs/`, data);
  return response.data;
};

export const getVitalSigns = async (consultationId: string): Promise<any> => {
  const response = await api.get(`/api/consultations/doctor/consultations/${consultationId}/vital-signs/`);
  return response.data;
};

export const saveAssessment = async (consultationId: string, data: {
  assessment?: {
    chief_complaint?: string;
    symptoms?: string;
  };
  symptoms?: Array<{
    symptom: string;
    severity: string;
    duration: string;
  }>;
}): Promise<any> => {
  const response = await api.post(`/api/consultations/doctor/consultations/${consultationId}/assessment/`, data);
  return response.data;
};

export const saveDiagnosis = async (consultationId: string, data: {
  diagnosis?: {
    primary_diagnosis?: string;
    differential_diagnosis?: string;
    clinical_findings?: string;
    lab_results?: string;
    imaging?: string;
  };
}): Promise<any> => {
  const response = await api.post(`/api/consultations/doctor/consultations/${consultationId}/diagnosis/`, data);
  return response.data;
};

export const savePrescription = async (consultationId: string, data: {
  prescription: {
    instructions?: string;
    follow_up?: string;
    next_visit?: string;
    diagnosis?: string;
    medications?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
      before_meal?: boolean;
      is_generic?: boolean;
      quantity?: string;
    }>;
  };
}): Promise<any> => {
  const response = await api.post(`/api/consultations/doctor/consultations/${consultationId}/prescription/`, data);
  return response.data;
};

export const getPatientProfile = async (patientId: string): Promise<PatientProfile> => {
  const response = await api.get(`/api/patients/${patientId}/profile/`);
  return response.data;
};

export const getAllConsultations = async (params?: {
  status?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<Consultation>> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.ordering) queryParams.append('ordering', params.ordering);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
  
  const response = await api.get(`/api/consultations/doctor/consultations/?${queryParams.toString()}`);
  return response.data;
};



export const getConsultationDetails = async (consultationId: string): Promise<Consultation> => {
  const response = await api.get(`/api/consultations/${consultationId}/`);
  return response.data.success ? response.data.data : response.data;
};



// Doctor Consultation API object with consultation methods
export const doctorConsultationApi = {
  getAllConsultations,
  getConsultationDetails,
  startConsultation,
  completeConsultation,
  saveConsultationNotes,
  getConsultationNotes,
  saveVitalSigns,
  getVitalSigns,
  saveAssessment,
  saveDiagnosis,
  savePrescription,
  getPatientProfile,
};





