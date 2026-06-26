import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  content: ReactNode | string;
  size?: "sm" | "md";
  className?: string;
}

export default function InfoTooltip({
  content,
  size = "sm",
  className = "",
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{
    left: number;
    top: number;
    transform?: string;
  } | null>(null);

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
  };

  const showTooltip = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const tooltipWidth = 256;
    const safeLeft = Math.min(
      Math.max(12, rect.left - 8),
      window.innerWidth - tooltipWidth - 12
    );

    const desiredTop = rect.top - 8;
    const isTooHigh = desiredTop < 96;

    setPosition({
      left: safeLeft,
      top: isTooHigh ? rect.bottom + 8 : desiredTop,
      transform: isTooHigh ? undefined : "translateY(-100%)",
    });

    setOpen(true);
  };

  const hideTooltip = () => {
    setOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={`inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 focus:outline-none ${sizeClasses[size]} ${className}`}
        aria-label="Información adicional"
      >
        <Info size={size === "sm" ? 13 : 15} />
      </button>

      {open && position && (
        <div
          className="fixed z-[9999] w-64 rounded-xl border border-slate-200 bg-white p-3 text-xs normal-case text-slate-700 shadow-xl"
          style={{
            left: position.left,
            top: position.top,
            transform: position.transform,
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}
