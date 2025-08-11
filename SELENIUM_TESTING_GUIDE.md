# 🧪 Selenium Testing Guide for Sushrusa Frontend

This guide explains how to run automated tests to verify the frontend functionality is working correctly.

## 📋 Prerequisites

### 1. System Requirements
- Python 3.8+
- Chrome browser installed
- Both frontend and backend servers running

### 2. Server Setup
Make sure both servers are running:

```bash
# Backend (in sushrusa_backend directory)
cd sushrusa_backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000

# Frontend (in sushrusa-homepage-design-hub directory)
cd sushrusa-homepage-design-hub
npm run dev
```

## 🚀 Quick Start

### Option 1: Simple Test Runner (Recommended)
```bash
cd sushrusa-homepage-design-hub
python run_selenium_tests.py
```

### Option 2: Direct Test Execution
```bash
cd sushrusa-homepage-design-hub
python selenium_test.py
```

## 📊 Test Coverage

The Selenium test suite covers the following areas:

### 1. **Server Accessibility Tests**
- ✅ Frontend server running and accessible
- ✅ Backend server running and accessible
- ✅ API endpoints responding correctly

### 2. **Frontend Functionality Tests**
- ✅ Homepage loads correctly
- ✅ Doctor dashboard access
- ✅ Enhanced consultation dashboard components
- ✅ React app container presence

### 3. **API Integration Tests**
- ✅ `/api/consultations/statistics/` endpoint
- ✅ `/api/consultations/analytics/` endpoint
- ✅ `/api/consultations/real-time-updates/` endpoint
- ✅ `/api/consultations/doctor/consultations/` endpoint

### 4. **Error Detection Tests**
- ✅ Frontend console errors
- ✅ JavaScript runtime errors
- ✅ Network request failures

### 5. **Performance & UX Tests**
- ✅ Page load times
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Basic accessibility features
- ✅ Page size optimization

## 🔧 Test Configuration

### Chrome Options
The tests run Chrome in headless mode with the following configuration:
```python
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--window-size=1920,1080")
```

### Test URLs
- **Frontend**: `http://localhost:8080`
- **Backend**: `http://localhost:8000`

## 📈 Understanding Test Results

### Test Status Indicators
- ✅ **Passed**: Test completed successfully
- ❌ **Failed**: Test failed with assertion error
- ⚠️ **Error**: Test encountered an exception
- 🔍 **Info**: Test provided information

### Performance Metrics
- **Page Load Time**: Should be < 10 seconds
- **Page Size**: Optimized for web performance
- **Console Errors**: Should be 0 for production-ready code

### Expected Behaviors
1. **Unauthenticated Access**: Should redirect to login (401 responses)
2. **API Endpoints**: Should return proper HTTP status codes
3. **React Components**: Should render without JavaScript errors
4. **Responsive Design**: Should adapt to different screen sizes

## 🛠️ Troubleshooting

### Common Issues

#### 1. **ChromeDriver Not Found**
```bash
# Install ChromeDriver
pip install webdriver-manager
```

#### 2. **Servers Not Running**
```bash
# Check if servers are running
curl http://localhost:8080  # Frontend
curl http://localhost:8000/api/  # Backend
```

#### 3. **Permission Errors**
```bash
# Make test files executable
chmod +x selenium_test.py
chmod +x run_selenium_tests.py
```

#### 4. **Dependencies Missing**
```bash
# Install required packages
pip install -r selenium_requirements.txt
```

### Debug Mode
To run tests in debug mode (with browser visible):
```python
# In selenium_test.py, comment out the headless option:
# chrome_options.add_argument("--headless")
```

## 📝 Test Customization

### Adding New Tests
1. Create a new test method in `SushrusaFrontendTest` class
2. Follow the naming convention: `test_XX_description`
3. Use descriptive assertions and error messages

### Example Test Method
```python
def test_11_custom_feature(self):
    """Test custom feature functionality"""
    print("Testing custom feature...")
    
    try:
        self.driver.get(f"{self.frontend_url}/custom-page")
        time.sleep(3)
        
        # Add your test logic here
        element = self.driver.find_element(By.ID, "custom-element")
        self.assertTrue(element.is_displayed())
        
        print("✅ Custom feature test passed")
        
    except Exception as e:
        self.fail(f"❌ Custom feature test failed: {str(e)}")
```

### Modifying Test Parameters
- **Timeouts**: Adjust `implicitly_wait` and `WebDriverWait` values
- **URLs**: Modify `frontend_url` and `backend_url` in `setUpClass`
- **Browser Options**: Add/remove Chrome options as needed

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
name: Frontend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.9
    - name: Install dependencies
      run: |
        pip install -r selenium_requirements.txt
    - name: Run tests
      run: |
        python selenium_test.py
```

## 📊 Test Reports

### HTML Report Generation
```bash
# Install pytest-html
pip install pytest-html

# Run tests with HTML report
pytest selenium_test.py --html=test_report.html
```

### JSON Report
```python
# Add to test runner
import json

def generate_json_report(result):
    report = {
        "total_tests": result.testsRun,
        "passed": result.testsRun - len(result.failures) - len(result.errors),
        "failed": len(result.failures),
        "errors": len(result.errors),
        "timestamp": time.time()
    }
    
    with open("test_report.json", "w") as f:
        json.dump(report, f, indent=2)
```

## 🎯 Best Practices

### 1. **Test Isolation**
- Each test should be independent
- Clean up resources in `tearDown`
- Don't rely on test execution order

### 2. **Error Handling**
- Use try-catch blocks for robust error handling
- Provide meaningful error messages
- Log detailed information for debugging

### 3. **Performance**
- Keep tests fast and efficient
- Use appropriate wait strategies
- Avoid unnecessary page loads

### 4. **Maintainability**
- Use descriptive test names
- Add comments for complex test logic
- Keep tests simple and focused

## 🚨 Emergency Procedures

### If Tests Fail
1. **Check server status**: Ensure both servers are running
2. **Verify dependencies**: Reinstall Selenium packages
3. **Check browser compatibility**: Update Chrome/ChromeDriver
4. **Review error logs**: Check console output for specific issues
5. **Manual verification**: Test features manually in browser

### Critical Issues
- **Frontend not loading**: Check Vite dev server
- **API endpoints failing**: Check Django server and database
- **Authentication issues**: Verify JWT tokens and permissions
- **Component rendering**: Check React build and dependencies

## 📞 Support

If you encounter issues with the Selenium tests:

1. **Check the logs**: Review console output for error details
2. **Verify setup**: Ensure all prerequisites are met
3. **Test manually**: Try the same actions in a regular browser
4. **Update dependencies**: Ensure all packages are up to date

---

**Last Updated**: August 10, 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team
