#!/usr/bin/env python3
import os
import zipfile
import time

def create_final_archive():
    source_dir = 'gabriel-family-clinic'
    output_file = 'Gabriel_Family_Clinic_ULTIMATE_FIXED.zip'
    
    # Exclude patterns
    exclude_patterns = [
        'node_modules',
        '.next',
        '.git',
        'dist',
        'coverage',
        '__pycache__',
        '*.pyc',
        '.DS_Store'
    ]
    
    excluded_items = set()
    
    def should_exclude(filepath):
        for pattern in exclude_patterns:
            if pattern in filepath:
                return True
        return False
    
    total_size = 0
    files_included = []
    
    # First pass: calculate size
    for root, dirs, files in os.walk(source_dir):
        for file in files:
            if not should_exclude(file):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, '.')
                if not should_exclude(rel_path):
                    try:
                        total_size += os.path.getsize(full_path)
                        files_included.append((full_path, rel_path))
                    except (OSError, IOError):
                        continue
    
    print(f"Archive will contain {len(files_included)} files")
    print(f"Estimated archive size: {total_size / (1024*1024):.1f} MB")
    
    # Create archive
    with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for full_path, rel_path in files_included:
            try:
                zipf.write(full_path, rel_path)
            except (OSError, IOError):
                print(f"Warning: Could not add {rel_path}")
    
    final_size = os.path.getsize(output_file)
    print(f"Archive created: {output_file}")
    print(f"Final archive size: {final_size / (1024*1024):.1f} MB")

if __name__ == '__main__':
    create_final_archive()