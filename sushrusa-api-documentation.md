# Sushrusa Healthcare Platform - Complete API Documentation

## Table of Contents
1. [Authentication & Authorization APIs](#1-authentication--authorization-apis)
2. [Super Admin APIs](#2-super-admin-apis)
3. [Admin APIs](#3-admin-apis)
4. [Doctor APIs](#4-doctor-apis)
5. [Patient APIs](#5-patient-apis)
6. [File Management APIs](#6-file-management-apis)
7. [Notification APIs](#7-notification-apis)
8. [Real-time APIs (WebSocket)](#8-real-time-apis-websocket)
9. [API Standards & Features](#9-api-standards--features)

---

## **1. Authentication & Authorization APIs**

### **User Authentication**
```
POST   /api/auth/login                 # Login (email/password)
POST   /api/auth/logout                # Logout
POST   /api/auth/refresh               # Refresh JWT token
POST   /api/auth/forgot-password       # Send password reset email
POST   /api/auth/reset-password        # Reset password with token
POST   /api/auth/change-password       # Change password (authenticated)
GET    /api/auth/profile               # Get current user profile
PUT    /api/auth/profile               # Update current user profile
```

### **Role-based Access**
```
GET    /api/auth/roles                 # Get all available roles
GET    /api/auth/permissions           # Get user permissions
POST   /api/auth/verify-token          # Verify JWT token validity
```

---

## **2. Super Admin APIs**

### **E-Clinic Management**
```
GET    /api/superadmin/clinics                    # List all e-clinics
GET    /api/superadmin/clinics/:id                # Get clinic details
POST   /api/superadmin/clinics                    # Create new e-clinic
PUT    /api/superadmin/clinics/:id                # Update clinic info
DELETE /api/superadmin/clinics/:id                # Deactivate clinic
GET    /api/superadmin/clinics/:id/stats          # Get clinic statistics
GET    /api/superadmin/clinics/:id/doctors        # Get doctors in clinic
GET    /api/superadmin/clinics/:id/admins         # Get admins in clinic
```

### **Doctor Management**
```
GET    /api/superadmin/doctors                    # List all doctors
GET    /api/superadmin/doctors/:id                # Get doctor details
POST   /api/superadmin/doctors                    # Register new doctor
PUT    /api/superadmin/doctors/:id                # Update doctor info
DELETE /api/superadmin/doctors/:id                # Deactivate doctor
PUT    /api/superadmin/doctors/:id/status         # Change doctor status
GET    /api/superadmin/doctors/:id/consultations  # Get doctor's consultations
GET    /api/superadmin/doctors/:id/revenue        # Get doctor's revenue
POST   /api/superadmin/doctors/:id/assign-clinic  # Assign doctor to clinic
```

### **Admin Management**
```
GET    /api/superadmin/admins                     # List all admins
GET    /api/superadmin/admins/:id                 # Get admin details
POST   /api/superadmin/admins                     # Create admin account
PUT    /api/superadmin/admins/:id                 # Update admin info
DELETE /api/superadmin/admins/:id                 # Deactivate admin
PUT    /api/superadmin/admins/:id/status          # Change admin status
POST   /api/superadmin/admins/:id/assign-clinic   # Assign admin to clinic
GET    /api/superadmin/admins/:id/performance     # Get admin performance
```

### **Platform Analytics**
```
GET    /api/superadmin/analytics/overview         # Platform overview stats
GET    /api/superadmin/analytics/revenue          # Revenue analytics
GET    /api/superadmin/analytics/consultations    # Consultation analytics
GET    /api/superadmin/analytics/patients         # Patient analytics
GET    /api/superadmin/analytics/clinics          # Clinic performance
GET    /api/superadmin/analytics/doctors          # Doctor performance
GET    /api/superadmin/reports/generate           # Generate custom reports
GET    /api/superadmin/reports/download           # Download reports
```

---

## **3. Admin APIs**

### **Patient Management**
```
GET    /api/admin/patients                        # List patients (with filters)
GET    /api/admin/patients/:id                    # Get patient details
POST   /api/admin/patients                        # Register new patient
PUT    /api/admin/patients/:id                    # Update patient info
DELETE /api/admin/patients/:id                    # Soft delete patient
GET    /api/admin/patients/search                 # Search patients
GET    /api/admin/patients/:id/consultations      # Patient consultation history
GET    /api/admin/patients/:id/medical-records    # Patient medical records
POST   /api/admin/patients/:id/medical-records    # Add medical record
```

### **Consultation Management**
```
GET    /api/admin/consultations                   # List consultations (with filters)
GET    /api/admin/consultations/:id               # Get consultation details
POST   /api/admin/consultations                   # Create new consultation
PUT    /api/admin/consultations/:id               # Update consultation
DELETE /api/admin/consultations/:id               # Cancel consultation
PUT    /api/admin/consultations/:id/start         # Start consultation
PUT    /api/admin/consultations/:id/end           # End consultation
PUT    /api/admin/consultations/:id/assign-doctor # Assign doctor
GET    /api/admin/consultations/today             # Today's consultations
GET    /api/admin/consultations/stats             # Consultation statistics
```

### **Payment Processing**
```
GET    /api/admin/payments                        # List payments (with filters)
GET    /api/admin/payments/:id                    # Get payment details
POST   /api/admin/payments                        # Process payment
PUT    /api/admin/payments/:id                    # Update payment status
GET    /api/admin/payments/today                  # Today's payments
GET    /api/admin/payments/stats                  # Payment statistics
POST   /api/admin/payments/:id/receipt            # Generate receipt
GET    /api/admin/payments/:id/receipt            # Download receipt
```

### **Prescription Management**
```
GET    /api/admin/consultations/:id/prescription  # Get prescription
POST   /api/admin/consultations/:id/prescription  # Create prescription
PUT    /api/admin/prescriptions/:id               # Update prescription
DELETE /api/admin/prescriptions/:id               # Discontinue prescription
POST   /api/admin/prescriptions/:id/pdf           # Generate prescription PDF
GET    /api/admin/prescriptions/:id/pdf           # Download prescription PDF
```

### **Dashboard & Analytics**
```
GET    /api/admin/dashboard/overview              # Dashboard overview
GET    /api/admin/dashboard/consultations         # Consultation analytics
GET    /api/admin/dashboard/patients              # Patient analytics
GET    /api/admin/dashboard/payments              # Payment analytics
GET    /api/admin/dashboard/revenue               # Revenue analytics
```

### **Doctor Management (Admin Level)**
```
GET    /api/admin/doctors                         # List doctors in clinic
GET    /api/admin/doctors/:id                     # Get doctor details
GET    /api/admin/doctors/available               # Get available doctors
GET    /api/admin/doctors/:id/schedule            # Get doctor schedule
PUT    /api/admin/doctors/:id/schedule            # Update doctor schedule
```

---

## **4. Doctor APIs**

### **Consultation Management**
```
GET    /api/doctor/consultations                  # List my consultations
GET    /api/doctor/consultations/:id              # Get consultation details
PUT    /api/doctor/consultations/:id/start        # Start consultation
PUT    /api/doctor/consultations/:id/end          # End consultation
GET    /api/doctor/consultations/today            # Today's consultations
GET    /api/doctor/consultations/upcoming         # Upcoming consultations
GET    /api/doctor/consultations/completed        # Completed consultations
```

### **Patient Management**
```
GET    /api/doctor/patients                       # List my patients
GET    /api/doctor/patients/:id                   # Get patient details
GET    /api/doctor/patients/:id/consultations     # Patient consultation history
GET    /api/doctor/patients/:id/medical-records   # Patient medical records
```

### **Prescription Management**
```
GET    /api/doctor/prescriptions                  # List my prescriptions
GET    /api/doctor/prescriptions/:id              # Get prescription details
POST   /api/doctor/consultations/:id/prescription # Write prescription
PUT    /api/doctor/prescriptions/:id              # Update prescription
DELETE /api/doctor/prescriptions/:id              # Discontinue prescription
POST   /api/doctor/prescriptions/:id/pdf          # Generate prescription PDF
```

### **Schedule Management**
```
GET    /api/doctor/schedule                       # Get my schedule
PUT    /api/doctor/schedule                       # Update my schedule
POST   /api/doctor/schedule/availability          # Set availability
DELETE /api/doctor/schedule/availability          # Remove availability
GET    /api/doctor/schedule/breaks                # Get break times
POST    /api/doctor/schedule/breaks               # Add break time
DELETE /api/doctor/schedule/breaks/:id            # Remove break time
```

### **Dashboard & Analytics**
```
GET    /api/doctor/dashboard/overview             # Doctor dashboard
GET    /api/doctor/dashboard/consultations        # Consultation stats
GET    /api/doctor/dashboard/patients             # Patient stats
GET    /api/doctor/dashboard/revenue              # Revenue stats
GET    /api/doctor/dashboard/ratings              # Rating analytics
```

---

## **5. Patient APIs**

### **Profile Management**
```
GET    /api/patient/profile                        # Get my profile
PUT    /api/patient/profile                        # Update my profile
POST   /api/patient/profile/photo                  # Upload profile photo
GET    /api/patient/medical-records                # Get my medical records
POST   /api/patient/medical-records                # Add medical record
```

### **Consultation Booking**
```
GET    /api/patient/consultations                  # List my consultations
GET    /api/patient/consultations/:id              # Get consultation details
POST   /api/patient/consultations                  # Book consultation
PUT    /api/patient/consultations/:id/cancel       # Cancel consultation
GET    /api/patient/consultations/upcoming         # Upcoming consultations
GET    /api/patient/consultations/completed        # Completed consultations
```

### **Doctor Discovery**
```
GET    /api/patient/doctors                        # List available doctors
GET    /api/patient/doctors/:id                    # Get doctor details
GET    /api/patient/doctors/search                 # Search doctors
GET    /api/patient/doctors/:id/schedule           # Get doctor schedule
GET    /api/patient/doctors/:id/ratings            # Get doctor ratings
POST   /api/patient/doctors/:id/rating             # Rate doctor
```

### **Prescriptions**
```
GET    /api/patient/prescriptions                  # List my prescriptions
GET    /api/patient/prescriptions/:id              # Get prescription details
GET    /api/patient/prescriptions/:id/pdf          # Download prescription PDF
```

### **Payments**
```
GET    /api/patient/payments                       # List my payments
GET    /api/patient/payments/:id                   # Get payment details
POST   /api/patient/payments                       # Make payment
GET    /api/patient/payments/:id/receipt           # Download receipt
```

### **Dashboard**
```
GET    /api/patient/dashboard                      # Patient dashboard
GET    /api/patient/dashboard/consultations        # Consultation summary
GET    /api/patient/dashboard/payments             # Payment summary
```

---

## **6. File Management APIs**

### **File Upload/Download**
```
POST   /api/files/upload                           # Upload any file
GET    /api/files/:id                              # Download file
DELETE /api/files/:id                              # Delete file
POST   /api/files/upload/patient-photo             # Upload patient photo
POST   /api/files/upload/consultation-files        # Upload consultation files
POST   /api/files/upload/prescription-files        # Upload prescription files
```

---

## **7. Notification APIs**

### **Notification Management**
```
GET    /api/notifications                          # Get my notifications
POST   /api/notifications/send                     # Send notification
PUT    /api/notifications/:id/read                # Mark as read
DELETE /api/notifications/:id                      # Delete notification
GET    /api/notifications/settings                 # Get notification settings
PUT    /api/notifications/settings                 # Update notification settings
```

---

## **8. Real-time APIs (WebSocket)**

### **WebSocket Endpoints**
```
WebSocket /ws/consultations                        # Real-time consultation updates
WebSocket /ws/notifications                        # Real-time notifications
WebSocket /ws/video-call                           # Video call signaling
WebSocket /ws/chat                                 # Chat functionality
```

---

## **9. API Standards & Features**

### **Total API Count: ~150-160 APIs**

### **API Distribution by Role:**
- **Super Admin**: ~40 APIs
- **Admin**: ~50 APIs  
- **Doctor**: ~35 APIs
- **Patient**: ~25 APIs
- **Common**: ~20 APIs (auth, files, notifications, etc.)

### **Key Features Each API Should Support:**

#### **1. Authentication & Security**
- JWT token-based authentication
- Role-based authorization (Super Admin, Admin, Doctor, Patient)
- Token refresh mechanism
- Password reset functionality
- Session management

#### **2. Data Handling**
- Pagination for list endpoints (limit, offset, page)
- Filtering and searching capabilities
- Sorting options (asc/desc)
- Data validation and sanitization
- Input/output data transformation

#### **3. Error Handling**
- Standardized HTTP status codes
- Consistent error response format
- Detailed error messages for debugging
- Graceful error handling
- Rate limiting and throttling

#### **4. Performance & Optimization**
- Response caching (Redis)
- Database query optimization
- Connection pooling
- Compression (gzip)
- CDN integration for static files

#### **5. Monitoring & Logging**
- Request/response logging
- Performance metrics
- Error tracking and alerting
- Audit trail for sensitive operations
- API usage analytics

#### **6. Security Features**
- CORS configuration
- Rate limiting per user/IP
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

#### **7. Documentation**
- OpenAPI/Swagger specification
- Interactive API documentation
- Code examples for each endpoint
- Request/response schemas
- Authentication examples

#### **8. Testing**
- Unit tests for each endpoint
- Integration tests
- Load testing
- Security testing
- API contract testing

### **Response Format Standards:**

#### **Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-16T10:30:00Z"
}
```

#### **Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "timestamp": "2024-01-16T10:30:00Z"
}
```

#### **Paginated Response:**
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  },
  "message": "Data retrieved successfully",
  "timestamp": "2024-01-16T10:30:00Z"
}
```

### **HTTP Status Codes:**
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

### **API Versioning:**
- URL-based versioning: `/api/v1/`
- Header-based versioning: `Accept: application/vnd.sushrusa.v1+json`
- Backward compatibility maintained for at least 2 versions

### **Rate Limiting:**
- **Authenticated users**: 1000 requests/hour
- **Unauthenticated users**: 100 requests/hour
- **Admin endpoints**: 5000 requests/hour
- **File uploads**: 100 requests/hour

---

## **Implementation Priority:**

### **Phase 1 (Core APIs):**
1. Authentication & Authorization
2. Patient Management
3. Consultation Management
4. Basic Payment Processing

### **Phase 2 (Advanced Features):**
1. Prescription Management
2. File Management
3. Notifications
4. Analytics & Reporting

### **Phase 3 (Real-time Features):**
1. WebSocket APIs
2. Video Call Integration
3. Chat Functionality
4. Real-time Notifications

### **Phase 4 (Advanced Analytics):**
1. Super Admin Analytics
2. Custom Reports
3. Performance Monitoring
4. Advanced Security Features

---

*This API documentation covers all functionality required for the complete Sushrusa healthcare platform. Each API should be implemented with proper error handling, validation, and security measures.* 