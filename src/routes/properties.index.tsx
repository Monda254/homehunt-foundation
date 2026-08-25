import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProperties, archiveProperty } from "@/features/properties/properties.functions";
import { RequireAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PropertyCard, type PropertyData } from "@/components/PropertyCard";
import { Building, Plus, Loader2, Info } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/properties/")({
  component: () => (
    <RequireAuth>
      <PropertiesDashboardComponent />
    </RequireAuth>
  ),
});

function PropertiesDashboardComponent() {
  const queryClient = useQueryClient();

  const { data: properties, isLoading } = useQuery({
    queryKey: ["my-properties"],
    queryFn: () => getMyProperties(),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveProperty(id),
    onSuccess: () => {
      toast.success("Property archived successfully.");
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to archive property.");
    },
  });

  const handleArchive = (id: string) => {
    if (
      confirm(
        "Are you sure you want to archive this property? All listing references will remain historical.",
      )
    ) {
      archiveMutation.mutate(id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Property Management</h1>
            <p className="text-sm text-muted-foreground">
              Add and manage your apartments, standalone rentals, and managed portfolios.
            </p>
          </div>
          <Link
            to="/properties/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Create Property
          </Link>
        </div>

        {isLoading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : properties && properties.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop as unknown as PropertyData}
                onArchive={handleArchive}
              />
            ))}
          </div>
        ) : (
          <div className="surface-card p-12 text-center max-w-xl mx-auto shadow-sm border border-dashed border-border/80">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mx-auto mb-4">
              <Building className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">No properties yet</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Create your first physical property to start managing units and publishing marketplace
              advertisements.
            </p>
            <div className="mt-6">
              <Link
                to="/properties/new"
                className="inline-flex items-center gap-1.5 justify-center rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow transition-all hover:bg-primary/95"
              >
                <Plus className="h-4 w-4" /> Add Your First Property
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
