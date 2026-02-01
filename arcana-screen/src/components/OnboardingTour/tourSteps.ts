// src/components/OnboardingTour/tourSteps.ts

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string | null;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  showNext: boolean;
  showPrev: boolean;
  showSkip: boolean;
}

export const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ArcanaScreen!',
    content: 'Your customizable virtual Dungeon Master screen. Let\'s take a quick tour of the key features.',
    target: null,
    position: 'center',
    showNext: true,
    showPrev: false,
    showSkip: true,
  },
  {
    id: 'sidebar',
    title: 'Widget Sidebar',
    content: 'Browse available widgets here. You can search for widgets by name or tag, and mark your favorites with the star icon.',
    target: '.bg-gray-100.h-screen',
    position: 'right',
    showNext: true,
    showPrev: true,
    showSkip: true,
  },
  {
    id: 'add-widget',
    title: 'Adding Widgets',
    content: 'Drag any widget from the sidebar onto the grid to add it to your screen. Try adding a Dice Roller or Initiative Tracker!',
    target: 'main.flex-1.overflow-auto',
    position: 'left',
    showNext: true,
    showPrev: true,
    showSkip: true,
  },
  {
    id: 'customize-layout',
    title: 'Customize Your Layout',
    content: 'Once widgets are on the grid, you can drag them around to reposition and resize them to fit your needs.',
    target: 'main.flex-1.overflow-auto',
    position: 'top',
    showNext: true,
    showPrev: true,
    showSkip: true,
  },
  {
    id: 'profiles',
    title: 'Profile Manager',
    content: 'Save your current widget layout and favorites as a profile. You can create multiple profiles for different campaigns or game sessions and switch between them easily.',
    target: '.bg-gray-50.rounded.shadow-md',
    position: 'bottom',
    showNext: true,
    showPrev: true,
    showSkip: true,
  },
  {
    id: 'theme-toggle',
    title: 'Theme Toggle',
    content: 'Switch between light and dark modes to match your preference or game atmosphere.',
    target: 'header button',
    position: 'bottom',
    showNext: true,
    showPrev: true,
    showSkip: true,
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    content: 'You can restart this tour anytime from the settings. Each widget also has a help button (?) with usage tips. Happy gaming!',
    target: null,
    position: 'center',
    showNext: false,
    showPrev: true,
    showSkip: false,
  },
];
