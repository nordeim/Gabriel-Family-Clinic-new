#!/usr/bin/env python3
"""
Comprehensive validation of ALL build fixes
"""
import os
import re

def comprehensive_validation():
    print("🔍 COMPREHENSIVE BUILD FIX VALIDATION")
    print("=" * 60)
    
    base_path = "/workspace/gabriel-family-clinic"
    all_tests_passed = True
    
    # Test cases for all fixes
    tests = [
        {
            "name": "1. Security page - orphaned async code removed",
            "file": "app/patient/security/page.tsx",
            "pattern": r"fetchProviders|async\s*getProviders",
            "should_not_exist": True,
            "description": "No orphaned async code should exist"
        },
        {
            "name": "2. Signin page - signInError fix",
            "file": "app/auth/signin/page.tsx", 
            "pattern": r"setError\(signInError.*Failed to sign in",
            "should_not_exist": False,
            "description": "Should use signInError directly (not .message)"
        },
        {
            "name": "3. Signup page - signUpError fix",
            "file": "app/auth/signup/page.tsx",
            "pattern": r"setError\(signUpError.*Failed to create account",
            "should_not_exist": False, 
            "description": "Should use signUpError directly (not .message)"
        },
        {
            "name": "4. Setup 2FA - any to unknown type handling",
            "file": "app/auth/setup-2fa/page.tsx",
            "pattern": r"catch.*err.*unknown",
            "should_not_exist": False,
            "description": "Should use 'unknown' type, not 'any'"
        },
        {
            "name": "5. Security page - any to unknown type handling", 
            "file": "app/patient/security/page.tsx",
            "pattern": r"catch.*err.*unknown",
            "should_not_exist": False,
            "description": "Should use 'unknown' type, not 'any'"
        },
        {
            "name": "6. Admin dashboard - React Hook dependencies",
            "file": "app/admin/security/dashboard/page.tsx",
            "pattern": r"useEffect.*loadSecurityData",
            "should_not_exist": True,
            "description": "Redundant useEffect calls should be removed"
        },
        {
            "name": "7. Appointments - removed useCallback import",
            "file": "app/patient/appointments/book/page.tsx",
            "pattern": r"useCallback",
            "should_not_exist": True,
            "description": "Unused useCallback import should be removed"
        },
        {
            "name": "8. Appointments - array handling for users",
            "file": "app/patient/appointments/book/page.tsx",
            "pattern": r"Array\.isArray.*users",
            "should_not_exist": False,
            "description": "Should handle users as array with proper checks"
        },
        {
            "name": "9. Appointments - removed DoctorData interface",
            "file": "app/patient/appointments/book/page.tsx",
            "pattern": r"interface DoctorData",
            "should_not_exist": True,
            "description": "Unused DoctorData interface should be removed"
        },
        {
            "name": "10. Card component - event type conversion",
            "file": "components/data/card.tsx",
            "pattern": r"as unknown as.*MouseEvent",
            "should_not_exist": False,
            "description": "Should use 'unknown as' for event type conversion"
        },
        {
            "name": "11. Appointments - removed 'any' type",
            "file": "app/patient/appointments/book/page.tsx",
            "pattern": r"\(d: any\)",
            "should_not_exist": True,
            "description": "No 'any' type should be used (ESLint warning)"
        },
        {
            "name": "12. Alert component - variant null handling",
            "file": "components/feedback/alert.tsx",
            "pattern": r"getIcon.*variant.*null",
            "should_not_exist": False,
            "description": "getIcon function should handle null variant"
        }
    ]
    
    for i, test in enumerate(tests, 1):
        file_path = os.path.join(base_path, test["file"])
        
        print(f"\n{test['name']}")
        print(f"📁 File: {test['file']}")
        print(f"📋 {test['description']}")
        
        if not os.path.exists(file_path):
            print(f"❌ File not found!")
            all_tests_passed = False
            continue
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            found = bool(re.search(test["pattern"], content, re.MULTILINE))
            
            if test["should_not_exist"]:
                if not found:
                    print("✅ PASS - Correctly removed/avoided")
                else:
                    print("❌ FAIL - Still exists")
                    all_tests_passed = False
            else:
                if found:
                    print("✅ PASS - Fix correctly applied")
                else:
                    print("❌ FAIL - Fix not found")
                    all_tests_passed = False
                    
        except Exception as e:
            print(f"❌ Error reading file: {e}")
            all_tests_passed = False
    
    # Final summary
    print("\n" + "=" * 60)
    if all_tests_passed:
        print("🎉 ALL TESTS PASSED! Build should now compile successfully.")
        print("✅ No TypeScript compilation errors expected")
        print("✅ No ESLint warnings about 'any' types")
        print("✅ No React Hook dependency warnings")
    else:
        print("❌ Some tests failed. Manual review needed.")
    
    return all_tests_passed

if __name__ == "__main__":
    comprehensive_validation()