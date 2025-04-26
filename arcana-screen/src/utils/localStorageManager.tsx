const STORAGE_KEY = 'arcanaScreenLayout';

export function saveLayout(layout: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch (error) {
    console.error('Error saving layout:', error);
  }
}

export function loadLayout(): any[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading layout:', error);
  }
  return [];
}

export function clearLayout() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing layout:', error);
  }
}