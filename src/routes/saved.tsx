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
            Saved Properties Directory
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Bookmark your favorite rental properties to track price changes and quickly request
            viewings.
          </p>
          <div className="mt-6 flex items-center gap-2.5 rounded-xl bg-secondary/50 p-4 border border-border/60 text-left">
            <Info className="h-5 w-5 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground leading-normal">
              <strong>Identity Authenticated:</strong> You are signed in. Click the heart icon on
              any listing to save it to your bookmarks.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
