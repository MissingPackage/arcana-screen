import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

// jsdom has no layout, so it does not implement scrollIntoView; every real browser does.
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};
