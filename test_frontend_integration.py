#!/usr/bin/env python3
"""
Test Frontend Integration with Updated API Structure
"""

import requests
import json
import time

def test_frontend_integration():
    """Test the frontend integration with the updated API structure"""
    
    frontend_url = "http://localhost:8081"
    backend_url = "http://localhost:8000"
    
    print("🧪 Testing Frontend Integration with Updated API Structure")
    print("=" * 60)
    
    # Test 1: Frontend accessibility
    print("\n1. Testing Frontend Accessibility...")
    try:
        response = requests.get(frontend_url, timeout=10)
        if response.status_code == 200:
            print("✅ Frontend is accessible on port 8081")
        else:
            print(f"❌ Frontend returned status {response.status_code}")
    except Exception as e:
        print(f"❌ Frontend not accessible: {str(e)}")
    
    # Test 2: Backend API endpoints
    print("\n2. Testing Backend API Endpoints...")
    endpoints = [
        "/api/consultations/statistics/",
        "/api/consultations/analytics/",
        "/api/consultations/real-time-updates/",
        "/api/consultations/doctor/consultations/"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{backend_url}{endpoint}", timeout=5)
            if response.status_code == 401:
                print(f"✅ {endpoint} - Returns 401 (authentication required)")
            elif response.status_code == 200:
                print(f"✅ {endpoint} - Returns 200 (working)")
            else:
                print(f"⚠️ {endpoint} - Returns {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint} - Error: {str(e)}")
    
    # Test 3: Doctor Dashboard Page
    print("\n3. Testing Doctor Dashboard Page...")
    try:
        response = requests.get(f"{frontend_url}/doctor-dashboard", timeout=10)
        if response.status_code == 200:
            content = response.text.lower()
            if "react" in content and "vite" in content:
                print("✅ Doctor Dashboard page loads with React/Vite")
            else:
                print("⚠️ Doctor Dashboard page loads but missing React indicators")
        else:
            print(f"❌ Doctor Dashboard returned status {response.status_code}")
    except Exception as e:
        print(f"❌ Doctor Dashboard error: {str(e)}")
    
    # Test 4: API Response Structure
    print("\n4. Testing API Response Structure...")
    try:
        response = requests.get(f"{backend_url}/api/consultations/statistics/", timeout=5)
        if response.status_code == 401:
            print("✅ API returns 401 (expected for unauthenticated)")
            # Try to parse the response structure
            try:
                data = response.json()
                if "detail" in data:
                    print("✅ API response structure is correct (401 error format)")
                else:
                    print("⚠️ API response structure unexpected")
            except json.JSONDecodeError:
                print("⚠️ API response is not valid JSON")
        else:
            print(f"⚠️ API returned unexpected status {response.status_code}")
    except Exception as e:
        print(f"❌ API structure test error: {str(e)}")
    
    print("\n" + "=" * 60)
    print("🎯 Frontend Integration Test Complete!")
    print("=" * 60)
    print("\n📋 Summary:")
    print("• Frontend should be running on http://localhost:8081")
    print("• Backend should be running on http://localhost:8000")
    print("• API endpoints should return 401 (authentication required)")
    print("• Frontend components should load with React/Vite")
    print("\n🚀 Next Steps:")
    print("1. Open http://localhost:8081/doctor-dashboard in your browser")
    print("2. Log in with a doctor account to see the enhanced dashboard")
    print("3. Check that consultation data is displaying correctly")

if __name__ == "__main__":
    test_frontend_integration()
