import { clerk, setupClerkTestingToken } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';
import { loadLocalEnv } from './env';
import { hasClerkKeys } from './helpers';

loadLocalEnv();

async function deleteClerkUser(userId: string | null | undefined) {
  const secret = process.env.CLERK_SECRET_KEY;
  if (!userId || !secret) return;

  await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${secret}` },
  }).catch(() => undefined);
}

test.describe('Create account', () => {
  test('creates a Clerk account and lands on jobs', async ({ page }) => {
    test.skip(!hasClerkKeys(), 'Clerk keys are not configured');
    await setupClerkTestingToken({ page });
    await page.goto('/');
    await expect(page.getByTestId('auth-sign-up')).toBeVisible();
    await clerk.loaded({ page });

    const stamp = Date.now();
    const email = `orbit-e2e-${stamp}+clerk_test@example.com`;
    const password = 'OrbitE2Epass123!';
    const username = `orbite2e${stamp}`;
    const phoneNumber = `+1${200 + (stamp % 700)}55501${String(stamp % 100).padStart(2, '0')}`;

    const result = await page.evaluate(async (params) => {
      const client = window.Clerk?.client;
      if (!client) {
        return { ok: false, error: 'Clerk client is not available' };
      }

      try {
        let signUp = await client.signUp.create({
          emailAddress: params.emailAddress,
          password: params.password,
          username: params.username,
          phoneNumber: params.phoneNumber,
          firstName: 'Orbit',
          lastName: 'Tester',
          legalAccepted: true,
        });

        const verify = async () => {
          if (signUp.unverifiedFields.includes('email_address')) {
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            signUp = await signUp.attemptEmailAddressVerification({ code: '424242' });
          }
          if (signUp.unverifiedFields.includes('phone_number')) {
            await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
            signUp = await signUp.attemptPhoneNumberVerification({ code: '424242' });
          }
        };

        await verify();
        if (signUp.status !== 'complete') {
          await verify();
        }

        if (signUp.status === 'complete' && signUp.createdSessionId) {
          await window.Clerk.setActive({ session: signUp.createdSessionId });
        }

        return {
          ok: signUp.status === 'complete',
          status: signUp.status,
          userId: signUp.createdUserId,
          missingFields: signUp.missingFields,
          unverifiedFields: signUp.unverifiedFields,
        };
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }, { emailAddress: email, password, username, phoneNumber });

    expect(result, JSON.stringify(result)).toMatchObject({ ok: true });

    try {
      await expect(page.getByTestId('jobs-screen')).toBeVisible({ timeout: 20_000 });
      await expect(page.getByTestId('auth-screen')).toHaveCount(0);
    } finally {
      await deleteClerkUser(result.userId);
    }
  });
});
