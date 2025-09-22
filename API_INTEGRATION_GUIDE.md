# API Integration Guide - Public Patient Registration

## Overview
This guide documents the implementation of the public patient registration API that allows users to create accounts from the homepage without requiring OTP verification.

## Implementation Details

### 1. Backend API Endpoint
**Endpoint:** `POST /api/auth/public/register/`
**Authentication:** None required (public endpoint)

### 2. Request Payload
```typescript
interface PublicPatientRegistrationData {
  name: string;           // Full name of the patient
  email: string;          // Email address
  phone: string;          // Phone number
  age: number;            // Age in years
  gender: string;         // "Male", "Female", or "Other"
  address: string;        // Full address
  city: string;           // City name
  state: string;          // State name
  pincode: string;        // 6-digit pincode
  country?: string;       // Country (defaults to "India")
}
```

### 3. Response Format
```typescript
interface PublicPatientRegistrationResponse {
  id: string;                    // Patient profile ID
  user_id: string;              // User account ID
  name: string;                 // Registered name
  email: string;                // Registered email
  phone: string;                // Registered phone
  message: string;              // Success message
  success: boolean;             // Registration status
  nearest_eclinics?: EClinic[]; // Optional: Nearby eClinics
}
```

### 4. Error Handling
The API uses Django REST Framework's standard error format:
- **Field validation errors:** Returns field-specific error messages
- **General errors:** Returns error message in `error` or `message` field
- **HTTP status codes:** 400 for validation errors, 500 for server errors

## Frontend Integration

### 1. API Function Location
File: `src/lib/api.ts`
```typescript
export const publicApi = {
  registerPatient: async (patientData: PublicPatientRegistrationData): Promise<PublicPatientRegistrationResponse> => {
    const response = await api.post<ApiResponse<PublicPatientRegistrationResponse>>('/api/auth/public/register/', patientData);
    return response.data.data;
  }
};
```

### 2. Component Usage
File: `src/components/detail-pages/CreateAccountModal.tsx`

The modal component handles:
- ✅ **Form validation:** Client-side validation for all required fields
- ✅ **API integration:** Calls the registration endpoint
- ✅ **Error handling:** Displays field-specific and general errors
- ✅ **Success feedback:** Shows success message and account details
- ✅ **Form reset:** Clears form when modal is closed
- ✅ **Loading states:** Shows loading spinner during submission

### 3. User Experience Flow
1. **User clicks "Create Account"** on homepage
2. **Step 1:** Personal information (name, age, email, phone, gender)
3. **Step 2:** Address information (address, city, state, pincode)
4. **API Call:** Registration data sent to backend
5. **Success:** Account created, user shown confirmation with instructions

## Backend Requirements

### 1. Django Endpoint Implementation
The backend needs to implement the following endpoint:

```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('api/auth/public/register/', views.PublicPatientRegistrationView.as_view(), name='public_register'),
]

# views.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

class PublicPatientRegistrationView(APIView):
    permission_classes = [AllowAny]  # No authentication required
    
    def post(self, request):
        try:
            # Extract data from request
            data = request.data
            
            # Validate required fields
            required_fields = ['name', 'email', 'phone', 'age', 'gender', 'address', 'city', 'state', 'pincode']
            for field in required_fields:
                if not data.get(field):
                    return Response({
                        'error': f'{field} is required'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create user account
            user = User.objects.create_user(
                username=data['phone'],  # Use phone as username
                email=data['email'],
                first_name=data['name'].split()[0],
                last_name=' '.join(data['name'].split()[1:]) if len(data['name'].split()) > 1 else '',
                phone=data['phone']
            )
            
            # Create patient profile
            patient = PatientProfile.objects.create(
                user=user,
                date_of_birth=None,  # Can be calculated from age if needed
                gender=data['gender'],
                street=data['address'],
                city=data['city'],
                state=data['state'],
                pincode=data['pincode'],
                country=data.get('country', 'India')
            )
            
            # Optional: Find nearest eClinics based on location
            nearest_eclinics = EClinic.objects.filter(
                city__icontains=data['city'],
                state__icontains=data['state'],
                is_active=True,
                is_verified=True
            )[:3]
            
            return Response({
                'success': True,
                'data': {
                    'id': str(patient.id),
                    'user_id': str(user.id),
                    'name': data['name'],
                    'email': data['email'],
                    'phone': data['phone'],
                    'message': 'Account created successfully! Please visit your nearest eClinic to book consultations.',
                    'success': True,
                    'nearest_eclinics': [
                        {
                            'id': str(clinic.id),
                            'name': clinic.name,
                            'city': clinic.city,
                            'state': clinic.state,
                            'phone': clinic.phone,
                            'address': f"{clinic.street}, {clinic.city}, {clinic.state} - {clinic.pincode}"
                        } for clinic in nearest_eclinics
                    ] if nearest_eclinics else []
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': 'Registration failed. Please try again.',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

### 2. Database Models
Ensure your Django models support the required fields:

```python
# models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    phone = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=True)
    # ... other fields

class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10)
    street = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    country = models.CharField(max_length=100, default='India')
    # ... other fields
```

## Testing

### 1. Frontend Testing
Test the modal functionality:
```bash
# Start the development server
npm run dev

# Open browser and navigate to homepage
# Click "Create Account" button
# Fill out the form and test submission
```

### 2. API Testing
Test the endpoint directly:
```bash
curl -X POST http://127.0.0.1:8000/api/auth/public/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "9876543210",
    "age": 30,
    "gender": "Male",
    "address": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }'
```

## Security Considerations

1. **Rate Limiting:** Implement rate limiting to prevent spam registrations
2. **Email Validation:** Consider email verification for account activation
3. **Phone Validation:** Validate phone number format and uniqueness
4. **Data Sanitization:** Sanitize input data to prevent XSS attacks
5. **CORS:** Configure CORS settings appropriately for production

## Production Deployment

1. **Environment Variables:** Configure API base URL for production
2. **Error Logging:** Implement proper error logging and monitoring
3. **Database Backups:** Ensure patient data is backed up securely
4. **SSL/TLS:** Use HTTPS for all API communications
5. **Privacy Compliance:** Ensure GDPR/privacy law compliance for patient data

## Troubleshooting

### Common Issues:
1. **CORS Errors:** Check Django CORS settings
2. **404 Errors:** Verify URL routing in Django
3. **Validation Errors:** Check field requirements and formats
4. **Network Errors:** Verify API base URL configuration

### Debug Mode:
Enable console logging in `src/lib/utils.ts` to debug API calls:
```typescript
// The API interceptors already include debug logging
console.log('🚀 API Request:', {
  method: config.method?.toUpperCase(),
  url: `${config.baseURL}${config.url}`,
  params: config.params,
  hasToken: !!token
});
```
