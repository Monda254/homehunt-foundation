import React, { createContext, useContext, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";

interface MotionContextType {
  reducedMotion: boolean;
}

const MotionContext = createContext<MotionContextType>({ reducedMotion: false });

export const useMotion = () => useContext(MotionContext);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check client-side prefers-reduced-motion media query
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    // Modern API support
    mediaQuery.addEventListener("change", listener);
    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  }, []);

  return (
    <MotionContext.Provider value={{ reducedMotion }}>
      {/* Configure Framer Motion globally for prefers-reduced-motion */}
      <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>{children}</MotionConfig>
    </MotionContext.Provider>
  );
}
