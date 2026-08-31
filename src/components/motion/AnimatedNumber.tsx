import React, { useEffect, useState } from "react";
import { useMotion } from "./MotionProvider";

interface AnimatedNumberProps {
  value: number;
  duration?: number; // duration in ms
  formatter?: (val: number) => string;
}

export function AnimatedNumber({
  value,
  duration = 800,
  formatter = (val) => Math.round(val).toLocaleString(),
}: AnimatedNumberProps) {
  const { reducedMotion } = useMotion();
  const [current, setCurrent] = useState(reducedMotion ? value : 0);

  useEffect(() => {
    if (reducedMotion) {
      setCurrent(value);
      return;
    }

    let start = 0;
    const end = value;
    if (start === end) return;

    const startTime = performance.now();

    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quad formula
      const easeProgress = progress * (2 - progress);
      const val = start + (end - start) * easeProgress;
      setCurrent(val);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };

    requestAnimationFrame(updateNumber);
  }, [value, duration, reducedMotion]);

  return <span>{formatter(current)}</span>;
}
