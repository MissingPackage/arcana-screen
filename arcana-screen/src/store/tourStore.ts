import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeLocalStorage } from '../utils/safeStorage';

interface TourState {
  hasSeenTour: boolean;
  currentStep: number;
  isTourActive: boolean;
  startTour: () => void;
  skipTour: () => void;
  completeTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setCurrentStep: (step: number) => void;
  restartTour: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      hasSeenTour: false,
      currentStep: 0,
      isTourActive: false,
      startTour: () => set({
        isTourActive: true,
        currentStep: 0,
      }),
      skipTour: () => set({
        hasSeenTour: true,
        isTourActive: false,
        currentStep: 0,
      }),
      completeTour: () => set({
        hasSeenTour: true,
        isTourActive: false,
        currentStep: 0,
      }),
      nextStep: () => set((state) => ({
        currentStep: state.currentStep + 1,
      })),
      prevStep: () => set((state) => ({
        currentStep: Math.max(0, state.currentStep - 1),
      })),
      setCurrentStep: (step: number) => set({
        currentStep: step,
      }),
      restartTour: () => set({
        isTourActive: true,
        currentStep: 0,
      }),
    }),
    {
      name: 'arcana_tour',
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({ hasSeenTour: state.hasSeenTour }),
    }
  )
);
