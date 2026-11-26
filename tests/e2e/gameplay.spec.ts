import { test, expect } from '@playwright/test';

async function registerAndEnterHub(page, name = 'E2E') {
  await page.goto('/');
  await page.waitForSelector('#screen-login.active', { timeout: 5000 });
  await page.click('#btn-create-player');
  await page.waitForSelector('#screen-register.active', { timeout: 3000 });
  await page.fill('#reg-name', name);
  await page.click('#screen-register button:has-text("Vytvořit účet")');
  await page.waitForSelector('#screen-hub.active', { timeout: 4000 });
}

test.describe('GAMBLE HUB - Gameplay & Modals', () => {
  test('should register player, claim daily bonus, and open stats modal', async ({ page }) => {
    await registerAndEnterHub(page, 'E2E1');

    const balance = page.locator('#hub-player-money');
    await expect(balance).toHaveText('500');

    // Claim daily bonus (+250 on Day 1)
    await page.click('#hub-daily-bonus-btn');
    await expect(balance).toHaveText('750');

    // Enter a game and open player stats modal
    await page.click('#screen-hub button:has-text("AUTOMAT")');
    await page.waitForSelector('#screen-game.active', { timeout: 10000 });
    await page.click('#screen-game button[onclick="otevriStatsModal()"]');
    await expect(page.locator('#stats-modal')).toBeVisible();
    await expect(page.locator('#stats-modal-title')).toContainText('Přehled Hráče');
  });

  test('should launch Mines 5x5 and start a round', async ({ page }) => {
    await registerAndEnterHub(page, 'E2E2');

    await page.click('#screen-hub button:has-text("Miny")');
    await page.waitForSelector('#screen-game.active', { timeout: 10000 });

    const minesArea = page.locator('#mines-area');
    await expect(minesArea).toBeVisible();

    await page.click('#btn-mines-start');
    const tiles = page.locator('#mines-grid .mines-tile');
    await expect(tiles).toHaveCount(25);
  });

  test('should launch Slots and display spin controls', async ({ page }) => {
    await registerAndEnterHub(page, 'E2E3');

    await page.click('#screen-hub button:has-text("AUTOMAT")');
    await page.waitForSelector('#screen-game.active', { timeout: 10000 });

    await expect(page.locator('#btn-spin-slots')).toBeVisible();
    await expect(page.locator('#btn-auto-slots')).toBeVisible();
  });

  test('should open Explorer modal and switch tabs', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#screen-login.active', { timeout: 5000 });

    await page.click('#leaderboard-card');
    await expect(page.locator('#explorer-modal')).toBeVisible();

    await page.click('#explorer-tab-history');
    await expect(page.locator('#explorer-sec-history')).toBeVisible();
  });
});
