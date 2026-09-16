import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PLATFORM_CONTROLS,
  getPlatformControlsSync,
  setPlatformControlsSync,
} from './adminControl';
import { countOverriddenJobs, getJobOverride, setJobOverridesSync } from './adminJobs';

describe('platform controls', () => {
  it('defaults guest apply and WhatsApp relay on', () => {
    setPlatformControlsSync(DEFAULT_PLATFORM_CONTROLS);
    expect(getPlatformControlsSync().guestApply).toBe(true);
    expect(getPlatformControlsSync().whatsappRelay).toBe(true);
    expect(getPlatformControlsSync().jobReviewRequired).toBe(false);
  });
});

describe('job overrides', () => {
  it('keeps explicit freeze and hide flags, including unfreeze', () => {
    setJobOverridesSync({ 9002: { frozen: true }, 9003: { frozen: false } });
    expect(getJobOverride(9002)).toEqual({ frozen: true });
    expect(getJobOverride(9003)).toEqual({ frozen: false });
    expect(countOverriddenJobs()).toBe(1);
  });
});
