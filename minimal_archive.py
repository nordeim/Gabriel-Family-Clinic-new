#!/usr/bin/env python3
import zipfile
from pathlib import Path
import os

# Create minimal essential archive
workspace = Path("/workspace")
archive_path = workspace / "Gabriel_Family_Clinic_Essential_Files.zip"

print("Creating essential files archive...")
print("Due to workspace size (3.1GB), creating minimal archive with core files...")

essential_files = {
    # Core Documentation
    "Project_Architecture_Document.md": "Documentation/",
    "DEPLOYMENT-ERROR-RESOLUTION-REPORT.md": "Documentation/", 
    "DOCKER-COMPLETE-PACKAGE.md": "Documentation/",
    "DOCKER-CONFIGURATION-SUMMARY.md": "Documentation/",
    "DOCKER-DEPLOYMENT-GUIDE.md": "Documentation/",
    "VERCEL-DEPLOYMENT-ERROR-FIX.md": "Documentation/",
    "VERCEL-FIX-DEPLOYMENT-GUIDE.md": "Documentation/",
    
    # Core Config Files
    "gabriel-family-clinic/package.json": "Source/",
    "gabriel-family-clinic/README.md": "Source/",
    "gabriel-family-clinic/Dockerfile": "Source/",
    "gabriel-family-clinic/docker-compose.yml": "Source/",
    "gabriel-family-clinic/tsconfig.json": "Source/",
    
    # Core Source Files (sample)
    "gabriel-family-clinic/app/layout.tsx": "Source/",
    "gabriel-family-clinic/app/page.tsx": "Source/",
    "gabriel-family-clinic/lib/supabase/client.ts": "Source/",
    "gabriel-family-clinic/lib/supabase/auth.ts": "Source/",
}

with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    files_added = 0
    
    # Add essential files that exist
    for source_path, archive_dir in essential_files.items():
        full_path = workspace / source_path
        if full_path.exists():
            archive_name = archive_dir + Path(source_path).name
            zipf.write(full_path, archive_name)
            print(f"✓ {source_path}")
            files_added += 1
        else:
            print(f"✗ Missing: {source_path}")
    
    # Add some additional key files
    additional_patterns = [
        "gabriel-family-clinic/app/*/page.tsx",
        "gabriel-family-clinic/lib/*/*utils.ts", 
        "gabriel-family-clinic/supabase/functions/*/index.ts"
    ]
    
    import glob
    for pattern in additional_patterns:
        for file_path in glob.glob(str(workspace / pattern)):
            rel_path = Path(file_path).relative_to(workspace)
            archive_name = f"Source/{rel_path}"
            try:
                zipf.write(Path(file_path), archive_name)
                print(f"✓ {rel_path}")
                files_added += 1
            except:
                pass

size_mb = archive_path.stat().st_size / (1024*1024)
print(f"\n📦 Essential archive created!")
print(f"📊 Size: {size_mb:.2f} MB") 
print(f"📁 Files: {files_added}")
print(f"🎯 Note: This contains core files only. Full project available in workspace.")