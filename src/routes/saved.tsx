import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Heart, Info } from "lucide-react";

export const Route = createFileRoute("/saved")({
  component: () => (
    <RequireAuth>
      <SavedPropertiesComponent />
    </RequireAuth>
  ),
});

function SavedPropertiesComponent() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Saved Homes</h1>
          <p className="text-sm text-muted-foreground">
            Manage your bookmarked properties and search listings.
          </p>
        </div>

        <div className="surface-card p-8 text-center max-w-xl mx-auto shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mx-auto mb-4">
            <Heart className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Future Implementation Module
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            The saved properties list, filters, and bookmarking directory will be implemented in
            subsequent phases.
          </p>
          <div className="mt-6 flex items-center gap-2.5 rounded-xl bg-secondary/50 p-4 border border-border/60 text-left">
            <Info className="h-5 w-5 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground leading-normal">
              <strong>Phase 1 Identity active:</strong> You are fully authenticated. The property
              and maps modules will activate in later phases.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
