import { test, expect } from '@playwright/test';

async function registerAndEnterHub(page, name = 'E2E') {
  await page.goto('/');
  await expect(page.locator('#screen-login.active')).toBeVisible({ timeout: 10000 });
  await page.locator('#btn-create-player').click();
  await expect(page.locator('#screen-register.active')).toBeVisible({ timeout: 8000 });
  await page.locator('#reg-name').fill(name);
  await page.locator('#screen-register button:has-text("Vytvořit účet")').click();
  await expect(page.locator('#screen-hub.active')).toBeVisible({ timeout: 5000 });
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
    await page.locator('#screen-hub button:has-text("AUTOMAT")').evaluate((el) => (el as HTMLElement).click());
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

  test('should launch Crash and start a round', async ({ page }) => {
    await registerAndEnterHub(page, 'E2E4');

    await page.click('#screen-hub button:has-text("Crash")');
    await page.waitForSelector('#screen-game.active', { timeout: 10000 });

    await expect(page.locator('#crash-area')).toBeVisible();
    await expect(page.locator('#crash-multiplier')).toBeVisible();
    await expect(page.locator('#btn-crash-start')).toBeVisible();

    await page.click('#btn-crash-start');
    await expect(page.locator('#crash-status-info')).not.toHaveText('');
  });

  test('should launch Slots and display spin controls', async ({ page }) => {
    await registerAndEnterHub(page, 'E2E3');

    await page.locator('#screen-hub button:has-text("AUTOMAT")').evaluate((el) => (el as HTMLElement).click());
    await page.waitForSelector('#screen-game.active', { timeout: 10000 });

    await expect(page.locator('#btn-spin-slots')).toBeVisible();
    await expect(page.locator('#btn-auto-slots')).toBeVisible();
  });

  test('should open Explorer modal and switch tabs', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#screen-login.active')).toBeVisible({ timeout: 10000 });

    await page.click('#leaderboard-card');
    await expect(page.locator('#explorer-modal')).toBeVisible();

    await expect(page.locator('#explorer-tab-history')).toBeVisible();
    await page.locator('#explorer-tab-history').click();
    await expect(page.locator('#explorer-sec-history')).toBeVisible();
  });

  test('should launch Blackjack and start a round', async ({ page }) => {
    await registerAndEnterHub(page, 'E2E5');
    await page.locator('#screen-hub button:has-text("Blackjack")').evaluate((el) => (el as HTMLElement).click());
    await expect(page.locator('#screen-game.active')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#blackjack-area')).toBeVisible();
    await page.locator('#btn-bj-deal').click();
    await expect(page.locator('#bj-player-hand')).not.toBeEmpty();
  });

  test('should launch Wheel of Fortune and display spin controls', async ({ page }) => {
    await registerAndEnterHub(page, 'E2E6');
    await page.locator('#screen-hub button:has-text("Kolo štěstí")').evaluate((el) => (el as HTMLElement).click());
    await expect(page.locator('#screen-game.active')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#wheel-area')).toBeVisible();
    await expect(page.locator('#btn-wheel-spin')).toBeVisible();
  });

  test('should launch Guessing 1-5 and display 5 number buttons', async ({ page }) => {
    await registerAndEnterHub(page, 'E2E7');
    await page.locator('#screen-hub button:has-text("Hádanka 1-5")').evaluate((el) => (el as HTMLElement).click());
    await expect(page.locator('#screen-game.active')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#classic-inputs')).toBeVisible();
    await expect(page.locator('#classic-inputs .btn-num')).toHaveCount(5);
  });
});
