import React from "react";
import { CheckCircle2, ShieldCheck, Clock, FileText, Home } from "lucide-react";
import { TrustTimelineEvent } from "@/features/intelligence/trust-graph.service";

interface TrustTimelineProps {
  events: TrustTimelineEvent[];
}

export const TrustTimeline: React.FC<TrustTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="p-4 bg-secondary/30 rounded-xl text-center border text-xs text-muted-foreground">
        No trust timeline events recorded for this property yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <ShieldCheck className="h-4 w-4 text-verified" /> Property Trust & Verification Timeline
      </h4>
      <div className="relative border-l-2 border-primary/20 ml-3 space-y-6 py-1">
        {events.map((evt, idx) => (
          <div key={evt.id || idx} className="relative pl-6">
            <span className="absolute -left-[9px] top-0.5 h-4 w-4 rounded-full bg-background border-2 border-primary flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">{evt.title}</span>
                <span className="bg-verified/10 text-verified border border-verified/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                  {evt.stage}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{evt.description}</p>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" /> {new Date(evt.timestamp).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
