$cd /workspace && zip -r Gabriel_Family_Clinic_FIXED_v2.zip gabriel-family-clinic -x "*/node_modules/*" "*/.next/*" "*/.git/*" "*/dist/*" "*/build/*" "*.log" "*.tmp" "*/coverage/*" "*/.nyc_output/*" 2>/dev/null

$cd /workspace && zip -r Gabriel_Family_Clinic_FINAL_FIXED.zip gabriel-family-clinic -x "*/node_modules/*" "*/.next/*" "*/.git/*" "*/dist/*" "*/build/*" "*.log" "*.tmp" "*/coverage/*" "*/.nyc_output/*" 2>/dev/null

$cd /workspace && zip -r Gabriel_Family_Clinic_ULTIMATE_FIXED.zip gabriel-family-clinic/ -x "gabriel-family-clinic/node_modules/*" "gabriel-family-clinic/.next/*" "gabriel-family-clinic/.git/*" "gabriel-family-clinic/dist/*" "gabriel-family-clinic/coverage/*"

$python3 create_final_archive.py
