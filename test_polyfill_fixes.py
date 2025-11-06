#!/usr/bin/env python3
"""
Test script to validate polyfill fixes for the 'self is not defined' error
"""

import subprocess
import sys
import os
import re

def test_polyfill_setup():
    """Test if the polyfill files are properly configured"""
    print("=== TESTING POLYFILL SETUP ===\n")
    
    # Check if instrumentation.ts exists and imports server polyfill
    instrumentation_file = "/workspace/gabriel-family-clinic/instrumentation.ts"
    if os.path.exists(instrumentation_file):
        with open(instrumentation_file, 'r') as f:
            content = f.read()
        
        print("✓ Instrumentation file exists")
        
        if "import './lib/server-polyfill.js';" in content:
            print("✓ Server polyfill import found in instrumentation")
        else:
            print("✗ Server polyfill import missing from instrumentation")
            
        if "export function register()" in content:
            print("✓ Register function found in instrumentation")
        else:
            print("✗ Register function missing from instrumentation")
    else:
        print("✗ Instrumentation file not found")
        return False
    
    # Check if server polyfill file exists
    server_polyfill_file = "/workspace/gabriel-family-clinic/lib/server-polyfill.js"
    if os.path.exists(server_polyfill_file):
        print("✓ Server polyfill file exists")
        
        with open(server_polyfill_file, 'r') as f:
            content = f.read()
            
        if "global.self = global" in content:
            print("✓ Self polyfill found in server polyfill")
        else:
            print("✗ Self polyfill missing from server polyfill")
    else:
        print("✗ Server polyfill file not found")
        return False
    
    # Check Next.js config
    next_config_file = "/workspace/gabriel-family-clinic/next.config.js"
    if os.path.exists(next_config_file):
        print("✓ Next.js config file exists")
    else:
        print("✗ Next.js config file not found")
    
    return True

def test_build_with_timeout():
    """Test the build process with a timeout"""
    print("\n=== TESTING BUILD PROCESS ===\n")
    
    try:
        # Run build with a reasonable timeout
        result = subprocess.run(
            ['npm', 'run', 'build'],
            cwd='/workspace/gabriel-family-clinic',
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        print("Build stdout:")
        print(result.stdout)
        print("\nBuild stderr:")
        print(result.stderr)
        print(f"\nBuild return code: {result.returncode}")
        
        # Check for the specific error
        if "self is not defined" in result.stderr:
            print("\n❌ FAILED: 'self is not defined' error still occurs")
            return False
        elif "✓ Compiled successfully" in result.stdout:
            print("\n✅ SUCCESS: Build completed successfully")
            return True
        elif "Error: Failed to collect page data" in result.stderr:
            print("\n❌ FAILED: Build failed during page data collection")
            return False
        else:
            print(f"\n⚠️  UNCLEAR: Build finished with return code {result.returncode}")
            return result.returncode == 0
            
    except subprocess.TimeoutExpired:
        print("\n⏰ TIMEOUT: Build process took too long (>5 minutes)")
        return False
    except Exception as e:
        print(f"\n💥 ERROR: Exception during build test: {e}")
        return False

def main():
    print("=== POLYFILL FIX VALIDATION ===\n")
    
    # Test polyfill setup
    setup_ok = test_polyfill_setup()
    
    if not setup_ok:
        print("\n❌ POLYFILL SETUP ISSUES DETECTED")
        return False
    
    # Test build
    build_ok = test_build_with_timeout()
    
    print("\n" + "=" * 50)
    
    if setup_ok and build_ok:
        print("\n🎉 ALL TESTS PASSED!")
        print("The 'self is not defined' error has been resolved.")
        return True
    else:
        print("\n❌ TESTS FAILED")
        if not setup_ok:
            print("- Polyfill setup issues detected")
        if not build_ok:
            print("- Build test failed")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)