"use client";

import { useEffect, useState } from "react";
import spinners, { type BrailleSpinnerName } from "unicode-animations";

export default function AgentThinkingSpinner({
  children,
}: {
  children: string;
}) {
  const spinnerPatterns: BrailleSpinnerName[] = [
    "braille",
    "braillewave",
    "dna",
    "scan",
    "rain",
    "scanline",
    "pulse",
    "snake",
    "sparkle",
    "cascade",
    "columns",
    "orbit",
    "breathe",
    "waverows",
    "checkerboard",
    "helix",
    "fillsweep",
    "diagswipe",
  ];

  const [frame, setFrame] = useState(0);
  const [randomSpinnerPattern] = useState(
    () =>
      spinnerPatterns[
        Math.floor(Math.random() * spinnerPatterns.length)
      ] as BrailleSpinnerName
  );

  const s = spinners[randomSpinnerPattern];

  useEffect(() => {
    const timer = setInterval(
      () => setFrame((f) => (f + 1) % s.frames.length),
      s.interval
    );
    return () => clearInterval(timer);
  }, [s]);

  return (
    <span style={{ fontFamily: "monospace" }}>
      {s.frames[frame]} {children}
    </span>
  );
}
