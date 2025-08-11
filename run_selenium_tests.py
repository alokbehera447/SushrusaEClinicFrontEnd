#!/usr/bin/env python3
"""
Simple Selenium Test Runner for Sushrusa Frontend
This script runs the Selenium tests and provides a simple interface
"""

import subprocess
import sys
import os
import time

def check_servers():
    """Check if both frontend and backend servers are running"""
    print("🔍 Checking if servers are running...")
    
    import requests
    
    # Check frontend
    try:
        response = requests.get("http://localhost:8080", timeout=5)
        print("✅ Frontend server is running")
        frontend_ok = True
    except:
        print("❌ Frontend server is not running")
        frontend_ok = False
    
    # Check backend
    try:
        response = requests.get("http://localhost:8000/api/", timeout=5)
        print("✅ Backend server is running")
        backend_ok = True
    except:
        print("❌ Backend server is not running")
        backend_ok = False
    
    return frontend_ok and backend_ok

def install_dependencies():
    """Install Selenium dependencies"""
    print("📦 Installing Selenium dependencies...")
    
    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "selenium_requirements.txt"
        ], check=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def run_tests():
    """Run the Selenium tests"""
    print("🧪 Running Selenium tests...")
    
    try:
        result = subprocess.run([
            sys.executable, "selenium_test.py"
        ], capture_output=True, text=True)
        
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Failed to run tests: {e}")
        return False

def main():
    """Main function"""
    print("🚀 Sushrusa Frontend Selenium Test Runner")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("selenium_test.py"):
        print("❌ selenium_test.py not found. Please run this script from the frontend directory.")
        return 1
    
    # Install dependencies
    if not install_dependencies():
        return 1
    
    # Check servers
    if not check_servers():
        print("\n⚠️ One or both servers are not running.")
        print("Please start the servers:")
        print("  Backend: cd ../sushrusa_backend && python manage.py runserver 0.0.0.0:8000")
        print("  Frontend: npm run dev")
        print("\nThen run this script again.")
        return 1
    
    # Run tests
    print("\n" + "=" * 50)
    success = run_tests()
    
    if success:
        print("\n🎉 All tests passed! Frontend is working correctly.")
        return 0
    else:
        print("\n❌ Some tests failed. Please check the output above.")
        return 1

if __name__ == "__main__":
    exit(main())
