$cd /workspace && zip -r Gabriel_Family_Clinic_FIXED_v2.zip gabriel-family-clinic -x "*/node_modules/*" "*/.next/*" "*/.git/*" "*/dist/*" "*/build/*" "*.log" "*.tmp" "*/coverage/*" "*/.nyc_output/*" 2>/dev/null

$cd /workspace && zip -r Gabriel_Family_Clinic_FINAL_FIXED.zip gabriel-family-clinic -x "*/node_modules/*" "*/.next/*" "*/.git/*" "*/dist/*" "*/build/*" "*.log" "*.tmp" "*/coverage/*" "*/.nyc_output/*" 2>/dev/null

$cd /workspace && zip -r Gabriel_Family_Clinic_ULTIMATE_FIXED.zip gabriel-family-clinic/ -x "gabriel-family-clinic/node_modules/*" "gabriel-family-clinic/.next/*" "gabriel-family-clinic/.git/*" "gabriel-family-clinic/dist/*" "gabriel-family-clinic/coverage/*"

$python3 create_final_archive.py

cd /workspace && zip -r Gabriel_Family_Clinic_LATEST_FIXED.zip gabriel-family-clinic/lib/auth gabriel-family-clinic/lib/compliance gabriel-family-clinic/lib/healthcare gabriel-family-clinic/lib/seo gabriel-family-clinic/lib/singapore gabriel-family-clinic/lib/supabase gabriel-family-clinic/lib/types gabriel-family-clinic/lib/*ts gabriel-family-clinic/lib/*js gabriel-family-clinic/app gabriel-family-clinic/components gabriel-family-clinic/design-system gabriel-family-clinic/dist gabriel-family-clinic/docs gabriel-family-clinic/public gabriel-family-clinic/supabase gabriel-family-clinic/tests
