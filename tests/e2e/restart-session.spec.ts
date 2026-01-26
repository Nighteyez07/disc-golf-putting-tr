import { test, expect } from '@playwright/test';
import { clearAppState, skipInstructions, recordPutts } from './helpers/test-utils';

test.describe('Restart Session', () => {
  test.beforeEach(async ({ page }) => {
    // Clear state and skip instructions for each test
    await clearAppState(page);
    await page.goto('/');
    await skipInstructions(page);
    await page.reload();
    
    // Wait for the game interface to be ready
    await expect(page.getByText(/position 1 of 9/i)).toBeVisible();
  });

  test('shows confirmation dialog when clicking restart', async ({ page }) => {
    // Record a putt to have an active session
    await page.getByRole('button', { name: /sink/i }).click();
    await page.waitForTimeout(500);
    
    // Click restart button (ArrowCounterClockwise icon)
    await page.getByRole('button', { name: /restart/i }).first().click();
    
    // Verify confirmation dialog appears
    const confirmDialog = page.getByRole('alertdialog');
    await expect(confirmDialog).toBeVisible();
    
    // Verify dialog contains restart text
    await expect(confirmDialog.getByText(/restart/i)).toBeVisible();
    
    // Verify both Cancel and Restart buttons are present
    await expect(page.getByRole('button', { name: /cancel|continue/i })).toBeVisible();
    await expect(confirmDialog.getByRole('button', { name: /restart/i })).toBeVisible();
  });

  test('preserves session when canceling restart', async ({ page }) => {
    // Record 2 putts
    await recordPutts(page, 2);
    
    // Wait for state to update and capture current position/score state
    await page.waitForTimeout(500);
    
    // Verify we're still on position 1
    await expect(page.getByText(/position 1 of 9/i)).toBeVisible();
    
    // Click restart button
    await page.getByRole('button', { name: /restart/i }).first().click();
    
    // Wait for confirmation dialog
    const confirmDialog = page.getByRole('alertdialog');
    await expect(confirmDialog).toBeVisible();
    
    // Click Cancel/Continue button
    await page.getByRole('button', { name: /cancel|continue/i }).click();
    
    // Verify dialog is closed
    await expect(confirmDialog).not.toBeVisible();
    
    // Verify we're still on position 1
    await expect(page.getByText(/position 1 of 9/i)).toBeVisible();
    
    // Verify progress is maintained by checking we can still see the game controls
    await expect(page.getByRole('button', { name: /sink/i })).toBeVisible();
  });

  test('restarts session when confirming restart', async ({ page }) => {
    // Complete position 1 (3 sinks)
    await recordPutts(page, 3);
    
    // Wait for transition to position 2
    await page.waitForTimeout(1000);
    
    // Verify we're on position 2
    await expect(page.getByText(/position 2 of 9/i)).toBeVisible();
    
    // Click restart button
    await page.getByRole('button', { name: /restart/i }).first().click();
    
    // Wait for confirmation dialog
    const confirmDialog = page.getByRole('alertdialog');
    await expect(confirmDialog).toBeVisible();
    
    // Click the Restart button in the dialog
    await confirmDialog.getByRole('button', { name: /restart/i }).click();
    
    // Wait for the restart to complete
    await page.waitForTimeout(500);
    
    // Verify we're back to position 1
    await expect(page.getByText(/position 1 of 9/i)).toBeVisible();
    
    // Verify game is ready to start (sink button is available)
    await expect(page.getByRole('button', { name: /sink/i })).toBeVisible();
  });
});
