#!/usr/bin/env python3
import os
import zipfile
import shutil

def create_simple_archive():
    source = 'gabriel-family-clinic'
    
    # Essential files and directories to include
    essential_items = [
        'app',
        'components', 
        'lib',
        'design-system',
        'public',
        'supabase',
        'tests',
        'instrumentation.ts',
        'package.json',
        'next.config.js',
        'tsconfig.json',
        'tailwind.config.ts',
        'postcss.config.mjs',
        '.eslintrc.json',
        '.gitignore',
        'README.md'
    ]
    
    archive_name = 'Gabriel_Family_Clinic_ULTIMATE_FIXED.zip'
    
    print("Creating archive with essential files...")
    
    with zipfile.ZipFile(archive_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for item in essential_items:
            source_path = os.path.join(source, item)
            if os.path.exists(source_path):
                if os.path.isfile(source_path):
                    # Add individual file
                    zipf.write(source_path, f'gabriel-family-clinic/{item}')
                    print(f"Added file: {item}")
                elif os.path.isdir(source_path):
                    # Add directory contents
                    for root, dirs, files in os.walk(source_path):
                        for file in files:
                            if not any(exclude in file for exclude in ['.DS_Store', 'node_modules', '.next', '__pycache__']):
                                file_path = os.path.join(root, file)
                                arc_path = os.path.relpath(file_path, '.')
                                zipf.write(file_path, arc_path)
                        if len(files) > 0:
                            print(f"Added directory: {item} ({len(files)} files)")
            else:
                print(f"Warning: {item} not found")
    
    if os.path.exists(archive_name):
        size_mb = os.path.getsize(archive_name) / (1024*1024)
        print(f"✅ Archive created: {archive_name} ({size_mb:.1f} MB)")
        return True
    else:
        print("❌ Failed to create archive")
        return False

if __name__ == '__main__':
    create_simple_archive()