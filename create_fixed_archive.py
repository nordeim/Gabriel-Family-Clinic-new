#!/usr/bin/env python3

import os
import zipfile
import sys

def create_build_fixed_archive():
    """Create Gabriel_Family_Clinic_BUILD_FIXED.zip with all the build fixes applied."""
    
    # Project directory
    project_dir = "/workspace/gabriel-family-clinic"
    output_zip = "/workspace/Gabriel_Family_Clinic_BUILD_FIXED.zip"
    
    # Essential directories and files to include
    include_paths = [
        "app",
        "components", 
        "lib",
        "public",
        "package.json",
        "next.config.js", 
        "tsconfig.json",
        "tailwind.config.ts",
        "postcss.config.mjs",
        "README.md"
    ]
    
    print(f"Creating archive: {output_zip}")
    print(f"Source directory: {project_dir}")
    
    try:
        with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for item in include_paths:
                source_path = os.path.join(project_dir, item)
                if os.path.exists(source_path):
                    if os.path.isdir(source_path):
                        # Add directory
                        for root, dirs, files in os.walk(source_path):
                            for file in files:
                                file_path = os.path.join(root, file)
                                arcname = os.path.relpath(file_path, project_dir)
                                zipf.write(file_path, arcname)
                                print(f"  Added: {arcname}")
                    else:
                        # Add file
                        arcname = os.path.relpath(source_path, project_dir)
                        zipf.write(source_path, arcname)
                        print(f"  Added: {arcname}")
                else:
                    print(f"  Warning: {item} not found, skipping")
        
        # Check if archive was created successfully
        if os.path.exists(output_zip):
            file_size = os.path.getsize(output_zip)
            print(f"\n✅ Archive created successfully!")
            print(f"📁 File: {output_zip}")
            print(f"📊 Size: {file_size:,} bytes")
            
            # List contents to verify
            with zipfile.ZipFile(output_zip, 'r') as zipf:
                file_list = zipf.namelist()
                print(f"📋 Total files: {len(file_list)}")
                print(f"🔍 Sample files included:")
                for i, name in enumerate(file_list[:10]):
                    print(f"   {i+1}. {name}")
                if len(file_list) > 10:
                    print(f"   ... and {len(file_list) - 10} more files")
        else:
            print("❌ Failed to create archive!")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Error creating archive: {e}")
        return False

if __name__ == "__main__":
    success = create_build_fixed_archive()
    sys.exit(0 if success else 1)