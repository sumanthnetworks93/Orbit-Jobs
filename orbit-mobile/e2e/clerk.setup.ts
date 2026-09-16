import { clerkSetup } from '@clerk/testing/playwright';
import { test as setup } from '@playwright/test';
import { loadLocalEnv } from './env';

loadLocalEnv();

setup.describe.configure({ mode: 'serial' });

setup('global setup', async () => {
  if (!process.env.CLERK_SECRET_KEY && !process.env.CLERK_PUBLISHABLE_KEY) {
    return;
  }
  await clerkSetup();
});
