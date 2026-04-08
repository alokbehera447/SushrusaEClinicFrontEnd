# Sushrusa Healthcare Platform - MVP API Documentation

## Table of Contents
1. [MVP Overview](#mvp-overview)
2. [Authentication & Authorization APIs](#1-authentication--authorization-apis)
3. [Patient Management APIs](#2-patient-management-apis)
4. [Consultation Management APIs](#3-consultation-management-apis)
5. [Doctor Management APIs](#4-doctor-management-apis)
6. [Payment Processing APIs](#5-payment-processing-apis)
7. [Prescription Management APIs](#6-prescription-management-apis)
8. [E-Clinic Management APIs](#7-e-clinic-management-apis)
9. [Platform Analytics APIs](#8-platform-analytics-apis)
10. [MVP Implementation Guide](#mvp-implementation-guide)

---

## MVP Overview

### **Enhanced MVP Scope: 93 Core APIs**

The MVP focuses on essential healthcare platform functionality with prescription management, multi-clinic support, and analytics capabilities.

### **Core Features Included:**
- ✅ Multi-clinic management
- ✅ Patient registration and management
- ✅ Doctor assignment and scheduling
- ✅ Consultation booking and management
- ✅ Prescription writing and management
- ✅ Payment processing
- ✅ Platform analytics and reporting
- ✅ Basic user authentication and profiles

### **Features NOT Included (Future Phases):**
- ❌ Real-time video calls
- ❌ Chat functionality
- ❌ Advanced file management
- ❌ Custom reports generation
- ❌ Advanced security features

---

## **1. Authentication & Authorization APIs**

### **User Authentication**
```
POST   /api/auth/login                 # Login  
POST   /api/auth/logout                # Logout
POST   /api/auth/refresh               # Refresh JWT token
POST   /api/auth/forgot-password       # Send password reset email
POST   /api/auth/reset-password        # Reset password with token
GET    /api/auth/profile               # Get current user profile
PUT    /api/auth/profile               # Update current user profile
POST   /api/auth/verify-token          # Verify JWT token validity
```

### **Request/Response Examples:**

#### **Login Request:**
```json
POST /api/auth/login
{
  "email": "doctor@example.com",
  "password": "securepassword123"
}
```

#### **Login Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "USR001",
      "email": "doctor@example.com",
      "role": "doctor",
      "name": "Dr. John Smith"
    },
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "message": "Login successful",
  "timestamp": "2024-01-16T10:30:00Z"
}
```

---

## **2. Patient Management APIs**

### **Admin Patient Management**
```
GET    /api/admin/patients                        # List patients (with filters)
GET    /api/admin/patients/:id                    # Get patient details
POST   /api/admin/patients                        # Register new patient
PUT    /api/admin/patients/:id                    # Update patient info
DELETE /api/admin/patients/:id                    # Soft delete patient
GET    /api/admin/patients/search                 # Search patients
```

### **Patient Profile Management**
```
GET    /api/patient/profile                        # Get my profile
PUT    /api/patient/profile                        # Update my profile
POST   /api/patient/profile/photo                  # Upload profile photo
GET    /api/patient/medical-records                # Get my medical records
POST   /api/patient/medical-records                # Add medical record
```

### **Request/Response Examples:**

#### **Register Patient Request:**
```json
POST /api/admin/patients
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+91 98765 43210",
  "dateOfBirth": "1990-05-15",
  "gender": "male",
  "address": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "emergencyContact": {
    "name": "Priya Sharma",
    "phone": "+91 87654 32109",
    "relationship": "spouse"
  }
}
```

#### **Patient List Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "PAT001",
        "name": "Rahul Sharma",
        "email": "rahul@example.com",
        "phone": "+91 98765 43210",
        "age": 34,
        "gender": "male",
        "lastVisit": "2024-01-15",
        "status": "active"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15
    }
  },
  "message": "Patients retrieved successfully",
  "timestamp": "2024-01-16T10:30:00Z"
}
```

---

## **3. Consultation Management APIs**

### **Admin Consultation Management**
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

### **Doctor Consultation Management**
```
GET    /api/doctor/consultations                  # List my consultations
GET    /api/doctor/consultations/:id              # Get consultation details
PUT    /api/doctor/consultations/:id/start        # Start consultation
PUT    /api/doctor/consultations/:id/end          # End consultation
GET    /api/doctor/consultations/today            # Today's consultations
GET    /api/doctor/consultations/upcoming         # Upcoming consultations
```

### **Patient Consultation Booking**
```
GET    /api/patient/consultations                 # List my consultations
GET    /api/patient/consultations/:id             # Get consultation details
POST   /api/patient/consultations                 # Book consultation
PUT    /api/patient/consultations/:id/cancel      # Cancel consultation
GET    /api/patient/consultations/upcoming        # Upcoming consultations
```

### **Request/Response Examples:**

#### **Create Consultation Request:**
```json
POST /api/admin/consultations
{
  "patientId": "PAT001",
  "doctorId": "DOC001",
  "scheduledDate": "2024-01-20",
  "scheduledTime": "10:30",
  "consultationType": "video",
  "reason": "Follow-up for diabetes management",
  "duration": 30,
  "fee": 500
}
```

#### **Consultation Details Response:**
```json
{
  "success": true,
  "data": {
    "id": "CON001",
    "patient": {
      "id": "PAT001",
      "name": "Rahul Sharma",
      "phone": "+91 98765 43210"
    },
    "doctor": {
      "id": "DOC001",
      "name": "Dr. Priya Singh",
      "specialty": "Endocrinology"
    },
    "scheduledDate": "2024-01-20",
    "scheduledTime": "10:30",
    "consultationType": "video",
    "status": "scheduled",
    "reason": "Follow-up for diabetes management",
    "duration": 30,
    "fee": 500,
    "createdAt": "2024-01-16T10:30:00Z"
  },
  "message": "Consultation created successfully",
  "timestamp": "2024-01-16T10:30:00Z"
}
```

---

## **4. Doctor Management APIs**

### **Admin Doctor Management**
```
GET    /api/admin/doctors                         # List doctors in clinic
GET    /api/admin/doctors/:id                     # Get doctor details
GET    /api/admin/doctors/available               # Get available doctors
GET    /api/admin/doctors/:id/schedule            # Get doctor schedule
PUT    /api/admin/doctors/:id/schedule            # Update doctor schedule
```

### **Patient Doctor Discovery**
```
GET    /api/patient/doctors                       # List available doctors
GET    /api/patient/doctors/:id                   # Get doctor details
GET    /api/patient/doctors/search                # Search doctors
GET    /api/patient/doctors/:id/schedule          # Get doctor schedule
POST   /api/patient/doctors/:id/rating            # Rate doctor
```

### **Request/Response Examples:**

#### **Doctor List Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "DOC001",
        "name": "Dr. Priya Singh",
        "email": "priya.singh@clinic.com",
        "phone": "+91 98765 43211",
        "specialty": "Endocrinology",
        "qualification": "MD, DM Endocrinology",
        "experience": "8 years",
        "rating": 4.8,
        "consultations": 245,
        "availability": "Mon-Fri, 9AM-5PM",
        "status": "active"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  },
  "message": "Doctors retrieved successfully",
  "timestamp": "2024-01-16T10:30:00Z"
}
```

---

## **5. Payment Processing APIs**

### **Admin Payment Management**
```
GET    /api/admin/payments                        # List payments (with filters)
GET    /api/admin/payments/:id                    # Get payment details
POST   /api/admin/payments                        # Process payment
PUT    /api/admin/payments/:id                    # Update payment status
GET    /api/admin/payments/today                  # Today's payments
GET    /api/admin/payments/stats                  # Payment statistics
```

### **Patient Payment**
```
GET    /api/patient/payments                      # List my payments
GET    /api/patient/payments/:id                  # Get payment details
POST   /api/patient/payments                      # Make payment
GET    /api/patient/payments/:id/receipt          # Download receipt
```

### **Request/Response Examples:**

#### **Process Payment Request:**
```json
POST /api/admin/payments
{
  "consultationId": "CON001",
  "patientId": "PAT001",
  "amount": 500,
  "paymentMethod": "card",
  "cardDetails": {
    "cardNumber": "4111111111111111",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123"
  }
}
```

#### **Payment Response:**
```json
{
  "success": true,
  "data": {
    "id": "PAY001",
    "consultationId": "CON001",
    "patientId": "PAT001",
    "amount": 500,
    "paymentMethod": "card",
    "status": "completed",
    "transactionId": "TXN123456789",
    "processedAt": "2024-01-16T10:30:00Z",
    "receiptUrl": "/api/admin/payments/PAY001/receipt"
  },
  "message": "Payment processed successfully",
  "timestamp": "2024-01-16T10:30:00Z"
}
```

---

## **6. Prescription Management APIs**

### **Admin Prescription Management**
```
GET    /api/admin/consultations/:id/prescription  # Get prescription
POST   /api/admin/consultations/:id/prescription  # Create prescription
PUT    /api/admin/prescriptions/:id               # Update prescription
DELETE /api/admin/prescriptions/:id               # Discontinue prescription
POST   /api/admin/prescriptions/:id/pdf           # Generate prescription PDF
GET    /api/admin/prescriptions/:id/pdf           # Download prescription PDF
```

### **Doctor Prescription Management**
```
GET    /api/doctor/prescriptions                  # List my prescriptions
GET    /api/doctor/prescriptions/:id              # Get prescription details
POST   /api/doctor/consultations/:id/prescription # Write prescription
PUT    /api/doctor/prescriptions/:id              # Update prescription
DELETE /api/doctor/prescriptions/:id              # Discontinue prescription
POST   /api/doctor/prescriptions/:id/pdf          # Generate prescription PDF
```

### **Patient Prescription Access**
```
GET    /api/patient/prescriptions                 # List my prescriptions
GET    /api/patient/prescriptions/:id             # Get prescription details
GET    /api/patient/prescriptions/:id/pdf         # Download prescription PDF
```

### **Request/Response Examples:**

#### **Write Prescription Request:**
```json
POST /api/doctor/consultations/CON001/prescription
{
  "medicines": [
    {
      "name": "Metformin",
      "strength": "500mg",
      "dosage": "1 tablet",
      "frequency": "twice daily",
      "duration": "30 days",
      "instructions": "Take with meals"
    },
    {
      "name": "Glimepiride",
      "strength": "1mg",
      "dosage": "1 tablet",
      "frequency": "once daily",
      "duration": "30 days",
      "instructions": "Take 30 minutes before breakfast"
    }
  ],
  "instructions": "Monitor blood sugar levels daily. Follow up in 2 weeks.",
  "diagnosis": "Type 2 Diabetes Mellitus",
  "nextFollowUp": "2024-02-01"
}
```

#### **Prescription Response:**
```json
{
  "success": true,
  "data": {
    "id": "RX001",
    "consultationId": "CON001",
    "patientId": "PAT001",
    "doctorId": "DOC001",
    "medicines": [
      {
        "id": "MED001",
        "name": "Metformin",
        "strength": "500mg",
        "dosage": "1 tablet",
        "frequency": "twice daily",
        "duration": "30 days",
        "instructions": "Take with meals"
      }
    ],
    "instructions": "Monitor blood sugar levels daily. Follow up in 2 weeks.",
    "diagnosis": "Type 2 Diabetes Mellitus",
    "nextFollowUp": "2024-02-01",
    "status": "active",
    "writtenDate": "2024-01-16",
    "pdfUrl": "/api/doctor/prescriptions/RX001/pdf"
  },
  "message": "Prescription written successfully",
  "timestamp": "2024-01-16T10:30:00Z"
}
```

---

## **7. E-Clinic Management APIs**

### **Super Admin E-Clinic Management**
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

### **Request/Response Examples:**

#### **Create E-Clinic Request:**
```json
POST /api/superadmin/clinics
{
  "name": "Sushrusa Clinic - Mumbai",
  "address": {
    "street": "456 Healthcare Avenue",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "contact": {
    "phone": "+91 22 1234 5678",
    "email": "mumbai@sushrusa.com",
    "website": "https://mumbai.sushrusa.com"
  },
  "operatingHours": {
    "monday": "9:00-18:00",
    "tuesday": "9:00-18:00",
    "wednesday": "9:00-18:00",
    "thursday": "9:00-18:00",
    "friday": "9:00-18:00",
    "saturday": "9:00-14:00",
    "sunday": "closed"
  },
  "specialties": ["Cardiology", "Endocrinology", "Orthopedics"],
  "capacity": 50
}
```

#### **Clinic List Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "CLI001",
        "name": "Sushrusa Clinic - Mumbai",
        "address": {
          "city": "Mumbai",
          "state": "Maharashtra"
        },
        "status": "active",
        "doctorsCount": 8,
        "adminsCount": 3,
        "patientsCount": 1247,
        "consultationsToday": 24,
        "revenueToday": 12000
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  },
  "message": "Clinics retrieved successfully",
  "timestamp": "2024-01-16T10:30:00Z"
}
```

---

## **8. Platform Analytics APIs**

### **Super Admin Analytics**
```
GET    /api/superadmin/analytics/overview         # Platform overview stats
GET    /api/superadmin/analytics/revenue          # Revenue analytics
GET    /api/superadmin/analytics/consultations    # Consultation analytics
GET    /api/superadmin/analytics/patients         # Patient analytics
GET    /api/superadmin/analytics/clinics          # Clinic performance
GET    /api/superadmin/analytics/doctors          # Doctor performance
```

### **Admin Dashboard Analytics**
```
GET    /api/admin/dashboard/overview              # Dashboard overview
GET    /api/admin/dashboard/consultations         # Consultation analytics
GET    /api/admin/dashboard/patients              # Patient analytics
GET    /api/admin/dashboard/payments              # Payment analytics
```

### **Request/Response Examples:**

#### **Platform Overview Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalClinics": 5,
      "totalDoctors": 25,
      "totalPatients": 8247,
      "totalConsultations": 1892,
      "totalRevenue": 245680,
      "activeUsers": 156
    },
    "today": {
      "consultations": 24,
      "newPatients": 8,
      "revenue": 12450,
      "completedConsultations": 18
    },
    "thisMonth": {
      "consultations": 892,
      "newPatients": 234,
      "revenue": 156780,
      "growth": 18.5
    },
    "topClinics": [
      {
        "id": "CLI001",
        "name": "Sushrusa Clinic - Mumbai",
        "consultations": 245,
        "revenue": 45600
      }
    ]
  },
  "message": "Analytics retrieved successfully",
  "timestamp": "2024-01-16T10:30:00Z"
}
```

---

## MVP Implementation Guide

### **📊 MVP API Summary**
- **Authentication**: 8 APIs
- **Patient Management**: 12 APIs
- **Consultation Management**: 20 APIs
- **Doctor Management**: 10 APIs
- **Payment Processing**: 10 APIs
- **Prescription Management**: 15 APIs
- **E-Clinic Management**: 8 APIs
- **Platform Analytics**: 10 APIs
- **Total MVP APIs**: **93 APIs**

### **📅 Development Timeline (4-5 Months)**

#### **Month 1: Foundation**
- Authentication & Authorization (8 APIs)
- Patient Management (12 APIs)
- Database design and setup
- Basic security implementation

#### **Month 2: Core Features**
- Doctor Management (10 APIs)
- Consultation Management (20 APIs)
- Basic payment integration
- User interface development

#### **Month 3: Advanced Features**
- Payment Processing (10 APIs)
- Prescription Management (15 APIs)
- File upload functionality
- Testing and bug fixes

#### **Month 4: Analytics & Management**
- E-Clinic Management (8 APIs)
- Platform Analytics (10 APIs)
- Dashboard development
- Integration testing

#### **Month 5: Finalization**
- End-to-end testing
- Performance optimization
- Security audit
- Deployment and launch

### **💰 Cost Estimation**

#### **Development Costs:**
- **Senior Developer**: $35,000-50,000
- **Mid-Level Developer**: $25,000-35,000
- **Junior Developer**: $18,000-28,000
- **Offshore Senior**: $25,000-40,000

#### **Additional Costs:**
- **Infrastructure**: $200-500/month
- **Third-party Services**: $300-800/month
- **Testing & Security**: $5,000-10,000
- **Documentation**: $2,000-5,000

### **🛠️ Technical Requirements**

#### **Backend Stack:**
- **Framework**: Node.js/Express or Python/Django
- **Database**: PostgreSQL with Redis cache
- **Authentication**: JWT tokens
- **File Storage**: AWS S3 or similar
- **Payment Gateway**: Stripe/Razorpay
- **Email Service**: SendGrid/AWS SES

#### **Infrastructure:**
- **Hosting**: AWS/Azure/GCP
- **CDN**: CloudFront/Cloud CDN
- **Monitoring**: CloudWatch/Application Insights
- **CI/CD**: GitHub Actions/Azure DevOps

### **📈 Success Metrics**

#### **Technical Metrics:**
- API response time < 200ms
- 99.9% uptime
- Zero security vulnerabilities
- 100% test coverage for critical APIs

#### **Business Metrics:**
- Patient registration completion rate > 90%
- Consultation booking success rate > 95%
- Payment processing success rate > 98%
- User satisfaction score > 4.5/5

### **🚀 Launch Checklist**

#### **Pre-Launch:**
- [ ] All 93 APIs implemented and tested
- [ ] Database optimized and secured
- [ ] Payment gateway integrated
- [ ] Email notifications working
- [ ] Mobile responsiveness verified
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Documentation finalized

#### **Launch Day:**
- [ ] Production environment deployed
- [ ] SSL certificates installed
- [ ] Monitoring alerts configured
- [ ] Backup systems verified
- [ ] Support team ready
- [ ] Marketing materials prepared

#### **Post-Launch:**
- [ ] Monitor system performance
- [ ] Collect user feedback
- [ ] Fix any critical bugs
- [ ] Plan feature enhancements
- [ ] Scale infrastructure as needed

---

## **API Standards & Best Practices**

### **Response Format:**
All APIs follow a consistent response format with success/error indicators, data payload, and timestamps.

### **Error Handling:**
Standardized error codes and messages for consistent user experience.

### **Security:**
- JWT token authentication
- Role-based authorization
- Input validation and sanitization
- Rate limiting
- CORS configuration

### **Performance:**
- Database query optimization
- Response caching
- Pagination for large datasets
- Compression for responses

---

*This MVP API documentation provides a complete foundation for the Sushrusa healthcare platform with all essential features for a successful launch.* 