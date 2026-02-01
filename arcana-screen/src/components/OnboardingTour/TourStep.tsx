import { useEffect, useState, useRef } from 'react';
import { useTourStore } from '../../store/tourStore';
import type { TourStep as TourStepType } from './tourSteps';

interface TourStepProps {
  step: TourStepType;
  totalSteps: number;
  isVisible: boolean;
}

export default function TourStep({ step, totalSteps, isVisible }: TourStepProps) {
  const currentStep = useTourStore((state) => state.currentStep);
  const nextStep = useTourStore((state) => state.nextStep);
  const prevStep = useTourStore((state) => state.prevStep);
  const skipTour = useTourStore((state) => state.skipTour);
  const completeTour = useTourStore((state) => state.completeTour);

  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Trigger animation when step changes
  useEffect(() => {
    setIsMounted(false);
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, [currentStep]);

  useEffect(() => {
    if (!step.target) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const targetElement = document.querySelector(step.target!);
      if (!targetElement || !tooltipRef.current) {
        setPosition(null);
        return;
      }

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const offset = 20;

      // On very small screens, if tooltip + target would be cramped, fall back to center
      const isMobile = viewportWidth < 768;
      const minSpace = tooltipRect.height + targetRect.height + offset * 3;

      // Check if there's enough vertical space for positioned tooltip on mobile
      if (isMobile && viewportHeight < minSpace && step.position !== 'center') {
        // Not enough space - fallback to centered positioning
        setPosition(null);
        return;
      }

      let top = 0;
      let left = 0;

      switch (step.position) {
        case 'top':
          top = targetRect.top - tooltipRect.height - offset;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = targetRect.bottom + offset;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.left - tooltipRect.width - offset;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.right + offset;
          break;
        default:
          top = 0;
          left = 0;
      }

      // Viewport boundary checks with padding
      const padding = 10;
      if (left < padding) left = padding;
      if (left + tooltipRect.width > viewportWidth - padding) {
        left = viewportWidth - tooltipRect.width - padding;
      }
      if (top < padding) top = padding;
      if (top + tooltipRect.height > viewportHeight - padding) {
        top = viewportHeight - tooltipRect.height - padding;
      }

      // Final sanity check: if adjusted position would still overflow, fallback to center
      if (
        left < 0 ||
        top < 0 ||
        left + tooltipRect.width > viewportWidth ||
        top + tooltipRect.height > viewportHeight
      ) {
        setPosition(null);
        return;
      }

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('orientationchange', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('orientationchange', updatePosition);
    };
  }, [step.target, step.position]);

  const handleNext = () => {
    if (currentStep === totalSteps - 1) {
      completeTour();
    } else {
      nextStep();
    }
  };

  // Center if explicitly center position, no target, or fallback due to space constraints
  const isCenter = step.position === 'center' || !step.target || !position;
  const positionStyles = isCenter
    ? {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    : {
        position: 'fixed' as const,
        top: `${position.top}px`,
        left: `${position.left}px`,
      };

  return (
    <div
      ref={tooltipRef}
      className={`bg-white dark:bg-[var(--deep-blue)] border-2 border-[var(--accent)] rounded-lg shadow-2xl p-6 max-w-md z-[1001] transition-all duration-300 ease-out ${
        isVisible && isMounted
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-95 translate-y-2'
      }`}
      style={positionStyles}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-[var(--deep-blue)] dark:text-[var(--muted-gold)] font-title">
          {step.title}
        </h3>
        {step.showSkip && (
          <button
            onClick={skipTour}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-2 transition-colors duration-200"
            aria-label="Skip tour"
          >
            ✕
          </button>
        )}
      </div>

      <p className="text-[var(--text-main-light)] dark:text-[var(--text-main-dark)] mb-4 leading-relaxed">
        {step.content}
      </p>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Step {currentStep + 1} of {totalSteps}
        </div>

        <div className="flex gap-2">
          {step.showPrev && (
            <button
              onClick={prevStep}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-[var(--deep-blue)] dark:text-[var(--parchment-white)] rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-md active:scale-95"
            >
              Previous
            </button>
          )}
          {step.showNext && (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded hover:bg-[var(--accent-hover)] transition-all duration-200 hover:shadow-md active:scale-95"
            >
              {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
