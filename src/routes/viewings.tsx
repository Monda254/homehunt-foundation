import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CalendarDays, Info } from "lucide-react";

export const Route = createFileRoute("/viewings")({
  component: () => (
    <RequireAuth>
      <ViewingsComponent />
    </RequireAuth>
  ),
});

function ViewingsComponent() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Viewings Schedule</h1>
          <p className="text-sm text-muted-foreground">
            Coordinate and schedule property viewing appointments.
          </p>
        </div>

        <div className="surface-card p-8 text-center max-w-xl mx-auto shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mx-auto mb-4">
            <CalendarDays className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Future Implementation Module
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            The direct calendar viewing booker, agent ratings, and coordinate check-in system will
            launch in a future phase.
          </p>
          <div className="mt-6 flex items-center gap-2.5 rounded-xl bg-secondary/50 p-4 border border-border/60 text-left">
            <Info className="h-5 w-5 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground leading-normal">
              <strong>Phase 1 Identity active:</strong> You are fully authenticated. The viewing
              schedules will activate in later phases.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
