import type { DeviceProfile } from '../store/useWidgetStore';

export const getDeviceProfile = (width = window.innerWidth): DeviceProfile => {
  if (width < 700) return 'mobile';
  if (width < 1100) return 'tablet';
  return 'desktop';
};

export const observeDeviceProfile = (callback: (profile: DeviceProfile) => void) => {
  const update = () => callback(getDeviceProfile());
  window.addEventListener('resize', update);
  update();
  return () => window.removeEventListener('resize', update);
};
