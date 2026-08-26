import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getListing,
  updateListing,
  publishListing,
  pauseListing,
} from "@/features/properties/properties.functions";
import { RequireAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FileText, Loader2, Save, ArrowLeft, Globe, ToggleLeft, Eye } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/listings/$id")({
  component: () => (
    <RequireAuth>
      <ListingDetailsComponent />
    </RequireAuth>
  ),
});

function ListingDetailsComponent() {
  const { id: listingId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: details, isLoading } = useQuery({
    queryKey: ["listing-detail", listingId],
    queryFn: () => getListing(listingId),
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [billingPeriod, setBillingPeriod] = useState<string>("MONTHLY");
  const [depositAmount, setDepositAmount] = useState("");
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [status, setStatus] = useState<string>("DRAFT");
  const [fieldsSynced, setFieldsSynced] = useState(false);

  useEffect(() => {
    if (details && !fieldsSynced) {
      setTitle(details.listing.title || "");
      setDescription(details.listing.description || "");
      setPrice(details.listing.price?.toString() || "");
      setBillingPeriod(details.listing.billing_period || "MONTHLY");
      setDepositAmount(details.listing.deposit_amount?.toString() || "");
      setAvailabilityDate(details.listing.availability_date || "");
      setStatus(details.listing.status || "DRAFT");
      setFieldsSynced(true);
    }
  }, [details, fieldsSynced]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateListing({
        id: listingId,
        title,
        description: description || undefined,
        price: parseFloat(price),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        billingPeriod: billingPeriod as any,
        depositAmount: depositAmount ? parseFloat(depositAmount) : undefined,
        availabilityDate,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: status as any,
      }),
    onSuccess: () => {
      toast.success("Listing details updated!");
      queryClient.invalidateQueries({ queryKey: ["listing-detail", listingId] });
      navigate({ to: "/listings" });
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to update listing.");
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => publishListing(listingId),
    onSuccess: () => {
      toast.success("Listing published successfully!");
      queryClient.invalidateQueries({ queryKey: ["listing-detail", listingId] });
    },
    onError: (err: unknown) => {
      toast.error(
        (err as Error)?.message ||
          "Publish validation failed. Make sure a primary image is attached and fields are complete.",
      );
    },
  });

  const pauseMutation = useMutation({
    mutationFn: () => pauseListing(listingId),
    onSuccess: () => {
      toast.success("Listing paused.");
      queryClient.invalidateQueries({ queryKey: ["listing-detail", listingId] });
    },
  });

  if (isLoading || !details) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                  details.listing.status === "PUBLISHED"
                    ? "bg-verified/10 text-verified border-verified/20"
                    : "bg-secondary text-muted-foreground border-border"
                }`}
              >
                {details.listing.status}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mt-2">
              {details.listing.title}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ref Property: {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(details.listing as any).properties?.name || "Physical Property Reference"}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/listings"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Listings
            </Link>
          </div>
        </div>

        <div className="surface-card p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-1.5">
              <FileText className="h-5 w-5 text-primary" /> Listing Settings
            </h3>

            <div className="flex gap-2">
              {details.listing.status === "PUBLISHED" ? (
                <>
                  <Link
                    to="/homes/$id"
                    params={{ id: listingId }}
                    className="inline-flex items-center gap-1 rounded bg-secondary px-2.5 py-1 text-xs font-bold text-foreground border border-border"
                  >
                    <Eye className="h-3 w-3" /> View Public
                  </Link>
                  <button
                    onClick={() => pauseMutation.mutate()}
                    disabled={pauseMutation.isPending}
                    className="inline-flex items-center gap-1 rounded border border-border bg-transparent px-2.5 py-1 text-xs font-bold text-foreground hover:bg-secondary cursor-pointer"
                  >
                    <ToggleLeft className="h-3 w-3" /> Pause
                  </button>
                </>
              ) : (
                <button
                  onClick={() => publishMutation.mutate()}
                  disabled={publishMutation.isPending}
                  className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/95 cursor-pointer"
                >
                  <Globe className="h-3.5 w-3.5" /> Publish
                </button>
              )}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate();
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="l-title"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
              >
                Listing Title
              </label>
              <input
                id="l-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="l-price"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Rental Price (KES)
                </label>
                <input
                  id="l-price"
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="l-deposit"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Security Deposit (KES)
                </label>
                <input
                  id="l-deposit"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="l-period"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Billing Period
                </label>
                <select
                  id="l-period"
                  value={billingPeriod}
                  onChange={(e) => setBillingPeriod(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm cursor-pointer"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="DAILY">Daily</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="l-avail"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Availability Date
                </label>
                <input
                  id="l-avail"
                  type="date"
                  required
                  value={availabilityDate}
                  onChange={(e) => setAvailabilityDate(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="l-desc"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
              >
                Listing Description
              </label>
              <textarea
                id="l-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all cursor-pointer"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
