/**
 * Healthcare Security Features Testing
 * Gabriel Family Clinic - Phase 8: Testing & Quality Assurance
 * 
 * Tests two-factor authentication, session management, and security monitoring
 * for healthcare data protection and PDPA compliance
 */

import { test, expect } from '@playwright/test';

test.describe('Healthcare Security Features', () => {

  test('two-factor authentication setup flow', async ({ page }) => {
    await page.goto('/auth/signin');

    // Mock sign in
    await page.fill('[data-testid="email"]', 'testpatient@example.com');
    await page.fill('[data-testid="password"]', 'SecurePass123!');
    await page.click('[data-testid="signin-button"]');

    // Should redirect to 2FA setup
    await expect(page).toHaveURL('/auth/setup-2fa', { timeout: 10000 });

    // Verify QR code is displayed
    const qrCode = page.locator('[data-testid="qr-code"]');
    await expect(qrCode).toBeVisible();

    // Verify manual setup key is shown
    const setupKey = page.locator('[data-testid="setup-key"]');
    await expect(setupKey).toBeVisible();

    // Verify backup codes section exists
    const backupCodes = page.locator('[data-testid="backup-codes"]');
    await expect(backupCodes).toBeVisible();
  });

  test('session management and device tracking', async ({ page }) => {
    await page.goto('/patient/security');

    // Verify active sessions display
    const sessionsList = page.locator('[data-testid="active-sessions"]');
    await expect(sessionsList).toBeVisible();

    // Check session information includes:
    // - Device info
    // - Location
    // - Last activity time
    const firstSession = sessionsList.locator('[data-testid="session-item"]').first();
    await expect(firstSession.locator('[data-testid="device-info"]')).toBeVisible();
    await expect(firstSession.locator('[data-testid="session-location"]')).toBeVisible();
    await expect(firstSession.locator('[data-testid="last-activity"]')).toBeVisible();
  });

  test('security audit log functionality', async ({ page, context }) => {
    // Enable admin context
    await context.addCookies([{
      name: 'user_role',
      value: 'admin',
      domain: 'localhost',
      path: '/',
    }]);

    await page.goto('/admin/security/dashboard');

    // Verify security metrics are displayed
    const metrics = page.locator('[data-testid="security-metrics"]');
    await expect(metrics).toBeVisible();

    // Check failed login attempts counter
    const failedLogins = page.locator('[data-testid="failed-logins-count"]');
    await expect(failedLogins).toBeVisible();

    // Check active incidents display
    const activeIncidents = page.locator('[data-testid="active-incidents"]');
    await expect(activeIncidents).toBeVisible();

    // Verify incidents by severity breakdown
    const severityBreakdown = page.locator('[data-testid="incidents-by-severity"]');
    await expect(severityBreakdown).toBeVisible();
  });

  test('unauthorized access prevention', async ({ page }) => {
    // Try to access patient records without authentication
    await page.goto('/patient/records');

    // Should redirect to sign in
    await expect(page).toHaveURL('/auth/signin');

    // Try to access admin dashboard
    await page.goto('/admin/security/dashboard');

    // Should still be at sign in
    await expect(page).toHaveURL('/auth/signin');
  });

  test('session termination from all devices', async ({ page, context }) => {
    await page.goto('/patient/security');

    // Click terminate all sessions button
    const terminateButton = page.locator('[data-testid="terminate-all-sessions"]');
    
    // Handle confirmation dialog
    page.on('dialog', dialog => dialog.accept());
    
    await terminateButton.click();

    // Should show success message
    const successMessage = page.locator('[data-testid="success-message"]');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText('sessions terminated');

    // Verify redirected to sign in
    await expect(page).toHaveURL('/auth/signin');
  });

  test('password strength validation', async ({ page }) => {
    await page.goto('/auth/signup');

    const passwordInput = page.locator('[data-testid="password-input"]');
    const strengthIndicator = page.locator('[data-testid="password-strength"]');

    // Weak password
    await passwordInput.fill('weak');
    await expect(strengthIndicator).toContainText(/weak|poor/i);

    // Medium password
    await passwordInput.fill('Medium123');
    await expect(strengthIndicator).toContainText(/medium|fair/i);

    // Strong password
    await passwordInput.fill('StrongPass123!@#');
    await expect(strengthIndicator).toContainText(/strong|excellent/i);
  });

  test('healthcare data encryption indicators', async ({ page }) => {
    await page.goto('/patient/records');

    // Verify HTTPS connection
    const isSecure = page.url().startsWith('https://');
    expect(isSecure).toBe(true);

    // Check for security badges/indicators
    const securityBadge = page.locator('[data-testid="security-badge"]');
    await expect(securityBadge).toBeVisible();
  });

  test('PDPA compliance notice', async ({ page }) => {
    await page.goto('/');

    // Verify PDPA/privacy notice is displayed
    const privacyNotice = page.locator('[data-testid="privacy-notice"]');
    await expect(privacyNotice).toBeVisible();

    // Verify data protection policy link
    const pdpaLink = page.locator('[data-testid="pdpa-policy-link"]');
    await expect(pdpaLink).toBeVisible();
  });
});
