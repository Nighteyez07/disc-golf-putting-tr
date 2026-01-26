import { test, expect } from '@playwright/test';
import { clearAppState, skipInstructions } from './helpers/test-utils';

test.describe('Instructions Dialog', () => {
  test.beforeEach(async ({ page }) => {
    // Clear state before each test to ensure clean slate
    await clearAppState(page);
  });

  test('shows instructions dialog on first visit', async ({ page }) => {
    // Navigate to the app - should show instructions on first visit
    await page.goto('/');
    
    // Wait for the dialog to appear
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Verify dialog content
    await expect(page.getByText(/setup|how to play/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /let's practice|got it/i })).toBeVisible();
  });

  test('closes instructions dialog when clicking Let\'s Practice', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for dialog to appear
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Click the practice button
    await page.getByRole('button', { name: /let's practice|got it/i }).click();
    
    // Verify dialog is closed
    await expect(dialog).not.toBeVisible();
    
    // Verify localStorage flag is set
    const hasSeenInstructions = await page.evaluate(() => 
      localStorage.getItem('instructions_seen')
    );
    expect(hasSeenInstructions).toBe('true');
  });

  test('opens instructions when clicking header book icon', async ({ page }) => {
    // Set localStorage to skip auto-display
    await page.goto('/');
    await skipInstructions(page);
    await page.reload();
    
    // Verify dialog is not visible initially
    const dialog = page.getByRole('dialog');
    await expect(dialog).not.toBeVisible();
    
    // Click book icon in header (by aria-label)
    await page.getByRole('button', { name: /instructions|view instructions/i }).click();
    
    // Verify dialog appears
    await expect(dialog).toBeVisible();
    await expect(page.getByText(/how to play/i)).toBeVisible();
  });
});
