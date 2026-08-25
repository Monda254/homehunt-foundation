import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Map, Info } from "lucide-react";

export const Route = createFileRoute("/map")({
  component: () => (
    <RequireAuth>
      <MapComponent />
    </RequireAuth>
  ),
});

function MapComponent() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Interactive Search Map
          </h1>
          <p className="text-sm text-muted-foreground">
            Geographic search interface for rent listings and neighborhood checks.
          </p>
        </div>

        <div className="surface-card p-8 text-center max-w-xl mx-auto shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mx-auto mb-4">
            <Map className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Future Implementation Module
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            The spatial mapping utility (powered by PostGIS geographic data overlays) is scheduled
            to release in Phase 3.
          </p>
          <div className="mt-6 flex items-center gap-2.5 rounded-xl bg-secondary/50 p-4 border border-border/60 text-left">
            <Info className="h-5 w-5 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground leading-normal">
              <strong>Phase 1 Identity active:</strong> You are fully authenticated. The spatial
              search modules will activate in later phases.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
