import { useState, useRef, useEffect } from 'react';

interface WidgetHelpButtonProps {
  helpText: string;
}

export default function WidgetHelpButton({ helpText }: WidgetHelpButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        buttonRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  const toggleTooltip = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={toggleTooltip}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="w-6 h-6 rounded-full bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center text-sm font-bold shadow-sm"
        aria-label="Widget help"
        title="Click for help"
        type="button"
      >
        ?
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-50 w-64 p-3 bg-white dark:bg-[var(--deep-blue)] border-2 border-[var(--accent)] rounded-lg shadow-lg text-sm"
          style={{
            top: '100%',
            right: 0,
            marginTop: '8px',
          }}
        >
          <p className="text-[var(--text-main-light)] dark:text-[var(--text-main-dark)] leading-relaxed whitespace-pre-line">
            {helpText}
          </p>
        </div>
      )}
    </div>
  );
}
