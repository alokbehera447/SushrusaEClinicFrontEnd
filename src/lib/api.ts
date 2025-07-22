import { api } from './utils';

// HTTP method helpers
export const get = <T = unknown>(url: string, config?: Record<string, unknown>) => api.get<T>(url, config).then(res => res.data);
export const post = <T = unknown>(url: string, data?: unknown, config?: Record<string, unknown>) => api.post<T>(url, data, config).then(res => res.data);
export const put = <T = unknown>(url: string, data?: unknown, config?: Record<string, unknown>) => api.put<T>(url, data, config).then(res => res.data);
export const del = <T = unknown>(url: string, config?: Record<string, unknown>) => api.delete<T>(url, config).then(res => res.data);

// Types for patient data
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
  created_at: string;
  updated_at: string;
  age: number | null;
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
  consultation_fee: number;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
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
  record_type: string;
  title: string;
  description: string;
  date_recorded: string;
  document: string | null;
  recorded_by: string | null;
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
export interface EClinic {
  id: string;
  name: string;
  clinic_type: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  operating_hours: Record<string, string>;
  specialties: string[];
  services: string[];
  facilities: string[];
  registration_number: string;
  license_number: string;
  accreditation: string;
  logo: string | null;
  cover_image: string | null;
  gallery_images: string[];
  is_active: boolean;
  is_verified: boolean;
  accepts_online_consultations: boolean;
  admin: string;
  created_at: string;
  updated_at: string;
}

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
  logo?: File;
  cover_image?: File;
  gallery_images?: string[];
  is_active?: boolean;
  accepts_online_consultations?: boolean;
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

// Patient API service functions
export const patientApi = {
  // Get current user's profile
  getCurrentUserProfile: async (): Promise<UserProfile> => {
    const response = await api.get<ApiResponse<UserProfile>>('/api/auth/profile/');
    return response.data.data;
  },

  // Get patient profile
  getPatientProfile: async (patientId?: string): Promise<PatientProfile> => {
    const url = patientId ? `/api/patients/${patientId}/` : '/api/patients/';
    const response = await api.get<ApiResponse<PatientProfile>>(url);
    return response.data.data;
  },

  // Get patient consultations
  getPatientConsultations: async (patientId?: string): Promise<Consultation[]> => {
    const url = patientId 
      ? `/api/consultations/?patient=${patientId}` 
      : '/api/consultations/';
    const response = await api.get<ApiResponse<PaginatedResponse<Consultation>>>(url);
    return response.data.data.results;
  },

  // Get consultation prescriptions
  getConsultationPrescriptions: async (consultationId: string): Promise<Prescription[]> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Prescription>>>(
      `/api/prescriptions/?consultation=${consultationId}`
    );
    return response.data.data.results;
  },

  // Get prescription medications
  getPrescriptionMedications: async (prescriptionId: string): Promise<Medication[]> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Medication>>>(
      `/api/prescriptions/${prescriptionId}/medications/`
    );
    return response.data.data.results;
  },

  // Get patient medical records
  getPatientMedicalRecords: async (patientId: string): Promise<MedicalRecord[]> => {
    const response = await api.get<ApiResponse<PaginatedResponse<MedicalRecord>>>(
      `/api/patients/${patientId}/medical-records/`
    );
    return response.data.data.results;
  },

  // Get patient documents
  getPatientDocuments: async (patientId: string): Promise<PatientDocument[]> => {
    const response = await api.get<ApiResponse<PaginatedResponse<PatientDocument>>>(
      `/api/patients/${patientId}/documents/`
    );
    return response.data.data.results;
  },

  // Get patient notes
  getPatientNotes: async (patientId: string): Promise<PatientNote[]> => {
    const response = await api.get<ApiResponse<PaginatedResponse<PatientNote>>>(
      `/api/patients/${patientId}/notes/`
    );
    return response.data.data.results;
  },

  // Update user profile
  updateUserProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put<ApiResponse<UserProfile>>('/api/auth/profile/', profileData);
    return response.data.data;
  },

  // Update patient profile
  updatePatientProfile: async (patientId: string, profileData: Partial<PatientProfile>): Promise<PatientProfile> => {
    const response = await api.put<ApiResponse<PatientProfile>>(`/api/patients/${patientId}/`, profileData);
    return response.data.data;
  }
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
    patient_profile: PatientProfile;
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
      patient_profile: PatientProfile;
      user_account: {
        user_id: string;
        phone: string;
        name: string;
        email: string;
        role: string;
        password: string;
      };
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
  }): Promise<{ results: MedicalRecord[]; count: number }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get<ApiResponse<{ results: MedicalRecord[]; count: number }>>(
      `/api/patients/${patientId}/medical-records/?${queryParams.toString()}`
    );
    return response.data.data;
  },

  // Get patient documents (Admin only)
  getPatientDocuments: async (patientId: string, params?: {
    page?: number;
    page_size?: number;
    document_type?: string;
    is_verified?: boolean;
  }): Promise<{ results: PatientDocument[]; count: number }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get<ApiResponse<{ results: PatientDocument[]; count: number }>>(
      `/api/patients/${patientId}/documents/?${queryParams.toString()}`
    );
    return response.data.data;
  },

  // Get patient notes (Admin only)
  getPatientNotes: async (patientId: string, params?: {
    page?: number;
    page_size?: number;
    is_private?: boolean;
  }): Promise<{ results: PatientNote[]; count: number }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get<ApiResponse<{ results: PatientNote[]; count: number }>>(
      `/api/patients/${patientId}/notes/?${queryParams.toString()}`
    );
    return response.data.data;
  }
};

// User Session interface
export interface UserSession {
  id: string;
  user: string;
  refresh_token: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// SuperAdmin API service functions
export const superAdminApi = {
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
    return response.data;
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
    const response = await api.get<ApiResponse<EClinic>>(`/api/eclinic/${clinicId}/`);
    return response.data.data;
  },

  // Create new e-clinic
  createEClinic: async (clinicData: CreateEClinicData): Promise<EClinic> => {
    const response = await api.post<ApiResponse<EClinic>>('/api/eclinic/', clinicData);
    return response.data.data;
  },

  // Update e-clinic
  updateEClinic: async (clinicId: string, clinicData: Partial<CreateEClinicData>): Promise<EClinic> => {
    const response = await api.put<ApiResponse<EClinic>>(`/api/eclinic/${clinicId}/`, clinicData);
    return response.data.data;
  },

  // Delete e-clinic
  deleteEClinic: async (clinicId: string): Promise<void> => {
    await api.delete(`/api/eclinic/${clinicId}/`);
  },

  // Get admin users for e-clinic assignment
  getAdminUsers: async (): Promise<UserProfile[]> => {
    const response = await api.get('/api/auth/admin/users/?type=admins');
    return response.data.data || [];
  },

  // Get comprehensive platform overview statistics
  getOverviewStats: async (): Promise<{
    total_clinics: { value: number; change: string };
    active_clinics: { value: number; change: string };
    total_doctors: { value: number; change: string };
    active_doctors: { value: number; change: string };
    total_admins: { value: number; change: string };
    total_patients: { value: number; change: string };
    total_consultations: { value: number; change: string };
    total_revenue: { value: number; change: string };
  }> => {
    const response = await api.get('/api/analytics/superadmin/overview/');
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

export const adminAnalyticsApi = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await api.get('/api/analytics/dashboard/');
    return response.data.data;
  }
};

// Admin Consultation API
export const adminConsultationApi = {
  getTodaysConsultations: async (): Promise<Consultation[]> => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const response = await api.get<ApiResponse<PaginatedResponse<Consultation>>>(`/api/consultations/?scheduled_date=${today}`);
    return response.data.data.results;
  },
  // Fetch all consultations (paginated)
  getAllConsultations: async (params?: { page?: number; page_size?: number; search?: string; status?: string; ordering?: string }): Promise<PaginatedResponse<Consultation>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/api/consultations/?${queryParams.toString()}`);
    // Handle both wrapped and unwrapped paginated responses
    let paginated;
    if (response.data && response.data.data && typeof response.data.data === 'object' && 'results' in response.data.data) {
      paginated = response.data.data;
    } else if (response.data && 'results' in response.data) {
      paginated = response.data;
    } else {
      throw new Error('Unexpected consultations API response structure');
    }
    return paginated;
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

export const doctorAnalyticsApi = {
  getPerformanceStats: async (): Promise<DoctorPerformanceStats | null> => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const response = await api.get<{ data: { results: DoctorPerformanceStats[] } }>(`/api/analytics/doctor-performance/?date=${today}`);
    if (response.data && response.data.data && response.data.data.results && response.data.data.results.length > 0) {
      return response.data.data.results[0];
    }
    return null;
  }
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
}

export interface DoctorProfile {
  id: number;
  user: string;
  user_name: string;
  user_phone: string;
  user_email: string;
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
  created_at: string;
  updated_at: string;
}

export const doctorApi = {
  // Create doctor account and profile in one call (SuperAdmin only)
  createDoctor: async (data: CreateDoctorUserData & CreateDoctorProfileData): Promise<{
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
    }>>('/api/doctors/superadmin/', data);
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
  }): Promise<DoctorProfile[]> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.search) queryParams.append('search', params.search);
      if (typeof params.is_active === 'boolean' || typeof params.is_active === 'number') queryParams.append('is_active', params.is_active ? 'true' : 'false');
      if (typeof params.is_verified === 'boolean' || typeof params.is_verified === 'number') queryParams.append('is_verified', params.is_verified ? 'true' : 'false');
      if (params.specialization) queryParams.append('specialization', params.specialization);
    }
    const response = await api.get(`/api/doctors/superadmin/?${queryParams.toString()}`);
    
    // Handle different response structures
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && response.data.results && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    
    // Fallback to empty array
    return [];
  },

  // Get doctor details by ID (SuperAdmin only)
  getDoctor: async (doctorId: string): Promise<DoctorProfile> => {
    const response = await api.get<ApiResponse<DoctorProfile>>(`/api/doctors/superadmin/${doctorId}/`);
    return response.data.data;
  },

  // Update doctor profile (SuperAdmin only)
  updateDoctor: async (doctorId: string, data: Partial<CreateDoctorProfileData>): Promise<DoctorProfile> => {
    const response = await api.put<ApiResponse<DoctorProfile>>(`/api/doctors/superadmin/${doctorId}/`, data);
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

  // Get upcoming/scheduled consultations for the logged-in doctor
  getUpcomingConsultations: async (): Promise<Consultation[]> => {
    const response = await api.get<{ data: { results: Consultation[] } }>(
      '/api/consultations/?status=scheduled&ordering=scheduled_date'
    );
    if (response.data && response.data.data && response.data.data.results) {
      return response.data.data.results;
    }
    return [];
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
    const response = await api.get(`/api/consultations/?${queryParams.toString()}`);
    // Handle paginated response
    if (response.data && response.data.data && response.data.data.results) {
      return response.data.data.results;
    } else if (response.data && response.data.results) {
      return response.data.results;
    }
    return [];
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
}): Promise<any> => {
  const response = await api.post('/api/consultations/', data);
  return response.data;
};

// Doctor Slot & Schedule API
export interface DoctorSlot {
  id: number;
  doctor: number;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  is_available: boolean;
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
  doctor: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
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