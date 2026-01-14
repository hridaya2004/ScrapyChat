import type React from "react";
import { useEffect, useRef, useState } from "react";

interface HorizontalFadeWrapperProps {
  children: React.ReactNode;
  className?: string;
  fadeWidth?: number; // width of the fade in pixels
}

export const HorizontalFadeWrapper: React.FC<HorizontalFadeWrapperProps> = ({
  children,
  className = "",
  fadeWidth = 32,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const updateFades = () => {
    const el = containerRef.current;
    if (!el) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = el;

    setShowLeftFade(scrollLeft > 0);
    setShowRightFade(scrollLeft + clientWidth < scrollWidth - 1); // small buffer for rounding
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Ignore
  useEffect(() => {
    updateFades();

    const el = containerRef.current;
    if (!el) {
      return;
    }
    el.addEventListener("scroll", updateFades);
    window.addEventListener("resize", updateFades);

    return () => {
      el.removeEventListener("scroll", updateFades);
      window.removeEventListener("resize", updateFades);
    };
  }, [children]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Inner scroll container */}
      <div
        className="no-scrollbar relative w-full overflow-x-auto whitespace-nowrap px-2 py-1.5"
        ref={containerRef}
      >
        {children}
      </div>

      {/* Left fade */}
      {showLeftFade && (
        <div
          className="pointer-events-none absolute top-0 left-0 h-full rounded-l-full"
          style={{
            width: fadeWidth,
            background:
              "linear-gradient(to right, var(--popover), rgba(255,255,255,0))",
          }}
        />
      )}

      {/* Right fade */}
      {showRightFade && (
        <div
          className="pointer-events-none absolute top-0 right-0 h-full rounded-r-full"
          style={{
            width: fadeWidth,
            background:
              "linear-gradient(to left, var(--popover), rgba(255,255,255,0))",
          }}
        />
      )}
    </div>
  );
};
