import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, updateMyProfile } from "@/features/identity/identity.functions";
import { RequireAuth, useAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { User, MapPin, ShieldCheck, Mail, Info, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  component: () => (
    <RequireAuth>
      <ProfileComponent />
    </RequireAuth>
  ),
});

function ProfileComponent() {
  const queryClient = useQueryClient();
  const { user: authUser, refetch: refetchAuth } = useAuth();

  // 1. Fetch current profile from server function
  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfile(),
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [county, setCounty] = useState("");
  const [town, setTown] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");

  // Sync state when profile is loaded
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      setCounty(profile.county || "");
      setTown(profile.town || "");
      setPreferredLanguage(profile.preferred_language || "en");
    }
  }, [profile]);

  // 2. Mutation to update profile details
  const updateMutation = useMutation({
    mutationFn: () =>
      updateMyProfile({
        firstName,
        lastName,
        displayName: displayName || undefined,
        bio: bio || undefined,
        county: county || undefined,
        town: town || undefined,
        preferredLanguage,
      }),
    onSuccess: async () => {
      toast.success("Profile updated successfully!");
      // Invalidate query caches to reload
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      await refetchAuth();
    },
    onError: (err: unknown) => {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to update profile.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      toast.error("First name and Last name are required.");
      return;
    }
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const roleText = authUser?.roles.join(" / ").toUpperCase();
  const statusColor =
    authUser?.status === "ACTIVE"
      ? "bg-verified/10 text-verified border-verified/20"
      : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal profile details and contact information.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Card 1: Read-only Identity summary */}
          <div className="surface-card p-6 flex flex-col items-center text-center shadow-sm max-h-fit">
            <div className="h-20 w-20 rounded-full bg-primary/10 text-primary font-display font-bold text-2xl flex items-center justify-center border border-primary/20 uppercase mb-4">
              {firstName?.[0] || authUser?.email?.[0] || "U"}
            </div>

            <h3 className="font-display font-bold text-lg text-foreground">
              {firstName || lastName ? `${firstName} ${lastName}`.trim() : "User Profile"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{authUser?.email}</p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}
              >
                {authUser?.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-border bg-secondary/50 text-muted-foreground">
                ROLE: {roleText}
              </span>
            </div>

            <div className="w-full border-t border-border/60 mt-6 pt-4 text-left space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Status</span>
                <span className="font-semibold text-foreground capitalize">
                  {profile?.status?.toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-semibold text-foreground">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-semibold text-foreground font-mono text-[9px] truncate max-w-[150px]">
                  {authUser?.userId}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Edit Profile Form */}
          <div className="surface-card p-6 lg:col-span-2 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="first-name"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                  >
                    First Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="first-name"
                    type="text"
                    required
                    placeholder="e.g. John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    disabled={updateMutation.isPending}
                  />
                </div>

                <div>
                  <label
                    htmlFor="last-name"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                  >
                    Last Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="last-name"
                    type="text"
                    required
                    placeholder="e.g. Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    disabled={updateMutation.isPending}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="display-name"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Display Name / Nickname
                </label>
                <input
                  id="display-name"
                  type="text"
                  placeholder="e.g. J. Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  disabled={updateMutation.isPending}
                />
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Short Bio
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  placeholder="Tell us a bit about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
                  disabled={updateMutation.isPending}
                  maxLength={500}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="county"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                  >
                    County
                  </label>
                  <input
                    id="county"
                    type="text"
                    placeholder="e.g. Nairobi"
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    disabled={updateMutation.isPending}
                  />
                </div>

                <div>
                  <label
                    htmlFor="town"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                  >
                    Town / Neighborhood
                  </label>
                  <input
                    id="town"
                    type="text"
                    placeholder="e.g. Kilimani"
                    value={town}
                    onChange={(e) => setTown(e.target.value)}
                    className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    disabled={updateMutation.isPending}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="language"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Preferred Language
                </label>
                <select
                  id="language"
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm cursor-pointer"
                  disabled={updateMutation.isPending}
                >
                  <option value="en">English (UK)</option>
                  <option value="sw">Swahili</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
