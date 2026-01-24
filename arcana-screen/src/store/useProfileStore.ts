import { create } from 'zustand';
import { Widget } from './useWidgetStore';

export interface Profile {
  id: string;
  name: string;
  layoutConfig: Widget[];
  favoriteWidgetIds: string[];
}

interface ProfileStoreState {
  profiles: Profile[];
  createProfile: (profile: Omit<Profile, 'id'>) => void;
  deleteProfile: (id: string) => void;
  loadProfile: (id: string) => Profile | undefined;
}

const LOCAL_STORAGE_KEY = 'arcana_profiles';

const getInitialProfiles = (): Profile[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const useProfileStore = create<ProfileStoreState>((set, get) => ({
  profiles: getInitialProfiles(),

  createProfile: (profile) => {
    const id = Date.now().toString();
    // ALWAYS use the favoriteWidgetIds passed as a parameter!
    const newProfile = { ...profile, id };
    set((state) => {
      const updated = [...state.profiles, newProfile];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return { profiles: updated };
    });
  },

  deleteProfile: (id) => {
    set((state) => {
      const updated = state.profiles.filter((p) => p.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return { profiles: updated };
    });
  },

  loadProfile: (id) => {
    const profile = get().profiles.find((p) => p.id === id);
    return profile;
  },
}));
