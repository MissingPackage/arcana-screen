import { create } from 'zustand';

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

export const useTourStore = create<TourState>((set) => ({
  hasSeenTour: (() => {
    try {
      const stored = localStorage.getItem('arcana_tour');
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  })(),
  currentStep: 0,
  isTourActive: false,
  startTour: () => set({
    isTourActive: true,
    currentStep: 0,
  }),
  skipTour: () => {
    localStorage.setItem('arcana_tour', JSON.stringify(true));
    set({
      hasSeenTour: true,
      isTourActive: false,
      currentStep: 0,
    });
  },
  completeTour: () => {
    localStorage.setItem('arcana_tour', JSON.stringify(true));
    set({
      hasSeenTour: true,
      isTourActive: false,
      currentStep: 0,
    });
  },
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
}));
