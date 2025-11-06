#!/usr/bin/env python3
import zipfile
import os
import sys
from pathlib import Path

def create_project_archive():
    """Create a zip archive of the Gabriel Family Clinic project"""
    
    workspace_path = Path("/workspace")
    archive_path = workspace_path / "Gabriel_Family_Clinic_Complete_Platform.zip"
    
    # Files and directories to exclude
    exclude_patterns = [
        'node_modules',
        '.next',
        'dist',
        '.git',
        '*.log',
        '.DS_Store',
        'coverage',
        '__pycache__',
        '.pytest_cache'
    ]
    
    def should_exclude(file_path):
        """Check if file should be excluded"""
        for pattern in exclude_patterns:
            if pattern in str(file_path):
                return True
            if file_path.name.endswith('.log'):
                return True
        return False
    
    files_to_include = [
        'Project_Architecture_Document.md',
        'DEPLOYMENT-ERROR-RESOLUTION-REPORT.md',
        'DOCKER-COMPLETE-PACKAGE.md',
        'DOCKER-CONFIGURATION-SUMMARY.md',
        'DOCKER-DEPLOYMENT-GUIDE.md',
        'VERCEL-DEPLOYMENT-ERROR-FIX.md',
        'VERCEL-FIX-DEPLOYMENT-GUIDE.md'
    ]
    
    with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        print("Creating zip archive...")
        
        # Add documentation files from workspace root
        for file_name in files_to_include:
            file_path = workspace_path / file_name
            if file_path.exists():
                zipf.write(file_path, f"Documentation/{file_name}")
                print(f"Added: {file_name}")
        
        # Add main project directory
        project_path = workspace_path / "gabriel-family-clinic"
        if project_path.exists():
            print("Adding main project...")
            
            for root, dirs, files in os.walk(project_path):
                # Filter out excluded directories
                dirs[:] = [d for d in dirs if not should_exclude(Path(root) / d)]
                
                for file in files:
                    if should_exclude(Path(root) / file):
                        continue
                    
                    file_path = Path(root) / file
                    # Create archive path
                    arcname = str(file_path.relative_to(workspace_path))
                    
                    try:
                        zipf.write(file_path, arcname)
                        print(f"Added: {arcname}")
                    except Exception as e:
                        print(f"Skipped: {arcname} - {e}")
        
        # Add docs directory
        docs_path = workspace_path / "docs"
        if docs_path.exists():
            print("Adding docs directory...")
            for root, dirs, files in os.walk(docs_path):
                for file in files:
                    if should_exclude(Path(root) / file):
                        continue
                    
                    file_path = Path(root) / file
                    arcname = str(file_path.relative_to(workspace_path))
                    
                    try:
                        zipf.write(file_path, arcname)
                        print(f"Added: {arcname}")
                    except Exception as e:
                        print(f"Skipped: {arcname} - {e}")
    
    # Get archive size
    archive_size = archive_path.stat().st_size
    print(f"\nArchive created successfully!")
    print(f"Archive: {archive_path}")
    print(f"Size: {archive_size / (1024*1024):.2f} MB")
    print(f"File path: {archive_path.absolute()}")

if __name__ == "__main__":
    create_project_archive()