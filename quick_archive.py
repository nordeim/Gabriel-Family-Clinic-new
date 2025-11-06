#!/usr/bin/env python3
import zipfile
import os
from pathlib import Path

# Essential files and directories to include
essential_files = [
    "Project_Architecture_Document.md",
    "DEPLOYMENT-ERROR-RESOLUTION-REPORT.md", 
    "DOCKER-COMPLETE-PACKAGE.md",
    "DOCKER-CONFIGURATION-SUMMARY.md",
    "DOCKER-DEPLOYMENT-GUIDE.md",
    "VERCEL-DEPLOYMENT-ERROR-FIX.md",
    "VERCEL-FIX-DEPLOYMENT-GUIDE.md"
]

essential_dirs = [
    "gabriel-family-clinic/app",
    "gabriel-family-clinic/components", 
    "gabriel-family-clinic/lib",
    "gabriel-family-clinic/supabase",
    "gabriel-family-clinic/public",
    "gabriel-family-clinic/docs",
    "docs"
]

workspace = Path("/workspace")
archive_path = workspace / "Gabriel_Family_Clinic_Source_Code.zip"

print("Creating Gabriel Family Clinic source code archive...")
print(f"Archive path: {archive_path}")

with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zipf:
    # Add essential files
    for file_name in essential_files:
        file_path = workspace / file_name
        if file_path.exists():
            zipf.write(file_path, f"Documentation/{file_name}")
            print(f"✓ Added: {file_name}")
    
    # Add essential directories with selective files
    for dir_name in essential_dirs:
        dir_path = workspace / dir_name
        if dir_path.exists():
            print(f"Processing: {dir_name}")
            
            for root, dirs, files in os.walk(dir_path):
                # Skip problematic directories
                dirs[:] = [d for d in dirs if not d in ['node_modules', '.next', 'dist', '.git', 'coverage', '__pycache__']]
                
                for file in files:
                    # Include only source files
                    if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.sql', '.yml', '.yaml')):
                        file_path = Path(root) / file
                        arcname = str(file_path.relative_to(workspace))
                        
                        try:
                            zipf.write(file_path, arcname)
                        except Exception as e:
                            print(f"Skip: {arcname}")

# Get archive info
size_mb = archive_path.stat().st_size / (1024*1024)
print(f"\n🎉 Archive created successfully!")
print(f"📁 Archive: {archive_path.name}")
print(f"📊 Size: {size_mb:.2f} MB")
print(f"💾 Location: {archive_path.absolute()}")
print(f"\nReady for download and GitHub upload!")