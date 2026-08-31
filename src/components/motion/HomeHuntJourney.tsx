import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

const STAGES = [
  { id: "DISCOVER", label: "Discover" },
  { id: "VIEW", label: "View" },
  { id: "APPLY", label: "Apply" },
  { id: "APPROVE", label: "Approve" },
  { id: "LEASE", label: "Lease" },
  { id: "MOVE_IN", label: "Move-In" },
  { id: "TENANCY", label: "Tenancy" },
] as const;

export type JourneyStage = (typeof STAGES)[number]["id"];

interface HomeHuntJourneyProps {
  currentStage: JourneyStage;
  className?: string;
}

export function HomeHuntJourney({ currentStage, className = "" }: HomeHuntJourneyProps) {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className={`surface-card p-5 border border-border/80 rounded-2xl shadow-sm ${className}`}>
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-4">
        Your Housing Journey Progress
      </span>
      <div className="flex items-center justify-between overflow-x-auto gap-4 py-2">
        {STAGES.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center min-w-[70px]">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                  className={`h-7 w-7 rounded-full flex items-center justify-center border font-bold text-xs ${
                    isCompleted
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : isActive
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-secondary/40 text-muted-foreground border-border/50"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </motion.div>
                <span
                  className={`text-[10px] font-semibold mt-2 ${
                    isActive ? "text-primary font-bold" : "text-muted-foreground"
                  }`}
                >
                  {stage.label}
                </span>
              </div>

              {index < STAGES.length - 1 && (
                <div className="flex-1 min-w-[20px] h-0.5 relative bg-secondary/50 rounded">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? "100%" : "0%" }}
                    className="absolute inset-0 bg-emerald-400"
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
