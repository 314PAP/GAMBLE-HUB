import { test, expect } from '@playwright/test';

test.describe('GAMBLE HUB - Main Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show splash screen then login', async ({ page }) => {
    // Wait for splash screen to hide and login to show
    await page.waitForSelector('#screen-login.active', { timeout: 5000 });
    
    // Verify login screen is visible
    const loginTitle = page.locator('#login-title');
    await expect(loginTitle).toContainText('GAMBLE HUB');
  });

  test('should have working navigation buttons', async ({ page }) => {
    await page.waitForSelector('#screen-login.active', { timeout: 5000 });
    
    // Check if register button exists
    const registerBtn = page.locator('#btn-create-player');
    await expect(registerBtn).toBeVisible();
  });

  test('should navigate to register screen', async ({ page }) => {
    await page.waitForSelector('#screen-login.active', { timeout: 5000 });
    
    // Click register button
    await page.click('#btn-create-player');
    
    // Wait for register screen
    await page.waitForSelector('#screen-register.active', { timeout: 3000 });
    
    // Verify register form is visible
    const regTitle = page.locator('#register-title');
    await expect(regTitle).toContainText('Nový Hráč');
  });

  test('should have accessible theme toggle', async ({ page }) => {
    await page.waitForSelector('#screen-login.active', { timeout: 5000 });
    
    // Check theme toggle exists and has accessible label
    const themeToggle = page.locator('#global-theme-toggle');
    await expect(themeToggle).toBeAttached();
    await expect(themeToggle).toHaveAttribute('aria-label', 'Přepnout barevné téma');
  });

  test('should have accessible sound toggle', async ({ page }) => {
    await page.waitForSelector('#screen-login.active', { timeout: 5000 });
    
    // Check login sound toggle is visible and accessible
    const soundToggle = page.locator('#login-sound-toggle');
    await expect(soundToggle).toBeVisible();
    await expect(soundToggle).toHaveAttribute('aria-label', 'Přepnout zvuk');
  });
});
