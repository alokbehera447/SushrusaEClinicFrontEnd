# Sushrusa Healthcare Platform

## API Usage Report: Frontend ↔ Backend

This report details which backend APIs are implemented and used in the frontend, what each API is used for in the frontend, and what the backend is responsible for. Only endpoints actually used in the frontend are included. For the full backend API list, see `API_ENDPOINTS_LIST.md` in the backend repo.

---

## 📊 Summary Table

| Module           | Endpoint (Method)                        | Used in Frontend? | Frontend Usage Summary                |
|------------------|------------------------------------------|-------------------|---------------------------------------|
| Authentication   | /api/auth/send-otp/ (POST)               | ✅                | Send OTP for login/register           |
| Authentication   | /api/auth/verify-otp/ (POST)             | ✅                | Verify OTP, get tokens, login         |
| Authentication   | /api/auth/profile/ (GET)                 | ✅                | Fetch current user profile            |
| Authentication   | /api/auth/profile/ (PUT)                 | ✅                | Update user profile                   |
| Authentication   | /api/auth/refresh/ (POST)                | ✅                | Refresh JWT access token              |
| Authentication   | /api/auth/logout/ (POST)                 | ✅                | Logout, invalidate tokens             |
| Authentication   | /api/auth/change-password/ (POST)        | ✅                | Change user password                  |
| Authentication   | /api/auth/sessions/ (GET, DELETE)        | ✅                | List/terminate user sessions          |
| Patient          | /api/patients/ (GET)                     | ✅                | List/search patients (admin)          |
| Patient          | /api/patients/{id}/ (GET, PUT)           | ✅                | Get/update patient details (admin)    |
| Patient          | /api/patients/search/ (GET)              | ✅                | Search patients (admin)               |
| Patient          | /api/patients/stats/ (GET)               | ✅                | Patient statistics (admin)            |
| Doctor           | /api/doctors/{id}/slots/ (GET, POST, DELETE) | ✅           | Manage/view doctor slots              |
| Doctor           | /api/doctors/{id}/schedule/ (GET, POST, DELETE) | ✅        | Manage/view doctor schedule           |
| Doctor           | /api/doctors/superadmin/ (GET)           | ✅                | List/search doctors (superadmin)      |
| Consultation     | /api/consultations/ (GET, POST)          | ✅                | List/create consultations             |
| Payment          | /api/payments/initiate/ (POST)           | ✅                | Initiate payment for consultation     |
| Payment          | /api/payments/status/ (GET)              | ✅                | Get payment status                    |
| E-Clinic         | /api/eclinic/ (GET, DELETE)              | ✅                | List/delete clinics                   |
| E-Clinic         | /api/eclinic/stats/ (GET)                | ✅                | Clinic statistics                     |
| Analytics        | /api/analytics/dashboard/ (GET)          | ✅                | Dashboard analytics                   |
| Analytics        | /api/analytics/superadmin/overview/ (GET)| ✅                | Superadmin overview analytics         |

---

## 1. Authentication Module

### /api/auth/send-otp/ (POST)
- **Frontend:** Sends phone number to request OTP for login or registration.
- **Backend:** Generates and sends OTP to the user's phone.

### /api/auth/verify-otp/ (POST)
- **Frontend:** Submits phone and OTP to verify and receive JWT tokens.
- **Backend:** Verifies OTP, returns user info and tokens.

### /api/auth/profile/ (GET, PUT)
- **Frontend:** Fetches and updates the current user's profile after login.
- **Backend:** Returns/updates user profile data.

### /api/auth/refresh/ (POST)
- **Frontend:** Refreshes JWT access token using refresh token.
- **Backend:** Issues new access token.

### /api/auth/logout/ (POST)
- **Frontend:** Logs out user, invalidates tokens.
- **Backend:** Invalidates refresh token/session.

### /api/auth/change-password/ (POST)
- **Frontend:** Allows user to change password from profile/settings.
- **Backend:** Validates and updates password.

### /api/auth/sessions/ (GET, DELETE)
- **Frontend:** Lists active sessions, allows user to terminate sessions.
- **Backend:** Returns/terminates user sessions.

---

## 2. Patient Management Module

### /api/patients/ (GET)
- **Frontend:** Admin dashboard lists/searches patients.
- **Backend:** Returns paginated patient list.

### /api/patients/{id}/ (GET, PUT)
- **Frontend:** Admin views/edits patient details.
- **Backend:** Returns/updates patient profile.

### /api/patients/search/ (GET)
- **Frontend:** Admin searches for patients by filters.
- **Backend:** Returns filtered patient list.

### /api/patients/stats/ (GET)
- **Frontend:** Admin dashboard shows patient statistics.
- **Backend:** Returns patient stats (counts, distributions).

---

## 3. Doctor Management Module

### /api/doctors/{id}/slots/ (GET, POST, DELETE)
- **Frontend:** Doctor dashboard manages/view slots; patients see available slots.
- **Backend:** Returns, creates, deletes doctor slots.

### /api/doctors/{id}/schedule/ (GET, POST, DELETE)
- **Frontend:** Doctor dashboard manages/view weekly schedule.
- **Backend:** Returns, creates, deletes schedule entries.

### /api/doctors/superadmin/ (GET)
- **Frontend:** Superadmin dashboard lists/searches doctors.
- **Backend:** Returns doctor list for superadmin.

---

## 4. Consultation Management Module

### /api/consultations/ (GET, POST)
- **Frontend:** Lists consultations for user (doctor/patient/admin); creates new consultations.
- **Backend:** Returns/creates consultation records.

---

## 5. Payment Processing Module

### /api/payments/initiate/ (POST)
- **Frontend:** Initiates payment for a consultation.
- **Backend:** Creates payment intent/session.

### /api/payments/status/ (GET)
- **Frontend:** Checks payment status for a consultation.
- **Backend:** Returns payment status.

---

## 6. E-Clinic Management Module

### /api/eclinic/ (GET, DELETE)
- **Frontend:** Lists clinics (admin/superadmin); can delete clinics.
- **Backend:** Returns/deletes clinic records.

### /api/eclinic/stats/ (GET)
- **Frontend:** Shows clinic statistics in dashboard.
- **Backend:** Returns clinic stats.

---

## 7. Analytics Module

### /api/analytics/dashboard/ (GET)
- **Frontend:** Shows analytics dashboard (admin/doctor/superadmin).
- **Backend:** Returns dashboard analytics data.

### /api/analytics/superadmin/overview/ (GET)
- **Frontend:** Superadmin dashboard overview analytics.
- **Backend:** Returns superadmin analytics overview.

---

## Notes
- Some endpoints (e.g., /api/patients/, /api/doctors/) may have different base paths in backend (e.g., /api/admin/patients/) but are mapped in the frontend as /api/patients/ for admin users.
- Endpoints not used in the frontend (e.g., document upload, reminders, etc.) are omitted from this report.
- For full backend API reference, see `API_ENDPOINTS_LIST.md` in the backend repo. 