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
        className="tool-help-button"
        aria-label="Widget help"
        title="Click for help"
        type="button"
      >
        Help
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="tool-help-popover"
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
