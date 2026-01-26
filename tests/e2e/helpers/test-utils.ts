import { Page } from '@playwright/test';

/**
 * Clear all application state (localStorage and IndexedDB)
 * Navigates to the app to ensure we're in a valid context before clearing state
 */
export async function clearAppState(page: Page) {
  // Navigate to app origin first to avoid SecurityError in WebKit
  await page.goto('/');
  
  // Clear storage in a valid context with error handling
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear IndexedDB if supported
      if (window.indexedDB && indexedDB.databases) {
        indexedDB.databases().then((dbs) => {
          dbs.forEach((db) => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        });
      }
    } catch (e) {
      // Suppress SecurityErrors in CI/Playwright environments
      console.warn('Failed to clear app state:', e);
    }
  });
}

/**
 * Set the flag to skip first-time instructions dialog
 */
export async function skipInstructions(page: Page) {
  await page.evaluate(() => 
    localStorage.setItem('instructions_seen', 'true')
  );
}

/**
 * Record putts in the game
 * @param page - Playwright page object
 * @param sinks - Number of successful putts to record
 * @param misses - Number of missed putts to record (default: 0)
 */
export async function recordPutts(page: Page, sinks: number, misses: number = 0) {
  for (let i = 0; i < sinks; i++) {
    await page.getByRole('button', { name: /sink/i }).click();
    await page.waitForTimeout(300);
  }
  for (let i = 0; i < misses; i++) {
    await page.getByRole('button', { name: /miss/i }).click();
    await page.waitForTimeout(300);
  }
}
