#!/usr/bin/env python3
"""
Deployment Verification Script
Checks if backend and frontend are properly configured and can communicate.
"""

import sys
import requests
from urllib.parse import urlparse

def test_backend_health(backend_url: str) -> bool:
    """Test if backend is reachable and healthy."""
    try:
        # Remove /api/v1 if present
        base_url = backend_url.replace('/api/v1', '')
        response = requests.get(f"{base_url}/health", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend is healthy: {data}")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend unreachable: {e}")
        return False


def test_backend_login(backend_url: str) -> bool:
    """Test if demo login works."""
    try:
        login_url = f"{backend_url}/login"
        payload = {
            "identifier": "demo@aimail.com",
            "password": "Demo@1234"
        }
        
        response = requests.post(login_url, json=payload, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if 'access_token' in data:
                print(f"✅ Login successful! Token: {data['access_token'][:20]}...")
                print(f"   User: {data.get('username')} ({data.get('email')})")
                return True
            else:
                print(f"❌ Login response missing access_token: {data}")
                return False
        elif response.status_code == 401:
            print(f"❌ Login failed: Invalid credentials (demo user may not exist)")
            print(f"   Response: {response.json()}")
            return False
        else:
            print(f"❌ Login failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Login request failed: {e}")
        return False


def test_cors(backend_url: str, frontend_url: str) -> bool:
    """Test if CORS is properly configured."""
    try:
        login_url = f"{backend_url}/login"
        headers = {
            "Origin": frontend_url,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type"
        }
        
        response = requests.options(login_url, headers=headers, timeout=5)
        
        allow_origin = response.headers.get('Access-Control-Allow-Origin')
        allow_methods = response.headers.get('Access-Control-Allow-Methods')
        
        if allow_origin:
            if allow_origin == frontend_url or allow_origin == '*':
                print(f"✅ CORS configured correctly")
                print(f"   Allow-Origin: {allow_origin}")
                print(f"   Allow-Methods: {allow_methods}")
                return True
            else:
                print(f"❌ CORS misconfigured:")
                print(f"   Expected Origin: {frontend_url}")
                print(f"   Actual Allow-Origin: {allow_origin}")
                return False
        else:
            print(f"⚠️  No CORS headers found (may be okay if same-origin)")
            return True
            
    except requests.exceptions.RequestException as e:
        print(f"❌ CORS check failed: {e}")
        return False


def main():
    print("=" * 60)
    print("  AI Email Reply Generator - Deployment Verification")
    print("=" * 60)
    print()
    
    # Get URLs from user
    backend_url = input("Enter backend URL (e.g., https://backend.onrender.com/api/v1): ").strip()
    frontend_url = input("Enter frontend URL (e.g., https://frontend.vercel.app): ").strip()
    
    if not backend_url:
        backend_url = "http://localhost:8000/api/v1"
        print(f"Using default backend: {backend_url}")
    
    if not frontend_url:
        frontend_url = "http://localhost:3000"
        print(f"Using default frontend: {frontend_url}")
    
    print()
    print("-" * 60)
    print("Running tests...")
    print("-" * 60)
    print()
    
    results = []
    
    # Test 1: Backend Health
    print("[1/3] Testing backend health...")
    results.append(("Backend Health", test_backend_health(backend_url)))
    print()
    
    # Test 2: Demo Login
    print("[2/3] Testing demo login...")
    results.append(("Demo Login", test_backend_login(backend_url)))
    print()
    
    # Test 3: CORS
    print("[3/3] Testing CORS configuration...")
    results.append(("CORS", test_cors(backend_url, frontend_url)))
    print()
    
    # Summary
    print("=" * 60)
    print("  Test Summary")
    print("=" * 60)
    
    all_passed = True
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}  {test_name}")
        if not passed:
            all_passed = False
    
    print()
    
    if all_passed:
        print("🎉 All tests passed! Your deployment is working correctly.")
        print()
        print("You can now login with:")
        print("  Email: demo@aimail.com")
        print("  Password: Demo@1234")
        return 0
    else:
        print("⚠️  Some tests failed. Check the errors above.")
        print()
        print("Common fixes:")
        print("  1. Update ALLOWED_ORIGINS in backend .env")
        print("  2. Run database migrations: alembic upgrade head")
        print("  3. Restart backend service")
        print("  4. Redeploy frontend with correct NEXT_PUBLIC_API_URL")
        print()
        print("See docs/LOGIN_FIX_GUIDE.md for detailed troubleshooting.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
