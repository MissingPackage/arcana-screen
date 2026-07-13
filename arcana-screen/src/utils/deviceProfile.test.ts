import { describe, expect, it } from 'vitest';
import { getDeviceProfile } from './deviceProfile';

describe('device layout profiles', () => {
  it('uses stable mobile, tablet and desktop breakpoints', () => {
    expect(getDeviceProfile(390)).toBe('mobile');
    expect(getDeviceProfile(844)).toBe('tablet');
    expect(getDeviceProfile(1280)).toBe('desktop');
  });
});
