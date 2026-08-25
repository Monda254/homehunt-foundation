import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProperty, updateUnit, archiveUnit } from "@/features/properties/properties.functions";
import { RequireAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FileText, Loader2, Save, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/properties/$propertyId/units/$unitId")({
  component: () => (
    <RequireAuth>
      <UnitDetailsComponent />
    </RequireAuth>
  ),
});

function UnitDetailsComponent() {
  const { propertyId, unitId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query property details to resolve the target unit
  const { data: details, isLoading } = useQuery({
    queryKey: ["property-detail", propertyId],
    queryFn: () => getProperty(propertyId),
  });

  const [unitNumber, setUnitNumber] = useState("");
  const [unitType, setUnitType] = useState<string>("ONE_BEDROOM");
  const [floor, setFloor] = useState("");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState<string>("AVAILABLE");
  const [description, setDescription] = useState("");
  const [fieldsSynced, setFieldsSynced] = useState(false);

  // Locate current unit and sync state
  useEffect(() => {
    if (details) {
      const unit = details.units.find((u) => u.id === unitId);
      if (unit && !fieldsSynced) {
        setUnitNumber(unit.unit_number || "");
        setUnitType(unit.unit_type || "ONE_BEDROOM");
        setFloor(unit.floor?.toString() || "");
        setBedrooms(unit.bedrooms?.toString() || "1");
        setBathrooms(unit.bathrooms?.toString() || "1");
        setArea(unit.area?.toString() || "");
        setStatus(unit.status || "AVAILABLE");
        setDescription(unit.description || "");
        setFieldsSynced(true);
      }
    }
  }, [details, unitId, fieldsSynced]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateUnit({
        id: unitId,
        unitNumber,
        unitType: unitType as any,
        floor: floor ? parseInt(floor) : undefined,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        area: area ? parseFloat(area) : undefined,
        status: status as any,
        description: description || undefined,
        amenities: [],
      }),
    onSuccess: () => {
      toast.success("Unit updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
      navigate({ to: `/properties/${propertyId}` });
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to update unit.");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveUnit(unitId),
    onSuccess: () => {
      toast.success("Unit archived.");
      queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
      navigate({ to: `/properties/${propertyId}` });
    },
  });

  const handleArchive = () => {
    if (confirm("Are you sure you want to delete/archive this unit?")) {
      archiveMutation.mutate();
    }
  };

  if (isLoading || !details) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const unit = details.units.find((u) => u.id === unitId);
  if (!unit) {
    return (
      <DashboardLayout>
        <div className="text-center p-8">
          <h3 className="text-lg font-bold text-foreground">Unit not found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            The unit ID you are attempting to inspect does not exist on this property.
          </p>
          <Link
            to="/properties/$id"
            params={{ id: propertyId }}
            className="text-xs font-bold text-primary hover:underline mt-4 block"
          >
            Return to Property
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Edit Unit {unitNumber}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Parent Property: {details.property.name}
            </p>
          </div>
          <Link
            to="/properties/$id"
            params={{ id: propertyId }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Property Details
          </Link>
        </div>

        <div className="surface-card p-6 shadow-sm space-y-6">
          <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-1.5 border-b pb-3 mb-4">
            <FileText className="h-5 w-5 text-primary" /> Modify Subunit Layout
          </h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate();
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="u-no"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
              >
                Unit Number / Name
              </label>
              <input
                id="u-no"
                type="text"
                required
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="u-type"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Unit Type
                </label>
                <select
                  id="u-type"
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm cursor-pointer"
                >
                  <option value="ONE_BEDROOM">1 Bedroom</option>
                  <option value="TWO_BEDROOM">2 Bedroom</option>
                  <option value="THREE_BEDROOM">3 Bedroom</option>
                  <option value="FOUR_PLUS_BEDROOM">4+ Bedroom</option>
                  <option value="BEDSITTER">Bedsitter</option>
                  <option value="STUDIO">Studio</option>
                  <option value="ROOM">Single Room</option>
                  <option value="SHARED">Shared Room</option>
                  <option value="HOUSE">House</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="u-status"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Occupancy Status
                </label>
                <select
                  id="u-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm cursor-pointer"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="u-floor"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Floor Level
                </label>
                <input
                  id="u-floor"
                  type="number"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="u-beds"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Bedrooms
                </label>
                <input
                  id="u-beds"
                  type="number"
                  required
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="u-baths"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Bathrooms
                </label>
                <input
                  id="u-baths"
                  type="number"
                  required
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="u-area"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
              >
                Unit Area (Sq Ft)
              </label>
              <input
                id="u-area"
                type="text"
                placeholder="e.g. 750"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="u-desc"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
              >
                Unit Description
              </label>
              <textarea
                id="u-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-border">
              <button
                type="button"
                onClick={handleArchive}
                className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer"
                disabled={archiveMutation.isPending}
              >
                <Trash2 className="h-4 w-4" /> Delete Unit
              </button>

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
                Save Layout
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
