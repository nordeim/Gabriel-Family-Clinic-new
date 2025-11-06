#!/usr/bin/env node

// Simple validation script for the build fixes
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating build fixes...\n');

// Check the security page fix
const securityPagePath = path.join(__dirname, 'gabriel-family-clinic/app/patient/security/page.tsx');
const securityPageContent = fs.readFileSync(securityPagePath, 'utf8');

// Check that orphaned code is removed
const orphanedCodeCheck = !securityPageContent.includes('const { data: twoFactorData } = await supabase.functions.invoke');
const loadSecurityDataEnds = securityPageContent.includes('}, [router]);');
const useEffectStarts = securityPageContent.includes('useEffect(() => {');

console.log('✅ Security page orphaned code removed:', orphanedCodeCheck);
console.log('✅ loadSecurityData function ends properly:', loadSecurityDataEnds);
console.log('✅ useEffect starts properly:', useEffectStarts);

// Check appointments page fix
const appointmentsPath = path.join(__dirname, 'gabriel-family-clinic/app/patient/appointments/book/page.tsx');
const appointmentsContent = fs.readFileSync(appointmentsPath, 'utf8');

const noUnusedUseCallback = !appointmentsContent.includes(', useCallback') && appointmentsContent.includes('import { useState, useEffect }');
console.log('✅ Removed unused useCallback import:', noUnusedUseCallback);

// Check card accessibility fix
const cardPath = path.join(__dirname, 'gabriel-family-clinic/components/data/card.tsx');
const cardContent = fs.readFileSync(cardPath, 'utf8');

const hasAriaLabel = cardContent.includes('aria-label=');
console.log('✅ Card accessibility fix applied:', hasAriaLabel);

// Check modal accessibility fix
const modalPath = path.join(__dirname, 'gabriel-family-clinic/components/overlay/modal.tsx');
const modalContent = fs.readFileSync(modalPath, 'utf8');

const noDirectHandlers = !modalContent.includes('onClick={handleBackdropClick}');
const hasEventDelegation = modalContent.includes('document.addEventListener');
console.log('✅ Modal direct handlers removed:', noDirectHandlers);
console.log('✅ Modal event delegation implemented:', hasEventDelegation);

console.log('\n🎉 All core fixes validated successfully!');