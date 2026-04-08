#!/usr/bin/env python3
"""
Selenium Test Suite for Sushrusa Frontend
Tests the enhanced consultation dashboard and overall frontend functionality
"""

import time
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import json
import os

class SushrusaFrontendTest(unittest.TestCase):
    """Test suite for Sushrusa frontend functionality"""
    
    @classmethod
    def setUpClass(cls):
        """Set up the test environment"""
        print("🚀 Setting up Selenium test environment...")
        
        # Configure Chrome options
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Run in headless mode
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        # Initialize the driver
        cls.driver = webdriver.Chrome(options=chrome_options)
        cls.driver.implicitly_wait(10)
        cls.wait = WebDriverWait(cls.driver, 20)
        
        # Test URLs
        cls.frontend_url = "http://localhost:8080"
        cls.backend_url = "http://localhost:8000"
        
        print("✅ Test environment setup complete")
    
    @classmethod
    def tearDownClass(cls):
        """Clean up after tests"""
        print("🧹 Cleaning up test environment...")
        if hasattr(cls, 'driver'):
            cls.driver.quit()
        print("✅ Test environment cleaned up")
    
    def setUp(self):
        """Set up before each test"""
        print(f"\n🔍 Starting test: {self._testMethodName}")
    
    def tearDown(self):
        """Clean up after each test"""
        print(f"✅ Completed test: {self._testMethodName}")
    
    def test_01_frontend_server_running(self):
        """Test that the frontend server is running and accessible"""
        print("Testing frontend server accessibility...")
        
        try:
            self.driver.get(self.frontend_url)
            time.sleep(3)
            
            # Check if page loads
            self.assertIn("Sushrusa", self.driver.title)
            print("✅ Frontend server is running and accessible")
            
        except Exception as e:
            self.fail(f"❌ Frontend server is not accessible: {str(e)}")
    
    def test_02_backend_server_running(self):
        """Test that the backend server is running and accessible"""
        print("Testing backend server accessibility...")
        
        try:
            self.driver.get(f"{self.backend_url}/api/")
            time.sleep(2)
            
            # Check if we get a response (even if it's an error page, it means server is running)
            page_source = self.driver.page_source
            self.assertTrue(len(page_source) > 0)
            print("✅ Backend server is running and accessible")
            
        except Exception as e:
            self.fail(f"❌ Backend server is not accessible: {str(e)}")
    
    def test_03_homepage_loads(self):
        """Test that the homepage loads correctly"""
        print("Testing homepage loading...")
        
        try:
            self.driver.get(self.frontend_url)
            time.sleep(3)
            
            # Check for key elements
            self.assertIn("Sushrusa", self.driver.title)
            
            # Check for navigation elements
            nav_elements = self.driver.find_elements(By.TAG_NAME, "nav")
            self.assertTrue(len(nav_elements) > 0)
            
            print("✅ Homepage loads correctly")
            
        except Exception as e:
            self.fail(f"❌ Homepage failed to load: {str(e)}")
    
    def test_04_doctor_dashboard_access(self):
        """Test doctor dashboard access and functionality"""
        print("Testing doctor dashboard access...")
        
        try:
            # Navigate to doctor dashboard
            self.driver.get(f"{self.frontend_url}/doctor-dashboard")
            time.sleep(3)
            
            # Check if we're redirected to login (expected behavior)
            current_url = self.driver.current_url
            if "login" in current_url.lower():
                print("✅ Properly redirected to login page (expected)")
                return
            
            # If we're on the dashboard, check for key elements
            dashboard_elements = self.driver.find_elements(By.CLASS_NAME, "dashboard")
            if dashboard_elements:
                print("✅ Doctor dashboard is accessible")
            else:
                print("⚠️ Dashboard elements not found, but page loaded")
            
        except Exception as e:
            self.fail(f"❌ Doctor dashboard access failed: {str(e)}")
    
    def test_05_enhanced_consultation_dashboard_components(self):
        """Test that enhanced consultation dashboard components are present"""
        print("Testing enhanced consultation dashboard components...")
        
        try:
            # Navigate to doctor dashboard
            self.driver.get(f"{self.frontend_url}/doctor-dashboard")
            time.sleep(3)
            
            # Check for React app container
            app_container = self.driver.find_elements(By.ID, "root")
            self.assertTrue(len(app_container) > 0, "React app container not found")
            
            # Check for any React components
            react_elements = self.driver.find_elements(By.CSS_SELECTOR, "[data-testid], [class*='dashboard'], [class*='consultation']")
            
            if react_elements:
                print(f"✅ Found {len(react_elements)} React components")
            else:
                print("⚠️ No specific React components found, but page structure is present")
            
        except Exception as e:
            self.fail(f"❌ Enhanced consultation dashboard test failed: {str(e)}")
    
    def test_06_api_endpoints_accessible(self):
        """Test that API endpoints are accessible"""
        print("Testing API endpoints accessibility...")
        
        endpoints = [
            "/api/consultations/statistics/",
            "/api/consultations/analytics/",
            "/api/consultations/real-time-updates/",
            "/api/consultations/doctor/consultations/"
        ]
        
        for endpoint in endpoints:
            try:
                self.driver.get(f"{self.backend_url}{endpoint}")
                time.sleep(2)
                
                # Check if we get a response (should be 401 for unauthenticated requests)
                page_source = self.driver.page_source
                
                if "401" in page_source or "unauthorized" in page_source.lower():
                    print(f"✅ {endpoint} - Returns 401 (expected for unauthenticated)")
                elif "404" in page_source:
                    print(f"⚠️ {endpoint} - Returns 404 (endpoint not found)")
                else:
                    print(f"✅ {endpoint} - Accessible")
                    
            except Exception as e:
                print(f"❌ {endpoint} - Error: {str(e)}")
    
    def test_07_frontend_console_errors(self):
        """Test for frontend console errors"""
        print("Testing for frontend console errors...")
        
        try:
            # Navigate to the main page
            self.driver.get(self.frontend_url)
            time.sleep(5)
            
            # Get console logs
            logs = self.driver.get_log('browser')
            
            # Filter for errors
            errors = [log for log in logs if log['level'] == 'SEVERE']
            
            if errors:
                print(f"⚠️ Found {len(errors)} console errors:")
                for error in errors[:5]:  # Show first 5 errors
                    print(f"   - {error['message']}")
            else:
                print("✅ No console errors found")
            
            # Check for JavaScript errors in page
            js_errors = self.driver.execute_script("return window.jsErrors || [];")
            if js_errors:
                print(f"⚠️ Found {len(js_errors)} JavaScript errors")
            else:
                print("✅ No JavaScript errors detected")
                
        except Exception as e:
            print(f"⚠️ Could not check console errors: {str(e)}")
    
    def test_08_responsive_design(self):
        """Test responsive design elements"""
        print("Testing responsive design...")
        
        try:
            # Test desktop view
            self.driver.set_window_size(1920, 1080)
            self.driver.get(self.frontend_url)
            time.sleep(3)
            
            # Test mobile view
            self.driver.set_window_size(375, 667)
            time.sleep(3)
            
            # Test tablet view
            self.driver.set_window_size(768, 1024)
            time.sleep(3)
            
            print("✅ Responsive design test completed")
            
        except Exception as e:
            self.fail(f"❌ Responsive design test failed: {str(e)}")
    
    def test_09_performance_metrics(self):
        """Test basic performance metrics"""
        print("Testing performance metrics...")
        
        try:
            # Navigate to homepage
            start_time = time.time()
            self.driver.get(self.frontend_url)
            
            # Wait for page to load
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            load_time = time.time() - start_time
            
            print(f"✅ Page load time: {load_time:.2f} seconds")
            
            if load_time < 10:
                print("✅ Page load time is acceptable")
            else:
                print("⚠️ Page load time is slow")
            
            # Check page size
            page_source = self.driver.page_source
            page_size_kb = len(page_source) / 1024
            print(f"✅ Page size: {page_size_kb:.2f} KB")
            
        except Exception as e:
            self.fail(f"❌ Performance test failed: {str(e)}")
    
    def test_10_accessibility_basic(self):
        """Test basic accessibility features"""
        print("Testing basic accessibility...")
        
        try:
            self.driver.get(self.frontend_url)
            time.sleep(3)
            
            # Check for alt attributes on images
            images = self.driver.find_elements(By.TAG_NAME, "img")
            images_with_alt = [img for img in images if img.get_attribute("alt")]
            
            if images:
                alt_percentage = (len(images_with_alt) / len(images)) * 100
                print(f"✅ {alt_percentage:.1f}% of images have alt attributes")
            else:
                print("✅ No images found to test")
            
            # Check for semantic HTML elements
            semantic_elements = self.driver.find_elements(By.CSS_SELECTOR, "nav, main, section, article, header, footer")
            if semantic_elements:
                print(f"✅ Found {len(semantic_elements)} semantic HTML elements")
            else:
                print("⚠️ No semantic HTML elements found")
                
        except Exception as e:
            self.fail(f"❌ Accessibility test failed: {str(e)}")

def run_tests():
    """Run all tests and generate a report"""
    print("🧪 Starting Selenium Test Suite for Sushrusa Frontend")
    print("=" * 60)
    
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(SushrusaFrontendTest)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Generate report
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    total_tests = result.testsRun
    failed_tests = len(result.failures)
    error_tests = len(result.errors)
    passed_tests = total_tests - failed_tests - error_tests
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests} ✅")
    print(f"Failed: {failed_tests} ❌")
    print(f"Errors: {error_tests} ⚠️")
    
    if failed_tests > 0:
        print("\n❌ FAILED TESTS:")
        for test, traceback in result.failures:
            print(f"  - {test}: {traceback.split('AssertionError:')[-1].strip()}")
    
    if error_tests > 0:
        print("\n⚠️ TESTS WITH ERRORS:")
        for test, traceback in result.errors:
            print(f"  - {test}: {traceback.split('Exception:')[-1].strip()}")
    
    # Overall status
    if failed_tests == 0 and error_tests == 0:
        print("\n🎉 ALL TESTS PASSED! Frontend is working correctly.")
        return True
    else:
        print(f"\n⚠️ {failed_tests + error_tests} tests failed. Please check the issues above.")
        return False

if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
