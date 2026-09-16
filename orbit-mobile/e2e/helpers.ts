import { expect, type Page } from '@playwright/test';

export function hasClerkKeys() {
  return Boolean(process.env.CLERK_SECRET_KEY || process.env.CLERK_PUBLISHABLE_KEY);
}

export async function signInAsGuest(page: Page) {
  await page.goto('/?e2e=1');
  await expect(page.getByTestId('auth-guest')).toBeVisible();
  await page.getByTestId('auth-guest').click();
  await expect(page.getByTestId('jobs-screen')).toBeVisible({ timeout: 20_000 });
}

export async function fillEasyApply(page: Page) {
  await expect(page.getByTestId('apply-sheet')).toBeVisible();
  await page.getByTestId('apply-name').fill('Priya Rao');
  await page.getByTestId('apply-phone').fill('9876543210');
  await page.getByTestId('apply-area').fill('Gachibowli');
  await page.getByTestId('apply-last-job').fill('Staff Nurse');
  await page.getByTestId('apply-join').fill('Immediate');
}
