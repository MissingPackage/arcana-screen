import { useEffect, useState, useRef } from 'react';
import { useTourStore } from '../../store/tourStore';
import TourStep from './TourStep';
import { tourSteps } from './tourSteps';

const MAX_RETRIES = 10;
const RETRY_DELAY = 300; // ms
const TARGET_TIMEOUT = 5000; // ms - skip step if target not found after this time

// Helper function to check if element is actually visible and has dimensions
const isElementVisible = (element: Element): boolean => {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0'
  );
};

export default function OnboardingTour() {
  const isTourActive = useTourStore((state) => state.isTourActive);
  const currentStep = useTourStore((state) => state.currentStep);
  const completeTour = useTourStore((state) => state.completeTour);
  const skipTour = useTourStore((state) => state.skipTour);
  const nextStep = useTourStore((state) => state.nextStep);
  const prevStep = useTourStore((state) => state.prevStep);

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentTourStep = tourSteps[currentStep];

  // Detect mobile/tablet devices for responsive handling
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  // Fade-in animation on mount
  useEffect(() => {
    if (isTourActive) {
      setIsVisible(false);
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isTourActive]);

  // Target element tracking with retry logic and timeout
  useEffect(() => {
    if (!isTourActive || !currentTourStep) return;

    // Reset retry counter and clear any existing timers
    retryCountRef.current = 0;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (retryIntervalRef.current) {
      clearInterval(retryIntervalRef.current);
      retryIntervalRef.current = null;
    }

    if (currentTourStep.target) {
      const updateTargetRect = () => {
        const targetElement = document.querySelector(currentTourStep.target!);

        // Validate that element exists, is visible, and has dimensions
        if (targetElement && isElementVisible(targetElement)) {
          const rect = targetElement.getBoundingClientRect();

          // Double-check dimensions (edge case: element might be transitioning)
          if (rect.width > 0 && rect.height > 0) {
            setTargetRect(rect);
            retryCountRef.current = 0; // Reset retry counter on success

            // Clear retry interval if element is found
            if (retryIntervalRef.current) {
              clearInterval(retryIntervalRef.current);
              retryIntervalRef.current = null;
            }

            // Scroll element into view if it's off-screen (only on desktop)
            // On mobile, we skip scrolling to avoid disorienting users
            if (!isMobile) {
              const viewportWidth = window.innerWidth;
              const viewportHeight = window.innerHeight;
              const isOffScreen =
                rect.top < 0 ||
                rect.bottom > viewportHeight ||
                rect.left < 0 ||
                rect.right > viewportWidth;

              if (isOffScreen) {
                targetElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                  inline: 'center'
                });
              }
            }
          } else {
            // Element found but has no dimensions - treat as missing
            setTargetRect(null);
          }
        } else {
          setTargetRect(null);

          // Retry mechanism for missing or hidden targets
          if (retryCountRef.current < MAX_RETRIES && !retryIntervalRef.current) {
            retryIntervalRef.current = setInterval(() => {
              retryCountRef.current += 1;
              const element = document.querySelector(currentTourStep.target!);

              if (element && isElementVisible(element)) {
                const rect = element.getBoundingClientRect();

                // Validate dimensions before setting
                if (rect.width > 0 && rect.height > 0) {
                  setTargetRect(rect);

                  if (!isMobile) {
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    const isOffScreen =
                      rect.top < 0 ||
                      rect.bottom > viewportHeight ||
                      rect.left < 0 ||
                      rect.right > viewportWidth;

                    if (isOffScreen) {
                      element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'center'
                      });
                    }
                  }

                  if (retryIntervalRef.current) {
                    clearInterval(retryIntervalRef.current);
                    retryIntervalRef.current = null;
                  }
                }
              } else if (retryCountRef.current >= MAX_RETRIES) {
                // Max retries reached - continue tour with centered tooltip
                if (retryIntervalRef.current) {
                  clearInterval(retryIntervalRef.current);
                  retryIntervalRef.current = null;
                }
              }
            }, RETRY_DELAY);
          }
        }
      };

      // Initial attempt to find target
      updateTargetRect();

      // Set timeout to handle persistent missing targets
      // If target is still not found/visible after timeout, tour continues with centered tooltip
      timeoutRef.current = setTimeout(() => {
        const element = document.querySelector(currentTourStep.target!);
        if (!element || !isElementVisible(element)) {
          // Target not found or not visible after timeout
          // Continue tour anyway - tooltip will show in center position
          setTargetRect(null);

          // Clear any retry intervals
          if (retryIntervalRef.current) {
            clearInterval(retryIntervalRef.current);
            retryIntervalRef.current = null;
          }
        }
      }, TARGET_TIMEOUT);

      // Update on resize and scroll
      window.addEventListener('resize', updateTargetRect);
      window.addEventListener('scroll', updateTargetRect);

      return () => {
        window.removeEventListener('resize', updateTargetRect);
        window.removeEventListener('scroll', updateTargetRect);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        if (retryIntervalRef.current) {
          clearInterval(retryIntervalRef.current);
          retryIntervalRef.current = null;
        }
      };
    } else {
      setTargetRect(null);
    }
  }, [isTourActive, currentStep, currentTourStep, isMobile]);

  // Auto-complete tour when reaching the end
  useEffect(() => {
    if (currentStep >= tourSteps.length) {
      completeTour();
    }
  }, [currentStep, completeTour]);

  // Keyboard navigation
  useEffect(() => {
    if (!isTourActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          skipTour();
          break;
        case 'ArrowRight':
          nextStep();
          break;
        case 'ArrowLeft':
          prevStep();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTourActive, skipTour, nextStep, prevStep]);

  if (!isTourActive || !currentTourStep) {
    return null;
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black z-[1000] transition-opacity duration-500 ease-in-out ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        style={{ pointerEvents: 'none' }}
      />

      {/* Highlight cutout for target element */}
      {targetRect && (
        <div
          className={`fixed border-2 border-[var(--accent)] rounded-lg shadow-lg z-[1000] pointer-events-none transition-all duration-300 ease-in-out ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{
            top: `${targetRect.top - 4}px`,
            left: `${targetRect.left - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      {/* Tour step tooltip */}
      <TourStep step={currentTourStep} totalSteps={tourSteps.length} isVisible={isVisible} />
    </>
  );
}
