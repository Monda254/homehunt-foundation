import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyListings,
  publishListing,
  pauseListing,
  archiveListing,
} from "@/features/properties/properties.functions";
import { RequireAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Globe, ToggleLeft, Loader2, Home, MapPin, Eye, FileText } from "lucide-react";
import { toast } from "sonner";
import { AnimatedCard } from "@/components/motion/AnimatedCard";
import { AnimatedButton } from "@/components/motion/AnimatedButton";

export const Route = createFileRoute("/listings/")({
  component: () => (
    <RequireAuth>
      <ListingsManagementComponent />
    </RequireAuth>
  ),
});

function ListingsManagementComponent() {
  const queryClient = useQueryClient();

  const { data: listings, isLoading } = useQuery({
    queryKey: ["my-listings"],
    queryFn: () => getMyListings(),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => publishListing(id),
    onSuccess: () => {
      toast.success("Listing published to marketplace!");
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to publish listing.");
    },
  });

  const pauseMutation = useMutation({
    mutationFn: (id: string) => pauseListing(id),
    onSuccess: () => {
      toast.success("Listing paused successfully.");
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveListing(id),
    onSuccess: () => {
      toast.success("Listing archived.");
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Marketplace Listings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your online property listings, rent advertisements, and publishing statuses.
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="grid gap-4">
            {listings.map((list) => {
              const prop = list.properties as unknown as {
                name: string;
                town: string;
                county: string;
              } | null;
              return (
                <AnimatedCard
                  key={list.id}
                  className="surface-card p-5 border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-base text-foreground">{list.title}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                          list.status === "PUBLISHED"
                            ? "bg-verified/10 text-verified border-verified/20"
                            : list.status === "DRAFT"
                              ? "bg-secondary text-muted-foreground border-border"
                              : "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
                        }`}
                      >
                        {list.status}
                      </span>
                    </div>

                    {prop && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        {prop.name} — {prop.town}, {prop.county}
                      </p>
                    )}

                    <p className="text-xs font-extrabold text-primary pt-1">
                      KES {Number(list.price).toLocaleString()} /{" "}
                      {list.billing_period.toLowerCase()}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap self-end md:self-auto">
                    <Link
                      to="/listings/$id"
                      params={{ id: list.id }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" /> Edit
                    </Link>

                    {list.status === "DRAFT" || list.status === "PAUSED" ? (
                      <AnimatedButton
                        onClick={() => publishMutation.mutate(list.id)}
                        loading={publishMutation.isPending}
                        variant="primary"
                        className="text-xs font-semibold py-1.5 px-3 rounded-lg"
                      >
                        <Globe className="h-3.5 w-3.5" /> Publish
                      </AnimatedButton>
                    ) : (
                      <>
                        <Link
                          to="/homes/$id"
                          params={{ id: list.id }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/85 px-3 py-1.5 text-xs font-semibold cursor-pointer border border-border/60"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Public
                        </Link>
                        <AnimatedButton
                          onClick={() => pauseMutation.mutate(list.id)}
                          loading={pauseMutation.isPending}
                          variant="secondary"
                          className="text-xs font-semibold py-1.5 px-3 rounded-lg"
                        >
                          <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" /> Pause
                        </AnimatedButton>
                      </>
                    )}

                    <AnimatedButton
                      onClick={() => {
                        if (confirm("Are you sure you want to archive this advertisement?")) {
                          archiveMutation.mutate(list.id);
                        }
                      }}
                      loading={archiveMutation.isPending}
                      variant="danger"
                      className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-border"
                    >
                      Archive
                    </AnimatedButton>
                  </div>
                </AnimatedCard>
              );
            })}
          </div>
        ) : (
          <div className="surface-card p-12 text-center max-w-xl mx-auto shadow-sm border border-dashed border-border/80">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mx-auto mb-4">
              <Home className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">No listings yet</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Before advertising rent or sales to the public, you need to configure your underlying
              properties and subunits.
            </p>
            <div className="mt-6">
              <Link
                to="/properties"
                className="inline-flex items-center gap-1.5 justify-center rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow transition-all hover:bg-primary/95"
              >
                Go to Properties Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
