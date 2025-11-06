#!/usr/bin/env python3
"""
Validate that the signup page fix is correct by checking the line
"""

def validate_signup_fix():
    filepath = "/workspace/gabriel-family-clinic/app/auth/signup/page.tsx"
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Check line 61 (0-indexed: 60)
        if len(lines) > 60:
            line_61 = lines[60].strip()
            print(f"Line 61: {line_61}")
            
            # Should contain: setError(signUpError || 'Failed to create account. Please try again.');
            # Should NOT contain: signUpError.message
            if "signUpError ||" in line_61 and "signUpError.message" not in line_61:
                print("✅ FIXED: Line 61 is correctly using 'signUpError' instead of 'signUpError.message'")
                return True
            else:
                print("❌ ERROR: Line 61 still has incorrect syntax")
                return False
        else:
            print("❌ ERROR: File is too short")
            return False
            
    except Exception as e:
        print(f"❌ ERROR reading file: {e}")
        return False

if __name__ == "__main__":
    validate_signup_fix()