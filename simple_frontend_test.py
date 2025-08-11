#!/usr/bin/env python3
"""
Simple Frontend Test for Sushrusa
Tests basic functionality without requiring Selenium/Chrome
"""

import requests
import time
import json
import sys
from urllib.parse import urljoin

class SimpleFrontendTest:
    """Simple test class for frontend functionality"""
    
    def __init__(self):
        self.frontend_url = "http://localhost:8080"
        self.backend_url = "http://localhost:8000"
        self.test_results = []
    
    def log_test(self, test_name, success, message=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message
        })
    
    def test_frontend_server(self):
        """Test if frontend server is running"""
        try:
            response = requests.get(self.frontend_url, timeout=10)
            if response.status_code == 200:
                self.log_test("Frontend Server", True, "Server is running and responding")
                return True
            else:
                self.log_test("Frontend Server", False, f"Server returned status {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Frontend Server", False, f"Connection failed: {str(e)}")
            return False
    
    def test_backend_server(self):
        """Test if backend server is running"""
        try:
            response = requests.get(f"{self.backend_url}/api/", timeout=10)
            if response.status_code in [200, 401, 403]:  # Any response means server is running
                self.log_test("Backend Server", True, "Server is running and responding")
                return True
            else:
                self.log_test("Backend Server", False, f"Server returned status {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Backend Server", False, f"Connection failed: {str(e)}")
            return False
    
    def test_frontend_content(self):
        """Test if frontend returns expected content"""
        try:
            response = requests.get(self.frontend_url, timeout=10)
            content = response.text.lower()
            
            # Check for React/Vite indicators
            react_indicators = [
                "react",
                "vite",
                "script type=\"module\"",
                "html",
                "head",
                "body"
            ]
            
            found_indicators = [indicator for indicator in react_indicators if indicator in content]
            
            if len(found_indicators) >= 3:
                self.log_test("Frontend Content", True, f"Found React/Vite indicators: {', '.join(found_indicators[:3])}")
                return True
            else:
                self.log_test("Frontend Content", False, f"Missing React/Vite indicators. Found: {found_indicators}")
                return False
                
        except Exception as e:
            self.log_test("Frontend Content", False, f"Content check failed: {str(e)}")
            return False
    
    def test_api_endpoints(self):
        """Test if API endpoints are accessible"""
        endpoints = [
            "/api/consultations/statistics/",
            "/api/consultations/analytics/",
            "/api/consultations/real-time-updates/",
            "/api/consultations/doctor/consultations/"
        ]
        
        all_accessible = True
        
        for endpoint in endpoints:
            try:
                response = requests.get(f"{self.backend_url}{endpoint}", timeout=10)
                
                if response.status_code == 401:
                    self.log_test(f"API Endpoint {endpoint}", True, "Returns 401 (expected for unauthenticated)")
                elif response.status_code == 404:
                    self.log_test(f"API Endpoint {endpoint}", False, "Returns 404 (endpoint not found)")
                    all_accessible = False
                elif response.status_code == 500:
                    self.log_test(f"API Endpoint {endpoint}", False, "Returns 500 (server error)")
                    all_accessible = False
                else:
                    self.log_test(f"API Endpoint {endpoint}", True, f"Returns {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"API Endpoint {endpoint}", False, f"Connection failed: {str(e)}")
                all_accessible = False
        
        return all_accessible
    
    def test_frontend_routes(self):
        """Test if frontend routes are accessible"""
        routes = [
            "/",
            "/doctor-dashboard",
            "/login",
            "/register"
        ]
        
        all_accessible = True
        
        for route in routes:
            try:
                response = requests.get(f"{self.frontend_url}{route}", timeout=10)
                
                if response.status_code == 200:
                    self.log_test(f"Frontend Route {route}", True, "Route accessible")
                else:
                    self.log_test(f"Frontend Route {route}", False, f"Returns {response.status_code}")
                    all_accessible = False
                    
            except Exception as e:
                self.log_test(f"Frontend Route {route}", False, f"Connection failed: {str(e)}")
                all_accessible = False
        
        return all_accessible
    
    def test_performance(self):
        """Test basic performance metrics"""
        try:
            start_time = time.time()
            response = requests.get(self.frontend_url, timeout=10)
            load_time = time.time() - start_time
            
            if load_time < 5:
                self.log_test("Performance", True, f"Page loads in {load_time:.2f}s (fast)")
            elif load_time < 10:
                self.log_test("Performance", True, f"Page loads in {load_time:.2f}s (acceptable)")
            else:
                self.log_test("Performance", False, f"Page loads in {load_time:.2f}s (slow)")
                return False
            
            # Check content size
            content_size_kb = len(response.content) / 1024
            if content_size_kb < 1000:  # Less than 1MB
                self.log_test("Content Size", True, f"Page size: {content_size_kb:.1f}KB")
            else:
                self.log_test("Content Size", False, f"Page size: {content_size_kb:.1f}KB (large)")
                return False
                
            return True
            
        except Exception as e:
            self.log_test("Performance", False, f"Performance test failed: {str(e)}")
            return False
    
    def generate_report(self):
        """Generate test report"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print("\n" + "=" * 60)
        print("📊 SIMPLE FRONTEND TEST REPORT")
        print("=" * 60)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        # Overall status
        if failed_tests == 0:
            print("\n🎉 ALL TESTS PASSED! Frontend is working correctly.")
            return True
        else:
            print(f"\n⚠️ {failed_tests} tests failed. Please check the issues above.")
            return False
    
    def run_all_tests(self):
        """Run all tests"""
        print("🧪 Starting Simple Frontend Test Suite")
        print("=" * 60)
        
        # Run tests
        self.test_frontend_server()
        self.test_backend_server()
        self.test_frontend_content()
        self.test_api_endpoints()
        self.test_frontend_routes()
        self.test_performance()
        
        # Generate report
        return self.generate_report()

def main():
    """Main function"""
    tester = SimpleFrontendTest()
    success = tester.run_all_tests()
    
    # Save results to file
    with open("simple_test_results.json", "w") as f:
        json.dump(tester.test_results, f, indent=2)
    
    exit(0 if success else 1)

if __name__ == "__main__":
    main()
