#!/usr/bin/env python3
"""
Update the archive with the latest appointments fix
"""
import zipfile
import os
from datetime import datetime

def update_archive():
    # Remove old archive if it exists
    if os.path.exists('/workspace/Gabriel_Family_Clinic_BUILD_FIXED.zip'):
        os.remove('/workspace/Gabriel_Family_Clinic_BUILD_FIXED.zip')
        print("Removed old archive")

    # Create new archive
    try:
        with zipfile.ZipFile('/workspace/Gabriel_Family_Clinic_BUILD_FIXED.zip', 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zipf:
            source_dir = '/workspace/gabriel-family-clinic'
            for root, dirs, files in os.walk(source_dir):
                # Skip node_modules and .next directories to reduce size
                dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git']]
                
                for file in files:
                    file_path = os.path.join(root, file)
                    # Skip large files that aren't necessary
                    if any(skip in file_path for skip in ['.log', '.tmp', '.cache']):
                        continue
                    arcname = os.path.relpath(file_path, source_dir)
                    zipf.write(file_path, arcname)
        
        # Get file size
        size = os.path.getsize('/workspace/Gabriel_Family_Clinic_BUILD_FIXED.zip')
        size_mb = size / (1024 * 1024)
        
        print(f"✅ Archive created successfully!")
        print(f"📁 Location: /workspace/Gabriel_Family_Clinic_BUILD_FIXED.zip")
        print(f"📊 Size: {size_mb:.1f} MB")
        print(f"⏰ Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
    except Exception as e:
        print(f"❌ Error creating archive: {e}")
        return False
    
    return True

if __name__ == "__main__":
    update_archive()