#!/usr/bin/env python3
"""
Validate that the appointments page fix is correct
"""

def validate_appointments_fix():
    filepath = "/workspace/gabriel-family-clinic/app/patient/appointments/book/page.tsx"
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Check the fixed section around lines 104-108
        found_fix = False
        for i in range(103, 110):  # Lines 104-109 (0-indexed)
            if i < len(lines):
                line = lines[i].strip()
                print(f"Line {i+1}: {line}")
                
                # Look for the corrected mapping logic
                if "Array.isArray(d.users)" in line and "d.users[0].full_name" in line:
                    found_fix = True
        
        if found_fix:
            print("✅ FIXED: Appointments page now correctly handles users as array")
            return True
        else:
            print("❌ ERROR: Fix not found in expected location")
            return False
            
    except Exception as e:
        print(f"❌ ERROR reading file: {e}")
        return False

if __name__ == "__main__":
    validate_appointments_fix()