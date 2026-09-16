import { readFileSync } from 'fs';
import { resolve } from 'path';

export function loadLocalEnv() {
  for (const file of ['.env.local', '.env']) {
    const path = resolve(process.cwd(), file);
    try {
      const text = readFileSync(path, 'utf8');
      for (const line of text.split('\n')) {
        const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (!match) continue;
        const [, key, value] = match;
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    } catch {
      // File may be absent; keys can still come from the process environment.
    }
  }

  if (!process.env.CLERK_PUBLISHABLE_KEY && process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    process.env.CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  }
}
